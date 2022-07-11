
let contractAddress = "0x438b6600584d67d8a12ca2edbe1c6b137180a406"; //testnet


let isDebug = true;



let CONNECTION_TO_USE;

if(isDebug)
  CONNECTION_TO_USE = "wss://ropsten.infura.io/ws";
else
  CONNECTION_TO_USE = "wss://mainnet.infura.io/ws";



var maxETH = 200;
var NULL_ADDR = "0x0000000000000000000000000000000000000000";
var _referer = NULL_ADDR; // "0x0000000000000000000000000000000000000000";
var TOAST_HIDE_DELAY = 5000;
var TOAST_HIDE_TRANSITION = 'slide';
var clipboard;


var latestRoundID = 0;
var currentDay = 0;
var roundInfo = {};

var totalsInfo = {};
var dayBonuses = {};
var dayBonusAvail = null;
var playerInfo = {};
var playerVanity = "";

var playersInRound = [];
var playersInRoundAddr = [];
var currentDayScores = [];
var isMobile = false;
var connectionAttempts = 0;

App = {
  web3Provider: null,
  isReadOnly: false,
  gameConnection: null,
  contracts: {},
  userWalletAddress: "",
  userWalletAddressShort: "",
  currentGame: '333',

  init: async function() {

    if(document.location.href.indexOf('cards.htm')> 0) {
      App.currentGame = 'cards';

    }

    return await App.initWeb3();
  },


  initWeb3: async function() {
    
    let _startFromHere = true;

    if (window.ethereum) {
      
      App.web3Provider = window.ethereum;
      
      try {
        // Request account access
        await window.ethereum.enable();
        console.log("window.ethereum");

        App.gameConnection = new Web3(window.ethereum);
        

      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {

      console.log("window.web3");
      App.web3Provider = window.web3.currentProvider;
      App.gameConnection = new Web3(web3.currentProvider);

    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      _startFromHere = false;
        setupReadOnlyWeb3();

    }
    
    if(_startFromHere){
      getUserWalletAddress();
      return App.initContract();
    }
    else
      return true; // contracts init from setupReadOnlyWeb3
    
  },


  initContract: async function() {
  
    App.contracts.EthWin = new App.gameConnection.eth.Contract(ethwinmain.abi, contractAddress);

    return App.bindEvents();

  },

  bindEvents: function() {

    window.odometerOptions = {
      auto: false,
      format: '(ddd).dddd', 
      duration: 2000
    };



    updateGameStats(true);

    $('#instantWinCode1').prop('disabled', true);
    $('#instantWinCode2').prop('disabled', true);
    $('#instantWinCode3').prop('disabled', true);


    $('#DiceBtn').click(function(){
      changeGame('dice');
      
    });

    $('#investBtn').click(function(){
      invest();
    });

    $('#freeDailyKey').click(function(){
      freeDailyKey();
    })

    $('#buyVanity').click(function(){
      buyVanityName();
    });
    $('#buyVanity2').click(function(){
      buyVanityName();
    });

    $('#unlockVanity').click(function(){
      updateVanity();
    });

    $('#withdrawBtn').click(function(){
      withdrawReturns();
    });
    $('#reinvestAll').click(function(){
      reinvestReturns();
    })

    $("#safetyDepositCode").prop('disabled', true);

    clipboard = new ClipboardJS('.btn');

    $('#copyRefMobile').click(function(){
      showToast('Ref Link Copied', 'Your referral URL is copied to your clipboard!', 'info');
    });

    $('#copyRef2').click(function(){
      showToast('Ref Link Copied', 'Your referral URL is copied to your clipboard!', 'info');
    });

    $("#eventsTable").tableHeadFixer({head: true});
    $("#leaderboardTable").tableHeadFixer({head: true});


    $('#buySilverCard').click(function() {
      buyCard(0);
    });
    $('#buyGoldCard').click(function() {
      buyCard(1);
    });
    $('#buyPlatinumCard').click(function() {
      buyCard(2);
    });


    //console.log("INIT GOOGLE TRANS");
    new google.translate.TranslateElement({pageLanguage: "en, ru, zh-CN"}, 'google_translate_element');


    $('#flag-english').click(function(){
      updateLang('en');
    });
    $('#flag-chinese').click(function(){
      updateLang('zh-CN');
    });
    $('#flag-russian').click(function(){
      updateLang('ru');
    });


    var _lang = Cookies.get('lang')||"";
    console.log("LANG:", _lang);
    if(_lang.length > 0) {
      setTimeout(function(){
        updateLang(_lang);
      },1000);
    }

  },

 
 
};


function setupReadOnlyWeb3() {
    // READ ONLY CONNECTION...
    App.web3Provider = new Web3.providers.WebsocketProvider(CONNECTION_TO_USE);
    App.isReadonly = true;
    console.log("provider:", App.web3Provider);
    
    App.web3Provider.on('connect',function(e){
      App.gameConnection = new Web3(App.web3Provider);
      App.initContract();
    });

    App.web3Provider.on('error', function(e){
      console.error('WS Error', e);
      reconnectProvider(0);
    });

    App.web3Provider.on('end', function(e) {
      reconnectProvider(0);
    });
}
function reconnectProvider(_tries) {
  try {
    console.log("restarting...");
    App.web3Provider = new Web3.providers.WebsocketProvider(CONNECTION_TO_USE);

    App.web3Provider.on('connect', function () {
        console.log('WSS Reconnected');
        App.gameConnection = new Web3(App.web3Provider);
        App.initContract();
    });

    App.web3Provider.on('error', function(e) {
      console.log('reconnect error', e);
      reconnectProvider(_tries++);
    });

    App.web3Provider.on('end', function(e) {
      console.log('reconnect end', e);
      reconnectProvider(_tries++);
    });

  } catch (e) {
    console.log(e);
    _tries++;
    if(_tries < 20){
      setTimeout(function() {
        reconnectProvider(_tries); 
      }, 500);
    } else {
      showError('Unable to connect to the Blockchain - please refresh this page to try again.', 'EthWin');
    }
  }
}




function changeGame(_newGame) {
  if(_newGame == App.currentGame)
    return;

  if(App.currentGame == '333') {
    $('#333game').addClass('hideDiv');  
  }

  if(_newGame == '333'){

  }
  if(_newGame == 'dice'){

  }
  if(_newGame == 'bankers'){

  }

  App.currentGame = _newGame;
  
}

function showInstantWinHelp() {
  $('#instantWinHelp').foundation('open');
}
function showSafetyDepositHelp(){
  $('#safetyDepositHelp').foundation('open');
}
function showVanityHelp() {
 $('#vanityHelp').foundation('open'); 
}
function updateVanity() {
  $('#vanityBuyDiv').foundation('close');

  let _name = document.getElementById('vanityName').value;
  
  console.log("_NAME", _name); 

  // check if name exists...
  console.log(_name);
  App.contracts.EthWin.methods.vanityToAddress(_name).call().then(function(results){
    console.log("EXISTS:", results);
    if(results == NULL_ADDR) {

      let hasError = false;

      submitBuyVanity(_name);
      

    } else {
      var _msg = ""
      _msg += '<p style="font-size: 10pt;"><i>The name you have chosen already exists!</i></p>';

      _msg += '<p style="font-size: 10pt;">Please try another<br/><br/></p>';         

      showError(_msg, "Name Exists");
    }

  });

}

function buyCard(_type) {
  let _cost;
  if(_type == 0) {
    _cost = cardsInfo._bankersSilverPrice;
  }
  if(_type == 1) {
    _cost = cardsInfo._bankersGoldPrice;
  }
  if(_type == 2) {
    _cost = cardsInfo._bankersPlatinumPrice;
  }


  App.contracts.EthWin.methods.buyBankersCard(_type).estimateGas({
    from: App.userWalletAddress,
    value: _cost.toString()
  }).catch(function(err){

  }).then(function(gasAmount){

    let hasError = false;
    showToast('Sending Transaction', 'Check your Eth Wallet to complete the transaction', 'info');

    App.contracts.EthWin.methods.buyBankersCard(_type).send({
      from: App.userWalletAddress,
      value: _cost.toString(),
      gas: gasAmount
    }).catch(function(err){
      hasError = true;
      showError("Unable to buy card - check you have enough ETH to complete the process!", "Error with TX");
    }).then(function(results){
      if(!hasError){
        let _msg = "<h4>Congratulations!</h4>"
        if(_type == 0)
        _msg += '<p style="font-size: 10pt;"><b>You now own the <b>Silver Card</b>!</b></p>';
        if(_type == 1)
        _msg += '<p style="font-size: 10pt;"><b>You now own the <b>Gold Card</b>!</b></p>';
        if(_type == 2)
        _msg += '<p style="font-size: 10pt;"><b>You now own the <b>Platinum Card</b>!</b></p>';

        _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and you\'ll start to earn dividends!.</p>';
        

        showError(_msg, "Success");
      }

    });

  });


  

}

function submitBuyVanity(_name){

  let _cost = App.gameConnection.utils.toWei("0.01", 'ether');

  App.contracts.EthWin.methods.buyVanity(_name).estimateGas({
      from: App.userWalletAddress,
      value: _cost.toString()
    }, function(err, gasAmount){

      showToast('Sending Transaction', 'Check your Eth Wallet to complete the transaction', 'info');
      // Working...
      App.contracts.EthWin.methods.buyVanity(_name).send(
          {
            from: App.userWalletAddress,
            gas: gasAmount,
            value: _cost.toString()
          }, function( err, results) {
            if(err) {
              showToast('Purcahse Cancelled','Your purchase was cancelled and no ETH was spent this time - please try again!', 'info');

            } else {
              let _msg = "<h4>Congratulations!</h4>"
              _msg += '<p style="font-size: 10pt;"><b>You now own <b>' + _name + '</b>!</b></p>';
              _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';
              
              _msg += '<p style="font-size: 10pt;">You\'ll need to refresh the UI to see the changes - click the reload button below to do so.</p>';

              _msg += '<center><button onclick="reloadPage();" class="button success">RELOAD</button></center>';
              

              $("#refidmobile").attr('value', "https://ethnwin.app/?eth=" + _name);
              $("#refid2").attr('value', "https://ethwin.app/?eth=" + _name);
              showError(_msg, "Success");
              
            }
          }
        );
  });



}

function getUserWalletAddress() {
  if(!App.isReadonly){

  App.gameConnection.eth.getCoinbase((err, res) => {
      var output = "";

      if (!err) {
          output = res;
          
          if(output) {

            App.userWalletAddress = output;

            // now check for vanity..
            App.contracts.EthWin.methods.addressToVanity(App.userWalletAddress).call().then(function(results){
              playerVanity = results;
              updateInnerHTML('vanityNameDisplay', playerVanity);

              if(playerVanity.length > 0){

                updateVanityAddress(App.userWalletAddress, playerVanity);
                $("#refidmobile").attr('value', "https://ethwin.app/?eth=" + playerVanity);
                $("#refid2").attr('value', "https://ethwin.app/?eth=" + playerVanity);
              }
              else{

                $("#refidmobile").attr('value', "https://ethwin.app/?eth=" + formatAddr(App.userWalletAddress));
                $("#refid2").attr('value', "https://ethwin.app/?eth=" + formatAddr(App.userWalletAddress));
              }

            }).catch(function(err){
                $("#refidmobile").attr('value', "https://ethwin.app/?eth=" + formatAddr(App.userWalletAddress));
                $("#refid2").attr('value', "https://ethwin.app/?eth=" + formatAddr(App.userWalletAddress));
            });


            // check for reverse _referer...
            console.log("CHECKING", _referer);

            App.contracts.EthWin.methods.vanityToAddress(_referer).call().then(function(results){
              console.log("VANITY ADDR:", results);
              if(App.gameConnection.utils.isAddress(results)){
                console.log("IS ADDRESS!")
                if(results == NULL_ADDR){
                } else {
                  _referer = results; 
                  console.log("DONE, NEW REF:", _referer);
                }
              }

            }).catch(function(err){
            });


      } else {
        showError("Unable to open your ETH Wallet - are you logged in to your Wallet?<br/><br/>If this issue continues please contact support."); 
        App.isReadOnly = true;
      }

    } else {
      showError("Unable to open your ETH Wallet - are you logged in to your Wallet?<br/><br/>If this issue continues please contact support.");
      App.isReadOnly = true;
    }
    
  });




  }
}


function updateGameStats(isInit) {
  console.log("UPDATING..", App.gameType);

  App.contracts.EthWin.methods.latestRoundID().call().then(function(results){
    let _newRoundID = parseInt(results.toString());
    if(_newRoundID > latestRoundID ) {
      latestRoundID = _newRoundID;
      roundEnded = false;      
    } 

    if(App.currentGame == '333') {
      getRoundInfo(updateClocks);
    } else {



      getCardsInfo();
    }
    

    if(App.currentGame == 'cards') {
      //bankersProfit
      App.contracts.EthWin.methods.totalBankersProfit().call().then(function(results){
        $('#bankersProfit').html( displayFromSUN(results,4));
      });

    } else {
      App.contracts.EthWin.methods.gameFund().call().then(function(results){

        updateInnerHTML('gameFund', displayFromSUN(results,4));
      });      
    }


    App.contracts.EthWin.methods.getTotalDivs().call().then(function(results){
      $('#totalDivs').html( displayFromSUN(results,4));
    });




    // player info
    //console.log("userWalletAddress:", App.userWalletAddress);

    if(!App.isReadonly && App.gameConnection.utils.isAddress(App.userWalletAddress)){

      App.contracts.EthWin.methods.investorInfo(App.userWalletAddress).call().then(function(results){
        playerInfo = results;
      //  console.log("playerInfo", playerInfo);
        populatePlayerInfo();
      });

    }


    if(isInit){
      // then events
      ///getPlayersInRound();
      getInitEvents();
    }




    setTimeout(function(){
      updateGameStats();
    }, 1000);

  });



}






var dailyActivePlayerAddress = [];


function solidityAddrToTronAddr(_in) {
  return "41" + _in.substring(2);
}
function updatePlayerDailyInfo() {
  currentDayScores = [];

  App.contracts.EthWin.methods.day_dayBonusActivePlayers(currentDay).call().then(function(results){
    
    dailyActivePlayerAddress = results;
    if(results.length > 0) {
      getDayScore(0);
    }

    


  });

}

function playerStatsSortedByKeys(){
  return playersInRound.sort(function(a,b){
    return parseInt(b.keys) - parseInt(a.keys);
  });
}






function getInitEvents() {
  App.contracts.EthWin.getPastEvents("Action", {
    filter: {},
    fromBlock: 0,
    toBlock: 'latest'
  }).then(function(results){
    for(let i=0; i< results.length; i++){
      processEvent(results[i], true);
    }
    $("time.timeago").timeago();
  });

/*
  App.tronWeb.getEventResult(contractAddress, {
    eventName:'Action',
    size: 100,
    page: 1
  }).then(results => {
      for(let i=0; i< 100; i++){
        processEvent(results[i], true);
      }
      $("time.timeago").timeago();
  });
*/

  /*
  App.contracts.TronWin.Action().watch((err, event) => {
    if (err) return console.error('Error with "method" event:', err);
    if (event) { 
      processEvent(event, false, false);
    }
  });
  */

  App.contracts.EthWin.events.Action({
    filter: {},
    fromBlock: 'latest'
  }, function(error,event){
    //if(!error)
      processEvent(event, false);
  });

}

var highestBlocknumber = 0;





function processEvent(event, isInit, isMobileEventsCheck) {
  if(!event)
    return;

  //console.log("NEW EVENT:", event);

  let eventRow = '';
  let hasEventRow = false;
  let _logDate = new Date(parseInt(event.returnValues.timestamp)*1000).toISOString();



  if( (isInit||isMobileEventsCheck) && event.blockNumber > highestBlocknumber)
    highestBlocknumber = event.block;

  if(event.event == "Action"){


    if(event.returnValues.event_type == 99){
      console.log("NEW EVENT:", event);

      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from) + '</td>';

      eventRow += '<td>Debug Dist: ' + displayFromSUN(event.returnValues.amnt,4) + 
      '  |' + event.returnValues.instant_guess + ':' + event.returnValues.instant_result 
      + ':' + event.returnValues.instant_prize + ':' + event.returnValues.bonus_guess + '</td>';

      hasEventRow = true;

    }

    if(event.returnValues.event_type == 0 || event.returnValues.event_type == 1) {
      // keys issued

      // check for win row...
      let _winRow = false;



      eventRow = '<tr class="standardEventRow">';
      

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from) + '</td>';

      if(event.returnValues.event_type == 0)
        eventRow += '<td><b>' + displayFromSUN(event.returnValues.amnt,3) + ' ETH</b> New Investment'
      else
        eventRow += '<td><b>' + displayFromSUN(event.returnValues.amnt,3) + ' ETH</b> New ReInvestment'

      eventRow += '</td>';

      hasEventRow = true;

      if(!isInit){
        if(event.returnValues.event_type == 0)
          showToast("New Investment", displayWalletAddress(event.returnValues.from).substring(0,10) + ' has Invested: ' + displayFromSUN(event.returnValues.amnt,4) + ' ETH!', 'info');
        else
         showToast("ReInvestment", displayWalletAddress(event.returnValues.from).substring(0,10) + ' has ReInvested: ' + displayFromSUN(event.returnValues.amnt,4) + ' ETH!', 'info');

      }


    }

    if(event.returnValues.returnValues == 4) {
      // is vanity purchase
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from) + '</td>';

      eventRow += '<td>Vanity Name Purchased: ' + event.returnValues.data + '</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('New Vanity Name', 'New Vanity Name Purchased: <b>' + event.returnValues.data + '</b>', 'info');


      updateVanityAddress(event.returnValues.from, event.returnValues.data)
      
    }

    if(event.returnValues.event_type == 7) {
      // is silver card
      //console.log(event);
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to) + '</td>';

      eventRow += '<td>Silver Bankers Card Bought for ' + displayFromSUN(event.returnValues.amnt,3) + ' ETH</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Silver Card Bought', 'Silver Bankers Card has been Bought for  <b>' +  displayFromSUN(event.returnValues.amnt,3) + ' ETH</b>', 'info'); 
    }

    if(event.returnValues.event_type == 8) {
      // is gold card
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to) + '</td>';

      eventRow += '<td>Gold Bankers Card Bought for ' + displayFromSUN(event.returnValues.amnt,3) + ' ETH</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Gold Card Bought', 'Gold Bankers Card has been Bought for  <b>' +  displayFromSUN(event.returnValues.amnt,3) + ' ETH</b>', 'info'); 
    }

    if(event.returnValues.event_type == 9) {
      // is plat card
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to) + '</td>';

      eventRow += '<td>Platinum Bankers Card Bought for ' + displayFromSUN(event.returnValues.amnt,3) + ' ETH</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Platinum Card Bought', 'Platinum Bankers Card has been Bought for  <b>' +  displayFromSUN(event.returnValues.amnt,3) + '</b> ETH', 'info'); 
    }

    if(event.returnValues.event_type == 5) {
      // is referral paid
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.to) + '</td>';

      eventRow += '<td>Earned Referral Bonus: ' + displayFromSUN(event.returnValues.amnt,3) + '</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Referral Bonus Earned', displayWalletAddress(event.returnValues.to).substring(0,15) + ' just earned a referral bonus of: <b>' + displayFromSUN(event.returnValues.amnt,3) + '</b>', 'info');
    }

    if(event.returnValues.event_type == 3) {
      // tax dist
      //if(!isInit)
      //  showToast("Divs Distributed!", App.tronWeb.fromSun(event.result.amnt) + " ETH has just been distributed to all players!", 'success');
    }


    if(event.returnValues.event_type == 2){
      // vault won!
      eventRow = '<tr class="winEventRow">';
      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from) + '</td>';

      eventRow += '<td><strong>Grand Pot WON: ' + displayFromSUN(event.returnValues.amnt) + ' ETH</strong></td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Grand Pot Won!', displayWalletAddress(event.returnValues.from).substring(0,10) +  ' has won the round Grand Pot of: <b>' + displayFromSUN(event.returnValues.amnt,3) + '</b>', 'info');
    }

    if(event.returnValues.event_type == 6){
      // new leader
      eventRow = '<tr class="winEventRow">';
      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.returnValues.from) + '</td>';

      eventRow += '<td><strong>- now leading the round - and set to win the Grand Pot!</strong></td>';

      hasEventRow = true;

      if(!isInit)
        showToast('New Round Leader!', displayWalletAddress(event.returnValues.from).substring(0,10) +  ' is now leading the round!', 'info');
    }

  } else {



  }


  if(hasEventRow){
    eventRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td></tr>';

    if(!isInit){
      $('#eventsTable tbody').prepend(eventRow);
      $("time.timeago").timeago();
    } else {
      $('#eventsTable tbody').prepend(eventRow);
    }
  }

}





