//https://skalman.github.io/UglifyJS-online/
var isConnected = false;
var minPlayAmount = new BigNumber(0);
var userWalletAddress = "0x00";
var userWalletAddressShort = "0x00";
var userWalletBalance = 0;
var keysPrice = new BigNumber(0.001);
var games = [];

var TOAST_HIDE_DELAY = 5000;
var TOAST_HIDE_TRANSITION = 'slide';

function viewContract() {
  var win = window.open('https://etherscan.io/address/' + contractAddress, '_blank');
  if (win) {
      win.focus();
  } 
}

var web3Connection;
var gameConnection;
var gameConnectionConnected = false;
var statsConnectionConnected = false;

window.addEventListener('load', function() {

  // Check if Web3 has been injected by the browser:
  //updateInnerHTML('contractAddressHTML', '<a href="https://etherscan.io/address/' + contractAddress + '" target="_new">' + contractAddress + '</a>');

  if (typeof web3 !== 'undefined') {

    //window.web3
    gameConnection = new Web3(web3.currentProvider); 
    gameConnectionConnected = true;
    //isConnected = true;
    //startApp();

  } else {
    // no web3 browser at all
    console.log("NOT A WEB3 BROWSER");
  }

  //else {
    //console.log("No web3");
    // still show stats (infura)
    // but show link to coinbase wallet/cipher for mobile & metamask.io for desktop


    var provider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws');
    var reconnectTries = 0;

    provider.on('error', function(e){
      console.error('WS Error', e);
      reconnectProvider(reconnectTries);
    });
    provider.on('end', function(e) {
      console.error('WS End', e);
      console.log('WS closed');
      console.log('Attempting to reconnect...');

      reconnectProvider(reconnectTries);


    });

    web3Connection = new Web3(provider);

/*
    web3Connection.eth.getBlockNumber(function(err, results){
      if(err){
        console.log("Error getting blockNumber:");
        console.log(err);

      } else {
        var startBlock = parseInt(results);
        console.log("START BLOCK:" + startBlock);
      }
    });
*/
    startApp();

    setTimeout(function(){ updateClocks() }, 1000);

    var subscription = web3Connection.eth.subscribe('newBlockHeaders', function(error, blockHeader) {
      if (error) return console.error(error);

      //console.log('Successfully subscribed!', blockHeader);

      //isConnected = true;
      statsConnectionConnected = true;



    }).on('data', function(blockHeader){
      //console.log('data: ', blockHeader);

        
    }).on('error', function(error){
      //console.log('subscriptionError:' + error);
    });



/*
// unsubscribes the subscription
subscription.unsubscribe((error, success) => {
  if (error) return console.error(error);

  console.log('Successfully unsubscribed!');
});
*/

    //web3Connection = new Web3(Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws"));





    /*
    if(isMainGame){
      isConnected = false;
      deactivateGame();
      $('#notConnectedModel').foundation('open');

   }
   */
  //}

});

function reconnectProvider(_tries) {

  try {
    provider = new Web3.providers.WebsocketProvider('wss://mainnet.infura.io/ws');


    provider.on('connect', function () {
        console.log('WSS Reconnected');

    });

    web3Connection.setProvider(provider);

    restartApp();

  } catch (e) {
    _tries++;
    if(_tries < 60){
      setTimeout(function() {
        reconnectProvider(_tries); 
      }, 2000);
    }
  }

} 

function startApp() {
  if(isMainGame) {

    if(gameConnectionConnected) {

      try{
        BankOfEthHeistContractPlay = new gameConnection.eth.Contract(heistABI, contractAddress);
      } catch(e){

      }
      checkNetwork();

    } else {
      // no need to check if they are connected to mainnet...
      // show alert
      if(!shownInitialWarning){
        //var _msg = "<p>To play BANK HEIST 4D - you need to use a Web3 enabled Browser such as <a href=\"https://metamask.io\" target=\"_new\">Metamask</a> (Desktop) or <a href=\"https://wallet.coinbase.com\" target=\"_new\">Coinbase Wallet</a> (For Mobile Users).</p>";
        //_msg += "<p>You can view the current round without a Web3 browser (Click the X button above to view) - but return with a Web3 Browser to join in and win some Ethereum!</p>";
        //showError(_msg, "Browser Check");
        //shownInitialWarning = true;
      }
    }


    BankOfEthHeistContract = new web3Connection.eth.Contract(heistABI, contractAddress);

    setupGameStats(true); // use web3Connection
    populateGameStats(); // use web3Connection


  } else {

    checkNetwork(function() {
      if(!isDetail){

      } else {
        
      }
    });
  }
}

function restartApp() {
  if(isMainGame) {

    if(gameConnectionConnected) {

      try{
        BankOfEthHeistContractPlay = new gameConnection.eth.Contract(heistABI, contractAddress);
      } catch(e){

      }
      checkNetwork();

    } else {
      // no need to check if they are connected to mainnet...
      // show alert
      if(!shownInitialWarning){
        //var _msg = "<p>To play BANK HEIST 4D - you need to use a Web3 enabled Browser such as <a href=\"https://metamask.io\" target=\"_new\">Metamask</a> (Desktop) or <a href=\"https://wallet.coinbase.com\" target=\"_new\">Coinbase Wallet</a> (For Mobile Users).</p>";
        //_msg += "<p>You can view the current round without a Web3 browser (Click the X button above to view) - but return with a Web3 Browser to join in and win some Ethereum!</p>";
        //showError(_msg, "Browser Check");
        //shownInitialWarning = true;
      }
    }


    BankOfEthHeistContract = new web3Connection.eth.Contract(heistABI, contractAddress);
    console.log("Contract reset");

    //populateGameStats(); // runs on timer
    setupGameStats(false); // use web3Connection

  } else {

    checkNetwork(function() {
      if(!isDetail){

      } else {
        
      }
    });
  }
}
var lastBlock = 0;
var roundStartBlock = 6457447;
var roundStartTimestamp = 0;
var shownInitialWarning = false;

function checkNetwork(_callback) {
  try{
    gameConnection.eth.net.getNetworkType(function(err, res){
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

      var searchNetwork = "main";
      if(useTestnet == true){
        searchNetwork = "ropsten";
      }

      if(output==searchNetwork) {

        canPlay = true;

      } else {
        console.log("NOT CONNECTED" + searchNetwork + ":" + output);
        //deactivateGame();

        if(!shownInitialWarning){
          canPlay = false;
        // don't do anything here as it is handled when they try and play...
        //  $('#notConnectedModel').foundation('open');
        //  shownInitialWarning = true;
        }
      }

      
    });
  } catch(e) {
    // need to show no web3/unlock message
    console.log("NOT CONNECTED" + e);
    //deactivateGame();
    if(!shownInitialWarning){
      $('#notConnectedModel').foundation('open');
      shownInitialWarning = true;
    }
  }
}

