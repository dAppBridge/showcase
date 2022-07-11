#!/bin/bash


sudo ntpdate -s time.nist.gov


#/usr/local/bin/geth --rinkeby --cache=512 --maxpeers=20 --ws --wsorigins "*" --rpc --rpcaddr="localhost" --rpcport="8545" --ws --wsaddr="localhost" --wsport="8546"
/usr/local/bin/geth --datadir=/ethsync/rinkeby --cache=1024 --rinkeby --cache=512 --maxpeers=20 --ws --wsorigins "*" --rpc --rpcaddr="localhost" --rpcport="8555" --ws --wsaddr="localhost" --wsport="8556" --port=30313