function getRoundInfo(_callback){
  App.contracts.EthWin.methods.roundInfoInGame(latestRoundID).call().then(function(results){

    roundInfo = results;

    if(!App.isReadonly){
      App.contracts.EthWin.methods.latestRoundID().call().then(function(results){
        let _latestRoundID = parseInt(results.toString());
        if(!App.isReadonly) {
          App.contracts.EthWin.methods.getRoundPlayersRoundInvested(_latestRoundID, App.userWalletAddress).call().then(function(results){
            $('#roundInvested').html(displayFromSUN(results.toString(),3));
          });          
        }

      });

    }

    populateRoundInfo();

    if(_callback)
      _callback();

  });
}

var cardsInfo = {};
function getCardsInfo(_callback) {
  App.contracts.EthWin.methods.bankerCardsInfo().call().then(function(results){
    //console.log(results);
    cardsInfo = results;
    populateCardsInfo();
    if(_callback)
      _callback();    
  });

}

function formatDiff(_time) {
  var dateNow = new Date().getTime();
  var difference = (_time*1000) - dateNow;
  var orig_diff = difference;
  var daysDifference = Math.floor(difference/1000/60/60/24);
  //console.log("daysDifference", daysDifference);
  difference -= daysDifference*1000*60*60*24

  var hoursDifference = Math.floor(difference/1000/60/60);

  difference -= hoursDifference*1000*60*60

  var minutesDifference = Math.floor(difference/1000/60);
  difference -= minutesDifference*1000*60

  var secondsDifference = Math.floor(difference/1000);
  let _diffStr;
  //if(daysDifference > 0)
    _diffStr = daysDifference + ' Days, ' + padNumber(hoursDifference,2) + ":" + padNumber(minutesDifference,2) + ":" + padNumber(secondsDifference,2);
  //else
  //  _diffStr = padNumber(hoursDifference,2) + ":" + padNumber(minutesDifference,2) + ":" + padNumber(secondsDifference,2);
  return _diffStr;
}

