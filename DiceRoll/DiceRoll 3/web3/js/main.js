//https://skalman.github.io/UglifyJS-online/
window.addEventListener('load', function() {

  // Check if Web3 has been injected by the browser:
  if (typeof web3 !== 'undefined') {

    window.web3 = new Web3(web3.currentProvider); // can't subscribe to events via metamask
    //subscriberWeb3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws")); 
    startApp();
  } else {
    showNotConnectedMsg();
  }
  if(isMainGame)
    selectRollUnder(document.getElementById('rollUnder40'));
});




function startApp() {
  cryptodiceContract = new web3.eth.Contract(cryptodiceABI, contractAddress);
  if(isMainGame){
    showNetwork();
    showCoinbase();
    showGetBalance();
    setupStats();  
    getAllPlayerBets();

    cryptodiceContract.methods.maxMultiRolls().call(function(err, results){
      if(!err) {
        let tmpObj = document.getElementById('number_of_rolls');

        for(let c=0;c<results;c++) {
          let option = document.createElement("option");
          option.text = c+1;
          option.value = c+1;
          option.onselect =  "updatePotentialProfit();";
          tmpObj.appendChild(option);
        }

      }
    });

  }

  getLatestGames();



}


function resetRollDicebg(){
  rolling = false;
  updateInnerHTML('RollDiceButton', 'ROLL DICE');
  var tmpObj = document.getElementById('RollDiceButton');
  tmpObj.style.backgroundColor = '#c74216';
}


