const Web3 = require('web3');
const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('config');
const logger = require('./winston/winston_masterTask.js');
const request = require('request');
const leftPad = require('left-pad');

/*

Need a method to protect against getting blocked up
when a contract has been removed or altered...
we can get blocked up retrying it...

*/

const AWS_credentials = new AWS.SharedIniFileCredentials({profile: 'personal-account'});
const util = require("util");

const async = require('async');

AWS.config.credentials = AWS_credentials;
AWS.config.update({region: 'us-east-1'});

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

logger.info("Connecting to WebSocket");
const web3 = new Web3(new Web3.providers.WebsocketProvider(connectionConfig.ws || "ws://127.0.0.1:8546"));

web3.eth.accounts.wallet.add(p_key);

web3.eth.defaultAccount = Account_addr;


const DappBridge_abi = config.DappBridge_abi;
const DappBridge_contract = new web3.eth.Contract(DappBridge_abi, DappBridge_addr);
const External_url_timeout =  connectionConfig.External_url_timeout || 30000; 
const External_url_max_size = connectionConfig.External_url_max_size || 128000; // bytes

const kms = new AWS.KMS();

var mysqlPool = require('./mysql/pool.js');

logger.info("Starting reading master tasks...");

/*
let _test = web3.utils.soliditySha3(
				{type: 'address', value: "0x2fE7143A7d4988Cd05C9B3C6Dd3FC6684fED46C5"},
    			{type: 'uint256', value: parseInt(2147483647)},
    			{type: 'string', value: "callback"},
    			{type: 'string', value: "int"},
    			{type: 'int32', value: parseInt(1)},
    			{type: 'int32', value: parseInt(100)},
    			{type: 'uint32', value: parseInt(0)},
    			{type: 'uint', value: parseInt(1528384624)}
    			);
logger.info(_test);
process.exit();
*/





// main loop here (with pause of n)
async.forever(
	function(next) {

		mainDBProcess(next);

	},
	function(err) {
		logger.error("Main Loop Error:" + err);
	}
);


function mainDBProcess(async_foreverCallback) {

	let sql = "SELECT task_id, taskType, sender, reward, callback_method, external_url, external_params, timeout, ";
	sql += "run_at, param1, param2, sys_total_user_callback_funds, client_created_ts, json_extract_element, `key` from " + connectionConfig.mysql.setTimeout_table + " WHERE run_at <= ";
	sql += "CURRENT_TIME() AND COALESCE(processed, 0) = 0 ORDER BY run_at ASC LIMIT 1;"

	mysqlPool.getConnection(function(err, connection, mysql_done){
		
		if(err) {
			logger.error("MySQL Error:" + err);
			if(async_foreverCallback) {
				async_foreverCallback(err);
			}

		} else {

			connection.query(sql, [], function(err, results){

				if(err){
					logger.error("Error querying db:" + err);
					mysql_done(err);
					if(async_foreverCallback) {
						setTimeout(function() {
							async_foreverCallback(err);
						}, config.masterTaskQuery_pause);
					}

				} else {
					//arr_result[0][0].user_id,
					if(results.length == 0){
						logger.info("No Current Rows -> rescheduling select...");
						mysql_done();
						setTimeout(function() {
							async_foreverCallback(null);
						}, config.masterTaskQuery_pause);
					}

					for(c=0; c<results.length; c++){

						logger.info("Processing result:" + c + " of " + results.length + ": task_id=" + results[c].task_id);

						let _resultItem = results[c];
						//let _requestKey = generateRequestKey(_resultItem);
						let _requestKey = _resultItem.key;

						let _callback = null;


						let _processorCallback = function(err) {
							if(err) {
								mysql_done();
								async_foreverCallback(err);
							} else {
								if(c >= results.length-1){
									logger.info("Processed last db row rescheduling select...");
									// we are on the last entry so we want to callback (Restart) after this one...
									mysql_done();
									setTimeout(function() {
										async_foreverCallback(null);
									}, config.masterTaskQuery_pause);
								}
							}
						};

						logger.info("Request Key=" + _requestKey);


						if(_resultItem.taskType == "setRandomTriger_event"){
							requestRandomEvent(_resultItem, _requestKey, _processorCallback);

						} else {
							// Is setTimeout_event
							if(results[c].external_url != "."){
								// has an external URL...
								//requestExternalURL(_resultItem, _requestKey, _processorCallback);
								requestExternalURL_viaNotaryProxy(_resultItem, _requestKey, _processorCallback);

							} else {
								logger.info("Is direct callback:" + _resultItem.task_id);
								// Direct to processClientCallback
								// processClientCallback(task_id, sender, callback_method, callback_data, 
								// requestKey, requestProof, sys_total_user_callback_funds, gas_used,
								// _return_type, _processorCallback)

								//direct_processClientCallback(task_id, sender, callback_method, callback_data, 
								//				sys_total_user_callback_funds, gas_used, _return_type, _processorCallback)

								direct_processClientCallback(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, "",
									_resultItem.sys_total_user_callback_funds, 0, "", _processorCallback, _requestKey);
								/*
								processClientCallback(_resultItem.task_id, _resultItem.sender, 
									_resultItem.callback_method, "", "", "", 
									_resultItem.sys_total_user_callback_funds,
									0, "", _processorCallback);
								*/
							}

						}

					}



				}
			});
		}
	});
}

