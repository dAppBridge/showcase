//tronbox migrate --reset --compile-all --network shasta
//https://tronsmartcontract.space/#/compose
module.exports = {

  networks: {
    useZeroFourCompiler: true,
    development: {
      from: 'TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6',
// For trontools/quickstart docker image
      privateKey: '125cf33a21045a868dda6f8288ca972d676b69f9541e6299573f2d7d33aadf3f',
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
      privateKey: '125cf33a21045a868dda6f8288ca972d676b69f9541e6299573f2d7d33aadf3f',
      /*
      Create a .env file (it must be gitignored) containing something like

        export PK=4E7FECCB71207B867C495B51A9758B104B1D4422088A87F4978BE64636656243

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
      from: 'TRVkMHsWLxBddYszrwWa9o8h5es6Kn5wgr',
      //privateKey: '125cf33a21045a868dda6f8288ca972d676b69f9541e6299573f2d7d33aadf3f',
      privateKey: 'caf7512f8067c6b51c2ef8bb400b3f7af19eb7b2afdb10f261724bbada03b832',
      consume_user_resource_percent: 30,
      fee_limit: 100000000,
      origin_energy_limit: 10000000,

      // tronbox 2.1.9+
      fullHost: "https://api.shasta.trongrid.io",

      // tronbox < 2.1.9
      fullNode: "https://api.shasta.trongrid.io",
      solidityNode: "https://api.shasta.trongrid.io",
      eventServer: "https://api.shasta.trongrid.io",

      network_id: "*"
    }
  }
}
