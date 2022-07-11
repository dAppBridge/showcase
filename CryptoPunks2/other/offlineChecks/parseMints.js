
const punks2Abi = require("./punksAbi.js");
const mysql = require('mysql2');
const config = {    "mysql": {
    "host": "punks2.ccack705jqpq.eu-west-2.rds.amazonaws.com",
    "port": 3306,
    "user": "----",
    "password": "----",
    "database": "punks2",
    "ssl": "Amazon RDS",
    "connectionLimit": 10
}
};

const connection = mysql.createConnection(config.mysql);

const ethers =  require("ethers");
const { FORMERR } = require("dns");
const punks_contract_addr ="0xc02d332AbC7f9E755e2b1EB56f6aE21A7Da4B7AD"; 

//console.log(punks2Abi.punks2Abi.abi);
//return;

const ethersProvider = new ethers.providers.JsonRpcProvider("https://rpc.polycat.finance/");
const ro_web3Provider = ethersProvider;
const ro_signer = ethersProvider.getSigner();
const ro_punksContract = new ethers.Contract(punks_contract_addr, punks2Abi.punks2Abi.abi, ro_web3Provider);

//console.log("CONTRACT:", ro_punksContract);

// get last check block


const startBlock = 20346370;
const queryBlocks = 5000;
let currentBlock;

async function getBlockNum(){
    try {
    let _res = await ro_web3Provider.getBlockNumber();
    
    currentBlock = Number(_res);
    console.log("_RES:", _res, currentBlock);
    startQuery();
    } catch(e) {
        console.log(e);
        setTimeout(function(){ getBlockNum();},2000);
    }
}
getBlockNum();

function startQuery() {
    let sql = "SELECT last_block FROM stats WHERE id = 1;"
    connection.query(sql,  function(err, results, fields) {
        console.log(err, results, fields);
        if(results.length == 0 ) {
            query(startBlock);
        } else {
            console.log("RES:", results);
            query(parseInt(results[0].last_block)+1);
        }
    });
}


async function query(fromBlock) {
    console.log("FROM:", fromBlock);
    let toblock = fromBlock + queryBlocks; 

    if(fromBlock > currentBlock) {
        setTimeout(function(){ getBlockNum();}, 30000);
        return;
    }
    if(toblock > currentBlock) {
        toblock = currentBlock;
    }

    var filter = {
        address: punks_contract_addr,
        topics: ["0xf3cea5493d790af0133817606f7350a91d7f154ea52eaa79d179d4d231e50102"],
        fromBlock: fromBlock,
        toBlock: toblock
    };


    try{
        var _events = await ro_web3Provider.getLogs(filter);

        for(let i=0; i< _events.length; i++) {
            let _tokenID = parseInt(_events[i].topics[1],16)
            let _block = _events[i].blockNumber;
            console.log("TOKEN ID:", _tokenID, _block);
            sql = "INSERT INTO punks2_minted (tokenid, block) VALUES(" + _tokenID + ", " + _block + ");";
            connection.query(sql);
        }

        sql = "UPDATE stats SET last_block = " + toblock + " WHERE id = 1;";
        connection.query(sql);
    } catch(e) {
        console.log("Error:", e);
    }
    setTimeout(function(){ query(toblock+1);}, 30000);

}