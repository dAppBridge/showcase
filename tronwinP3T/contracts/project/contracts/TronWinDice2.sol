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




interface TronWinVault {
    function gamingFundPayment(address _to, uint _amnt, bool isTokenFundsEligible) external;
    function receiveExternalGameFund(bool isTokenFundsEligible) external payable;
    function getGameFund() external view returns (uint256);
    function get24hrTokenFund() external view returns (uint256);
    function maxShockDrop() external view returns (uint256);
    function tokenFundPayment(uint _tokenDay, address _to, uint _amnt) external;
    function processPlayerPlay(address _player, uint _amnt) external;
    function applyFundsAsTokenEligible(uint _amnt) external;
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
        uint256     timestamp,
        bytes32     serverHashHashed,
        bytes32     clientSeedHashed,
        uint256     nonce
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

    
    uint256 public minPlay = 5000000; // 5 trx
    
    uint8 public diceSize = 100;  
    uint8 public minRoll_under = 4;
    uint8 public maxRoll_under = 96;
    uint8 public minRoll_over = 4;
    uint8 public maxRoll_over = 96;
    uint256 private safety_maxConcurrentWins = 200;



    uint256 public m_houseEdge = 1;
    Percent.percent private m_maxWinPercent = Percent.percent(5, 1000); 
    Percent.percent private m_devPercent = Percent.percent(5, 100);  
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

    



    // mainnet TH5nhY38YJiWHrQ3ySvSa8xRLVxGihev2z
    TronWinVault tronwinVault_I = TronWinVault(0x2EF179D76dB21e2c7ec3590A964F5e91906a45f3);

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

    mapping (address => uint ) playerConcurrentWins;
    mapping (address => uint ) playerConcurrentLosses;


    uint public totalRolls;
    uint public totalWon;
    uint public totalLosses;


    struct PendingRoll {
        uint    rollValue;
        uint    rollAmnt;
        bool    isUnder;
        bool    isFinalized;
        uint    result;
        uint    winAmnt;
        bool    isWin;
        uint    pending_houseAmnt;
        uint    pending_winAmnt;
    }

    mapping (address => PendingRoll)    pendingRolls;
    address[] pendingPlayersWithRolls;

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
        //currentHash[_player].nonce = 0;
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

/*
    function pendingPlayerRollsLen() public view returns (uint) {
        //return pendingPlayersWithRolls.length;
        //return pendingRollsCount;
        return rollToComplete.length;
    }

    function getPendingPlayerAtPos(uint _id) public view returns (address _player, bool _finalized) {
        //return pendingPlayersWithRolls[_id];
        _player = rollToComplete[_id].player;
        _finalized  = rollToComplete[_id].finalized;
    }
*/

    function playerCanRoll(address _player) public view returns(bool){
        if(playersPendingBet[_player] == 0)
            return true;
        else
            return false;
        /*
        if(pendingRolls[_player].isFinalized == false && pendingRolls[_player].rollAmnt > 0) 
            return false;
        else
            return true;
        */
    }




    mapping(address => uint8) public playersPendingBet;
    //mapping(address => uint) playerRollAmnt;
    //mapping(address => bool) playerRollIsUnder;
    //mapping(address => uint) playerBetValue;

    function roll(uint8 _rollAmnt, uint8 _isUnder) public payable validPlayer notOnPause {
        require(msg.value >= minPlay, "Not enougth TRX played!");
        require( (_isUnder == 1 && _rollAmnt >= minRoll_under && _rollAmnt <= maxRoll_under)

                || (_isUnder ==0 && _rollAmnt >= minRoll_over && _rollAmnt <= maxRoll_over )
        , "Invalid Roll!");



//        require(
//                playersPendingBet[msg.sender] == 0
//                , "Still have a roll pending!");

        //if(currentHash[msg.sender].startTS == 0) {
        //    initHash(msg.sender);
        //}
        // hashes stored off-chain too


  
// cap the max win at our side if they try and cheat the system!      
//        uint _win_amnt = calcBetShorter(msg.value, _rollAmnt, true);
//        require(_win_amnt <= maxWin(), "Win amount too high!");


        
        //currentHash[msg.sender].nonce++;

        // stats stored off-chain
        //totalRolls++;
        //playerStaked[msg.sender] = playerStaked[msg.sender] + msg.value;
        //playerRolls[msg.sender] = playerRolls[msg.sender] + 1;

        // mine tokens...
        tronwinVault_I.processPlayerPlay(msg.sender,msg.value);

        tronwinVault_I.receiveExternalGameFund.value(msg.value)(true);
        // loss maintain should be handled by a separate contract having TWN and freezing them
        // 

    } // server side watches transaction logs for success logs and completes rolls from there



    // keep all stats off-chain...
    // 
    // tbl_dice_roll
    //  uint id
    //  string player
    //  string tx
    //  uint rollAmnt
    //  uint isUnder
    //  uint betAmnt
    //  uint timestamp
    //  bool isProcessed
    //  string processed_tx
    //
    // stats (Redis)
    //  total_rolls
    //  top_player_address
    //  top_player_WinAmnt
    //  total_won
    //  total_lost
    //  total_staked
    //  highest_win_steak
    //  highest_losing_steak
    //
    // Redis:
    // playersStats_[address]
    //  total_rolls
    //  total_won
    //  total_lost
    //  total_staked
    //  concurrent_wins
    //  concurrent_losses
    //  highest_win_steak
    //  highest_losing_steak
    //

