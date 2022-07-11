pragma solidity^0.4.25;

/**
*
*
*  Telegram: https://t.me/TronWinApp
*  Email: support (at) tronowin.app
*
* PLAY NOW: https://tronowin.app/
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




interface TronWinVault {
    function gamingFundPayment(address _to, uint _amnt) external;
    function receiveExternalGameFundAsToken(uint256 amountTokenEligible) external payable;
    function getGameFund() external view returns (uint256);
    function get24hrTokenFund() external view returns (uint256);
    function maxShockDrop() external view returns (uint256);
    function tokenFundPayment(uint _tokenDay, address _to, uint _amnt) external;
    function processPlayerPlay(address _player, uint _amnt) external;
}

interface TronWinDaily {
    function receiveExternalDivs(uint amnt) external;
}

interface TronWinBank {
    function deposit(uint _amnt) external;
} 

contract TronWinDice {
    
    using SafeMath for uint256;
    using Percent for Percent.percent;



    // Events
    // event_type
    // 0 == win bet under
    // 1 == win bet over
    // 2 == lose bet under
    // 3 == lose beet over

    event Action (
        uint16 indexed event_type,
        address indexed from,
        string      tx,
        uint256     result,
        uint256     win_amnt,
        uint256     timestamp,
        bytes32     serverHashHashed,
        bytes32     clientSeedHashed,
        uint256     nonce,
        uint        rollNumber,
        uint        betAmnt
        );

    event SafetyLimit (
        address indexed triggered_by,
        uint            wins
    );

    event pendingHashReady (
        address indexed player
    );
    event hashReady (
        address indexed player
    );



    address owner;
    address devAddress;


    bool public gamePaused = false;
    bool public limitedReferralsMode = true; 

    
    uint256 public minPlay = 20000000; // 20 TRX

    
    uint256 public diceSize = 100;  
    uint256 public minRoll_under = 4;
    uint256 public maxRoll_under = 96;
    uint256 public minRoll_over = 4;
    uint256 public maxRoll_over = 96;


    //uint256 private safety_maxConcurrentWins = 200;



    uint256 public m_houseEdge = 20;
    Percent.percent private m_maxWinPercent = Percent.percent(5, 1000); 

    Percent.percent private m_lossMaintainPercent = Percent.percent(30, 100); 
    // keep 30% of losing bets to build up the pot  



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

    



    
    TronWinVault tronwinVault_I = TronWinVault(0x82E5189D7FdC55947DFc42A9541a0B43DE615e5c); 
    TronWinDaily tronwinDaily_I = TronWinDaily(0x8307aCB4F0526f149C108D090978e0fd81D42368);
    TronWinBank tronwinBank_I = TronWinBank(0x1BE1B9cd9bB522A42529f42d9F8F6a6bf851bf91);


    constructor() public {

        owner = address(msg.sender);
        devAddress = owner;
    }


    function() payable external {   
    }
    function pay() public payable {
    }


    function maxWin() public view returns(uint) {
        return m_maxWinPercent.mul(tronwinVault_I.getGameFund());
    }


    // profile info
    mapping (address => uint ) playerWinners;
    mapping (address => uint ) playerStaked;
    mapping (address => uint ) playerLosses;

    mapping (address => uint ) playerRolls;

    //mapping (address => uint ) playerConcurrentWins;
    //mapping (address => uint ) playerConcurrentLosses;


    uint public totalRolls;
    uint public totalWon;
    uint public totalLosses;


    struct PendingRoll {
        uint    rollValue;
        uint    rollAmnt;
        bool    isUnder;
        bool    isFinalized;
        uint    posInPendingPlayersWithRolls;
        //uint    result;
        //uint    winAmnt;
        //bool    isWin;
        //uint    pending_houseAmnt;
        //uint    pending_winAmnt;
    }

    mapping (address => PendingRoll)    pendingRolls;
    address[] public pendingPlayersWithRolls;
    uint public pendingRollsCount;
    
    struct HashDetails{
        bytes32 serverHashHashed;
        bytes32 serverHashClear;
        bytes32 clientSeedHashed;
        uint    nonce;
        uint    startTS;
        bool    serverHashSet;
    }
    mapping (address => HashDetails) currentHash;
    mapping (address => HashDetails[]) previousHashes;
    mapping (address => HashDetails) pendingHash; // holding area for a playerUpdate
    address[] public pendingUpdatePlayers;
    function pendingUpdatePlayersLen() public view returns (uint) {
        return pendingUpdatePlayers.length;
    }
    function pendingUpdatePlayersAt(uint _pos) public view returns (address) {
        return pendingUpdatePlayers[_pos];
        // is new player call initServerHash
        // else: rotateHash
    }


    function playerUpdateSeed(bytes32 _newSeed) public validPlayer {
        //if(currentHash[msg.sender].startTS > 0) {
        //    rotateHash(msg.sender);
        //}
        pendingHash[msg.sender].clientSeedHashed = _newSeed;
        pendingUpdatePlayers.push(msg.sender);
        emit pendingHashReady(msg.sender);
    }

    function rotateHash(address _player, bytes32 _serverHashHashed, bytes32 _previousServerHashClear) public onlyOwner {
        require(pendingUpdatePlayers.length > 0);

        //address _player = pendingUpdatePlayers[pendingUpdatePlayers.length-1];

        previousHashes[_player].push(currentHash[_player]);
        previousHashes[_player][previousHashes[_player].length-1].serverHashClear = _previousServerHashClear;

        currentHash[_player].serverHashHashed = _serverHashHashed;
        currentHash[_player].startTS = now;
        currentHash[_player].clientSeedHashed = pendingHash[_player].clientSeedHashed;
        currentHash[_player].nonce = 0;

        delete pendingUpdatePlayers[pendingUpdatePlayers.length-1];
        pendingUpdatePlayers.length--;
        emit hashReady(_player);
    }
    function initServerHash(address _player, bytes32 _serverHashHashed) public onlyOwner {
        currentHash[_player].serverHashHashed = _serverHashHashed;
        currentHash[_player].serverHashSet = true;
        delete pendingUpdatePlayers[pendingUpdatePlayers.length-1];
        pendingUpdatePlayers.length--;
        emit hashReady(_player);
    }
    // init server seed generated on server when player first vists dice site
    // stored in db
    // stored in contract on first roll to save any DoS attacks
    //
    function initHash(address _player) internal {
        require(currentHash[_player].startTS == 0, "Player already init");
        currentHash[_player].clientSeedHashed = keccak256(abi.encodePacked(_player));
        currentHash[_player].startTS = now;
        currentHash[_player].nonce = 0;
        pendingUpdatePlayers.push(msg.sender);
        emit pendingHashReady(msg.sender);
    }


    function getPlayerHash(address _player) public view returns (bytes32 serverHashHashed, bytes32 clientSeedHashed, uint nonce, uint startTS) {
        serverHashHashed = currentHash[_player].serverHashHashed;
        clientSeedHashed = currentHash[_player].clientSeedHashed;
        nonce = currentHash[_player].nonce;
        startTS = currentHash[_player].startTS;
    }
    function playerPreviousHashesLen(address _player) public view returns (uint) {
        return previousHashes[_player].length;
    }
    function playerPreviousHash(address _player, uint _pos) public view returns (
            bytes32 serverHashHashed,
            bytes32 serverHashClear,
            bytes32 clientSeedHashed,
            uint nonce,
            uint startTS) {
        serverHashHashed = previousHashes[_player][_pos].serverHashHashed;
        serverHashClear = previousHashes[_player][_pos].serverHashClear;
        clientSeedHashed = previousHashes[_player][_pos].clientSeedHashed;
        nonce = previousHashes[_player][_pos].nonce;
        startTS = previousHashes[_player][_pos].startTS;
    }


    //mapping(address => bool) pendingPlayerRoll;
    mapping(address => uint) pendingPlayerRoll;
    mapping(address => uint16) playerLastRollType; // 0 == under, 1 == over


    function playerCanRoll(address _player) public view returns(bool){
        if(pendingPlayerRoll[_player] == 0) 
            return true;
        else
            return false;
    }

    uint betID;
    mapping(address => uint) playerBetID;
    event Roll(address player, uint rollAmnt, bool isUnder, uint betAmnt);


    function roll(uint _rollAmnt, bool _isUnder) public payable validPlayer notOnPause {
        require(msg.value >= minPlay, "Not enougth TRX played!");
        if(_isUnder)
            require(_rollAmnt >= minRoll_under && _rollAmnt <= maxRoll_under, "Invalid Roll!");
        else
            require(_rollAmnt >= minRoll_over && _rollAmnt <= maxRoll_over);


        require(pendingPlayerRoll[msg.sender] == 0, "Still have a roll pending!");


        if(currentHash[msg.sender].startTS == 0) {
            initHash(msg.sender);
        }
        

        uint _win_amnt;
        uint multiplier_x1000;

        if(_isUnder == true){
            multiplier_x1000 = (1000-m_houseEdge) * 100 / _rollAmnt;
        } else {
            multiplier_x1000 = (1000-m_houseEdge) * 100 / (99 - _rollAmnt);
        }
        _win_amnt = (msg.value * multiplier_x1000) / 1000;

        pendingPlayerRoll[msg.sender] = _rollAmnt;
        if(_isUnder)
            playerLastRollType[msg.sender] = 0;
        else
            playerLastRollType[msg.sender] = 1;

        require(_win_amnt <= maxWin(), "Win amount too high!");

        currentHash[msg.sender].nonce ++;
        

        emit Roll(msg.sender, _rollAmnt, _isUnder, msg.value);
    }

    function refundBet(address _p, uint _i) public onlyOwner {
        require(pendingPlayerRoll[msg.sender] > 0, "No bet pending!");
        _p.transfer(_i);
        pendingPlayerRoll[msg.sender] = 0;
    }

    // i1 = initial bet
    // i2 = win amount or energy coverage on losses
    // HOUSE SPLITS ON WINS: 
    // i3 = TWN amount  30%
    // i4 = 333 amount  10%
    // i5 = BANK amount 10%
    // 50% left for game fund
    // SPLIT ON LOSSES:
    // i2 = energy coverage = 40%
    // i3 = TWN = 10%
    // i4 = 333 = 5%
    // i5 = BANK = 5%
    // 40% left for game fund


    // 100 rolls at 95% chance of win...
    // bet 10 gives payout of .31 (Was 10.4 TRX )
    // == 95 wins
    // == 29.45 TRX 
    // == COST = 1000 TRX
    // Energy cost = 100 * 0.87 = 87TRX
    // house edge received 0.210 per roll
    // == 21 TRX
    // 5 LOSS ROLLS = 50 TRX
    // Energy = .25 = 12.5 == 25 TRX
    //
    //
    // 20 TRX ROLLS = payout of: .620 TRX
    // = 58.9 for a cost of 2000
    //
    // Energy cost = 100 * 0.87 = 87TRX
    //
    // house edge received 0.42 per roll
    // == 39.9 TRX on win rolls (payout 58.9 - need 20)
    //
    // 5 LOSS ROLLS = 100
    // Energy * .4 = 40 == 40 TRX
    //

    //
    // _i1 = 20000000
    // _i2 = 8000000
    // _i3 = 2000000
    // _i4 = 1000000
    // _i5 = 1000000

    function finalizePlayer(string _orig_tx,
                                address _p, 
                                bool _r1,
                                uint _res,
                                uint _i1,
                                uint _i2,
                                uint _i3,
                                uint _i4,
                                uint _i5) public onlyOwner {

        tronwinVault_I.receiveExternalGameFundAsToken.value(_i1)(_i3); 

        if(_r1) {
            
            // --------WIN--------
            tronwinVault_I.gamingFundPayment(_p, _i2); // players wins amount

            emitRollResult(0 + playerLastRollType[_p], _orig_tx,_p, _res, _i2, pendingPlayerRoll[_p], _i1);



        } else {

            // --------- LOSS ----------------
            tronwinVault_I.gamingFundPayment(owner, _i2);
            
            emitRollResult(2 + playerLastRollType[_p], _orig_tx,_p, _res, 0, pendingPlayerRoll[_p], _i1);

        }
        // send to 333
        tronwinDaily_I.receiveExternalDivs(_i4);

        // send to bank
        tronwinBank_I.deposit(_i5);

        tronwinVault_I.processPlayerPlay(_p, _i1);

        pendingPlayerRoll[_p] = 0;
    }

    function emitRollResult(uint16 event_type,
                            string _orig_tx,
                            address _player,
                            uint _result, uint _win_amnt, uint _rollNum, uint _betAmnt) internal {

        bytes32 _serverHashHashed = currentHash[_player].serverHashHashed;
        bytes32 _clientSeedHashed = currentHash[_player].clientSeedHashed;
        uint _nonce = currentHash[_player].nonce;
        emit Action(event_type, _player, _orig_tx, _result, _win_amnt, now,
        _serverHashHashed,
        _clientSeedHashed, 
        _nonce, _rollNum, _betAmnt);

    }


    function calcBet(uint _value, uint _rollAmnt, bool _isUnder) public view returns (uint multiplier_x1000, uint win_amnt, uint house_amnt) {


        if(_isUnder == true){

            multiplier_x1000 = (1000-m_houseEdge) * 100 / _rollAmnt;
            house_amnt = (_value * (m_houseEdge * 100 / _rollAmnt)/1000);

        } else {

            multiplier_x1000 = (1000-m_houseEdge) * 100 / (99 - _rollAmnt);
            house_amnt = (_value * (m_houseEdge * 100 / (99-_rollAmnt))/1000);

        }

        win_amnt = (_value * multiplier_x1000) / 1000;
    }

    function calcBetShort(uint _value, uint _rollAmnt, bool _isUnder) public view returns (uint win_amnt, uint house_amnt) {

        uint multiplier_x1000;
        if(_isUnder == true){

            multiplier_x1000 = (1000-m_houseEdge) * 100 / _rollAmnt;
            house_amnt = (_value * (m_houseEdge * 100 / _rollAmnt)/1000);

        } else {

            multiplier_x1000 = (1000-m_houseEdge) * 100 / (99 - _rollAmnt);
            house_amnt = (_value * (m_houseEdge * 100 / (99-_rollAmnt))/1000);

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
        _maxWin = m_maxWinPercent.mul(tronwinVault_I.getGameFund());
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


    function updatetronWinVault(address _addr) public onlyOwner {
        tronwinVault_I = TronWinVault(_addr);
    }
    function updateDaily(address _addr) public onlyOwner {
        tronwinDaily_I = TronWinDaily(_addr);
    }
    function updateBank(address _addr) public onlyOwner {
        tronwinBank_I = TronWinBank(_addr);
    }
    




    function p_setGamePaused(bool _gamePaused) public onlyOwner {
        gamePaused = _gamePaused;
    }





    function p_s(uint _type, uint _val, uint _val2) public onlyOwner {

        if(_type==1) {
            m_houseEdge = _val;
        }
        if(_type==2){
            m_maxWinPercent = Percent.percent(_val, _val2);
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

        if(_type==10)
            m_lossMaintainPercent = Percent.percent(_val, _val2);
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








}