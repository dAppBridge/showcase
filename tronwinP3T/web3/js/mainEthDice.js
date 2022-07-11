
//let contractAddress = "TRUkR1AUsPTd6PovKgQ89H3pPmqQPRWTgu"; //mainnet
//let tronWinContractAddress = "TEKw3NeRZZEiAj8SpvsMV8j8XWiC2813d3";


let contractAddress = "0xd5c710f5d860aac85515c4feb419c164c65b8a8a"; //shasta
let tronWinContractAddress = "0x438b6600584d67d8a12ca2edbe1c6b137180a406";

//9023.7 TRX


let isDebug = true;



let CONNECTION_TO_USE;

if(isDebug)
  CONNECTION_TO_USE = "wss://ropsten.infura.io/ws";
else
  CONNECTION_TO_USE = "wss://mainnet.infura.io/ws";





var maxKeys = 2001;
var NULL_ADDR = "0x0000000000000000000000000000000000000000";
var _referer = NULL_ADDR; // "0x0000000000000000000000000000000000000000";
var TOAST_HIDE_DELAY = 5000;
var TOAST_HIDE_TRANSITION = 'slide';
var clipboard;

var playerInfo = {};
var playerVanity = "";
var playerBalance;


var isMobile = false;
var connectionAttempts = 0;

