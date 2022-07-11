pragma solidity^0.5.4;

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




interface EthWinToken {
    function getCurrentMiningDifficulty() external view returns(uint);
    function initTransfer(address to, uint256 value) external returns (bool);
    function balanceOf(address who) external view returns (uint256);
    function playersWithFrozenTokensLen() external view returns(uint);
    function tokensFrozenByplayersWithFrozenTokensAddressesPos(uint256 _c) external view returns(uint _amnt, address _player);
    function totalFrozen() external returns(uint);
}

contract EthWinVault {
    uint constant _10m = 10000000000000;
    uint constant _1m = 1000000000000;
    uint constant _6d = 1000000;
    
    using SafeMath for uint256;
    using Percent for Percent.percent;




    event SafetyLimit (
        address indexed triggered_by,
        uint            wins
    );




    address owner;

    address externalValidator = 0x93e05fDf63dEA1A238a4BfDD69e90329999290D3; //0x93e05fdf63dea1a238a4bfdd69e90329999290d3; // DEBUG



    modifier onlyValidatedGames() {
        require(allowedGamingContracts[msg.sender] == true);
        require(allowedGamingContractsP3TValidated[msg.sender] == true);
        _;
    }


    uint256 public gameFund; 
    mapping(address => bool) allowedGamingContracts; // allowed access to the gaming fund
    mapping(address => bool) allowedGamingContractsP3TValidated; // also approved by the external P3T validator



    mapping(address => bool) allowedTokenFundsContracts; // allowed access to the tokenDayFunds
    mapping(address => bool) allowedTokenFundsContractsP3TValidated; // needs approving by P3T validator too

    Percent.percent private m_maxShockDrop = Percent.percent(20, 100);
    uint256 public shockDropPeriod = 4 hours;
    
    // only allows the gameFund to drop m_maxShockDrop% over a shockDropPeriod
    uint256 public gameFundUsage_inPeriod = 0;
    uint256 public gameFundPeriodStart;

    // token fund = funds divs EWIN token holders
    //int256 public tokenFund24hr;

    Percent.percent private tokenFund24hrTokenSplit = Percent.percent(50, 100);

    struct tokenDayDetail {
        int256      fundsAvail;
        bool        processed;
        uint256     startTS;
        mapping(address => bool) playerProcessed;
    }

    //int[] public tokenDayFunds;
    tokenDayDetail[]  internal tokenDayFunds;
    

    uint public tokenDay;
    
    
    // game settings
    uint256 public MIN_FREEZE = _1m;


    function gamingFundPayment(address payable _to, uint _amnt) external onlyValidatedGames() {
        if(gameFundPeriodStart == 0)
            gameFundPeriodStart = now;

        if(gameFundPeriodStart + shockDropPeriod > now) {
            // reset
            gameFundPeriodStart = now;
            gameFundUsage_inPeriod = _amnt;
        } else {
            gameFundUsage_inPeriod = gameFundUsage_inPeriod.add(_amnt);    
        }
        
        require(gameFundUsage_inPeriod < m_maxShockDrop.mul(gameFund), "Uses too much of the fund!");

        _to.transfer(_amnt);
        gameFund = gameFund.subSafe(_amnt);
        
        
        if(tokenDayFunds[tokenDay].startTS + 24 hours < now) {
            tokenDay++;
            tokenDayFunds.push(tokenDayDetail(0,false, tokenDayFunds[tokenDay-1].startTS));
            tokenDayFunds[tokenDay].startTS = tokenDayFunds[tokenDay].startTS + 24 hours;
        }
        tokenDayFunds[tokenDay].fundsAvail = tokenDayFunds[tokenDay].fundsAvail - int256(_amnt);
    }

    // isTokenFundsEligible = profit (From Dice etc)
    function receiveExternalGameFund(bool isTokenFundsEligible) external payable {

        if(tokenDayFunds[tokenDay].startTS + 24 hours < now) {
            tokenDay++;
            tokenDayFunds.push(tokenDayDetail(0,false, tokenDayFunds[tokenDay-1].startTS));
            tokenDayFunds[tokenDay].startTS = tokenDayFunds[tokenDay].startTS + 24 hours;
        }

        gameFund = gameFund.add(msg.value); // total avail in vault contract
        if(isTokenFundsEligible == true){
            tokenDayFunds[tokenDay].fundsAvail = tokenDayFunds[tokenDay].fundsAvail + int256(msg.value);
        }

    }
    function getGameFund() public view returns (uint256) {
        return gameFund;
    }

    function maxShockDrop() public view returns (uint256) {
        return m_maxShockDrop.mul(gameFund);
    }


    // use TronWinToken.playersWithFrozenTokensLen() to see how many have frozen tokens
    // then loop through this
    function processDaysTokenDiv(uint _day, uint _pos) public onlyOwner {
        require(tokenDayFunds[_day].processed == false, "Already processed!");
        require(tokenDayFunds[_day].fundsAvail > 0, "No funds available for this day!");
        require(tokenDayFunds[_day].startTS + 24 hours < now, "Day still in progress!");
        
        uint256 _playerFrozenTokens;
        address _player;
        uint256 _total = ethWinToken_I.totalFrozen();
        uint256 _percentShare;
        uint256 _playersShare;
        uint256 _dayFunds = tokenFund24hrTokenSplit.mul(uint256(tokenDayFunds[_day].fundsAvail));
        
        (_playerFrozenTokens, _player) = ethWinToken_I.tokensFrozenByplayersWithFrozenTokensAddressesPos(_pos);
        
        require(tokenDayFunds[_day].playerProcessed[_player] == false, "Player already processed!");
        
        // calc share of total frozen
        _percentShare = percent(_playerFrozenTokens, _total, 6);
        // calc share of divs avail
        _playersShare = _dayFunds * _percentShare / 1000000;
        
        // send
        address(uint160(_player)).transfer(_playersShare);
        gameFund = gameFund.sub(_playersShare);
        
        //tokenDayFunds[_day].processed = true;
        
        tokenDayFunds[_day].playerProcessed[_player] = true;
    } 
    
    function debug_processDaysTokenDiv(uint _day, uint _pos) public onlyOwner returns(uint _value) {
        require(tokenDayFunds[_day].processed == false, "Already processed!");
        require(tokenDayFunds[_day].fundsAvail > 0, "No funds available for this day!");
        //require(tokenDayFunds[_day].startTS + 24 hours < now, "Day still in progress!");
        
        uint256 _playerFrozenTokens;
        address _player;
        uint256 _total = ethWinToken_I.totalFrozen();
        uint256 _percentShare;
        uint256 _playersShare;
        uint256 _dayFunds = tokenFund24hrTokenSplit.mul(uint256(tokenDayFunds[_day].fundsAvail));
        
        (_playerFrozenTokens, _player) = ethWinToken_I.tokensFrozenByplayersWithFrozenTokensAddressesPos(_pos);
        
        require(tokenDayFunds[_day].playerProcessed[_player] == false, "Player already processed!");
        
        // calc share of total frozen
        _percentShare = percent(_playerFrozenTokens, _total, 6);
        // calc share of divs avail
        _playersShare = _dayFunds * _percentShare / 1000000;
        
        // send
        //address(uint160(_player)).transfer(_playersShare);
        _value = _playersShare;
        //gameFund = gameFund.sub(_playersShare);
        
        //tokenDayFunds[_day].processed = true;
        
        tokenDayFunds[_day].playerProcessed[_player] = true;
    } 


    function percent(uint numerator, uint denominator, uint precision) internal pure returns(uint quotient) {
         // caution, check safe-to-multiply here
        uint _numerator  = numerator * 10 ** (precision+1);
        // with rounding of last digit
        uint _quotient =  ((_numerator / denominator) + 5) / 10;
        return ( _quotient);
    }
    

    // calculate new EWN tokens due to the player...
    // This contract is the owner of all unassigned tokens
    // e.g. spent 1 trx (1000000) =
    // 1000000 / 440000000 = 2272 EWN = 0.002272 EWN
    function processPlayerPlay(address _player, uint _amnt) external onlyValidatedGames() {
        uint _currentMiningDifficulty = ethWinToken_I.getCurrentMiningDifficulty();
        uint _tokens = _amnt.mul(_6d).div(_currentMiningDifficulty);
        ethWinToken_I.initTransfer(_player, _tokens);
    } // forumal tested below

    function debug_processPlayerPlay(uint _amnt) public view returns (uint _tokens) {
        uint _currentMiningDifficulty = ethWinToken_I.getCurrentMiningDifficulty();
        _tokens = _amnt.mul(_6d).div(_currentMiningDifficulty);

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



    EthWinToken internal ethWinToken_I = EthWinToken(0x4Dd63686Bd89dbada555F458C91045614c9Cd9C7);

    constructor() public {

        owner = address(msg.sender);
        externalValidator = owner; // DEBUG DEBUG  DEBUG ONLY!!!
        tokenDayFunds.push(tokenDayDetail(0,false, now));
    }


    function() payable external {   
    }
    function pay() public payable {
    }


    function getTokenDayDetail(uint256 _day) public view returns(int256      fundsAvail,
                    bool        processed,
                    uint256     startTS) {
        fundsAvail = tokenDayFunds[_day].fundsAvail;
        processed = tokenDayFunds[_day].processed;
        startTS = tokenDayFunds[_day].startTS;
    }

    // Owner only functions    
    function p_setNewOwner(address _addr) public onlyOwner {
        owner = _addr;
    }


    function p_settings(uint _type, uint _val, uint _val2) public onlyOwner {


        if(_type==1) {
            m_maxShockDrop = Percent.percent(_val, _val2);
        }
        if(_type==2) {
            shockDropPeriod = _val;
        }
        if(_type==3) {
            tokenFund24hrTokenSplit = Percent.percent(_val, _val2);
        }
        


    }

    function updateAllowedContracts(address _addr, bool _perm) public onlyOwner {
        allowedGamingContracts[_addr] = _perm;
    }

    function validateAllowedContracts(address _addr, bool _perm) public {
        require(msg.sender == externalValidator);
        allowedGamingContractsP3TValidated[_addr] = _perm;
    }

    function updateExternalValidator(address _newExternalValidator) public {
        require(msg.sender == externalValidator);
        externalValidator = _newExternalValidator;
    }



    function getContractBalance() internal view returns (uint) {
      return address(this).balance;
    }



}