function setupGameStats(isInit) {
  
  console.log("setupGameStats");

  // init setup of previous players
  web3Connection.eth.getBlockNumber(function(err, results){
    if(err){
      console.log("Error getting blockNumber:");
      console.log(err);

    } else {
      var startBlock = parseInt(results);
      var previousPlayersTable = document.getElementById('previousPlayersTable');
      lastBlock = startBlock;

      //console.log("startBlock:" + startBlock);

      // the -12343 should be -12343 or start of the round which ever is lower...
      // this should also setup the highest keyholder table too
      BankOfEthHeistContract.getPastEvents("RoundStarted", {
        fromBlock: 6457447,
        toBlock: "latest"
      }, function(err, results) {
        if(err){
          console.log("Err getting RoundStarted:", err);
          setTimeout(function(){
            reconnectProvider(0);
          }, 500);

        } else {
          console.log("ROUND STARTED:", results);
          //console.log(results);
          //latest = results.lenght -1;
          console.log("ROUND STARTED AT BLOCK:" + results[results.length-1].blockNumber);
          console.log("TIMESTAMP:" + results[results.length-1].returnValues.timestamp);
          roundStartBlock = results[results.length-1].blockNumber;
          roundStartTimestamp = results[results.length-1].returnValues.timestamp;

          var startPoint = startBlock - 12343;

          if(startPoint > roundStartBlock)
            startPoint = roundStartBlock;

          setTimeout(function(){
            initLatestPlayers(startPoint);
          }, 500);



        }
      });

      

    }
  });




}

function initLatestPlayers(startPoint){
  console.log("Init of game stats..." + startPoint);

  BankOfEthHeistContract.getPastEvents("KeysIssued", {
      fromBlock: startPoint,
      toBlock: "latest"
    }, function(err, keysIssuedResults){
      if(err){
        console.log("Error getting inits KeysIssued:", err);
      } else {
        //console.log("KEYS ISSUED RESULTS:", keysIssuedResults);

        for(var c=0; c < keysIssuedResults.length; c++) {
        
          var playersRow = '<tr class="smallText">';
          var _keys = new BigNumber(keysIssuedResults[c].returnValues.keys).div(DIVISOR).toString();

          if(keysIssuedResults[c].blockNumber >= roundStartBlock) {
            // is withiin current round so can be added to highest keyholder section
            updateHighestKeyholders(keysIssuedResults[c].returnValues.to, _keys);
          }

          playersRow += '<td>';

          playersRow += '<a href="https://etherscan.io/address/' + keysIssuedResults[c].returnValues.to + '" target="_new">'; 

          playersRow += '<span class="hide-for-small-only hide-for-medium-only">'
          playersRow += keysIssuedResults[c].returnValues.to;
          playersRow += '</span>';

          playersRow += '<span class="hide-for-large">'
          playersRow += keysIssuedResults[c].returnValues.to.substring(0,15) + "...";
          playersRow += '</span>';


          playersRow += '</a>';
          playersRow += '</td>';
          playersRow += '<td>' + roundNumber(_keys,2) + '</td>';



          playersRow += '</tr>';

          $('#previousPlayersTable tr:first').after(playersRow);

          var currentRows = previousPlayersTable.getElementsByTagName("tr").length;
          if(currentRows > 10) {
            previousPlayersTable.deleteRow(currentRows-1);
          }
        }

      }
      displayHighestKeyholders();
    });
}

var highestKeyholders = [
  { address: "0x0000000000000000000000000000000000000000", keys: 0 }
];
function beatPosition(positionToBeat) {
  if(!canPlay){
    $('#notConnectedModel').foundation('open');
    return;
  }

  var sorted = highestKeyholders.sort(function(obj1, obj2) {
    return parseFloat(obj2.keys) - parseFloat(obj1.keys);
  });

  $.toast({
      heading: 'Beat Position Buy',
      text: 'Aiming to Buy: ' + (parseInt(sorted[positionToBeat].keys)+1) + ' Keys',
      icon: 'info',
      allowToastClose: true,
      position: 'bottom-right',
      hideAfter: TOAST_HIDE_DELAY,
      showHideTransition: TOAST_HIDE_TRANSITION
  });

  document.getElementById('investmentAmount').value = parseInt(sorted[positionToBeat].keys)+1;

  playGame();

}

function updateHighestKeyholders(_addr, _keys) {

  var haveUpdated = false;
  for(var c = 0; c < highestKeyholders.length; c++) {
    if(highestKeyholders[c].address == _addr) {
      highestKeyholders[c].keys = parseFloat(highestKeyholders[c].keys) + parseFloat(_keys);
      haveUpdated = true;
      break;
    } 
  }
  if(!haveUpdated){
    highestKeyholders.push(
    {
      address: _addr,
      keys: _keys
    });
  }
}
function displayHighestKeyholders() {
  
  var sorted = highestKeyholders.sort(function(obj1, obj2) {
    return parseFloat(obj2.keys) - parseFloat(obj1.keys);
  });
  
  //for(var c=0; c< 10; c++) {
  //  console.log("POS:" + c + ":" + sorted[c].address + ":" + sorted[c].keys);
  //}


  try {
    updateInnerHTML('leaders0', sorted[0].address.substring(0,15) + "...");
    updateInnerHTML('leadersKeys0', roundNumber(sorted[0].keys,2));
  } catch(e){
    updateInnerHTML('leaders0', 'Available!');
    updateInnerHTML('leadersKeys0', '1');
  }

  try {
    updateInnerHTML('leaders1', sorted[1].address.substring(0,15) + "...");
    updateInnerHTML('leadersKeys1', roundNumber(sorted[1].keys,2));
  } catch(e){
    updateInnerHTML('leaders1', 'Available!');
    updateInnerHTML('leadersKeys1', '1');
  }

  try {
    updateInnerHTML('leaders2', sorted[2].address.substring(0,15) + "...");
    updateInnerHTML('leadersKeys2', roundNumber(sorted[2].keys,2));
  } catch(e){
    updateInnerHTML('leaders2', 'Available!');
    updateInnerHTML('leadersKeys2', '1');
  }

  try {
    updateInnerHTML('leaders3', sorted[3].address.substring(0,15) + "...");
    updateInnerHTML('leadersKeys3', roundNumber(sorted[3].keys,2));
  } catch(e){
    updateInnerHTML('leaders3', 'Available!');
    updateInnerHTML('leadersKeys3', '1');
  }

}