function populateCardsInfo() {
  $('#silverPrice').html(displayFromSUN(cardsInfo._bankersSilverPrice,2));
  

  

  //console.log("SILVER TIME:", cardsInfo._bankersSilverStartTime.toNumber(),  cardsInfo._bankersSilverCardHalfLife.toNumber());
  //uint _silverDivider = (now - bankersSilverStartTime) / bankersSilverCardHalfLife;
  let dateNow = new Date().getTime();


  //console.log(":", (dateNow - cardsInfo._bankersSilverStartTime.toNumber()*1000) / (cardsInfo._bankersSilverCardHalfLife.toNumber()*1000));

  let _silverStartMultiples = 
    (dateNow - (parseInt(cardsInfo._bankersSilverStartTime)*1000)) 
      / (parseInt(cardsInfo._bankersSilverCardHalfLife)*1000);

  _silverStartMultiples = Math.floor(_silverStartMultiples);
  //console.log("_silverStartMultiples", _silverStartMultiples);

  let _silverStart = 
      parseInt(cardsInfo._bankersSilverStartTime.toString()) + 
            ( _silverStartMultiples * ( parseInt(cardsInfo._bankersSilverCardHalfLife) ));


  $('#silverTimer').html(formatDiff(
          _silverStart + parseInt(cardsInfo._bankersSilverCardHalfLife)
      ));

  $('#silverOwner').html(displayWalletAddress(cardsInfo._bankersSilverOwner).substring(0,25));

  //console.log("STARTTIME:", cardsInfo._bankersSilverStartTime.toNumber() + cardsInfo._bankersSilverCardHalfLife.toNumber());

  $('#goldPrice').html(displayFromSUN(cardsInfo._bankersGoldPrice,2));
  $('#goldOwner').html(displayWalletAddress(cardsInfo._bankersGoldOwner).substring(0,25));

  let _goldStartMultiples = 
    (dateNow - (parseInt(cardsInfo._bankersGoldStartTime)*1000)) / (parseInt(cardsInfo._bankersGoldCardHalfLife)*1000);
  _goldStartMultiples = Math.floor(_goldStartMultiples);

  let _goldStart = parseInt(cardsInfo._bankersGoldStartTime) + (_goldStartMultiples * (parseInt(cardsInfo._bankersGoldCardHalfLife)));

  $('#goldTimer').html(formatDiff(
        _goldStart + parseInt(cardsInfo._bankersGoldCardHalfLife)
      ));

  $('#platinumPrice').html(displayFromSUN(cardsInfo._bankersPlatinumPrice,2));
  $('#platinumOwner').html(displayWalletAddress(cardsInfo._bankersPlatinumOwner).substring(0,25));

  let _platinumStartMultiples = 
    (dateNow - (parseInt(cardsInfo._bankersPlatinumStartTime)*1000)) / (parseInt(cardsInfo._bankersPlatinumCardHalfLife)*1000);
  _platinumStartMultiples = Math.floor(_platinumStartMultiples);
  
  let _platinumStart = parseInt(cardsInfo._bankersPlatinumStartTime) + (_platinumStartMultiples * parseInt((cardsInfo._bankersPlatinumCardHalfLife)));


  $('#platinumTimer').html(formatDiff(
      _platinumStart + parseInt(cardsInfo._bankersPlatinumCardHalfLife)
      ));


}