function rollDice() {
  if(rolling)
    return;

	if(!canPlay){
		showNotConnectedMsg();
		return;
	}


  var number_of_rolls = document.getElementById('number_of_rolls').selectedIndex+1;
  if(number_of_rolls < 1)
    number_of_rolls = 1;

  if(number_of_rolls > 1){
    let currentMultiStake = document.getElementById('stake').value;
    currentMultiStake = new BigNumber(currentMultiStake).times(number_of_rolls);

    if( currentMultiStake.isGreaterThan(new BigNumber(maxBet)) ) {

      let _msg = 'Your current stake of <b>' + document.getElementById('stake').value;
      _msg +=' * ' + number_of_rolls + ' Multi Rolls</b> would take you above the current max bet.<br/><br/>';
      _msg += 'Would you like to reduce your bet to <b>' + number_of_rolls + 'Multi Rolls</b> of <b>' + maxBet/number_of_rolls + ' Ether </b>?';
      alertify.confirm('Crypto Dice', 
        _msg, function(){
          var tmpObj = document.getElementById('stake');
          tmpObj.value = maxBet/number_of_rolls;
          updatePotentialProfit();
          rollDice();
        }, function(){ console.log("cancel");});

      return; 
    }
  }

  var tmpObj = document.getElementById('RollDiceButton');

  updateInnerHTML('RollDiceButton', 'ROLLING... PLEASE WAIT...');
  tmpObj.style.backgroundColor = '#aaa';
  rolling = true;

  tmpObj = document.getElementById('stake');

  if(tmpObj.value == '' || tmpObj.value < minBet) {
    alertify.alert('Crypto Dice', 'Please enter your stake before playing<br/><br/>It must be a stake of at least: ' + minBet + ' Ether');
    resetRollDicebg();
    return;
  }
  if(tmpObj.value > maxBet) {
    alertify.alert('Crypto Dice', 'Unfortunately your bet is over the current max bet size of: ' + maxBet + ' Ether<br/><br/>Please reduce your stake and try again.');
    resetRollDicebg();
    return;
  }

  if(number_of_rolls > 1) {
    cryptodiceContract.methods.rollDice(rollUnder, number_of_rolls).estimateGas(
      {from: account,
        value: web3.utils.toWei(tmpObj.value, "ether")}, function(error, gasAmount){

        cryptodiceContract.methods.rollDice(rollUnder, number_of_rolls).send({
            from: account,
            gas: gasAmount,
            gasPrice: useGasPrice,
            value: web3.utils.toWei(tmpObj.value, "ether")
          })
        .on('error', function(error){
          resetRollDicebg();
          alert(error);
        })
        .then(function(receipt){
          try{

            var retMsg = '<b>Dice Multi Rolls submitted!</b><br/><br/>';
            //console.log(JSON.stringify(receipt));

            retMsg += 'Etherscan link: <br/><span class="small"><a href="https://etherscan.io/tx/' + receipt.transactionHash + '" target="_new">'; 
            retMsg += receipt.transactionHash + '</a></span><br/>';
            retMsg += 'Gas Used: ' + receipt.gasUsed + '<br/>';
            
            retMsg += '<br/>Click OK to continue playing - you can add more Dice Rolls whilst you wait for the result to be mined onto the blockchain, this result will be along shortly - good luck!';
            resetRollDicebg();
            addNewBet();
            alertify.alert('Crypto Dice', retMsg);

          } catch(e){
            resetRollDicebg();
            console.log(JSON.stringify(receipt.events));
            console.log(JSON.stringify(e));
            alertify.alert('Crypto Dice','There was an error submitting your Dice Roll - this may of been an issue with your browser or crypto-wallet.<br/><br/>Please try again.');
          }
        });


    });
  } else {
    cryptodiceContract.methods.rollDice(rollUnder).estimateGas(
      {from: account,
        value: web3.utils.toWei(tmpObj.value, "ether")}, function(error, gasAmount){

        cryptodiceContract.methods.rollDice(rollUnder).send({
            from: account,
            gas: gasAmount,
            gasPrice: useGasPrice,
            value: web3.utils.toWei(tmpObj.value, "ether")
          })
        .on('error', function(error){
          resetRollDicebg();
          alert(error);
        })
        .then(function(receipt){
          try{

            var retMsg = '<b>Dice Roll submitted!</b><br/><br/>';
            retMsg += 'Etherscan link: <br/><span class="small"><a href="https://etherscan.io/tx/' + receipt.transactionHash + '" target="_new">'; 
            retMsg += receipt.transactionHash + '</a></span><br/>';
            retMsg += 'Gas Used: ' + receipt.gasUsed + '<br/>';
            retMsg += 'Bet ID:<br/><span class="small">' + receipt.events.DiceRollResult.returnValues.betID + '</span><br/>';
            //Data Proof File: ';
            //retMsg += '<a href="https:https://s3.amazonaws.com/notaryproxy-audit/' + result.LogBet.returnValues.betID;
            //retMsg += '" taget="_new">' + result.LogBet.returnValues.betID + '</a>' ;
            retMsg += '<br/>Click OK to continue playing - you can add more Dice Rolls whilst you wait for the result to be mined onto the blockchain, this result will be along shortly - good luck!';
            resetRollDicebg();
            addNewBet(receipt.events.DiceRollResult.returnValues.betID);
            alertify.alert('Crypto Dice', retMsg);
          } catch(e){
            resetRollDicebg();
            console.log(JSON.stringify(receipt.events));
            console.log(JSON.stringify(e));
            alertify.alert('Crypto Dice','There was an error submitting your Dice Roll - this may of been an issue with your browser or crypto-wallet.<br/><br/>Please try again.');
          }
        });


    });
  }




}

function selectRollUnder(item){
  rollUnder = item.text;
	resetRollUnderColors();
	item.style.color = "#f9531c";
	
	updatePotentialProfit();
	return false;
}