function resetHighestKeyholders() {
  highestKeyholders = [
    { address: "0x0000000000000000000000000000000000000000", keys: 0 }
  ];

  updateInnerHTML('leaders0', sorted[0].address);
  updateInnerHTML('leadersKeys0', roundNumber(sorted[0].keys,2));

  updateInnerHTML('leaders1', sorted[0].address);
  updateInnerHTML('leadersKeys1', roundNumber(sorted[0].keys,2));

  updateInnerHTML('leaders2', sorted[0].address);
  updateInnerHTML('leadersKeys2', roundNumber(sorted[0].keys,2));

  updateInnerHTML('leaders3', sorted[0].address);
  updateInnerHTML('leadersKeys3', roundNumber(sorted[0].keys,2));
}




var alreadyDeactivated = false;
function deactivateGame() {

  if(alreadyDeactivated)
    return;

  console.log("Deactiving Game...");
  //showError("Unable to access the Bank Heist 4D smart contract - please refresh the page to try again.");
  var _msg = "<p>There was a temporary error connecting to the Blockchain.</p>";
  _msg += "<p>Please refresh your browser to reconnect</p>"
  showError(_msg, "Unable to access Blockchain");

  /*
  $( "#investButton" ).prop( "disabled", true );
  $( "#investmentAmount" ).prop( "disabled", true );
  $( "#withdrawInvestmentButton" ).prop( "disabled", true );
  $( "#withdrawDividendsButton" ).prop( "disabled", true );
  $( "#reinvestButton" ).prop( "disabled", true );
  $( "#referralid_full" ).css( "cursor", "not-allowed");
  $( "#keysPlus0" ).css( "cursor", "not-allowed");
  $( "#keysPlus1" ).css( "cursor", "not-allowed");
  $( "#keysPlus5" ).css( "cursor", "not-allowed");
  $( "#keysPlus10" ).css( "cursor", "not-allowed");
  $( "#keysPlus100" ).css( "cursor", "not-allowed");
  $( "#keysPlus1000" ).css( "cursor", "not-allowed");
  $("#withdrawButton").prop("disabled", true);
  $("#pos0Buy").prop("disabled", true);
  $("#pos1Buy").prop("disabled", true);
  $("#pos2Buy").prop("disabled", true);
  $("#pos3Buy").prop("disabled", true);
  */
  alreadyDeactivated = true;

}
function keysPlus(num) {

  if(num == 0) {
    document.getElementById('investmentAmount').value = '1';
  } else {
    document.getElementById('investmentAmount').value = parseInt(document.getElementById('investmentAmount').value) + parseInt(num);
  }
  updateKeysCost();
}
function keysMinus() {

  var _current = parseFloat(document.getElementById('investmentAmount').value);
  _current--;
  if(_current>=1) {
    document.getElementById('investmentAmount').value = _current;
    updateKeysCost();
  }
}
function keysAdd() {

  var _current = parseFloat(document.getElementById('investmentAmount').value);
  _current++;
  document.getElementById('investmentAmount').value = _current;
  updateKeysCost();
}
function updateKeysCost(){
  var num = parseInt(document.getElementById('investmentAmount').value);
  var keysCost = keysPrice.times(num);
  //keysPrice
  updateInnerHTML('investmentAmountCost', "= " + keysPrice.times(num) + " ETH");
  if(keysCost.gte(0.1)) {
    // bonus keys
    var bonusKeys = 0;
    if(keysCost.gte(100)) {
      bonusKeys = num;
      console.log("100% bonus key level");
    } else {
      if(keysCost.gte(10)) {
        bonusKeys = num / 2;
        console.log("50% bonus key level");
      } else {
        if(keysCost.gte(1)) {
          bonusKeys = num / 3;
          console.log("33% bonus key level");
        } else {
          bonusKeys = num / 10;
          console.log("10% bonus key level");
        }
      }

    }
    /*
        if(value >= 100 ether) {
            newKeys = newKeys.mul(2);//get double keys if you paid more than 100 ether
        } else if(value >= 10 ether) {
            newKeys = newKeys.add(newKeys/2);//50% bonus
        } else if(value >= 1 ether) {
            newKeys = newKeys.add(newKeys/3);//33% bonus
        } else if(value >= 100 finney) {
            newKeys = newKeys.add(newKeys/10);//10% bonus
        }
    */
    //console.log("BONUS:" + keysPrice.times(num));
    updateInnerHTML('bonusKeys', '+ ' + roundNumber(bonusKeys,2) + ' Bonus Keys!');
  } else {

    updateInnerHTML('bonusKeys', '');
  }
}
function populateGameStats(){

  console.log("UPDATING GAME STATS");

    // use gameConnectionConnected
    try{
      getUserWalletAddress(function(){

        

        

        updateInnerHTML('referralid', userWalletAddress);
        //updateInnerHTML('referralid2', userWalletAddress);
        //updateInnerHTML('referralid3', userWalletAddress);
        //updateInnerHTML('referralid4', userWalletAddress);
        //updateInnerHTML('yourAddress', userWalletAddressShort);
        updateInnerHTML('yourAddress', userWalletAddress);


        /*
        getUserWalletBalance(function(){


        });
        */


      });
    } catch(e) {

    }


    // get stats...
    getGameStats();    

    setTimeout(function(){ populateGameStats() }, GAME_UPDATE_SPEED);
}
//var currentProfitDay = 0;
var DIVISOR = new BigNumber(1000000000000000000);
var requiresRestart = false;
var hasShownRestartMsg = false;
var currentRound = {
  roundID: 0,
  leader: "",
  priceWei: new BigNumber(1000000000000000),
  jackpot: new BigNumber(0),
  airdrop: new BigNumber(0),
  keys: new BigNumber(0),
  totalInvested: new BigNumber(0),
  distributedReturns: new BigNumber(0),
  hardDeadline: 0,
  softDeadline: 0,
  finalized: false,
};

