pragma solidity ^0.4.24;

// current address: 0x499E33164116002329Bf4bB8f7B2dfc97A31F223


import "./ERC721Full_custom.sol";


interface PlanetCryptoCoin_I {
    function balanceOf(address owner) external returns(uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns(bool);
}

interface PlanetCryptoUtils_I {
    function validateLand(address _sender, int256[] plots_lat, int256[] plots_lng) external returns(bool);
    function validatePurchase(address _sender, uint256 _value, int256[] plots_lat, int256[] plots_lng) external returns(bool);
    function validateTokenPurchase(address _sender, int256[] plots_lat, int256[] plots_lng) external returns(bool);
    function validateResale(address _sender, uint256 _value, uint256 _token_id) external returns(bool);

    //UTILS
    function strConcat(string _a, string _b, string _c, string _d, string _e, string _f) external view returns (string);
    function strConcat(string _a, string _b, string _c, string _d, string _e) external view returns (string);
    function strConcat(string _a, string _b, string _c, string _d) external view returns (string);
    function strConcat(string _a, string _b, string _c) external view returns (string);
    function strConcat(string _a, string _b) external view returns (string);
    function int2str(int i) external view returns (string);
    function uint2str(uint i) external view returns (string);
    function substring(string str, uint startIndex, uint endIndex) external view returns (string);
    function utfStringLength(string str) external view returns (uint length);
    function ceil1(int256 a, int256 m) external view returns (int256 );
    function parseInt(string _a, uint _b) external view returns (uint);
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



contract PlanetCryptoToken is ERC721Full_custom{
    
    using Percent for Percent.percent;
    
    
    // EVENTS
        
    event referralPaid(address indexed search_to,
                    address to, uint256 amnt, uint256 timestamp);
    
    event issueCoinTokens(address indexed searched_to, 
                    address to, uint256 amnt, uint256 timestamp);
    
    event landPurchased(uint256 indexed search_token_id, address indexed search_buyer, 
            uint256 token_id, address buyer, bytes32 name, int256 center_lat, int256 center_lng, uint256 size, uint256 bought_at, uint256 empire_score, uint256 timestamp);
    
    event taxDistributed(uint256 amnt, uint256 total_players, uint256 timestamp);
    
    event cardBought(
                    uint256 indexed search_token_id, address indexed search_from, address indexed search_to,
                    uint256 token_id, address from, address to, 
                    bytes32 name,
                    uint256 orig_value, 
                    uint256 new_value,
                    uint256 empireScore, uint256 newEmpireScore, uint256 now);

    // CONTRACT MANAGERS
    address owner;
    address devBankAddress; // where marketing funds are sent
    address tokenBankAddress; // who is the bank of COIN tokens

    // MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier validateLand(int256[] plots_lat, int256[] plots_lng) {
        // check that nobody else owns the plots...
        require(planetCryptoUtils_interface.validateLand(msg.sender, plots_lat, plots_lng) == true, "Some of this land already owned!");

        
        _;
    }
    
    modifier validatePurchase(int256[] plots_lat, int256[] plots_lng) {
        // validate purchaser has sent enough ether
        //require(msg.value == current_plot_price * plots_lat.length, "Not enough ETH sent!");
        require(planetCryptoUtils_interface.validatePurchase(msg.sender, msg.value, plots_lat, plots_lng) == true, "Not enough ETH!");
        _;
    }
    
    // before being able to do so...
    // the user has to "approve" on their coin tokens for this contracts address
    // to allow the contract to spend their tokens on their behalf
    // or do we do this automatically within the land-token contract???
    
    modifier validateTokenPurchase(int256[] plots_lat, int256[] plots_lng) {
        // validate purchaser has enough TOKENS
        //require(planetCryptoCoin_interface.balanceOf(msg.sender) >= plots_lat.length, "Not enough TOKENS to buy these plots!");
        require(planetCryptoUtils_interface.validateTokenPurchase(msg.sender, plots_lat, plots_lng) == true, "Not enough COINS to buy these plots!");
        

        
        // now spend the tokens.
        require(planetCryptoCoin_interface.transferFrom(msg.sender, tokenBankAddress, plots_lat.length) == true, "Token transfer failed");
        
        
        _;
    }
    
    
    modifier validateResale(uint256 _token_id) {
        require(planetCryptoUtils_interface.validateResale(msg.sender, msg.value, _token_id) == true, "Not enough ETH to buy this card!");
        _;
    }
    
    
    modifier updateUsersLastAccess() {
        
        uint256 allPlyersIdx = playerAddressToPlayerObjectID[msg.sender];
        if(allPlyersIdx == 0){
            //all_players.push(msg.sender);
            
            //    address playerAddress;
            //    uint256 lastAccess;
            //    uint32 totalEmpireScore;
            //    uint32 totalLand;
            
            all_playerObjects.push(player(msg.sender,now,0,0));
            playerAddressToPlayerObjectID[msg.sender] = all_playerObjects.length-1;
        } else {
            all_playerObjects[allPlyersIdx].lastAccess = now;
        }
        
        _;
    }
    
