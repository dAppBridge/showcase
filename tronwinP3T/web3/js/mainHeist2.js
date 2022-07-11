//https://skalman.github.io/UglifyJS-online/
var isConnected = false;
var minPlayAmount = new BigNumber(0);
var userWalletAddress = "0x00";
var userWalletAddressShort = "0x00";
var userWalletBalance = 0;
var keysPrice = new BigNumber(10);
var games = [];

var TOAST_HIDE_DELAY = 5000;
var TOAST_HIDE_TRANSITION = 'slide';


var airdropChance = 100;
var megaJackpotChance = 600;
var previousTRXdist = new BigNumber(0);

var INSTANTWIN_NEEDED = 600;
var SAFETYDEPOSITWIN_NEEDED = 200;

var NULL_ADDR = "410000000000000000000000000000000000000000";

var isMobile = false;
var isReadonly = true;



function viewContract() {
  var win = window.open('https://tronscan.org/#/contract/' + contractAddress, '_blank');
  if (win) {
      win.focus();
  } 
}

window.addEventListener('load', function() {

  var isMobileCheck = window.matchMedia("only screen and (max-width: 760px)");
  if(isMobileCheck.matches){
    isMobile = true;
  }
  $('#loadingGif').attr('src', 'images/loading.gif');

  //$("time.timeago").timeago();

  $("#previousPlayersTable").tableHeadFixer({head: true});
  $("#eventsTable").tableHeadFixer({head: true});
  $("#winsTable").tableHeadFixer({head: true});
  


  function setupTron(){
    if(window.tronWeb) {
      // need to check they are on the right network
      isReadonly = false;


    } else {
      console.log("READ ONLY TRON");
      const HttpProvider = TronWeb.providers.HttpProvider;
      
      
      const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
      const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
      const eventServer = 'https://api.shasta.trongrid.io/';
      
      
      /*
      const fullNode = new HttpProvider('https://api.trongrid.io');
      const solidityNode = new HttpProvider('https://api.trongrid.io');
      const eventServer = 'https://api.trongrid.io/'; 
      */

      const tronWeb = new TronWeb(
          fullNode,
          solidityNode,
          eventServer,
          NULL_ADDR
      );
      window.tronWeb = tronWeb;

    }

    console.log("Init Referer:", _referer);
    
    //alert(window.tronWeb.fromSun(50000000000));

    startApp();

    

  }

  if(isMobile) {
    setTimeout(function(){setupTron();}, 1000);

  } else {
    setTimeout(function(){setupTron();}, 500);

  }



});


function startApp() {
  if(isMainGame) {
    checkNetwork();
  } else {
    checkNetwork(function() {
      if(!isDetail){

      } else {
        
      }
    });
  }
}


var latestRoundID = 0;

var lastBlock = 0;
var roundStartBlock = 0;
var roundStartTimestamp = 0;

function checkNetwork(_callback) {

  async function setupContracts() {


      var contractSetupHasError = false;
      try{
        TronHeistContract = await window.tronWeb.contract(heistABI2, contractAddress);
        TronHeistWinners = await window.tronWeb.contract(winnersABI, winnersAddress)
        console.log("TronHeist Setup");

        /*
        TronHeistContract.chanceTest().call().then(function(results){
          console.log("chanceTest A:", results.a.toString());
          console.log("chanceTest B:", results.b.toString());
        });
        */


      } 
      catch(err) {
        contractSetupHasError = true;
        console.log("Contract Setup Err:", err);

        var _msg = ""
        _msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
        _msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
        _msg += '<p style="font-size: 10pt;">Please ensure you are logged into your TRON Wallet and then refresh the page to try again.</p>';
        showError(_msg, "Error connecting to Tron Network");

      }

      if(contractSetupHasError)
        return;


      if(!isReadonly){
        //if(!isMobile){

          console.log("ACCOUNT", window.tronWeb.defaultAddress);
          if(!window.tronWeb.defaultAddress.hex) {
            var _msg = ""
            _msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
            _msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
            _msg += '<p style="font-size: 10pt;">Please ensure you are logged into your TRON Wallet and then refresh the page to try again.</p>';
            _msg += '<center><button type="button" onclick="reloadPage();" class="small2 button bordered information " data-close>Retry</button></center>';

            showError(_msg, "Error connecting to Tron Network");
            return;
          }
          userWalletAddress = window.tronWeb.defaultAddress.hex;
          userWalletAddressShort = userWalletAddress.substring(0,15) + "...";

          //setNewCardBg();


           
          if(isMainGame){
            canPlay = true;
            updateInnerHTML('referralid', formatAddress(userWalletAddress));
            updateInnerHTML('yourAddress', formatAddress(userWalletAddress));

          }
        
      }




      // find latest game round (RoundStarted)
      ///// then populate round stats (KeysIssued)
      ///// displayHighestKeyholders() call
      TronHeistContract.latestRoundID().call().then(function(results){
        latestRoundID = results.toNumber();
        console.log("latestRoundID:", latestRoundID);

        if(latestRoundID > 0) {
          // get base TRX distributed...
          // get total prize to this too?
          getPreviousRounds(function(){
            getGameRound(initGameRoundEvents);    
          });
        } else {
          getGameRound(initGameRoundEvents);  
        }
        
        // now get the keys for this round...

        

        // start clock
        setTimeout(function(){ updateClocks() }, 1000);

      });
      



    }
    


    setupContracts();

    return;


}
function updateNewRound() {

  TronHeistContract.latestRoundID().call().then(function(results){
    latestRoundID = parseInt(results.toNumber());
    console.log("UPDATING ROUND:", latestRoundID);
    getGameRound();
  });


}
async function getPreviousRounds(_callback) {
  for(let c=0; c< latestRoundID; c++) {
    await TronHeistContract.roundInfo(c).call().then(function(results){
      console.log("PREVIOUS:", results);
      previousTRXdist = previousTRXdist.plus(results.distributedReturns.toString());

      previousTRXdist = previousTRXdist.plus(results.jackpot.toString());

      console.log("previousTRXdist:", previousTRXdist.toString());
    });
  }
  if(_callback){
    _callback();
  }
}

var dailyPrize = new BigNumber(0);

function getGameRound(_callback){

  TronHeistContract.roundInfo(latestRoundID).call().then(function(results){
    //console.log(results);

    currentRound.leader = results.leader;
    currentRound.jackpot = new BigNumber(results.jackpot);
    currentRound.airdrop = new BigNumber(results.airdrop);
    currentRound.keys = new BigNumber(results.keys).div(DIVISOR);
    currentRound.totalInvested = new BigNumber(results.totalInvested);
    currentRound.distributedReturns = new BigNumber(results.distributedReturns);
    currentRound.hardDeadline = results._hardDeadline;
    currentRound.softDeadline = new BigNumber(results._softDeadline);
    currentRound.finalized = new BigNumber(results.finalized);
    currentRound.startTime = results.startTime;
    currentRound.roundID = latestRoundID;
    currentRound.isDark = results.isDark;
    currentRound.safetyDepositPot = new BigNumber(results.safetyDepositPot);


    // needs to update the needsrestart state here!
    if(currentRound.isDark){
      requiresRestart = false;
    } else {
      var dateNow = new Date().getTime();
      var difference = (currentRound.softDeadline.toNumber()*1000) - dateNow;
      if(difference < 1) {
        requiresRestart = true;
      }      
    }


    TronHeistContract.dailyInfo().call().then(function(results){
      currentRound.dailyTotal = new BigNumber(results.dailyTotal);
      currentRound.dayStartTs = new BigNumber(results.dayStartTs);

      TronHeistContract.instantWinJackpot().call().then(function(results){
        //console.log("instantWinJackpot", results);
        currentRound.instantWinJackpot = new BigNumber(results);

        updateInnerHTML('roundNumber', currentRound.roundID+1);
        

        if(currentRound.isDark){
          updateInnerHTML('roundCurrentWinner', "UNKNOWN on Dark Phase!");
          updateInnerHTML('currentLeader', "UNKNOWN!");
          updateInnerHTML('currentLeaderShort', "UNKNOWN");
          updateInnerHTML('totalEthInRound', window.tronWeb.fromSun(currentRound.jackpot.toString()).substring(0,8) + "+ TRX");
          updateInnerHTML('vaultPrize', window.tronWeb.fromSun(currentRound.jackpot.toString()).substring(0,8) + "+ TRX");


          updateInnerHTML('roundAirdropTotal', window.tronWeb.fromSun(currentRound.safetyDepositPot.toString()).substring(0,8) + "+ TRX");
          updateInnerHTML('roundAirdropTotal2', window.tronWeb.fromSun(currentRound.safetyDepositPot.toString()).substring(0,8) + "+ TRX");
          updateInnerHTML('roundKeysSold', currentRound.keys.decimalPlaces(2).toString() + "+");
          updateInnerHTML('distributedTrxThisRound', window.tronWeb.fromSun(currentRound.distributedReturns.plus(previousTRXdist).toString()).substring(0,8) + "+ TRX");
          updateInnerHTML('distributedTrxThisRound2', window.tronWeb.fromSun(currentRound.distributedReturns.plus(previousTRXdist).toString()).substring(0,8) + "+ TRX");
          
          dailyPrize = new BigNumber(currentRound.dailyTotal);

          updateInnerHTML('dailyPrize', "???");
          updateInnerHTML('dailyPrize2', "???"); 
          

          updateInnerHTML('roundInvested', window.tronWeb.fromSun(currentRound.totalInvested.toString()).substring(0,8) + " TRX");
          updateInnerHTML('megaJackpotTotal', window.tronWeb.fromSun(currentRound.instantWinJackpot.toString()).substring(0,8) + " TRX");
          updateInnerHTML('megaJackpotTotal2', window.tronWeb.fromSun(currentRound.instantWinJackpot.toString()).substring(0,8) + " TRX");

        } else {
          updateInnerHTML('roundCurrentWinner', formatAddress(currentRound.leader));
          updateInnerHTML('currentLeader', formatAddress(currentRound.leader));
          updateInnerHTML('currentLeaderShort', formatAddress(currentRound.leader).substring(0,10) + "...");
          updateInnerHTML('totalEthInRound', window.tronWeb.fromSun(currentRound.jackpot.toString()).substring(0,8) + " TRX");
          updateInnerHTML('vaultPrize', window.tronWeb.fromSun(currentRound.jackpot.toString()).substring(0,8) + " TRX");

          updateInnerHTML('roundAirdropTotal', window.tronWeb.fromSun(currentRound.safetyDepositPot.toString()).substring(0,8) + " TRX");
          updateInnerHTML('roundAirdropTotal2', window.tronWeb.fromSun(currentRound.safetyDepositPot.toString()).substring(0,8) + " TRX");
          updateInnerHTML('roundKeysSold', currentRound.keys.decimalPlaces(2).toString());
          updateInnerHTML('distributedTrxThisRound', window.tronWeb.fromSun(currentRound.distributedReturns.plus(previousTRXdist).toString()).substring(0,8) + " TRX");
          updateInnerHTML('distributedTrxThisRound2', window.tronWeb.fromSun(currentRound.distributedReturns.plus(previousTRXdist).toString()).substring(0,8) + " TRX");
          
          dailyPrize = new BigNumber(currentRound.dailyTotal);

          updateInnerHTML('dailyPrize', window.tronWeb.fromSun(currentRound.dailyTotal.toString()).substring(0,8) + " TRX"); // this is 20% of the dailyprize
          updateInnerHTML('dailyPrize2', window.tronWeb.fromSun(currentRound.dailyTotal.toString()).substring(0,8) + " TRX"); 
          

          updateInnerHTML('roundInvested', window.tronWeb.fromSun(currentRound.totalInvested.toString()).substring(0,8) + " TRX");
          updateInnerHTML('megaJackpotTotal', window.tronWeb.fromSun(currentRound.instantWinJackpot.toString()).substring(0,8) + " TRX");
          updateInnerHTML('megaJackpotTotal2', window.tronWeb.fromSun(currentRound.instantWinJackpot.toString()).substring(0,8) + " TRX");

        }
        updateInnerHTML('roundHardDeadline', timeConverter(currentRound.hardDeadline));


        //console.log("GameRound:", results);
        //console.log("latestRoundID", latestRoundID);
        //console.log("currentRound.jackpot.toString()", currentRound.jackpot.toString());


        // populate top 5 players...

        // get length of dayTopKeys with call to: getCurrentDayChartSize() returns (size, day)
        // then call: getDayChartAtPos(day, pos) returns(address player, uint keys)



        //getDayPositions();


        // get investor info
        if(window.tronWeb.isAddress(userWalletAddress))
          getInvestorInfo();



          if(_callback)
            _callback();

      });


      




    });



  });
}