function updatePotentialProfit() {
  var number_of_rolls = document.getElementById('number_of_rolls').selectedIndex+1;
  if(number_of_rolls < 1)
    number_of_rolls = 1;
  console.log(number_of_rolls);
  var stake = document.getElementById('stake').value;
  if(isNaN(stake) || stake == ''){
    stake = 0;
  }

  stake = new BigNumber(stake);
  var orig_stake = new BigNumber(stake);

  var _full_profit = stake.times(getBetDivisor(rollUnder)).dividedBy(100);
  
  _full_profit = _full_profit.minus(orig_stake);
  var _full_profit_1percent = new BigNumber(_full_profit.dividedBy(100));
  var _player_profit = new BigNumber(_full_profit_1percent.times(houseEdge));

  var _house_profit = new BigNumber(_full_profit_1percent.times(100-houseEdge));

  var _full_profit = _player_profit.plus(stake).times(number_of_rolls);
  current_potential_profit = _full_profit;
  updateInnerHTML('potentialProfit', _full_profit.toFixed(6) + ' ether');

  
  var chanceOfWin = (rollUnder-1); // - (100-houseEdge);
  
  if(chanceOfWin < 0)   
    updateInnerHTML('chanceOfWin', "&nbsp;" + chanceOfWin + '%');
  else
    updateInnerHTML('chanceOfWin', chanceOfWin + '%');
}
function getBetDivisor(rollUnder) {
    if(rollUnder==5)
        return 20 * 100;
    if(rollUnder==10)
        return 10 * 100;
    if(rollUnder==20)
        return 5 * 100;
    if(rollUnder==30)
        return 3.3 * 100;
    if(rollUnder==40)
        return 2.5 * 100;
    if(rollUnder==50)
        return 2 * 100;
    if(rollUnder==60)
        return 1.66 * 100;
    if(rollUnder==70)
        return 1.42 * 100;
    if(rollUnder==80)
        return 1.25 * 100;
    if(rollUnder==90)
        return 1.11 * 100;
    return (100/rollUnder) * 10;
}
function resetRollUnderColors(){
	resetColor(document.getElementById('rollUnder20'));
	resetColor(document.getElementById('rollUnder30'));
	resetColor(document.getElementById('rollUnder40'));
	resetColor(document.getElementById('rollUnder50'));
	resetColor(document.getElementById('rollUnder60'));
}
function resetColor(item){
	item.style.color = "#555";
}

function showNotConnectedMsg(){
	var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  var isAndroid = false;
  if(navigator.userAgent.toLowerCase().indexOf("android") > -1)
    isAndroid = true;

	if(iOS){
		alertify.alert("Crypto Dice", "It looks like your not connected to the Mainnet or logged into your Wallet at the moment.<br/><br/>For iOS we recommend: <a href=\"https://itunes.apple.com/us/app/cipher-browser-ethereum/id1294572970?mt=8\">Cipher Ethereum Browser</a> - please connect to the Mainnet when using.");
	} else {
    if(isAndroid){
      alertify.alert("Crypto Dice", "It looks like your not connected to the Mainnet or logged into your Wallet at the moment.<br/><br/>For Android we recommend: <a href=\"https://play.google.com/store/apps/details?id=com.cipherbrowser.cipher&hl=en_GB\">Cipher Ethereum Browser</a> - please connect to the Mainnet when using.");

    } else {
		  alertify.alert('Crypto Dice', 'It looks like your not connected to the Mainnet or logged into your Wallet at the moment.<br/><br/>Please connect to <a href="https://metamask.io/" target="_new">Metamask</a> and select the Mainnet to continue');		
    }
	}

}

function showNetwork() {
  web3.eth.net.getNetworkType((err, res) => {
    var output = "";

    if (!err) {
      if(res > 1000000000000) {
        output = "testrpc";
      } else {

        	output = res;
          
      }
    } else {
      output = "Error:" + err;
    }
    if(output=="main") {

    } else {
      showNotConnectedMsg();
    }
    updateInnerHTML('networkName', output);
    
  })
}
function showCoinbase() {
  web3.eth.getCoinbase((err, res) => {
    var output = "";

    if (!err) {
      output = res;
      account = output;

      updateInnerHTML('accountAddr', output);
    } else {
      output = "Error";
    }
    
  })
}
function showGetBalance() {
  web3.eth.getCoinbase((err, res) => {
    var output = "";
    if (!err) {
      	output = res;
	    web3.eth.getBalance(output, (err2, res2) => {
	      if (!err2) {
	        // web3.eth.getBalance(res[i]) returns an instanceof BigNumber
	        //output += "Account= "+ account +", balance= " + res2 + " (wei), "+ web3.fromWei(res2, 'ether') +" (ether)<br />";
	        output = web3.utils.fromWei(res2, 'ether') + " Ether";

	        updateInnerHTML('accountBalance', output);

	      } else {
	        output = "Error2";
	      }

	    })
      

    } else {
      output = "Error1";
    }

  })
}

