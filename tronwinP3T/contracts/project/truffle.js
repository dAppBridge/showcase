'use strict';

const HDWalletProvider = require("truffle-hdwallet-provider");

var privateKey = "635A35B0671C5750BAD630DB1665375C17D07D64C39564B923E5176EDCFA07C6";


module.exports = {
  solc: {
      version: "0.5.4",
      optimizer: {
          enabled: true,
          runs: 200,
      }
  },
  compilers: {
     solc: {
        version: "0.5.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
     }
  },
  networks: {
    development: {
      provider: () => new HDWalletProvider(
        privateKey,
        "http://127.0.0.1:8545",
      ),
      host: "127.0.0.1",
      port: "8545",
      network_id: "*", // Match any network id
    },


    tomotestnet: {
      provider: () => new HDWalletProvider(
        privateKey,
        "https://testnet.tomochain.com"//,
        //0,
        //1,
        //true,
        //"m/44'/889'/0'/0/",
      ),
      network_id: "89",


      gas: 6917154, 
      gasPrice: 10000000000000, // min gas price = 10000 gwei
      //gasPrice:   5000000000000, // min gas price = 10000 gwei

    },


    tomomainnet: {
      provider: () => new HDWalletProvider(
        privateKey,
        "https://rpc.tomochain.com",
        //0,
        //1,
        //true,
        //"m/44'/889'/0'/0/",
      ),
      network_id: "88",
      // 389117 for rando
      // 6917154 for TomoKeys (possibly 6124520)
      gas: 6917154, 
      //gas: 5124520, 
      //gas: 1000000,
      gasPrice: 10000000000000, // min gas price = 10000 gwei
    }
  }
};
