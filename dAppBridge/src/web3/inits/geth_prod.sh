#!/bin/bash

sudo ntpdate -s time.nist.gov

# probably needs to run on port 30303 And then run testnet on 30313 which will be slower to sync as will have fewer peers
/usr/local/bin/geth --datadir=/ethsync/ --cache=2048 --maxpeers=20 --ws --wsorigins "*" --rpc --rpcaddr="localhost" --rpcport="8545" --ws --wsaddr="localhost" --wsport="8546" 