function setupStats(isRefresh) {
	
	
	cryptodiceContract.methods.private_getGameState().call(function(err, result){
		if(!err) {

      var _maxBet = new BigNumber(web3.utils.fromWei(result._liveMaxBet, 'ether'));
      var _minBet = new BigNumber(web3.utils.fromWei(result._minBet, 'ether'));
			updateInnerHTML("maxBet", _maxBet.toNumber().toFixed(4) + " Ether");	
			updateInnerHTML("minBet", _minBet.toNumber().toFixed(4) + " Ether");	
      minBet = web3.utils.fromWei(result._minBet, 'ether');

      if(!isRefresh)
        document.getElementById('stake').value = minBet;

      maxBet = web3.utils.fromWei(result._liveMaxBet, 'ether')
      document.getElementById('minBet').value = minBet;
      document.getElementById('maxBet').value = maxBet;
			houseEdge = result._houseEdge;
      updateInnerHTML('houseEdge', 100-houseEdge);
      updateInnerHTML('minBet2', minBet);

      canPlay=true;

      updatePotentialProfit();


      setTimeout(function(){setupStats(true)}, refreshGameStats); // update game stats every 30s

		}
		
	});



}
function showBet(betID){
  //cryptodiceContract.methods.getBet(betID).call(function(err, bet){
  cryptodiceContract.getPastEvents("DiceRollResult", {filter: {betID: betID},
  fromBlock:0, toBlock: 'latest'}, function(err, results){
    let tx_hash = results[0].transactionHash;
    let bet = results[0].returnValues;
    if(results.length > 1){
      // find the latest...

      for(let c=1; c<results.length; c++) {
          if(results[c].returnValues.timestamp > bet.timestamp){
            bet = results[c].returnValues;
            tx_hash = results[c].transactionHash;
          }
      }
    } 

      let _stake = new BigNumber(bet.stake.toString());
      let _profit = new BigNumber(bet.profit.toString());

      let _msg = "";
      _msg += "Bet ID:<br/><span class=\"small2\">" + betID + "</span>";

      _msg += '<table class="u-full-width" ><tbody>'
      _msg += '<tr><td></td><td></td></tr>';
      _msg += '<tr><td>Player</td><td>' + bet.playerAddress + '</td></tr>';

      _msg += '<tr><td>Time</td><td>' + formatTSLong(bet.timestamp) + '</td></tr>';

      _msg += '<tr><td>Roll Under</td><td>' + bet.rollUnder + '</td></tr>';
      

      _msg += '<tr><td>TX</td><td class="small"><a href="https://etherscan.io/tx/' + tx_hash + '" target="_new">' + tx_hash + '</td></tr>';

      if(bet.win == 1){
        _msg += '<tr><td>Result</td><td>' + bet.result + '</td></tr>';
        _msg += '<tr><td>Stake</td><td>' + web3.utils.fromWei(_stake.toString()).toString(10) + ' Ether</td></tr>';
        _msg += '<tr><td>Win?</td><td class="redColor">WIN!</td></tr>';
        _msg += '<tr><td>Profit</td><td>+' + web3.utils.fromWei( _stake.plus(_profit).toString() ).toString(10) + '</td></tr>';
      } else {
        if(bet.win == 2) {
          // still processing
            _msg += '<tr><td>Result</td><td>Roll Pending</td></tr>';
            _msg += '<tr><td>Stake</td><td>' + web3.utils.fromWei(_stake.toString()).toString(10) + ' Ether</td></tr>';
            _msg += '<tr><td>Win?</td><td>--</td></tr>';
            _msg += '<tr><td>Profit</td><td>--</td></tr>';
            _msg += '<tr><td colspan="2" class="small2">This game is still being mined by the blockchain.  We will have your results soon - you can continue to roll more dice whilst you wait!</td></tr>';          
        } else {
          if(bet.win == 0 && bet.result == 0){
            _msg += '<tr><td>Result</td><td>Roll Failed</td></tr>';
            _msg += '<tr><td>Stake</td><td>' + web3.utils.fromWei(_stake.toString()).toString(10) + ' Ether</td></tr>';
            _msg += '<tr><td>Win?</td><td>--</td></tr>';
            _msg += '<tr><td>Profit</td><td>Refunded</td></tr>';
            _msg += '<tr><td colspan="2" class="small">Very occasionally, the blockchain data oracle service can fail to return a result.  This can be due to the random.org service timing out or the blockchain mining system timing out for example.  In these cases your bet has failed and we refund your stake in full.</td></tr>';
          } else {
            _msg += '<tr><td>Result</td><td>' + bet.result + '</td></tr>';
            _msg += '<tr><td>Stake</td><td>' + web3.utils.fromWei(_stake.toString()).toString(10) + ' Ether</td></tr>';
            _msg += '<tr><td>Win?</td><td>LOSE</td></tr>';
            _msg += '<tr><td>Loss</td><td>-' + web3.utils.fromWei( _stake.toString() ).toString(10) + '</td></tr>';
          }
        }
      }
      _msg += '</table>';

      if(bet.win < 2 && bet.result > 0) {
        _msg += '<b>Data Proof</b><br/>'
        _msg += '<span class="small">Please read the <a href="dataproofs.htm" target="_new">PROOFS</a> page for a full guide on how we ';
        _msg += 'allow you to validate your games, but the TL;DR; of it is that for every random result returned there is ';
        _msg += 'also a data proof generated by a third party Data Oracle service (<a href="https://dAppBridge.com" target="new">dAppBridge</a>).';
        _msg += '<br/><br/>';
        _msg += 'This Data Proof file contains a Keccak256 hash of the original result to prove that it hasnt been altered - and the game is fair.</span>';
        _msg += '<br/><br/>';
        _msg += 'You can download the Data Proof for this game at:<br/>';
        _msg += '<span class="small"><a href="https://s3.amazonaws.com/notaryproxy-audit/' + betID + '" target="_new">https://s3.amazonaws.com/notaryproxy-audit/' + betID + '</a></span><br/>';
      }
      alertify.alert('Crypto Dice - Game Information', _msg);
  });
}


