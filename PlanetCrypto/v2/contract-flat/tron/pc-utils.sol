pragma solidity ^0.4.24;
// current address: 0x40089b9f4d5eb36d62548133f32e52b14fa54c52
// ropsten: 0x7e3d67c3b1469f152f38367c06463917412c9c19

interface PlanetCryptoCoin_I {
    function balanceOf(address owner) external returns(uint256);
    function transferFrom(address from, address to, uint256 value) external returns(bool);
}

interface PlanetCryptoToken_I {
    function balanceOf(address owner) external returns(uint256); 
    function current_plot_price() external returns(uint256); 
    function queryPlotExists(uint8 zoom, int256[] lat_rows, int256[] lng_columns) external view returns(bool);
    function getToken(uint256 _tokenId, bool isBasic)  external view returns(
        address token_owner,
        bytes32 name,
        uint256 orig_value,
        uint256 current_value,
        uint256 empire_score,
        int256[] plots_lat,
        int256[] plots_lng
        );
}

        
library Percent {

  struct percent {
    uint num;
    uint den;
  }
  function mul(percent storage p, uint a) internal view returns (uint) {
    if (a == 0) {
      return 0;
    }
    return a*p.num/p.den;
  }

  function div(percent storage p, uint a) internal view returns (uint) {
    return a/p.num*p.den;
  }

  function sub(percent storage p, uint a) internal view returns (uint) {
    uint b = mul(p, a);
    if (b >= a) return 0;
    return a - b;
  }

  function add(percent storage p, uint a) internal view returns (uint) {
    return a + mul(p, a);
  }
}

