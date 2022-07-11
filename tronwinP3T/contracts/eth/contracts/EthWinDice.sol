pragma solidity^0.5.4;

/**
*
*
*  Telegram: https://t.me/EthWinApp
*  Email: support (at) ethwin.app
*
* PLAY NOW: https://ethwin.app/
*  
* --- ETH WIN DICE ------------------------------------------------
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
* PLAY NOW: https://ethwin.app/
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




interface EthWinVault {
    function gamingFundPayment(address _to, uint _amnt) external;
    function receiveExternalGameFund(bool isTokenFundsEligible) external payable;
    function getGameFund() external view returns (uint256);
    function get24hrTokenFund() external view returns (uint256);
    function maxShockDrop() external view returns (uint256);
    function tokenFundPayment(uint _tokenDay, address _to, uint _amnt) external;

}



contract EthWinDice {
    
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

    
    uint256 public minPlay = 500000000000000; //  0.0005 ETH
    
    uint256 public diceSize = 100;  
    uint256 public minRoll_under = 4;
    uint256 public maxRoll_under = 96;
    uint256 public minRoll_over = 4;
    uint256 public maxRoll_over = 96;
    uint256 private safety_maxConcurrentWins = 10;



    uint256 public m_houseEdge = 3;
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

    



    // shasta 415fcced4f801cab7544bb3c6f8ec371d7c0569e82
    // mainnet 412fcbea5fc4b14c2c78ff0e65dd0ee8a77b5aa98e
    EthWinVault ethwinVault_I = EthWinVault(0x33d31BC048258327Bb7dE7CFE1Bacf79e11439BF);

    constructor() public {

        owner = address(msg.sender);
        devAddress = owner;

    }


    function() payable external {   
    }
    function pay() public payable {
    }


    function maxWin() public view returns(uint) {
        return m_maxWinPercent.mul(ethwinVault_I.getGameFund());
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
    }

    mapping (address => PendingRoll)    pendingRolls;
    address[] pendingPlayersWithRolls;

    struct HashDetails{
        bytes32 serverHashHashed;
        bytes16 serverHashClear;
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


    function playerUpdateSeed(bytes16 _newSeed) public validPlayer {
        //if(currentHash[msg.sender].startTS > 0) {
        //    rotateHash(msg.sender);
        //}
        pendingHash[msg.sender].clientSeedHashed = _newSeed;
        pendingUpdatePlayers.push(msg.sender);
        emit pendingHashReady(msg.sender);
    }

    function rotateHash(address _player, bytes32 _serverHashHashed, bytes16 _previousServerHashClear) public onlyOwner {
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
            bytes16 serverHashClear,
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
        return pendingPlayersWithRolls.length;
    }
    function getPendingPlayerAtPos(uint _id) public view returns (address) {
        return pendingPlayersWithRolls[_id];
    }

    function playerCanRoll(address _player) public view returns(bool){
        if(pendingRolls[_player].isFinalized == false && pendingRolls[_player].rollAmnt > 0) 
            return false;
        else
            return true;
    }

    function roll(uint _rollAmnt, bool _isUnder) public payable validPlayer notOnPause {
        require(msg.value >= minPlay, "Not enougth ETH played!");
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


        totalRolls++;
        playerStaked[msg.sender] = playerStaked[msg.sender].add(msg.value);
        playerRolls[msg.sender] = playerRolls[msg.sender]+1;

        pendingPlayersWithRolls.push(msg.sender);

    }

/*
    function finalizeBet() public onlyOwner {
        require(pendingPlayersWithRolls.length>0);

        address _player = pendingPlayersWithRolls[pendingPlayersWithRolls.length-1];

        finalizePlayer(_player);

        delete pendingPlayersWithRolls[pendingPlayersWithRolls.length-1];
        pendingPlayersWithRolls.length--;

    }
*/  
/*
    // working
    function genResult(uint diceSize, address _player) internal returns (uint random_val) {
        bytes16 _serverHash = currentHash[_player].serverHash;
        bytes16 _clientSeed = currentHash[_player].clientSeed;
        uint nonce = currentHash[_player].nonce;

        bytes32 _hash = keccak256(abi.encodePacked(
                    _serverHash, 
                    _clientSeed, 
                    nonce
                ));

        
        // _pos = steps of 5 (0,5,10,15 etc)
        bool _foundResult = false;
        uint _result;
        uint _pos = 0;

        while(_foundResult ==false) {
            _result = bytesToUint(fromHex(getHexString(_hash,0,_hash.length), _pos));
            if(_result < 1000000) {
                _foundResult = true;
            } else {
                _pos += 5;
                if(_pos > _hash.length) {
                    _result = 999999;
                    _foundResult = true;
                }
            }

        }
        
        random_val = _result % diceSize;

        currentHash[_player].nonce++;

    }
*/
/*
    // working - debug only routine
    function getPlayerHashAtPos(address _player, uint _pos) public view returns 
        (
            uint _result, 
            bytes32 _hash,
            string _hexString) 


        {
        bytes16 _serverHash = currentHash[_player].serverHash;
        bytes16 _clientSeed = currentHash[_player].clientSeed;
        uint nonce = currentHash[_player].nonce;


        _hash = keccak256(abi.encodePacked(
                    _serverHash, 
                    _clientSeed, 
                    nonce
                ));


        uint _testResult;


        _hexString = getHexString(_hash,0,_hash.length); // working

        bytes memory _fromHexBytes = fromHex(_hexString, _pos); // _pos = steps of 5 (0,5,10,15 etc)

        _result = bytesToUint(_fromHexBytes);
        return;


    }
*/