    // STRUCTS
    struct plotDetail {
        bytes32 name;
        uint256 orig_value;
        uint256 current_value;
        uint256 empire_score;
        int256[] plots_lat;
        int256[] plots_lng;
    }
    
    struct plotBasic {
        int256 lat;
        int256 lng;
    }
    
    struct player {
        address playerAddress;
        uint256 lastAccess;
        uint256 totalEmpireScore;
        uint256 totalLand;
        
        
    }
    

    // INTERFACES
    address planetCryptoCoinAddress = 0x3d270d33576f8bcbfe6fcfdd5259e3151ad16383;
    PlanetCryptoCoin_I internal planetCryptoCoin_interface;
    
    //PlanetCryptoUtils_I
    address planetCryptoUtilsAddress = 0xb992e9f279f3125c1c8089d5bcc182266d7b70f1;
    PlanetCryptoUtils_I internal planetCryptoUtils_interface;
    
    
    
    // Add in payment split var:
    // split to dev fund
    // split to tax fund
    // split to referrrals
    
    // settings
    Percent.percent private m_newPlot_devPercent = Percent.percent(75,100); //75/100*100% = 75%
    Percent.percent private m_newPlot_taxPercent = Percent.percent(25,100); //25%
    
    Percent.percent private m_resalePlot_devPercent = Percent.percent(10,100); // 10%
    Percent.percent private m_resalePlot_taxPercent = Percent.percent(10,100); // 10%
    Percent.percent private m_resalePlot_ownerPercent = Percent.percent(80,100); // 80%
    
    Percent.percent private m_refPercent = Percent.percent(5,100); // 5% referral 
    
    Percent.percent private m_empireScoreMultiplier = Percent.percent(150,100); // 150%
    Percent.percent private m_resaleMultipler = Percent.percent(200,100); // 200%;

    
    
    
    uint256 public devHoldings = 0; // holds dev funds in cases where the instant transfer fails


    mapping(address => uint256) internal playersFundsOwed; // can sit within all_playerObjects





    // add in limit of land plots before tokens stop being distributed
    uint256 public tokens_rewards_available;
    uint256 public tokens_rewards_allocated;
    
    // add in spend amount required to earn tokens
    uint256 public min_plots_purchase_for_token_reward = 10;
    uint256 public plots_token_reward_divisor = 10;
    
    
    // GAME SETTINGS
    uint256 public current_plot_price = 20000000000000000;
    uint256 public price_update_amount = 2000000000000;

    uint256 public current_plot_empire_score = 100;

    
    
    uint256 public tax_fund = 0;
    uint256 public tax_distributed = 0;


    // GAME STATS
    uint256 public total_land_sold = 0;
    uint256 public total_trades = 0;
    //mapping(address => uint256) internal usersLastAccess;
    
    
    uint256 public total_empire_score; // total empire_score of all players
    //address[] public all_players;  // 
    player[] public all_playerObjects;
    mapping(address => uint256) internal playerAddressToPlayerObjectID;
    
    
    
    
    plotDetail[] plotDetails;
    mapping(uint256 => uint256) internal tokenIDplotdetailsIndexId; // e.g. tokenIDplotdetailsIndexId shows us the index of the detail obj for each token


    //mapping(string => uint256) internal latlngTokenIDowners; // shows ownership of plots
    // where string = "lat:lng"
    //mapping(uint256 => string[]) internal tokenIDlatlngOwnersLookup; // reverse of above
    
    

    
    // new ownership grid (x/y)
    // still doesn't let us query easily...
    // e.g. 
    // _t = latlngTokenID_grids[startLat];
    // How do we get onto the next lat?
    // We are passed an array of LAT & LNG columns to query!
    
    mapping(int256 => mapping(int256 => uint256)) internal latlngTokenID_grids;
    mapping(uint256 => plotBasic[]) internal tokenIDlatlngLookup;
    
    
    
    mapping(uint8 => mapping(int256 => mapping(int256 => uint256))) internal latlngTokenID_zoomAll;
    // zoomLvl => latCol =>(lonCols => tokenID)
    mapping(uint8 => mapping(uint256 => plotBasic[])) internal tokenIDlatlngLookup_zoomAll;
    // zoomLvl => tokenID => [plotBasic/latlong]
    


   
    
    constructor() ERC721Full_custom("PlanetCrypto", "PTC") public {
        owner = msg.sender;
        tokenBankAddress = owner;
        devBankAddress = owner;
        planetCryptoCoin_interface = PlanetCryptoCoin_I(planetCryptoCoinAddress);
        planetCryptoUtils_interface = PlanetCryptoUtils_I(planetCryptoUtilsAddress);
        
        // empty playerAddressToPlayerObjectID player to allow easy checks...

        all_playerObjects.push(player(address(0x0),0,0,0));
        playerAddressToPlayerObjectID[address(0x0)] = 0;
    }

    

    

