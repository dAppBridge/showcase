pragma solidity^0.4.24;


library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

library Zero {
  function requireNotZero(uint a) internal pure {
    require(a != 0, "require not zero");
  }

  function requireNotZero(address addr) internal pure {
    require(addr != address(0), "require not zero address");
  }

  function notZero(address addr) internal pure returns(bool) {
    return !(addr == address(0));
  }

  function isZero(address addr) internal pure returns(bool) {
    return addr == address(0);
  }
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

library ToAddress {
  function toAddr(uint source) internal pure returns(address) {
    return address(source);
  }

  function toAddr(bytes source) internal pure returns(address addr) {
    assembly { addr := mload(add(source,0x14)) }
    return addr;
  }
}


contract otm {
    
    using SafeMath for uint256;
    using Percent for Percent.percent;
    using Zero for *;
    using ToAddress for *;
    
    
    address owner;
    address devAddress;
    
    // settings
    uint public constant STARTING_PLOT_PRICE = 2 finney; // 0.02 eth
    
    
    
    // gameplay veriables
    struct plot {
    	uint256		plot_id;
    	uint256		nw_lat;
    	uint256		nw_long;
    	address		owner;
    	string		name;
    	uint256		orig_price;
    	uint256		last_sale_price;
    }
    
    mapping(uint256 => mapping(uint256 => uint256)) public plots_X_Y_map; 
    // var _plot_id =  plots_X_Y_map([X])([Y]);
    // where the globe map is split into a grid of X,Y
    
    
    bool gamePaused = false;
    
    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier notOnPause() {
        require(gamePaused == false, "Game Paused");
        _;
    }
    
    constructor() public {

        owner = msg.sender;
        devAddress = msg.sender;
    }
    
 
    // Owner only functions    
    function p_setOwner(address _owner) public onlyOwner {
        owner = _owner;
    }
    function p_setDevAddress(address _devAddress) public onlyOwner {
        devAddress = _devAddress;
    }
    function p_setPaused(bool _gamePaused) public onlyOwner {
        gamePaused = _gamePaused;
    }
}