function updateClocks() {
  if(currentRound.softDeadline > 0) {
    var dateNow = new Date().getTime();
    var difference = (currentRound.softDeadline*1000) - dateNow;
    //console.log(difference);
    if(difference < 1) {
      // round ended!!!
      // need to confirm by a call to contract....

      requiresRestart = true;
      showRestartMessage();
    } else {

      hasShownRestartMsg = false

      var daysDifference = Math.floor(difference/1000/60/60/24);
      difference -= daysDifference*1000*60*60*24

      var hoursDifference = Math.floor(difference/1000/60/60);
      difference -= hoursDifference*1000*60*60

      var minutesDifference = Math.floor(difference/1000/60);
      difference -= minutesDifference*1000*60

      var secondsDifference = Math.floor(difference/1000);

      var _diffStr = "";
      if(daysDifference > 0) {
        if(daysDifference == 1)
          _diffStr = "1 day & "
        else
          _diffStr = daysDifference + " days, ";
      }
      _diffStr += padNumber(hoursDifference,2) + ":" + padNumber(minutesDifference,2) + ":" + padNumber(secondsDifference,2);

      updateInnerHTML('roundCountdown', _diffStr);
    }
  }

  setTimeout(function(){ updateClocks() }, 1000);
}
function showRestartMessage() {

  // check the round info to be sure....
  BankOfEthHeistContract.methods.roundInfo(currentRound.roundID).call(function(err, results){
    if(err) {

    } else {

      currentRound.leader = results.leader;
      currentRound.jackpot = new BigNumber(results.jackpot);
      currentRound.airdrop = new BigNumber(results.airdrop);
      currentRound.keys = new BigNumber(results.keys).div(DIVISOR);
      currentRound.totalInvested = new BigNumber(results.totalInvested);
      currentRound.distributedReturns = new BigNumber(results.distributedReturns);
      currentRound.hardDeadline = results._hardDeadline;
      currentRound.softDeadline = results._softDeadline;
      currentRound.finalized = new BigNumber(results.finalized);
      //console.log(currentRound);
      updateInnerHTML('roundCurrentWinner', currentRound.leader.substring(0,10) + "...");
      updateInnerHTML('currentLeader', currentRound.leader);
      updateInnerHTML('currentLeaderShort', currentRound.leader.substring(0,10) + "...");
      updateInnerHTML('totalEthInRound', web3Connection.utils.fromWei(currentRound.jackpot.toString(), 'ether').substring(0,8) + " ETH");
      updateInnerHTML('vaultPrize', web3Connection.utils.fromWei(currentRound.jackpot.toString(), 'ether').substring(0,8) + " ETH");
      updateInnerHTML('roundAirdropTotal', web3Connection.utils.fromWei(currentRound.airdrop.toString(), 'ether').substring(0,8) + " ETH");
      updateInnerHTML('roundAirdropTotal2', web3Connection.utils.fromWei(currentRound.airdrop.toString(), 'ether').substring(0,8) + " ETH");
      updateInnerHTML('roundKeysSold', currentRound.keys.decimalPlaces(2).toString());
      updateInnerHTML('distributedEthThisRound', web3Connection.utils.fromWei(currentRound.distributedReturns.toString(), 'ether').substring(0,8) + " ETH");
      updateInnerHTML('roundInvested', web3Connection.utils.fromWei(currentRound.totalInvested.toString(), 'ether').substring(0,8) + " ETH");
      updateInnerHTML('roundHardDeadline', timeConverter(currentRound.hardDeadline));

      var dateNow = new Date().getTime();
      var difference = (currentRound.softDeadline*1000) - dateNow;

      if(difference < 1) {
        updateInnerHTML('roundCountdown', "OPEN!");
        if(!hasShownRestartMsg) {
          var _msg = "The Vault has opened!!<br/><br/>The winner of the prize is: " + currentRound.leader;
          _msg += "<br/><br/>They have won the jackpot price of: <strong>" + web3Connection.utils.fromWei(currentRound.jackpot.toString(), 'ether').substring(0,8) + " ETH</strong><br/><br/>"
          _msg += "<strong>What happens Next?</strong><br/><br/>"
          _msg += "The next round will be even bigger as it has already been seeded with a prize pot!  And you now have a chance to be the first investor - ";
          _msg += "which means you will receive more of the share of distributed returns!<br/><br/>";
          _msg += "Be quick though - buy some keys now for the chance to be the first investor in the next round before someone else does!<br/><br/>"
          showError(_msg, "Vault Open!");
          hasShownRestartMsg = true;
        }
      } 
    }

  });



}
var log_id_processed = [];

