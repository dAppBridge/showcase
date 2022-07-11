var planetCryptoEmpireBonusABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_val",
        "type": "uint256"
      }
    ],
    "name": "p_update_refPercent",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_devAccount",
        "type": "address"
      }
    ],
    "name": "p_update_devAccount",
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
        "type": "uint256"
      }
    ],
    "name": "playerBonusCards",
    "outputs": [
      {
        "name": "pack_id",
        "type": "uint256"
      },
      {
        "name": "purchase_time",
        "type": "uint256"
      },
      {
        "name": "price",
        "type": "uint256"
      },
      {
        "name": "owner",
        "type": "address"
      },
      {
        "name": "empire_score",
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
        "name": "_val",
        "type": "uint256"
      }
    ],
    "name": "p_update_taxPercent",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_addr",
        "type": "address"
      }
    ],
    "name": "p_update_planetCryptoControlerAddress",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_val",
        "type": "uint256"
      }
    ],
    "name": "updatePlotPricePackMultiplier",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "playerBonusCardsLen",
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
        "name": "_pack_id",
        "type": "uint256"
      },
      {
        "name": "_referrer",
        "type": "address"
      }
    ],
    "name": "buyBonusPack",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_pack_id",
        "type": "uint256"
      },
      {
        "name": "_empire_score",
        "type": "uint256"
      },
      {
        "name": "_worthPlots",
        "type": "uint256"
      }
    ],
    "name": "updatePack",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_pack_id",
        "type": "uint256"
      }
    ],
    "name": "getBonusPackPrice",
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
        "name": "_planetCryptoTokenAddress",
        "type": "address"
      }
    ],
    "name": "p_update_planetCryptoTokenAddress",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "p_update_Owner",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
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
  }
];