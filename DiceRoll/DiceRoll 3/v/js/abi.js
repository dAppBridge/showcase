var cryptodiceABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "amount",
				"type": "uint256"
			},
			{
				"name": "send_to",
				"type": "address"
			}
		],
		"name": "private_withdraw",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_maxMultiRolls",
				"type": "uint256"
			}
		],
		"name": "private_setMaxMultiRolls",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_rollUnder",
				"type": "uint256"
			}
		],
		"name": "private_delPermittedRoll",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "maxMultiRolls",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "addressToCheck",
				"type": "address"
			}
		],
		"name": "player_getPendingTxByAddress",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newMinRoll",
				"type": "uint256"
			}
		],
		"name": "private_setminRoll",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "game_paused",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "minRollUnder",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "rollUnder",
				"type": "uint256"
			},
			{
				"name": "number_of_rolls",
				"type": "uint256"
			}
		],
		"name": "rollDice",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "private_profits",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_betID",
				"type": "bytes32"
			}
		],
		"name": "getBet",
		"outputs": [
			{
				"name": "betID",
				"type": "bytes32"
			},
			{
				"name": "playerAddr",
				"type": "address"
			},
			{
				"name": "rollUnder",
				"type": "uint256"
			},
			{
				"name": "stake",
				"type": "uint256"
			},
			{
				"name": "profit",
				"type": "uint256"
			},
			{
				"name": "win",
				"type": "uint256"
			},
			{
				"name": "paid",
				"type": "bool"
			},
			{
				"name": "result",
				"type": "uint256"
			},
			{
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "private_getGameState",
		"outputs": [
			{
				"name": "_contractBalance",
				"type": "uint256"
			},
			{
				"name": "_game_paused",
				"type": "bool"
			},
			{
				"name": "_minRoll",
				"type": "uint256"
			},
			{
				"name": "_maxRoll",
				"type": "uint256"
			},
			{
				"name": "_minBet",
				"type": "uint256"
			},
			{
				"name": "_maxBet",
				"type": "uint256"
			},
			{
				"name": "_houseEdge",
				"type": "uint256"
			},
			{
				"name": "_totalUserProfit",
				"type": "uint256"
			},
			{
				"name": "_totalWins",
				"type": "uint256"
			},
			{
				"name": "_totalLosses",
				"type": "uint256"
			},
			{
				"name": "_totalWinAmount",
				"type": "uint256"
			},
			{
				"name": "_totalLossAmount",
				"type": "uint256"
			},
			{
				"name": "_liveMaxBet",
				"type": "uint256"
			},
			{
				"name": "_totalFails",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "key",
				"type": "bytes32"
			},
			{
				"name": "callbackData",
				"type": "string"
			}
		],
		"name": "callback",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newRandomAPI_extract",
				"type": "string"
			}
		],
		"name": "private_setRandomAPI_extract",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalLossAmount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "playerRolls",
		"outputs": [
			{
				"name": "betID",
				"type": "bytes32"
			},
			{
				"name": "playerAddr",
				"type": "address"
			},
			{
				"name": "rollUnder",
				"type": "uint256"
			},
			{
				"name": "stake",
				"type": "uint256"
			},
			{
				"name": "profit",
				"type": "uint256"
			},
			{
				"name": "win",
				"type": "uint256"
			},
			{
				"name": "paid",
				"type": "bool"
			},
			{
				"name": "result",
				"type": "uint256"
			},
			{
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalFails",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newRandomAPI_key",
				"type": "string"
			}
		],
		"name": "private_setRandomAPIKey",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newRandomAPI_url",
				"type": "string"
			}
		],
		"name": "private_setRandomAPIURL",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalWins",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "player_withdrawPendingTransactions",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "rollUnder",
				"type": "uint256"
			}
		],
		"name": "getBetDivisor",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_rollUnder",
				"type": "uint256"
			}
		],
		"name": "private_addPermittedRoll",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getOwner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "contractBalance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getLiveMaxBet",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newMaxRoll",
				"type": "uint256"
			}
		],
		"name": "private_setmaxRoll",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_minRollUnder",
				"type": "uint256"
			}
		],
		"name": "private_setMinRollUnder",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "rollUnder",
				"type": "uint256"
			}
		],
		"name": "rollDice",
		"outputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "private_kill",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalUserProfit",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newState",
				"type": "bool"
			}
		],
		"name": "private_setPauseState",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalLosses",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "randomAPI_url",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "permittedRolls",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "houseEdge",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newMinBet",
				"type": "uint256"
			}
		],
		"name": "private_setminBet",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "send_to",
				"type": "address"
			}
		],
		"name": "private_withdrawAll",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "maxPendingPayouts",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newHouseEdge",
				"type": "uint256"
			}
		],
		"name": "private_setHouseEdge",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalWinAmount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "newMaxBet",
				"type": "uint256"
			}
		],
		"name": "private_setmaxBet",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "betID",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"name": "playerAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "rollUnder",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "result",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "amountToSend",
				"type": "uint256"
			}
		],
		"name": "DiceRollResult_failedSend",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "betID",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"name": "playerAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "rollUnder",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "result",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "stake",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "profit",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "win",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "paid",
				"type": "bool"
			},
			{
				"indexed": false,
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "DiceRollResult",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "senderAddress",
				"type": "address"
			}
		],
		"name": "event_senderAddress",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "theLocation",
				"type": "address"
			}
		],
		"name": "evnt_dAdppBridge_location",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "senderAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "checkAddress",
				"type": "address"
			}
		],
		"name": "only_dAppBridgeCheck",
		"type": "event"
	}
];