var restartMsgShown = false;

function showRestartMessage() {
  if(roundEnded && !restartMsgShown){
    $('#roundEndedDiv').foundation('open');
    restartMsgShown = true;
  }
}


var eventUpdates = 0;
var eventUpdates2 = 0;
var clockFlashing = false;
var darkSet = false;


var isEveryCount5s = 0;
var isEvery5s = false;
var isEvery10s = false;
var isEveryCount10s = 0;
var isEvery30s = false;
var isEveryCount30s = 0;
var roundEnded = false;
var roundCountdownDarkAdded = false;

function updateClocks() {

  // if round hasn't yet started show the game countdown timer here...
  if(roundInfo.startTime > Date.now) {

  }


  var dateNow = new Date().getTime();
  var difference = (roundInfo.softDeadline*1000) - dateNow;
  var orig_diff = difference;
  var daysDifference = Math.floor(difference/1000/60/60/24);
  difference -= daysDifference*1000*60*60*24

  var hoursDifference = Math.floor(difference/1000/60/60);
  difference -= hoursDifference*1000*60*60

  var minutesDifference = Math.floor(difference/1000/60);
  difference -= minutesDifference*1000*60

  var secondsDifference = Math.floor(difference/1000);


  isEveryCount5s++;
  isEveryCount10s++;
  isEveryCount30s++;

  if(isEveryCount5s >=5 ){
    isEvery5s = true;
    isEveryCount5s = 0;
  } else {
    isEvery5s = false;
  }
  if(isEveryCount10s >=5 ){
    isEvery10s = true;
    isEveryCount10s = 0;
  } else {
    isEvery10s = false;
  }
  if(isEveryCount30s >=5 ){
    isEvery30s = true;
    isEveryCount30s = 0;
  } else {
    isEvery30s = false;
  }


  let triggerUpdate = false;
  let triggerUpdate2 = false;
  let triggerUpdateRate = 5;
  let triggerUpdateRate2 = 15;



  if(orig_diff < 1) {
    triggerUpdateRate = 1
  } else {
    if(parseInt(minutesDifference) < 7 && parseInt(hoursDifference) <= 0) {
      triggerUpdateRate = 1;
    }    
  }

  if(isEvery5s){
    
  }



  eventUpdates++;
  if(eventUpdates==triggerUpdateRate){
    triggerUpdate = true;
    eventUpdates=0;
  }
  eventUpdates2++;
  if(eventUpdates2==triggerUpdateRate2){
    triggerUpdate2 = true;
    eventUpdates2=0;
  } 




  

  if(roundCountdownDarkAdded){
    $('#roundCountdown').removeClass('roundCountdownDark');  
    roundCountdownDarkAdded = false;
  }

  // update second clock too
  if(roundInfo.softDeadline > 0) {


    if(orig_diff < 1) {
      // round ended!!!
      // need to confirm by a call to contract....

      
      if(triggerUpdate){

        getRoundInfo(showRestartMessage);
      }
      
      
    } else {

      hasShownRestartMsg = false;


      
      if(triggerUpdate) {
        // update the winner every trigger...
        //console.log("UPDATING");
      ////  getRoundInfo();
        //updatePrizes();
      }

      if(parseInt(minutesDifference) < 10 && parseInt(hoursDifference) ==0) {
        if(!clockFlashing){
          clockFlashing = true;
          $('#roundTicker').addClass('flash');
        }
      } else {
        if(clockFlashing){
          clockFlashing = false;
          $('#roundTicker').removeClass('flash');
        }
      }


      var _diffStr = "";
      if(daysDifference > 0) {
        if(daysDifference == 1)
          _diffStr = "1 day & "
        else
          _diffStr = daysDifference + " days, ";
      }
      _diffStr += padNumber(hoursDifference,2) + ":" + padNumber(minutesDifference,2) + ":" + padNumber(secondsDifference,2);

      updateInnerHTML('roundCountdown', _diffStr);
//       updateInnerHTML('clock2', _diffStr);
    }
  }
  



}


