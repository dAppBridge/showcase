/**
 * @title DiceGame
 * @dev Dice Betting contract using Oraclize, inherited Ownable and SafeMath
 */
contract SmartDice is usingOraclize, Ownable, SafeMath {

	struct DiceBet {
		address player;
		uint odd;
		uint stake;
		uint rng;
		uint profit;
		uint win;
		bool paid;
	}

	mapping (bytes32 => DiceBet) public bets;
	mapping (address => uint) balances;
	mapping (uint => uint) maxBetAmounts;

	bytes32[] public queryIds;
	uint public constant baseNumber = 1000;
	uint public totalBets;
	uint public totalUserProfit;
	uint public totalUserLost;
	uint public totalWins;
	uint public totalLosts;
	uint public houseEdge;
	uint public balance;
	uint public maxPendingBalances;
	uint public minBetAmount;
	uint public gasOraclize;
	uint public gasPriceOraclize;

	event DiceRolled(address _address, bytes32 _queryId, uint _amount, uint _odd);
	event UserWin(address _address, bytes32 _queryId, uint _amount, uint _odd, uint _randomResult, uint _profit);
	event UserLose(address _address, bytes32 _queryId, uint _amount, uint _odd, uint _randomResult, uint _lost);
	event HouseDeposited(uint _amount);
	event HouseWithdrawed(address _withdraw, uint _amount);
	event PaidPendingBalance(address _holder, uint _amount);
	event ResetHouseEdge();

	modifier onlyOraclize() {
		require (msg.sender == oraclize_cbAddress());
		_;
	}

	function SmartDice() public {
		oraclize_setNetwork(networkID_auto);
		oraclize_setProof(proofType_TLSNotary | proofStorage_IPFS);
		houseEdge = 96;
		gasOraclize = 500000;
		minBetAmount = 100 finney;
		maxBetAmounts[10] = 500 finney;
		maxBetAmounts[20] = 1 ether;
		maxBetAmounts[30] = 2 ether;
		maxBetAmounts[40] = 4 ether;
		maxBetAmounts[50] = 3 ether;
		maxBetAmounts[60] = 2 ether;
		gasPriceOraclize = 20000000000 wei;
		oraclize_setCustomGasPrice(gasPriceOraclize);
	}

	function __callback(bytes32 myId, string result, bytes proof) public onlyOraclize {
		require(bets[myId].player != address(0x0));
		require(bets[myId].win == 2);

		bets[myId].rng = uint(keccak256(parseInt(result), proof)) % baseNumber + 1;
		maxPendingBalances = sub(maxPendingBalances, bets[myId].profit);

		if (bets[myId].rng < bets[myId].odd * 10) {
			/// player win
			bets[myId].win = 1;

			balance = sub(balance, bets[myId].profit);
			totalUserProfit = totalUserProfit + bets[myId].profit;
			totalWins = totalWins + 1;
			uint amtToSend = add(bets[myId].profit, bets[myId].stake);
			bets[myId].paid = true;

			if (!bets[myId].player.send(amtToSend)) {
				bets[myId].paid = false;
				balances[bets[myId].player] = add(balances[bets[myId].player], amtToSend);
			}

			UserWin(bets[myId].player, myId, bets[myId].stake, bets[myId].odd, bets[myId].rng, bets[myId].profit);
		} else {
			/// player defeated
			bets[myId].win = 0;

			balance = sub(balance, 1);
			totalUserLost = totalUserLost + bets[myId].stake;
			totalLosts = totalLosts + 1;
			bets[myId].profit = 0;
			bets[myId].paid = true;

			if (!bets[myId].player.send(1)) {
				bets[myId].paid = false;
				balances[bets[myId].player] = add(balances[bets[myId].player], 1);
			}

			balance = add(balance, bets[myId].stake);

			UserLose(bets[myId].player, myId, bets[myId].stake, bets[myId].odd, bets[myId].rng, bets[myId].stake);
		}
	}

	function rollDice(uint _odd) public payable returns (bytes32) {
		require(_odd <= 60 && _odd > 0);
		require(maxBetAmounts[_odd] > 0 && msg.value <= maxBetAmounts[_odd]);

		uint oraclizeFee = OraclizeI(OAR.getAddress()).getPrice("URL", gasOraclize);
		if (minBetAmount + oraclizeFee >= msg.value) revert();

		string memory payload = strConcat('\n{"jsonrpc":"2.0","method":"generateIntegers","params":{"apiKey":"14a9ea18-183d-4f06-95ad-de43293dbe0c","n":1,"min":1,"max":', uint2str(baseNumber),  ',"replacement":true,"base":10},"id":"1"}');
		bytes32 queryId = oraclize_query("URL", "json(https://api.random.org/json-rpc/1/invoke).result.random.data.0", payload, gasOraclize);

		uint stake = msg.value - oraclizeFee;
		uint profit = stake * houseEdge / _odd - stake;

		bets[queryId] = DiceBet(msg.sender, _odd, stake, 0, profit, 2, false);
		queryIds.push(queryId);

		maxPendingBalances = add(maxPendingBalances, profit);
		if (maxPendingBalances > balance) revert();

		totalBets += 1;

		DiceRolled(msg.sender, queryId, stake, _odd);
		return queryId;
	}

	function getPendingBalance(address holder) public view returns (uint) {
		return balances[holder];
	}

	function setOraclizeGasLimit(uint amount) public onlyOwner {
		gasOraclize = amount;
	}

	function setOraclizeGasPrice(uint price) public onlyOwner {
		gasPriceOraclize = price;
		oraclize_setCustomGasPrice(price);
	}

	function getMinBetAmount() public constant returns (uint) {
		uint oraclizeFee = OraclizeI(OAR.getAddress()).getPrice("URL", gasOraclize);
		return oraclizeFee + minBetAmount;
	}

	function getMaxBetAmount(uint odd) public constant returns (uint) {
		uint totalBalance = address(this).balance;
		uint oraclizeFee = OraclizeI(OAR.getAddress()).getPrice("URL", gasOraclize);
		return totalBalance * odd * 100 / (houseEdge * (100 - odd)) + oraclizeFee;
	}

	function getBetCount() public constant returns (uint) {
		return queryIds.length;
	}

	function getBet(uint _id) public constant returns (address, uint, uint, uint, uint, uint, bool) {
		require(_id < queryIds.length);
		bytes32 qId = queryIds[_id];
		if (bets[qId].stake > 0) {
			DiceBet memory bet = bets[qId];
			return (bet.player, bet.stake, bet.odd, bet.rng, bet.profit, bet.win, bet.paid);
		}
	}

	function getContractData() public constant returns (uint, uint, uint, uint, uint, uint, uint, uint) {
		uint totalBalance = address(this).balance;
		uint oraclizeFee = OraclizeI(OAR.getAddress()).getPrice("URL", gasOraclize);
		return (totalBalance, oraclizeFee, totalBets, totalUserProfit, totalUserLost, totalWins, totalLosts, houseEdge);
	}

	function setMinBetAmount(uint amount) public onlyOwner {
		minBetAmount = amount;
	}

	function setMaxBetAmount(uint odd, uint amount) public onlyOwner {
		require(maxBetAmounts[odd] > 0);
		maxBetAmounts[odd] = amount;
	}

	function setHouseEdge(uint value) public onlyOwner {
		houseEdge = value;

		ResetHouseEdge();
	}

	function depositBalance() public payable onlyOwner {
		balance = add(balance, msg.value);

		HouseDeposited(msg.value);
	}

	function resetBalance() public onlyOwner {
		balance = address(this).balance;
	}

	function withdrawBalance(address withdraw, uint amount) public onlyOwner {
		require(withdraw != address(0));
		balance = sub(this.balance(), amount);
		if (!withdraw.send(amount)) revert();

		HouseWithdrawed(withdraw, amount);
	}

	function withdrawPendingBalance(address holder) public onlyOwner {
		require(holder != address(0));
		require(balances[holder] != 0);
		uint amount = balances[holder];
		balances[holder] = 0;
		if (!holder.send(amount)) revert();

		PaidPendingBalance(holder, amount);
	}

	function destroy() public onlyOwner {
		selfdestruct(owner);
	}
}