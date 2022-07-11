// We don't want to withdraw the full amount
// The amount sent by the client should be:
// reward + gas
// DappBridge contract needs to have anough gas
// so the reward sent by the client is actual reward+mingas wher gas is the gas we need for our actions
// - we leave the gas part in the contract and withdraw reward to bank wallet


// IF SYCNING FAILS -> IT IS LIKELY THAT parity has stopped and needs restarting!!!

const Web3 = require('web3');
const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('config');
const logger = require('./winston/winston.js');
const util = require('util');
const async = require('async');
let connectionConfig = {};

if(config.network_type == "test")
  connectionConfig = config.testnet;
else{
  if(config.network_type == "test2")
    connectionConfig = config.testnet2;
  else
    connectionConfig = config.prod;
}


const DappBridge_addr = connectionConfig.DappBridge_addr;
const Account_addr = connectionConfig.Account_addr;
const p_key = connectionConfig.p_key;
const AWS_SQS_timeout_event = connectionConfig.AWS_SQS_timeout_event;
const LastBlock_filename = connectionConfig.LastBlock_filename;
const LastBlock_filename_random = LastBlock_filename + "_random";
const LastBlock_filename_timeout = LastBlock_filename + "_timeout";

const SQS_VisibilityTimeout = connectionConfig.SQS_VisibilityTimeout || 300;


var last_block_number = 0;
var last_block_number_random = 0;
var last_block_number_timeout = 0;

if(fs.existsSync(LastBlock_filename)) {
  try {
    last_block_number = parseInt(fs.readFileSync(LastBlock_filename))+1;  // move on 1 to avoid re-processing the last block we processed

  } catch(e){}
}


if(fs.existsSync(LastBlock_filename_random)) {
  try {
    last_block_number_random = parseInt(fs.readFileSync(LastBlock_filename_random))+1;  // move on 1 to avoid re-processing the last block we processed

  } catch(e){}
}

last_block_number_timeout

if(fs.existsSync(LastBlock_filename_timeout)) {
  try {
    last_block_number_timeout = parseInt(fs.readFileSync(LastBlock_filename_timeout))+1;  // move on 1 to avoid re-processing the last block we processed

  } catch(e){}
}


logger.info("Restarting at block#:" + last_block_number); 
logger.info("Connection:" + connectionConfig.ws);

const AWS_credentials = new AWS.SharedIniFileCredentials({profile: 'personal-account'});
AWS.config.credentials = AWS_credentials;
AWS.config.update({region: 'us-east-1'});
//  ~/.aws/credentials

const web3 = new Web3(new Web3.providers.WebsocketProvider(connectionConfig.ws || "ws://127.0.0.1:8556"));
// Can't use Infura yet as we need websockets to subscribe for events - websockets not yet in production on Infura
//const web3 = new Web3(new Web3.providers.HttpProvider(connectionConfig.infura_addr || "https://kovan.infura.io/wZFGKO8wsb7JbR9glIp2"));


web3.eth.accounts.wallet.add(p_key);


web3.eth.defaultAccount = Account_addr;


var DappBridge_abi = config.DappBridge_abi;



var DappBridge_contract = new web3.eth.Contract(DappBridge_abi, DappBridge_addr);


var sqs = new AWS.SQS({
  apiVersion: '2012-11-05',
  credentials: AWS_credentials,
  VisibilityTimeout: SQS_VisibilityTimeout});


DappBridge_contract.events.setTimeout_event()
.on('data', function(event){
    processEvent("setTimeout_event", event);
})
.on('changed', function(event){
    // remove event from local database
})
.on('error', logger.error);


// Probably fast to poll! like we do in the web client...

/*
  cryptodiceContract.getPastEvents("DiceRollResult", {filter: {betID: betID},
  fromBlock:0, toBlock: 'latest'}, function(err, results){
*/
//5863964

logger.info(last_block_number_timeout);
async.forever(
  function(next) {

    //logger.info("Checking:" + last_block_number_random + ":" + last_block_number_timeout);

    async.parallel([
        function(callback) {

          DappBridge_contract.getPastEvents("setRandomTriger_event", {fromBlock: last_block_number_random, toBlock: 'latest'}, function(err, results){

            

            if(results.length > 0) {

              //logger.info("Have events:" + JSON.stringify(results));

              let _lst_block_number = last_block_number_random;
              for(let c=0; c< results.length; c++) {
                let event = results[c];
                _lst_block_number = event.blockNumber;
                processEvent("setRandomTriger_event", event);
              }

              fs.writeFile(LastBlock_filename_random, _lst_block_number, (err) => {
                    if (err) {
                      logger.error("Error writing last block random log:" + err);
                    }
                    last_block_number_random = _lst_block_number+1;
                    callback(null,'');
                  });

            } else {
              callback(null,'');
            }

          });

        },
        function(callback) {

          DappBridge_contract.getPastEvents("setTimeout_event", {fromBlock: last_block_number_timeout, toBlock: 'latest'}, 
            function(err, results){

            

            if(results.length > 0) {

              //logger.info("Have events:" + JSON.stringify(results));

              let _lst_block_number = last_block_number_timeout;
              for(let c=0; c< results.length; c++) {
                let event = results[c];
                _lst_block_number = event.blockNumber;
                logger.info(event);
                processEvent("setTimeout_event", event);
              }

              fs.writeFile(LastBlock_filename_timeout, _lst_block_number, (err) => {
                    if (err) {
                      logger.error("Error writing last block timeout log:" + err);
                    }
                    last_block_number_timeout = _lst_block_number+1;
                    callback(null,'');

                  });



            } else {
              callback(null,'');
            }

          });

        }
    ],
    // optional callback
    function(err, results) {
        // the results array will equal ['one','two'] even though
        // the second function had a shorter timeout.

        // restart main loop...

        setTimeout(function() {
                    next(null);
                }, 1000);
    });








  },
  function(err) {
    logger.error("Main Loop Error:" + err);
  }
);