function populatePlayerInfo() {
  if(!App.isReadOnly) {


    if(isMobile)
      updateInnerHTML('playerAddress', displayWalletAddress(App.userWalletAddress).substring(0,20));
    else
      updateInnerHTML('playerAddress', displayWalletAddress(App.userWalletAddress).substring(0,30));

    //console.log(playerInfo);

    updateInnerHTML('totalInvested', displayFromSUN(playerInfo.invested,3));
    updateInnerHTML('totalWithdrawn', displayFromSUN(playerInfo.totalWithdrawn,3));
    updateInnerHTML('playerDivs', displayFromSUN(parseInt(playerInfo.divs) + parseInt(playerInfo.divsLocked),6));
    updateInnerHTML('playerReturns',  displayFromSUN(parseInt(playerInfo.totalReturns) - parseInt(playerInfo.refReturns),6));
    updateInnerHTML('playerRefReturns', displayFromSUN(playerInfo.refReturns,6));
    updateInnerHTML('playerTotal', displayFromSUN( parseInt(playerInfo.totalReturns) 
                                              + parseInt(playerInfo.divs) 
                                              + parseInt(playerInfo.divsLocked),6
                                                      ));
  }

}



function populateRoundInfo(){
  //console.log(roundInfo);


  updateInnerHTML('vaultPrize', displayFromSUN(roundInfo.jackpot,3));
  updateInnerHTML('grandPrize2', displayFromSUN(roundInfo.jackpot,3));


  var dateNow = new Date().getTime();
  var difference = (roundInfo.softDeadline*1000) - dateNow;
  if(difference < 1 ) 
    roundEnded = true;
  else
    roundEnded = false;




  if(roundEnded){

    updateInnerHTML('roundLeader', "Selecting...");
    updateInnerHTML('roundWinner', "Selecting...");
    updateInnerHTML('roundCountdown', '[OPEN]');
    updateInnerHTML('finalJackpot', displayFromSUN(roundInfo.jackpot,4));

    if(roundCountdownDarkAdded){
      $('#roundCountdown').removeClass('roundCountdownDark');  
      roundCountdownDarkAdded = false;
    }

  


  } else {

    restartMsgShown = false;
    if(isMobile)
      updateInnerHTML('roundLeader', displayWalletAddress(roundInfo.leader).substring(0,20));
    else
      updateInnerHTML('roundLeader', displayWalletAddress(roundInfo.leader).substring(0,30));

    updateInnerHTML('roundWinner', displayWalletAddress(roundInfo.leader).substring(0,10));

    //console.log("OK", displayWalletAddress(roundInfo.leader));

  }
  //console.log("ROUNDINFO:", roundInfo);

  updateInnerHTML('roundTotalInvested', displayFromSUN(roundInfo.totalInvested,3));

  if(roundInfo.leader_vanity.length > 0){
    updateVanityAddress(roundInfo.leader, roundInfo.leader_vanity);
  }

}