App = {
  tronWeb: null,
  isReadOnly: false,
  contracts: {},
  userWalletAddress: "",
  userWalletAddressShort: "",
  rollTypeUnder: true,
  init: async function() {


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

      /*
    if(window.tronWeb) {
      // need to check they are on the right network
      App.isReadonly = false;
      App.tronWeb = window.tronWeb;
      console.log("ADDR:", App.tronWeb.address.fromHex("0x93e05fdf63dea1a238a4bfdd69e90329999290d3"));

    } else {
      console.log("READ ONLY TRON");
      App.isReadonly = true;
      const HttpProvider = TronWeb.providers.HttpProvider;
      
      var fullNode;
      var solidityNode;
      var eventServer;

      if(isDebug){
        fullNode = new HttpProvider('https://api.shasta.trongrid.io');
        solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
        eventServer = 'https://api.shasta.trongrid.io/';
      } else {
        fullNode = new HttpProvider('https://api.trongrid.io');
        solidityNode = new HttpProvider('https://api.trongrid.io');
        eventServer = 'https://api.trongrid.io/';
      }

      const tronWeb = new TronWeb(
          fullNode,
          solidityNode,
          eventServer,
          NULL_ADDR
      );
      App.tronWeb = tronWeb;


    }
    //console.log(App.tronWeb.address.toHex("TRC1hwc1JaBL9kGp6wFYYCXUF4FVinpqbV"));
    return App.initContract();
    */
    
  },


  initContract: async function() {
  
    App.contracts.EthWin = new App.gameConnection.eth.Contract(ethwinmain.abi, tronWinContractAddress);
    App.contracts.EthWinDice = new App.gameConnection.eth.Contract(ethwindice.abi, contractAddress);
    return App.bindEvents();



  },
  bindEvents: function() {
    $("#eventsTable").tableHeadFixer({head: true});
    //getRoundKeyPrice();
    updateGameStats(true);

    
    loadInitVanityNames(getInitEvents);
    

    clipboard = new ClipboardJS('.btn');


//    $("#leaderboardTable").tableHeadFixer({head: true});


    console.log("INIT GOOGLE TRANS");
    new google.translate.TranslateElement({pageLanguage: "en, ru, zh-CN"}, 'google_translate_element');


    $('#flag-english').click(function(){
      //updateLang('en');
      setEng();
    });
    $('#flag-chinese').click(function(){
      updateLang('zh-CN');
    });
    $('#flag-russian').click(function(){
      //updateLang('ru');
      setRussian();
    });

    let _browserLang = navigator.language || navigator.userLanguage;


    if(_browserLang.toUpperCase().indexOf('RU')>-1) {
      setRussian();

    } else {
      var _lang = Cookies.get('lang')||"";
      console.log("LANG:", _lang);
      if(_lang.length > 0) {
        setTimeout(function(){
          //updateLang(_lang);
          if(_lang == "ru")
            setRussian();
          else
            updateLang(_lang);

        },1000);
      }
    }

    $('#rollTypeInput').change(function(){

      var selectedRadioValue = $('#rollType input:checked').val();

      if(selectedRadioValue == 'on') {
        //$('#rollTypeTitle').html('ROLL OVER TO WIN');
        $('#rollTypeTitle').html(document.getElementById('rollOverToWin').innerHTML);
        App.rollTypeUnder = false;
        maxVal = 98;
        minVal = 4;
        resetSelectedRoll();
      } else{
        //$('#rollTypeTitle').html('ROLL UNDER TO WIN');
        $('#rollTypeTitle').html(document.getElementById('rollUnderToWin').innerHTML);
        App.rollTypeUnder = true;
        maxVal = 95;
        minVal = 1;
        resetSelectedRoll();
      }
    
      return true;

    });

    $('#copyRefMobile').click(function(){
      showToast('Ref Link Copied', 'Your referral URL is copied to your clipboard!', 'info');
    });

    $('#copyRef2').click(function(){
      showToast('Ref Link Copied', 'Your referral URL is copied to your clipboard!', 'info');
    });

    

    $('#buyVanity').click(function(){
      buyVanityName();
    });
    $('#buyVanity2').click(function(){
      buyVanityName();
    });

    $('#unlockVanity').click(function(){
      updateVanity();
    });


    setupRangeSlider();
    

    window.odometerOptions = {
      auto: false,
      format: '(d)', 
      duration: 3000
    };


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


var isLangHardSet = false;

function setRussian() {
  if(!isLangHardSet){
    $('body').addClass('notranslate');
    isLangHardSet = true;
  }

  console.log("SETTING RUSSIAN LANG");
  //return;
  Cookies.set('lang', 'ru', { expires: 30 });
  $.i18n.properties({ 
    name: 'dice', 
    path: '/lang/', 
    mode: 'both', 
    debug: false,
    language: 'ru-RU', 
    callback: function() { 

      $("#headerTitle").html($.i18n.prop('headerTitle'));
      $("#headerIntro").html($.i18n.prop('headerIntro'));

      $("#totalRolls").html($.i18n.prop('totalRolls'));
      $("#totalWonLabel").html($.i18n.prop('totalWonLabel'));
      $("#topWinLabel").html($.i18n.prop('topWinLabel'));
      $("#topPlayerLabel").html($.i18n.prop('topPlayerLabel'));
      $("#houseMoneyLabel").html($.i18n.prop('houseMoneyLabel'));

      $("#divsTo333").html($.i18n.prop('divsTo333'));
      $("#introDiv").html($.i18n.prop('introDiv'));

      $("#realDiceTitle").html($.i18n.prop('realDice'));

      $("#rollUnder").html($.i18n.prop('rollUnder'));
      $('#rollTypeTitle').html($.i18n.prop('rollUnderToWin'));
      $("#rollUnderToWin").html($.i18n.prop('rollUnderToWin'));
      $("#rollOverToWin").html($.i18n.prop('rollOverToWin'));
      
      $("#rollResultTitle").html($.i18n.prop('rollResultTitle'));

      $("#rollTypeLabel").html($.i18n.prop('rollTypeLabel'));
      $("#over").html($.i18n.prop('over'));
      $("#under").html($.i18n.prop('under'));
      $("#payoutMultiplier").html($.i18n.prop('payoutMultiplier'));
      $("#winChanceLabel").html($.i18n.prop('winChanceLabel'));
      $("#expectedPayout").html($.i18n.prop('expectedPayout'));
      $("#betLabel").html($.i18n.prop('betLabel'));
      $("#balanceLabel").html($.i18n.prop('balanceLabel'));
      $("#maxBetLabel").html($.i18n.prop('maxBetLabel'));
      $("#resultsPlayer").html($.i18n.prop('resultsPlayer'));
      $("#resultsPrediction").html($.i18n.prop('resultsPrediction'));
      $("#resultsResult").html($.i18n.prop('resultsResult'));
      $("#resutlsBet").html($.i18n.prop('resutlsBet'));
      $("#resultsPayout").html($.i18n.prop('resultsPayout'));

      $("#yourProfile").html($.i18n.prop('yourProfile'));
      $("#yourAddress").html($.i18n.prop('yourAddress'));
      $("#vanityName").html($.i18n.prop('vanityName'));
      $("#yourTotalRolls").html($.i18n.prop('yourTotalRolls'));
      $("#yourTotalStakes").html($.i18n.prop('yourTotalStakes'));
      $("#yourTotalLosses").html($.i18n.prop('yourTotalLosses'));
      $("#yourRefs").html($.i18n.prop('yourRefs'));
      $("#yourTotalReturns").html($.i18n.prop('yourTotalReturns'));
      $("#yourRefURL").html($.i18n.prop('yourRefURL'));
      $("#refTxt").html($.i18n.prop('refTxt'));
      $("#copyRefMobile").html($.i18n.prop('copyRefMobile'));
      $("#yourProfile").html($.i18n.prop('yourProfile'));

      $('#socialTitle').html($.i18n.prop('socialTitle')); 
      $("#socialContent").html($.i18n.prop('socialContent')); 
    }
   });
}


function setEng() {
  if(!isLangHardSet){
    $('body').addClass('notranslate');
    isLangHardSet = true;
  }

  console.log("SETTING RUSSIAN ENG");
  //return;
  Cookies.set('lang', 'en', { expires: 30 });
  $.i18n.properties({ 
    name: 'dice', 
    path: '/lang/', 
    mode: 'both', 
    debug: false,
    language: '', 
    callback: function() { 

      $("#headerTitle").html($.i18n.prop('headerTitle'));
      $("#headerIntro").html($.i18n.prop('headerIntro'));

      $("#totalRolls").html($.i18n.prop('totalRolls'));
      $("#totalWonLabel").html($.i18n.prop('totalWonLabel'));
      $("#topWinLabel").html($.i18n.prop('topWinLabel'));
      $("#topPlayerLabel").html($.i18n.prop('topPlayerLabel'));
      $("#houseMoneyLabel").html($.i18n.prop('houseMoneyLabel'));

      $("#divsTo333").html($.i18n.prop('divsTo333'));
      $("#introDiv").html($.i18n.prop('introDiv'));

      $("#realDiceTitle").html($.i18n.prop('realDice'));

      $("#rollUnder").html($.i18n.prop('rollUnder'));
      $('#rollTypeTitle').html($.i18n.prop('rollUnderToWin'));
      $("#rollUnderToWin").html($.i18n.prop('rollUnderToWin'));
      $("#rollOverToWin").html($.i18n.prop('rollOverToWin'));
      
      $("#rollResultTitle").html($.i18n.prop('rollResultTitle'));

      $("#rollTypeLabel").html($.i18n.prop('rollTypeLabel'));
      $("#over").html($.i18n.prop('over'));
      $("#under").html($.i18n.prop('under'));
      $("#payoutMultiplier").html($.i18n.prop('payoutMultiplier'));
      $("#winChanceLabel").html($.i18n.prop('winChanceLabel'));
      $("#expectedPayout").html($.i18n.prop('expectedPayout'));
      $("#betLabel").html($.i18n.prop('betLabel'));
      $("#balanceLabel").html($.i18n.prop('balanceLabel'));
      $("#maxBetLabel").html($.i18n.prop('maxBetLabel'));
      $("#resultsPlayer").html($.i18n.prop('resultsPlayer'));
      $("#resultsPrediction").html($.i18n.prop('resultsPrediction'));
      $("#resultsResult").html($.i18n.prop('resultsResult'));
      $("#resutlsBet").html($.i18n.prop('resutlsBet'));
      $("#resultsPayout").html($.i18n.prop('resultsPayout'));

      $("#yourProfile").html($.i18n.prop('yourProfile'));
      $("#yourAddress").html($.i18n.prop('yourAddress'));
      $("#vanityName").html($.i18n.prop('vanityName'));
      $("#yourTotalRolls").html($.i18n.prop('yourTotalRolls'));
      $("#yourTotalStakes").html($.i18n.prop('yourTotalStakes'));
      $("#yourTotalLosses").html($.i18n.prop('yourTotalLosses'));
      $("#yourRefs").html($.i18n.prop('yourRefs'));
      $("#yourTotalReturns").html($.i18n.prop('yourTotalReturns'));
      $("#yourRefURL").html($.i18n.prop('yourRefURL'));
      $("#refTxt").html($.i18n.prop('refTxt'));
      $("#copyRefMobile").html($.i18n.prop('copyRefMobile'));
      $("#yourProfile").html($.i18n.prop('yourProfile'));

      $('#socialTitle').html($.i18n.prop('socialTitle')); 
      $("#socialContent").html($.i18n.prop('socialContent')); 

    }
   });
}




function resetSelectedRoll() {
  if($('#rangeSelector').val() < minVal){
    $('#rangeSelector').val(minVal);
    $('#rollNumber').html(minVal);
  }
  if($('#rangeSelector').val() > maxVal){
    $('#rangeSelector').val(maxVal);
    $('#rollNumber').html(maxVal);
  }

  updateStats($('#rangeSelector').val());

}

function updateStats(_rollNumber) {
  let _payout = 0;
  if(App.rollTypeUnder) {

    let _multiplier = parseFloat(((99 * 1000 / _rollNumber)/1000).toFixed(2));

    updateInnerHTML('multiplier', 'x' + _multiplier);
    updateInnerHTML('winChance', (_rollNumber / 100 * 100).toFixed(0) + '%');


    _payout = (document.getElementById('betAmount').value * _multiplier)
    updateInnerHTML('payout', (_payout).toFixed(3));

    //debugCalc(_rollNumber);

  } else {

    let _multiplier = parseFloat(((99 * 1000 / (99-_rollNumber))/1000).toFixed(2));

    updateInnerHTML('multiplier', 'x' + _multiplier);
    updateInnerHTML('winChance', ((99-_rollNumber) / 100 * 100).toFixed(0) + '%');

    _payout = document.getElementById('betAmount').value * _multiplier;
    updateInnerHTML('payout', (_payout).toFixed(3));

    //debugCalc(_rollNumber);
  }

  checkBetSize(_payout);
}

// under:
// max = 95
// min = 1
// over rolls
// max = 98
// min = 4
var maxVal = 95;
var minVal = 1;
function setupRangeSlider() {

  var rangeSlider = function(){
    var slider = $('.range-slider'),
        range = $('#rangeSelector'),
        value = $('#slider__value');
      
    slider.each(function(){

      value.each(function(){
        var value = $(this).prev().attr('value');
        
        $(this).html(value);
      });


      range.on('input', function(){

        updateStats(this.value);
        $(this).next(value).html(this.value);
        $('#rollNumber').html(this.value);
        calcMaxBet();

        resetSelectedRoll();

      });
    });
  };

  rangeSlider();

  var rangeSlider2 = function(){
    var slider = $('.range-slider2'),
        range = $('#rangeSelector2'),
        value = $('#slider__value2');
      
    slider.each(function(){

      value.each(function(){
        var value = $(this).prev().attr('value');
        
        $(this).html(value);
      });


      range.on('input', function(){

      console.log("PRICE SLIDER:", this.value);
      

      updateBetSize(this.value);
      //  updateStats(this.value);
      //  $(this).next(value).html(this.value);
       


       // resetSelectedRoll();

      });
    });
  };

  rangeSlider2();

}

function updateBetSize(_val) {

  $('#betAmount').attr('value', _val);
  updateStats($('#rangeSelector').val());
  return;
}

var    sides = 10,
    initialSide = 0,
    lastFace,
    timeoutId,
    transitionDuration = 500, 
    animationDuration  = 2000;

function randomFace() {
  var face = Math.floor((Math.random() * sides)) + initialSide
  lastFace = face == lastFace ? randomFace() : face
  return face;
}

function rollTo(face) {
  clearTimeout(timeoutId)
  finalNumber = parseInt(face) * 10;
  $('#die1').attr('data-face', face)
}

function rollTo2(face) {
  finalNumber = finalNumber + parseInt(face);
  isRolling = false;
  $('#die2').attr('data-face', face)
}


var _dice1 = 0;
var _dice2 = 1;
function diceRolling(){
  if(!isRolling)
    return;

  _dice1++;
  _dice2++;
  if(_dice1>9)
    _dice1 =0;
  if(_dice2>9)
    _dice2=0;

  $('#die1').attr('data-face', _dice1);
  $('#die2').attr('data-face', _dice2);

  if(isRolling){
    setTimeout(function(){diceRolling()},500);
  }
}

function reset() {
  $('#die1').attr('data-face', null).removeClass('rolling')
}
//odometerdone
var odometerDirectionUp = false;
var isRolling = false;
var finalNumber = 0;
window.addEventListener('odometerdone',function(e){
  console.log("odometerdone");
  if(!isRolling){
    $('#rollResult').html(padNumber(finalNumber,2));
    return;
  }

  if(odometerDirectionUp) {
    $('#rollResult').html('00');
    odometerDirectionUp = false;
  } else {
    $('#rollResult').html('99');
    odometerDirectionUp = true;
  }
});


$('#roll').click(function () {
  $('#rollResult').html('99');
  odometerDirectionUp = true;
  isRolling = true;

  setTimeout(function(){diceRolling()},1000);
  roll();
  return false;

});






function showVanityHelp() {
 $('#vanityHelp').foundation('open'); 
}
function updateVanity() {
  $('#vanityBuyDiv').foundation('close');

  let _name = document.getElementById('vanityName').value;
  
  console.log("_NAME", _name); 
  let _cost = App.tronWeb.toSun(100);


  // check if name exists...
  console.log(_name);
  App.contracts.TronWin.vanityToAddress(_name).call().then(function(results){
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

function submitBuyVanity(_name){
  let _cost = App.tronWeb.toSun(100);
  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');



    // Working...
    App.contracts.TronWin.buyVanity(_name).send(
        {
          from: App.userWalletAddress,
          callValue: _cost.toString()
        }, function( err, results) {
          if(err) {
            showToast('Investment Cancelled','Your investment was cancelled and no $TRX was spent this time - please try again!', 'info');

          } else {
            let _msg = "<h4>Congratulations!</h4>"
            _msg += '<p style="font-size: 10pt;"><b>You now own <b>' + _name + '</b>!</b></p>';
            _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain visible shortly.</p>';
            
            _msg += '<p style="font-size: 10pt;">You\'ll need to refresh the UI to see the changes - click the reload button below to do so.</p>';

            _msg += '<center><button onclick="reloadPage();" class="button success">RELOAD</button></center>';
            



            $("#refidmobile").attr('value', "https://tronwin.app/?tron=" + _name);
            $("#refid2").attr('value', "https://tronwin.app/?tron=" + _name);
            showError(_msg, "Success");
            
          }
        }
      );


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

            updateUserProfile();


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

  /*
  if(!App.isReadonly){

    App.userWalletAddress = App.tronWeb.defaultAddress.hex;


    // now check for vanity..
    App.contracts.TronWin.addressToVanity(App.userWalletAddress).call().then(function(results){
      playerVanity = results;
      updateInnerHTML('vanityNameDisplay', playerVanity);

      if(playerVanity.length > 0){

        updateVanityAddress(App.userWalletAddress, playerVanity);
        $("#refidmobile").attr('value', "https://tronwin.app/?tron=" + playerVanity);
        $("#refid2").attr('value', "https://tronwin.app/?tron=" + playerVanity);
      }
      else{

        $("#refidmobile").attr('value', "https://tronwin.app/?tron=" + formatAddr(App.userWalletAddress));
        $("#refid2").attr('value', "https://tronwin.app/?tron=" + formatAddr(App.userWalletAddress));
      }

    }).catch(function(err){
        $("#refidmobile").attr('value', "https://tronwin.app/?tron=" + formatAddr(App.userWalletAddress));
        $("#refid2").attr('value', "https://tronwin.app/?tron=" + formatAddr(App.userWalletAddress));
    });


    // check for reverse _referer...
    console.log("CHECKING", _referer);

    App.contracts.TronWin.vanityToAddress(_referer).call().then(function(results){
      console.log("VANITY ADDR:", results);
      if(App.tronWeb.isAddress(results)){
        console.log("IS ADDRESS!")
        if(results == NULL_ADDR){

        } else {
          _referer = results; 
          console.log("DONE, NEW REF:", _referer);
        }
      }

    }).catch(function(err){
    });


    updateUserProfile();

  }
  */
}









function getInitEvents() {
// TODO
return;
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

/*
  App.tronWeb.getEventResult(contractAddress, {
    eventName:'BetReady',
    size: 100,
    page: 1
  }).then(results => {
      for(let i=0; i< 100; i++){
        processEvent(results[i], true);
      }
      $("time.timeago").timeago();
  });
*/


  if(isMobile){
    checkEvents();
  } else {

    App.contracts.TronWinDice.Action().watch((err, event) => {
      if (err) return console.error('Error with "method" event:', err);
      if (event) { 
        processEvent(event, false, false);
      }
    });

    // watch for new vanity names
    App.contracts.TronWin.Action().watch((err, event) => {
      if (err) return console.error('Error with "method" event:', err);
      if (event) { 
        processEventTronWinMain(event, false, false);
      }
    });

  }


}


startTimestamp = new Date().getTime();
var initEvents = [];
var lastTimeStamp = 0;
let txSeen = [];
let _fingerprint = "";
var api_url = "api.trongrid.io";

function checkEvents() {
  console.log("CHECK EVENTS:");
    initEvents = [];
    queryEventServer("", 1, 1, startTimestamp, function(){

      //startTimestamp = new Date().getTime();
      //console.log("LEN OF initEvents:", initEvents.length);
      //for(let c=0; c=initEvents.length;c++) {
        //processEvent(initEvents[i], false, false);
      //}

  
      setTimeout(function(){
          checkEvents();
      },2000);
  


    });



}

async function queryEventServer(name, page, _maxPages, _sinceTimestamp, _callback) {
  let _url = "https://" + api_url + "/event/contract/" + contractAddress + "/" + name + "?size=";
  _url += "200&page=" + page.toString();

  if(_sinceTimestamp)
    _url += "&sinceTimestamp=" + _sinceTimestamp;

  _url += "&previousLastEventFingerprint=" + _fingerprint;
  _url += "&sort=block_timestamp"

  //console.log(_url);
  let _fpSet = false;
  await $.getJSON( _url, function( _data ) {

    //console.log("data:", data);

    if(_data.length > 0) {


      for(let c=0; c < _data.length; c++) {


        if(_data[c]._fingerprint){
          _fpSet = true;
          //console.log("FP:", _data[c]._fingerprint);
          _fingerprint = _data[c]._fingerprint;
        } 

        if($.inArray(_data[c].transaction_id + ":" + _data[c].event_name + ":" + _data[c].event_index, txSeen) == -1) {
          txSeen.push(_data[c].transaction_id + ":" + _data[c].event_name + ":" + _data[c].event_index);

          let dataItem = {
            timestamp: _data[c].block_timestamp, 
            contract: _data[c].contract_address,
            name: _data[c].event_name, 
            block: _data[c].block_number, 

          }


          if(_data[c].event_name == "Action"){
            console.log("DATA", _data[c]);
            dataItem.result  = _data[c].result;
            dataItem.result.from = "41" + _data[c].result.from.substring(2);
            dataItem.transaction = _data[c].transaction_id;
          }


          console.log("DATAITEM:", dataItem);

          //initEvents.push(dataItem);

          processEvent(dataItem, false, false);

        } else {
          
        }
      }

    } else {

      page = _maxPages
    }

  }).catch(function(e){
    console.log(e);

    page = _maxPages;
    _callback();

  });
  if(!_fpSet) {
    page = _maxPages
    _callback();
  }

  //console.log("PAGE:", page);
  //return page;
}


var highestBlocknumber = 0;


function processEvent(event, isInit, isMobileEventsCheck) {
  if(!event)
    return;

  console.log("NEW EVENT:", event);

  let eventRow = '';
  let hasEventRow = false;
  let _logDate = new Date(parseInt(event.result.timestamp)*1000).toISOString();



  if( (isInit||isMobileEventsCheck) && event.blockNumber > highestBlocknumber)
    highestBlocknumber = event.block;

  if(event.name == "Action"){


    if(event.result.event_type == 99){
      console.log("NEW EVENT:", event);

      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,10) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      eventRow += '<td>Debug Dist: ' + App.gameConnection.utils.fromWei(event.result.amnt) + 
      '  |' + event.result.instant_guess + ':' + event.result.instant_result 
      + ':' + event.result.instant_prize + ':' + event.result.bonus_guess + '</td>';

      hasEventRow = true;

    }

    if(event.result.event_type == 0 || event.result.event_type == 1) {
      // roll result

      
      if(!isInit && displayWalletAddress(event.result.from) == displayWalletAddress(App.userWalletAddress)) {
        // match
        let _result = parseInt(event.result.result);
        let _win_amnt = parseInt(event.result.win_amnt);

        finalNumber = _result;
        isRolling = false;
        if(_result.toString().length==1) {
          $('#die1').attr('data-face', 0);
          $('#die2').attr('data-face', _result);
        } else {
          $('#die1').attr('data-face', _result.toString()[0]||"0");
          $('#die2').attr('data-face', _result.toString()[1]);
        }

      }
      

      // check for win row...
      let _winRow = false;

      if(event.result.event_type == 0){
        _winRow = true;
        eventRow = '<tr class="standardWinEventRow">';
      } else {
        eventRow = '<tr class="standardEventRow">';
      }





      
      

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      if(event.result.bet_under == 'true')
        eventRow += '<td>Under ' + event.result.roll_amnt + ''
      else
        eventRow += '<td>Over ' + event.result.roll_amnt + ''

      eventRow += '</td>';


      hasEventRow = true;


      eventRow += '<td>' + event.result.result + '</td>';


      eventRow += '<td>' + displayFromSUN(event.result.amnt) + ' TRX</td>';


      if(_winRow)
        eventRow += '<td class="winAmntCol">' + displayFromSUN(event.result.win_amnt) + ' TRX</td>';
      else
        eventRow += '<td>' + displayFromSUN(event.result.win_amnt) + ' TRX</td>';


      eventRow += '</tr>';

    }



  } else {



  }


  if(hasEventRow){
  //  eventRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td></tr>';

    if(!isInit){
      $('#eventsTable tbody').prepend(eventRow);
    //  $("time.timeago").timeago();
    } else {
      $('#eventsTable tbody').append(eventRow);
    }

  }

}


function processEventTronWinMain(event, isInit, isMobileEventsCheck) {
  if(!event)
    return;


  if(event.name == "Action"){


    if(event.result.event_type == 4) {
      updateVanityAddress(event.result.from, event.result.data)

    }



  } else {



  }


}



var maxWin = null;
var gameStats = {};
var userProfile = {};
var playerVanityLen = 0;
async function loadInitVanityNames(_callback) {
  App.contracts.EthWin.methods.playersVanityAddressListLen().call().then(function(results){
    playerVanityLen = parseInt(results);
    if(playerVanityLen > 0)
      getPlayerVanityByID(0,_callback);
    else{
      if(_callback)
        _callback();
    }
  }).catch(function(e){
    if(_callback){
      _callback();
    }
  });
}

async function getPlayerVanityByID(_c, _callback) {
  await App.contracts.EthWin.methods.playersVanityByID(_c).call().then(function(results){

    updateVanityAddress(results._addr, results._vanity);
    _c++;
    if(_c < playerVanityLen) {
      getPlayerVanityByID(_c,_callback);

    } else {
      if(_callback){
        _callback();
      }
    }
  }); 
}


function updateGameStats(isInit) {

  App.contracts.EthWinDice.methods.gameStats().call().then(function(results){
    gameStats = results;
    //console.log("MAX WIN:", App.tronWeb.fromSun(gameStats._maxWin.toNumber()));
    // 111.925643
    populateGameStats();

    if(!App.isReadonly){
      updateUserProfile();
    }

    App.contracts.EthWin.methods.getTotalDivs().call().then(function(results){

      $('#totalDivs').html(displayFromSUN(results.toNumber()));
    }).catch(function(e){

    });


    App.contracts.EthWin.methods.getGameFund().call().then(function(results){
      $('#houseMoney').html(displayFromSUN(results.toNumber()));
    }).catch(function(e){

    });

    setTimeout(function(){ updateGameStats();}, 1000);
  }).catch(function(e){
    setTimeout(function(){ updateGameStats();}, 1000);
  });
}

function populateGameStats() {
  //console.log(gameStats, displayFromSUN(gameStats._totalWon));
  $('#totalPlays').html(gameStats._totalRolls.toNumber().toFixed(0));
  $('#totalWon').html(displayFromSUN(gameStats._totalWon.toNumber()));
  $('#topWin').html(displayFromSUN(gameStats._topWin.toNumber()));


  $('#topPlayer').html(displayWalletAddress(gameStats._topPlayer).substring(0,8));
}

function updateUserProfile() {

  App.contracts.EthWinDice.methods.getProfile(App.userWalletAddress).call().then(function(results){
    userProfile = results;
    populateProfileInfo();
  });

  if(!App.isReadonly){
    App.gameConnection.eth.getBalance(App.userWalletAddress).then(function(results){
      $('#balance').html(displayFromSUN(results,2));
      //console.log(App.gameConnection);
      playerBalance = new App.gameConnection.utils.BN(results.toString());

      calcMaxBet();


    });    
  } else {
      let _maxBetSun = calcMaxBet();
      $('#rangeSelector2').attr('max', _maxBetSun);
  }

}

function populateProfileInfo() {
  //console.log(userProfile);
  $('#playerAddress').html(formatAddr(App.userWalletAddress));
  $('#playerRolls').html(userProfile.totalPlayerRolls);
  $('#playerStaked').html(displayFromSUN(userProfile.stakedAmnt));
  $('#playerWon').html(displayFromSUN(userProfile.winAmnt));
  $('#playerLosses').html(displayFromSUN(userProfile.lossAmnt));
}


var rollTxToWatch = "";

function roll() {
  let numSUN = parseInt(App.tronWeb.toSun(document.getElementById('betAmount').value).toString()).toFixed(0);
  //console.log("numSUN", numSUN);


  if(document.getElementById('betAmount').value < 5) {
    showError("Min Bet is 5 TRX", "Min Bet");
    finalNumber = 0;
    isRolling = false;
    $('#die1').attr('data-face', 0);
    $('#die2').attr('data-face', 0);
    return;
  }
  let _rollNumber = $('#rangeSelector').val();

  let _payout = 0;
  if(App.rollTypeUnder) {

    let _multiplier = parseFloat(((99 * 1000 / _rollNumber)/1000).toFixed(2));
    _payout = (document.getElementById('betAmount').value * _multiplier)


  } else {

    let _multiplier = parseFloat(((99 * 1000 / (99-_rollNumber))/1000).toFixed(2));
    _payout = document.getElementById('betAmount').value * _multiplier;
  }

  if(_payout > parseFloat(App.gameConnection.utils.fromWei(gameStats._maxWin))) {
    showError("We cannot take this bet size at the moment<br/>Please try again with lower odds or a lower bet", "Invalid bet");
    finalNumber = 0;
    isRolling = false;
    $('#die1').attr('data-face', 0);
    $('#die2').attr('data-face', 0);
    return;
  }

  App.contracts.EthWinDice.methods.playerCanRoll(App.userWalletAddress).call().then(function(results){
    //console.log("CAN ROLL:", results);
    if(results == true) {
      App.contracts.EthWinDice.methods.roll($('#rangeSelector').val(), App.rollTypeUnder).send(
          {callValue: numSUN.toString(),
          shouldPollResponse: false}).then(function(results){
            rollTxToWatch =results;
            /*
            let _result = results._result.toNumber();
            let _win_amnt = results._win_amnt.toNumber();
            console.log(_result,_result.toString().length);
            finalNumber = _result;
            isRolling = false;
            if(_result.toString().length==1) {
              $('#die1').attr('data-face', 0);
              $('#die2').attr('data-face', _result);
            } else {
              $('#die1').attr('data-face', _result.toString()[0]||"0");
              $('#die2').attr('data-face', _result.toString()[1]);
            }
            */

      }).catch(function(e){
        if(e.error=="Cannot find result in solidity node"){
            finalNumber = 0;
            isRolling = false;
            showToast('Roll Complete!', 'Check the events table below for your result!', 'info');
            $('#die1').attr('data-face', 0);
            $('#die2').attr('data-face', 0);
        } else {
          showToast('Roll Error!', 'There was an error with your roll, check you have sufficient TRX and Energy', 'error');
        }

      });
    } else {
      showToast('Roll In Progress', 'You still have a roll going... please wait!', 'info');
    }
  });



}

function betChange() {
  updateStats($('#rangeSelector').val());
}

function calcMaxBet() {
  if(App.isReadonly) {
      let results = App.gameConnection.utils.toWei(1, "ether");

      

      playerBalance = new App.gameConnection.utils.BN(results.toString());


      let _currentBalanceTRX = App.gameConnection.utils.fromWei(results);

      let _maxBet;
      let _rollNumber = $('#rangeSelector').val();

      if(App.rollTypeUnder) {
        
        let _multiplier = parseFloat(((99 * 1000 / _rollNumber)/1000).toFixed(2));
        _maxBet = parseFloat(App.gameConnection.utils.fromWei(gameStats._maxWin)) / _multiplier;
      } else {
        let _multiplier = parseFloat(((99 * 1000 / (99-_rollNumber))/1000).toFixed(2));
        _maxBet = parseFloat(App.gameConnection.utils.fromWei(gameStats._maxWin)) / _multiplier;
      }

      console.log("MAXWIN:", gameStats._maxWin);
      console.log("CalcMaxBet", _maxBet, _currentBalanceTRX);
      if(App.gameConnection.utils.fromWei(_currentBalanceTRX) > _maxBet) {
        _maxBet = _currentBalanceTRX;
      }

      
      $('#rangeSelector2').attr('max', _maxBet);
      $('#rangeSliderMax').html(_maxBet + " TRX");
      return _maxBet;

  } else {

    App.gameConnection.eth.getBalance(App.userWalletAddress).then(function(results){

      $('#balance').html(displayFromSUN(results,2));
      

      let _currentBalanceETH = App.gameConnection.utils.fromWei(results);

      let _maxBet;
      let _rollNumber = $('#rangeSelector').val();

      if(App.rollTypeUnder) {
        
        let _multiplier = parseFloat(((99 * 1000 / _rollNumber)/1000).toFixed(2));
        _maxBet = parseFloat(App.gameConnection.utils.fromWei(gameStats._maxWin)) / _multiplier;
      } else {
        let _multiplier = parseFloat(((99 * 1000 / (99-_rollNumber))/1000).toFixed(2));
        _maxBet = parseFloat(App.gameConnection.utils.fromWei(gameStats._maxWin)) / _multiplier;
      }

      //console.log("_maxBet", _maxBet, _currentBalanceTRX);
      if(_currentBalanceETH > _maxBet) {
        _maxBet = _currentBalanceETH;
      }
      $('#rangeSelector2').attr('max', Math.floor(_maxBet));
      $('#rangeSliderMax').html(Math.floor(_maxBet) + " TRX");
      return _maxBet;
    });  

  }
}
function checkBetSize(_payout) {
  if(_payout > parseFloat(App.gameConnection.utils.fromWei(gameStats._maxWin))) {


    //buyMax();
    /*
    if(!App.isReadonly){
      //showError('Your bet would exceed the current maximum payout of <strong>' + parseFloat(App.tronWeb.fromSun(gameStats._maxWin.toNumber())) + ' TRX</strong><br/>It has been reset to the max amount possible.', 'Bet too high!');
    }
    else
      showError('Your bet would exceed the current maximum payout of <strong>' + parseFloat(App.tronWeb.fromSun(gameStats._maxWin.toNumber())) + ' TRX</strong><br/>Please lower your bet amount.', 'Bet too high!');
    */
    console.log("BET TOO LARGE");
    $('#betAmount').attr('value', $('#rangeSelector2').val());
    

    return;
  }
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


  var _newReferer = getUrlParameter('tron')||"";
  if(_newReferer.length > 0) { // newly referred
    _referer = _newReferer;
  } else { // existing user referred by someone
    var _cookieRef = Cookies.get('tron')|"";
    if(_cookieRef.length >0)
      _referer = _cookieRef;
  }
  Cookies.set('tron', _referer, { expires: 30 });


  if(isMobile){
    setTimeout(function(){
      App.init();
    },1500);
  } else {
    App.init();
  }

});







//
// UTILS
//
var vanityNames = [];


function displayFromSUN(_in, _round) {
  if(_round == 0) {
    return parseFloat(App.gameConnection.utils.fromWei(_in.toString())).toFixed(0);
  }else
  return parseFloat(App.gameConnection.utils.fromWei(_in.toString())).toFixed(_round||4);
}
function displayWalletAddress(_addr) {


  let _out = formatAddr(_addr);

  //console.log(vanityNames, _out);

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
  return _in;
  let _out = _in;
  if(_out.substring(0,2) == "0x"){
    _out = App.tronWeb.address.fromHex("41" + _out.substring(2));
  } else {
    if(_out.substring(0,2) == "41") {
      _out = App.tronWeb.address.fromHex(_out);
    }
  }
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
  console.log("selectField", selectField);
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


// admin


function setGamePause(){
    App.contracts.EthoWin.methods.p_setGamePaused(false).send(
      {}, 
        function(error, result){
          if(error) {
            showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
          } else {
            console.log("tx:", result);                    
            
          }
    });
}


function finalizeBet(){
    App.contracts.EthWinDice.methods.finalizeBet().send(
      {}, 
        function(error, result){
          if(error) {
            showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
          } else {
            console.log("tx:", result);
          }
    });
}

function pushDataToRandos(){
    let _body = JSON.parse(_randosData);
    let _NewRandos = [];
    for(let i=0; i<_body.data.length;i++){
      _NewRandos.push(_body.data[i]);
    }


    //App.contracts.Rando2.pushRandos(_NewRandos).send(
    App.contracts.EthWinDice.methods.pushRandos(_NewRandos).send(
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
  App.contracts.EthWinKeys.methods.getRandoUInts(9, App.userWalletAddress, 4).send({
    shouldPollResponse: true
  }, function(error, results){
    if(error)
    console.log("err:", error);
  if(results)
    console.log("results", results);

  });

}


function getRandoUInt() {
  //App.contracts.Rando2.getRandoUInt(10000, App.userWalletAddress).send({
  App.contracts.EthWinKeys.methods.getRandoUInt(10000, App.userWalletAddress).send({
    shouldPollResponse: true
  }, function(error, results){
    if(error)
    console.log("err:", error);
  if(results)
    console.log("results", results);

  });

}







var _randosData = '{"type":"uint16","length":1000,"data":[35442,624,33760,61965,27646,32686,63450,5872,3440,63844,29026,46244,58964,53955,21140,12072,59161,64898,20369,40775,40163,53613,47850,47927,10839,47410,16980,62324,24382,16184,33674,50036,31035,19611,43649,30930,26236,1882,36241,20215,3080,60088,58866,61291,5600,16840,11546,32564,44802,14174,12523,58524,63153,2790,42639,41439,32387,25949,62839,31361,7364,53226,14512,54894,65361,64698,2149,7468,21505,36395,33865,56702,13352,61288,4399,17345,32123,28795,58397,11341,26100,27554,14554,19353,56567,53214,51135,42793,28080,61252,56609,34356,14919,8163,56921,41796,42690,34433,21896,4603,11171,50868,15772,31227,22761,32670,54568,6141,257,47217,21398,28729,18421,40800,17250,62458,22715,17459,28524,63636,37140,40190,42997,925,51132,5496,56239,42952,12464,23677,52981,45030,45151,58108,53801,35589,64295,49328,6737,10363,55489,5384,5517,47805,54003,20028,17654,7866,10913,34817,43845,13670,53133,51163,38761,19420,25721,46801,10578,392,26146,64115,30027,60954,7302,58201,26569,3797,25295,54155,46035,13495,61757,5145,24278,59650,15658,36147,2418,26065,57315,60403,20760,48574,33582,40004,62209,53157,27035,5096,46915,11529,48964,61082,2632,17222,53647,21654,42841,28171,40606,44475,44755,54995,36625,6763,61302,15950,40292,30612,21369,58840,65314,20861,9808,20340,21040,50308,52622,46058,34204,22409,46937,28679,13454,41146,62620,36205,13180,64739,9684,43651,15932,27243,41933,30425,51735,29582,12339,45841,29615,17202,33684,10569,41646,61206,18168,27816,15384,62109,16792,6921,4439,35381,23657,46590,15770,49135,8774,57515,59216,16002,22839,40375,51015,11252,2212,30161,7616,9759,8833,4708,44060,39468,40484,6781,57630,3593,33838,63763,35491,8588,42671,15296,33164,62231,38187,28530,20269,42616,18866,56081,45445,13915,58541,16016,9865,62629,31600,13158,47968,13209,65227,63626,24588,54963,27295,64282,20480,31659,38568,50280,52473,35323,20090,12635,27930,14991,15664,9823,33873,42671,55327,64196,29427,45921,49279,38217,6504,25150,40543,9664,58350,61457,53826,303,16937,16798,44270,44172,65405,51432,58218,26654,31238,380,34662,52685,15615,62241,64181,50125,9268,22452,31944,237,34112,36820,50099,13424,50930,38622,37343,53476,19543,46632,37108,45463,7204,10075,33874,29130,20485,42559,11877,29764,44337,36740,38153,2823,55148,14854,28652,63562,36339,33853,63629,15060,35781,45008,53759,22216,6112,5976,61834,36512,24255,40676,55019,30232,36154,6951,26352,52251,32381,10657,33091,63698,15719,54957,25322,35188,33836,31463,30445,33739,32651,15737,35264,38749,9233,26189,43159,51151,45463,17259,28000,53247,20977,21420,57001,63474,43513,55792,15004,56406,27823,27925,3376,5153,54969,13120,37791,57417,59536,52542,36906,56290,38525,4082,54872,10639,12293,60714,36197,32832,32863,62416,21167,9367,58590,53532,6316,27807,7547,32145,32362,18478,29320,63578,19955,57842,64431,44857,57122,7851,60441,45199,52130,28173,11542,36160,27157,47358,60400,44514,35891,40537,10201,40747,58787,17255,16080,57133,52100,9502,25184,63491,22868,27832,12538,59105,29334,26620,11068,57403,13797,53314,36204,17977,65371,51744,57185,64032,51167,50358,63865,12049,50713,47991,2711,13600,52192,38943,28844,2011,63019,21350,13616,40065,22352,49947,62175,19733,50666,60652,63782,23710,33218,31758,11866,32091,3308,31439,48070,353,898,61288,43723,13280,43784,21558,4629,25198,42242,8754,58700,46849,17885,9764,62505,53239,42067,46366,34101,46794,46786,22559,47417,41947,62477,33098,28558,42046,28530,49917,55417,18296,47060,2258,34211,48884,26854,40083,15952,38267,55068,31905,29759,41356,26077,23711,62283,55349,64723,4634,54147,56575,11619,57258,45318,45245,44011,43872,27332,14838,4247,14455,3474,7251,6714,41754,47451,41258,15701,62740,39967,27217,42259,26940,34302,17986,47638,56867,60342,21711,1215,57262,33970,16939,26988,20049,5291,3718,46222,39699,3531,25382,39743,8056,20897,4550,20925,27802,11194,25002,43789,37632,38700,24647,64948,8626,37894,63446,28338,58660,20722,4456,10951,55267,34018,57398,15915,58362,61119,34663,55574,41692,20302,42064,8869,55295,16287,5453,36535,17269,39655,9332,26621,47233,20599,63138,7275,60249,35749,59999,50149,35009,9538,49781,3484,26678,64764,5719,65270,51737,37710,18976,6359,9468,41714,48065,16385,34235,23055,18334,25736,26217,62132,44431,13785,59628,28159,37931,57460,35758,34411,28271,869,28681,48587,26507,55311,13208,42737,1583,65488,38944,31643,22732,18743,15623,12609,18303,16695,62806,14611,9901,49666,49818,21631,53888,30424,61274,45244,59680,56130,48779,53229,49098,15796,61864,30692,32699,48260,65070,37149,51867,62750,39210,46501,18804,275,37741,2602,10608,49938,8528,17109,25704,42994,64500,33496,51011,62075,1796,20878,16444,53143,16091,13646,7304,6382,33869,49780,31753,22858,28632,3911,40178,985,34903,19325,3826,52615,41964,32885,24837,54894,15316,64354,41882,23988,60232,61089,46385,48858,60089,34466,21444,14620,7098,16729,32496,13966,30000,30502,55206,17334,26738,50441,8205,1874,47265,23533,57758,26543,27071,44854,38888,62865,54874,55758,42624,32556,39813,32184,34780,23774,36596,52118,53580,45419,28621,29161,20022,1237,57134,59172,64482,44539,43958,49841,43334,32531,8036,47193,30533,59094,29382,7867,20312,42436,4249,15446,44433,39927,20873,11417,41577,45907,12842,18832,45460,55362,10125,63152,56342,49843,12347,57728,34566,30542,59116,3657,41253,53036,41684,32493,13253,12492,27220,8757,59003,4213,3379,57991,2243,38076,60532,49764,24969,17115,29150,49966,52358,27461,11196,45308,62044,34641,25024,18026,57699,37510,1188,21729,1307,34663,20027,63357,5846,52709,63029,64228,6598,56601,60564,26092,23729,13721,27329,10653,64118,30711,5881,48563,38008,62087,42833,63349,35610,6957,586,19134,10522,5278,13810,17600,41479,24309,22697,35079,30388,3416,52218,44160,17965,42750,62739,21070,64751,34174,22196,44250,58258,28674,3269,32402,3961,27182,18823,44006,36591,40682,51093,11811,35231,64762,47215,21329,6104,4108,8466,38849,34158,51459,20417,45210,16975,20967,8251,18080,49976,46986,401,29036,17382,65018,62538],"success":true}';