    function getToken(uint256 _tokenId, bool isBasic) public view returns(
        address token_owner,
        bytes32  name,
        uint256 orig_value,
        uint256 current_value,
        uint256 empire_score,
        int256[] plots_lat,
        int256[] plots_lng
        ) {
        token_owner = ownerOf(_tokenId);
        plotDetail memory _plotDetail = plotDetails[tokenIDplotdetailsIndexId[_tokenId]];
        name = _plotDetail.name;
        empire_score = _plotDetail.empire_score;
        orig_value = _plotDetail.orig_value;
        current_value = _plotDetail.current_value;
        if(!isBasic){
            plots_lat = _plotDetail.plots_lat;
            plots_lng = _plotDetail.plots_lng;
        } else {
        }
    }
    
    
    // working
    function taxEarningsAvailable() public view returns(uint256) {
        return playersFundsOwed[msg.sender];
    }
    // working
    function withdrawTaxEarning() public {
        uint256 taxEarnings = playersFundsOwed[msg.sender];
        playersFundsOwed[msg.sender] = 0;
        tax_fund = tax_fund.sub(taxEarnings);
        
        if(!msg.sender.send(taxEarnings)) {
            playersFundsOwed[msg.sender] = playersFundsOwed[msg.sender] + taxEarnings;
            tax_fund = tax_fund.add(taxEarnings);
        }
    }

    function buyLandWithTokens(bytes32 _name, int256[] _plots_lat, int256[] _plots_lng)
     validateTokenPurchase(_plots_lat, _plots_lng) validateLand(_plots_lat, _plots_lng) updateUsersLastAccess() public {
        require(_name.length > 4);
        

        processPurchase(_name, _plots_lat, _plots_lng); 
    }
    

    
    function buyLand(bytes32 _name, 
            int256[] _plots_lat, int256[] _plots_lng,
            address _referrer
            )
                validatePurchase(_plots_lat, _plots_lng) 
                validateLand(_plots_lat, _plots_lng) 
                updateUsersLastAccess()
                public payable {
       require(_name.length > 4);
       
        // split payment
        uint256 _runningTotal = msg.value;
        uint256 _referrerAmnt = 0;
        if(_referrer != msg.sender && _referrer != address(0)) {
            _referrerAmnt = m_refPercent.mul(msg.value);
            if(_referrer.send(_referrerAmnt)) {
                emit referralPaid(_referrer, _referrer, _referrerAmnt, now);
                _runningTotal = _runningTotal.sub(_referrerAmnt);
            }
        }
        
        tax_fund = tax_fund.add(m_newPlot_taxPercent.mul(_runningTotal));
        
        
        
        if(!devBankAddress.send(m_newPlot_devPercent.mul(_runningTotal))){
            devHoldings = devHoldings.add(m_newPlot_devPercent.mul(_runningTotal));
        }
        
        
        
        // process purchase
        processPurchase(_name, _plots_lat, _plots_lng);
        
        calcPlayerDivs(m_newPlot_taxPercent.mul(_runningTotal));
        
        if(_plots_lat.length >= min_plots_purchase_for_token_reward
            && tokens_rewards_available > 0) {
                
            uint256 _token_rewards = _plots_lat.length / plots_token_reward_divisor;
            if(_token_rewards > tokens_rewards_available)
                _token_rewards = tokens_rewards_available;
                
                
            planetCryptoCoin_interface.transfer(msg.sender, _token_rewards);
                
            emit issueCoinTokens(msg.sender, msg.sender, _token_rewards, now);
            tokens_rewards_allocated = tokens_rewards_allocated + _token_rewards;
            tokens_rewards_available = tokens_rewards_available - _token_rewards;
        }
    
    }
    
    
    // working - divs to test
    function buyCard(uint256 _token_id, address _referrer) validateResale(_token_id) updateUsersLastAccess() public payable {
        
        
        // split payment
        uint256 _runningTotal = msg.value;
        uint256 _referrerAmnt = 0;
        if(_referrer != msg.sender && _referrer != address(0)) {
            _referrerAmnt = m_refPercent.mul(msg.value);
            if(_referrer.send(_referrerAmnt)) {
                emit referralPaid(_referrer, _referrer, _referrerAmnt, now);
                _runningTotal = _runningTotal.sub(_referrerAmnt);
            }
        }
        
        
        tax_fund = tax_fund.add(m_resalePlot_taxPercent.mul(_runningTotal));
        
        
        
        if(!devBankAddress.send(m_resalePlot_devPercent.mul(_runningTotal))){
            devHoldings = devHoldings.add(m_resalePlot_devPercent.mul(_runningTotal));
        }
        
        
        //uint256 _playerObject_idx = playerAddressToPlayerObjectID[from];
        address from = ownerOf(_token_id);
        
        if(!from.send(m_resalePlot_ownerPercent.mul(_runningTotal))) {
            playersFundsOwed[from] = playersFundsOwed[from].add(m_resalePlot_ownerPercent.mul(_runningTotal));
        }
        
        
        // transfer the card...
        our_transferFrom(from, msg.sender, _token_id);
        
        // The card empire_score increases
        plotDetail memory _plotDetail = plotDetails[tokenIDplotdetailsIndexId[_token_id]];
        uint256 _empireScore = _plotDetail.empire_score;
        uint256 _newEmpireScore = m_empireScoreMultiplier.mul(_empireScore);
        uint256 _origValue = _plotDetail.current_value;
        
        uint256 _playerObject_idx = playerAddressToPlayerObjectID[msg.sender];
        

        all_playerObjects[_playerObject_idx].totalEmpireScore
            = all_playerObjects[_playerObject_idx].totalEmpireScore + (_newEmpireScore - _empireScore);
        
        
        plotDetails[tokenIDplotdetailsIndexId[_token_id]].empire_score = _newEmpireScore;

        total_empire_score = total_empire_score + (_newEmpireScore - _empireScore);
        
        plotDetails[tokenIDplotdetailsIndexId[_token_id]].current_value = 
            m_resaleMultipler.mul(plotDetails[tokenIDplotdetailsIndexId[_token_id]].current_value);
        
        total_trades = total_trades + 1;
        
        
        calcPlayerDivs(m_resalePlot_taxPercent.mul(_runningTotal));
        
        
        // emit event
        emit cardBought(_token_id, from, msg.sender,
                    _token_id, from, msg.sender, 
                    _plotDetail.name,
                    _origValue, 
                    msg.value,
                    _empireScore, _newEmpireScore, now);
    }
    
