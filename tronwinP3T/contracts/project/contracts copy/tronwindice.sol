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
    
    uint256 public diceSize = 100;  
    uint256 public minRoll_under = 4;
    uint256 public maxRoll_under = 96;
    uint256 public minRoll_over = 4;
    uint256 public maxRoll_over = 96;
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
    TronWinVault tronwinVault_I = TronWinVault(0x4e07817E06Ed90B8d05cd61fFb1AA139228eA8AA);

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

    function playerCanRoll(address _player) public view returns(bool){
        if(pendingRolls[_player].isFinalized == false && pendingRolls[_player].rollAmnt > 0) 
            return false;
        else
            return true;
    }




    function roll(uint _rollAmnt, bool _isUnder) public payable validPlayer notOnPause {
        require(msg.value >= minPlay, "Not enougth TRX played!");
        if(_isUnder)
            require(_rollAmnt >= minRoll_under && _rollAmnt <= maxRoll_under, "Invalid Roll!");
        else
            require(_rollAmnt >= minRoll_over && _rollAmnt <= maxRoll_over);

        require(
                pendingRolls[msg.sender].isFinalized == true
                || 
                pendingRolls[msg.sender].rollAmnt == 0
                , "Still have a roll pending!");


        if(currentHash[msg.sender].startTS == 0) {
            initHash(msg.sender);
        }


        uint _multiplier_x1000;
        uint _house_amnt;
        uint _win_amnt;

        (_multiplier_x1000, _win_amnt, _house_amnt) = calcBet(msg.value, _rollAmnt, _isUnder);

        require(_win_amnt <= maxWin(), "Win amount too high!");


        pendingRolls[msg.sender].rollValue = msg.value;
        pendingRolls[msg.sender].rollAmnt = _rollAmnt;
        pendingRolls[msg.sender].isUnder = _isUnder;
        pendingRolls[msg.sender].isFinalized = false;
        pendingRolls[msg.sender].result = 0;
        pendingRolls[msg.sender].winAmnt = 0;
        pendingRolls[msg.sender].pending_houseAmnt = _house_amnt;
        pendingRolls[msg.sender].pending_winAmnt = _win_amnt;

        totalRolls++;
        playerStaked[msg.sender] = playerStaked[msg.sender].add(msg.value);
        playerRolls[msg.sender] = playerRolls[msg.sender]+1;

        //pendingPlayersWithRolls.push(msg.sender);
        //pendingRollsCount++;



        rollToComplete.push(RollsToComplete(msg.sender,false));
        addressPositionInRollToComplete[msg.sender] = rollToComplete.length-1;

        // mine tokens...
        tronwinVault_I.processPlayerPlay(msg.sender,msg.value);

        if(clean) {
            for(uint c=0; c<rollToComplete.length; c++) {
                if(rollToComplete[c].finalized==true && c+1 < rollToComplete.length) {
                    rollToComplete[c] = rollToComplete[c+1];
                } else {
                    delete rollToComplete[c];
                }
            }
        }

    }

    function cleanCompleted() public {
        for(uint c=0; c<rollToComplete.length; c++) {
            if(rollToComplete[c].finalized==true && c+1 < rollToComplete.length) {
                rollToComplete[c] = rollToComplete[c+1];
            } else {
                delete rollToComplete[c];
            }
        }
    }

    bool public clean = true;

    struct RollsToComplete {
        address     player;
        bool        finalized;
    }
    RollsToComplete[] public rollToComplete;
    mapping(address => uint) addressPositionInRollToComplete;


    function finalizePlayer(address _player, uint _result) public onlyOwner {        
        PendingRoll storage _pendingRoll = pendingRolls[_player];

        require(_pendingRoll.isFinalized == false);


        //uint _multiplier_x1000;
        //uint _house_amnt;
        //uint _win_amnt;

        //(_multiplier_x1000, _win_amnt, _house_amnt) = 
        //        calcBet(_pendingRoll.rollValue, _pendingRoll.rollAmnt, _pendingRoll.isUnder);




        if(  (_pendingRoll.isUnder && _result < _pendingRoll.rollAmnt) 
                    || (_pendingRoll.isUnder == false && _result > _pendingRoll.rollAmnt)  ) {
            

            tronwinVault_I.receiveExternalGameFund.value(_pendingRoll.rollValue)(true);
            tronwinVault_I.gamingFundPayment(_player, _pendingRoll.pending_winAmnt, true);
            // result left in pot = house_amnt

            totalWon = totalWon.add(_pendingRoll.pending_winAmnt);
            playerWinners[_player] = playerWinners[_player].add(_pendingRoll.pending_winAmnt);

            if(_pendingRoll.pending_winAmnt > topWin) {
                topWin = _pendingRoll.pending_winAmnt;
                topPlayer = _player;
            }

            playerConcurrentWins[_player] = playerConcurrentWins[_player] +1;
            if(playerConcurrentWins[_player] >= safety_maxConcurrentWins){
                gamePaused = true;
                emit SafetyLimit (_player,playerConcurrentWins[_player]);
            }

            playerConcurrentLosses[_player] = 0;


            emitRollResult(0, _player, _result, _pendingRoll.pending_winAmnt);


        } else {
            //_win_amnt = 0;
            // is a loss...
            // x% goes into the main game fund to keep all games running
            // remainder is profit
            // m_lossMaintainPercent
            uint _lossMaintainVal = m_lossMaintainPercent.mul(_pendingRoll.rollValue);


            tronwinVault_I.receiveExternalGameFund.value(_lossMaintainVal)(false);
            // remainder is profit for token holders!
            tronwinVault_I.receiveExternalGameFund.value(_pendingRoll.rollValue.sub(_lossMaintainVal))(true);

            playerLosses[_player] = playerLosses[_player].add(_pendingRoll.rollValue);
            totalLosses = totalLosses.add(_pendingRoll.rollValue);


            playerConcurrentWins[_player] = 0;

            emitRollResult(1, _player, _result, 0);
        }

        _pendingRoll.isFinalized = true;
        currentHash[_player].nonce++;
        

        /*
        // find the pos and delete...
        uint c;
        bool haveFound = false;
        for(c = 0; c < pendingPlayersWithRolls.length; c++) {
            if(pendingPlayersWithRolls[c] == _player && haveFound == false) {
                delete pendingPlayersWithRolls[c];
                haveFound = true;
            } 
            if(haveFound && c+1 < pendingPlayersWithRolls.length) {
                pendingPlayersWithRolls[c] = pendingPlayersWithRolls[c+1];
            }
        
        }
        pendingPlayersWithRolls.length--;
        */
        //delete pendingPlayersWithRolls[pendingPlayersWithRolls.length-1];
        //pendingPlayersWithRolls.length--;



        rollToComplete[addressPositionInRollToComplete[_player]].finalized = true;
        
    }

    function emitRollResult(uint16 event_type,
                            address _player,
                            uint _result, uint _win_amnt) internal {

        PendingRoll memory _pendingRoll = pendingRolls[_player];
        bytes32 _serverHashHashed = currentHash[_player].serverHashHashed;
        bytes32 _clientSeedHashed = currentHash[_player].clientSeedHashed;
        uint _nonce = currentHash[_player].nonce;
        emit Action(event_type, _player, _pendingRoll.rollValue, _pendingRoll.isUnder, _pendingRoll.rollAmnt, _result, _win_amnt, now,
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






    function p_settings(uint _type, uint _val, uint _val2) public onlyOwner {

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