// Need a safe exit method which reset all current queue messages back....
// Need a Dead Letter Queue enabled to prevent constant looping of dead messages (Once all bugs are ironed out)
const Web3 = require('web3');
const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('config');
const logger = require('./winston/winston_timeoutQueue.js');
const helpers = require('./helpers');


const async = require('async');


const AWS_credentials = new AWS.SharedIniFileCredentials({profile: 'personal-account'});
const util = require("util");
const sqsConsumer = require('sqs-consumer');
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

const web3 = new Web3(new Web3.providers.WebsocketProvider(connectionConfig.ws || "ws://127.0.0.1:8546"));
var mysqlPool = require('./mysql/pool.js');
var nonce_incrementor = 0;

web3.eth.accounts.wallet.add(p_key);

web3.eth.defaultAccount = Account_addr;


const DappBridge_abi = config.DappBridge_abi;
const DappBridge_contract = new web3.eth.Contract(DappBridge_abi, DappBridge_addr);

const sqs = new AWS.SQS({
	apiVersion: '2012-11-05',
	credentials: AWS_credentials});

const sqsApp = sqsConsumer.create({
	queueUrl: AWS_SQS_timeout_event,
	handleMessage: processMsg,
	attributeNames: ["SentTimestamp", "MessageGroupId"],
	messageAttributeNames: [ "json_extract_element","sender","reward","callback_method","external_url",
				"external_params","timeout","param1","param2", "client_created_ts", "key" ],
	batchSize: 1,
	visibilityTimeout: 300,
	terminateVisibilityTimeout: true,
	waitTimeSeconds: 2,
	sqs: sqs
});

sqsApp.on('error', (err) => {
  logger.error("Error with SQS Consumer: " + err.message);
});

sqsApp.start();

logger.info("Starting reading timeoutQueue");