let requestExternalURL_viaNotaryProxy = (_resultItem, _requestKey, _processorCallback) => {
	logger.info("Is externalURL via NotaryProxy:" + _resultItem.task_id);
	let returnData = "";
	let returnHash = "";

	// need to use GET or POST with params...
	// validate any external_params (Has to be valid JSON)
	if(_resultItem.external_params!="."){
		try{
			_resultItem.external_params = JSON.parse(_resultItem.external_params);
		}catch(e){
			_resultItem.external_params = ".";
		}
	}

	let _requestMethod = "GET";
	let _requestParams = "";
	let _requestprocess = {};

	if(_resultItem.external_params == ".") {
		
	} else {
		_requestMethod = "POST";
		_requestParams = _resultItem.external_params;
	}

	if(_resultItem.json_extract_element != "." ){
		_requestprocess = {
			"type": "json_extract",
			"value": _resultItem.json_extract_element
		};
	}

	let _requestObj = {
 		"proxyRequest": {
                "request_key": _requestKey,
                "request_url": _resultItem.external_url,
                "method": _requestMethod,
                "postParams": _requestParams,
                "request_process": _requestprocess
            }
    };

    logger.info("NotaryProxy requestObj:" + JSON.stringify(_requestObj));

    let _requestOptions = {
  		url: config.notaryProxy_url,
  		headers: {
    		'x-api-key': config.notaryProxy_key
  		}, 
  		body: JSON.stringify(_requestObj),
  		method: "POST",
		timeout: External_url_timeout
	};

	request(_requestOptions, 
		function (error, response, body) {
		if(error){
			logger.error("NotaryProxy request error:" + error);
			returnData = "";

		} else {
			logger.info("NotaryProxy request statusCode:" + response.statusCode);
			logger.info("NotaryProxy request body:" + body);

			if(body.length <= External_url_max_size) {
				let _bodyJSON = JSON.parse(body);
				if(_bodyJSON.errorMessage) {
					logger.info("NotaryProxy error:" + body);
				} else {
					returnData = _bodyJSON.response_plain_txt;
					returnHash = _bodyJSON.response_hash;
					logger.info("NotaryProxy response_plain_txt:" + returnData);
					logger.info("NotaryProxy response_hash:" + returnHash);
				}
			}
		}

		direct_processClientCallback(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData,
			_resultItem.sys_total_user_callback_funds, 0, "STR", _processorCallback, _requestKey, returnHash);	

	});

}