    function processPurchase(bytes32 _name, 
            int256[] _plots_lat, int256[] _plots_lng) internal {
    
        uint256 _token_id = totalSupply().add(1);
        _mint(msg.sender, _token_id);
        

        
        // restrict card names to be unique too??
        uint256 _empireScore =
                    current_plot_empire_score * _plots_lng.length;
            
            //calcEmpireScore(_plots_lat, _plots_lng);
    
        //    struct plotDetail {
        //        bytes32 name;
        //        uint256 orig_value;
        //        uint256 current_value;
        //        uint32 empire_score;
        //        int32[] plots_lat;
        //        int32[] plots_lng;
        //    }
        
        plotDetails.push(plotDetail(
            _name,
            current_plot_price * _plots_lat.length,
            current_plot_price * _plots_lat.length,
            _empireScore,
            _plots_lat, _plots_lng
        ));
        
        tokenIDplotdetailsIndexId[_token_id] = plotDetails.length-1;
        
        
        setupPlotOwnership(_token_id, _plots_lat, _plots_lng);
        
        
        
        uint256 _playerObject_idx = playerAddressToPlayerObjectID[msg.sender];
        all_playerObjects[_playerObject_idx].totalEmpireScore
            = all_playerObjects[_playerObject_idx].totalEmpireScore + _empireScore;
            
        total_empire_score = total_empire_score + _empireScore;
            
        all_playerObjects[_playerObject_idx].totalLand
            = all_playerObjects[_playerObject_idx].totalLand + _plots_lat.length;
            
        
        emit landPurchased(
                _token_id, msg.sender,
                _token_id, msg.sender, _name, _plots_lat[0], _plots_lng[0], _plots_lat.length, current_plot_price, _empireScore, now);


        current_plot_price = current_plot_price + (price_update_amount * _plots_lat.length);
        total_land_sold = total_land_sold + _plots_lat.length;
        
    }




    uint256 internal tax_carried_forward = 0;
    
