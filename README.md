# Readme

1) Start node:
```
geth --datadir ~/privateEthTestnet --networkid 3107 --fast --rpc --rpcapi eth,web3,personal,net,miner,admin
```

2) Start console:
```
geth attach http://127.0.0.1:8545
```

3) Go to contract folder:
```
cd tictactoe/contract/
```

4) Run deployment script:
```
./deploy.sh tictactoe.sol
```

5) Load the resulting script in the geth console
```
loadScript("/tmp/test.js")
```

6) Wait on mining message and copy contract address
```
Contract mined! address: 0xfb821bf9e66a5decb43a92fc615bbbdb296df462 transactionHash: 0xda816929b1764fa9736f02505e94bfdeace098a4348057ddacb0baf466dfda5e
```

7) Open the frontend/config.js file in an editor and change the Web3InterfaceToServer.contractAddress variable

8) Open your browser and disable Web-Security
On linux you can use for example:
```
google-chrome --disable-web-security --user-data-dir
```

9) Open the frontend/index.html file in your browser

10) Play TicTacToe