// UNUSED
function requestExternalURL(_resultItem, _requestKey, _processorCallback) {
	logger.info("Is externalURL:" + _resultItem.task_id);
	let returnData = "";
	// need to use GET or POST with params...
	// validate any external_params (Has to be valid JSON)
	if(_resultItem.external_params!="."){
		try{
			_resultItem.external_params = JSON.parse(_resultItem.external_params);
		}catch(e){
			_resultItem.external_params = ".";
		}
	}

	if(_resultItem.external_params == ".") {
		// Is a GET
		request.get({
				uri: _resultItem.external_url, 
				timeout: External_url_timeout
		}, function (error, response, body) {

			if(error){
				logger.error("Web request error:" + error);
				returnData = "";

			} else {
				logger.info("Web request statusCode:" + response.statusCode);
				logger.info("Web request body:" + body);

				if(body.length <= External_url_max_size) {
					if(_resultItem.json_extract_element != "." ){
						// parse JSON....
						try {
							let jsonBody = JSON.parse(body);
							let extractLvls = _resultItem.json_extract_element.split(".");

							let tmpObj = jsonBody[extractLvls[0]];

							if(extractLvls.length > 1) {
								let maxLength = extractLvls.length;
								if(maxLength > 10)
									maxLength = 10;

								for(c=1; c< maxLength; c++) {
									tmpObj = tmpObj[extractLvls[c]];
								}
								//logger.info("JSON LVL" + c + "=" + tmpObj + ":" + isJsonString(tmpObj));

							}

							if(isJsonString(tmpObj) == false)
								returnData = tmpObj;
							else
								returnData = JSON.parse(tmpObj);

						}catch(e){
							logger.info("ERROR" + e);
							returnData = body;
						}
					} else
						returnData = body;
					//returnData = "A";

				}
				logger.info("Final return data:" + returnData);
			}


			//let _requestProof = generateRequestProof(returnData);

			direct_processClientCallback(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData,
				_resultItem.sys_total_user_callback_funds, 0, "STR", _processorCallback, _requestKey);
			/*
			processCallbackWithProof(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData, 
				_requestKey, _requestProof, _resultItem.sys_total_user_callback_funds, "STR", _processorCallback);
			*/



		});

	} else {
		// Is a POST
		request.post({
				uri: _resultItem.external_url, 
				form: _resultItem.external_params,
				timeout: External_url_timeout
		}, function (error, response, body) {
			if(error){
				logger.error("Web request error:" + error);
				returnData = "";

			} else {
				logger.info("Web request statusCode:" + response.statusCode);
				logger.info("Web request body:" + body);

				if(body.length <= External_url_max_size) {
					returnData = body;
				}
			}

			//let _requestProof = generateRequestProof(returnData);

			direct_processClientCallback(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData,
				_resultItem.sys_total_user_callback_funds, 0, "STR", _processorCallback, _requestKey);
			/*
			processCallbackWithProof(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData, 
				_requestKey, _requestProof, _resultItem.sys_total_user_callback_funds, "STR", _processorCallback);
			*/


		

		});
	}

}