    function calcPlayerDivs(uint256 _value) internal {
        // total up amount split so we can emit it
        if(totalSupply() > 1) {
            uint256 _totalDivs = 0;
            uint256 _totalPlayers = 0;
            
            uint256 _taxToDivide = _value + tax_carried_forward;
            
            // ignore player 0
            for(uint256 c=1; c< all_playerObjects.length; c++) {
                
                // allow for 0.0001 % =  * 10000
                
                uint256 _playersPercent 
                    = (all_playerObjects[c].totalEmpireScore*10000000 / total_empire_score * 10000000) / 10000000;
                uint256 _playerShare = _taxToDivide / 10000000 * _playersPercent;
                
                //uint256 _playerShare =  _taxToDivide * (all_playerObjects[c].totalEmpireScore / total_empire_score);
                //_playerShare = _playerShare / 10000;
                
                if(_playerShare > 0) {
                    
                    incPlayerOwed(all_playerObjects[c].playerAddress,_playerShare);
                    _totalDivs = _totalDivs + _playerShare;
                    _totalPlayers = _totalPlayers + 1;
                
                }
            }

            tax_carried_forward = 0;
            emit taxDistributed(_totalDivs, _totalPlayers, now);

        } else {
            // first land purchase - no divs this time, carried forward
            tax_carried_forward = tax_carried_forward + _value;
        }
    }
    
    
    function incPlayerOwed(address _playerAddr, uint256 _amnt) internal {
        playersFundsOwed[_playerAddr] = playersFundsOwed[_playerAddr].add(_amnt);
        tax_distributed = tax_distributed.add(_amnt);
    }
    
    
    function setupPlotOwnership(uint256 _token_id, int256[] _plots_lat, int256[] _plots_lng) internal {

       for(uint256 c=0;c< _plots_lat.length;c++) {
         
            //mapping(int256 => mapping(int256 => uint256)) internal latlngTokenID_grids;
            latlngTokenID_grids[_plots_lat[c]]
                [_plots_lng[c]] = _token_id;
                
            //mapping(uint256 => plotBasic[]) internal tokenIDlatlngLookup;
            tokenIDlatlngLookup[_token_id].push(plotBasic(
                _plots_lat[c], _plots_lng[c]
            ));
            
        }
       
        
        int256 _latInt = _plots_lat[0];
        int256 _lngInt = _plots_lng[0];



        setupZoomLvl(1,_latInt, _lngInt, _token_id); // correct rounding / 10 on way out
        setupZoomLvl(2,_latInt, _lngInt, _token_id); // correct rounding / 100
        setupZoomLvl(3,_latInt, _lngInt, _token_id); // correct rounding / 1000
        setupZoomLvl(4,_latInt, _lngInt, _token_id); // correct rounding / 10000
      
    }

    function setupZoomLvl(uint8 zoom, int256 lat, int256 lng, uint256 _token_id) internal  {
        
        //emit debugInt("PREROUNDED LNG:", lng);
        
        lat = roundLatLng(zoom, lat);
        lng  = roundLatLng(zoom, lng); 
        
        // emit debugInt("ROUNDED LNG:", lng);
        
        
        uint256 _remover = 5;
        if(zoom == 1)
            _remover = 5;
        if(zoom == 2)
            _remover = 4;
        if(zoom == 3)
            _remover = 3;
        if(zoom == 4)
            _remover = 2;
        
        string memory _latStr;  // = int2str(lat);
        string memory _lngStr; // = int2str(lng);
        //uint256 _lat_len = utfStringLength(_lat);
        //uint256 _lng_len = utfStringLength(_lng);
        
        
        bool _tIsNegative = false;
        
        if(lat < 0) {
            _tIsNegative = true;   
            lat = lat * -1;
        }
        _latStr = planetCryptoUtils_interface.int2str(lat);
        _latStr = planetCryptoUtils_interface.substring(_latStr,0,planetCryptoUtils_interface.utfStringLength(_latStr)-_remover); //_lat_len-_remover);
        lat = int256(planetCryptoUtils_interface.parseInt(_latStr,0));
        if(_tIsNegative)
            lat = lat * -1;
        
        
        //emit debugInt("ZOOM LNG1", lng); // 1.1579208923731619542...
        
        if(lng < 0) {
            _tIsNegative = true;
            lng = lng * -1;
        } else {
            _tIsNegative = false;
        }
            
        //emit debugInt("ZOOM LNG2", lng); // 100000
            
        _lngStr = planetCryptoUtils_interface.int2str(lng);
        
        _lngStr = planetCryptoUtils_interface.substring(_lngStr,0,planetCryptoUtils_interface.utfStringLength(_lngStr)-_remover);
        
        lng = int256(planetCryptoUtils_interface.parseInt(_lngStr,0));
        
        if(_tIsNegative)
            lng = lng * -1;
        
        /*
        emit debugUInt("SETTING UP ZOOM:", zoom);
        emit debugInt("ZOOM LAT", lat); // 516
        emit debugInt("ZOOM LNG", lng); // 1.157920892373161954235
        emit debugBool("LNG negative:", _tIsNegative);
        */
        
        latlngTokenID_zoomAll[zoom][lat][lng] = _token_id;
        tokenIDlatlngLookup_zoomAll[zoom][_token_id].push(plotBasic(lat,lng));
        
      
   
        
        
    }




    


    function getAllPlayerObjectLen() public view returns(uint256){
        return all_playerObjects.length;
    }
    