function getGameStats() {

  BankOfEthHeistContract.methods.latestRoundID().call(function(err, results){
    if(err) {
      
     // deactivateGame();
    } else {
      currentRound.roundID = parseInt(results);
      updateInnerHTML('roundNumber', currentRound.roundID+1);

      BankOfEthHeistContract.methods.roundInfo(currentRound.roundID).call(function(err, results){
        if(err) {
          
       //   deactivateGame();
        } else {
          currentRound.leader = results.leader;
          currentRound.jackpot = new BigNumber(results.jackpot);
          currentRound.airdrop = new BigNumber(results.airdrop);
          currentRound.keys = new BigNumber(results.keys).div(DIVISOR);
          currentRound.totalInvested = new BigNumber(results.totalInvested);
          currentRound.distributedReturns = new BigNumber(results.distributedReturns);
          currentRound.hardDeadline = results._hardDeadline;
          currentRound.softDeadline = results._softDeadline;
          currentRound.finalized = new BigNumber(results.finalized);
          //console.log(currentRound);
          updateInnerHTML('roundCurrentWinner', currentRound.leader.substring(0,10) + "...");
          updateInnerHTML('currentLeader', currentRound.leader);
          updateInnerHTML('currentLeaderShort', currentRound.leader.substring(0,10) + "...");
          updateInnerHTML('totalEthInRound', web3Connection.utils.fromWei(currentRound.jackpot.toString(), 'ether').substring(0,8) + " ETH");
          updateInnerHTML('vaultPrize', web3Connection.utils.fromWei(currentRound.jackpot.toString(), 'ether').substring(0,8) + " ETH");
          updateInnerHTML('roundAirdropTotal', web3Connection.utils.fromWei(currentRound.airdrop.toString(), 'ether').substring(0,8) + " ETH");
          updateInnerHTML('roundAirdropTotal2', web3Connection.utils.fromWei(currentRound.airdrop.toString(), 'ether').substring(0,8) + " ETH");
          updateInnerHTML('roundKeysSold', currentRound.keys.decimalPlaces(2).toString());
          updateInnerHTML('distributedEthThisRound', web3Connection.utils.fromWei(currentRound.distributedReturns.toString(), 'ether').substring(0,8) + " ETH");
          updateInnerHTML('roundInvested', web3Connection.utils.fromWei(currentRound.totalInvested.toString(), 'ether').substring(0,8) + " ETH");
          updateInnerHTML('roundHardDeadline', timeConverter(currentRound.hardDeadline));
        }
      });


      try {
        BankOfEthHeistContract.methods.investorInfo(userWalletAddress,currentRound.roundID).call(function(err, results){
          if(err) {

          } else {
            updateInnerHTML('yourKeysNumber', new BigNumber(results.keys).div(DIVISOR).decimalPlaces(2).toString());
            var _totalReturns = new BigNumber(results.totalReturns);
            var _referralReturns = new BigNumber(results.referralReturns);

            updateInnerHTML('yourReturn', web3Connection.utils.fromWei(_totalReturns.minus(_referralReturns).toString(), 'ether').substring(0,8) + " ETH");
            updateInnerHTML('yourReferralReturn', web3Connection.utils.fromWei(results.referralReturns, 'ether').substring(0,8) + " ETH");
            updateInnerHTML('yourReturnTotal', web3Connection.utils.fromWei(results.totalReturns, 'ether').substring(0,8) + " ETH");
          }
        });
      } catch (e) {

        updateInnerHTML('yourKeysNumber', "--");
        updateInnerHTML('yourReturn', "--");
        updateInnerHTML('yourReturnTotal', "--");
        updateInnerHTML('yourReferralReturn', "--");
      }


    }
  });

  //console.log("LAST BLOCK=" + lastBlock);
  if(lastBlock > 0 ) {
    // wait for lastBlock to be set..
    BankOfEthHeistContract.getPastEvents("allEvents", {
      fromBlock: lastBlock-1,
      //fromBlock: 0,
      toBlock: "latest"
    }, function(err, results){
      if(err) {

      } else {
        //console.log(results.length);
        var previousPlayersTable = document.getElementById('previousPlayersTable');
        for(var c=0; c < results.length; c++) {
          //console.log(results[c]);

          if(parseInt(results[c].blockNumber) > lastBlock)
            lastBlock = parseInt(results[c].blockNumber);

          if($.inArray(results[c].id, log_id_processed) == -1 ) {

            log_id_processed.push(results[c].id);

            if(results[c].event == "KeysIssued"){
              
              var playersRow = '<tr class="smallText">';
              var _keys = new BigNumber(results[c].returnValues.keys).div(DIVISOR).toString();

              //console.log("BLOCK CHECK:" + results[c].blockNumber + ":" + roundStartBlock);
              //console.log("BLOCK DETAILS:" + results[c].returnValues.to +":" + _keys);

              if(results[c].blockNumber >= roundStartBlock) {
                // is withiin current round so can be added to highest keyholder section
                updateHighestKeyholders(results[c].returnValues.to, _keys);
              }

              playersRow += '<td>';


              playersRow += '<a href="https://etherscan.io/address/' + results[c].returnValues.to + '" target="_new">'; 

              playersRow += '<span class="hide-for-small-only hide-for-medium-only">'
              playersRow += results[c].returnValues.to;
              playersRow += '</span>';

              playersRow += '<span class="hide-for-large">'
              playersRow += results[c].returnValues.to.substring(0,15) + "...";
              playersRow += '</span>';


              playersRow += '</a>';
              playersRow += '</td>';
              playersRow += '<td>' + roundNumber(_keys,2) + '</td>';
              playersRow += '</tr>';

              setTimeout(function(){
                $.toast({
                    heading: 'New Investor',
                    text: results[c].returnValues.to.substring(0,10) + "..." + ' has just purchased ' + _keys + ' keys',
                    icon: 'info',
                    allowToastClose: true,
                    position: 'bottom-right',
                    hideAfter: TOAST_HIDE_DELAY,
                    showHideTransition: TOAST_HIDE_TRANSITION
                });
              }, c*500);


              $('#previousPlayersTable tr:first').after(playersRow);

              var currentRows = previousPlayersTable.getElementsByTagName("tr").length;
              if(currentRows > 10) {
                previousPlayersTable.deleteRow(currentRows-1);
              }

            }
            //EthDistributed
            if(results[c].event == "EthDistributed"){
              setTimeout(function(){
                $.toast({
                    heading: 'ETH Distributed!',
                    text: web3Connection.utils.fromWei(results[c].returnValues.amount, 'ether').substring(0,8) + ' ETH has just been distributed to all players in this round!',
                    icon: 'info',
                    allowToastClose: true,
                    position: 'bottom-right',
                    hideAfter: TOAST_HIDE_DELAY,
                    showHideTransition: TOAST_HIDE_TRANSITION
                });
              }, c*500);
            }
            
            //ReturnsWithdrawn
            if(results[c].event == "ReturnsWithdrawn"){
              setTimeout(function(){
                $.toast({
                    heading: 'ETH Received!',
                    text: web3Connection.utils.fromWei(results[c].returnValues.amount, 'ether').substring(0,8) + ' ETH has just been received by ' + results[c].returnValues.by.substring(0,10) + "...",
                    icon: 'info',
                    allowToastClose: true,
                    position: 'bottom-right',
                    hideAfter: TOAST_HIDE_DELAY,
                    showHideTransition: TOAST_HIDE_TRANSITION
                });
              }, c*500);
            }

            //JackpotWon
            if(results[c].event == "JackpotWon"){
              setTimeout(function(){
                $.toast({
                    heading: 'Jackpot Won!',
                    text: web3Connection.utils.fromWei(results[c].returnValues.amount, 'ether').substring(0,8) + ' ETH has just been won by ' + results[c].returnValues.by.substring(0,10) + "...",
                    icon: 'info',
                    allowToastClose: true,
                    position: 'bottom-right',
                    hideAfter: TOAST_HIDE_DELAY,
                    showHideTransition: TOAST_HIDE_TRANSITION
                });
              }, c*500);
            }

            //AirdropWon
            if(results[c].event == "AirdropWon"){
              setTimeout(function(){
                $.toast({
                    heading: 'Safety Deposit Prize Won!',
                    text: web3Connection.utils.fromWei(results[c].returnValues.amount, 'ether').substring(0,8) + ' ETH has just been won by ' + results[c].returnValues.by.substring(0,10) + "...",
                    allowToastClose: true,
                    position: 'bottom-right',
                    icon: 'info',
                    hideAfter: TOAST_HIDE_DELAY,
                    showHideTransition: TOAST_HIDE_TRANSITION
                });
              }, c*500);
            }

            //RoundStarted
            if(results[c].event == "RoundStarted") {

              console.log("ROUND STARTED:");
              console.log(results);
              // latest = results.lenght -1;
              console.log("ROUND STARTED AT BLOCK:" + results[results.length-1].blockNumber);
              console.log("TIMESTAMP:" + results[results.length-1].returnValues.timestamp);
              roundStartBlock = results[results.length-1].blockNumber;
              roundStartTimestamp = results[results.length-1].returnValues.timestamp;
              resetHighestKeyholders();

              setTimeout(function(){
                $.toast({
                    heading: 'New Round Started',
                    text: "A new round has just started - get in quick for more earnings!",
                    icon: 'info',
                    allowToastClose: true,
                    position: 'bottom-right',
                    hideAfter: TOAST_HIDE_DELAY,
                    showHideTransition: TOAST_HIDE_TRANSITION
                });
              }, c*500);
              requiresRestart = false;
            }
          }
        }
        displayHighestKeyholders();
      }
      

    });

  }
  
  
}



