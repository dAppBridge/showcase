# DJF Showcase/Existing Projects


## dAppBridge - 2018
[dAppBridge](dAppBridge)
[dAppBridge-Client/](dAppBridge-Client/)

An Ethereum Oracle service developed in 2018 (Prior to Chainlink becaming the market leader in this space!)

- Allows the secure bridge of external (web) data into a smart-contract
- Makes use of another personally developed project [NotaryProxy](NotaryProxy/)

Core contract:

[dAppBridge/contracts/DappBridge.sol](dAppBridge/contracts/DappBridge.sol)

Interface contract:

[dAppBridge-Client/dAppBridge-Client.sol](dAppBridge-Client/dAppBridge-Client.sol)

Also uses **NotaryProxy** (See below) 


## NotaryProxy - 2018
[NotaryProxy/](NotaryProxy)

Notary Proxy is a Middleware service that when used in an audit-able environment can verify and prove that content received has not been tampered with. For each request made it validates and provides a secure proof of the content received, as it is received from the source endpoint.

## PlanetCrypto - 2018 onwards
[PlanetCrypto/](PlanetCrypto/)
[PlanetCryptov2/](PlanetCrypto/v2)

One of the first NFT trading games for Ethereum - splits the globe into a 10x10 matrix of "plots".  Each plot can be added into a custom NFT (E.g. Add the plots around the Eithel Tower to own the NFT of the landmark)

Was further developed into a Tron version which included gameplay enhancements along with better NFT imaging (Using AWS Lambda services for the NFT image generation).

Some of the methods used within this project are now outdated - but were relevent at the time (2018).  The Tron chain for exmaple was very unstable and we at times were cause of congestion and issues with the chain - a lot of the fixes and workarounds within the JS code here is to account for poor quality nodes on the Tron network - especially for things like tracing back transaction history/logs.

**Utilizing ERC721 & ERC20 stanadards, Web3JS, TronBoxJS, AWS Lambda, APIs, Custom Image Server, Babel, Mapping SDKs.**

*(v2 version continas majority of work)*

## CryptoPunks2 - 2021 onwards
[CryptoPunks2/](CryptoPunks2/)

A new take of the NFT Punks collection.  A NFT collection for the Polygon chain, utilising a custom NFT generator and various Lambda functions for providing NFT data.

Also includes the core-code/prototype for a customer L1->L2 minting bridge:

 [CryptoPunks2/other/offlineChecks/bridge.js](CryptoPunks2/other/offlineChecks/bridge.js)

The bridge is a simple solution to minting NFTs on a L2 chain such as Polygon - allowing the user to simply send the mint FUNDS in a base token such as ETH on the Ethereum network (Or BNB on BSC), with a watching process (bridge.js) picking up the transactions and minting the required NFTs before sending them to the original user.

Various offline processes manage the NFT database (AWS MySQL) by watching for new mints and updating various stats.

**Utilizing ERC721 & ERCO20 standards, Web3JS, Customer NFT generation routies (Image composition), AWS Lambda for NFT stats, attributes & rarity calculations, AWS MySQL.**

## diceroll - 2018
[DiceRoll/](DiceRoll/)
[DiceRoll](DiceRoll)

A gaming DApp that utlizes the random functionality of dAppBridge (Above)

Instead of using on chain randomness this smart-contract uses our own Oracle to call out to random.org.


## TronWin - 2019
[tronwinP3T](tronwinP3T)

Contracts: [tronwinP3T/contracts/project/contracts](tronwinP3T/contracts/project/contracts)

A gaming DApp featuring multiple on-chain games along with player ownership via the TronWin token (ERC20/TRC20).

## hexrun - 2020
[HexRun](HexRun)

A gaming DApp using a ERC20 token (HEX).

## ethmatrix, tronmatrix & bscmatrix
(Matrix)[Matrix/]

Multiple chain investment gaming that had a multi million dollar turn-over.

Project was smart-contract development with web3/UI consultancy.

Note: Some of the methods used here would not be appropriate today due to gas costs.

## other

Many other projects over the years that remain IP of the individuals who have paid for the work.  Unable to demonstrate the source-code of these projects but they include:

- Polygon mining game (Using ERC20 tokens - smart-contracts + UI)
- Polygon DeFi project (Using ERC20, Yield Farms & a small DEX - smart-contracts + UI development, not a simple clone of other DEX or farms)
- Tomo Gaming project (Casino style games - smart-contracts + UI)
- Tron Gaming project (Casino style games - smart-contracts + UI)