contract PlanetCryptoUtils {
    
    
    using Percent for Percent.percent;
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    address owner;
    
    //uint256 resale_multipler = 2;
    Percent.percent private m_resaleMultipler = Percent.percent(200,100); // 200%;
    
    address planetCryptoCoinAddress = 0xA1c8031EF18272d8BfeD22E1b61319D6d9d2881B;
    PlanetCryptoCoin_I internal planetCryptoCoin_interface;
    
    address planetCryptoTokenAddress = 0xb398DF39dF0669d27C6FCDafB710E59256B923eB;
    PlanetCryptoToken_I internal planetCryptoToken_interface;
    
    constructor()  public {
        owner = msg.sender;
        initPlanetCryptoCoinInterface();
        initPlanetCryptoTokenInterface();
    }
    
    function initPlanetCryptoCoinInterface() internal {
        if(address(planetCryptoCoinAddress) != address(0)){ 
            planetCryptoCoin_interface = PlanetCryptoCoin_I(planetCryptoCoinAddress);
        }
    }
    function initPlanetCryptoTokenInterface() internal {
        if(address(planetCryptoTokenAddress) != address(0)){ 
            planetCryptoToken_interface = PlanetCryptoToken_I(planetCryptoTokenAddress);
        }
    }
    
    function p_update_Owner(address _owner) onlyOwner public {
        owner = _owner;
    }
    function p_update_planetCryptoCoinAddress(address _planetCryptoCoinAddress) onlyOwner public {
        planetCryptoCoinAddress = _planetCryptoCoinAddress;
        initPlanetCryptoCoinInterface();
    }
    function p_update_planetCryptoTokenAddress(address _planetCryptoTokenAddress) onlyOwner public {
        planetCryptoTokenAddress = _planetCryptoTokenAddress;
        initPlanetCryptoTokenInterface();
    }
    function p_update_mResaleMultipler(uint256 _newPercent) onlyOwner public {
        m_resaleMultipler = Percent.percent(_newPercent, 100);
    }
    
    // VALIDATION FUNCTIONS
    
    function validateLand(address _sender, int256[] plots_lat, int256[] plots_lng) public view returns(bool) {
        // check that nobody else owns the plots...
        bool _plotExists = planetCryptoToken_interface.queryPlotExists(0, plots_lat, plots_lng);
        
        if(_plotExists == false)
            return true;
        else
            return false;
    }
    
    function validatePurchase(address _sender, uint256 _value, int256[] plots_lat, int256[] plots_lng) public view returns(bool) {
        // validate purchaser has sent enough ether
        if(_value >= planetCryptoToken_interface.current_plot_price() * plots_lat.length)
            return true;
        else
            return false;
    }
    
    function validateTokenPurchase(address _sender, int256[] plots_lat, int256[] plots_lng) public view returns(bool) {
        // validate purchaser has enough TOKENS
        if(planetCryptoCoin_interface.balanceOf(_sender) >= plots_lat.length)
            return true;        
        else
            return false;
    }
    
    function validateLandTakeover(address _sender, uint256 _value, uint256 _token_id) public view returns(bool) {
        return false;
    }
    
    function validateResale(address _sender, uint256 _value, uint256 _token_id) public view  returns(bool) {
        // check _value is double the price of last sale of _token_id
        // future extensions wil; be to check if the card is defended
        address _token_owner;
        bytes32 _name;
        uint256 _orig_value;
        uint256 _current_value;
        uint256 _empire_score;
        int256[] memory _plots_lat;
        int256[] memory _plots_lng;
        
        
        (_token_owner, _name, _orig_value, _current_value, _empire_score, _plots_lat, _plots_lng) 
            = planetCryptoToken_interface.getToken(_token_id, true);
        
        
        // don't allow current owner to buy -> cheats the rules and increases empire score!
        if(_token_owner == _sender)
            return false;
        
        if(_value >= m_resaleMultipler.mul(_current_value))
            return true;
        else
            return false;
    }
    
    
    
    // UTILS
    
    
    
    function roundLatLng(uint8 _zoomLvl, int256 __in) public pure returns(int256) {
        int256 multipler = 100000;
        int256 _in = __in;
        if(_zoomLvl == 1)
            multipler = 100000;
        if(_zoomLvl == 2)
            multipler = 10000;
        if(_zoomLvl == 3)
            multipler = 1000;
        if(_zoomLvl == 4)
            multipler = 100;
        if(_zoomLvl == 5)
            multipler = 10;
        
        if(_in > 0){
            // round it
            _in = ceil1(_in, multipler);
        } else {
            _in = _in * -1;
            _in = ceil1(_in, multipler);
            _in = _in * -1;
        }
        
        return (_in);
        
    }
    
    function roundLatLngFull(uint8 _zoomLvl, int256 __in) external pure returns(int256) {
        int256 _in = roundLatLng(_zoomLvl, __in);

        uint256 _remover = 5;
        if(_zoomLvl == 1)
            _remover = 5;
        if(_zoomLvl == 2)
            _remover = 4;
        if(_zoomLvl == 3)
            _remover = 3;
        if(_zoomLvl == 4)
            _remover = 2;
        
        string memory _inStr;
        
        bool _tIsNegative = false;
        
        if(_in < 0) {
            _tIsNegative = true;   
            _in = _in * -1;
        }
        _inStr = int2str(_in);
        _inStr = substring(_inStr,0,utfStringLength(_inStr)-_remover);
        _in = int256(parseInt(_inStr,0));
        if(_tIsNegative)
            _in = _in * -1;
            
        return _in;
    }
    
    function strConcat(string _a, string _b, string _c, string _d, string _e, string _f) public pure returns (string) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);

        string memory abc = new string(_ba.length + _bb.length + _bc.length);
        bytes memory babc = bytes(abc);
        uint256 k = 0;
        for (uint256 i = 0; i < _ba.length; i++) babc[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babc[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babc[k++] = _bc[i];

        return strConcat(string(babc), strConcat(_d, _e, _f));
    }
    function strConcat(string _a, string _b, string _c, string _d, string _e) public pure returns (string) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        bytes memory _bc = bytes(_c);
        bytes memory _bd = bytes(_d);
        bytes memory _be = bytes(_e);
        string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
        for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
        for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
        return string(babcde);
    }
    function strConcat(string _a, string _b, string _c, string _d) public pure returns (string) {
        return strConcat(_a, _b, _c, _d, "");
    }
    function strConcat(string _a, string _b, string _c) public pure returns (string) {
        return strConcat(_a, _b, _c, "", "");
    }
    function strConcat(string _a, string _b) public pure returns (string) {
        return strConcat(_a, _b, "", "", "");
    }
    function int2str(int i) public pure returns (string){
        if (i == 0) return "0";
        bool negative = i < 0;
        uint j = uint(negative ? -i : i);
        uint l = j;     // Keep an unsigned copy
        uint len;
        while (j != 0){
            len++;
            j /= 10;
        }
        if (negative) ++len;  // Make room for '-' sign
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (l != 0){
            bstr[k--] = byte(48 + l % 10);
            l /= 10;
        }
        if (negative) {    // Prepend '-'
            bstr[0] = '-';
        }
        return string(bstr);
    }
    function uint2str(uint i) public pure returns (string){
        if (i == 0) return "0";
        uint j = i;
        uint len;
        while (j != 0){
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (i != 0){
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return string(bstr);
    }
    function substring(string str, uint startIndex, uint endIndex) public pure returns (string) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex-startIndex);
        for(uint i = startIndex; i < endIndex; i++) {
            result[i-startIndex] = strBytes[i];
        }
        return string(result);
    }
    function utfStringLength(string str) public pure
    returns (uint length)
    {
        uint i=0;
        bytes memory string_rep = bytes(str);

        while (i<string_rep.length)
        {
            if (string_rep[i]>>7==0)
                i+=1;
            else if (string_rep[i]>>5==0x6)
                i+=2;
            else if (string_rep[i]>>4==0xE)
                i+=3;
            else if (string_rep[i]>>3==0x1E)
                i+=4;
            else
                //For safety
                i+=1;

            length++;
        }
    }
    function ceil1(int256 a, int256 m) public pure returns (int256 ) {
        return ((a + m - 1) / m) * m;
    }
    function parseInt(string _a, uint _b) public pure returns (uint) {
      bytes memory bresult = bytes(_a);
      uint mint = 0;
      bool decimals = false;
      for (uint i = 0; i < bresult.length; i++) {
        if ((bresult[i] >= 48) && (bresult[i] <= 57)) {
          if (decimals) {
            if (_b == 0) break;
              else _b--;
          }
          mint *= 10;
          mint += uint(bresult[i]) - 48;
        } else if (bresult[i] == 46) decimals = true;
      }
      return mint;
    }
}