function withdrawReturns() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  App.contracts.EthWin.methods.withdrawReturns().estimateGas({
    from: App.userWalletAddress
  }, function(err,gasAmount){

    showToast('Sending Transaction', 'Check your Eth Wallet to complete the transaction', 'info');

    App.contracts.EthWin.methods.withdrawReturns().send(
        {
          from: App.userWalletAddress,
          gas: gasAmount
        }, function( err, results) {
          if(err) {
            showToast('Withdraw Cancelled','Your withdrawal was cancelled and no ETH was spent this time - please try again!', 'info');

          } else {
            let _msg = "<h4>Withdrawal Compelte!</h4>"
            _msg += '<p style="font-size: 10pt;"><b>Your Winnings are on their way!</b>!</b></p>';
            _msg += '<p style="font-size: 10pt;">The transaction will be mined by the Blockchain and the funds will show up in your wallet shortly!</p>';
            showError(_msg);
            
          }
    });

  });


}

// working
function reinvestReturns() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  if(roundEnded) {
    showError("You cannot start a new round with your returns - it must be started with ETH", "Round restarting");
    return;
  }

  let _playerTotal = 
        parseInt(playerInfo.totalReturns) 
        + parseInt(playerInfo.divs) 
        + parseInt(playerInfo.divsLocked);


  if(parseFloat(App.gameConnection.utils.fromWei(_playerTotal.toString())) < 0.001) {
    showError("You must have at least 0.001 ETH in your Total Returns to reinvest.", "Reinvestment");
    return;
  }
  


  App.contracts.EthWin.methods.reinvestFull().estimateGas({
    from: App.userWalletAddress
  }, function(error, gasAmount){

    showToast('Sending Transaction', 'Check your Eth Wallet to complete the transaction', 'info');


    App.contracts.EthWin.methods.reinvestFull().send(
        {
          from: App.userWalletAddress,
          gas: gasAmount
        }, function( err, results) {
          if(err) {
            showToast('Investment Cancelled','Your investment was cancelled and no ETH was spent this time - please try again!', 'info');

          } else {
            let _msg = "<h4>Congratulations!</h4>"
            _msg += '<p style="font-size: 10pt;"><b>You\'ve reinvested and will start to see an increase on your dividends!</b>!</b></p>';
            _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';

            showError(_msg);
          
          }
        });

  });



}

function validateInstantWinCode(_in) {
    if(isNaN(_in)) {
      return 0;
    } else {
      let _instantWinCode = parseInt(_in);
      if(_instantWinCode>=0 && _instantWinCode<10) {
        return _instantWinCode;
      } else {
        return 0;
      }
    }
}

function getInstantWinCodes() {
    let _instantWinCodes = [3];

    let _instantWinCode1 = document.getElementById('instantWinCode1').value;
    _instantWinCodes[0] = validateInstantWinCode(_instantWinCode1);

    let _instantWinCode2 = document.getElementById('instantWinCode2').value;
    _instantWinCodes[1] = validateInstantWinCode(_instantWinCode2);

    let _instantWinCode3 = document.getElementById('instantWinCode3').value;
    _instantWinCodes[2] = validateInstantWinCode(_instantWinCode3);


    let _instantWinCode = parseInt(_instantWinCodes[0])*100 + parseInt(_instantWinCodes[1])*10
           + parseInt(_instantWinCodes[2])

    return _instantWinCode;
}

// working
function invest() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }


  if(roundEnded) {

      submitFinalizeAndRestart();

  } else {

      submitInvest();

  }


}
function submitInvest() {
  let num = document.getElementById('investmentAmount').value;
  let numSUN = App.gameConnection.utils.toWei(num.toString(), 'ether');
//console.log("NEW:", num.toString(), numSUN.toString());
  let _ref = NULL_ADDR;
  if(_referer == NULL_ADDR) {
    _ref = NULL_ADDR;
  } else {
    if(App.tronWeb.isAddress(_referer)) {
      console.log("Referer:", _referer);
      _ref = _referer; 
      console.log("REF TO USE:", _ref);

    } else {
      console.log("Invalid Referer");
      _ref = NULL_ADDR;
    }
  }

  


  App.contracts.EthWin.methods.invest(_ref).estimateGas(
    {from: App.userWalletAddress, value: numSUN.toString()}, 
      function(error, gasAmount){

        console.log("GAS:", gasAmount, error);
        showToast('Sending Transaction', 'Check your Eth Wallet to complete the transaction', 'info');

        App.contracts.EthWin.methods.invest(_ref).send(
            {
              value: numSUN.toString(),
              gas: gasAmount,
              from: App.userWalletAddress
            }, function( err, results) {
              if(err) {
                showToast('Purcahse Cancelled','Your purchase was cancelled and no ETH was spent this time - please try again!', 'info');

              } else {
                let _msg = "<h4>Congratulations!</h4>"
                _msg += '<p style="font-size: 10pt;"><b>You\'ve invested <b>' + num.toString() + ' ETH </b>!</b></p>';
                _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';
                
                showError(_msg);
                
              }
            });

      });


}
function submitFinalizeAndRestart() {
  let num = document.getElementById('investmentAmount').value;
  let numSUN = App.gameConnection.utils.toWei(num.toString(), 'ether');

  let _ref = NULL_ADDR;
  if(_referer == NULL_ADDR) {
    _ref = NULL_ADDR;
  } else {
    if(App.tronWeb.isAddress(_referer)) {
      console.log("Referer:", _referer);
      _ref = _referer; 
      console.log("REF TO USE:", _ref);

    } else {
      console.log("Invalid Referer");
      _ref = NULL_ADDR;
    }
  }

  App.contracts.EthWin.methods.finalizeAndRestart(_ref).estimateGas({
    value: numSUN.toString(),
    from: App.userWalletAddress
  }, function(error, gasAmount){

    showToast('Sending Transaction', 'Check your Eth Wallet to complete the transaction', 'info');

    // Working...
    App.contracts.EthWin.methods.finalizeAndRestart(_ref).send(
        {
          from: App.userWalletAddress,
          value: numSUN.toString(),
          gas: gasAmount
        }, function( err, results) {
          if(err) {
            showToast('Purcahse Cancelled','Your purchase was cancelled and no ETH was spent this time - please try again!', 'info');

          } else {
            let _msg = "<h4>Congratulations!</h4>"
            _msg += '<p style="font-size: 10pt;"><b>You\'ve invested <b>' + num.toString() + ' ETH </b>!</b></p>';
            _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';
            showError(_msg);
          }
        });

  });


}



