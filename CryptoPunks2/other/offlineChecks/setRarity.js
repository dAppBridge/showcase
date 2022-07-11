
const punks2Abi = require("./punksAbi.js");
const http = require('https');
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

async function start(){
    let sql = "SELECT tokenid FROM chars WHERE rarity IS NULL LIMIT 1;"
    connection.query(sql,  function(err, results, fields) {
       // console.log(err, results, fields);
        if(results.length == 0 ) {
            console.log("No chars to process, ending");
        } else {
            
            query(parseInt(results[0].tokenid));
        }
    });

}
start();




async function query(tokenid) {
    console.log("PROCESSING:", tokenid);
    let sql = "SELECT tokenid, count(attribute_id) AS attribute_count FROM punks2.chars_attribute ";
    sql += "WHERE tokenid = " + tokenid;
    sql += " GROUP BY tokenid;";

    connection.query(sql,  function(err, results, fields) {
        
        if(results.length == 0 ) {
            console.log("No attributes - error!");
        } else {
            
            getAttributeRarity(tokenid, parseInt(results[0].attribute_count));
        }
    });
}

async function getAttributeRarity(tokenid, numberOfAttr) {
    let sql = "SELECT tokenid, count(attribute_id) AS attribute_count FROM punks2.chars_attribute ";
    sql += "GROUP BY tokenid ";
    sql += " HAVING attribute_count = " + numberOfAttr;
    connection.query(sql, function(err, results, fields){
        var url = 'https://api.cryptopunks2.com/punks2/' + tokenid;
        console.log(url);

        http.get(url, function(res){
            var body = '';
        
            res.on('data', function(chunk){
                body += chunk;
            });
        
            res.on('end', function(){
                var punkJSON = JSON.parse(body);
                console.log("Got a response: ", punkJSON);
                console.log("BG RARITY:", punkJSON.bgUsage / punkJSON.totalMints);
            });
        }).on('error', function(e){
              console.log("Got an error: ", e);
        });
    });
}