function addNewBet(betID) {
  refreshPlayerBets();
  return; // do in the normal refresh
}
function refreshPlayerBets(){
  if(refreshingBets == false) {   

    refreshingBets = true; 
    requestBets();
  }
  setTimeout(function(){refreshPlayerBets()}, refreshPlayerGames);
}



function refreshAllGames() {

  web3.eth.getCoinbase((err, res) => {
    var output = "";

    if (!err) {
      output = res;

      let latestGamesTable = document.getElementById('latestGamesTable').getElementsByTagName('tbody')[0];
      cryptodiceContract.getPastEvents("DiceRollResult", {
        fromBlock: lastBlockAllGames+1, toBlock: 'latest'}, function(err, results){


        if(results.length > 0){

          // Check if any are updates...
          for(let c=0; c < results.length; c++) {

            updateLastBlockAllGames(results[0].blockNumber);

            //let tx_hash = results[c].transactionHash;
            let bet = results[c].returnValues;
            let resultFound = false;
            let isUpdate = false;
            let foundID = 0;
            let requiresProcessing = false;

            // check if we have this entry in playerLatestBets..
            for(let c2=0; c2<latestGames.length;c2++) {
              if(bet.betID == latestGames[c2].betID){
                  resultFound = true;
                  if(latestGames[c2].win==2)
                    requiresProcessing = true;
                  foundID = c2;
                  break;
              }
            }

            if(resultFound == false){
              // New game
              latestGames.push(bet);

              let tr = latestGamesTable.insertRow(0);

              let gameRow = processBetRow(bet, '_allGames', false);

              if(bet.win == 1){

                tr.className="betDisplay small orangeBackground_trans";
              } else {
                
                tr.className="betDisplay small";
                
              }

              tr.onclick = function() { showBet(bet.betID)} ;
              tr.innerHTML =gameRow;
              tr.id = bet.betID + '_allGames_row';

              let currentRows = latestGamesTable.getElementsByTagName("tr").length;
              if(currentRows > maxRows) {
                latestGamesTable.deleteRow(currentRows-1);
              }
              

            } else {
              if(requiresProcessing){
                if(bet.timestamp > latestGames[foundID].timestamp) {
                  // Is an update
                  // find it and delete it...
                  var _row = document.getElementById(bet.betID + '_allGames_row');
                  if(_row){
                    _row.parentNode.removeChild(_row);
                  }

                  let tr = latestGamesTable.insertRow(0);

                  let gameRow = processBetRow(bet, '_allGames', false);

                  if(bet.win == 1){

                    tr.className="betDisplay small orangeBackground_trans";
                  } else {

                    tr.className="betDisplay small";
                    
                  }

                  tr.onclick = function() { showBet(bet.betID)} ;
                  tr.innerHTML =gameRow;
                  tr.id = bet.betID + '_allGames_row';

                  let currentRows = latestGamesTable.getElementsByTagName("tr").length;
                  if(currentRows > maxRows) {
                    latestGamesTable.deleteRow(currentRows-1);
                  }
                  

                  // update the array...
                  latestGames[foundID] = bet;

                }
              } else {

              }
            }

          }



        } else {

        }

      });
    } else {

    }
  });

  setTimeout(function(){refreshAllGames()}, refreshAllGames);

}
function requestBets() {

  web3.eth.getCoinbase((err, res) => {
    var output = "";

    if (!err) {
      output = res;

      let previousGamesTable = document.getElementById('previousGamesTable').getElementsByTagName('tbody')[0];
      cryptodiceContract.getPastEvents("DiceRollResult", {filter: {playerAddress: output},
        fromBlock: lastBlock+1, toBlock: 'latest'}, function(err, results){

          //console.log("Refreshing games...");

        if(results.length > 0){

          // Check if any are updates...
          for(let c=0; c < results.length; c++) {

            updateLastBlock(results[0].blockNumber);

            //let tx_hash = results[c].transactionHash;
            let bet = results[c].returnValues;
            let resultFound = false;
            let isUpdate = false;
            let foundID = 0;
            let requiresProcessing = false;

            // check if we have this entry in playerLatestBets..
            for(let c2=0; c2<playerLatestBets.length;c2++) {
              if(bet.betID == playerLatestBets[c2].betID){
                  resultFound = true;
                  if(playerLatestBets[c2].win==2)
                    requiresProcessing = true;
                  foundID = c2;
                  break;
              }
            }

            if(resultFound == false){
              // New game
              playerLatestBets.push(bet);

              let tr = previousGamesTable.insertRow(0);

              let gameRow = processBetRow(bet, "", true);

              if(bet.win == 1){

                tr.className="betDisplay small orangeBackground_trans";
              } else {
                
                tr.className="betDisplay small";
                
              }

              tr.onclick = function() { showBet(bet.betID)} ;
              tr.innerHTML =gameRow;
              tr.id = bet.betID + '_row';

              let currentRows = previousGamesTable.getElementsByTagName("tr").length;
              if(currentRows > maxRows) {
                previousGamesTable.deleteRow(currentRows-1);
              }
              

            } else {
              if(requiresProcessing){
                if(bet.timestamp > playerLatestBets[foundID].timestamp) {
                  // Is an update
                  // find it and delete it...
                  var _row = document.getElementById(bet.betID + '_row');
                  if(_row){
                    _row.parentNode.removeChild(_row);
                  }

                  let tr = previousGamesTable.insertRow(0);

                  let gameRow = processBetRow(bet, "", true);

                  if(bet.win == 1){

                    tr.className="betDisplay small orangeBackground_trans";
                  } else {

                    tr.className="betDisplay small";
                    
                  }

                  tr.onclick = function() { showBet(bet.betID)} ;
                  tr.innerHTML =gameRow;
                  tr.id = bet.betID + '_row';

                  let currentRows = previousGamesTable.getElementsByTagName("tr").length;
                  if(currentRows > maxRows) {
                    previousGamesTable.deleteRow(currentRows-1);
                  }
                  

                  // update the array...
                  playerLatestBets[foundID] = bet;

                }
              } else {

              }
            }

          }

          refreshingBets = false;


        } else {
          refreshingBets = false;
        }

      });
    } else {
      refreshingBets = false;
    }
  });
}
let playerLatestBets = [];
let latestGames = []
function updateLastBlock(_new_lastBlock){
    let _lastBlock = new BigNumber(_new_lastBlock);
    let _currentLastBlock = new BigNumber(lastBlock);

    if(_lastBlock.isGreaterThan(_currentLastBlock))
      lastBlock = _new_lastBlock;
}
function updateLastBlockAllGames(_new_lastBlock){
    let _lastBlock = new BigNumber(_new_lastBlock);
    let _currentLastBlock = new BigNumber(lastBlockAllGames);

    if(_lastBlock.isGreaterThan(_currentLastBlock))
      lastBlockAllGames = _new_lastBlock;
}
function getLatestGames() {
  web3.eth.getCoinbase((err, res) => {
    var output = "";
    

    if (!err) {
      output = res;

      // Results will come in earliest to latest order...
      cryptodiceContract.getPastEvents("DiceRollResult", {
        fromBlock: lastBlockAllGames, toBlock: 'latest'}, function(err, results){

        if(results.length > 0){

          // Only add the latest of each betID...
          for(let c=results.length-1; c>-1; c--) {
            let tx_hash = results[c].transactionHash;
            let bet = results[c].returnValues;
            let resultFound = false;

            // check if we have this entry in playerLatestBets..
            for(let c2=0; c2<latestGames.length;c2++) {
              if(bet.betID == latestGames[c2].betID){
                  resultFound = true;
                  break;
              }
            }

            if(resultFound == false){
              latestGames.push(bet);
              updateLastBlockAllGames(results[0].blockNumber);
              
            }

          }


          var latestGamesTable = document.getElementById('latestGamesTable').getElementsByTagName('tbody')[0];
          while(latestGamesTable.rows.length > 0) {
            latestGamesTable.deleteRow(0);
          }

          var tr = [];
          let currentRowCount = 0;


          currentRowCount = 0;
          let lastPosition = 0;
          for(let c=0; c < latestGames.length; c++) {

            currentRowCount++;
            if(currentRowCount>maxRows)
              break;

            // Add the new rows to the table...
            tr[c] = latestGamesTable.insertRow();

            lastPosition = c;

            let gameRow = processBetRow(latestGames[c], '_allGames', false);

            if(latestGames[c].win == 1)
              tr[c].className="betDisplay small orangeBackground_trans";
            else
              tr[c].className="betDisplay small";

            tr[c].onclick = function() { showBet(latestGames[c].betID)} ;
            tr[c].innerHTML =gameRow;
            tr[c].id = latestGames[c].betID + '_allGames_row';



          }

          // And add up all the others for the total losses/wins...
          let otherPreviousGames = 0;

          /*
          for(let c=lastPosition+1; c<latestGames.length; c++) {

            
            otherPreviousGames++;
            
            
            if(latestGames[c].win == 1){
              //wins++;
              //updateInnerHTML('wins', wins);
            } else {
              if(latestGames[c].win == 0 && latestGames[c].result > 0) {
                //losses ++;
                //updateInnerHTML('losses', losses);
              }
            }
          }
          */


        }

      });
    }
  });
  //

 setTimeout(function(){refreshAllGames()}, initAllGamesUpdate);

}