    // does this only work if we query exactly though????
    // although this is querying at lower levels of decimal places
    // or can we query from top-left to bottom-right
    // TODO: The return string needs to include the lat/lng too so we can display it!
    //
    // orig: [51505210],[-90000]
    //
    // zoom 0 with: 0, [51505210], [-90000]
    // returns: "[51505210,-90000,1]:"
    //
    // queryMap 1 working with query: 1,[516],[-1]
    // zoom 2 with: 2, [5151],[-9]
    // zoom 3 with: 3, [51506],[-90]
    // zoom 4 with: 4, [515053], [-900]
    /*
    Example zoom lvl 18 grid:
        currentColumns:
        -0.0871: "-0.0871"
        -0.0874: "-0.0874"
        -0.0877: "-0.0877"
        -0.0880: "-0.0880"
        -0.0882: "-0.0882"
        -0.0883: "-0.0883"
        -0.0885: "-0.0885"
        -0.0888: "-0.0888"
        -0.0891: "-0.0891"
        -0.0894: "-0.0894"
        -0.0897: "-0.0897"
        -0.0900: "-0.0900"
        -0.0903: "-0.0903"
        -0.0906: "-0.0906"
        -0.0908: "-0.0908"
        -0.0909: "-0.0909"
        -0.0911: "-0.0911"
        -0.0914: "-0.0914"
        -0.0917: "-0.0917"
        -0.0920: "-0.0920"
        -0.0923: "-0.0923"
        -0.0926: "-0.0926"
        -0.0929: "-0.0929"
        __proto__: Object
        currentRows:
        51.5037: "51.5037"
        51.5039: "51.5039"
        51.5040: "51.5040"
        51.5042: "51.5042"
        51.5044: "51.5044"
        51.5046: "51.5046"
        51.5048: "51.5048"
        51.5049: "51.5049"
        51.5051: "51.5051"
        51.5053: "51.5053"
        51.5055: "51.5055"
        51.5057: "51.5057"
        51.5058: "51.5058"
        51.5060: "51.5060"
        51.5062: "51.5062"
    */
    function queryMap(uint8 zoom, int256[] lat_rows, int256[] lng_columns) public view returns(string _outStr) {
        //uint256[] storage _outputTokenIDs;
        //string memory _outputTokenIDs;
       // uint256[] memory _out;
        
        
        //int32[] memory _outLat;
        //int32[] memory _outLng;
        //uint256 c = 0;
        //mapping(int256 => mapping(int256 => uint256)) internal latlngTokenID_grids;
        //mapping(uint256 => plotBasic[]) internal tokenIDlatlngLookup;
        
        for(uint256 y=0; y< lat_rows.length; y++) {
            //_outputTokenIDs.push(lookupZoomLvl(zoom, lat[c], lng[c]));    
            //strConcat(uint2str(lookupZoomLvl(zoom, lat[c], lng[c])), ':');
            for(uint256 x=0; x< lng_columns.length; x++) {
                
                
                
                if(zoom == 0){
                    if(latlngTokenID_grids[lat_rows[y]][lng_columns[x]] > 0){
                        
                        
                      _outStr = planetCryptoUtils_interface.strConcat(
                            _outStr, '[', planetCryptoUtils_interface.int2str(lat_rows[y]) , ':', planetCryptoUtils_interface.int2str(lng_columns[x]) );
                      _outStr = planetCryptoUtils_interface.strConcat(_outStr, ':', 
                                    planetCryptoUtils_interface.uint2str(latlngTokenID_grids[lat_rows[y]][lng_columns[x]]), ']');
                    }
                    
                    //_out[c] = latlngTokenID_grids[lat_rows[y]][lng_columns[x]];
                    /*
                    if(latlngTokenID_grids[lat_rows[y]][lng_columns[x]] > 0){
                        _out.push()
                        _outputTokenIDs = latlngTokenID_grids[lat_rows[y]][lng_columns[x]];
                        planetCryptoUtils_interface.strConcat(_outputTokenIDs, 
                        '[', 
                        planetCryptoUtils_interface.strConcat(planetCryptoUtils_interface.int2str(lat_rows[y]), ',', planetCryptoUtils_interface.int2str(lng_columns[x])),
                        ',',
                        planetCryptoUtils_interface.uint2str(latlngTokenID_grids[lat_rows[y]][lng_columns[x]]), ']:');
                        
                    } 
                    */
                } else {
                    //_out[c] = latlngTokenID_zoomAll[zoom][lat_rows[y]][lng_columns[x]];
                    if(latlngTokenID_zoomAll[zoom][lat_rows[y]][lng_columns[x]] > 0){
                      _outStr = planetCryptoUtils_interface.strConcat(_outStr, '[', planetCryptoUtils_interface.int2str(lat_rows[y]) , ':', planetCryptoUtils_interface.int2str(lng_columns[x]) );
                      _outStr = planetCryptoUtils_interface.strConcat(_outStr, ':', 
                                    planetCryptoUtils_interface.uint2str(latlngTokenID_zoomAll[zoom][lat_rows[y]][lng_columns[x]]), ']');
                    }
                    /*
                    if ( latlngTokenID_zoomAll[zoom][lat_rows[y]][lng_columns[x]] > 0){
                        _outputTokenIDs = 
                        planetCryptoUtils_interface.strConcat(_outputTokenIDs, 
                        '[', 
                        planetCryptoUtils_interface.strConcat(
                            planetCryptoUtils_interface.int2str(lat_rows[y]), ',', 
                            planetCryptoUtils_interface.int2str(lng_columns[x])),
                        ',',
                        planetCryptoUtils_interface.uint2str(
                            latlngTokenID_zoomAll[zoom][lat_rows[y]][lng_columns[x]]), ']:');

                    }
                    */
                }
                //c = c+1;
                
            }
        }
        
        //return _out;
    }