function processMsg(queueMsg, done){
	
  	logger.info("Received Msg:" + util.inspect(queueMsg));
  	// If we use a standard queue (Rather than FIFO) we get better performance
  	// but need to check we haven't already had this queueMsg...
  	checkMsgDuplicate(queueMsg.MessageId, function(alreadyProcessed,err){
  		if(alreadyProcessed) {
  			// delete message
  			logger.error("Msg already received and processed:" + util.inspect(queueMsg));
  			done(); // remove from sqs queue

  		} else if (err) {
  			logger.error("Error checking if already processed:" + util.inspect(err) + ":" + util.inspect(queueMsg));
  			done(err);

  		} else {
  			// process as normal...
  	
		  	// The withdrawels need batching up to be more efficient in the future
		  	// E.g. run 10 messages and batch up the reward for all of them and withdraw in one go

		    if(parseInt(queueMsg.MessageAttributes.reward.StringValue) < 0) {
		    	// We've already seen this message and withdrawn the funds - just need to try and process it again...
		    	addMsgToDB(queueMsg, done);	

		    } else {
			    // Withdraw the reward to the bank wallet...
			    // Also need to withdraw the gas to the owner wallet (Which will be used to call the clients callback)
			    //
			    // CURRENT db.reward = total amount sent by client
			    // SO formula is:
			    // amount to bank wallet = 
			    // dAppBridge.min_reward||min_reward
			    //
			    // amount to owner wallet = 
			    // db.reward - (dAppBridge.min_reward||min_reward)
			    //
			    // (And then on masterTask_process we can refund any remainder after estiamte gas of that last item)

			    let ownerReward =  parseInt(queueMsg.MessageAttributes.reward.StringValue);
			    // is the total amount sent to the contract

			    if(queueMsg.Body.indexOf("RETRY2") > -1) {
			    	// A retry on withdrawel of part2...
				    DappBridge_contract.methods.min_reward().call(function(err, result){
				    	if(err){
				    		logger.error("Error getting reward amount:" + util.inspect(err));
				    		done(err);
				    	} else {

    						ownerReward = ownerReward - parseInt(result);
    						logger.info("Retry Owner Cost " + ownerReward + " to Addr:" + connectionConfig.Account_addr + " for task:" + queueMsg.MessageId);
    						processWithdrawal(ownerReward, connectionConfig.Account_addr, true);
    					}

    				});

			    } else {

				    if(queueMsg.Body.indexOf('Random') < 0){
				    	DappBridge_contract.methods.min_reward().call(function(err, result){
				    	
				    		if(err){
				    			logger.error("Error getting reward amount:" + util.inspect(err));
				    			done(err);
				    		} else {


				    			
				    			// if connectionConfig.Bank_addr == connectionConfig.Account_addr combine into one action...
				    			if(connectionConfig.Account_addr == connectionConfig.Bank_addr) {

				    				// result = min_reward which is our fee?
				    				// getDappBridgeGasCost(true) = our gas requirement for processing (200,000)

				    				logger.info("Standard Task: Withdrawing full fee, one shot " + result + " to bankAddr:" + connectionConfig.Account_addr + " for task:" + queueMsg.MessageId);
				    				processWithdrawal(parseInt(result), connectionConfig.Account_addr, true);
				    			}
				    			else {

					    			logger.info("Standard Task: Withdrawing our fee " + result + " to bankAddr:" + connectionConfig.Bank_addr + " for task:" + queueMsg.MessageId);
					    			processWithdrawal(parseInt(result), connectionConfig.Bank_addr, false, function(){
					    				// run another withdrawal only if the first succeeds...
					    				// This one is to withdraw the processing cost to the main account addrewss
					    				ownerReward = ownerReward - parseInt(result);
					    				nonce_incrementor++; // To allow another quick tx
					    				logger.info("Standard Task Owner Cost " + ownerReward + " to Addr:" + connectionConfig.Account_addr + " for task:" + queueMsg.MessageId);
					    				
										setTimeout(function() {
								        	processWithdrawal(ownerReward, connectionConfig.Account_addr, true);
								        }, config.tx_retry_delay || 15000); // wait 15seocnds before starting the next tx
					    			});
					    		}
				    		}

				    	});
				    } else {
						DappBridge_contract.methods.min_random_reward().call(function(err, result){
				    		if(err){
				    			logger.error("Error getting reward amount:" + err);
				    			done(err);
				    		} else {
				    			logger.info("Random Task: Withdrawing our fee " + result + " to bankAddr:" + connectionConfig.Bank_addr + " for task:" + queueMsg.MessageId);
				    			processWithdrawal(parseInt(result), connectionConfig.Bank_addr, false, function(){
				    				logger.info("Random Task: Withdrawing our free succeeds");
				    				// run another withdrawal only if the first succeeds...
				    				// This one is to withdraw the processing cost to the main account addrewss
				    				ownerReward = ownerReward - parseInt(result);
				    				nonce_incrementor++; // To allow another quick tx
				    				logger.info("Random Owner Cost " + ownerReward + " to Addr:" + connectionConfig.Account_addr + " for task:" + queueMsg.MessageId);

							        setTimeout(function() {
							        	processWithdrawal(ownerReward, connectionConfig.Account_addr, true);
							        }, config.tx_retry_delay || 15000); // wait 15seocnds before starting the next tx
				    				
				    			});
				    		}

				    	});
				    }

				}

				let processWithdrawal = function(withdrawAmount, toAddress, completeDBEntry, callback) {

					// Start by getting gas price...
					/*
					web3.eth.getGasPrice(function(err, gasPrice){
						if(err){
							logger.error("Unable to get gas price: " + util.inspect(err));
							done(err);

						} else {
					*/

							let gasPrice = config.gasPrice;
							logger.info("Using config gas price:" + gasPrice);



							// now estimate cost of private_withdraw...
							DappBridge_contract.methods.private_withdraw(
									withdrawAmount, 
									toAddress
							).estimateGas(function(err, estimatedGas){

								if(err){
									logger.error("Unable to estiamte cost of private_withdraw:" + err);
									done(err); // We need a DLX after 10 tries
									
								} else {
									logger.info("Withdraw method estimated cost:" + util.inspect(estimatedGas) );	
									// Now we can get the next available nonce...

									// repeat this block x times, getting a new nonce value each failure....
									let tx_tries = 0;
									let process_complete = false;


									async.whilst(
										function() { return tx_tries < config.max_tx_tries && process_complete == false; },
										//function() { return tx_tries < config.max_tx_tries},
										function(async_callback) {
											
											let _gasPrice = parseInt(gasPrice);
											if(tx_tries > 0)
												_gasPrice +=10; // not helping... still have to wait for previous tx to complete


											web3.eth.getTransactionCount(Account_addr, function(err, result){

												if(err){
													logger.error("Error getting Transaction Count:" + util.inspec(err));
													// can't carry without a nonce on so exit loop
													done(err);
													async_callback(err);

												} else {
													let nonce_val = result; 

													let withdraw_tx_data = 
														DappBridge_contract.methods.private_withdraw(
																withdrawAmount, 
																toAddress
															).encodeABI();

													// and sign the transaction...
													var withdraw_tx = {
													  to: DappBridge_addr,
													  gas: estimatedGas,
													  gasPrice: _gasPrice,
													  nonce: nonce_val,
													  data: withdraw_tx_data
													};

													web3.eth.accounts.signTransaction(withdraw_tx, p_key, function(err, result){
														logger.info("completeDBEntry:" + completeDBEntry);
														logger.info("Raw TX: " + result.rawTransaction);
														logger.info("Signed TX:" + util.inspect(result));

														web3.eth.sendSignedTransaction(result.rawTransaction)
														.on('error', function(error){
															logger.error("Error sending withdraw tx: to:" +  toAddress + " try: " + tx_tries + "::" + error);

													        setTimeout(function() {
													        	tx_tries++;
													            async_callback(null);
													        }, config.tx_retry_delay || 15000); // wait 15seocnds
														})
														.then(function(receipt){
														//, function(error,result){
/*
															if(error){
																logger.error("Error sending withdraw tx: to:" +  toAddress + " try: " + tx_tries + "::" + error);
	
																
														        setTimeout(function() {
														        	tx_tries++;
														            async_callback(null);
														        }, config.tx_retry_delay || 15000); // wait 15seocnds



															} else {
																*/
																logger.info("Withdraw complete (Receipt):" + queueMsg.MessageId + ":" + completeDBEntry)
															  	logger.info(receipt);



															  	process_complete = true;
															  	async_callback(null);

															//}
														});// end sendSignTransaction

													}) //end signTransaction


												}
											}); // end of getTransactionCount


										},
										function(err) {
											logger.info("END");
											if(process_complete==true){

												if(callback){
													logger.info("HAVE CALLBACK");
													callback();

												} else
												{
													if(completeDBEntry){
														addMsgToDB(queueMsg, ownerReward, done);
													} else {
														done();
													}
												}

											} else {
												if(tx_tries >= config.max_tx_tries)
													err = "Err: Too many tries";

												logger.error("Main Loop Error sending signed transaction:" + err);
												if(completeDBEntry) {
													logger.error("Was on second withdrawal part..." + queueMsg.MessageId);
													//nonce_incrementor++;
													resetMsgPart2Withdraw(queueMsg);
													done(err);
												} else {
													done(err); 
												}
												//done(err);
											}
										}
									);

									

								}
							}); // end of estateGas

						//}

					//}); // end getGasPrice
				}; // end of processWithdrawal function

			} // end of else for process as normal
		}

  	});
}