async function getDayPositions() {

  TronHeistContract.getCurrentDayChartSize().call().then(function(results){
    let _currentDay = parseInt(results.day.toNumber());
    let _size = parseInt(results.size.toNumber());
    //console.log("_currentDay:", _currentDay);
    console.log("_size:", _size);

    currentDayHolders = [];

    async function processPositions() {
  

      for(let c=0; c<_size;c++){
        await TronHeistContract.getDayChartAtPos(_currentDay, c).call().then(function(results){
          //console.log("C:", c);
          //console.log("DAY POS:", results);
          //console.log("DAY POS:", new BigNumber(results.keys).div(DIVISOR).toString());

          currentDayHolders.push({
              address: results.player,
              keys: BigNumber(results.keys).div(DIVISOR)
            });    

        });
      }
      //console.log("LEN:", currentDayHolders.length);

      displayHighestKeyholders();

    }

    processPositions();
    

  });

}

var totalReturns = new BigNumber(0);
var totalKeys = new BigNumber(0);
function getInvestorInfo(_callback) {
  if(!window.tronWeb.isAddress(userWalletAddress))
    return;
  //console.log("userWalletAddress", window.tronWeb.address.fromHex(userWalletAddress));
  //console.log("latestRoundID", latestRoundID);
  TronHeistContract.investorInfo(formatAddress(userWalletAddress),latestRoundID).call().then(function(results){
    //console.log("investorInfo:", results);
    if(results) {
      updateInnerHTML('yourKeysNumber', new BigNumber(results.keys).div(DIVISOR).decimalPlaces(2).toString());

      totalKeys = new BigNumber(results.keys).div(DIVISOR);

      var _totalReturns = new BigNumber(results.totalReturns);
      var _referralReturns = new BigNumber(results.referralReturns);
      totalReturns = new BigNumber(results.totalReturns);
      

      if(currentRound.isDark){
        updateInnerHTML('yourReturn', "???");
        updateInnerHTML('yourReferralReturn', "???");
        updateInnerHTML('yourReturnTotal', "???");

      } else {
        updateInnerHTML('yourReturn', window.tronWeb.fromSun(_totalReturns.minus(_referralReturns).toString()).substring(0,8) + " TRX");
        updateInnerHTML('yourReferralReturn', window.tronWeb.fromSun(_referralReturns).substring(0,8) + " TRX");
        updateInnerHTML('yourReturnTotal', window.tronWeb.fromSun(_totalReturns).substring(0,8) + " TRX");

      }
    }


    if(_callback){
      _callback();

    }
  }).catch(function(err){
    console.log("ERR getting investorInfo:", err);
  });

}


var initEvents = [];
var lastTimeStamp = 0;
var lastWinnersTimeStamp = 0;
let txSeen = [];
let _fingerprint = "";


async function initGameRoundEvents() {
  //console.log("START initGameRoundEvents");
  let _maxPages = 10;
  //updatePrizes();
  console.log("initGameRoundEvents currentRound.startTime", currentRound.startTime.toNumber() * 1000);
  //1552563024000
  //1552582161000

  let _tableRowsAdded = 0;
  

  for(let page=1; page < (_maxPages+1); page++) {


    page = await queryEventServer("KeysIssued", page, _maxPages);

    
    if(page == _maxPages){
      console.log("END:", page);
      //displayHighestKeyholders();
      // start event listenders
      //startEventListeners();
      initOtherEvents();
    }

  }

}

async function queryEventServer(name, page, _maxPages, _sinceTimestamp) {
  let _url = "https://" + api_url + "/event/contract/" + contractAddress + "/" + name + "?size=";
  _url += "200&page=" + page.toString();
  if(_sinceTimestamp)
    _url += "&sinceTimestamp=" + _sinceTimestamp;
  _url += "&previousLastEventFingerprint=" + _fingerprint;
  _url += "&sort=block_timestamp"

  //console.log(_url);
  let _fpSet = false;
  await $.getJSON( _url, function( data ) {

    //console.log("data:", data);

    if(data.length > 0) {

      //updateInnerHTML('debugCode', "02");

      for(let c=0; c < data.length; c++) {


        if(data[c]._fingerprint){
          _fpSet = true;
          //console.log("FP:", data[c]._fingerprint);

          _fingerprint = data[c]._fingerprint;

        } 

        if($.inArray(data[c].transaction_id + ":" + data[c].event_name + ":" + data[c].event_index, txSeen) == -1) {
          txSeen.push(data[c].transaction_id + ":" + data[c].event_name + ":" + data[c].event_index);

          // transform...
          let dataItem = {
            timestamp: data[c].block_timestamp, 
            contract: data[c].contract_address,
            name: data[c].event_name, 
            block: data[c].block_number, 

          }


          if(data[c].event_name == "KeysIssued"){
            dataItem.result = {
                keys: data[c].result.keys,
                rnd: data[c].result.rnd,
                timestamp: data[c].result.timestamp,
                to: "41" + data[c].result.to.substring(2),
                instantWinGuess: data[c].result.InstantWinGuess,
                instantWinAmount: data[c].result.InstantWinAmount,
                instantWinResult: data[c].result.InstantWinResult,
                safetyDepositGuess: data[c].result.SafetyDepositGuess,
                safetyDepositAmount: data[c].result.SafetyDepositAmount,
                safetyDepositResult: data[c].result.SafetyDepositResult
            }
          }

          if(data[c].event_name == "TrxDistributed"){
            dataItem.result = {
              amount: data[c].result.amount,
              rnd: data[c].result.rnd,
              timestamp: data[c].result.timestamp
            }

          }

          if(data[c].event_name == "AirdropWon" || data[c].event_name == "ReturnsWithdrawn" 
            || data[c].event_name == "MegaFundWon"
            || data[c].event_name == "JackpotWon"){
            dataItem.result = {
              amount: data[c].result.amount,
              rnd: parseInt(data[c].result.rnd)+1,
              timestamp: data[c].result.timestamp,
              by: "41" + data[c].result.by.substring(2)
            }
//console.log(dataItem);
          }

          if(data[c].event_name == "DailyPrize") {
            
            dataItem.result = {
              timestamp: data[c].result.timestamp,
              day: parseInt(data[c].result.day)+1,
              to: "41" + data[c].result.to.substring(2),
              amt: data[c].result.amt,
            }
            //console.log("----", data[c], dataItem);
          }

          if(data[c].event_name == "RoundStarted") {
            dataItem.result = {
              timestamp: data[c].result.timestamp,
              round: parseInt(data[c].result.ID)+1,
              hardDeadline: data[c].result.hardDeadline
            }

          }


          if(data[c].event_name == "PrizesUpdated") {
            dataItem.result = {
              timestamp: data[c].result.timestamp,
              SafetyDeposit: data[c].result.SafetyDeposit,
              InstantWin: data[c].result.InstantWin
            }
          }


          //updateInnerHTML('debugCode', JSON.stringify(dataItem));
          initEvents.push(dataItem);

          let _keys = new BigNumber(data[c].result.keys).div(DIVISOR).toString();
/*
          if(parseInt(data[c].result.rnd) == parseInt(latestRoundID) && name == "KeysIssued") {
            // is withiin current round so can be added to highest keyholder section
           updateHighestKeyholders(data[c].result.to, _keys);
          }
*/

        } else {
          
        }
      }

    } else {

      page = _maxPages
    }



  }).catch(function(e){
    console.log(e);

    page = _maxPages;

  });
  if(!_fpSet) {
    page = _maxPages
  }

  //console.log("PAGE:", page);
  return page;
}

async function initOtherEvents() {
  let _maxPages = 5;
  _fingerprint = "";
  //updateInnerHTML('debugCode', "04");

  for(let page=1; page < (_maxPages+1); page++) {


    page = await queryEventServer("AirdropWon", page, _maxPages);

    
    if(page == _maxPages){
      
      // start event listenders
      //startEventListeners();
      initOtherEvents2();
    }

  }
}


async function initOtherEvents2() {
  //updateInnerHTML('debugCode', "05");
  let _maxPages = 10;
  _fingerprint = "";
  for(let page=1; page < (_maxPages+1); page++) {


    page = await queryEventServer("TrxDistributed", page, _maxPages);

    
    if(page == _maxPages){
      
      // start event listenders
      //startEventListeners();
      initOtherEvents3();
    }

  }

}

async function initOtherEvents3() {
  //updateInnerHTML('debugCode', "06");
  let _maxPages = 10;
  _fingerprint = "";
  for(let page=1; page < (_maxPages+1); page++) {


    page = await queryEventServer("ReturnsWithdrawn", page, _maxPages);

    
    if(page == _maxPages){
      
      // start event listenders
      //startEventListeners();
      initOtherEvents4();
    }

  }

}

async function initOtherEvents4() {
  //updateInnerHTML('debugCode', "07");
  let _maxPages = 10;
  _fingerprint = "";
  for(let page=1; page < (_maxPages+1); page++) {

    page = await queryEventServer("RoundStarted", page, _maxPages);

    
    if(page == _maxPages){
      
      initOtherEvents5();
    }

  }

}

async function initOtherEvents5() {
  //updateInnerHTML('debugCode', "07");
  let _maxPages = 10;
  _fingerprint = "";
  for(let page=1; page < (_maxPages+1); page++) {

    page = await queryEventServer("JackpotWon", page, _maxPages);

    
    if(page == _maxPages){
      
      initOtherEvents6();
    }

  }

}

async function initOtherEvents6() {
  //updateInnerHTML('debugCode', "07");
  let _maxPages = 10;
  _fingerprint = "";
  for(let page=1; page < (_maxPages+1); page++) {

    page = await queryEventServer("DailyPrize", page, _maxPages);

    
    if(page == _maxPages){
      
      initOtherEventsEND();
    }

  }

}

async function initOtherEventsEND() {
  //updateInnerHTML('debugCode', "07");
  let _maxPages = 10;
  _fingerprint = "";
  for(let page=1; page < (_maxPages+1); page++) {


    page = await queryEventServer("MegaFundWon", page, _maxPages);

    
    if(page == _maxPages){
      
      // start event listenders
      //startEventListeners();
        processInitEvents(true);
        checkHeistEvents();
    }

  }

}


var _listendersSetup = false;
function startEventListeners(){
  if(_listendersSetup)
    return;
  console.log("STARTING LISTENERS");
  _listendersSetup = true;
  /*
    event KeysIssued(uint indexed rnd, address indexed to, uint keys, uint timestamp);
    event JackpotWon(uint indexed rnd, address by, uint amount, uint timestamp);
    event AirdropWon(uint indexed rnd, address by, uint amount, uint timestamp);

    event TrxDistributed(uint indexed rnd, uint amount, uint timestamp);
    event ReturnsWithdrawn(uint indexed rnd, address indexed by, uint amount, uint timestamp);
    
    
    event MegaFundWon(uint indexed rnd, address by, uint amount, uint timestamp);
    event MegaFundEnd(uint indexed rnd, uint amount, uint timestamp);
    event RoundStarted(uint indexed ID, uint hardDeadline, uint timestamp);
  */


  TronHeistContract["KeysIssued"]().watch(function(err,res){
    if(err)
      console.log("Err on event:", err);

    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting KeysIssued events", err);
  });


  TronHeistContract["JackpotWon"]().watch(function(err,res){
    
    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting JackpotWon events", err);
  });

  TronHeistContract["AirdropWon"]().watch(function(err,res){
    
    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting AirdropWon events", err);
  });

  TronHeistContract["TrxDistributed"]().watch(function(err,res){
    
    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting TrxDistributed events", err);
  });

  TronHeistContract["ReturnsWithdrawn"]().watch(function(err,res){
    
    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting ReturnsWithdrawn events", err);
  });

  TronHeistContract["MegaFundWon"]().watch(function(err,res){
    
    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting MegaFundWon events", err);
  });

  TronHeistContract["MegaFundEnd"]().watch(function(err,res){
    
    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting MegaFundEnd events", err);
  });

  TronHeistContract["RoundStarted"]().watch(function(err,res){
    
    if(res)
      processLogResult(res);
  }).catch(function(err){
    console.log("Error getting RoundStarted events", err);
  });

}

