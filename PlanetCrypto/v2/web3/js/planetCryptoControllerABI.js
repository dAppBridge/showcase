var planetCryptoControllerABI = [
	{
		"constant": true,
		"inputs": [],
		"name": "getAllPlayerObjectLen",
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
				"name": "inc",
				"type": "bool"
			}
		],
		"name": "receiveExtraTax",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalEmpireScore",
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
				"type": "uint256"
			}
		],
		"name": "all_playerObjects",
		"outputs": [
			{
				"name": "playerAddress",
				"type": "address"
			},
			{
				"name": "lastAccess",
				"type": "uint256"
			},
			{
				"name": "totalEmpireScore",
				"type": "uint256"
			},
			{
				"name": "totalLand",
				"type": "uint256"
			},
			{
				"name": "additionalEmpireScore",
				"type": "uint256"
			},
			{
				"name": "fundsOwed",
				"type": "uint256"
			},
			{
				"name": "flagDetail",
				"type": "bytes32"
			},
			{
				"name": "flagSet",
				"type": "bool"
			},
			{
				"name": "vanity",
				"type": "string"
			},
			{
				"name": "vanityStatus",
				"type": "bool"
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
				"type": "address"
			}
		],
		"name": "allowedExternalContracts",
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
		"name": "tax_carried_forward",
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
				"name": "_player",
				"type": "address"
			}
		],
		"name": "playerReceiveFunds",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "total_earned",
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
		"name": "taxEarningsAvailable",
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
		"name": "receiveExternalTax",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "total_invested",
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
		"name": "totalLand",
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
		"name": "withdrawTaxEarning",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
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
		"name": "listVanityAddress",
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
		"name": "total_empire_score",
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
				"name": "_player",
				"type": "address"
			},
			{
				"name": "_empire_score_change",
				"type": "uint256"
			},
			{
				"name": "_isEmpireScoreInc",
				"type": "bool"
			},
			{
				"name": "_land_size_change",
				"type": "uint256"
			},
			{
				"name": "_isLandSizeInc",
				"type": "bool"
			}
		],
		"name": "updateStats",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "VANITY_PRICE",
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
		"name": "playerFlagCost",
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
				"name": "_playerAddress",
				"type": "address"
			},
			{
				"name": "_val",
				"type": "uint256"
			},
			{
				"name": "_isInc",
				"type": "bool"
			}
		],
		"name": "updatePlayerEmpireScore",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "tax_distributed",
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
		"name": "tax_fund",
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
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"payable": true,
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "event_type",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "amnt",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "token_id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "data",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "center_lat",
				"type": "int256"
			},
			{
				"indexed": false,
				"name": "center_lng",
				"type": "int256"
			},
			{
				"indexed": false,
				"name": "size",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "bought_at",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "empire_score",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "action",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "vanity",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "onBuyVanity",
		"type": "event"
	}
];