function checkMsgDuplicate(sqs_MessageId, callback) {
	mysqlPool.getConnection(function(err, connection, mysql_done){
		if(err) {
			logger.error("MySQL Error:" + err);
			mysql_done(err);
		    callback(false, err);
		} else {


			// key & timestamp reserved words so escape...							
			let sql = "SELECT sqs_MessageId FROM " + connectionConfig.mysql.setTimeout_table + " WHERE sqs_MessageId = ? ";
			let sqlArgs = [sqs_MessageId];


			connection.query(sql, sqlArgs, function(err, results){
				if(err){
					mysql_done(err);
					callback(false,err);
				} else 
				{
					mysql_done();
					if (results.length > 0)
						callback(true,'Err: Msg Already Processed');
					else
						callback(false);
				}
			});
		}
	});
}

function addMsgToDB(queueMsg, ownerReward, msg_done){

	/*
    var deleteParams = {
      QueueUrl: AWS_SQS_timeout_event,
      ReceiptHandle: queueMsg.ReceiptHandle
    };
    */

	mysqlPool.getConnection(function(err, connection, mysql_done){
		if(err) {
			mysql_done(err);
			logger.error("MySQL Error:" + err);
			// Add message back to queue....
			// add it as a new message with reward reversed (E.g. 100 = -100) = this indicates we don't need to withdraw again
			
			/*
		    sqs.deleteMessage(deleteParams, function(err, data) {
		      if (err) {
		        logger.error("Unable to delete message!");
		      } else {
		        logger.info("Removed previous msg instance: " + queueMsg.MessageId);
		      }
		    });
			*/
		    resetMsg(queueMsg);
		    //msg_done(err);
		    //callback(err);
		    //msg_done(err);


		} else {


			// key & timestamp reserved words so escape...							
			let sql = "INSERT INTO " + connectionConfig.mysql.setTimeout_table + " (sqs_MessageId, json_extract_element, taskType, sender, reward, callback_method, external_url, " 
				+ "external_params, timeout, run_at, param1, param2, created_at, created_by, sys_total_user_callback_funds, client_created_ts, `key`) ";
			sql += ' VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(CURRENT_TIME, INTERVAL ? SECOND), ?, ?, CURRENT_TIME(), ?, ?, ?, ?)'

			// normalize reward incase we've reversed it (We reverse when we've seen the msg before)
			let _reward = parseInt(queueMsg.MessageAttributes.reward.StringValue);
			if(_reward < 0)
				_reward = _reward * -1;

			let _body = queueMsg.Body;
			if(_body.indexOf("|") > 0){
				_body = queueMsg.Body.split("|")[1];
			}

			let bodyJSON = {};
			try{
				bodyJSON = JSON.parse(_body);
			} catch(e){

			}


			let sqlArgs = [
				queueMsg.MessageId,
				queueMsg.MessageAttributes.json_extract_element.StringValue,
				bodyJSON.taskType,
				queueMsg.MessageAttributes.sender.StringValue,
				_reward.toString(),
				queueMsg.MessageAttributes.callback_method.StringValue,
				queueMsg.MessageAttributes.external_url.StringValue,
				queueMsg.MessageAttributes.external_params.StringValue,
				queueMsg.MessageAttributes.timeout.StringValue,
				queueMsg.MessageAttributes.timeout.StringValue,
				queueMsg.MessageAttributes.param1.StringValue,
				queueMsg.MessageAttributes.param2.StringValue,
				config.id,
				ownerReward,
				queueMsg.MessageAttributes.client_created_ts.StringValue,
				bodyJSON.key
			];

			logger.info("Query Args:" + sqlArgs);

			logger.info(connection.format(sql,sqlArgs));

			connection.query(sql, sqlArgs, function(err, results){
				if(err){
					logger.error("Error adding to db:" + err);
					// Add message back to queue....
					/*
				    sqs.deleteMessage(deleteParams, function(err, data) {
				      if (err) {
				        logger.error("Unable to delete message!");
				      } else {
				        logger.info("Removed previous msg instance: " + queueMsg.MessageId);
				      }
				    });
					*/

					mysql_done(err);
					resetMsg(queueMsg);
					//done(err);
					msg_done(err);
					/*
					sqs.changeMessageVisibility({
						QueueUrl: AWS_SQS_timeout_event,
						ReceiptHandle: queueMsg.ReceiptHandle,
						VisibilityTimeout: 0
					});
					*/

				} else {
					// And then if all above OK->
					logger.info("Delete msg stage"); 
					mysql_done();
					msg_done();
					//callback(true)
					
				}

			});
			

		}
	});
}

