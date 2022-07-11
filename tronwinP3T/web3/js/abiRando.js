var randos = {
  "contractName": "rando2",
  "abi": [
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
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_contractAddr",
          "type": "address"
        },
        {
          "name": "_allow",
          "type": "bool"
        }
      ],
      "name": "allowContract",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_newRandos",
          "type": "uint16[]"
        }
      ],
      "name": "pushRandos",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_max_randos",
          "type": "uint256"
        }
      ],
      "name": "setMaxRanods",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        }
      ],
      "name": "getRandoUInt",
      "outputs": [
        {
          "name": "random_val",
          "type": "uint256"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts_50",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[50]"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts_100",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[100]"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts_500",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[500]"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts_1000",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[1000]"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts_2500",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[2500]"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts_5000",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[5000]"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts_10000",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[10000]"
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
          "name": "_max",
          "type": "uint256"
        },
        {
          "name": "_sender",
          "type": "address"
        },
        {
          "name": "_count",
          "type": "uint256"
        }
      ],
      "name": "getRandoUInts",
      "outputs": [
        {
          "name": "random_vals",
          "type": "uint256[]"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};