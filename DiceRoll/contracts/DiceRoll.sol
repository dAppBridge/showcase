pragma solidity ^0.4.16;

import "github.com/dAppBridge/dAppBridge-Client/dAppBridge-Client_Ropsten.sol";

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

contract DiceRoll is clientOfdAppBridge {
    
    using SafeMath for uint256;
    
    string public randomAPI_url;
    string internal randomAPI_key;
    string internal randomAPI_extract;
    
    struct playerDiceRoll {
        bytes32     betID;
        address     playerAddr;
        uint256     rollUnder;
        uint256     stake;
        uint256     profit;
        uint256     win;
        bool        paid;
        uint256     result;
        uint256     timestamp;
    }
    

    mapping (bytes32 => playerDiceRoll) public playerRolls; // limit to last 1000?
    //mapping(address => bytes32[]) public playerBetIdMap;
    mapping (address => uint256) playerPendingWithdrawals;
    //bytes32[] public allBetIdMap; // restricted to latest 1000

    address public owner;
    uint256 public contractBalance;
    bool public game_paused;
    uint256 minRoll;
    uint256 maxRoll;
    uint256 minBet;
    uint256 maxBet;
    uint256 public minRollUnder;
    uint256 public houseEdge; // 96 = 4%
    uint256 public totalUserProfit; // stats
    uint256 public totalWins; // stats
    uint256 public totalLosses; // stats
    uint256 public totalWinAmount;
    uint256 public totalLossAmount;
    uint256 public totalFails;
    uint256 internal totalProfit;
    uint256 public maxMultiRolls;
    uint256 public gameNumber;
    
    mapping(uint256 => bool) public permittedRolls;
    
    uint public maxPendingPayouts; // Max potential payments


    function private_getGameState() public view returns(uint256 _contractBalance,
        bool _game_paused,
        uint256 _minRoll,
        uint256 _maxRoll,
        uint256 _minBet,
        uint256 _maxBet,
        uint256 _houseEdge,
        uint256 _totalUserProfit,
        uint256 _totalWins,
        uint256 _totalLosses,
        uint256 _totalWinAmount,
        uint256 _totalLossAmount,
        uint256 _liveMaxBet,
        uint256 _totalFails) {
        _contractBalance = contractBalance;
        _game_paused = game_paused;
        _minRoll = minRoll;
        _maxRoll = maxRoll;
        _minBet = minBet;
        _maxBet = maxBet;
        _houseEdge = houseEdge;
        _totalUserProfit = totalUserProfit;
        _totalWins = totalWins;
        _totalLosses = totalLosses;
        _totalWinAmount = totalWinAmount;
        _totalLossAmount = totalLossAmount;
        _liveMaxBet = getLiveMaxBet();
        _totalFails = totalFails;
    
    }
    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }
    modifier gameActive() {
        require (game_paused == false);
        _;
    }
    modifier validBet(uint256 betSize, uint256 rollUnder) {
        require(rollUnder > minRoll);
        require(rollUnder < maxRoll);
        require(betSize <= maxBet);
        require(betSize >= minBet);
        require(permittedRolls[rollUnder] == true);
        
        uint256 potential_profit = (msg.value * (houseEdge / rollUnder)) - msg.value;
        require(maxPendingPayouts.add(potential_profit) <= address(this).balance);
        
        _;
    }
    
    modifier validBetMulti(uint256 betSize, uint256 rollUnder, uint256 number_of_rolls) {
        require(rollUnder > minRoll);
        require(rollUnder < maxRoll);
        require(betSize <= maxBet);
        require(betSize >= minBet);
        require(number_of_rolls <= maxMultiRolls);
        require(permittedRolls[rollUnder] == true);
        
        uint256 potential_profit = (msg.value * (houseEdge / rollUnder)) - msg.value;
        require(maxPendingPayouts.add(potential_profit) <= address(this).balance);
        
        _;
    }



    function getLiveMaxBet() public view returns(uint256) {
        uint256 currentAvailBankRoll = address(this).balance.sub(maxPendingPayouts);
        uint256 divisor = houseEdge.div(minRollUnder);
        uint256 liveMaxBet = currentAvailBankRoll.div(divisor);
        if(liveMaxBet > maxBet)
            liveMaxBet = maxBet;
        return liveMaxBet;
    }

    function getBet(bytes32 _betID) public view returns(bytes32 betID,
        address     playerAddr,
        uint256     rollUnder,
        uint256     stake,
        uint256     profit,
        uint256     win,
        bool        paid,
        uint256     result,
        uint256     timestamp){
        playerDiceRoll memory _playerDiceRoll = playerRolls[_betID];
        betID = _betID;
        playerAddr = _playerDiceRoll.playerAddr;
        rollUnder = _playerDiceRoll.rollUnder;
        stake = _playerDiceRoll.stake;
        profit = _playerDiceRoll.profit;
        win = _playerDiceRoll.win;
        paid = _playerDiceRoll.paid;
        result = _playerDiceRoll.result;
        timestamp = _playerDiceRoll.timestamp;
        
    }


    


    function getOwner() external view returns(address){
        return owner;
    }

    function getBalance() external view returns(uint256){
        address myAddress = this;
        return myAddress.balance;
    }
    
    

    constructor() public payable {
        owner = msg.sender;
        houseEdge = 96; // 4% commission to us on wins
        contractBalance = msg.value;
        totalUserProfit = 0;
        totalWins = 0;
        totalLosses = 0;
        minRoll = 1;
        maxRoll = 100;
        minBet = 200000000000000;
        maxBet = 4000000000000000;
        randomAPI_url = "https://api.random.org/json-rpc/1/invoke";
        randomAPI_key = "7d4ab655-e778-4d9f-815a-98fd518908bd";
        randomAPI_extract = "result.random.data";
        //permittedRolls[10] = true;
        permittedRolls[20] = true;
        permittedRolls[30] = true;
        permittedRolls[40] = true;
        permittedRolls[50] = true;
        permittedRolls[60] = true;
        //permittedRolls[70] = true;
        minRollUnder = 20;
        totalProfit = 0;
        totalWinAmount = 0;
        totalLossAmount = 0;
        totalFails = 0;
        maxMultiRolls = 5;
        gameNumber = 0;
    }

  //  event DiceRollResult(bytes32 indexed betID, address indexed playerAddress, uint256 rollUnder, uint256 result);
    
    event DiceRollResult_failedSend(
            bytes32 indexed betID,
            address indexed playerAddress,
            uint256 rollUnder,
            uint256 result,
            uint256 amountToSend
        );
        

    // totalUserProfit : Includes the original stake
    // totalWinAmount : Is just the win amount (Does not include orig stake)
    // DELETE once complete -> past bets should be accessed via logs??
    event DiceRollResult(
            bytes32 indexed betID, 
            address indexed playerAddress, 
            uint256 rollUnder, 
            uint256 result,
            uint256 stake,
            uint256 profit,
            uint256 win,
            bool paid,
            uint256 timestamp);
    
    function callback(bytes32 key, string callbackData) external payable only_dAppBridge {
        require(playerRolls[key].playerAddr != address(0x0));
        require(playerRolls[key].win == 2); // we've already process it if so!

        playerRolls[key].result = parseInt(callbackData);
        
        uint256 _totalWin = playerRolls[key].stake.add(playerRolls[key].profit); // total we send back to playerRolls
        
        // if result == 0 then failed response from callback == refund!?!?!
        
        maxPendingPayouts = maxPendingPayouts.sub(playerRolls[key].profit); // take it out of the pending payouts now
        
        
        
        if(playerRolls[key].result == 0){
            // fail on diceroll... refund...
            playerRolls[key].win=0;
            totalFails = totalFails.add(1);
            //totalLosses = totalLosses.add(1);
            //totalLossAmount = totalLossAmount.add(playerRolls[key].profit);
            //contractBalance = contractBalance.add(_totalWin.sub(1)); // how much we have won/lost
            playerRolls[key].paid = true;
            
            // refund the original stake...
            if(!playerRolls[key].playerAddr.send(playerRolls[key].stake)){
                playerRolls[key].paid = false;
                
                
                
                emit DiceRollResult(key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result,
                    playerRolls[key].stake, 0, 0, false, now);
                
                emit DiceRollResult_failedSend(
                    key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result, playerRolls[key].stake );
                    
               playerPendingWithdrawals[playerRolls[key].playerAddr] = playerPendingWithdrawals[playerRolls[key].playerAddr].add(playerRolls[key].stake);
               
               delete playerRolls[key];
            } else {
                
                emit DiceRollResult(key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result,
                    playerRolls[key].stake, 0, 0, true, now);
                
                delete playerRolls[key];
            }

            return;
            
        } else {
        
            if(playerRolls[key].result < playerRolls[key].rollUnder) {
                // win
                playerRolls[key].win=1;
                contractBalance = contractBalance.sub(playerRolls[key].profit); // how much we have won/lost
                totalUserProfit = totalUserProfit.add(_totalWin); // game stats
                totalWins = totalWins.add(1);
                totalWinAmount = totalWinAmount.add(playerRolls[key].profit);
                playerRolls[key].paid = true;
                
                if(!playerRolls[key].playerAddr.send(_totalWin)){
                    // failed to send - need to retry so add to playerPendingWithdrawals
                    playerRolls[key].paid = false;
                    
                    emit DiceRollResult(key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result,
                        playerRolls[key].stake, playerRolls[key].profit, 1, false, now);
                    
                    emit DiceRollResult_failedSend(
                        key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result, _totalWin );
    
                    playerPendingWithdrawals[playerRolls[key].playerAddr] = playerPendingWithdrawals[playerRolls[key].playerAddr].add(_totalWin);
                    
                    delete playerRolls[key];
                    
                } else {
                    
                    emit DiceRollResult(key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result,
                        playerRolls[key].stake, playerRolls[key].profit, 1, true, now);
                        
                    delete playerRolls[key];
                        
                }
                
                return;
                
            } else {
                playerRolls[key].win=0;
                totalLosses = totalLosses.add(1);
                totalLossAmount = totalLossAmount.add(playerRolls[key].profit);
                contractBalance = contractBalance.add(_totalWin.sub(1)); // how much we have won/lost
                playerRolls[key].paid = true;
                
                if(!playerRolls[key].playerAddr.send(1)){
                    playerRolls[key].paid = false;
                    
                    emit DiceRollResult(key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result,
                        playerRolls[key].stake, playerRolls[key].profit, 0, false, now);
                        
                    emit DiceRollResult_failedSend(
                        key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result, 1 );
                   playerPendingWithdrawals[playerRolls[key].playerAddr] = playerPendingWithdrawals[playerRolls[key].playerAddr].add(1);
                   
                   delete playerRolls[key];
                } else {
                    emit DiceRollResult(key, playerRolls[key].playerAddr, playerRolls[key].rollUnder, playerRolls[key].result,
                        playerRolls[key].stake, playerRolls[key].profit, 0, false, now);
                    delete playerRolls[key];
                }
    
                return;
            }
        }

        

    }

    //event LogBet(bytes32 indexed betID, address indexed playerAddress, uint256 indexed rollUnder, uint256 stake, uint256 profit, uint256 timestamp);
    
    
    function rollDice(uint rollUnder) public payable gameActive validBet(msg.value, rollUnder) returns (bytes32) {
        //bytes32 betID = callURL("callback", "https://api.random.org/json-rpc/1/invoke", 
        //"{\"jsonrpc\":\"2.0\",\"method\":\"generateIntegers\",\"params\":{\"apiKey\":\"7d4ab655-e778-4d9f-815a-98fd518908bd\",\"n\":1,\"min\":1,\"max\":100,\"replacement\":true,\"base\":10},\"id\":0}", 
        //"result.random.data");
        
        bytes32 betID = callURL("callback", randomAPI_url, 
        constructAPIParam(), 
        randomAPI_extract);

        gameNumber = gameNumber.add(1);
        // Add the new betID to the players list of bets...
        // Allows us to get all bets by players address
        ////playerBetIdMap[msg.sender].push(betID);
        
        // Add it to the all betID map...
        // Allows us to get all bets...
        

        ////allBetIdMap.push(betID);

        // houseEdge = 96 = 4% edge

        //uint profit = (stake * (houseEdge / _odd)) - stake;
        // is cutting the houseEdge/rollUnder off to 1 instead of 1.92
        // we want to get to a % of msg.value
        
        uint256 _fullTotal = (msg.value * getBetDivisor(rollUnder)   ); // 0.0002 * 250 = 0.0005
        _fullTotal = _fullTotal.div(100);
        _fullTotal = _fullTotal.sub(msg.value);
         //- msg.value; // e.g 100 * (100/50) = 200 - 100 = 100
        
        //rollUnder 20 = 5
        //rollunder30 = 3.3
        
        uint256 _fullTotal_1percent = _fullTotal.div(100); // e.g = 1
        
        uint256 _player_profit = _fullTotal_1percent.mul(houseEdge); // player gets 96%
        uint256 _our_cut = _fullTotal_1percent.mul(100-houseEdge); // we get 4%
        
        //uint256 profit = (msg.value * (houseEdge / rollUnder)) - msg.value;
        //uint256 ourCut = _fullProfit.sub(profit);
        totalProfit = totalProfit.add(_our_cut);
        
        
        playerRolls[betID] = playerDiceRoll(betID, msg.sender, rollUnder, msg.value, _player_profit, 2, false, 0, now);

        maxPendingPayouts = maxPendingPayouts.add(_player_profit); // don't add it to contractBalance yet until its a loss
        // Now part of validBet
        //if (maxPendingPayouts > address(this).balance) revert(); // Don't play if we can't payout?

        // Log the roll out in case anything goes wrong...
        //emit LogBet(betID, msg.sender, rollUnder, msg.value, _player_profit, playerRolls[betID].timestamp);
        emit DiceRollResult(betID, msg.sender, rollUnder, 0,
            msg.value, _player_profit, 2, false, now);
            
        return betID;
    }
    
    function rollDice(uint rollUnder, uint number_of_rolls) public payable gameActive validBetMulti(msg.value, rollUnder, number_of_rolls) returns (bytes32) {

        uint c = 0;
        for(c; c< number_of_rolls; c++) {
            rollDice(rollUnder);
        }

    }
    
    function getBetDivisor(uint256 rollUnder) public pure returns (uint256) {
        if(rollUnder==5)
            return 20 * 100;
        if(rollUnder==10)
            return 10 * 100;
        if(rollUnder==20)
            return 5 * 100;
        if(rollUnder==30)
            return 3.3 * 100;
        if(rollUnder==40)
            return 2.5 * 100;
        if(rollUnder==50)
            return 2 * 100;
        if(rollUnder==60)
            return 1.66 * 100;
        if(rollUnder==70)
            return 1.42 * 100;
        if(rollUnder==80)
            return 1.25 * 100;
        if(rollUnder==90)
            return 1.11 * 100;
        
        return (100/rollUnder) * 10;
    }
    
    function constructAPIParam() internal view returns(string){
        return strConcat(
            strConcat("{\"jsonrpc\":\"2.0\",\"method\":\"generateIntegers\",\"params\":{\"apiKey\":\"",
        randomAPI_key, "\",\"n\":1,\"min\":", uint2str(minRoll), ",\"max\":", uint2str(maxRoll), ",\"replacement\":true,\"base\":10},\"id\":"),
        uint2str(gameNumber), "}" 
        ); // Add in gameNumber to the params to avoid clashes
    }
    
    // need to process any playerPendingWithdrawals
    
    // Allow a user to withdraw any pending amount (That may of failed previously)
    function player_withdrawPendingTransactions() public
        returns (bool)
     {
        uint withdrawAmount = playerPendingWithdrawals[msg.sender];
        playerPendingWithdrawals[msg.sender] = 0;

        if (msg.sender.call.value(withdrawAmount)()) {
            return true;
        } else {
            /* if send failed revert playerPendingWithdrawals[msg.sender] = 0; */
            /* player can try to withdraw again later */
            playerPendingWithdrawals[msg.sender] = withdrawAmount;
            return false;
        }
    }

    // shows if a player has any pending withdrawels due (returns the amount)
    function player_getPendingTxByAddress(address addressToCheck) public constant returns (uint256) {
        return playerPendingWithdrawals[addressToCheck];
    }

    
    // need to auto calc max bet
    

    // private functions
    function private_addPermittedRoll(uint256 _rollUnder) public onlyOwner {
        permittedRolls[_rollUnder] = true;
    }
    function private_delPermittedRoll(uint256 _rollUnder) public onlyOwner {
        delete permittedRolls[_rollUnder];
    }
    function private_setRandomAPIURL(string newRandomAPI_url) public onlyOwner {
        randomAPI_url = newRandomAPI_url;
    }
    function private_setRandomAPIKey(string newRandomAPI_key) public onlyOwner {
        randomAPI_key = newRandomAPI_key;
    }
    function private_setRandomAPI_extract(string newRandomAPI_extract) public onlyOwner {
        randomAPI_extract = newRandomAPI_extract;
    }
    function private_setminRoll(uint256 newMinRoll) public onlyOwner {
        require(newMinRoll>0);
        require(newMinRoll<maxRoll);
        minRoll = newMinRoll;
    }
    function private_setmaxRoll(uint256 newMaxRoll) public onlyOwner {
        require(newMaxRoll>0);
        require(newMaxRoll>minRoll);
        maxRoll = newMaxRoll;
    }
    function private_setminBet(uint256 newMinBet) public onlyOwner {
        require(newMinBet > 0);
        require(newMinBet < maxBet);
        minBet = newMinBet;
    }
    function private_setmaxBet(uint256 newMaxBet) public onlyOwner {
        require(newMaxBet > 0);
        require(newMaxBet > minBet);
        maxBet = newMaxBet;
    }
    function private_setPauseState(bool newState) public onlyOwner {
        game_paused = newState;
    }
    function private_setHouseEdge(uint256 newHouseEdge) public onlyOwner {
        houseEdge = newHouseEdge;
    }
    function private_kill() public onlyOwner {
        selfdestruct(owner);
    }
    function private_withdrawAll(address send_to) external onlyOwner returns(bool) {
        address myAddress = this;
        return send_to.send(myAddress.balance);
    }
    function private_withdraw(uint256 amount, address send_to) external onlyOwner returns(bool) {
        address myAddress = this;
        require(amount <= myAddress.balance);
        require(amount >0);
        return send_to.send(amount);
    }
    // show how much profit has been made (houseEdge)
    function private_profits() public view onlyOwner returns(uint256) {
        return totalProfit;
    }
    function private_setMinRollUnder(uint256 _minRollUnder) public onlyOwner {
        minRollUnder = _minRollUnder;
    }
    function private_setMaxMultiRolls(uint256 _maxMultiRolls) public onlyOwner {
        maxMultiRolls = _maxMultiRolls;
    }
    function deposit() public payable onlyOwner {
        contractBalance = contractBalance.add(msg.value);
    }
    // end private functions


    // Internal functions
    function parseInt(string _a) internal pure returns (uint256) {
        return parseInt(_a, 0);
    }
    function parseInt(string _a, uint _b) internal pure returns (uint256) {
        bytes memory bresult = bytes(_a);
        uint256 mint = 0;
        bool decimals = false;
        for (uint256 i=0; i<bresult.length; i++){
            if ((bresult[i] >= 48)&&(bresult[i] <= 57)){
                if (decimals){
                    if (_b == 0) break;
                    else _b--;
                }
                mint *= 10;
                mint += uint256(bresult[i]) - 48;
            } else if (bresult[i] == 46) decimals = true;
        }
        if (_b > 0) mint *= 10**_b;
        return mint;
    }
    
    function strConcat(string _a, string _b, string _c, string _d, string _e, string _f, string _g) internal pure returns (string) {
        string memory abcdef = strConcat(_a,_b,_c,_d,_e,_f);
        return strConcat(abcdef, _g);
    }
    function strConcat(string _a, string _b, string _c, string _d, string _e, string _f) internal pure returns (string) {
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
    function strConcat(string _a, string _b, string _c, string _d, string _e) internal pure returns (string) {
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
    function strConcat(string _a, string _b, string _c, string _d) internal pure returns (string) {
        return strConcat(_a, _b, _c, _d, "");
    }
    function strConcat(string _a, string _b, string _c) internal pure returns (string) {
        return strConcat(_a, _b, _c, "", "");
    }
    function strConcat(string _a, string _b) internal pure returns (string) {
        return strConcat(_a, _b, "", "", "");
    }

    function uint2str(uint i) internal pure returns (string){
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

}