/*
DappBridge_contract.events.setRandomTriger_event()
.on('data', function(event){
    processEvent("setRandomTriger_event", event);
})
.on('changed', function(event){
    // remove event from local database
})
.on('error', logger.error);



// Any logs we've missed..
DappBridge_contract.getPastEvents('setTimeout_event', {fromBlock: last_block_number, toBlock: 'latest'},
  function(error, events){ 
    if(error){
      logger.error("Past Events Error:" + error);
    } else {
      for(c=0; c< events.length; c++) {
        let event = events[c];
        processEvent("setTimeout_event", event);
      }
    }
  });

DappBridge_contract.getPastEvents('setRandomTriger_event', {fromBlock: last_block_number, toBlock: 'latest'},
  function(error, events){ 
    if(error){
      logger.error("Past Events Error:" + error);
    } else {
      for(c=0; c< events.length; c++) {
        let event = events[c];
        processEvent("setRandomTriger_event", event);
      }
    }
  });
*/

function processEvent(eventType, event){
logger.info(util.inspect(event)); // same results as the optional callback above
  let taskType = eventType || "setTimeout_event"; 
  // Other current type  = setRandomNumber_event

  // use the event.sender -> address is not always correct
  let sender = event.returnValues.sender,
  reward = event.returnValues.reward,
  callback_method = event.returnValues.callback_method || ".",
  external_url = event.returnValues.external_url || ".";
  let external_params;
  if(event.returnValues.random_type) {
    external_params = event.returnValues.random_type;
  } else {
    external_params = event.returnValues.external_params || ".";
  }
  let timeout = event.returnValues.timeout || 0;
  let param1 = event.returnValues.param1 || ".";
  let param2 = event.returnValues.param2 || ".";
  let client_created_ts = event.returnValues.client_created_ts || 0;
  let json_extract_element = event.returnValues.json_extract_element || ".";
  let key = event.returnValues.key || ".";


  logger.info("Block #:" + event.blockNumber);
  logger.info("VARS:");
  logger.info(":" + sender);
  logger.info(":" + reward);
  logger.info(":" + callback_method);
  logger.info(":" + external_url);
  logger.info(":" + external_params);
  logger.info(":" + param1);
  logger.info(":" + param2);
  logger.info(":" + timeout);
  logger.info(":" + json_extract_element);
  logger.info(":" + key);
  logger.info("END");

  let bodyJSON = {
    taskType: taskType,
    key: key
  };


// taskType available from MessageGroupId field... (Can only have max 10 attributes on SQS)
  let params = {
   DelaySeconds: 0,
   MessageAttributes: { 
      "sender": {
        DataType: "String",
        StringValue: sender
       },
      "reward": {
        DataType: "Number",
        StringValue: reward
       },
      "callback_method": {
        DataType: "String",
        StringValue: callback_method
       },
      "external_url": {
        DataType: "String",
        StringValue: external_url
       },
      "external_params": {
        DataType: "String",
        StringValue: external_params
       },
      "param1": {
        DataType: "String",
        StringValue: param1
       },
      "param2": {
        DataType: "String",
        StringValue: param2
       },
      "timeout": {
        DataType: "Number",
        StringValue: timeout
       },
       "json_extract_element": {
        DataType: "String",
        StringValue: json_extract_element
       },
       "client_created_ts": {
        DataType: "Number",
        StringValue: client_created_ts
       }

    },
    //MessageGroupId: taskType, // now in messagebody
    //MessageDeduplicationId: event.transactionHash, // Not valid on standard queues
   //MessageBody: taskType,
   MessageBody: JSON.stringify(bodyJSON),
   QueueUrl: AWS_SQS_timeout_event
  };


  sqs.sendMessage(params, function(err, data) {
    if (err) {
      logger.error("SQS Error", err);
    } else {
      logger.info("SQS Success", data.MessageId);
      // mark this as the last block we've processed


      fs.writeFile(LastBlock_filename, event.blockNumber, (err) => {
            if (err) {
              logger.error("Error writing last block log:" + err);
            }
          });


    }
  });
}


console.log('Setup and running');