function processLogResult(logEvent){


  console.log("processLogResult:", logEvent);

  // update the UI
  getGameRound();
  addEvent(logEvent);

  if(logEvent.name =='KeysIssued'){
    let playersRow = '<tr class="smallTxt">';
    let _keys = new BigNumber(logEvent.result.keys).div(DIVISOR).toString();

    //console.log("BLOCK CHECK:" + results[c].blockNumber + ":" + roundStartBlock);
    //console.log("BLOCK DETAILS:" + results[c].returnValues.to +":" + _keys);

    if(parseInt(logEvent.result.rnd) == parseInt(latestRoundID)) {
      // is withiin current round so can be added to highest keyholder section
      //updateHighestKeyholders(logEvent.result.to, _keys);
      //getDayPositions();
    }

    playersRow += '<td>';
    playersRow += '<a href="https://tronscan.org/#/address/' + window.tronWeb.address.fromHex(logEvent.result.to) + '" target="_new">'; 
    //playersRow += '<span class="hide-for-small-only hide-for-medium-only">'
    playersRow += formatAddress(logEvent.result.to);
    //playersRow += '</span>';
    //playersRow += '<span class="hide-for-large">'
    //playersRow += window.tronWeb.address.fromhex(logEvent.result.to).substring(0,15) + "...";
    //playersRow += '</span>';
    playersRow += '</a>';
    playersRow += '</td>';
    playersRow += '<td>' + roundNumber(_keys,2) + '</td>';

    let _logDate = new Date(logResults[c].result.timestamp*1000).toISOString()
    playersRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td>';
    playersRow += '</tr>';
    
    $('#previousPlayersTable tbody').prepend(playersRow); // TO TESTS

    let previousPlayersTable = document.getElementById('previousPlayersTable');
    let currentRows = previousPlayersTable.getElementsByTagName("tr").length;
    if(currentRows > 200) {
      previousPlayersTable.deleteRow(currentRows-1);
    }

    $("time.timeago").timeago();




    $.toast({
        heading: 'New Keys Bought',
        text: formatAddress(logEvent.result.to).substring(0,10) + "..." + ' has just purchased ' + _keys + ' keys',
        icon: 'info',
        allowToastClose: true,
        position: 'bottom-right',
        hideAfter: TOAST_HIDE_DELAY,
        showHideTransition: TOAST_HIDE_TRANSITION
    });




  }

  if(logEvent.name =='JackpotWon'){
    $.toast({
        heading: 'Jackpot Won!',
        text: window.tronWeb.fromSun(logEvent.result.amount).substring(0,8) + ' TRX has just been won by ' + formatAddress(logEvent.result.by).substring(0,10) + "...",
        icon: 'error',
        allowToastClose: true,
        position: 'bottom-right',
        hideAfter: TOAST_HIDE_DELAY,
        showHideTransition: TOAST_HIDE_TRANSITION
    });
  }

  if(logEvent.name =='AirdropWon'){
    $.toast({
        heading: 'Safety Deposit Prize Won!',
        text: window.tronWeb.fromSun(logEvent.result.amount).substring(0,8) + ' TRX has just been won by ' + formatAddress(logEvent.result.by).substring(0,10) + "...",
        allowToastClose: true,
        position: 'bottom-right',
        icon: 'error',
        hideAfter: TOAST_HIDE_DELAY,
        showHideTransition: TOAST_HIDE_TRANSITION
    });
  }

  if(logEvent.name =='TrxDistributed'){
    $.toast({
        heading: 'TRX Distributed!',
        text: window.tronWeb.fromSun(logEvent.result.amount).substring(0,8) + ' TRX has just been distributed to all players in this round!',
        icon: 'info',
        allowToastClose: true,
        position: 'bottom-right',
        hideAfter: TOAST_HIDE_DELAY,
        showHideTransition: TOAST_HIDE_TRANSITION
    });
  }

  if(logEvent.name =='ReturnsWithdrawn'){
    if(!isMobile){
      $.toast({
          heading: 'TRX Received!',
          text: window.tronWeb.fromSun(logEvent.result.amount).substring(0,8) + ' TRX has just been received by ' + formatAddress(logEvent.result.by).substring(0,10) + "...",
          icon: 'info',
          allowToastClose: true,
          position: 'bottom-right',
          hideAfter: TOAST_HIDE_DELAY,
          showHideTransition: TOAST_HIDE_TRANSITION
      });
    }
  }

  if(logEvent.name =='MegaFundWon'){
    $.toast({
        heading: 'Instant Win Won!',
        text: window.tronWeb.fromSun(logEvent.result.amount).substring(0,8) + ' TRX has just been won by ' + formatAddress(logEvent.result.by).substring(0,10) + "...",
        allowToastClose: true,
        position: 'bottom-right',
        icon: 'error',
        hideAfter: TOAST_HIDE_DELAY,
        showHideTransition: TOAST_HIDE_TRANSITION
    });
  }

  if(logEvent.name =='RoundStarted'){
    console.log("ROUND STARTED:");
    console.log(results);
    // latest = results.lenght -1;

    //console.log("TIMESTAMP:" + results[results.length-1].returnValues.timestamp);

    latestRoundID = new logEvent.result.ID.toNumber();
    resetHighestKeyholders();
    getGameRound();
    
    $.toast({
        heading: 'New Round Started',
        text: "A new round has just started - get in quick for more earnings!",
        icon: 'error',
        allowToastClose: true,
        position: 'bottom-right',
        hideAfter: TOAST_HIDE_DELAY,
        showHideTransition: TOAST_HIDE_TRANSITION
    });

    requiresRestart = false;
  }


}
function processInitEvents(isInit){
  //updateInnerHTML('debugCode', "08");
  if(initEvents.length ==0)
    return;

  if(!isInit)
    console.log(initEvents);
  

  let initEventsSorted = initEvents.sort(function(obj1, obj2) {
    return parseInt(obj2.result.timestamp) - parseInt(obj1.result.timestamp);
  });

  for(let c=0; c< initEventsSorted.length; c++) {
    try{
    addEvent(initEventsSorted[c], isInit);
    }catch(e){}
  }
  if(isInit)
    getDayPositions();

  //startEventListeners();
  $("time.timeago").timeago();
  //updateInnerHTML('debugCode', "08b");

}
let _maxTimestamp = lastTimeStamp;
function updateEvents() {

  //console.log("Updating events...");
  initEvents = [];

  updateKeysIssued();
  getGameRound(getInvestorInfo); // temp fix
  

}


var currentAirdropPrize = new BigNumber(0);
var currentMegaPrize = new BigNumber(0); 
var eventsProcessed = [];
var startTimestamp = 0;
async function updatePrizes() {
  return;
  await TronHeistWinners.getPrizes().call().then(function(result){
      
      currentMegaPrize = new BigNumber(result.megaPrize.toString());
      currentAirdropPrize = new BigNumber(result.airdropPrize.toString());
      updateInnerHTML('megaJackpotTotal', tronWeb.fromSun(currentMegaPrize.toNumber()).substring(0,8) + " TRX");
      updateInnerHTML('megaJackpotTotal2', tronWeb.fromSun(currentMegaPrize.toNumber()).substring(0,8) + " TRX");
      updateInnerHTML('roundAirdropTotal', tronWeb.fromSun(currentAirdropPrize.toNumber()).substring(0,8) + " TRX");
      updateInnerHTML('roundAirdropTotal2', tronWeb.fromSun(currentAirdropPrize.toNumber()).substring(0,8) + " TRX");

      //console.log("prizes:", tronWeb.fromSun(currentMegaPrize.toNumber()), tronWeb.fromSun(currentAirdropPrize.toNumber()));
  });  
}

startTimestamp = new Date().getTime();

async function checkHeistEvents() {
  //updateInnerHTML('debugCode', "09");
    //startTimestamp = new Date().getTime();
    console.log("Checking Heist Events", startTimestamp);
   

    //updatePrizes();

    initEvents = [];
    await queryEventServer("", 1, 1, startTimestamp);

    startTimestamp = new Date().getTime();

    processInitEvents(false);

    setTimeout(function(){
        checkHeistEvents();
    },15000);
    return;


  let _maxPages = 5;
  _fingerprint = "";
  //updateInnerHTML('debugCode', "04");

  for(let page=1; page < (_maxPages+1); page++) {


    page = await queryEventServer("", page, _maxPages);

    
    if(page == _maxPages){
      
      // start event listenders
      //startEventListeners();
      processInitEvents(false);
      setTimeout(function(){
          checkHeistEvents();
      },15000);
    }

  }

return;

  //updateInnerHTML('debugCode', "09b");
    await tronWeb.getEventResult(
            contractAddress, {
            sinceTimestamp: startTimestamp,
            //eventName: "KeysIssued",
            size: 200, 
            page: 1
            }).then(function(res){
                if(res){
                    let _highestTimeStamp = 0;

                    //console.log("RES:", res);
                    for(let c=0; c<res.length;c++){
                        if(eventsProcessed.includes( res[c].transaction + ":" + res[c].name)){
                            // dup
                        } else {
                            eventsProcessed.push(res[c].transaction  + ":" + res[c].name);

                            if(res[c].timestamp > lastTimeStamp) {
                              if(parseInt(res[c].timestamp) >= parseInt(_highestTimeStamp)) {
                                _highestTimeStamp = parseInt(res[c].timestamp);
                              }
                              //console.log(res);
                              //console.log("NEW EVENT:", res[c]);
                              addEvent(res[c]);
                            }
                        }
                    }

                    lastTimeStamp = _highestTimeStamp;

                }
            }).catch(function(e){
              console.log("Unable to access event server");
            });

  //updateInnerHTML('debugCode', "09c");
    await tronWeb.getEventResult(
            winnersAddress, {
            sinceTimestamp: startTimestamp,
            //eventName: "KeysIssued",
            size: 200, 
            page: 1
            }).then(function(res){
                if(res){
                    let _highestTimeStamp = 0;

                    //console.log("RES:", res);
                    for(let c=0; c<res.length;c++){
                        if(eventsProcessed.includes( res[c].transaction + ":" + res[c].name)){
                            // dup
                        } else {
                            eventsProcessed.push(res[c].transaction  + ":" + res[c].name);

                            if(res[c].timestamp > lastWinnersTimeStamp) {
                              if(parseInt(res[c].timestamp) >= parseInt(_highestTimeStamp)) {
                                _highestTimeStamp = parseInt(res[c].timestamp);
                              }
                              //console.log(res);
                              //console.log("NEW EVENT:", res[c]);
                              addEvent(res[c]);
                            }
                        }
                    }

                    lastWinnersTimeStamp = _highestTimeStamp;

                }
            }).catch(function(e){
              console.log("Unable to access event server");
            });

    //lastWinnersTimeStamp
  //updateInnerHTML('debugCode', "09d");

    setTimeout(function(){
        checkHeistEvents();
    },15000);

}



function updateKeysIssued() {
  //console.log("lastTimeStamp:", lastTimeStamp);
  let foundResults = false;
  window.tronWeb.getEventResult(
          contractAddress, {
          sinceTimestamp: lastTimeStamp, //currentRound.startTime.toNumber() * 1000,
          eventName: "KeysIssued",
          size: 50, 
          onlyConfirmed: true}
          ).then(function(results){

              for(let c=0; c < results.length; c++) {
                if(results[c].timestamp > lastTimeStamp){
                  initEvents.push(results[c]);
                  foundResults = true;
                  if(results[c].timestamp > _maxTimestamp)
                    _maxTimestamp = results[c].timestamp;

                } else {
                  console.log("TIMESTAMP:", results[c].timestamp, lastTimeStamp);
                  //console.log("OLD:", results[c])
                  //1553085465000 
                  //1553099634001
                }
              }
              if(foundResults)
                processInitEvents(false);
              else {
                lastTimeStamp = new Date().getTime();
                console.log("RESET lastTimeStamp:", lastTimeStamp);
              }
          });
}