function getUserWalletAddress(_callback) {

  try {
    gameConnection.eth.getCoinbase(function(err, res) {
      var output = "";

      if (!err) {
          output = res;
          userWalletAddress = output;
          if(output) {
            userWalletAddressShort = output.substring(0,10) + "...";
            if(_callback) 
              _callback();
          }
        else
        {
          
          canPlay = false;
          //deactivateGame();
        }

        //updateInnerHTML('accountAddr', '<a href="http://etherscan.io/address/' + output + '" target="_blank">' + outShort + '</a>');
      } else {
        output = "Error";
        
       // deactivateGame();
        canPlay = false;
      }
      
    });
  } catch(e) {

  }
}
function getUserWalletBalance(_callback) {
  try {
    gameConnection.eth.getCoinbase(function(err, res) {
      var output = "";
      if (!err) {
          output = res;
        web3Connection.eth.getBalance(output, function(err2, res2){
          if (!err2) {
            // web3Connection.eth.getBalance(res[i]) returns an instanceof BigNumber
            
            ////output = web3Connection.utils.fromWei(res2, 'ether').substring(0,8) + " Ether";
            userWalletBalance = res2;
            if(_callback)
              _callback();


          } else {
            output = "Error2";
            showError("Unable to open your Ethereum Wallet - are you logged in to your Wallet?<br/><br/>If this issue continues please contact support.");
          }

        })
        

      } else {
        output = "Error1";
        showWalletError();
      }

    });
  } catch (e){

  }
}
function cancelGame(barId) {
  if(!canPlay) {
    showNotConnectedMsg();
    return;
  }
  var _msg = 'This will fully cancel your participation within this game and withdraw <b>' + document.getElementById('yourEth_inGame_' + barId).innerHTML;
  _msg +='</b><br/><br/>';
  _msg += 'Are you sure you wish to continue (You can rejoin the game later if you wish)?';
  alertify.confirm('Win1Million', 
  _msg, function()
  {
    cancelGameComplete(barId);  
    
  }, function(){ console.log("cancel");});
}
function reinvestDividends() {
  if(!canPlay){
    showNotConnectedMsg();
    return;
  }

  // check minium ETH amount...
  BankOfEthHeistContractPlay.methods.minInvestment().call(function(err, results){
    if(err) {
      showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.", "Bank Heist");
    } else {
      minPlayAmount = new BigNumber(results);
      var investmentAmount = document.getElementById('investmentAmount').value;
      var investmentAmountEth = new BigNumber(keysPrice.times(investmentAmount));
      var minPlayAmountEth = new BigNumber(web3Connection.utils.fromWei(minPlayAmount.toString(), 'ether'));

      if(investmentAmountEth.isLessThan(minPlayAmountEth)) {
        showError("The minium investment is 1 KEY<br/><br/>Please update your investment and try again.", "Invalid Number of Keys");
      } else {
        if(requiresRestart) {
          // check if someone else has already restarted the round....
          showError("You are not able to use your vault funds to start off a new round!<br/><br/>The first investment in a new round must be with ETH.<br/><br/>", "Bank Heist");

        } else {

          if(!web3Connection.utils.isAddress(_referer)){
            console.log("Invalid Referer");
            _referer = web3Connection.utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
            console.log("New Referer:" + _referer);
          }
          // play direct without restart...
          BankOfEthHeistContractPlay.methods.reinvestReturns(
            web3Connection.utils.toWei(investmentAmountEth.toString(), "ether"), _referer).estimateGas(
          {from: userWalletAddress}, 
            function(error, gasAmount){
              if(error) {
                showError("Not enough funds in your Personal Vault to complete this purchase!", "Bank Heist");
              } else {
                submitReinvest(gasAmount, investmentAmountEth.toString());
              }
            }
          );
        }
      }

    }
  });


}
function withdrawDividends() {
  if(!canPlay){
    showNotConnectedMsg();
    return;
  }
  BankOfEthHeistContractPlay.methods.withdrawReturns().estimateGas(
      {from: userWalletAddress}, 
        function(error, gasAmount){
          if(error) {
            showError("Error accessing game contract - or you may not have any returns available today, - please try again.  If this issue persists try reloading this page.", "Bank Heist");
          } else {

            $.toast({
                heading: 'Sending Transaction',
                text: 'Check your Ethereum Wallet to complete the transaction',
                icon: 'info',
                allowToastClose: true,
                position: 'bottom-right',
                hideAfter: TOAST_HIDE_DELAY,
                showHideTransition: TOAST_HIDE_TRANSITION
            })

            BankOfEthHeistContractPlay.methods.withdrawReturns().send(
                {
                  from: userWalletAddress,
                  gas: gasAmount,
                  gasPrice: useGasPrice
                }, function( err, results) {
                  if(err) {
                    $.toast({
                        heading: 'Withdrawal Cancelled',
                        text: 'Your withdawal was cancelled - please try again!',
                        icon: 'info',
                        allowToastClose: true,
                        position: 'bottom-right',
                        hideAfter: TOAST_HIDE_DELAY,
                        showHideTransition: TOAST_HIDE_TRANSITION
                    })

                  } else {
                    var _msg = ""
                    _msg += '<p style="font-size: 8pt;"><i>Please Note: Your ETH will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
                    _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';

                    _msg += '<strong style="font-size: 12pt;">Want to make even more $ETH?</strong>';

                    _msg += '<p style="font-size: 10pt;">The more people buying keys, the more ETH you\'ll make.  65% of all key sales is distribtued to all existing key holders - that still includes you!</p>';
                    _msg += '<p style="font-size: 10pt;">So share BANK HEIST 4D now with your friends ~  use your Master Node link below and you\'ll also earn 3% of their first investment!</p>';
                    //_msg += '<p style="font-size: 10pt;">Share Bank of Eth now:</p>';
                    //_msg += '<div class="addthis_inline_share_toolbox"></div>';
                    _msg += '<p style="font-size: 10pt;">';
                    _msg += '<code style="font-size: 8pt;">https://heist.bankofeth.app/heist.htm?ref=' + userWalletAddress + '</code>';
                    _msg += '</p>';
                    _msg += '<p style="font-size: 10pt;">';
                    _msg += ' For every new investor you refer on - you will earn 3% from their first investment as an instant bonus!';
                    _msg += '</p>';

                    //_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you gain!</b></p>';
                    showError(_msg, "Withdraw Complete");
                    //addthis.layers.refresh();
                  }
                }
              );

          }
      });

}