    function queryPlotExists(uint8 zoom, int256[] lat_rows, int256[] lng_columns) public view returns(bool) {
        
        
        for(uint256 y=0; y< lat_rows.length; y++) {

            for(uint256 x=0; x< lng_columns.length; x++) {
                
                if(zoom == 0){
                    if(latlngTokenID_grids[lat_rows[y]][lng_columns[x]] > 0){
                        return true;
                    } 
                } else {
                    if(latlngTokenID_zoomAll[zoom][lat_rows[y]][lng_columns[x]] > 0){

                        return true;
                        
                    }                     
                }
           
                
            }
        }
        
        return false;
    }

    
    function roundLatLng(uint8 _zoomLvl, int256 _in) internal view returns(int256) {
        int256 multipler = 100000;
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
            _in = planetCryptoUtils_interface.ceil1(_in, multipler);
        } else {
            _in = _in * -1;
            _in = planetCryptoUtils_interface.ceil1(_in, multipler);
            _in = _in * -1;
        }
        
        return (_in);
        
    }
    

   




    // ERC721 overrides
    
    function safeTransferFrom(address from, address to, uint256 tokenId) public {
        safeTransferFrom(from, to, tokenId, "");
    }
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data) public {
        transferFrom(from, to, tokenId);
        // solium-disable-next-line arg-overflow
        require(_checkOnERC721Received(from, to, tokenId, _data));
    }
    
    function our_transferFrom(address from, address to, uint256 tokenId) internal {
        // permissions already checked on buycard
        process_swap(from,to,tokenId);
        
        internal_transferFrom(from, to, tokenId);
    }


    function transferFrom(address from, address to, uint256 tokenId) public {
        // check permission on the from address first
        require(_isApprovedOrOwner(msg.sender, tokenId));
        require(to != address(0));
        
        process_swap(from,to,tokenId);
        
        super.transferFrom(from, to, tokenId);

    }
    
    function process_swap(address from, address to, uint256 tokenId) internal {

        
        // remove the empire score & total land owned...
        uint256 _empireScore;
        uint256 _size;
        
        plotDetail memory _plotDetail = plotDetails[tokenIDplotdetailsIndexId[tokenId]];
        _empireScore = _plotDetail.empire_score;
        _size = _plotDetail.plots_lat.length;
        
        uint256 _playerObject_idx = playerAddressToPlayerObjectID[from];
        
        all_playerObjects[_playerObject_idx].totalEmpireScore
            = all_playerObjects[_playerObject_idx].totalEmpireScore - _empireScore;
            
        all_playerObjects[_playerObject_idx].totalLand
            = all_playerObjects[_playerObject_idx].totalLand - _size;
            
        // and increment on the other side...
        
        _playerObject_idx = playerAddressToPlayerObjectID[to];
        
        all_playerObjects[_playerObject_idx].totalEmpireScore
            = all_playerObjects[_playerObject_idx].totalEmpireScore + _empireScore;
            
        all_playerObjects[_playerObject_idx].totalLand
            = all_playerObjects[_playerObject_idx].totalLand + _size;
    }


    function burnToken(uint256 _tokenId) external onlyOwner {
        address _token_owner = ownerOf(_tokenId);
        _burn(_token_owner, _tokenId);
        
        
        // remove the empire score & total land owned...
        uint256 _empireScore;
        uint256 _size;
        
        plotDetail memory _plotDetail = plotDetails[tokenIDplotdetailsIndexId[_tokenId]];
        _empireScore = _plotDetail.empire_score;
        _size = _plotDetail.plots_lat.length;
        
        uint256 _playerObject_idx = playerAddressToPlayerObjectID[_token_owner];
        
        all_playerObjects[_playerObject_idx].totalEmpireScore
            = all_playerObjects[_playerObject_idx].totalEmpireScore - _empireScore;
            
        all_playerObjects[_playerObject_idx].totalLand
            = all_playerObjects[_playerObject_idx].totalLand - _size;
            
        
        // clear up latlngTokenIDowners...
        /*
            latlngTokenIDowners[_mapStr] = _token_id;
               
            tokenIDlatlngOwnersLookup[_token_id].push(_mapStr);
        */
        /*
        for(uint256 c=0; c< tokenIDlatlngOwnersLookup[_tokenId].length; c++) {
            latlngTokenIDowners[
                    tokenIDlatlngOwnersLookup[_tokenId][c]
                ] = 0;
        }
        delete tokenIDlatlngOwnersLookup[_tokenId];
        */


        //mapping(uint256 => mapping(uint256 => uint256)) internal latlngTokenID_grids;
        //mapping(uint256 => plotBasic[]) internal tokenIDlatlngLookup;
        
        
        // clear latlngTokenID_grids
        
        for(uint256 c=0;c < tokenIDlatlngLookup[_tokenId].length; c++) {
            latlngTokenID_grids[
                    tokenIDlatlngLookup[_tokenId][c].lat
                ][tokenIDlatlngLookup[_tokenId][c].lng] = 0;
        }
        delete tokenIDlatlngLookup[_tokenId];
        
        
        
        //Same for tokenIDplotdetailsIndexId        
        // clear from plotDetails array... (Holds the detail of the card)
        uint256 oldIndex = tokenIDplotdetailsIndexId[_tokenId];
        if(oldIndex != plotDetails.length-1) {
            plotDetails[oldIndex] = plotDetails[plotDetails.length-1];
        }
        plotDetails.length--;
        

        delete tokenIDplotdetailsIndexId[_tokenId];



        for(uint8 zoom=1; zoom < 5; zoom++) {
            plotBasic[] storage _plotBasicList = tokenIDlatlngLookup_zoomAll[zoom][_tokenId];
            for(uint256 _plotsC=0; c< _plotBasicList.length; _plotsC++) {
                delete latlngTokenID_zoomAll[zoom][
                    _plotBasicList[_plotsC].lat
                    ][
                        _plotBasicList[_plotsC].lng
                        ];
                        
                delete _plotBasicList[_plotsC];
            }
            
        }
    
    



    }    



    // PRIVATE METHODS
    function p_update_action(uint256 _type, address _address) public onlyOwner {
        if(_type == 0){
            owner = _address;    
        }
        if(_type == 1){
            tokenBankAddress = _address;    
        }
        if(_type == 2) {
            devBankAddress = _address;
        }
    }


    function p_update_priceUpdateAmount(uint256 _price_update_amount) public onlyOwner {
        price_update_amount = _price_update_amount;
    }
    function p_update_currentPlotEmpireScore(uint256 _current_plot_empire_score) public onlyOwner {
        current_plot_empire_score = _current_plot_empire_score;
    }
    function p_update_planetCryptoCoinAddress(address _planetCryptoCoinAddress) public onlyOwner {
        planetCryptoCoinAddress = _planetCryptoCoinAddress;
        if(address(planetCryptoCoinAddress) != address(0)){ 
            planetCryptoCoin_interface = PlanetCryptoCoin_I(planetCryptoCoinAddress);
        }
    }
    function p_update_planetCryptoUtilsAddress(address _planetCryptoUtilsAddress) public onlyOwner {
        planetCryptoUtilsAddress = _planetCryptoUtilsAddress;
        if(address(planetCryptoUtilsAddress) != address(0)){ 
            planetCryptoUtils_interface = PlanetCryptoUtils_I(planetCryptoUtilsAddress);
        }
    }
    function p_update_mNewPlotDevPercent(uint256 _newPercent) onlyOwner public {
        m_newPlot_devPercent = Percent.percent(_newPercent,100);
    }
    function p_update_mNewPlotTaxPercent(uint256 _newPercent) onlyOwner public {
        m_newPlot_taxPercent = Percent.percent(_newPercent,100);
    }
    function p_update_mResalePlotDevPercent(uint256 _newPercent) onlyOwner public {
        m_resalePlot_devPercent = Percent.percent(_newPercent,100);
    }
    function p_update_mResalePlotTaxPercent(uint256 _newPercent) onlyOwner public {
        m_resalePlot_taxPercent = Percent.percent(_newPercent,100);
    }
    function p_update_mResalePlotOwnerPercent(uint256 _newPercent) onlyOwner public {
        m_resalePlot_ownerPercent = Percent.percent(_newPercent,100);
    }
    function p_update_mRefPercent(uint256 _newPercent) onlyOwner public {
        m_refPercent = Percent.percent(_newPercent,100);
    }
    function p_update_mEmpireScoreMultiplier(uint256 _newPercent) onlyOwner public {
        m_empireScoreMultiplier = Percent.percent(_newPercent, 100);
    }
    function p_update_mResaleMultipler(uint256 _newPercent) onlyOwner public {
        m_resaleMultipler = Percent.percent(_newPercent, 100);
    }
    function p_update_tokensRewardsAvailable(uint256 _tokens_rewards_available) onlyOwner public {
        tokens_rewards_available = _tokens_rewards_available;
    }
    function p_update_tokensRewardsAllocated(uint256 _tokens_rewards_allocated) onlyOwner public {
        tokens_rewards_allocated = _tokens_rewards_allocated;
    }
    function p_withdrawDevHoldings() public {
        require(msg.sender == devBankAddress);
        uint256 _t = devHoldings;
        devHoldings = 0;
        if(!devBankAddress.send(devHoldings)){
            devHoldings = _t;
        }
    }


    function stringToBytes32(string memory source) internal returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
    
        assembly {
            result := mload(add(source, 32))
        }
    }

    function m() public {
        
    }
    
}