function addEvent(event, isInit) {
  //console.log("EVENT:", event.timestamp);
  if(isInit){
    if(parseInt(event.timestamp) >= parseInt(lastTimeStamp)) {
      lastTimeStamp = parseInt(event.timestamp);
    }
  }


  if(event.result.to){
    if(event.result.to.substring(0,2) == "0x") {
      event.result.to == "41" + event.result.to.substring(2);
    }    
  }


  

  let eventRow = '<tr class="smallTxt">';
  


  let _action = "";
  let _logDate = new Date(parseInt(event.result.timestamp)*1000).toISOString();
  let currentRows;
  if(event.name == "KeysIssued") {





    //updateInnerHTML('debugCode', "10a:" + formatAddress(event.result.to));
    _action += formatAddress(event.result.to);
               

    
    let _keys = new BigNumber(event.result.keys).div(DIVISOR).toString();
    //updateInnerHTML('debugCode', "10c");
    _action += " Bought " + _keys + " Keys";
    if(!isInit){
      $.toast({
          heading: 'New Keys Bought!',
          text: formatAddress(event.result.to).substring(0,10) + "..." + ' has just purchased ' + _keys + ' keys',
          icon: 'info',
          allowToastClose: true,
          position: 'bottom-right',
          hideAfter: TOAST_HIDE_DELAY,
          showHideTransition: TOAST_HIDE_TRANSITION
      });
      //getDayPositions();
    }
    

    let playersRow = '<tr class="smallTxt">';
  

    if(parseInt(event.result.rnd) == parseInt(latestRoundID)) {
      //updateHighestKeyholders(event.result.to, _keys);
      if(!isInit)
        getDayPositions();
    }
    

    playersRow += '<td>';
    playersRow += '<a href="https://tronscan.org/#/address/' + formatAddress(event.result.to) + '" target="_new">'; 

    playersRow += formatAddress(event.result.to).substring(0,10);
    

    playersRow += '...</a>';
    playersRow += '</td>';
    playersRow += '<td>' + roundNumber(_keys,2) + '</td>';

    
    if(event.result.instantWinResult == event.result.instantWinGuess) {
      playersRow += '<td>' + event.result.instantWinGuess + '</td><td class="win">' + event.result.instantWinResult + '</td>';
    } else {
      playersRow += '<td>' + event.result.instantWinGuess + '</td><td >' + event.result.instantWinResult + '</td>';
    }

    if(event.result.safetyDepositResult == 0){
      playersRow += '<td>--</td><td>--</td>';  
    } else {
      if(event.result.safetyDepositResult == event.result.safetyDepositGuess) {
        playersRow += '<td>' + event.result.safetyDepositGuess + '</td><td class="win">' + event.result.safetyDepositResult + '</td>';    
      } else {
        playersRow += '<td>' + event.result.safetyDepositGuess + '</td><td >' + event.result.safetyDepositResult + '</td>';    
      }
    }


    if(parseInt(event.result.rnd) == parseInt(latestRoundID) ) {
      // is withiin current round so can be added to highest keyholder section
      updateHighestKeyholders(event.result.to, _keys);
    }
    

    if(event.result.instantWinResult == event.result.instantWinGuess) {
      if(!isInit) {
        // show toast
        $.toast({
            heading: 'Instant Win Prize Won!',
            text: formatAddress(event.result.to).substring(0,10) + "..." + ' has just won ' + window.tronWeb.fromSun(event.result.instantWinAmount).substring(0.8) + ' TRX!',
            icon: 'error',
            allowToastClose: true,
            position: 'bottom-right',
            hideAfter: TOAST_HIDE_DELAY,
            showHideTransition: TOAST_HIDE_TRANSITION
        });
      }
      
      

      let _winRow = '<tr class="smallTxt"><td>';
      _winRow += '<a href="https://tronscan.org/#/address/' + formatAddress(event.result.to) + '" target="_new">'; 
      _winRow += formatAddress(event.result.to).substring(0,10);
      _winRow += '...</a> won ';
      _winRow += window.tronWeb.fromSun(event.result.instantWinAmount).substring(0.8) + ' TRX';
      _winRow += ' Instant Win Prize!</td>'
      _winRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td>';
      _winRow += '</tr>';
      if(!isInit)
        $('#winsTable tbody').prepend(_winRow);
      else
        $('#winsTable tbody').append(_winRow);
      let winTable = document.getElementById('winsTable');
      currentRows = winsTable.getElementsByTagName("tr").length;
      if(currentRows > 200) {
        winsTable.deleteRow(currentRows-1);
      }

    } 
    
   


    if(event.result.safetyDepositResult == event.result.safetyDepositGuess) {

      if(!isInit) {
        // show toast
        $.toast({
            heading: 'Safety Deposit Prize Won!',
            text: formatAddress(event.result.to).substring(0,10) + "..." + ' has just won ' + window.tronWeb.fromSun(event.result.safetyDepositAmount).substring(0.8) + ' TRX!',
            icon: 'error',
            allowToastClose: true,
            position: 'bottom-right',
            hideAfter: TOAST_HIDE_DELAY,
            showHideTransition: TOAST_HIDE_TRANSITION
        });
      }

      let _winRow = '<tr class="smallTxt"><td>';
      _winRow += '<a href="https://tronscan.org/#/address/' + formatAddress(event.result.to) + '" target="_new">'; 
      _winRow += formatAddress(event.result.to).substring(0,10);
      _winRow += '...</a> won ';
      _winRow += window.tronWeb.fromSun(event.result.safetyDepositAmount).substring(0.8) + ' TRX';
      _winRow += ' Safety Deposit Prize!</td>'
      _winRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td>';
      _winRow += '</tr>';




      if(!isInit)
        $('#winsTable tbody').prepend(_winRow);
      else
        $('#winsTable tbody').append(_winRow);

      let winTable = document.getElementById('winsTable');

      currentRows = winsTable.getElementsByTagName("tr").length;
      if(currentRows > 200) {
        winsTable.deleteRow(currentRows-1);
      }

    } 


    
    

    
    

    playersRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td>';
    playersRow += '</tr>';
    
    if(!isInit)
      $('#previousPlayersTable tbody').prepend(playersRow);
    else
      $('#previousPlayersTable tbody').append(playersRow);

    

    let previousPlayersTable = document.getElementById('previousPlayersTable');
    let winTable = document.getElementById('winsTable');

    currentRows = previousPlayersTable.getElementsByTagName("tr").length;
    
    

    if(currentRows > 200) {
      previousPlayersTable.deleteRow(currentRows-1);
    }

    

    if(!isInit){
      $("time.timeago").timeago();
      getGameRound(getInvestorInfo);
    }


//$("#previousPlayersTable").tableHeadFixer();

    
  }

  if(event.name == "JackpotWon") {
    console.log("JACKPOT WON!!!");

    if(formatAddress(event.result.by) == formatAddress(userWalletAddress)){
      _action += "You have WON the Round [" + event.result.rnd + "] Jackpot of " + window.tronWeb.fromSun(event.result.amount).substring(0,8) + " TRX";
    } else 
      _action += window.tronWeb.fromSun(event.result.amount) + " TRX Round [" + event.result.rnd + "] Jackpot Prize Won by " + formatAddress(event.result.by).substring(0,10) + "...";


    console.log(_action);

    if(!isInit){
      $.toast({
          heading: 'Jackpot Won!',
          text: window.tronWeb.fromSun(event.result.amount).substring(0,8) + ' TRX has just been won by ' + formatAddress(event.result.by).substring(0,10) + "...",
          icon: 'error',
          allowToastClose: true,
          position: 'bottom-right',
          hideAfter: TOAST_HIDE_DELAY,
          showHideTransition: TOAST_HIDE_TRANSITION
      });
    }

      let _winRow = '<tr class="smallTxt"><td>';
      _winRow += '<a href="https://tronscan.org/#/address/' + formatAddress(event.result.by) + '" target="_new">'; 
      _winRow += formatAddress(event.result.by).substring(0,20);
      _winRow += '...</a> won ';
      _winRow += window.tronWeb.fromSun(event.result.amount).substring(0.8) + ' TRX';
      _winRow += ' Round [' + event.result.rnd + '] Jackpot!</td>'
      _winRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td>';
      _winRow += '</tr>';
      if(!isInit)
        $('#winsTable tbody').prepend(_winRow);
      else
        $('#winsTable tbody').append(_winRow);
      let winTable = document.getElementById('winsTable');
      currentRows = winTable.getElementsByTagName("tr").length;
      if(currentRows > 200) {
        winsTable.deleteRow(currentRows-1);
      }


  }

  if(event.name == "AirdropWon") {
    if(formatAddress(event.result.by) == formatAddress(userWalletAddress)){
      _action += "You have WON! "
    }
    _action = window.tronWeb.fromSun(event.result.amount) + " TRX Safety Deposit Won!";
    if(!isInit){
      $.toast({
          heading: 'Safety Deposit Prize Won!',
          text: window.tronWeb.fromSun(event.result.amount).substring(0,8) + ' TRX has just been won by ' + formatAddress(event.result.by).substring(0,10) + "...",
          allowToastClose: true,
          position: 'bottom-right',
          icon: 'error',
          hideAfter: TOAST_HIDE_DELAY,
          showHideTransition: TOAST_HIDE_TRANSITION
      });
    }

  }


  if(event.name == "DailyPrize") {

    _action += "Daily Prize Bonus of: " + window.tronWeb.fromSun(event.result.amt).substring(0,8) + " TRX Awared to: " + formatAddress(event.result.to).substring(0,10) + "...";


    let _winRow = '<tr class="smallTxt"><td>';
    _winRow += '<a href="https://tronscan.org/#/address/' + formatAddress(event.result.to) + '" target="_new">'; 
    _winRow += formatAddress(event.result.to);
    _winRow += '...</a>  ';
    _winRow += window.tronWeb.fromSun(event.result.amt).substring(0.8) + ' TRX';
    _winRow += ' Daily Prize!</td>'
    _winRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td>';
    _winRow += '</tr>';
    if(!isInit)
      $('#winsTable tbody').prepend(_winRow);
    else
      $('#winsTable tbody').append(_winRow);
    let winTable = document.getElementById('winsTable');
    currentRows = winsTable.getElementsByTagName("tr").length;
    if(currentRows > 200) {
      winsTable.deleteRow(currentRows-1);
    }


  }

  if(event.name == "MegaFundWon") {
    _action = window.tronWeb.fromSun(event.result.amount) + " TRX Instant Win Won!";
    if(!isInit){
      $.toast({
          heading: 'Instant Win Won!',
          text: window.tronWeb.fromSun(event.result.amount).substring(0,8) + ' TRX has just been won by ' + formatAddress(event.result.by).substring(0,10) + "...",
          allowToastClose: true,
          position: 'bottom-right',
          icon: 'error',
          hideAfter: TOAST_HIDE_DELAY,
          showHideTransition: TOAST_HIDE_TRANSITION
      });
    }
  }
  if(event.name == "TrxDistributed") {
    _action = window.tronWeb.fromSun(event.result.amount) + " TRX Distributed to all players!";
    if(!isInit){
      $.toast({
          heading: 'TRX Distributed!',
          text: window.tronWeb.fromSun(event.result.amount).substring(0,8) + ' TRX has just been distributed to all players in this round!',
          icon: 'info',
          allowToastClose: true,
          position: 'bottom-right',
          hideAfter: TOAST_HIDE_DELAY,
          showHideTransition: TOAST_HIDE_TRANSITION
      });
    }
  }
  if(event.name == "RoundStarted") {
    _action = "Round [" + event.result.round + "] Started";
    if(!isInit)
      updateNewRound();
  }
  if(event.name == "ReturnsWithdrawn") {
    _action = window.tronWeb.fromSun(event.result.amount) + " TRX Withdrawn by player";
  }

  // return if we haven't a handler for now
  if(_action == "")
    return;

  eventRow += '<td>' + _action + '</td>';


  
  eventRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td>';
  eventRow += '</tr>';


  if(isInit)
    $('#eventsTable tbody').append(eventRow);
  else
    $('#eventsTable tbody').prepend(eventRow);

  let eventsTable = document.getElementById('eventsTable');
  currentRows = eventsTable.getElementsByTagName("tr").length;
  if(currentRows > 200) {
    eventsTable.deleteRow(currentRows-1);
  }

  if(!isInit)
    $("time.timeago").timeago();




}

var highestKeyholders = [
  { address: NULL_ADDR, keys: 0 }
];