function testMsg() {
                    var _msg = ""
                    _msg += '<p style="font-size: 8pt;"><i>Please Note: Your ETH will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
                    _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + "" + '" target="_new">View Transaction on Etherscan</a></p>';

                    _msg += '<strong style="font-size: 12pt;">Want to make even more $ETH?</strong>';

                    _msg += '<p style="font-size: 10pt;">The more people buying keys, the more ETH you\'ll make.  65% of all key sales is distribtued to all existing key holders - that still includes you!</p>';
                    _msg += '<p style="font-size: 10pt;">So share BANK HEIST 4D now with your friends ~  use your Master Node link below and you\'ll also earn 3% of their first investment!</p>';
                    //_msg += '<p style="font-size: 10pt;">Share Bank of Eth now:</p>';
                    //_msg += '<div class="addthis_inline_share_toolbox"></div>';

                    _msg += '<p style="font-size: 10pt;">';
                    _msg += '<code style="font-size: 8pt;">https://heist.bankofeth.app/heist.htm?ref=' + userWalletAddress + '</code>';
                    _msg += '</p>';
                    _msg += '<p style="font-size: 10pt;">';
                    _msg += ' For every new investor you refer on - you will earn 3% from their first investment as an instant bonus!';
                    _msg += '</p>';

                    //_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you gain!</b></p>';
                    showError(_msg, "Withdraw Complete!");
}

function playGame() {
  if(!canPlay) {
    showNotConnectedMsg();
    return;
  }
  // check minium ETH amount...
  BankOfEthHeistContractPlay.methods.minInvestment().call(function(err, results){
    if(err) {
      showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
    } else {
      minPlayAmount = new BigNumber(results);
      var investmentAmount = document.getElementById('investmentAmount').value;
      var investmentAmountEth = new BigNumber(keysPrice.times(investmentAmount));
      var minPlayAmountEth = new BigNumber(web3Connection.utils.fromWei(minPlayAmount.toString(), 'ether'));

      if(investmentAmountEth.isLessThan(minPlayAmountEth)) {
        showError("The minium investment is 1 KEY<br/><br/>Please update your investment and try again.", "Invalid Number of Keys");
      } else {
        if(requiresRestart) {
          // check if someone else has already restarted the round....
          
          BankOfEthHeistContractPlay.methods.latestRoundID().call(function(err, results){
          
            if(err){
              showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
            } else {
              var _currentRoundID = parseInt(results);
              if(_currentRoundID > currentRound.roundID) {
                requiresRestart = false;
              } else {
                requiresRestart = true;
              }

              if(!web3Connection.utils.isAddress(_referer)){
                console.log("Invalid Referer");
                _referer = web3Connection.utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
                console.log("New Referer:" + _referer);
              }
              //console.log("INVESTMENT AMT:" + investmentAmountEth.toString());

              if(requiresRestart){

                //BankOfEthHeistContract.methods.finalizeAndRestart(_referer).estimateGas(
                
                BankOfEthHeistContractPlay.methods.finalizeAndRestart().estimateGas(
                {from: userWalletAddress, value: web3Connection.utils.toWei(investmentAmountEth.toString(), "ether")}, 
                  function(error, gasAmount){
                    
                    if(error) {
                      showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
                    } else {
                      submitFinalizeAndRestart(gasAmount, investmentAmountEth);
                    }
                  }
                );

              } else {
                BankOfEthHeistContractPlay.methods.buyKeys(_referer).estimateGas(
                {from: userWalletAddress, value: web3Connection.utils.toWei(investmentAmountEth.toString(), "ether")}, 
                  function(error, gasAmount){
                    if(error) {
                      showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
                    } else {
                      submitInvestment(gasAmount, investmentAmountEth);
                    }
                  }
                );
              }
            }
          });
        } else {
          if(!web3Connection.utils.isAddress(_referer)){
            console.log("Invalid Referer");
            _referer = web3Connection.utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
            console.log("New Referer:" + _referer);
          }
          // play direct without restart...
          BankOfEthHeistContractPlay.methods.buyKeys(_referer).estimateGas(
          {from: userWalletAddress, value: web3Connection.utils.toWei(investmentAmountEth.toString(), "ether")}, 
            function(error, gasAmount){
              if(error) {
                showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
              } else {
                submitInvestment(gasAmount, investmentAmountEth.toString());
              }
            }
          );
        }
      }

    }
  });

}

function submitFinalizeAndRestart(gasAmount, playAmountEth) {


  $.toast({
      heading: 'Sending Transaction',
      text: 'Check your Ethereum Wallet to complete the transaction',
      icon: 'info',
      allowToastClose: true,
      position: 'bottom-right',
      hideAfter: TOAST_HIDE_DELAY,
      showHideTransition: TOAST_HIDE_TRANSITION
  })

  //BankOfEthHeistContract.methods.finalizeAndRestart(_referer).send(
  BankOfEthHeistContractPlay.methods.finalizeAndRestart().send(
      {
        from: userWalletAddress,
        gas: gasAmount,
        gasPrice: useGasPrice,
        value: web3Connection.utils.toWei(playAmountEth.toString(), "ether")
      }, function( err, results) {
        if(err) {
          $.toast({
              heading: 'Investment Cancelled',
              text: 'Your investment was cancelled and no ETH was spent this time - please try again!',
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
          })

        } else {
          var _msg = ""
          _msg += '<p style="font-size: 10pt;"><i>Please Note: Your investment will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
          _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
          _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
          _msg += '<p>';
          _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += '<code style="font-size: 8pt;">https://heist.bankofeth.app/heist.htm?ref=' + userWalletAddress + '</code>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += ' For every new investor you refer on - you will earn 3% from their first investment as an instant bonus!';
          _msg += '</p>';

          //_msg += '<div class="addthis_inline_share_toolbox"></div>';
          _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
          showError(_msg, "Investment Complete");

          //addthis.layers.refresh();
        }
      }
    );
}