function resetMsg(msg){
	let params = {
	   DelaySeconds: 0,
	   MessageAttributes: { 
	      "sender": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.sender.StringValue
	       },
	      "reward": {
	        DataType: "Number",
	        StringValue: (parseInt(msg.MessageAttributes.reward.StringValue)*-1).toString()
	       },
	      "callback_method": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.callback_method.StringValue
	       },
	      "external_url": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.external_url.StringValue
	       },
	      "external_params": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.external_params.StringValue
	       },
	      "param1": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.param1.StringValue
	       },
	      "param2": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.param2.StringValue
	       },
	      "timeout": {
	        DataType: "Number",
	        StringValue: msg.MessageAttributes.timeout.StringValue
	       },
	       "json_extract_element": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.json_extract_element.StringValue
	       },
	       "client_created_ts": {
	       	DataType: "Number",
	       	StringValue: msg.MessageAttributes.client_created_ts.StringValue
	       }

	    },
	    //MessageGroupId: msg.Attributes.MessageGroupId,
	   MessageBody: msg.MessageBody,
	   QueueUrl: AWS_SQS_timeout_event
	  };


	  sqs.sendMessage(params, function(err, data) {
	    if (err) {
	      logger.error("SQS Error", err);
	    } else {
	      logger.info("Rewritting Msg  Success", data.MessageId);
	    }
	  });
}

function resetMsgPart2Withdraw(msg){
	let params = {
	   DelaySeconds: 0,
	   MessageAttributes: { 
	      "sender": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.sender.StringValue
	       },
	      "reward": {
	        DataType: "Number",
	        StringValue: (parseInt(msg.MessageAttributes.reward.StringValue)).toString()
	       },
	      "callback_method": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.callback_method.StringValue
	       },
	      "external_url": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.external_url.StringValue
	       },
	      "external_params": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.external_params.StringValue
	       },
	      "param1": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.param1.StringValue
	       },
	      "param2": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.param2.StringValue
	       },
	      "timeout": {
	        DataType: "Number",
	        StringValue: msg.MessageAttributes.timeout.StringValue
	       },
	       "json_extract_element": {
	        DataType: "String",
	        StringValue: msg.MessageAttributes.json_extract_element.StringValue
	       },
	       "client_created_ts": {
	       	DataType: "Number",
	       	StringValue: msg.MessageAttributes.client_created_ts.StringValue
	       }

	    },
	    //MessageGroupId: msg.Attributes.MessageGroupId,
	   MessageBody: "RETRY2|" + msg.Body,
	   QueueUrl: AWS_SQS_timeout_event
	  };


	  sqs.sendMessage(params, function(err, data) {
	    if (err) {
	      logger.error("SQS Error", err);
	    } else {
	      logger.info("Rewritting Msg  Success", data.MessageId);
	    }
	  });
}

// Locking up the queue when 1 message is locked in flight status????
// But the AWS console is still able to read the locked msg?????



// for each one withdraw the reward
// add the details to the master job list
// master job list needs to be a db type or something that can be held in memory? - probably a simple db with timestamp of time to run task
// delete from timeoutQueue
// continue