function getAllPlayerBets() {
  web3.eth.getCoinbase((err, res) => {
    var output = "";
    

    if (!err) {
      output = res;

      // Results will come in earliest to latest order...
      cryptodiceContract.getPastEvents("DiceRollResult", {filter: {playerAddress: output},
        fromBlock:0, toBlock: 'latest'}, function(err, results){

        if(results.length > 0){

          // Only add the latest of each betID...
          for(let c=results.length-1; c>-1; c--) {
            let tx_hash = results[c].transactionHash;
            let bet = results[c].returnValues;
            let resultFound = false;

            // check if we have this entry in playerLatestBets..
            for(let c2=0; c2<playerLatestBets.length;c2++) {
              if(bet.betID == playerLatestBets[c2].betID){
                  resultFound = true;
                  break;
              }
            }

            if(resultFound == false){
              playerLatestBets.push(bet);
              updateLastBlock(results[0].blockNumber);
              
            }

          }


          var previousGamesTable = document.getElementById('previousGamesTable').getElementsByTagName('tbody')[0];
          while(previousGamesTable.rows.length > 0) {
            previousGamesTable.deleteRow(0);
          }

          var tr = [];
          let currentRowCount = 0;


          currentRowCount = 0;
          let lastPosition = 0;
          for(let c=0; c < playerLatestBets.length; c++) {

            currentRowCount++;
            if(currentRowCount>maxRows)
              break;

            // Add the new rows to the table...
            tr[c] = previousGamesTable.insertRow();

            lastPosition = c;

            let gameRow = processBetRow(playerLatestBets[c], "", true);

            if(playerLatestBets[c].win == 1)
              tr[c].className="betDisplay small orangeBackground_trans";
            else
              tr[c].className="betDisplay small";

            tr[c].onclick = function() { showBet(playerLatestBets[c].betID)} ;
            tr[c].innerHTML =gameRow;
            tr[c].id = playerLatestBets[c].betID + '_row';



          }

          // And add up all the others for the total losses/wins...
          let otherPreviousGames = 0;

          //for(let c=startRow+1; c< result.length; c++) {
          for(let c=lastPosition+1; c<playerLatestBets.length; c++) {

            
            otherPreviousGames++;
            
            
            if(playerLatestBets[c].win == 1){
              wins++;
              updateInnerHTML('wins', wins);
            } else {
              if(playerLatestBets[c].win == 0 && playerLatestBets[c].result > 0) {
                losses ++;
                updateInnerHTML('losses', losses);
              }
            }
          }


        }

      });
    }
  });
  //

 setTimeout(function(){refreshPlayerBets()}, initPlayerBetsUpdate);

}


