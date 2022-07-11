module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    development: {
      from: 'TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6',
// For trontools/quickstart docker image
      privateKey: '----',
      consume_user_resource_percent: 30,
      fee_limit: 100000000,

      // Requires TronBox 2.1.9+ and Tron Quickstart 1.1.16+
      // fullHost: "http://127.0.0.1:9090",

      // The three settings below for TronBox < 2.1.9
      fullNode: "https://grpc.shasta.trongrid.io",
      solidityNode: "https://grpc.shasta.trongrid.io",
      eventServer: "https://grpc.shasta.trongrid.io",

      network_id: "*"
    },
    mainnet: {
      from: 'TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6',
// Don't put your private key here:
      privateKey: '----',
      /*
      Create a .env file (it must be gitignored) containing something like

        

      Then, run the migration with:

        source .env && tronbox migrate --network mainnet

      */
      consume_user_resource_percent: 30,
      fee_limit: 100000000,

      // tronbox 2.1.9+
      // fullHost: "https://api.trongrid.io",

      // tronbox < 2.1.9
      fullNode: "https://api.trongrid.io",
      solidityNode: "https://api.trongrid.io",
      eventServer: "https://api.trongrid.io",

      network_id: "*"
    },
    shasta: {
      //from: 'TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6',
      from: 'TRVkMHsWLxBddYszrwWa9o8h5es6Kn5wgr',

      privateKey: '----',
      consume_user_resource_percent: 30,
      fee_limit: 100000000,
      origin_energy_limit: 10000000,

      // tronbox 2.1.9+
      // fullHost: "https://api.shasta.trongrid.io",

      // tronbox < 2.1.9
      fullNode: "https://api.shasta.trongrid.io",
      solidityNode: "https://api.shasta.trongrid.io",
      eventServer: "https://api.shasta.trongrid.io",

      network_id: "*"
    }
  }
}
