pragma solidity^0.4.25;

/**
*
*
*  Telegram: https://t.me/TronWinApp
*  Email: support (at) tronwin.app
*
* PLAY NOW: https://tronwin.app/
*  
* --- TRON WIN VAULT ------------------------------------------------
*
* 
*/





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
    function subSafe(uint256 a, uint256 b) internal pure returns (uint256) {
        if(b > a) {
            return 0;
        }
        return a - b;
    }


    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
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



interface TronWinToken {
    function getCurrentMiningDifficulty() external view returns(uint);
    function initTransfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function playersWithFrozenTokensLen() external view returns(uint);
    function tokensFrozenByplayersWithFrozenTokensAddressesPos(uint256 _c) 
            external view returns(uint _amnt, address _player);
    function totalFrozen() external view returns(uint);
    
}

contract TronWinVault {
    uint constant _10m = 10000000000000;
    uint constant _1m = 1000000000000;
    uint constant _6d = 1000000;

    uint constant _1day = 24 hours;
    
    using SafeMath for uint256;
    using Percent for Percent.percent;




    event SafetyLimit (
        address indexed triggered_by,
        uint            wins
    );

    // Events
    // event_type
    // 0 = investment, 1 = reinvestment, 2 = vault won, 3 = external trx dist, 
    // 4 = vanityname purchased, 5 referral earned, 6 new round leader,
    // 7 = new silver bankers card bought, 8 == new gold bankers card bought, 9 == new platinum bankers card bought
    // 10 = highest player vault prize won
    // 11 = random vault prize won
    event Action (
        uint16 indexed event_type,
        address indexed from,
        address to,
        uint256     amnt, 
        string      data,
        uint256     timestamp
        );



    // VANITY NAME VARS
    uint256 public VANITY_PRICE    = 100000000;// 100 trx; 
    mapping(bytes32 => address) public listVanityAddress; // key is vanity of address
    mapping(address => PlayerVanity) public playersVanity;
    struct PlayerVanity {
        string vanity;
        bool vanityStatus;
    }
    address[] public playersVanityAddressList;
    function playersVanityAddressListLen() public view returns (uint) {
        return playersVanityAddressList.length;
    }
    function playersVanityByID(uint _id) public view returns (address _addr, string memory _vanity) {
        _addr = playersVanityAddressList[_id];
        _vanity = playersVanity[_addr].vanity;
    }
    // VANITY NAME VARS


    address owner;

    address externalValidator = 0x93e05fDf63dEA1A238a4BfDD69e90329999290D3; 
    //TPT7857oyMaPJjarQgspxw6PQgTnzCSidU


    function updateVanityPrice(uint _amnt) public {
        require(msg.sender == owner);
        VANITY_PRICE = _amnt;
    }


    modifier onlyValidatedGames() {
        require(allowedGamingContracts[msg.sender] == true);
        require(allowedGamingContractsExternalValidated[msg.sender] == true);
        _;
    }


    //uint256 public gameFund; 
    mapping(address => bool) allowedGamingContracts; // allowed access to the gaming fund
    mapping(address => bool) allowedGamingContractsExternalValidated; 
    // also approved by the external validator



    mapping(address => bool) allowedTokenFundsContracts; // allowed access to the tokenDayFunds
    mapping(address => bool) allowedTokenFundsContractsExternalValidated; // needs approving by External validator too

    Percent.percent private m_maxShockDrop = Percent.percent(20, 100);
    uint256 public shockDropPeriod = 4 hours;
    
    // only allows the gameFund to drop m_maxShockDrop% over a shockDropPeriod
    uint256 public gameFundUsage_inPeriod = 0;
    uint256 public gameFundPeriodStart;

    

    struct tokenDayDetail {
        uint256     fundsAvail; // capped a 0
        uint256     startTS;
        mapping(address => bool) playerProcessed;
    }


    tokenDayDetail[]  internal tokenDayFunds;
    

    uint public tokenDay;


    function gamingFundPayment(address _to, uint _amnt) external onlyValidatedGames() {

        if(gameFundPeriodStart + shockDropPeriod < now) {
            // reset
            gameFundPeriodStart = gameFundPeriodStart + shockDropPeriod;
            gameFundUsage_inPeriod = _amnt;
        } else {
            gameFundUsage_inPeriod = gameFundUsage_inPeriod.add(_amnt);    
        }

        require(gameFundUsage_inPeriod < m_maxShockDrop.mul(getGameFund()), 
                    "Uses too much of the fund at this time - payment rejected!");

        _to.transfer(_amnt);
        
        if(tokenDayFunds[tokenDay].startTS + _1day < now) {
            tokenDay++;
            tokenDayFunds.push(tokenDayDetail(0,tokenDayFunds[tokenDay-1].startTS));
            tokenDayFunds[tokenDay].startTS = tokenDayFunds[tokenDay].startTS + _1day;
        }



    }

    function applyFundsAsTokenEligible(uint _amnt) external onlyValidatedGames() {
        if(tokenDayFunds[tokenDay].startTS + _1day < now) {
            tokenDay++;
            tokenDayFunds.push(tokenDayDetail(0,tokenDayFunds[tokenDay-1].startTS));
            tokenDayFunds[tokenDay].startTS = tokenDayFunds[tokenDay].startTS + _1day;
        }
        tokenDayFunds[tokenDay].fundsAvail = tokenDayFunds[tokenDay].fundsAvail + _amnt;
    }


    // isTokenFundsEligible = profit (From Dice etc)

    function receiveExternalGameFundAsToken(uint256 amountTokenEligible) external payable {

        if(tokenDayFunds[tokenDay].startTS + _1day < now) {
            tokenDay++;
            tokenDayFunds.push(tokenDayDetail(0,tokenDayFunds[tokenDay-1].startTS));
            tokenDayFunds[tokenDay].startTS = tokenDayFunds[tokenDay].startTS + _1day;
        }

        
        if(amountTokenEligible > 0)
            tokenDayFunds[tokenDay].fundsAvail += amountTokenEligible;

    }



    function getGameFund() public view returns (uint256) {
        return address(this).balance;
    }

    function maxShockDrop() public view returns (uint256) {
        return m_maxShockDrop.mul(getGameFund());
    }


    mapping(address => uint) public TWNdivsEarned;

    // use TronWinToken.playersWithFrozenTokensLen() to see how many have frozen tokens


    //10,000,000,000
    function p_p(uint _day, uint _pos1, uint _pos2, uint _totalFrozen) public onlyOwner {
        address _a; uint _tokens;


        uint _dayFunds = tokenDayFunds[_day].fundsAvail;

        for(uint _pos=_pos1; _pos <= _pos2; _pos++) {

            (_tokens, _a) = tronWinToken_I.tokensFrozenByplayersWithFrozenTokensAddressesPos(_pos);

            uint _percentShare;
            uint _playersShare;
            
        
        
            _percentShare = percent(_tokens, _totalFrozen, 6);
            
            _playersShare = _dayFunds * _percentShare / 1000000;
        
        
            _a.transfer(_playersShare);
            TWNdivsEarned[_a] += _playersShare;
        }

    }

    function processDaysTokenDiv(uint _day, uint _pos) public onlyOwner {
        require(tokenDayFunds[_day].fundsAvail > 0, "No funds available for this day!");
        require(tokenDayFunds[_day].startTS + _1day < now, "Day still in progress!");
        
        uint256 _playerFrozenTokens;
        address _player;
        uint256 _total = tronWinToken_I.totalFrozen();
        uint256 _percentShare;
        uint256 _playersShare;
        uint256 _dayFunds = tokenDayFunds[_day].fundsAvail;
        
        (_playerFrozenTokens, _player) = tronWinToken_I.tokensFrozenByplayersWithFrozenTokensAddressesPos(_pos);
        
        require(tokenDayFunds[_day].playerProcessed[_player] == false, "Player already processed!");
        
        // calc share of total frozen
        _percentShare = percent(_playerFrozenTokens, _total, 6);
        // calc share of divs avail
        _playersShare = _dayFunds * _percentShare / 1000000;
        
        // send
        _player.transfer(_playersShare);
        //gameFund = gameFund.sub(_playersShare);
        
        
        tokenDayFunds[_day].playerProcessed[_player] = true;
    } 
    

    function check_processDaysTokenDiv(uint _day, uint _pos) public view onlyOwner 
            returns(uint _value,
            uint _total,
            uint _percentShare,
            uint _playersShare,
            uint _dayFunds,
            uint _playerFrozenTokens) {

        require(tokenDayFunds[_day].fundsAvail > 0, "No funds available for this day!");
       ////////// require(tokenDayFunds[_day].startTS + _1day < now, "Day still in progress!");

        _playerFrozenTokens;
        address _player;
        _total = tronWinToken_I.totalFrozen();
        _percentShare;
        _playersShare;
        _dayFunds = tokenDayFunds[_day].fundsAvail;
        
        (_playerFrozenTokens, _player) = tronWinToken_I.tokensFrozenByplayersWithFrozenTokensAddressesPos(_pos);
        
        _percentShare = percent(_playerFrozenTokens, _total, 6);
        // calc share of divs avail
        _playersShare = _dayFunds * _percentShare / 1000000;
        
        // send
        _value = _playersShare;
    } 

    function percent(uint numerator, uint denominator, uint precision) internal pure returns(uint quotient) {
         // caution, check safe-to-multiply here
        uint _numerator  = numerator * 10 ** (precision+1);
        // with rounding of last digit
        uint _quotient =  ((_numerator / denominator) + 5) / 10;
        return ( _quotient);
    }
    


    function processPlayerPlay(address _player, uint _amnt) external onlyValidatedGames {
        tronWinToken_I.initTransfer(_player, _amnt);
    } 

    



    bool public gamePaused = false;


    
    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier notOnPause() {
        require(gamePaused == false, "Game Paused");
        _;
    }



    TronWinToken internal tronWinToken_I = TronWinToken(0x4001Ecf3B1225f35c04C9360d7d07D66a5080a3e); 
    

    constructor() public {

        owner = address(msg.sender);

        tokenDayFunds.push(tokenDayDetail(0,now));
        gameFundPeriodStart = now;
    }


    function() payable external {   
    }
    function pay() public payable {
    }


    function getTokenDayDetail(uint256 _day) public view returns(
                    uint256      fundsAvail,
                    uint256     startTS) {
        fundsAvail = tokenDayFunds[_day].fundsAvail;
        startTS = tokenDayFunds[_day].startTS;
    }






    /**
    * Action by vanity
    * Vanity referral links (Show vanity in cardholder box)
    */
    function buyVanity(string memory _vanity) public payable {

        if(tokenDayFunds[tokenDay].startTS + _1day < now) {
            tokenDay++;
            tokenDayFunds.push(tokenDayDetail(0,tokenDayFunds[tokenDay-1].startTS));
            tokenDayFunds[tokenDay].startTS = tokenDayFunds[tokenDay].startTS + _1day;
        }
        tokenDayFunds[tokenDay].fundsAvail += msg.value/2;

        /*--------------------- validate --------------------------------*/
        require(msg.value >= VANITY_PRICE);
        require(isVanityExisted(_vanity) == false);
        /*--------------------- handle --------------------------------*/

        if(playersVanity[msg.sender].vanityStatus == false) {
            playersVanityAddressList.push(msg.sender);
        }

        playersVanity[msg.sender].vanity = _vanity;
        playersVanity[msg.sender].vanityStatus = true;
        // update list vanity address
        listVanityAddress[convertStringToBytes32(_vanity)] = msg.sender;
        /*--------------------- event --------------------------------*/
        owner.transfer(msg.value /2 );

        emit Action(4, msg.sender, address(0), msg.value, _vanity, now);
    }

    function isVanityExisted(string memory _vanity) public view returns(bool) {
        if (listVanityAddress[convertStringToBytes32(_vanity)] != address(0)) {
          return true; 
        }
        return false;
    }
    function convertStringToBytes32(string memory key) private pure returns (bytes32 ret) {
        if (bytes(key).length > 32) {
          revert();
        }

        assembly {
          ret := mload(add(key, 32))
        }
    }
    function vanityToAddress(string memory _vanity) public view returns(address) {
      return listVanityAddress[convertStringToBytes32(_vanity)];
    }
    function addressToVanity(address _player) public view returns(string memory) {
      return playersVanity[_player].vanity;
    }














    // Owner only functions    
    function p_setNewOwner(address _addr) public onlyOwner {
        owner = _addr;
    }


    function p_s(uint _type, uint _val, uint _val2) public onlyOwner {

        if(_type==1) {
            m_maxShockDrop = Percent.percent(_val, _val2);
        }
        if(_type==2) {
            shockDropPeriod = _val;
        }

        if(_type==3) {
            VANITY_PRICE = _val;
        }
        
    }

    function updateToken(address _addr) public onlyOwner {
        tronWinToken_I = TronWinToken(_addr);
    }

    function updateAllowedContracts(address _addr, bool _perm) public onlyOwner {
        allowedGamingContracts[_addr] = _perm;
    }

    function validateAllowedContracts(address _addr, bool _perm) public {
        require(msg.sender == externalValidator);
        allowedGamingContractsExternalValidated[_addr] = _perm;
    }

    function updateExternalValidator(address _newExternalValidator) public {
        require(msg.sender == externalValidator);
        externalValidator = _newExternalValidator;
    }



    function getContractBalance() internal view returns (uint) {
      return address(this).balance;
    }





}