// working
function buyVanityName() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  $('#vanityBuyDiv').foundation('open');

}


window.addEventListener('load', function() {




  var isMobileCheck = window.matchMedia("only screen and (max-width: 760px)");
  if(isMobileCheck.matches){
    isMobile = true;
  }


  $(document).foundation();


  var _newReferer = getUrlParameter('eth')||"";
  if(_newReferer.length > 0) { // newly referred
    _referer = _newReferer;
  } else { // existing user referred by someone
    var _cookieRef = Cookies.get('eth')|"";
    if(_cookieRef.length >0)
      _referer = _cookieRef;
  }
  Cookies.set('eth', _referer, { expires: 30 });




  App.init();

});



// Other Game UI


var instantWinActive = false;



function keysPlus(num) {


  if(num == 0) {
    document.getElementById('investmentAmount').value = '0.001';
  } else {
    document.getElementById('investmentAmount').value = (parseFloat(document.getElementById('investmentAmount').value) + parseFloat(num)).toFixed(3);
    if(parseInt(document.getElementById('investmentAmount').value) > maxETH){
      document.getElementById('investmentAmount').value = maxETH;
      showToast('Max ETH Limit','The Max investment per Play is: ' + maxETH, 'info');
    }
  }
  
}





//
// UTILS
//
var vanityNames = [];

function displayWalletAddress(_addr) {


  let _out = formatAddr(_addr);



  if(vanityNames[_out]) {
    return vanityNames[_out]
  } else {
    return _out;
  }
}

function updateVanityAddress(_addr, _vanity) {

  vanityNames[formatAddr(_addr)] = _vanity;

}
function formatAddr(_in) {
  let _out = _in;

  return _out;
}

function showNotConnectedMsg() {
  $('#notConnectedModel').foundation('open');
  return;
}