function submitInvestment(gasAmount, playAmountEth) {


  $.toast({
      heading: 'Sending Transaction',
      text: 'Check your Ethereum Wallet to complete the transaction',
      icon: 'info',
      allowToastClose: true,
      position: 'bottom-right',
      hideAfter: TOAST_HIDE_DELAY,
      showHideTransition: TOAST_HIDE_TRANSITION
  })

  BankOfEthHeistContractPlay.methods.buyKeys(_referer).send(
      {
        from: userWalletAddress,
        gas: gasAmount,
        gasPrice: useGasPrice,
        value: web3Connection.utils.toWei(playAmountEth.toString(), "ether")
      }, function( err, results) {
        if(err) {
          $.toast({
              heading: 'Investment Cancelled',
              text: 'Your investment was cancelled and no ETH was spent this time - please try again!',
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
          })
          //showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
        } else {
          var _msg = ""
          
          //_msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and the Bank Of Eth balance  will update shortly.</p>';
          _msg += '<p style="font-size: 10pt;"><i>Please Note: Your investment will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
          _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
          
          _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';

          //_msg += '<div class="addthis_inline_share_toolbox"></div>';

          _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += '<code style="font-size: 8pt;">https://heist.bankofeth.app/heist.htm?ref=' + userWalletAddress + '</code>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += ' For every new investor you refer on - you will earn 3% from their first investment as an instant bonus!';
          _msg += '</p>';

          _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
          showError(_msg, "Investment Complete");
          //addthis.layers.refresh();
        }
      }
    );
}


function submitReinvest(gasAmount, playAmountEth) {


  $.toast({
      heading: 'Sending Transaction',
      text: 'Check your Ethereum Wallet to complete the transaction',
      icon: 'info',
      allowToastClose: true,
      position: 'bottom-right',
      hideAfter: TOAST_HIDE_DELAY,
      showHideTransition: TOAST_HIDE_TRANSITION
  })

  BankOfEthHeistContractPlay.methods.reinvestReturns(
    web3Connection.utils.toWei(playAmountEth.toString(),"ether"), _referer).send(
      {
        from: userWalletAddress,
        gas: gasAmount,
        gasPrice: useGasPrice
      }, function( err, results) {
        if(err) {
          $.toast({
              heading: 'Investment Cancelled',
              text: 'Your investment was cancelled and no ETH was spent this time - please try again!',
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
          })
          //showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
        } else {
          var _msg = ""
          //_msg += '<p style="font-size: 10pt;"><b>Your Investment is complete!</b></p>';
          //_msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and the Bank Of Eth balance  will update shortly.</p>';
          _msg += '<p style="font-size: 10pt;"><i>Please Note: Your investment will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
          _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
          //_msg += '<p style="font-size: 10pt;">Share Bank of Eth now:</p>';
          //_msg += '<div class="addthis_inline_share_toolbox"></div>';

          _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';

          //_msg += '<div class="addthis_inline_share_toolbox"></div>';

          _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += '<code style="font-size: 8pt;">https://heist.bankofeth.app/heist.htm?ref=' + userWalletAddress + '</code>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += ' For every new investor you refer on - you will earn 3% from their first investment as an instant bonus!';
          _msg += '</p>';


          _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you gain!</b></p>';
          showError(_msg, "Investment Complete");
          //addthis.layers.refresh();
        }
      }
    );
}


function showNotConnectedMsg() {
  var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  var isAndroid = false;
  if(navigator.userAgent.toLowerCase().indexOf("android") > -1)
    isAndroid = true;

  if(iOS){
    showError("To play BANK HEIST 4D you need a Web3 Browser and be connected to the Ethereum Mainnet.<br/><br/>For iOS we recommend: <a href=\"https://wallet.coinbase.com/\">Coinbase Wallet</a> - please go to the dapps section and browse to our site when using.<br/><br/>Refresh this page when you are logged into your wallet.", "Unlock Wallet");
  } else {
    if(isAndroid){
      showError("To play BANK HEIST 4D you need a Web3 Browser and be connected to the Ethereum Mainnet.<br/><br/>For iOS we recommend: <a href=\"https://wallet.coinbase.com/\">Coinbase Wallet</a> - please go to the dapps section and browse to our site when using.<br/><br/>Refresh this page when you are logged into your wallet.", "Unlock Wallet");
    } else {
      showError("To play BANK HEIST 4D you need a Web3 Browser and be connected to the Ethereum Mainnet.<br/><br/>Please connect to <a href=\"https://metamask.io/\" target=\"_new\">Metamask</a> and select the Mainnet and ensure you are logged in to continue.<br/><br/>Refresh this page when you are logged into your wallet.", "Unlock Wallet");    
    }
  }
}


function showError(error, errorTitle) {
    if(errorTitle) {
      updateInnerHTML('errorHeader', errorTitle);
    } else {
      updateInnerHTML('errorHeader', 'Bank Heist');
    }

    updateInnerHTML('errorContent', error);

    $('#errorMessage').foundation('open');

}
function updateInnerHTML(item, value){
  document.getElementById(item).innerHTML = value;
}
function roundTo2Dec(_in) {
  return Math.round(_in * 100) / 100
}
function getRadioBtnValue(radioBtnName) {
  var radios = document.getElementsByName(radioBtnName);
  var retVal = '';
  for (var i = 0, length = radios.length; i < length; i++)
  {
   if (radios[i].checked)
   {
    retVal = radios[i].value;
    break;
   }
  }
  return retVal;
}
function isOdd(num) { return num % 2;}
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
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
function padNumber(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function roundNumber(num, scale) {
  if(!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + scale)  + "e-" + scale);
  } else {
    var arr = ("" + num).split("e");
    var sig = ""
    if(+arr[1] + scale > 0) {
      sig = "+";
    }
    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
  }
}
