pragma solidity^0.4.25;

/**
*
*
*  Telegram: https://t.me/TronWinApp
*  Email: support (at) tronwin.app
*
* PLAY NOW: https://tronwin.app/
*  
* --- TRON WIN DICE ------------------------------------------------
*
*
*
*
* *
*
* --- COPYRIGHT ----------------------------------------------------------------
* 
*   This source code is provided for verification and audit purposes only and 
*   no license of re-use is granted.
*   
*   (C) Copyright 2019 TronWin - A FutureConcepts Production
*   
*   
*   Sub-license, white-label, solidity, Eth, Tron, Tomo development enquiries 
*   please contact support (at) tronwin.app
*   
*   
* PLAY NOW: https://tronwin.app/
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


interface TronWin {
    function gamingFundPayment(address _to, uint _amnt) external;
    function receiveExternalGameFund() external payable;
    function getGameFund() external view returns (uint256);
}





contract TronWinDice {
    
    using SafeMath for uint256;
    using Percent for Percent.percent;



    // Events
    // event_type
    // 0 = win bet, 1 = lose bet
    event Action (
        uint16 indexed event_type,
        address indexed from,
        uint256     amnt,
        bool        bet_under,
        uint256     roll_amnt,
        uint256     result,
        uint256     win_amnt,
        uint256     timestamp
        );





    address owner;
    address devAddress;

    // RANDO
    // settings
    uint16[] private randos;
    uint256 private max_randos = 50000000;
    mapping (address => uint256) user_idx;

    bool public gamePaused = false;
    bool public limitedReferralsMode = true; 

    
    uint256 public minPlay = 5 trx;
    
    uint256 public diceSize = 100;  
    uint256 public minRoll_under = 4;
    uint256 public maxRoll_under = 96;
    uint256 public minRoll_over = 4;
    uint256 public maxRoll_over = 96;
    



    uint256 public m_houseEdge = 1;
    Percent.percent private m_maxWinPercent = Percent.percent(5, 1000); 
    Percent.percent private m_devPercent = Percent.percent(5, 100);  



    modifier validPlayer() {
        require(msg.sender == tx.origin);
        _;
    }






    
    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier notOnPause() {
        require(gamePaused == false, "Game Paused");
        _;
    }


    address public topPlayer;
    uint public topWin;

    



    // shasta 41cda217aa9649b70928c8a95408fbb605dea6f70c
    // mainnet 412fcbea5fc4b14c2c78ff0e65dd0ee8a77b5aa98e
    TronWin tronWin_I;


    constructor() public {

        owner = address(msg.sender);
        devAddress = owner;
        tronWin_I = TronWin(0x2fcbea5fc4b14c2c78ff0e65dd0ee8a77b5aa98e);
    }


    function() payable public {   
    }
    function pay() public payable {
    }


    function maxWin() public view returns(uint) {
        return m_maxWinPercent.mul(tronWin_I.getGameFund());
    }


    // profile info
    mapping (address => uint ) playerWinners;
    mapping (address => uint ) playerStaked;
    mapping (address => uint ) playerLosses;

    mapping (address => uint ) playerRolls;


    uint public totalRolls;
    uint public totalWon;
    uint public totalLosses;


    function roll(uint _rollAmnt, bool _isUnder) public payable validPlayer notOnPause returns (uint _result, uint _win_amnt) {
        require(msg.value >= minPlay, "Not enougth TRX played!");
        if(_isUnder)
            require(_rollAmnt >= minRoll_under && _rollAmnt <= maxRoll_under, "Invalid Roll!");
        else
            require(_rollAmnt >= minRoll_over && _rollAmnt <= maxRoll_over);


        uint _multiplier_x1000;
        uint _house_amnt;

        (_multiplier_x1000, _win_amnt, _house_amnt) = calcBet(msg.value, _rollAmnt, _isUnder);

        require(_win_amnt <= maxWin(), "Win amount too high!");


        _result = getRandoUInt(diceSize, msg.sender);
        totalRolls++;
        playerStaked[msg.sender] = playerStaked[msg.sender].add(msg.value);
        playerRolls[msg.sender] = playerRolls[msg.sender]+1;

        tronWin_I.receiveExternalGameFund.value(msg.value.sub(_house_amnt))();

        if(  (_isUnder && _result < _rollAmnt) || (_isUnder == false && _result > _rollAmnt)  ) {
            
            devAddress.transfer(_house_amnt);
            
            tronWin_I.gamingFundPayment(msg.sender, _win_amnt);
            totalWon = totalWon.add(_win_amnt);
            playerWinners[msg.sender] = playerWinners[msg.sender].add(_win_amnt);

            if(_win_amnt > topWin) {
                topWin = _win_amnt;
                topPlayer = msg.sender;
            }
            emit Action(0, msg.sender, msg.value, _isUnder, _rollAmnt,_result, _win_amnt, now);

        } else {
            _win_amnt = 0;
            playerLosses[msg.sender] = playerLosses[msg.sender].add(msg.value);
            totalLosses = totalLosses.add(msg.value);
            devAddress.transfer(_house_amnt);

            uint _devHouseLoss = m_devPercent.mul(msg.value.sub(_house_amnt));
            tronWin_I.gamingFundPayment(devAddress, _devHouseLoss);

            emit Action(1, msg.sender, msg.value, _isUnder, _rollAmnt, _result, 0, now);
        }



    }

    function calcBet(uint _value, uint _rollAmnt, bool _isUnder) public view returns (uint multiplier_x1000, uint win_amnt, uint house_amnt) {


        if(_isUnder == true){

            multiplier_x1000 = (100-m_houseEdge) * 1000 / _rollAmnt;
            house_amnt = (_value * (m_houseEdge * 1000 / _rollAmnt)/1000);

        } else {

            multiplier_x1000 = (100-m_houseEdge) * 1000 / (99 - _rollAmnt);
            house_amnt = (_value * (m_houseEdge * 1000 / (99-_rollAmnt))/1000);

        }

        win_amnt = (_value * multiplier_x1000) / 1000;


    }



    function getProfile(address _player) public view returns(uint totalPlayerRolls, uint winAmnt, uint stakedAmnt, uint lossAmnt) {
        totalPlayerRolls = playerRolls[_player];
        winAmnt = playerWinners[_player];
        stakedAmnt = playerStaked[_player];
        lossAmnt = playerLosses[_player];
    }
    function gameStats() public view returns (
                uint _totalRolls,
                uint _totalWon,
                uint _totalLosses,
                uint _topWin,
                address _topPlayer,
                uint _maxWin
            ) {
        _totalRolls = totalRolls;
        _totalWon = totalWon;
        _totalLosses = totalLosses;
        _topWin = topWin;
        _topPlayer = topPlayer;
        _maxWin = m_maxWinPercent.mul(tronWin_I.getGameFund());
    }



    
    // Owner only functions    
    function p_setNewOwners(uint16 _type, address _addr) public onlyOwner {
        if(_type==0){
            owner = _addr;
        }
        if(_type==1){
            devAddress = _addr;    
        }
    }


    function updateTronWin(address _addr) public onlyOwner {
        tronWin_I = TronWin(_addr);
    }





    function p_setGamePaused(bool _gamePaused) public onlyOwner {
        gamePaused = _gamePaused;
    }






    function p_settings(uint _type, uint _val) public onlyOwner {

        if(_type==1) {
            m_houseEdge = _val;
        }
        if(_type==2){
            m_maxWinPercent = Percent.percent(_val, 1000);
        }
        if(_type==3)
            minPlay = _val;
        if(_type==4)
            diceSize = _val;
        if(_type==5)
            minRoll_under = _val;
        if(_type==6)
            maxRoll_under = _val;
        if(_type==7)
            minRoll_over = _val;
        if(_type==8)
            maxRoll_over = _val;

    }







    function getContractBalance() internal view returns (uint) {
      return address(this).balance;
    }



    // Util functions
    function min(uint x, uint y) internal pure returns (uint z) {
        return x <= y ? x : y;
    }

    function percent(uint numerator, uint denominator, uint precision) internal pure returns(uint quotient) {
         // caution, check safe-to-multiply here
        uint _numerator  = numerator * 10 ** (precision+1);
        // with rounding of last digit
        uint _quotient =  ((_numerator / denominator) + 5) / 10;
        return ( _quotient);
    }



    
    uint op;
    function gameOp() external {
        op++;
    }







    // RANDO FUNCS
    //https://qrng.anu.edu.au/API/api-demo.php
    function pushRandos(uint16[] memory _newRandos) public onlyOwner {
        for(uint c=0; c< _newRandos.length; c++) {
            randos.push(_newRandos[c]);
            if(randos.length > max_randos) {
                delete randos[0];    
            }
        }
    }
    function setMaxRanods(uint256 _max_randos) public onlyOwner {
        max_randos = _max_randos;
    }


    function getRandoUInt(uint _max, address _sender) public returns(uint random_val) {
        random_val = getRando(_max, _sender);
    }

    // helpers...
    function getRandoUInts(uint _max, address _sender, uint _count) public returns(uint[10000] memory random_vals) {

        for(uint c=0; c< _count; c++) {
            random_vals[c] = getRando(_max, _sender);
        }

    }

    function getRando(uint _max, address _sender) internal returns (uint random_val) {
        random_val = (
            uint(keccak256(
                        abi.encodePacked(
                                    randos[user_idx[_sender]], 
                                    user_idx[_sender], 
                                    _sender,
                                    blockhash(getBlockOffset()))
                                    )
                         ) % _max);

        user_idx[_sender]++;

        if(user_idx[_sender]>=randos.length)
            user_idx[_sender]=0;    
    }

    function getBlockOffset() internal view returns (uint) {
        uint _randosUint;
        if(user_idx[msg.sender] > 0)
            _randosUint = randos[user_idx[msg.sender]-1];
        else 
            _randosUint = randos[user_idx[msg.sender]];

        uint _offset =  (uint(keccak256(
                        abi.encodePacked(
                                    _randosUint,
                                    msg.sender,
                                    blockhash(block.number)
                                    )
                         )) % 255);

        return block.number - (_offset);
    }

}