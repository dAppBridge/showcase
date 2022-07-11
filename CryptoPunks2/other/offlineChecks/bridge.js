
const https = require("https");
const punks2Abi = require("./punksAbi.js");


const ethers =  require("ethers");
//const punks_contract_addr ="0xc02d332AbC7f9E755e2b1EB56f6aE21A7Da4B7AD"; // prod
const punks_contract_addr ="0xd5DE3Ec6aa275B878452FE26f2420735DE196c15"; // mumbai testnet

const bridge_addr = "0x1C3637DE9FAe7D760d6f96Bdc67754666fd5EBF5";
const bridge_pk = "------";

const eth_scanurl = "https://api-ropsten.etherscan.io/api?module=account&action=txlist&address=0x1C3637DE9FAe7D760d6f96Bdc67754666fd5EBF5&tag=latest&apikey=YWSUHMSWZ9ZGHMY77CDS14WNGQCMR4U37Q"; 
//&startblock=0&endblock=99999999";

const polygon_ethersProvider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today"); 
// https://rpc-mainnet.matic.network"); 
const polygon_wallet = new ethers.Wallet(bridge_pk , polygon_ethersProvider);

const punks2Contract = new ethers.Contract(punks_contract_addr, punks2Abi.punks2Abi.abi, polygon_wallet);

//console.log("CONTRACT:", punksContract);

const queryBlocks = 5000;
var startBlock;
// get last check block
const 
    fs = require('fs'),
    path = require('path'),    
    filePath = path.join(__dirname, 'bridgeStart.txt');


fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        startBlock = parseInt(data);
        startWatching();
    } else {
        console.log(err);
    }
});



let ethProcessedTx;

function startWatching() {
    console.log("STARTING FROM:", startBlock);
    fs.readFile(path.join(__dirname, "ethTxProcessed.txt"), {encoding: "utf-8"}, function(err,data){
        if(!err) {
            ethProcessedTx = data.split(",");
            setTimeout(checkEth, 10000);

        } else {
            console.log("ERROR getting: ethTxProcessed.txt", err);
        }
    });

}

async function checkEth() {
    console.log("Scanning for new bridge events...");
    let url = eth_scanurl + "&startblock=" + startBlock + "&endblock=" + (startBlock+parseInt(queryBlocks));
    console.log(url);
    https.get(url, function(res){
        var body = '';
    
        res.on('data', function(chunk){
            body += chunk;
        });
    
        res.on('end', async function(){
            var jsonBody = JSON.parse(body);
            var lastBlock = 0;
            for(let c=0; c< jsonBody.result.length; c++) {
                // .blockNumber
                console.log("Got a response: ", jsonBody.result[c].from, jsonBody.result[c].value);

                let isValidTx = true;
                //for(let c2=0; c2< ethProcessedTx.length; c2++) {
                    if(ethProcessedTx.includes(jsonBody.result[c].hash)) {
                        isValidTx = false;
                  //      break;
                    } 
                //}

                if(!isValidTx) {
                    console.log("ALREADY PROCESSED!");
                } else {
                    console.log("READY TO PROCESS");
                    // do the mint here...
                    

                    try{
                        let mintPrice = await punks2Contract.calcMintPrice(1);
                        mintPrice = mintPrice.toString();
                        let unitPrice;
                        let userTransferAmount = jsonBody.result[c].value;


                        if(mintPrice.toString() == "10000000000000000000") {
                            unitPrice = ethers.BigNumber.from("5000000000000000").toString(); // 0.005 ETH
                        } 
                        if(mintPrice.toString() == "20000000000000000000") {
                            unitPrice = ethers.BigNumber.from("10000000000000000").toString(); // 0.01 ETH
                        } 
                        if(mintPrice.toString() == "40000000000000000000") {
                            unitPrice = ethers.BigNumber.from("20000000000000000").toString(); // 0.02 ETH
                        } 
                        if(mintPrice.toString() == "80000000000000000000") {
                            unitPrice = ethers.BigNumber.from("40000000000000000").toString(); // 0.04 ETH
                        } 

                        let unitsToMint = ethers.BigNumber.from(userTransferAmount).div(ethers.BigNumber.from(unitPrice));
                        let mintHasError = false;

                        if(unitsToMint == 0 ) {
                            // not enough ETH sent so TX can be ignored...
                            console.log("Not enough ETH sent:", jsonBody.result[c].hash);
                        } else {

                            
                            let val = unitsToMint.mul(ethers.BigNumber.from(mintPrice));

                            console.log(mintPrice, userTransferAmount, unitPrice.toString(), unitsToMint.toString(), val.toString());
                            // 
                            // 10000000000000000
                            // 14000000000000000
                            // 
                            //  let val = ethers.BigNumber.from(valInt.toString()).toString();
                            //let val = valInt.toString();
                            console.log("AMOUNT NEEDED IN MATIC:", val.toString());
                            try{
                                let tx = await punks2Contract.mint(1,"0x0000000000000000000000000000000000000000", {value: val});
                                await tx.wait();
                                console.log("TX:", tx);
                            } catch(e){
                                // TODO:
                                // If we fail here we need to be able to retry this transfer/tx later
                                mintHasError = true;
                            }

                            if(!mintHasError) {
                                
                                let bal = await punks2Contract.balanceOf(bridge_addr);
                                bal = bal.toString();

                                let tokensToTransfer = [];
                                for(let i=0; i<bal; i++) {
                                    let tokenId = await punks2Contract.tokenOfOwnerByIndex(bridge_addr,i);
                                    tokenId = tokenId.toString();
                                    tokensToTransfer.push(tokenId);
                                    console.log("TOKENID:", i, tokenId);
                                }

                                for(let i=0; i< tokensToTransfer.length; i++) {
                                    let tokenId = tokensToTransfer[i];
                                    tx = await punks2Contract.transferFrom(bridge_addr, jsonBody.result[c].from, parseInt(tokenId));
                                    await tx.wait();
                                    console.log("TRANSFER TX:", tokenId, tx);

                                }
                                lastBlock = jsonBody.result[c].blockNumber;
                            }
                        }

                        if(!mintHasError){
                            ethProcessedTx.push(jsonBody.result[c].hash);
                            fs.writeFile("ethTxProcessed.txt", ethProcessedTx, function(err) {
                                if(err) {
                                    return console.log(err);
                                }
                                console.log("The ETH TX file was saved!");
                            });
                        }


                    } catch(e) {
                        console.log("ERROR MINTING:", e);
                    }
                }

            }
            if(lastBlock > 0)
                startBlock = lastBlock;
            else
                startBlock += parseInt(queryBlocks);

            fs.writeFile("bridgeStart.txt", startBlock, function(err) {
                if(err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            }); 

        });
    }).on('error', function(e){
          console.log("Got an error: ", e);
    });
}