// TODO
function beatPosition(positionToBeat) {
  //console.log(positionToBeat);
  //getInvestorInfo(processBeatPosition);
//}
//function processBeatPosition() {

  //console.log("LEADERKEYS:", document.getElementById('leadersKeys' + positionToBeat).innerHTML);
  let _keys = parseInt(document.getElementById('leadersKeys' + positionToBeat).innerHTML)+1;
  //_keys = _keys - totalKeys.toNumber();



/*
  let sorted = highestKeyholders.sort(function(obj1, obj2) {
    return parseFloat(obj2.keys) - parseFloat(obj1.keys);
  });

  let _keys = 0;
  if(sorted[positionToBeat])
    _keys = parseInt(sorted[positionToBeat].keys)+1;
  else 
    _keys = 1;
*/
  $.toast({
      heading: 'Beat Position Buy',
      text: 'Aiming to Buy: ' + _keys + ' Keys',
      icon: 'info',
      allowToastClose: true,
      position: 'bottom-right',
      hideAfter: TOAST_HIDE_DELAY,
      showHideTransition: TOAST_HIDE_TRANSITION
  });

  document.getElementById('investmentAmount').value = _keys;

  playGame();

}
function beatPositionByKeys(_keys){
  $.toast({
      heading: 'Beat Position Buy',
      text: 'Aiming to Buy: ' + _keys + ' Keys',
      icon: 'info',
      allowToastClose: true,
      position: 'bottom-right',
      hideAfter: TOAST_HIDE_DELAY,
      showHideTransition: TOAST_HIDE_TRANSITION
  });

  document.getElementById('investmentAmount').value = _keys;

  playGame();
}