    function finalizeBet(bytes32 clientSeed, bytes32 serverHash, 
                                address _player, uint _result,
                                uint _winAmnt) public onlyOwner {        

        //require(playersPendingBet[_player] > 0);


       // tronwinVault_I.applyFundsAsTokenEligible(_betAmnt);

       if(_winAmnt > 0)
            tronwinVault_I.gamingFundPayment(_player, _winAmnt, true);



        //totalWon +=  _winAmnt;
        //playerWinners[_player] += _winAmnt;

        //if(_winAmnt >= topWin) {
        //    topWin = _winAmnt;
        //    topPlayer = _player;
        //}

/*
        playerConcurrentWins[_player] = playerConcurrentWins[_player] +1;
        if(playerConcurrentWins[_player] >= safety_maxConcurrentWins){
            gamePaused = true;
            emit SafetyLimit (_player,playerConcurrentWins[_player]);
        }

        playerConcurrentLosses[_player] = 0;
*/

      //  emitRollResult(0, _player, _result, _isUnder, _rollValue, _betAmnt, _winAmnt);


        //playersPendingBet[_player] = 0;
        
    }

    function finalizeLoseBet(
                                address _player, 
                                bool _isUnder,
                                uint _rollValue, 
                                uint _result, 
                                uint _betAmnt, 
                                uint _winAmnt) public onlyOwner {        

        require(playersPendingBet[_player] == 1);



        if (_winAmnt > 0) {
            

            tronwinVault_I.applyFundsAsTokenEligible(_betAmnt);
            tronwinVault_I.gamingFundPayment(_player, _winAmnt, true);
            // result left in pot = house_amnt

            totalWon +=  _winAmnt;
            playerWinners[_player] += _winAmnt;

            if(_winAmnt >= topWin) {
                topWin = _winAmnt;
                topPlayer = _player;
            }

/*
            playerConcurrentWins[_player] = playerConcurrentWins[_player] +1;
            if(playerConcurrentWins[_player] >= safety_maxConcurrentWins){
                gamePaused = true;
                emit SafetyLimit (_player,playerConcurrentWins[_player]);
            }

            playerConcurrentLosses[_player] = 0;
*/

            emitRollResult(0, _player, _result, _isUnder, _rollValue, _betAmnt, _winAmnt);


        } else {
            //_win_amnt = 0;
            // is a loss...
            // x% goes into the main game fund to keep all games running
            // remainder is profit
            // m_lossMaintainPercent
            uint _lossMaintainVal = m_lossMaintainPercent.mul(_betAmnt);


            tronwinVault_I.applyFundsAsTokenEligible(_betAmnt - _lossMaintainVal);

            playerLosses[_player] = playerLosses[_player] + _betAmnt;
            totalLosses = totalLosses + _betAmnt;

            playerConcurrentWins[_player] = 0;

            emitRollResult(1, _player, _result, _isUnder, _rollValue, _betAmnt, 0);
        }

        playersPendingBet[_player] = 0;
        
    }

    function emitRollResult(uint16 event_type,
                            address _player,
                            uint _result, bool _isUnder, uint _rollValue,  uint _betAmnt, uint _win_amnt) internal {

       // PendingRoll storage _pendingRoll = pendingRolls[_player];
        bytes32 _serverHashHashed = currentHash[_player].serverHashHashed;
        bytes32 _clientSeedHashed = currentHash[_player].clientSeedHashed;
        uint _nonce = currentHash[_player].nonce;
        emit Action(event_type, _player, _rollValue, _isUnder, _betAmnt, _result, _win_amnt, now,
        _serverHashHashed,
        _clientSeedHashed, 
        _nonce);

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

    function calcBetShort(uint _value, uint _rollAmnt, bool _isUnder) public view returns (uint win_amnt, uint house_amnt) {

        uint multiplier_x1000;
        if(_isUnder == true){

            multiplier_x1000 = (100-m_houseEdge) * 1000 / _rollAmnt;
            house_amnt = (_value * (m_houseEdge * 1000 / _rollAmnt)/1000);

        } else {

            multiplier_x1000 = (100-m_houseEdge) * 1000 / (99 - _rollAmnt);
            house_amnt = (_value * (m_houseEdge * 1000 / (99-_rollAmnt))/1000);

        }

        win_amnt = (_value * multiplier_x1000) / 1000;
    }

    function calcBetShorter(uint _value, uint _rollAmnt, bool _isUnder) public view returns (uint win_amnt) {

     
        uint multiplier_x1000;
        if(_isUnder == true){

            multiplier_x1000 = (100-m_houseEdge) * 1000 / _rollAmnt;

        } else {

            multiplier_x1000 = (100-m_houseEdge) * 1000 / (99 - _rollAmnt);

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


    function updateTronWinVault(address _addr) public onlyOwner {
        tronwinVault_I = TronWinVault(_addr);
    }





    function p_setGamePaused(bool _gamePaused) public onlyOwner {
        gamePaused = _gamePaused;
    }


    function p_settings(uint _type, uint _val, uint _val2, uint8 _val8) public onlyOwner {

        if(_type==1) {
            m_houseEdge = _val;
        }
        if(_type==2){
            m_maxWinPercent = Percent.percent(_val, _val2);
        }
        if(_type==3)
            minPlay = _val;
        if(_type==4)
            diceSize = _val8;
        if(_type==5)
            minRoll_under = _val8;
        if(_type==6)
            maxRoll_under = _val8;
        if(_type==7)
            minRoll_over = _val8;
        if(_type==8)
            maxRoll_over = _val8;
        if(_type==9)
            safety_maxConcurrentWins = _val;
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