function requestRandomEvent(_resultItem, _requestKey, _processorCallback){
	logger.info("Is randomRequest:" + _resultItem.task_id);
	let returnData = "";
	if(_resultItem.external_params=="int") {
		// random number
		returnData = randomIntFromInterval(_resultItem.param1, _resultItem.param2);

		logger.info("Random number for task_id: " + _resultItem.task_id + "=" + returnData);

		let _requestProof = parseInt(returnData); // we don't hash it locally for INT

		// Data now goes direct (Use processClientCallback)...
		//function processClientCallback(task_id, sender, callback_method, callback_data, 
		//requestKey, requestProof, sys_total_user_callback_funds, gas_used,
		//_return_type, _processorCallback)
		direct_processClientCallback(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData,
			_resultItem.sys_total_user_callback_funds, 0, "INT", _processorCallback, _requestKey);
		/*
		processCallbackWithProof(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData, 
			_requestKey, _requestProof, _resultItem.sys_total_user_callback_funds, "INT", _processorCallback);
		*/


	} else {
		// random Str
		let kms_params = {
		  NumberOfBytes: _resultItem.param1
		 };
		kms.generateRandom(kms_params, function(err, data){
			if(err){
				logger.error("Error generating random string for task_id:" + _resultItem.task_id + ": " + err);
				returnData = "";

			} else {
				returnData = Buffer.from(data.Plaintext).toString('base64');
				logger.info("Random number for task_id: " + _resultItem.task_id + "=" + returnData);

				let _requestProof = generateRequestProof(returnData);
				
				direct_processClientCallback(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData,
					_resultItem.sys_total_user_callback_funds, 0, "STR", _processorCallback, _requestKey);

				/*
				processCallbackWithProof(_resultItem.task_id, _resultItem.sender, _resultItem.callback_method, returnData, 
					_requestKey, _requestProof, _resultItem.sys_total_user_callback_funds, "STR", _processorCallback);
				*/

			}
		})

	}
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function generateRequestKey(_resultItem){

	//Timeout = concat of:
	/*
       address sender, 
       uint256 reward, 
       string callback_method, 
       string external_url,
       string external_params,
       uint32 timeout
    */
    // Else Random
    /*
        address sender; 
        uint256 reward;
        string callback_method;
        string random_type;
        int32 param1;
        int32 param2;
        uint32 timeout;
        uint client_created_ts;
    */
    /*
	let sql = "SELECT task_id, taskType, sender, reward, callback_method, external_url, external_params, timeout, ";
	sql += "run_at, param1, param2, sys_total_user_callback_funds from tbl_setTimeout_task WHERE run_at <= ";
	sql += "CURRENT_TIME() AND COALESCE(processed, 0) = 0 ORDER BY run_at ASC LIMIT 5;"
	*/
	// bytes32 request_key = bytes32(keccak256(msg.sender, msg.value, callback_method, "str", number_of_bytes,int32(0), timeout));
	// bytes32 request_key = sha256(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type, 
    //    _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);


    let requestKey;
    if(_resultItem.taskType.indexOf('Random') < 0)

    	requestKey = web3.utils.soliditySha3(
    			{type: 'address', value: _resultItem.sender},
    			{type: 'uint256', value: parseInt(_resultItem.reward)},
    			{type: 'string', value: _resultItem.callback_method},
    			{type: 'string', value: _resultItem.external_url},
    			{type: 'string', value: _resultItem.external_params}, 
    			{type: 'uint32', value: parseInt(_resultItem.timeout)},
    			{type: 'uint', value: parseInt(_resultItem.client_created_ts)},
    			{type: 'string', value: _resultItem.json_extract_element} );

    else
    	/*
        bytes32 _key = randomEventKey(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type,
            _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);

		function randomEventKey(address _sender, uint256 _reward, string _callback_method, string _random_type,
        	int32 _param1, int32 _param2, uint32 _timeout, uint _client_created_ts) internal pure returns(bytes32)
        */
    	//requestKey = web3.utils.soliditySha3(
    		requestKey = web3.utils.soliditySha3(_resultItem.sender, _resultItem.reward,
    			_resultItem.callback_method, _resultItem.external_params,
    			_resultItem.param1, _resultItem.param2, _resultItem.timeout,
    			_resultItem.client_created_ts);
    		/*
    			{type: 'address', value: _resultItem.sender},
    			{type: 'uint256', value: parseInt(_resultItem.reward)},
    			{type: 'string', value: _resultItem.callback_method},
    			{type: 'string', value: _resultItem.external_params},
    			{type: 'int32', value: parseInt(_resultItem.param1)},
    			{type: 'int32', value: parseInt(_resultItem.param2)},
    			{type: 'uint32', value: parseInt(_resultItem.timeout)},
    			{type: 'uint', value: parseInt(_resultItem.client_created_ts)}
    			);
*/

	return requestKey;
	//let requestProof = web3.utils.keccak256(callback_data);
}
function generateRequestProof(_data) {
	return web3.utils.soliditySha3({type: 'string', value: _data.toString()});
}

function keccak256(...args) {
  args = args.map(arg => {
    if (typeof arg === 'string') {
      if (arg.substring(0, 2) === '0x') {
          return arg.slice(2)
      } else {
          return web3.utils.toHex(arg).slice(2)
      }
    }

    if (typeof arg === 'number') {
      return leftPad((arg).toString(16), 64, 0)
    } else {
      return ''
    }
  })

  args = args.join('')

  return web3.utils.sha3(args, { encoding: 'hex' })
}

// unused
function processCallbackWithProof(task_id, sender, callback_method, callback_data, 
	requestKey, requestProof, sys_total_user_callback_funds, _return_type, _processorCallback) {

	// callback_method needs encoding to its ABI
	/*callback_method = web3.eth.abi.encodeFunctionSignature({
		name: callback_method,
		type: 'function',
		inputs: [{
			type: 'string',
			name: 'randomString'
		}]
	});*/
	//callback_method = web3.utils.soliditySha3(callback_method + "(string)");
	//callback_method += "(string)";
	//logger.info("Method ABI:" + task_id + ":ABI:" + callback_method)

	// construct the first callback (To our dAppBridge.private_receiveCallbackProof...

	// Start with gas price...
	web3.eth.getGasPrice(function(err, gasPrice){
		if(err) {
			logger.error("Unable to get gas price:" + task_id + ":" + util.inspect(err));
			_processorCallback(); // move onto next DB entry
			return;
		} else {
			let gas_used = 0;

			if(_return_type == "STR"){

				// Now estimate cost for private_receiveCallbackProof

				DappBridge_contract.methods.private_receiveCallbackProof(
								requestKey,
								sender,
								requestProof
					).estimateGas(function(err, estimatedGas){

						gas_used += estimatedGas;

						// Now construct the full tx:
						let callbackMethod_tx_data = DappBridge_contract.methods.private_receiveCallbackProof(
								requestKey,
								sender,
								requestProof
							).encodeABI();


						// Loop here until we suceed....

						let tx_tries = 0;
						let process_complete = false;
						/*
						async.forever(
							function(next) {
						*/

						async.whilst(
							function() { return tx_tries < config.max_tx_tries && process_complete == false},
							function(async_callback) {



								//tx_tries++;
								//if(tx_tries > config.max_tx_tries) 
								//	next(tx_tries);

								// Get the next available nonce...
								web3.eth.getTransactionCount(Account_addr, function(err, result){

									if(err){
										logger.error("Error getting nonce_val:" + err);
										//_processorCallback(); // move onto next DB entry
										async_callback(err);
										//return;
									}


									let nonce_val = result;

									let callback_tx = {
									  to: DappBridge_addr,
									  gas: estimatedGas,
									  gasPrice: gasPrice,
									  nonce: nonce_val,
									  data: callbackMethod_tx_data
									};

									// Sign & send tx
									web3.eth.accounts.signTransaction(callback_tx, p_key, function(error, result){

										logger.info("Raw TX: " + util.inspect(result));

										web3.eth.sendSignedTransaction(result.rawTransaction, function(error,result){

											if(error){
												logger.error("Error sending callback tx:" + task_id + ":" + util.inspect(error));
												// likely due to nonce value -> we've still got a pending tx so need to retry
												//next();
										        setTimeout(function() {
										        	tx_tries++;
										            async_callback(null);
										        }, config.tx_retry_delay || 15000); // wait 15seocnds
												

											} else {
												logger.info("Callback complete to dAppBridge.private_receiveCallbackProof (Receipt):" + task_id + ":")
												logger.info(result);

												// We've sent the proof, so now move onto the actual client callback...

											  	process_complete = true;
											  	async_callback(null);
												//next(true);

											}

										}); // END of sendSignedTransaction

									});	// END of signTransaction

								}); // END of getTransactionCount

							}, function(err) {
								if(process_complete) {
									processClientCallback(task_id, sender, callback_method, callback_data, 
										requestKey, requestProof, sys_total_user_callback_funds, gas_used,
										_return_type, _processorCallback);
								} else {
									logger.error("Main Loop Error sending signed transaction for private_receiveCallbackProof:" + err);
									_processorCallback(); // move onto next DB entry									
								}

							}
						); // END of async.whilst

					}); // END of estimateGas

			} else {

				// Now estimate cost for private_receiveProofInt

				DappBridge_contract.methods.private_receiveProofInt(
								requestKey,
								sender,
								requestProof
					).estimateGas(function(err, estimatedGas){

						gas_used += estimatedGas;

						// Now construct the full tx:
						let callbackMethod_tx_data = DappBridge_contract.methods.private_receiveProofInt(
								requestKey,
								sender,
								requestProof
							).encodeABI();


						// Loop here until we suceed....
						let tx_tries = 0;

						let process_complete = false;

						async.whilst(
							function() { return tx_tries < config.max_tx_tries && process_complete == false; },
							function(async_callback) {


								logger.info("INT TRY:" + tx_tries);

								// Get the next available nonce...
								web3.eth.getTransactionCount(Account_addr, function(err, result){

									if(err){
										logger.error("Error getting nonce_val:" + err);
										async_callback(err);
										//_processorCallback(); // move onto next DB entry
										//return;
									}
									let nonce_val = result;

									let callback_tx = {
									  to: DappBridge_addr,
									  gas: estimatedGas,
									  gasPrice: gasPrice,
									  nonce: nonce_val,
									  data: callbackMethod_tx_data
									};

									// Sign & send tx
									web3.eth.accounts.signTransaction(callback_tx, p_key, function(error, result){

										logger.info("Raw TX: " + util.inspect(result));

										web3.eth.sendSignedTransaction(result.rawTransaction, function(error,result){
											if(error){
												logger.error("Error sending callback tx:" + task_id + ":" + util.inspect(error));
												// likely due to nonce value -> we've still got a pending tx so need to retry
												//next();
										        setTimeout(function() {
										        	tx_tries++;
										            async_callback(null);
										        }, config.tx_retry_delay || 15000); // wait 15seocnds

											} else {
												logger.info("Callback complete to dAppBridge.private_receiveCallbackProof (Receipt):" + task_id + ":")
												logger.info(result);

												// We've sent the proof, so now move onto the actual client callback...
												process_complete = true;
												async_callback(null);
												//next(true);

											}

										}); // END of sendSignedTransaction

									});	// END of signTransaction

								}); // END of get TransactionCount

							}, function(err) {
								if(process_complete==true){

							        setTimeout(function() {

										processClientCallback(task_id, sender, callback_method, callback_data, 
											requestKey, requestProof, sys_total_user_callback_funds, gas_used,
											_return_type, _processorCallback);

							        }, config.tx_retry_delay || 15000); // wait 15seocnds


									
								} else {
									logger.error("Main Loop Error sending signed transaction for private_receiveCallbackProof:" + err);
									_processorCallback(); // move onto next DB entry
								}
							} 

						); // AYNC.whilst


					}); // END of estimateGas

			}
		}
	}); // END of getGasPrice


}

// unused
function processClientCallback(task_id, sender, callback_method, callback_data, 
	requestKey, requestProof, sys_total_user_callback_funds, gas_used,
	_return_type, _processorCallback) {

	//let callback_method_ABI = web3.utils.soliditySha3(callback_method);
	let gas_price = 0;

	// Start with gas price...
	web3.eth.getGasPrice(function(err, result){
		if(err){
			logger.error("Error getting gas price!!:" + task_id + ":" + util.inspect(err));
			_processorCallback(); // move onto next DB entry
			return;

		} else {
			let gas_price = parseInt(result);
		}


		// This should be in its own loop here...
		let tx_tries = 0;

		let process_complete = false;

		async.whilst(
			function() { return tx_tries < config.max_tx_tries && process_complete == false; },

			function(async_callback) {

				// Now estimate cost of callback...
				logger.info("===" + _return_type);
				logger.info("===" + requestKey);
				logger.info("===" + callback_data);
				let callback_tx_data;
				
				let _tx_data = {};
				if(_return_type == "STR"){
					_tx_data = web3.eth.abi.encodeFunctionCall({
					    name: callback_method,
					    type: 'function',
					    inputs: [{
					        type: 'string',
					        name: 'requestKey'
					    },{
					        type: 'string',
					        name: 'callbackData'
					    }]
					    }, [requestKey, callback_data]);

				} else {
					//callbackInt(string requestKey, int callbackData)
					if(_return_type == "") {
						// Is simple callback - no params
						/*
						_tx_data = web3.eth.abi.encodeFunctionCall({
						    name: callback_method,
						    type: 'function', 
						    inputs: []});
						 */
						 _tx_data = web3.eth.abi.encodeFunctionSignature(callback_method + "()");

					} else {
						_tx_data = web3.eth.abi.encodeFunctionCall({
						    name: callback_method,
						    type: 'function',
						    inputs: [{
						        type: 'string',
						        name: 'requestKey'
						    },{
						        type: 'int256',
						        name: 'callbackData'
						    }]
						    }, [requestKey, callback_data]);

					}
				}
				callback_tx_data ={
						to: sender,
						data: _tx_data
					}; 

// INPUT SHOULD BE: 0x083b2732
// WE HAVE: )       0x083b2732

				logger.info("Client Callback TX DATA [" + sender + "." + callback_method + "]:(" + requestKey + "," + callback_data + ")" + _tx_data);

				web3.eth.estimateGas(callback_tx_data, function(err,result){
					if(err){
						logger.error("Error getting estimated gas for client callback:" + task_id + ":" + err);
						tx_tries++;

				        setTimeout(function() {
				        	tx_tries++;
				            async_callback(null);
				        }, config.tx_retry_delay || 15000); // wait 15seocnds
						//_processorCallback(); // move onto next DB entry

					} else {
						estimatedGas = result;

						gas_used + estimatedGas; 
						let refund = sys_total_user_callback_funds - estimatedGas;
						logger.info("Refunding for task_id:" + task_id + ":" + refund + ": estimatedGas:" + estimatedGas);

						let callback_tx = {};
						//refund = 0;

						web3.eth.getTransactionCount(Account_addr, function(err, result){

							if(err){
								logger.error("Error getting nonce_val:" + task_id + ":" + util.inspect(err));
								tx_tries++;

						        setTimeout(function() {
						        	tx_tries++;
						            async_callback(null);
						        }, config.tx_retry_delay || 15000); // wait 15seocnds
								//_processorCallback(); // move onto next DB entry
								//return;
							}
							let nonce_val = result;

							if(refund > 0){
								callback_tx = {
									from: connectionConfig.Account_addr,
								  	to: sender,
								  	value: refund,
								  	gas: estimatedGas,
								  	gasPrice: gas_price,
								  	nonce: nonce_val,
								  	data: _tx_data 
								};
							} else {
								// WORKING
								callback_tx = {
									from: connectionConfig.Account_addr,
								  	to: sender,
								  	gas: estimatedGas,
								  	gasPrice: gas_price,
								  	nonce: nonce_val,
								  	data: _tx_data
								};
							}

							// Now sign and send tx
							logger.info("Signing tx: + callback_tx");

							web3.eth.accounts.signTransaction(callback_tx, p_key, function(err, result){
										logger.info("Raw TX: " + result.rawTransaction);

										web3.eth.sendSignedTransaction(result.rawTransaction, function(error,result){
											if(error){
												logger.error("Error sending withdraw tx:" + task_id + ":" + util.inspect(error));
												
												//_processorCallback(); // move onto next DB entry
												tx_tries++;

										        setTimeout(function() {
										        	tx_tries++;
										            async_callback(null);
										        }, config.tx_retry_delay || 15000); // wait 15seocnds

											} else {
												logger.info("Client Callback complete [" + callback_method + "] (Receipt):" + task_id)
											  	logger.info(result);
											  	process_complete = true;
											  	async_callback(null);
											  	//completeEntryInDB(task_id, _processorCallback); // LEAVE IN DB FOR TESTING
											}
										});// END of sendSignedTraction

								}); // END of signTransaction


						}); // END of getTransactionCount
					}

				}); // END of estimateGas
			}, 
			function(err) {
				if(process_complete) {
					completeEntryInDB(task_id, _processorCallback);
				} else {				
				_processorCallback(); // move onto next DB entry
				}
		}); // END of async.whilst

	}); // END of getGasPrice



}




function direct_processClientCallback(task_id, sender, callback_method, callback_data, 
				sys_total_user_callback_funds, gas_used, _return_type, _processorCallback, _requestKey, returnHash) {

	let gas_price = 10000000000;

	// Start with gas price...
	/*
	web3.eth.getGasPrice(function(err, result){
		if(err){
			logger.error("Error getting gas price!!:" + task_id + ":" + util.inspect(err));
			_processorCallback(); // move onto next DB entry
			return;

		} else {
			logger.info("GAS PRICE:" + result);
			gas_price = parseInt(result);
			logger.info("GAS PRICE:" + gas_price);
		}
	*/
		gas_price = config.gasPrice;
		logger.info("Using config gas price:" + gas_price);

		// This should be in its own loop here...
		let tx_tries = 0;

		let process_complete = false;

		async.whilst(
			function() { return tx_tries < config.max_tx_tries && process_complete == false; },

			function(async_callback) {

				// Now estimate cost of callback...
				logger.info("===" + _return_type);
				logger.info("===" + callback_data);
				let callback_tx_data;
				
				let _tx_data = {};
				if(_return_type == "STR"){
					_tx_data = web3.eth.abi.encodeFunctionCall({
					    name: callback_method,
					    type: 'function',
					    inputs: [{
					        type: 'bytes32',
					        name: 'key'
					    }, {
					        type: 'string',
					        name: 'callbackData'
					    }]
					    }, [_requestKey, callback_data.toString()]);

				} else {

					if(_return_type == "") {
						// Is simple callback - no params
						
						_tx_data = web3.eth.abi.encodeFunctionCall({
						    name: callback_method,
						    type: 'function', 
						    inputs: [{
							        type: 'bytes32',
							        name: 'key'
							    }]}, [_requestKey]);
						 
						// _tx_data = web3.eth.abi.encodeFunctionSignature(callback_method + "()");

					} else {

						if(isNaN(callback_data)) {
							callback_data = 0;
						}

						_tx_data = web3.eth.abi.encodeFunctionCall({
						    name: callback_method,
						    type: 'function',
						    inputs: [{
						        type: 'bytes32',
						        name: 'key'
						    },{
						        type: 'int256',
						        name: 'callbackData'
						    }]
						    }, [_requestKey,callback_data]);

					}
				}
				callback_tx_data ={
						from: connectionConfig.Account_addr,
						to: sender,
						data: _tx_data
					}; 

				// INPUT SHOULD BE: 0x083b2732
				// WE HAVE: )       0x083b2732
				// logger.info(_requestKey);
				logger.info("Client Callback TX DATA [" + sender + "." + callback_method + "]:" + _tx_data);

				web3.eth.estimateGas(callback_tx_data, function(err,result){
					if(err){
						logger.error("Error getting estimated gas for client callback:" + task_id + ":" + err);
						tx_tries++;

				        setTimeout(function() {
				        	tx_tries++;
				            async_callback(null);
				        }, config.tx_retry_delay || 15000); // wait 15seocnds
						//_processorCallback(); // move onto next DB entry

					} else {
						estimatedGas = result;

						gas_used + estimatedGas; 
						let refund = sys_total_user_callback_funds - estimatedGas;
						if(refund > 100000){
							// use some of this gas to speed up the tx
							estimatedGas = estimatedGas + 100000;
							gas_used += 100000;
							refund -= 100000;

						}
						logger.info("Refunding for task_id:" + task_id + ":" + refund + ": estimatedGas:" + estimatedGas);

						let callback_tx = {};
						//refund = 0;

						/*
						test working tx:
						0xcac953200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a372c3631362e3336363300000000000000000000000000000000000000000000

						our _tx_data matches:
						0xcac953200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a372c3631362e3336363300000000000000000000000000000000000000000000
						*/

						// Possibility is we have our gas_price too low and it is being rejected further down the line????
						// The none error response from sendSignedTransaction may not indicate acceptance!!!


						web3.eth.getTransactionCount(Account_addr, function(err, result){

							if(err){
								logger.error("Error getting nonce_val:" + task_id + ":" + util.inspect(err));
								tx_tries++;

						        setTimeout(function() {
						        	tx_tries++;
						            async_callback(null);
						        }, config.tx_retry_delay || 15000); // wait 15seocnds
								//_processorCallback(); // move onto next DB entry
								//return;
							}
							let nonce_val = result;

							if(tx_tries > 0) {
								gas_price += 1000;
							}

							if(refund > 0){
								callback_tx = {
									from: connectionConfig.Account_addr,
								  	to: sender,
								  	value: refund,
								  	gas: estimatedGas,
								  	gasPrice: gas_price,
								  	nonce: nonce_val,
								  	data: _tx_data 
								};
							} else {
								// WORKING
								callback_tx = {
									from: connectionConfig.Account_addr,
								  	to: sender,
								  	gas: estimatedGas,
								  	gasPrice: gas_price,
								  	nonce: nonce_val,
								  	data: _tx_data
								};
							}

							// Now sign and send tx
							logger.info("Signing tx: + callback_tx:" + util.inspect(callback_tx));

							web3.eth.accounts.signTransaction(callback_tx, p_key, function(err, result){
										logger.info("Raw TX: " + result.rawTransaction);

										web3.eth.sendSignedTransaction(result.rawTransaction)
										.on('error', function(error){
											logger.error("Error sending final tx:" + task_id + ":" + util.inspect(error));
											
											//_processorCallback(); // move onto next DB entry
											tx_tries++;

									        setTimeout(function() {
									        	tx_tries++;
									            async_callback(null);
									        }, config.tx_retry_delay || 15000); // wait 15seocnds
										})
										.then(function(receipt){
											logger.info("Client Callback complete [" + callback_method + "] (Receipt):" + task_id)
										  	logger.info(result);
										  	process_complete = true;
										  	async_callback(null);
										});


										

								}); // END of signTransaction


						}); // END of getTransactionCount
					}

				}); // END of estimateGas
			}, 
			function(err) {
				if(process_complete) {
					completeEntryInDB(task_id, _processorCallback);
				} else {				
				_processorCallback(); // move onto next DB entry
				}
		}); // END of async.whilst

	//}); // END of getGasPrice

} 




function completeEntryInDB(task_id, _processorCallback){

	mysqlPool.getConnection(function(err, connection, mysql_done) {
		if(err) {
			logger.error("MySQL Error:" + task_id + ":" +  util.inspect(err));
			mysql_done(err);
			_processorCallback(); // move onto next DB entry
		} else {

						
			let sql = "UPDATE " + connectionConfig.mysql.setTimeout_table + " SET processed = 1, processed_at = CURRENT_TIME() WHERE task_id = ?";

			let sqlArgs = [
				task_id
			];

			logger.info("Query Args:" + sqlArgs);

			logger.info(connection.format(sql,sqlArgs));

			connection.query(sql, sqlArgs, function(err, results){
				if(err){
					logger.error("Error adding to db:" + err);
					mysql_done(err);
					_processorCallback(); // move onto next DB entry
				} else {
					logger.info("Task processed complete: " + task_id);
					mysql_done();
					_processorCallback(); // move onto next DB entry
				}

			});
			

		}
	});
}


function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// if contains external_url-> request with timeout
// -- if it returns a JSON output capture (e.g: https://api.coindesk.com/v1/bpi/currentprice.json)
// call sender method (With any data)
// if any remaining reward return to sender
// make entry in db as processed
// log how much we made on this item
// loop