var totalKeysSold = 0;
function updateHighestKeyholders(_addr, _keys) {
  totalKeysSold += parseFloat(_keys);

  if(_addr.substring(0,2) == "0x") {
    _addr = "41" + _addr.substring(2);
  }

  let haveUpdated = false;
  for(let c = 0; c < highestKeyholders.length; c++) {
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

function resetHighestKeyHolders() {
    updateInnerHTML('leaders0', 'Available!');
    updateInnerHTML('leadersKeys0', '1');
    updateInnerHTML('trxInvested0', "-")
    updateInnerHTML('trxEarn0', "-");

    updateInnerHTML('leaders1', 'Available!');
    updateInnerHTML('leadersKeys1', '1');
    updateInnerHTML('trxInvested1', "-")
    updateInnerHTML('trxEarn1', "-");

    updateInnerHTML('leaders2', 'Available!');
    updateInnerHTML('leadersKeys2', '1');
    updateInnerHTML('trxInvested2', "-")
    updateInnerHTML('trxEarn2', "-");

    updateInnerHTML('leaders3', 'Available!');
    updateInnerHTML('leadersKeys3', '1');
    updateInnerHTML('trxInvested3', "-")
    updateInnerHTML('trxEarn3', "-");

    return;
}
function displayHighestKeyholders() {
  //updateInnerHTML('debugCode', "03")
  
  if(currentDayHolders.length==0) {
    resetHighestKeyHolders();
    return;
  }
    

  var sorted = currentDayHolders.sort(function(obj1, obj2){
    return parseFloat(obj2.keys.toNumber()) - parseFloat(obj1.keys.toNumber());
  });

//console.log(currentDayHolders);
//console.log("SORTED:", sorted);

/*
  var sorted = highestKeyholders.sort(function(obj1, obj2) {
    return parseFloat(obj2.keys) - parseFloat(obj1.keys);
  });
  */

  //for(var c=0; c< 10; c++) {
  //  console.log("POS:" + c + ":" + sorted[c].address + ":" + sorted[c].keys);
  //}

  // total top 5 keys = 
  let totalKeys = new BigNumber(0);
  for(let c=0; c< sorted.length; c++) {
    totalKeys = totalKeys.plus(sorted[c].keys);
  }


  try {
    updateInnerHTML('leaders0', formatAddress(sorted[0].address).substring(0,15) + "...");
    updateInnerHTML('leadersKeys0', roundNumber(sorted[0].keys,2));
    updateInnerHTML('trxInvested0', roundNumber(sorted[0].keys.times(keysPrice),2) + " TRX");
    updateInnerHTML('trxEarn0', window.tronWeb.fromSun(dailyPrize.div(100).times(
                                    sorted[0].keys.div(totalKeys).times(100).toString())
                                    ).substring(0,8) + " TRX"); // this players share of dailyPrize
  } catch(e){
    updateInnerHTML('leaders0', 'Available!');
    updateInnerHTML('leadersKeys0', '1');
    updateInnerHTML('trxInvested0', "-")
    updateInnerHTML('trxEarn0', "-");
  }

  try {
    updateInnerHTML('leaders1', formatAddress(sorted[1].address).substring(0,15) + "...");
    updateInnerHTML('leadersKeys1', roundNumber(sorted[1].keys,2));
    updateInnerHTML('trxInvested1', roundNumber(sorted[1].keys.times(keysPrice),2) + " TRX");
    updateInnerHTML('trxEarn1', window.tronWeb.fromSun(dailyPrize.div(100).times(
                                    sorted[1].keys.div(totalKeys).times(100).toString())
                                    ).substring(0,8) + " TRX"); // this players share of dailyPrize
  } catch(e){
    updateInnerHTML('leaders1', 'Available!');
    updateInnerHTML('leadersKeys1', '1');
    updateInnerHTML('trxInvested1', "-")
    updateInnerHTML('trxEarn1', "-");
  }

  try {
    updateInnerHTML('leaders2', formatAddress(sorted[2].address).substring(0,15) + "...");
    updateInnerHTML('leadersKeys2', roundNumber(sorted[2].keys,2));
    updateInnerHTML('trxInvested2', roundNumber(sorted[2].keys.times(keysPrice),2) + " TRX");
    updateInnerHTML('trxEarn2', window.tronWeb.fromSun(dailyPrize.div(100).times(
                                    sorted[2].keys.div(totalKeys).times(100).toString())
                                    ).substring(0,8) + " TRX"); // this players share of dailyPrize
  } catch(e){
    updateInnerHTML('leaders2', 'Available!');
    updateInnerHTML('leadersKeys2', '1');
    updateInnerHTML('trxInvested2', "-")
    updateInnerHTML('trxEarn2', "-");
  }

  try {
    updateInnerHTML('leaders3', formatAddress(sorted[3].address).substring(0,15) + "...");
    updateInnerHTML('leadersKeys3', roundNumber(sorted[3].keys,2));
    updateInnerHTML('trxInvested3', roundNumber(sorted[3].keys.times(keysPrice),2) + " TRX");
    updateInnerHTML('trxEarn3', window.tronWeb.fromSun(dailyPrize.div(100).times(
                                    sorted[3].keys.div(totalKeys).times(100).toString())
                                    ).substring(0,8) + " TRX"); // this players share of dailyPrize
  } catch(e){
    updateInnerHTML('leaders3', 'Available!');
    updateInnerHTML('leadersKeys3', '1');
    updateInnerHTML('trxInvested3', "-")
    updateInnerHTML('trxEarn3', "-");
  }


  try{
  $("#leaderboardTbody").empty();
  } catch(e){

  }

  //updateInnerHTML('debugCode', "03b");
  console.log("highestKeyholders:", highestKeyholders);

  sorted = highestKeyholders.sort(function(obj1, obj2) {
    return parseFloat(obj2.keys) - parseFloat(obj1.keys);
  });
  for(let c=0; c< highestKeyholders.length; c++) {

    //console.log("SORTED:", sorted[c]);
    let _keys = sorted[c].keys;
    if(_keys > 0){
      try{
        let playersRow = '<tr class="smallTxt2">';

        playersRow += '<td style="width: 300px;">';
        playersRow += '<a href="https://tronscan.org/#/address/' + formatAddress(sorted[c].address) + '" target="_new">'; 
        if(isMobile)
          playersRow += formatAddress(sorted[c].address).substring(0,16);
        else
          playersRow += formatAddress(sorted[c].address);
        playersRow += '</a>';

        playersRow += '</td>';
        playersRow += '<td><b>' + roundNumber(_keys,2) + '</b></td>';

        let _keysTobeat = parseFloat(_keys)+1;
        playersRow += '<td><button onclick="beatPositionByKeys(' + _keysTobeat + ');" type="button" class="small2 button rounded2 bordered error" >BEAT THIS POSITION</button></td>'
        playersRow += '</tr>';
        
        $('#leaderboardTable tbody').append(playersRow); // TO TESTS
      }catch(e){

      }
    }
  }
  //updateInnerHTML('debugCode', "03c");

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




function deactivateGame() {
  console.log("Deactiving Game...");

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
  

}
function keysPlus(num) {


  if(num == 0) {
    document.getElementById('investmentAmount').value = '1';
  } else {
    document.getElementById('investmentAmount').value = parseInt(document.getElementById('investmentAmount').value) + parseInt(num);
  }
  updateKeysCost();
}



function updateKeysCost(){
  var num = parseInt(document.getElementById('investmentAmount').value);
  var keysCost = keysPrice.times(num);

  if(num >=10 ) {
    // activate safetyDepositBoxcode
    $("#safetyDepositCode").prop('disabled', false);
    $("#safetyDepositCode").removeClass("codeGrey").removeClass("codeGreen").addClass("codeGreen");
  } else {
    $("#safetyDepositCode").prop('disabled', true);
    $("#safetyDepositCode").removeClass("codeGrey").removeClass("codeGreen").addClass("codeGrey");
  }
  
  updateInnerHTML('investmentAmountCost', "= " + keysPrice.times(num) + " TRX");

  var bonusKeys = getBonusKeys(num);
  if(bonusKeys > 0) {
    updateInnerHTML('bonusKeys', '+ ' + roundNumber(bonusKeys,2) + ' Bonus Keys!');
  } else {
    updateInnerHTML('bonusKeys', '');
  }


}

function getBonusKeys(num) {
  var keysCost = keysPrice.times(num); // cost in TRX
  var bonusKeys = 0;
  if(keysCost.gte(100)) {
    // bonus keys
    var bonusKeys = 0;
    if(keysCost.gte(100000)) {
      bonusKeys = num;
      console.log("100% bonus key level");
    } else {
      if(keysCost.gte(10000)) {
        bonusKeys = num / 2;
        console.log("50% bonus key level");
      } else {
        if(keysCost.gte(1000)) {
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
  }
  return bonusKeys;
}




//var currentProfitDay = 0;
var DIVISOR = new BigNumber(1000000000000000000);
var requiresRestart = false;
var hasShownRestartMsg = false;


var currentDayHolders = [];

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
  softDeadline: new BigNumber(0),
  finalized: false,
  startTime: 0,
  dailyTotal: new BigNumber(0),
  dayStartTs: new BigNumber(0)
};
var megaJackpot = new BigNumber(0);

function updateChanceRates() {
  /*
  TronHeistContract.airdropChance().call().then(function(results){
    airdropChance = parseInt(results.toNumber());
    //updateInnerHTML('airDropChangeRate', airdropChance);
  });
  TronHeistContract.megaJackpotChance().call().then(function(results){
    megaJackpotChance = parseInt(results.toNumber());
    updateInnerHTML('megaJackpotChanceRate', megaJackpotChance);
  });
  */
}
var eventUpdates = 0;
var eventUpdates2 = 0;
var clockFlashing = false;
function updateClocks() {

  // if round hasn't yet started show the game countdown timer here...
  if(currentRound.startTime > Date.now) {

  }

  let triggerUpdate = false;
  let triggerUpdate2 = false;
  let triggerUpdateRate = 5;
  let triggerUpdateRate2 = 15;

  if(currentRound.isDark)
    triggerUpdateRate = 2;

  eventUpdates++;
  if(eventUpdates==triggerUpdateRate){
    //updateEvents();
    //initGameRoundEvents();
    triggerUpdate = true;
    eventUpdates=0;
  }
  eventUpdates2++;
  if(eventUpdates2==triggerUpdateRate2){
    triggerUpdate2 = true;
    eventUpdates2=0;
  } 

  if(triggerUpdate2){
    getDayPositions();
  }

//console.log("softDeadline:", currentRound.softDeadline.toNumber());
  if(currentRound.isDark) {
    if(triggerUpdate) {
      getGameRound(getInvestorInfo);
    }

    updateInnerHTML('roundCountdown', "DARK PHASE!");
    updateInnerHTML('clock2', "Dark Phase");

  } else {



    // update second clock too
    if(currentRound.softDeadline.toNumber() > 0) {

      var dateNow = new Date().getTime();
      var difference = (currentRound.softDeadline.toNumber()*1000) - dateNow;
      //console.log(difference);

      if(difference < 1) {
        // round ended!!!
        // need to confirm by a call to contract....

        //requiresRestart = true; // set in getgameround

        
        if(triggerUpdate){
          //updateEvents();
          //initGameRoundEvents();
          getGameRound(showRestartMessage);
        }
        
        
      } else {

        hasShownRestartMsg = false

        var daysDifference = Math.floor(difference/1000/60/60/24);
        difference -= daysDifference*1000*60*60*24

        var hoursDifference = Math.floor(difference/1000/60/60);
        difference -= hoursDifference*1000*60*60

        var minutesDifference = Math.floor(difference/1000/60);
        difference -= minutesDifference*1000*60

        var secondsDifference = Math.floor(difference/1000);
        
        if(parseInt(minutesDifference) < 7 && parseInt(hoursDifference) == 0 && triggerUpdate) {
          // update the winner every trigger...
          //console.log("UPDATING");
          getGameRound(getInvestorInfo);
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
        updateInnerHTML('clock2', _diffStr);
      }
    }
  }

  // update dailyClock
  let _now = new Date().getTime();
  //if(now.sub(gameDays[currentDay].dayStartTs).div(dayDuration) > 0) {
  let _endTime = currentRound.dayStartTs.times(1000).toNumber() + (60 * 60 * 24 * 1000); 
  let _diff = (_endTime - _now); 
  let _hrs = Math.floor(_diff/1000/60/60);
  _diff -= _hrs*1000*60*60;
  let _mns = Math.floor(_diff/1000/60);
  _diff -= _mns*1000*60;
  let _scs = Math.floor(_diff/1000);
  let _diffStr2 = padNumber(_hrs,2) + ":" + padNumber(_mns,2) + ":" + padNumber(_scs,2);
  updateInnerHTML('dailyClock', _diffStr2);
  //console.log("DAILY DIFF:", _diff);

  setTimeout(function(){ updateClocks() }, 1000);
}
var lastGameRound = 0;


function showRestartMessage() {


  var dateNow = new Date().getTime();
  var difference = (currentRound.softDeadline.toNumber()*1000) - dateNow;

  if(difference < 1) {
    // round has ended - show winner...
    requiresRestart = true;

    lastGameRound = currentRound.roundID;

    setTimeout(function(){
      getGameRound(confirmRoundRestart);
    }, 5000);
    
  } else {
    requiresRestart = false;
  }
/*
  if(currentRound.softDeadline > 0) {


    var dateNow = new Date().getTime();
    var difference = (currentRound.softDeadline*1000) - dateNow;
    //console.log(difference);
    if(difference < 1) {

    // check for new round is...
    TronHeistContract.latestRoundID().call().then(function(results){
      let _currentRoundID = parseInt(results.toNumber());

      latestRoundID = _currentRoundID;

      getGameRound(confirmRoundRestart);

    });
  } else {

    // round is still on going...
    requiresRestart = false;

  }
  */
  
}

function confirmRoundRestart(){
  var dateNow = new Date().getTime();
  var difference = (currentRound.softDeadline.toNumber()*1000) - dateNow;

  if( (difference < 1 && currentRound.roundID == lastGameRound) || currentRound.roundID > lastGameRound) {
    updateInnerHTML('roundCountdown', "WON!");
    if(!hasShownRestartMsg) {
      var _msg = "<h5>The current last key holder is showing as:</h5><h4>" + formatAddress(currentRound.leader) + "</h4>";
      _msg += "<h5>Vault prize</h5><h4>" + window.tronWeb.fromSun(currentRound.jackpot.toString()).substring(0,8) + " TRX!</h4>"
      _msg += "<br/><h4>What happens Next?</h4>"
      _msg += "The final key holder will be confirmed on the blockchain - and when the next round starts the funds will be transferred into their winnings!<br/><br/>";
      _msg += "The next round will be even bigger as it has already been seeded with a prize pot!  You now have a chance to be the first investor - ";
      _msg += "which means you will receive more of the distributed returns!<br/><br/>";
      _msg += "Be quick though - buy some keys now for the chance to be the first investor in the next round before someone else does!<br/><br/>"
      showError(_msg, "Vault Open!");
      hasShownRestartMsg = true;
    }
  } 
}


var log_id_processed = [];




var tx_to_check = [];

function checkForRandomTx() {
  if(tx_to_check.length > 0) {
    for(let c=0; c< tx_to_check.length; c++) {
      
    }
  }
}

function dailyKey() {
  if(!canPlay) {
    showNotConnectedMsg();
    return;
  }

  TronHeistContract.timeToFreeKey(userWalletAddress).call().then(function(results){
    let _canHaveFree = true;
    //console.log(results._timeToFreeKey.toNumber());
    let _timeRemaining = parseInt(results._timeToFreeKey.toNumber());
    //console.log("_timeRemaining", _timeRemaining);
    if(_timeRemaining < 86400){
      _canHaveFree = false;
      showError("You've already had your <strong>Free Key</strong> within the last 24 hours - please come back again tomorrow or buy more keys with TRX to increase your chance of winning and also increase your dividend share!", "Free Key Already Earned");
      return;
    } else{
      if(currentRound.isDark == true){ // TOTEST
        _canHaveFree = false;
        showError("The Game Has Gone Dark!<br/><br/>When the timer gets low the game goes into dark mode which hides the timer, and the time added for each key is randomized too.  When in this mode the last key buyer wins the Vault Jackpot and it is only fair that Free Keys are not available whilst the game is in this state... be quick though and use some TRX to buy a Key - the winner could be you!", "Game Has Gone Dark!");
        return;
      } else {
        if(currentRound.hardDeadline > new Date().getTime()){ // TOTEST
          _canHaveFree = false;
          showError("The game has passed it's hard deadline which means the price of keys doubles every hour!<br/><br/>Because of this the value of keys becomes more valuable and whilst in this state the Free Keys are no longer available!<br/>Check back soon though as a new round is likely to begin soon!", "Free Keys");
          return;
        } else {
          if(requiresRestart){
            _canHaveFree = false;
            showError("The game has ended and cannot be restarted with a Free Key - please either purchase a key with TRX to restart a new round or wait until a fresh round begins to claim your free key", "Free Key");
            return;
          }
        }
      }
    }

    showProcessing();
    let hasErr = false;
    TronHeistContract.dailyFreeKey().send().catch(function(err){

          hasErr = true;
          hideProcessing();
          console.log("error", err);
          if(err == "Confirmation declined by user"){
            $.toast({
              heading: 'Free Key Request Cancelled',
              text: 'Your request was cancelled and no Energy was used this time - please try again!',
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
            });         
          } else {
            processGenericErrors(err, showInsufficientTRX);

          }

        }).then(function(results){
          hideProcessing();
          console.log("results:", results);



          // result = tx 6dfa249ccd7793d7b4c87a08f5ed44ec7eefd7a109d95a18bdb02d28136b72b4

          if(!hasErr){
            try {
              tx_to_check.push({
                tx: results,
                tx_time: new Date().getTime(),
                keys: investmentAmount
              });
            } catch(e){

            }
            
            var _msg = ""

            _msg += '<p style="font-size: 10pt;"><i>You\'re in the game!, you now own <b>1 new Keys which will show up on your account shortly</b>!</i></p>';
            

            _msg += '<p style="font-size: 10pt;"><b>Keep an eye on the <strong>Win Tab</strong> to see if you\'ve won the Instant Win Prize!</b></p>';


            _msg += '<p style="font-size: 10pt;">Now that you own Keys to the safe you will start to earn TRX in dividends as more players buy into the game - unless of course you are the last one in which case you\'ll win the vault prize!</p>';


            _msg += '<center>'
            _msg += '<button onclick="closeComplete();" type="button" class="small2 button rounded2 bordered shadow warning investButton" >CONTINUE</button></center>'

            _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
            _msg += '<p>';
            _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
            _msg += '</p>';
            _msg += '<p style="font-size: 10pt;">';
            _msg += '<code style="font-size: 8pt;">https://tronheist.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
            _msg += '</p>';
            _msg += '<p style="font-size: 10pt;">';
            _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
            _msg += '</p>';


            _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
            showComplete(_msg, "Purchase Complete");
            getGameRound(getInvestorInfo);

          }

        });

  });  

}

function dailyCheckin() {
  if(!canPlay) {
    showNotConnectedMsg();
    return;
  }

  TronHeistContract.gameOp().send({}).then(function(results){
      var _msg = ""
      _msg += '<p style="font-size: 10pt;"><i>Daily Check-in Complete</i></p>';


      _msg += '<p style="font-size: 10pt;">Thanks for supporting Tron Heist - every daily check-in helps support the game!</p>';

      _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
      _msg += '<p>';
      _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
      _msg += '</p>';
      _msg += '<p style="font-size: 10pt;">';
      _msg += '<code style="font-size: 8pt;">https://tronheist.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
      _msg += '</p>';
      _msg += '<p style="font-size: 10pt;">';
      _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
      _msg += '</p>';


      _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
      showError(_msg, "Check-in Complete");

  });
}


// WORKING TRX
function reinvestDividends() {
  if(!canPlay){
    showNotConnectedMsg();
    return;
  }


  // confirm funds available...
  getInvestorInfo(processReinvest);
}


function processReinvest() {
  let _ref = NULL_ADDR;
  if(_referer == NULL_ADDR) {
    //buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
    _ref = NULL_ADDR;
  } else {

    
    if(window.tronWeb.isAddress(_referer)) {
      console.log("Referer:", _referer);

      //buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
      //_ref = _referer;
      _ref = _referer; // solidityEncodeAddr(_referer);
      //_ref = NULL_ADDR;
      console.log("REF TO USE:", _ref);

    } else {
      console.log("Invalid Referer");
      //buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, NULL_ADDR, playAmountSun);  
      _ref = NULL_ADDR;
    }

  }
  
  let hasErr = false;

  TronHeistContract.minInvestment().call().catch(function(err){

  }).then(function(results){
    if(hasErr) return;

    minPlayAmount = new BigNumber(results);
    let investmentAmount = document.getElementById('investmentAmount').value;
    let investmentAmountTRX = new BigNumber(keysPrice.times(investmentAmount));
    let minPlayAmountTRX = new BigNumber(window.tronWeb.fromSun(minPlayAmount.toString()));
    let _instantWinCode = document.getElementById('instantWinCode').value;
    let instantWinCode = 600;
    if(isNaN(_instantWinCode)) {

    } else {
      _instantWinCode = parseInt(_instantWinCode);
      if(_instantWinCode>0 && _instantWinCode<601) {
        instantWinCode = _instantWinCode;
      }
    }


    let _safetyDepositCode = document.getElementById('safetyDepositCode').value;
    let safetyDepositCode = 200;
    if(isNaN(_safetyDepositCode)) {

    } else {
      _safetyDepositCode = parseInt(_safetyDepositCode);
      if(_safetyDepositCode >0 && _safetyDepositCode < 201) {
        safetyDepositCode = _safetyDepositCode;
      }
    }



    if(window.tronWeb.toSun(investmentAmountTRX) > totalReturns.toNumber()){
      showError("You do not have sufficient funds in your returns yet!<br/><br/>Please buy some Keys with TRX first.", "Insufficient Returns");
      return;
    }

    if(investmentAmountTRX.isLessThan(minPlayAmountTRX)) {
      showError("The minium investment is 1 KEY<br/><br/>Please update your investment and try again.", "Invalid Number of Keys");
    } else {
      if(requiresRestart) {
        // check if someone else has already restarted the round....
        showError("You are not able to use your vault funds to start off a new round!<br/><br/>The first investment in a new round must be with TRX.<br/><br/>", "Tron Heist");

      } else {

        let hasErr = false;
        showProcessing();
        $.toast({
            heading: 'Sending Transaction',
            text: 'Check your TRON Wallet to complete the transaction',
            icon: 'info',
            allowToastClose: true,
            position: 'bottom-right',
            hideAfter: TOAST_HIDE_DELAY,
            showHideTransition: TOAST_HIDE_TRANSITION
        });
        //uint value, uint _instantWinCode, uint _safetyDepositCode
        //uint value, address ref, uint _instantWinCode, uint _safetyDepositCode
        TronHeistContract.reinvestReturns(window.tronWeb.toSun(investmentAmountTRX), _ref, instantWinCode, safetyDepositCode).send({
             // shouldPollResponse: true
            }).catch(function(err){
          hasErr = true;
          hideProcessing();
          console.log("error", err);
          if(err == "Confirmation declined by user"){
            $.toast({
              heading: 'Purchase Cancelled',
              text: 'Your purchase was cancelled and no TRX was spent this time - please try again!',
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
            });         
          } else {
            processGenericErrors(err, showInsufficientTRX);

          }

        }).then(function(results){
          console.log("reinvest:", results);
          hideProcessing();


          if(!hasErr){

            try {
              tx_to_check.push({
                tx: results,
                tx_time: new Date().getTime(),
                keys: investmentAmount
              });
            } catch(e){
                        
            }

            var _msg = ""
            

            if(getBonusKeys(investmentAmount) > 0){
              _msg += '<p style="font-size: 10pt;"><i>You\'re in the game!, you now own <b>' + investmentAmount + ' new Keys + ' + getBonusKeys(investmentAmount) + ' bonus keys which will show up on your account shortly!</b>!</i></p>';
            } else {
              _msg += '<p style="font-size: 10pt;"><i>You\'re in the game!, you now own <b>' + investmentAmount + ' new Keys which will show up on your account shortly</b>!</i></p>';
            }
/*
            if(investmentAmount >= 10){
              if(parseInt(results.airdropPrize.toString()) == 0) {
                _msg += '<p style="font-size: 10pt;"><b>Unfortunately you didn\'t successfully open a Safety Deposit box this time! - Try your luck again!</b></p>';
              } else {
                _msg += '<p style="font-size: 12pt;"><b>Congratulations! You\'ve just opened a Safety Deposit and won ' + window.tronWeb.fromSun(results.airdropPrize.toNumber()) + ' TRX!</b></p>';
              }                  
            }


            if(parseInt(results.megaJackpotPrize.toString()) == 0) {
              _msg += '<p style="font-size: 10pt;"><b>Unfortunately you didn\'t win a random Jackpot Prize this time! - Try your luck again, every purchase gets a chance of winning!</b></p>';
            } else {
              _msg += '<p style="font-size: 12pt;"><b>Congratulations! You\'ve just won the Instant Win Prize of ' + window.tronWeb.fromSun(results.megaJackpotPrize.toNumber()) + ' TRX!</b></p>';
            }
*/

            _msg += '<p style="font-size: 10pt;"><b>We\'ll alert you shortly if you\'ve won the Instant Win Prize!</b></p>';

            _msg += '<center>'
            _msg += '<button onclick="closeComplete();" type="button" class="small2 button rounded2 bordered shadow warning investButton" >CONTINUE</button></center>'

            _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
            _msg += '<p>';
            _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
            _msg += '</p>';
            _msg += '<p style="font-size: 10pt;">';
            _msg += '<code style="font-size: 8pt;">https://tronheist.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
            _msg += '</p>';
            _msg += '<p style="font-size: 10pt;">';
            _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
            _msg += '</p>';


            _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
            showComplete(_msg, "Purchase Complete");
            getGameRound(getInvestorInfo);
            //updateEvents();
            

          }
        });

      }
    }

  });




}


// WORKING ON TRX
function withdrawDividends() {

  if(!canPlay){
    showNotConnectedMsg();
    return;
  }


  getInvestorInfo(processWithdraw);

}

function processWithdraw(){

  let hasErr = false;



  TronHeistContract.unclaimedReturns().call().then(function(results){
    let _maxReturnsNow = new BigNumber(results.toString());
    if(_maxReturnsNow.lte(totalReturns)){

      showError("We are currently experiencing an issue with the withdraw function.<br/><br/>Your funds are safe and will be available shortly but to protect your TRON Energy we have temporarily disabled this function.<br/><br/>", "Withdraw Disabled");
      return;
    } else {
      showProcessing();
      $.toast({
          heading: 'Sending Transaction',
          text: 'Check your TRON Wallet to complete the transaction',
          icon: 'info',
          allowToastClose: true,
          position: 'bottom-right',
          hideAfter: TOAST_HIDE_DELAY,
          showHideTransition: TOAST_HIDE_TRANSITION
      });  
      TronHeistContract.withdrawReturns().send({
              //shouldPollResponse: true
              feeLimit: 50000000
            }).catch(function(err){
        hasErr = true;
        hideProcessing();
        console.log("error", err);
        if(err == "Confirmation declined by user"){
          $.toast({
            heading: 'Withdraw Cancelled',
            text: 'Your withdawal was cancelled and no Energy or Bandwidth was used this time - please try again!',
            icon: 'info',
            allowToastClose: true,
            position: 'bottom-right',
            hideAfter: TOAST_HIDE_DELAY,
            showHideTransition: TOAST_HIDE_TRANSITION
          });         
        } else {
          processGenericErrors(err, showInsufficientTRX);

        }
      }).then(function(results){
        console.log("RESULTS Withdrawn:", results);
        hideProcessing();
        if(!hasErr){
          var _msg = ""
          _msg += '<p style="font-size: 10pt;"><i>Earnings Withdrawn!</i></p>';


          _msg += '<p style="font-size: 10pt;">Your Winnings and Earnings are on their way to your Wallet!</p>';

          _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
          _msg += '<p>';
          _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += '<code style="font-size: 8pt;">https://tronheist.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
          _msg += '</p>';
          _msg += '<p style="font-size: 10pt;">';
          _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
          _msg += '</p>';


          _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
          showError(_msg, "Withdraw Complete");
          getGameRound(getInvestorInfo);

        }

      });
    }
  });




}




function playGame() {
  closeError();

  if(!canPlay) {
    showNotConnectedMsg();
    return;
  }

  // check game state first...
  getGameRound(processPlayGame);
}

function processPlayGame() {

  // check minium ETH amount...
  let hasErr = false;

  TronHeistContract.minInvestment().call().catch(function(err){

  }).then(function(results){
    if(hasErr) return;

    minPlayAmount = new BigNumber(results);
    let investmentAmount = document.getElementById('investmentAmount').value;
    let investmentAmountTRX = new BigNumber(keysPrice.times(investmentAmount));
    let minPlayAmountTRX = new BigNumber(window.tronWeb.fromSun(minPlayAmount.toString()));

    let _instantWinCode = document.getElementById('instantWinCode').value;
    let instantWinCode = 600;
    if(isNaN(_instantWinCode)) {

    } else {
      _instantWinCode = parseInt(_instantWinCode);
      if(_instantWinCode>0 && _instantWinCode<601) {
        instantWinCode = _instantWinCode;
      }
    }


    let _safetyDepositCode = document.getElementById('safetyDepositCode').value;
    let safetyDepositCode = 200;
    if(isNaN(_safetyDepositCode)) {

    } else {
      _safetyDepositCode = parseInt(_safetyDepositCode);
      if(_safetyDepositCode >0 && _safetyDepositCode < 201) {
        safetyDepositCode = _safetyDepositCode;
      }
    }

    let _ref = NULL_ADDR;
    if(_referer == NULL_ADDR) {
      //buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
      _ref = NULL_ADDR;
    } else {

      
      if(window.tronWeb.isAddress(_referer)) {
        console.log("Referer:", _referer);

        //buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
        //_ref = _referer;
        _ref = _referer; // solidityEncodeAddr(_referer);
        //_ref = NULL_ADDR;
        console.log("REF TO USE:", _ref);

      } else {
        console.log("Invalid Referer");
        //buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, NULL_ADDR, playAmountSun);  
        _ref = NULL_ADDR;
      }

    }



    //console.log("investmentAmount:", investmentAmount.toString());
    //console.log("investmentAmountTRX:", investmentAmountTRX.toString());
    //console.log("minPlayAmountTRX:", minPlayAmountTRX.toString());


    if(investmentAmountTRX.isLessThan(minPlayAmountTRX)){
      showError("The minium investment is 1 KEY<br/><br/>Please update your investment and try again.", "Invalid Number of Keys");
    } else {
      if(requiresRestart) {
        console.log("requiresRestart:", requiresRestart);
        console.log("currentRound.roundID", currentRound.roundID);

        // check if the round has already been restarted...
        TronHeistContract.latestRoundID().call().then(function(results){
          let _currentRoundID = parseInt(results.toNumber());
          console.log("_currentRoundID", _currentRoundID);

          if(_currentRoundID > currentRound.roundID) {
            requiresRestart = false;
            latestRoundID = _currentRoundID;
            getGameRound(processPlayGame);

          } else {
            requiresRestart = true;


            //showError("Please wait for the next (BIGGER!) round to start!", "Next Round Pending");
            //return;

            let hasErr = false;
            showProcessing();
            $.toast({
                heading: 'Sending Transaction',
                text: 'Check your TRON Wallet to complete the transaction',
                icon: 'info',
                allowToastClose: true,
                position: 'bottom-right',
                hideAfter: TOAST_HIDE_DELAY,
                showHideTransition: TOAST_HIDE_TRANSITION
            });


            TronHeistContract.finalizeAndRestart(_ref,instantWinCode,200).send({
              callValue: window.tronWeb.toSun(investmentAmountTRX)//,
              //shouldPollResponse: true
            }).catch(function(err){

              hasErr = true;
              hideProcessing();
              console.log("error", err);
              if(err == "Confirmation declined by user"){
                $.toast({
                  heading: 'Purchase Cancelled',
                  text: 'Your purchase was cancelled and no TRX was spent this time - please try again!',
                  icon: 'info',
                  allowToastClose: true,
                  position: 'bottom-right',
                  hideAfter: TOAST_HIDE_DELAY,
                  showHideTransition: TOAST_HIDE_TRANSITION
                });         
              } else {
                processGenericErrors(err, showInsufficientTRX);

              }

            }).then(function(results){
              console.log("results:", results);



              hideProcessing();
              if(!hasErr){

                try {
                  tx_to_check.push({
                    tx: results,
                    tx_time: new Date().getTime(),
                    keys: investmentAmount
                  });
                } catch(e){
                            
                }

                var _msg = ""
                requiresRestart = false;

                if(getBonusKeys(investmentAmount) > 0){
                  _msg += '<p style="font-size: 10pt;"><i>You\'re in the game!, you now own <b>' + investmentAmount + ' new Keys + ' + getBonusKeys(investmentAmount) + ' bonus keys!</b>!</i></p>';
                } else {
                  _msg += '<p style="font-size: 10pt;"><i>You\'re in the game!, you now own <b>' + investmentAmount + ' new Keys</b>!</i></p>';
                }

    /*
                if(investmentAmount >= 10){
                  if(parseInt(results.airdropPrize.toString()) == 0) {
                    _msg += '<p style="font-size: 10pt;"><b>Unfortunately you didn\'t successfully open a Safety Deposit box this time! - Try your luck again!</b></p>';
                  } else {
                    _msg += '<p style="font-size: 12pt;"><b>Congratulations! You\'ve just opened a Safety Deposit and won ' + window.tronWeb.fromSun(results.airdropPrize.toNumber()) + ' TRX!</b></p>';
                  }                  
                }


                if(parseInt(results.megaJackpotPrize.toString()) == 0) {
                  _msg += '<p style="font-size: 10pt;"><b>Unfortunately you didn\'t win a random Jackpot Prize this time! - Try your luck again, every purchase gets a chance of winning!</b></p>';
                } else {
                  _msg += '<p style="font-size: 12pt;"><b>Congratulations! You\'ve just won the Instant Win Prize of ' + window.tronWeb.fromSun(results.megaJackpotPrize.toNumber()) + ' TRX!</b></p>';
                }
    */

                _msg += '<p style="font-size: 10pt;"><b>We\'ll alert you shortly if you\'ve won the Instant Win Prize!</b></p>';



                _msg += '<p style="font-size: 10pt;">Now that you own Keys to the safe you will start to earn TRX in dividends as more players buy into the game - unless of course you are the last one in which case you\'ll win the vault prize!</p>';

                _msg += '<center><button onclick="playGame();" type="button" class="small2 button rounded2 bordered shadow success investButton" >BUY AGAIN</button>&nbsp;'
                _msg += '<button onclick="closeComplete();" type="button" class="small2 button rounded2 bordered shadow warning investButton" >CONTINUE</button></center>'

                _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
                _msg += '<p>';
                _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
                _msg += '</p>';
                _msg += '<p style="font-size: 10pt;">';
                _msg += '<code style="font-size: 8pt;">https://tronheist.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
                _msg += '</p>';
                _msg += '<p style="font-size: 10pt;">';
                _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
                _msg += '</p>';


                _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
                showComplete(_msg, "Purchase Complete");
                getGameRound(getInvestorInfo);
                //updateEvents();
                
              }

            });

          }


        });

      } else {

        let hasErr = false;

        $.toast({
            heading: 'Sending Transaction',
            text: 'Check your TRON Wallet to complete the transaction',
            icon: 'info',
            allowToastClose: true,
            position: 'bottom-right',
            hideAfter: TOAST_HIDE_DELAY,
            showHideTransition: TOAST_HIDE_TRANSITION
        });
        showProcessing();

         console.log("STARTING BUY KEYS");   

        TronHeistContract.buyKeys(_ref, instantWinCode, safetyDepositCode).send({
          callValue: window.tronWeb.toSun(investmentAmountTRX)//,
          //shouldPollResponse: true
        }).catch(function(err){

          hasErr = true;
          hideProcessing();
          console.log("error", err);
          if(err == "Confirmation declined by user"){
            $.toast({
              heading: 'Purchase Cancelled',
              text: 'Your purchase was cancelled and no TRX was spent this time - please try again!',
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
            });         
          } else {
            processGenericErrors(err, showInsufficientTRX);

          }

        }).then(function(results){
          hideProcessing();
          console.log("results:", results);



          // result = tx 6dfa249ccd7793d7b4c87a08f5ed44ec7eefd7a109d95a18bdb02d28136b72b4

          if(!hasErr){
            try {
              tx_to_check.push({
                tx: results,
                tx_time: new Date().getTime(),
                keys: investmentAmount
              });
            } catch(e){

            }
            
            var _msg = ""
            if(getBonusKeys(investmentAmount) > 0){
              _msg += '<p style="font-size: 10pt;"><i>You\'re in the game!, you now own <b>' + investmentAmount + ' new Keys + ' + getBonusKeys(investmentAmount) + ' bonus keys which will show up on your account shortly!</b>!</i></p>';
            } else {
              _msg += '<p style="font-size: 10pt;"><i>You\'re in the game!, you now own <b>' + investmentAmount + ' new Keys which will show up on your account shortly</b>!</i></p>';
            }

/*
            if(investmentAmount >= 10){
              if(parseInt(results.airdropPrize.toString()) == 0) {
                _msg += '<p style="font-size: 10pt;"><b>Unfortunately you didn\'t successfully open a Safety Deposit box this time! - Try your luck again!</b></p>';
              } else {
                _msg += '<p style="font-size: 12pt;"><b>Congratulations! You\'ve just opened a Safety Deposit and won ' + window.tronWeb.fromSun(results.airdropPrize.toNumber()) + ' TRX!</b></p>';
              }                  
            }


            if(parseInt(results.megaJackpotPrize.toString()) == 0) {
              _msg += '<p style="font-size: 10pt;"><b>Unfortunately you didn\'t win a random Jackpot Prize this time! - Try your luck again, every purchase gets a chance of winning!</b></p>';
            } else {
              _msg += '<p style="font-size: 12pt;"><b>Congratulations! You\'ve just won the Instant Win Prize of ' + window.tronWeb.fromSun(results.megaJackpotPrize.toNumber()) + ' TRX!</b></p>';
            }
*/

            _msg += '<p style="font-size: 10pt;"><b>We\'ll alert you shortly if you\'ve won the Instant Win Prize!</b></p>';


            _msg += '<p style="font-size: 10pt;">Now that you own Keys to the safe you will start to earn TRX in dividends as more players buy into the game - unless of course you are the last one in which case you\'ll win the vault prize!</p>';


            _msg += '<center><button onclick="playGame();" type="button" class="small2 button rounded2 bordered shadow success investButton" >BUY AGAIN</button>&nbsp;'
            _msg += '<button onclick="closeComplete();" type="button" class="small2 button rounded2 bordered shadow warning investButton" >CONTINUE</button></center>'

            _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
            _msg += '<p>';
            _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
            _msg += '</p>';
            _msg += '<p style="font-size: 10pt;">';
            _msg += '<code style="font-size: 8pt;">https://tronheist.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
            _msg += '</p>';
            _msg += '<p style="font-size: 10pt;">';
            _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
            _msg += '</p>';


            _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
            showComplete(_msg, "Purchase Complete");
            getGameRound(getInvestorInfo);
            //updateEvents();
          }

        });


      }
    }

  });

  return;


}









function showNotConnectedMsg() {
  $('#notConnectedModel').foundation('open');
  return;

  var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  var isAndroid = false;
  if(navigator.userAgent.toLowerCase().indexOf("android") > -1)
    isAndroid = true;

  if(iOS){
    showError("Tron Heist", "It looks like your not connected to the Mainnet or logged into your Wallet at the moment.<br/><br/>For iOS we recommend: <a href=\"https://wallet.coinbase.com/\">Coinbase Wallet</a> - please go to the dapps section and browse to our site when using.<br/><br/>Refresh this page when you are logged into your wallet.");
  } else {
    if(isAndroid){
      showError("Tron Heist", "It looks like your not connected to the Mainnet or logged into your Wallet at the moment.<br/><br/>For iOS we recommend: <a href=\"https://wallet.coinbase.com/\">Coinbase Wallet</a> - please go to the dapps section and browse to our site when using.<br/><br/>Refresh this page when you are logged into your wallet.");
    } else {
      showError('Tron Heist', 'It looks like your not connected to the Mainnet or Logged into your Wallet at the moment.<br/><br/>Please connect to <a href="https://metamask.io/" target="_new">Metamask</a> and select the Mainnet and ensure you are logged in to continue.<br/><br/>Refresh this page when you are logged into your wallet.');    
    }
  }
}


function showError(error, errorTitle) {
    if(errorTitle) {
      updateInnerHTML('errorHeader', errorTitle);
    } else {
      updateInnerHTML('errorHeader', 'Tron Heist');
    }

    updateInnerHTML('errorContent', error);

    $('#errorMessage').foundation('open');

}

function showComplete(msg, msgTitle) {
    if(msgTitle) {
      updateInnerHTML('completeHeader', msgTitle);
    } else {
      updateInnerHTML('completeHeader', 'Tron Heist');
    }

    updateInnerHTML('completeContent', msg);

    $('#completeMessage').foundation('open');

}

function closeError() {
  $('#errorMessage').foundation('close');
}
function closeComplete() {
  $('#completeMessage').foundation('close'); 
}
function updateInnerHTML(item, value){
  document.getElementById(item).innerHTML = value;
}
function roundTo2Dec(_in) {
  return Math.round(_in * 100) / 100
}
function getRadioBtnValue(radioBtnName) {
  let radios = document.getElementsByName(radioBtnName);
  let retVal = '';
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
function reloadPage(){
  location.reload();
}


function processGenericErrors(err, genericMsg){
  try{


    if(err.error.indexOf("Not enough energy") > -1) {
      showNotEnoughEnergy();
    } else {
      if(err.error.indexOf("bandwidth") > -1) {
        showNotEnoughBandwidth();
      } else {
        if(err.error.indexOf('Cannot find result in solidity node') > -1){
          console.log("err", err);
          hideProcessing();
          resetSelectedRects();
          return;
        } else {
          if(genericMsg)
            genericMsg();
          else
            showGenericTronErr();       
        }

      }
    } 
  } catch(e) {
    var _msg = ""
    _msg += '<p style="font-size: 10pt;"><i>Unable to Complete Transaction</i></p>';

    _msg += '<p style="font-size: 10pt;">Please confirm that your account is valid and has sufficient TRX, Energy &amp; Bandwidth and then try again.<br/><br/></p>';         


    _msg += '<p style="font-size: 10pt;"><b>If you continue to receive this message and you are sure your account is correct and valid please refresh this page and try again</b></p>';

    _msg += '<p style="font-size: 10pt;">The Error Message Returned Is:</p>';

    _msg += '<code>' + err + '</code>';

    showError(_msg, "Unable to complete transaction");

  }
}

function showInsufficientTRX() {
  var _msg = ""
  _msg += '<p style="font-size: 10pt;"><i>Unable to Complete Transaction</i></p>';

  _msg += '<p style="font-size: 10pt;">Please confirm that your account is valid and has sufficient TRX funds for this transaction and then try again.<br/><br/></p>';          


  _msg += '<p style="font-size: 10pt;"><b>If you continue to receive this message and you are sure your account is correct and valid please refresh this page and try again</b></p>';


  _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
  _msg += '<p>';
  _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
  _msg += '</p>';
  _msg += '<p style="font-size: 10pt;">';
  _msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
  _msg += '</p>';
  _msg += '<p style="font-size: 10pt;">';
  _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
  _msg += '</p>';

  _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
  showError(_msg, "Invalid Account or Insufficient Funds");
}
function showFailedTokenBuy() {
  var _msg = ""
  _msg += '<p style="font-size: 10pt;"><i>Unable to Complete Transaction</i></p>';

  _msg += '<p style="font-size: 10pt;">Please confirm that you have sufficient PlanetCOIN tokens for this transaction and that they are unlocked.<br/><br/></p>';         

  _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 3%!</p>';
  _msg += '<p>';
  _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
  _msg += '</p>';
  _msg += '<p style="font-size: 10pt;">';
  _msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + formatAddress(userWalletAddress) + '</code>';
  _msg += '</p>';
  _msg += '<p style="font-size: 10pt;">';
  _msg += ' For every new player you refer on - you will earn 3% from purchases as an instant bonus!';
  _msg += '</p>';

  _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
  showError(_msg, "Invalid Purchase");
}
function showNotEnoughEnergy() {
  var _msg = ""
  _msg += '<p style="font-size: 10pt;"><i>Your Transaction Did Not Process</i></p>';

  _msg += '<p style="font-size: 10pt;"><b>You do not have enough TRON Energy to process this transaction at the moment.</b></p>';
  _msg += '<p style="font-size: 10pt;">To gain more energy on your account you must <i>Freeze</i> some of your TRX.</p>';
  _msg += '<p style="font-size: 10pt;">Once you have more Energy please refresh this page and try again.</p>';
  _msg += '<p style="font-size: 10pt;">For more information please see the useful <a href="https://https://medium.com/@jacqshardy/how-to-tron-with-everdragons-c9d4de3a2497" target="_new">Guide from Everdragons</a></p>';

  
  showError(_msg, "Not Enough Energy");

  //resetSelectedRects();
}
function showNotEnoughBandwidth() {
  var _msg = ""
  _msg += '<p style="font-size: 10pt;"><i>Your Transaction Did Not Process</i></p>';

  _msg += '<p style="font-size: 10pt;"><b>You do not have enough TRON Bandwidth to process this transaction at the moment.</b></p>';
  _msg += '<p style="font-size: 10pt;">To gain more energy on your account you can <i>Freeze</i> some of your TRX or wait to be awarded your daily Bandwidth by the network.</p>';
  _msg += '<p style="font-size: 10pt;">Once you have more Bandwidth please refresh this page and try again.</p>';
  _msg += '<p style="font-size: 10pt;">For more information please see the useful <a href="https://https://medium.com/@jacqshardy/how-to-tron-with-everdragons-c9d4de3a2497" target="_new">Guide from Everdragons</a></p>';

  
  showError(_msg, "Not Enough Bandwidth");

  //resetSelectedRects();
}
function showGenericTronErr() {
  var _msg = ""
  _msg += '<p style="font-size: 10pt;"><i>Your Transaction Did Not Process</i></p>';

  _msg += '<p style="font-size: 10pt;">There was an issue sending your transaction to the TRON network - please try again.</p>';

  _msg += '<p style="font-size: 10pt;"><b>If you continue to receive this message and you are sure your account is correct and valid please refresh this page and try again</b></p>';
  

  showError(_msg, "Unable to Process Transaction");

  //resetSelectedRects();
}

function showClockHelp() {
  $('#clockHelp').foundation('open');
}
function showInstantWinHelp() {
  $('#instantWinHelp').foundation('open');
}
function showSafetyDepositHelp() {
  $('#safetyDepositHelp').foundation('open'); 
}
function showProcessing() {
  $("#processingDiv").removeClass("hide");
}
function hideProcessing() {
  $("#processingDiv").addClass('hide');
}
function formatAddress(_inAddr) {
  if(_inAddr.substring(0,2) == "0x")
  {
    _inAddr = "41" + _inAddr.substring(2);
  }
  let _out = _inAddr;

  if(window.tronWeb.isAddress(_inAddr)){
    _out = window.tronWeb.address.fromHex(_inAddr);
  }

  return _out;
}