function updateInnerHTML(item, value){
  document.getElementById(item).innerHTML = value;
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
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = padNumber(a.getHours(),2);
  var min = padNumber(a.getMinutes(),2);
  var sec = padNumber(a.getSeconds(),2);
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
function reloadPage(){
  location.reload();
}
function showError(error, errorTitle) {

    if(errorTitle) {
      updateInnerHTML('errorHeader', errorTitle);

    } else {

      //updateInnerHTML('errorHeader', 'PlanetCrypto');

    }

    updateInnerHTML('errorContent', error);

    $('#errorMessage').foundation('open');

}
function showToast(_heading, _title, _icon) {


    $.toast({
      heading: _heading,
      text: _title,
      icon: _icon,
      stack: 10,
      allowToastClose: true,
      position: 'bottom-right',
      hideAfter: TOAST_HIDE_DELAY,
      showHideTransition: TOAST_HIDE_TRANSITION
    });
}
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
function updateLang(_newLang){
  var selectField = document.querySelector("#google_translate_element select");
  //console.log("selectField", selectField);
  for(var i=0; i < selectField.children.length; i++){
    var option = selectField.children[i];
    // find desired langauge and change the former language of the hidden selection-field 
    if(option.value==_newLang){
       selectField.selectedIndex = i;
       // trigger change event afterwards to make google-lib translate this side
       selectField.dispatchEvent(new Event('change'));
       break;
    }
  }

  Cookies.set('lang', _newLang, { expires: 30 });
}
function displayFromSUN(_in, _round) {
  if(_round == 0) {
    return parseFloat(App.gameConnection.utils.fromWei(_in.toString())).toFixed(0);
  }else
  return parseFloat(App.gameConnection.utils.fromWei(_in.toString())).toFixed(_round||4);
}

// admin


function pushDataToRandos(){
    let _body = JSON.parse(_randosData);
    let _NewRandos = [];
    for(let i=0; i<_body.data.length;i++){
      _NewRandos.push(_body.data[i]);
    }


    //App.contracts.Rando2.pushRandos(_NewRandos).send(
    App.contracts.EthWin.pushRandos(_NewRandos).send(
      {}, 
        function(error, result){
          if(error) {
            showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
          } else {
            console.log("tx:", result);                    
            
          }
    });


}


function getRandoUInts() {
  //App.contracts.Rando2.getRandoUInts_10000(9, App.userWalletAddress, 4).send({
  App.contracts.TronWin.getRandoUInts(9, App.userWalletAddress, 4).send({
    shouldPollResponse: true
  }, function(error, results){
    if(error)
    console.log("err:", error);
  if(results)
    console.log("results", results);

  });

}


function getRandoUInt() {

  App.contracts.TronWin.getRandoUInt(10000, App.userWalletAddress).send({
    shouldPollResponse: true
  }, function(error, results){
    if(error)
    console.log("err:", error);
  if(results)
    console.log("results", results);

  });

}


function setP3TInterface(){


    App.contracts.TronWin.setP3TInterface("THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky").send(
      {}, 
        function(error, result){
          if(error) {
            showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
          } else {
            console.log("tx:", result);            
            
          }
    });


}

function updateAllowedContracts() {
  App.contracts.TronWin.updateAllowedContracts("TGjBQ94sMMumQcmXiifcuWoiKi4Q2j4f4x", true).send({},function(error,results){
    console.log("TX:", results);
  });
}



var _randosData = '{"type":"uint16","length":1000,"data":[35442,624,33760,61965,27646,32686,63450,5872,3440,63844,29026,46244,58964,53955,21140,12072,59161,64898,20369,40775,40163,53613,47850,47927,10839,47410,16980,62324,24382,16184,33674,50036,31035,19611,43649,30930,26236,1882,36241,20215,3080,60088,58866,61291,5600,16840,11546,32564,44802,14174,12523,58524,63153,2790,42639,41439,32387,25949,62839,31361,7364,53226,14512,54894,65361,64698,2149,7468,21505,36395,33865,56702,13352,61288,4399,17345,32123,28795,58397,11341,26100,27554,14554,19353,56567,53214,51135,42793,28080,61252,56609,34356,14919,8163,56921,41796,42690,34433,21896,4603,11171,50868,15772,31227,22761,32670,54568,6141,257,47217,21398,28729,18421,40800,17250,62458,22715,17459,28524,63636,37140,40190,42997,925,51132,5496,56239,42952,12464,23677,52981,45030,45151,58108,53801,35589,64295,49328,6737,10363,55489,5384,5517,47805,54003,20028,17654,7866,10913,34817,43845,13670,53133,51163,38761,19420,25721,46801,10578,392,26146,64115,30027,60954,7302,58201,26569,3797,25295,54155,46035,13495,61757,5145,24278,59650,15658,36147,2418,26065,57315,60403,20760,48574,33582,40004,62209,53157,27035,5096,46915,11529,48964,61082,2632,17222,53647,21654,42841,28171,40606,44475,44755,54995,36625,6763,61302,15950,40292,30612,21369,58840,65314,20861,9808,20340,21040,50308,52622,46058,34204,22409,46937,28679,13454,41146,62620,36205,13180,64739,9684,43651,15932,27243,41933,30425,51735,29582,12339,45841,29615,17202,33684,10569,41646,61206,18168,27816,15384,62109,16792,6921,4439,35381,23657,46590,15770,49135,8774,57515,59216,16002,22839,40375,51015,11252,2212,30161,7616,9759,8833,4708,44060,39468,40484,6781,57630,3593,33838,63763,35491,8588,42671,15296,33164,62231,38187,28530,20269,42616,18866,56081,45445,13915,58541,16016,9865,62629,31600,13158,47968,13209,65227,63626,24588,54963,27295,64282,20480,31659,38568,50280,52473,35323,20090,12635,27930,14991,15664,9823,33873,42671,55327,64196,29427,45921,49279,38217,6504,25150,40543,9664,58350,61457,53826,303,16937,16798,44270,44172,65405,51432,58218,26654,31238,380,34662,52685,15615,62241,64181,50125,9268,22452,31944,237,34112,36820,50099,13424,50930,38622,37343,53476,19543,46632,37108,45463,7204,10075,33874,29130,20485,42559,11877,29764,44337,36740,38153,2823,55148,14854,28652,63562,36339,33853,63629,15060,35781,45008,53759,22216,6112,5976,61834,36512,24255,40676,55019,30232,36154,6951,26352,52251,32381,10657,33091,63698,15719,54957,25322,35188,33836,31463,30445,33739,32651,15737,35264,38749,9233,26189,43159,51151,45463,17259,28000,53247,20977,21420,57001,63474,43513,55792,15004,56406,27823,27925,3376,5153,54969,13120,37791,57417,59536,52542,36906,56290,38525,4082,54872,10639,12293,60714,36197,32832,32863,62416,21167,9367,58590,53532,6316,27807,7547,32145,32362,18478,29320,63578,19955,57842,64431,44857,57122,7851,60441,45199,52130,28173,11542,36160,27157,47358,60400,44514,35891,40537,10201,40747,58787,17255,16080,57133,52100,9502,25184,63491,22868,27832,12538,59105,29334,26620,11068,57403,13797,53314,36204,17977,65371,51744,57185,64032,51167,50358,63865,12049,50713,47991,2711,13600,52192,38943,28844,2011,63019,21350,13616,40065,22352,49947,62175,19733,50666,60652,63782,23710,33218,31758,11866,32091,3308,31439,48070,353,898,61288,43723,13280,43784,21558,4629,25198,42242,8754,58700,46849,17885,9764,62505,53239,42067,46366,34101,46794,46786,22559,47417,41947,62477,33098,28558,42046,28530,49917,55417,18296,47060,2258,34211,48884,26854,40083,15952,38267,55068,31905,29759,41356,26077,23711,62283,55349,64723,4634,54147,56575,11619,57258,45318,45245,44011,43872,27332,14838,4247,14455,3474,7251,6714,41754,47451,41258,15701,62740,39967,27217,42259,26940,34302,17986,47638,56867,60342,21711,1215,57262,33970,16939,26988,20049,5291,3718,46222,39699,3531,25382,39743,8056,20897,4550,20925,27802,11194,25002,43789,37632,38700,24647,64948,8626,37894,63446,28338,58660,20722,4456,10951,55267,34018,57398,15915,58362,61119,34663,55574,41692,20302,42064,8869,55295,16287,5453,36535,17269,39655,9332,26621,47233,20599,63138,7275,60249,35749,59999,50149,35009,9538,49781,3484,26678,64764,5719,65270,51737,37710,18976,6359,9468,41714,48065,16385,34235,23055,18334,25736,26217,62132,44431,13785,59628,28159,37931,57460,35758,34411,28271,869,28681,48587,26507,55311,13208,42737,1583,65488,38944,31643,22732,18743,15623,12609,18303,16695,62806,14611,9901,49666,49818,21631,53888,30424,61274,45244,59680,56130,48779,53229,49098,15796,61864,30692,32699,48260,65070,37149,51867,62750,39210,46501,18804,275,37741,2602,10608,49938,8528,17109,25704,42994,64500,33496,51011,62075,1796,20878,16444,53143,16091,13646,7304,6382,33869,49780,31753,22858,28632,3911,40178,985,34903,19325,3826,52615,41964,32885,24837,54894,15316,64354,41882,23988,60232,61089,46385,48858,60089,34466,21444,14620,7098,16729,32496,13966,30000,30502,55206,17334,26738,50441,8205,1874,47265,23533,57758,26543,27071,44854,38888,62865,54874,55758,42624,32556,39813,32184,34780,23774,36596,52118,53580,45419,28621,29161,20022,1237,57134,59172,64482,44539,43958,49841,43334,32531,8036,47193,30533,59094,29382,7867,20312,42436,4249,15446,44433,39927,20873,11417,41577,45907,12842,18832,45460,55362,10125,63152,56342,49843,12347,57728,34566,30542,59116,3657,41253,53036,41684,32493,13253,12492,27220,8757,59003,4213,3379,57991,2243,38076,60532,49764,24969,17115,29150,49966,52358,27461,11196,45308,62044,34641,25024,18026,57699,37510,1188,21729,1307,34663,20027,63357,5846,52709,63029,64228,6598,56601,60564,26092,23729,13721,27329,10653,64118,30711,5881,48563,38008,62087,42833,63349,35610,6957,586,19134,10522,5278,13810,17600,41479,24309,22697,35079,30388,3416,52218,44160,17965,42750,62739,21070,64751,34174,22196,44250,58258,28674,3269,32402,3961,27182,18823,44006,36591,40682,51093,11811,35231,64762,47215,21329,6104,4108,8466,38849,34158,51459,20417,45210,16975,20967,8251,18080,49976,46986,401,29036,17382,65018,62538],"success":true}';