/*
    function getHexString(bytes32 value, uint8 _start, uint8 _len) pure internal returns (string) {
        bytes memory result = new bytes(_len * 2);
        string memory characterString = "0123456789abcdef";
        bytes memory characters = bytes(characterString);
        for (uint8 i = _start; i < _len; i++) {
            result[i*2] = characters[uint256((value[i] & 0xF0) >> 4)];
            if(i +1 <= _len)
                result[i*2 + 1] = characters[uint256(value[i] & 0xF)];



            //result[i * 2] = characters[uint256((value[i] & 0xF0) >> 4)];
            //result[i * 2 + 1] = characters[uint256(value[i] & 0xF)];
            //if(i +1 < _len)
            //    result[i * 2 + 1] = characters[uint256(value[i] & 0xF)];
        }
        return string(result);
    }
    function fromHex(string s, uint _startPos) internal pure returns (bytes) {
        bytes memory ss = bytes(s);
        require(ss.length%2 == 0); // length must be even
        bytes memory r = new bytes(ss.length/2+1);


        //left pad with 0 as we are using 5 bytes and need even 6
        r[0] = byte(fromHexChar(0) + fromHexChar(uint(ss[_startPos])));

        //d3
        r[1] = byte(fromHexChar(uint(ss[_startPos+1])) * 16 +
                        fromHexChar(uint(ss[_startPos+2])));

        r[2] = byte(fromHexChar(uint(ss[_startPos+3])) * 16 +
                        fromHexChar(uint(ss[_startPos+4])));

        return r;
    }
    function fromHexChar(uint c) internal pure returns (uint) {
        if (byte(c) >= byte('0') && byte(c) <= byte('9')) {
            return c - uint(byte('0'));
        }
        if (byte(c) >= byte('a') && byte(c) <= byte('f')) {
            return 10 + c - uint(byte('a'));
        }
        if (byte(c) >= byte('A') && byte(c) <= byte('F')) {
            return 10 + c - uint(byte('A'));
        }
    }
    function bytesToUint(bytes b) internal returns (uint256){
        uint256 number;
        //for(uint i=0;i<b.length;i++){
        for(uint i=0;i<3;i++){
            //number = number + uint(b[i])*(2**(8*(b.length-(i+1))));
            number = number + uint(b[i])*(2**(8*(3-(i+1))));
        }
        return number;
    }
*/
/*
// debug only routine - working
    function debug_genResult() public returns (uint result) {
        (result) =  genResult(diceSize, msg.sender);
    }
*/

    function finalizePlayer(address _player, uint _result) public onlyOwner {        
        PendingRoll memory _pendingRoll = pendingRolls[_player];

        require(_pendingRoll.isFinalized == false);

        uint _multiplier_x1000;
        uint _house_amnt;
        uint _win_amnt;

        (_multiplier_x1000, _win_amnt, _house_amnt) = 
                calcBet(_pendingRoll.rollValue, _pendingRoll.rollAmnt, _pendingRoll.isUnder);


        ethwinVault_I.receiveExternalGameFund.value(_pendingRoll.rollValue.sub(_house_amnt))(true);

        //uint _result;
        //(_result) = genResult(diceSize, _player);

        if(  (_pendingRoll.isUnder && _result < _pendingRoll.rollAmnt) 
                    || (_pendingRoll.isUnder == false && _result > _pendingRoll.rollAmnt)  ) {
            
            // house amount now goes to gameFund and token holders get 50%
            //
            //devAddress.transfer(_house_amnt);
            //tronwinVault_I.gamingFundPayment(_player, _win_amnt);

            totalWon = totalWon.add(_win_amnt);
            playerWinners[_player] = playerWinners[_player].add(_win_amnt);

            if(_win_amnt > topWin) {
                topWin = _win_amnt;
                topPlayer = _player;
            }

            playerConcurrentWins[_player] = playerConcurrentWins[_player] +1;
            if(playerConcurrentWins[_player] >= safety_maxConcurrentWins){
                gamePaused = true;
                emit SafetyLimit (_player,playerConcurrentWins[_player]);
            }

            playerConcurrentLosses[_player] = 0;

            emit Action(0, _player, _pendingRoll.rollValue, _pendingRoll.isUnder, _pendingRoll.rollAmnt, _result, _win_amnt, now);



        } else {
            _win_amnt = 0;
            playerLosses[_player] = playerLosses[_player].add(_pendingRoll.rollValue);
            totalLosses = totalLosses.add(_pendingRoll.rollValue);

            //devAddress.transfer(_house_amnt);
            //uint _devHouseLoss = m_devPercent.mul(_pendingRoll.rollValue.sub(_house_amnt));
            //tronwinVault_I.gamingFundPayment(devAddress, _devHouseLoss);

            playerConcurrentWins[_player] = 0;

            emit Action(1, _player, _pendingRoll.rollValue, _pendingRoll.isUnder, _pendingRoll.rollAmnt, _result, 0, now);
        }

        pendingRolls[_player].isFinalized = true;
        currentHash[_player].nonce++;
        
        delete pendingPlayersWithRolls[pendingPlayersWithRolls.length-1];
        pendingPlayersWithRolls.length--;

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
        _maxWin = m_maxWinPercent.mul(ethwinVault_I.getGameFund());
    }



    
    // Owner only functions    
    function p_setNewOwners(uint16 _type, address _addr) public onlyOwner {
        if(_type==0){
            owner = _addr;
        }
        if(_type==1){
            devAddress = address(uint160(address(_addr)));
        }
    }


    function updateTronWinVault(address _addr) public onlyOwner {
        ethwinVault_I = EthWinVault(_addr);
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
        if(_type==9)
            safety_maxConcurrentWins = _val;
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