function processBetRow(bet, idSuffix, updatePlayerStats){

  let gameRow = '<tr class="small betDisplay" id="' + bet.betID + idSuffix + '_row">';
  gameRow += '<td>' + formatTS(bet.timestamp) + '</td>';
  //gameRow += '<td>' + result[c] + '</td>';
  if(isMainGame==false)
    gameRow += '<td>' + bet.playerAddress + '</td>';  

  gameRow += '<td>' + bet.rollUnder + '</td>';

  if(bet.win == 2) {
    // still waiting for result
    gameRow += '<td id="' + bet.betID + idSuffix + '_result"><img src="images/ani-dice.gif" width="16" height="16" border="0" alt="Waiting result of dice roll"/></td>';
  } else {
    if(bet.result > 0) {
      gameRow += '<td id="' + bet.betID + idSuffix + '_result">' + bet.result + '</td>';  
    } else {
      gameRow += '<td id="' + bet.betID + idSuffix + '_result">FAIL</td>';  
    }
  }
  
  gameRow += '<td>' + web3.utils.fromWei(bet.stake, 'ether')  + '</td>';

  if(bet.win == 1){
    if(updatePlayerStats == true){
      wins++;
      updateInnerHTML('wins', wins);
    }

    gameRow += '<td class="redColor" style="font-weight: bolder;">WIN!</td>';

    var profit = new BigNumber(bet.profit);
    var stake = new BigNumber(bet.stake);
    
    
    gameRow += '<td>+' + web3.utils.fromWei(profit.plus(stake).toString(10), 'ether')  + '</td></tr>';
  } else {
    if(bet.win == 2){
      gameRow += '<td id="' + bet.betID + idSuffix + '_win">Pending</td>';
      gameRow += '<td id="' + bet.betID + idSuffix + '_profit">--</td>';
    } else {
      if(bet.result > 0) {
        if(updatePlayerStats == true){
          losses++;
          updateInnerHTML('losses', losses);
        }
        var stake = new BigNumber(bet.stake);
        gameRow += '<td>LOSE</td>';
        gameRow += '<td>-' + web3.utils.fromWei(stake.toString(10), 'ether')  + '</td></tr>';
      } else {
        gameRow += '<td>--</td>';
        gameRow += '<td>Refunded</td></tr>';
      }
    }
  }
  return gameRow;
}
function updateInnerHTML(item, value){
	document.getElementById(item).innerHTML = value;
}
function setStakeMinBet() {
  var tmpObj = document.getElementById('minBet');
  document.getElementById('stake').value = tmpObj.value;
  updatePotentialProfit();
}
function setStakeMaxBet() {
  var tmpObj = document.getElementById('maxBet');
  document.getElementById('stake').value = tmpObj.value;
  updatePotentialProfit();
}
function formatTS(ts) {
  var a = new Date(ts * 1000);
  var b = new Date(Date.now());

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  if(year == b.getFullYear() && month == months[b.getMonth()] && date == b.getDate()){
    var time = hour + ':' + min + ':' + sec ;  
  } else {
    var time = date + ' ' + month + ' ' + year;
  }
  //var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
function formatTSLong(ts) {
  var a = new Date(ts * 1000);
  var b = new Date(Date.now());

  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}