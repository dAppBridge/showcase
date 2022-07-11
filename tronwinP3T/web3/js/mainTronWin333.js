

// mainneet
let contractAddress = "THpNP3KmiayD6H5F7XxNGH4phUGiEihC7n"; //TMv2iRzwxE43GiYENP4sBXR3JydsVCFhYk"; 
let vaultContractAddress = "TMuKHsocMNH2RdJ8BAaWP73BCDZp4S83rp"; 
let tokenContractAddress = "TFoeZ8RHJx9jWYihPBoTLFaE84u3oAPbeP"; 
let gamerFundsAddress = "TLTarFBwDvJ48RAqECnh5L3AvHniyiryfe";
let bankAddress = "TCWdewZW5FY3h5e1fKnnvSYKNmTv4HVNqw"; 



// shasta
/*
let contractAddress = "TXh2y45zwrN1atLQcR6HffDGfshTJNBy38"; 
let vaultContractAddress = "TXnD8c6qJ1FVRDsKYbZ9iuEzJGtASvfaYC"; 
let tokenContractAddress = "TS2RPTua28yM3UpDXrpYA51VskDos3sLRx"; 
let gamerFundsAddress = "TYMcBYDZaZWFoDL4nYSWEXyLpFzhcXyFhY"; // shasta
let bankAddress = "TUaSVbWcafigDdYVcEcJ9My4MT6eSbaUJB"; // shasta
*/
// dice TEUPSmYoBy9Qq8ZcogBy68K47VErtGo2ia
// daily TPeFYn4LYECHLiRzyHqP7WwgWQSAzMSNLD

let isDebug = false;


var maxTrx = 200000;
var NULL_ADDR = "410000000000000000000000000000000000000000";
var _referer = NULL_ADDR; // "0x0000000000000000000000000000000000000000";
var TOAST_HIDE_DELAY = 5000;
var TOAST_HIDE_TRANSITION = 'slide';
var clipboard;


var latestRoundID = 0;
var currentDay = 0;
var roundInfo = {};
var roundKeyPrice = null;
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
  tronWeb: null,
  isReadOnly: false,
  contracts: {},
  userWalletAddress: "",
  userWalletAddressShort: "",
  currentGame: '333',

  init: async function() {

    if(document.location.href.indexOf('cards2.htm')> 0) {
      App.currentGame = 'cards';

    }

    if(document.location.href.indexOf('casino') > 0) {
      App.currentGame = 'casino';
    }

    if(document.location.href.indexOf('scratch') > 0) {
      App.currentGame = 'scratchCards';
    }

    if(document.location.href.indexOf('bank') > 0) {
      App.currentGame = 'bank';
    }

    return await App.initWeb3();
  },


  initWeb3: async function() {
    
    if(window.tronWeb) {
      // need to check they are on the right network
      App.isReadonly = false;
      App.tronWeb = window.tronWeb;

      //console.log("TRX:", App.tronWeb.toSun(5));


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
    


    return App.initContract();
    
  },


  initContract: async function() {
  

    if(!App.isReadonly){

      if(!App.tronWeb.defaultAddress.hex) {

        connectionAttempts++;
        console.log(connectionAttempts);
        if(connectionAttempts> 30){
          var _msg = ""
          _msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
          _msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
          _msg += '<p style="font-size: 10pt;">Please ensure you are logged into your TRON Wallet and then refresh the page to try again.</p>';
          _msg += '<center><button type="button" onclick="reloadPage();" class="button bordered information " data-close>Retry</button></center>';

          showError(_msg, "Error connecting to Tron Network");
          return;
        } else {

          setTimeout(function(){
            App.initContract();
          },1000);

        }

      } else {
        App.contracts.TronWin = await App.tronWeb.contract(tronwinkey.abi, contractAddress);
        App.contracts.TronVault = await App.tronWeb.contract(tronwinvault.abi, vaultContractAddress);
        App.contracts.TronToken = await App.tronWeb.contract(tronwintoken.abi, tokenContractAddress);
        App.contracts.TronWinGamerFunds = await App.tronWeb.contract(tronwingamerfunds.abi, gamerFundsAddress);
        App.contracts.TronWinBank = await App.tronWeb.contract(tronwinbank.abi, bankAddress);

        getUserWalletAddress();

        return App.bindEvents();
      }

    } else {
        App.contracts.TronWin = await App.tronWeb.contract(tronwinkey.abi, contractAddress);
        App.contracts.TronVault = await App.tronWeb.contract(tronwinvault.abi, vaultContractAddress);
        App.contracts.TronToken = await App.tronWeb.contract(tronwintoken.abi, tokenContractAddress);
        App.contracts.TronWinGamerFunds = await App.tronWeb.contract(tronwingamerfunds.abi, gamerFundsAddress);
        App.contracts.TronWinBank = await App.tronWeb.contract(tronwinbank.abi, bankAddress);

      return App.bindEvents();

    }


  },
  bindEvents: function() {

    window.odometerOptions = {
      auto: false,
      format: '(ddd).dd', 
      duration: 2000
    };


    if(App.currentGame == 'scratchCards') {
      checkForSession(_startScratchCards);
    }


    if(App.currentGame == 'bank')
      updateBankGameStats(true);
    else
      updateGameStats(true);

    $('#instantWinCode1').prop('disabled', true);
    $('#instantWinCode2').prop('disabled', true);
    $('#instantWinCode3').prop('disabled', true);

    $('#depositFundsBtn').click(function(){
      $('#depositFundsDiv').foundation('close');
      doDeposit();
    });

    $('#gamerFundsDepositBtn').click(function(){

      if(!App.isReadonly)
        $('#depositFundsDiv').foundation('open');
    });

    $('#gamerFundsWithdrawBtn').click(function(){

      if(!App.isReadonly)
        $('#withdrawFundsDiv').foundation('open');
    });


    $('#cashoutBtn').click(function(){
      App.contracts.TronWin.cashOutTWNRate_afterROI().call().then(function(results){
        $('#roiCashOutRate').html(displayFromSUN(results,0));

        App.contracts.TronWin.cashOutTWNRate_early().call().then(function(results){
          $('#earlyCashOutRate').html(displayFromSUN(results,0));

          if(!App.isReadonly){
            App.contracts.TronWin.cashoutToTWNView().call().then(function(results){
              $('#cashOutTWN').html( roundNumber(results,4));
              $('#cashOutDiv').foundation('open');
            });
          } else {
            $('#cashOutDiv').foundation('open');
          }

        });

      });
      
    });
    $('#cashOutFullBtn').click(function(){
      $('#cashOutDiv').foundation('close');
      doCashOut();
    })

    $('#withdrawFundsBtn').click(function(){
      $('#withdrawFundsDiv').foundation('close');
      doGamerFundsWithdraw();
    });

    $('#freezeBtn').click(function(){

      App.contracts.TronToken.balanceOfFrozen(App.userWalletAddress).call().then(function(results){
        let _playerTokens = results.toNumber() / 1000000;

        $('#twnFrozen').html(_playerTokens);
        $('#playerFrozen').html(_playerTokens);

        
        
        App.contracts.TronToken.totalFrozen().call().then(function(results){
          let _totalFrozen  = results.toNumber() / 1000000
          $('#totalFrozen').html(_totalFrozen);
          if(_totalFrozen == 0) {
            $('#playerFrozenDivs').html('0');
          } else {
            if(tokenDayDetail.fundsAvail > 0) {
              $('#playerFrozenDivs').html(
                App.tronWeb.fromSun(
                  _playerTokens/_totalFrozen * (tokenDayDetail.fundsAvail * 0.8)
                    )
                );
            }            
          }

        });


      });



      $('#freezeTWNDiv').foundation('open');
    });



    $('#unfreezeBtn').click(function(){
      App.contracts.TronToken.balanceOfFrozen(App.userWalletAddress).call().then(function(results){
        let _playerTokens = results.toNumber() / 1000000;
        $('#playerFrozen2').html(_playerTokens);

        App.contracts.TronToken.totalFrozen().call().then(function(results){
          let _totalFrozen  = results.toNumber() / 1000000
          $('#totalFrozen2').html(_totalFrozen);

          if(tokenDayDetail.fundsAvail > 0) {
            $('#playerFrozenDivs2').html(
              App.tronWeb.fromSun(
                _playerTokens/_totalFrozen * (tokenDayDetail.fundsAvail * 0.8)
                  )
              );
          }
        });

      });



      $('#unfreezeTWNDiv').foundation('open');
    });



    $('#sessionLoginBtn').click(function(){
      doSessionLogin();
    });
    $('#sessionLoginBtn2').click(function(){
      doSessionLogin(_hideScratchCardsDiv);
    });

    $('#freezeNowBtn').click(function(){
      doFreeze();
    });
    $('#unfreezeNowBtn').click(function(){
      doUnFreeze();
    });
    

    $('#DiceBtn').click(function(){
      changeGame('dice');
      
    });

    $('#investBtn').click(function(){
      invest();
    });

    $('#buyBankBtn').click(function(){
      buyBANK();
    })

    $('#sellBankBtn').click(function(){
      sellBANK();
    })

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
    $('#withdrawBankBtn').click(function(){
      withdrawBankReturns();
    });

    $('#reinvestAll').click(function(){
      reinvestReturns();
    })

    $('#reinvestBankAll').click(function(){
      revinvestBankReturns();
    });

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



    

    console.log("INIT GOOGLE TRANS");
    new google.translate.TranslateElement({pageLanguage: "en, ru, zh-CN"}, 'google_translate_element');


    $('#flag-english').click(function(){
      updateLang('en');
      //setEng();
    });
    $('#flag-chinese').click(function(){
      updateLang('zh-CN');
    });
    $('#flag-russian').click(function(){
      updateLang('ru');
      //setRussian();
    });


    let _browserLang = navigator.language || navigator.userLanguage;

//console.log("_browserLang", _browserLang.toUpperCase());

    if(_browserLang.toUpperCase().indexOf('RU')>-1) {
      updateLang('ru');
      //setRussian();

    } else {
      var _lang = Cookies.get('lang')||"";
      console.log("LANG:", _lang);
      if(_lang.length > 0) {
        setTimeout(function(){
          //updateLang(_lang);
          if(_lang == "ru")
            updateLang('ru');
            //setRussian();
          else
            updateLang(_lang);

        },1000);
      }
    }


    
/*
    var _hasSeenWelcome = Cookies.get('hasSeenWelcome')||"";
    if(_hasSeenWelcome.length >0){

    } else {


      $('#welcomeDiv').foundation('open');
      Cookies.set('hasSeenWelcome', "1");  


    }
*/  

    $('#playNowBtn').click(function(){
      $('#welcomeDiv').foundation('close');
    });

    $('#whitePaperBtn').click(function(){
      document.location.href='https://tronwin.app/wp.pdf';
    });

    $(document).on("scroll", function(){

      if
        ($(document).scrollTop() > 100){
        $("#top-bar2").addClass("shrink");

        $('#headerImgFull').addClass('shrinkHeaderImg');
        $('#headerImgMobile').addClass('shrinkHeaderImg');

        $('#headerImgFull').attr('src','images/twn-logo-simple.png');
        $('#headerImgMobile').attr('src','images/twn-logo-simple.png');
        
      }
      else
      {
        $("#top-bar2").removeClass("shrink");
        $('#headerImgFull').attr('src','images/twn-logoNewFull.png');
        $('#headerImgMobile').attr('src','images/twn-logoNewMobile.png');
        $('#headerImgFull').removeClass('shrinkHeaderImg');
        $('#headerImgMobile').removeClass('shrinkHeaderImg');
      }
    });


    if(App.currentGame == 'scratchCards')
      setupRangeSlider();


    if(App.currentGame == 'bank')
      setupRangeSliderForBank();


  },

 
 
};

var isLangHardSet = false;

function setRussian() {
  if(!isLangHardSet){
    $('body').addClass('notranslate');
    isLangHardSet = true;
  }

  console.log("SETTING RUSSIAN LANG");
  //return;
  Cookies.set('lang', 'ru', { expires: 30 });


  if(App.currentGame == 'cards') {
    $.i18n.properties({ 
    name: 'bankers', 
    path: '/lang/', 
    mode: 'both', 
    debug: false,
    language: 'ru-RU', 
    callback: function() { 

      $("#headerTitle").html($.i18n.prop('headerTitle'));
      $("#headerIntro").html($.i18n.prop('headerIntro'));

      $("#bankersProfitLabel").html($.i18n.prop('bankersProfitLabel'));
      $("#divsTo333").html($.i18n.prop('divsTo333'));
      $("#introDiv").html($.i18n.prop('introDiv'));
      $("#bankersCard").html($.i18n.prop('bankersCard'));
      $("#bankersCardIntro").html($.i18n.prop('bankersCardIntro'));

      $("#silverCardTitle").html($.i18n.prop('silverCardTitle'));
      $("#silverCardSub").html($.i18n.prop('silverCardSub'));
      $("#silverPriceLabel").html($.i18n.prop('silverPriceLabel'));
      $("#silverHalfLifeLabel").html($.i18n.prop('silverHalfLifeLabel'));
      $("#silverOwnerLabel").html($.i18n.prop('silverOwnerLabel'));
      $("#buySilverCard").html($.i18n.prop('buySilverCard'));
      $("#goldCardTitle").html($.i18n.prop('goldCardTitle'));
      $("#goldCardSub").html($.i18n.prop('goldCardSub'));
      $("#goldPriceLabel").html($.i18n.prop('goldPriceLabel'));
      $("#goldHalfLifeLabel").html($.i18n.prop('goldHalfLifeLabel'));
      $("#goldOwnerLabel").html($.i18n.prop('goldOwnerLabel'));
      $("#buyGoldCard").html($.i18n.prop('buyGoldCard'));

      $("#platinumCardTitle").html($.i18n.prop('platinumCardTitle'));
      $("#platinumCardSub").html($.i18n.prop('platinumCardSub'));
      $("#platinumPriceLabel").html($.i18n.prop('platinumPriceLabel'));
      $("#platinumHalfLifeLabel").html($.i18n.prop('platinumHalfLifeLabel'));
      $("#platinumOwnerLabel").html($.i18n.prop('platinumOwnerLabel'));
      $("#buyPlatinumCard").html($.i18n.prop('buyPlatinumCard'));

      $("#yourProfile").html($.i18n.prop('yourProfile'));
      $("#yourAddress").html($.i18n.prop('yourAddress'));
      $("#vanityNameLabel").html($.i18n.prop('vanityName'));
      $("#totalInvestment").html($.i18n.prop('totalInvestment'));
      $("#totalWithdrawnLabel").html($.i18n.prop('totalWithdrawnLabel'));
      $("#yourDivs").html($.i18n.prop('yourDivs'));
      $("#yourWon").html($.i18n.prop('yourWon'));
      $("#yourRefs").html($.i18n.prop('yourRefs'));
      $("#yourTotalReturns").html($.i18n.prop('yourTotalReturns'));
      $("#withdrawBtn").html($.i18n.prop('withdrawBtn'));
      $("#reinvestAll").html($.i18n.prop('reinvestAll'));
      $("#yourRefURL").html($.i18n.prop('yourRefURL'));
      $("#refTxt").html($.i18n.prop('refTxt'));
      $("#copyRefMobile").html($.i18n.prop('copyRefMobile'));
      $("#currentRoundPotTitle").html($.i18n.prop('currentRoundPotTitle'));
      $("#roundLeader").html($.i18n.prop('roundLeader'));
      $("#potPrize").html($.i18n.prop('potPrize'));

      $("#lastInvestorTxt").html($.i18n.prop('lastInvestorTxt'));



      $("#investmentThisRound").html($.i18n.prop('investmentThisRound'));
      $("#totalThisRound").html($.i18n.prop('totalThisRound'));
      $("#eventsTitle").html($.i18n.prop('eventsTitle'));
      $("#titlePlayer").html($.i18n.prop('titlePlayer'));
      $("#titleActivity").html($.i18n.prop('titleActivity'));
      $("#titleTime").html($.i18n.prop('titleTime'));



      
      $("#howToPlay").html($.i18n.prop('howToPlay'));
      $("#howToPlayTxt").html($.i18n.prop('howToPlayTxt'));

      $("#howToPlay1Title").html($.i18n.prop('howToPlay1Title'));
      $("#howToPlay1p1").html($.i18n.prop('howToPlay1p1'));
      $("#howToPlay1p2").html($.i18n.prop('howToPlay1p2'));
      $("#howToPlay1p3").html($.i18n.prop('howToPlay1p3'));

      $("#howToPlay2Title").html($.i18n.prop('howToPlay2Title'));
      $("#howToPlay2p1").html($.i18n.prop('howToPlay2p1'));

      $("#howToPlay3Title").html($.i18n.prop('howToPlay3Title')); 
      $("#howToPlay3p1").html($.i18n.prop('howToPlay3p1')); 
      $("#howToPlay3p2").html($.i18n.prop('howToPlay3p2')); 
      $("#howToPlay3p3").html($.i18n.prop('howToPlay3p3')); 

      $("#investmentSplitTitle").html($.i18n.prop('investmentSplitTitle')); 
      $("#investmentSplitTxt").html($.i18n.prop('investmentSplitTxt')); 
      $("#invesmtentSplit1").html($.i18n.prop('invesmtentSplit1')); 
      $("#invesmtentSplit2").html($.i18n.prop('invesmtentSplit2')); 
      $("#invesmtentSplit3").html($.i18n.prop('invesmtentSplit3')); 
      $("#invesmtentSplit4").html($.i18n.prop('invesmtentSplit4')); 
      $("#invesmtentSplit5").html($.i18n.prop('invesmtentSplit5')); 
      $("#invesmtentSplit6").html($.i18n.prop('invesmtentSplit6')); 
      $('#socialTitle').html($.i18n.prop('socialTitle')); 
      $("#socialContent").html($.i18n.prop('socialContent')); 
    }
   });
  } else {
    $.i18n.properties({ 
      name: '333', 
      path: '/lang/', 
      mode: 'both', 
      debug: false,
      language: 'ru-RU', 
      callback: function() { 

        $("#headerTitle").html($.i18n.prop('headerTitle'));
        $("#headerIntro").html($.i18n.prop('headerIntro'));

        $("#grandPotCoundown").html($.i18n.prop('grandPotCoundown'));
        $("#currentLeader").html($.i18n.prop('currentLeader'));
        $("#contractFund").html($.i18n.prop('contractFund'));
        $("#totalDivsLabel").html($.i18n.prop('totalDivs'));
        $("#introDiv").html($.i18n.prop('introDiv'));

        $("#investHeader").html($.i18n.prop('investHeader'));
        $("#amount").html($.i18n.prop('amount'));
        $("#investBtn").html($.i18n.prop('investBtn'));

        $("#yourProfile").html($.i18n.prop('yourProfile'));
        $("#yourAddress").html($.i18n.prop('yourAddress'));
        $("#vanityName").html($.i18n.prop('vanityName'));
        $("#totalInvestment").html($.i18n.prop('totalInvestment'));
        $("#totalWithdrawnLabel").html($.i18n.prop('totalWithdrawnLabel'));
        $("#yourDivs").html($.i18n.prop('yourDivs'));
        $("#yourWon").html($.i18n.prop('yourWon'));
        $("#yourRefs").html($.i18n.prop('yourRefs'));
        $("#yourTotalReturns").html($.i18n.prop('yourTotalReturns'));
        $("#withdrawBtn").html($.i18n.prop('withdrawBtn'));
        $("#reinvestAll").html($.i18n.prop('reinvestAll'));
        $("#yourRefURL").html($.i18n.prop('yourRefURL'));
        $("#refTxt").html($.i18n.prop('refTxt'));
        $("#copyRefMobile").html($.i18n.prop('copyRefMobile'));
        $("#currentRoundPotTitle").html($.i18n.prop('currentRoundPotTitle'));
        $("#roundLeader").html($.i18n.prop('roundLeader'));
        $("#potPrize").html($.i18n.prop('potPrize'));

        $("#lastInvestorTxt").html($.i18n.prop('lastInvestorTxt'));



        $("#investmentThisRound").html($.i18n.prop('investmentThisRound'));
        $("#totalThisRound").html($.i18n.prop('totalThisRound'));
        $("#eventsTitle").html($.i18n.prop('eventsTitle'));
        $("#titlePlayer").html($.i18n.prop('titlePlayer'));
        $("#titleActivity").html($.i18n.prop('titleActivity'));
        $("#titleTime").html($.i18n.prop('titleTime'));



        
        $("#howToPlay").html($.i18n.prop('howToPlay'));
        $("#howToPlayTxt").html($.i18n.prop('howToPlayTxt'));

        $("#howToPlay1Title").html($.i18n.prop('howToPlay1Title'));
        $("#howToPlay1p1").html($.i18n.prop('howToPlay1p1'));
        $("#howToPlay1p2").html($.i18n.prop('howToPlay1p2'));
        $("#howToPlay1p3").html($.i18n.prop('howToPlay1p3'));

        $("#howToPlay2Title").html($.i18n.prop('howToPlay2Title'));
        $("#howToPlay2p1").html($.i18n.prop('howToPlay2p1'));

        $("#howToPlay3Title").html($.i18n.prop('howToPlay3Title')); 
        $("#howToPlay3p1").html($.i18n.prop('howToPlay3p1')); 
        $("#howToPlay3p2").html($.i18n.prop('howToPlay3p2')); 
        $("#howToPlay3p3").html($.i18n.prop('howToPlay3p3')); 

        $("#investmentSplitTitle").html($.i18n.prop('investmentSplitTitle')); 
        $("#investmentSplitTxt").html($.i18n.prop('investmentSplitTxt')); 
        $("#invesmtentSplit1").html($.i18n.prop('invesmtentSplit1')); 
        $("#invesmtentSplit2").html($.i18n.prop('invesmtentSplit2')); 
        $("#invesmtentSplit3").html($.i18n.prop('invesmtentSplit3')); 
        $("#invesmtentSplit4").html($.i18n.prop('invesmtentSplit4')); 
        $("#invesmtentSplit5").html($.i18n.prop('invesmtentSplit5')); 
        $("#invesmtentSplit6").html($.i18n.prop('invesmtentSplit6')); 
        $('#socialTitle').html($.i18n.prop('socialTitle')); 
        $("#socialContent").html($.i18n.prop('socialContent')); 
      }
     });    
  }
  
}

function setupRangeSliderForBank() {

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

        //console.log("PRICE SLIDER:", this.value);
        $('#bankAmount').val(this.value);
        bankSellChange();

      });
    });
  };

  rangeSlider2();



  var rangeSlider = function(){
    var slider = $('.range-slider3'),
        range = $('#rangeSelector'),
        value = $('#slider__value');
      
    slider.each(function(){

      value.each(function(){
        var value = $(this).prev().attr('value');
        
        $(this).html(value);
      });


      range.on('input', function(){

        //console.log("PRICE SLIDER:", this.value);
        //console.log( $('#withdrawAmount').val());
        $('#betAmount').val(this.value);
        bankBuyChange();
        
      });
    });
  };

  rangeSlider();
}

function setupRangeSlider() {

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

      //console.log("PRICE SLIDER:", this.value);
      $('#betAmount').val(this.value);

      

      });
    });
  };

  rangeSlider2();



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

      //console.log("PRICE SLIDER:", this.value);
        //console.log( $('#withdrawAmount').val());
        $('#withdrawAmount').val(this.value);
        //console.log( $('#withdrawAmount').val());
      });
    });
  };

  rangeSlider();

}

function setEng() {
  if(!isLangHardSet){
    $('body').addClass('notranslate');
    isLangHardSet = true;
  }

  console.log("SETTING ENG");
  //return;
  Cookies.set('lang', 'en', { expires: 30 });


  if(App.currentGame == 'cards') {
    $.i18n.properties({ 
    name: 'bankers', 
    path: '/lang/', 
    mode: 'both', 
    debug: false,
    language: '', 
    callback: function() { 

      $("#headerTitle").html($.i18n.prop('headerTitle'));
      $("#headerIntro").html($.i18n.prop('headerIntro'));

      $("#bankersProfitLabel").html($.i18n.prop('bankersProfitLabel'));
      $("#divsTo333").html($.i18n.prop('divsTo333'));
      $("#introDiv").html($.i18n.prop('introDiv'));
      $("#bankersCard").html($.i18n.prop('bankersCard'));
      $("#bankersCardIntro").html($.i18n.prop('bankersCardIntro'));

      $("#silverCardTitle").html($.i18n.prop('silverCardTitle'));
      $("#silverCardSub").html($.i18n.prop('silverCardSub'));
      $("#silverPriceLabel").html($.i18n.prop('silverPriceLabel'));
      $("#silverHalfLifeLabel").html($.i18n.prop('silverHalfLifeLabel'));
      $("#silverOwnerLabel").html($.i18n.prop('silverOwnerLabel'));
      $("#buySilverCard").html($.i18n.prop('buySilverCard'));
      $("#goldCardTitle").html($.i18n.prop('goldCardTitle'));
      $("#goldCardSub").html($.i18n.prop('goldCardSub'));
      $("#goldPriceLabel").html($.i18n.prop('goldPriceLabel'));
      $("#goldHalfLifeLabel").html($.i18n.prop('goldHalfLifeLabel'));
      $("#goldOwnerLabel").html($.i18n.prop('goldOwnerLabel'));
      $("#buyGoldCard").html($.i18n.prop('buyGoldCard'));

      $("#platinumCardTitle").html($.i18n.prop('platinumCardTitle'));
      $("#platinumCardSub").html($.i18n.prop('platinumCardSub'));
      $("#platinumPriceLabel").html($.i18n.prop('platinumPriceLabel'));
      $("#platinumHalfLifeLabel").html($.i18n.prop('platinumHalfLifeLabel'));
      $("#platinumOwnerLabel").html($.i18n.prop('platinumOwnerLabel'));
      $("#buyPlatinumCard").html($.i18n.prop('buyPlatinumCard'));

      $("#yourProfile").html($.i18n.prop('yourProfile'));
      $("#yourAddress").html($.i18n.prop('yourAddress'));
      $("#vanityName").html($.i18n.prop('vanityName'));
      $("#totalInvestment").html($.i18n.prop('totalInvestment'));
      $("#totalWithdrawnLabel").html($.i18n.prop('totalWithdrawnLabel'));
      $("#yourDivs").html($.i18n.prop('yourDivs'));
      $("#yourWon").html($.i18n.prop('yourWon'));
      $("#yourRefs").html($.i18n.prop('yourRefs'));
      $("#yourTotalReturns").html($.i18n.prop('yourTotalReturns'));
      $("#withdrawBtn").html($.i18n.prop('withdrawBtn'));
      $("#reinvestAll").html($.i18n.prop('reinvestAll'));
      $("#yourRefURL").html($.i18n.prop('yourRefURL'));
      $("#refTxt").html($.i18n.prop('refTxt'));
      $("#copyRefMobile").html($.i18n.prop('copyRefMobile'));
      $("#currentRoundPotTitle").html($.i18n.prop('currentRoundPotTitle'));
      $("#roundLeader").html($.i18n.prop('roundLeader'));
      $("#potPrize").html($.i18n.prop('potPrize'));

      $("#lastInvestorTxt").html($.i18n.prop('lastInvestorTxt'));



      $("#investmentThisRound").html($.i18n.prop('investmentThisRound'));
      $("#totalThisRound").html($.i18n.prop('totalThisRound'));
      $("#eventsTitle").html($.i18n.prop('eventsTitle'));
      $("#titlePlayer").html($.i18n.prop('titlePlayer'));
      $("#titleActivity").html($.i18n.prop('titleActivity'));
      $("#titleTime").html($.i18n.prop('titleTime'));



      
      $("#howToPlay").html($.i18n.prop('howToPlay'));
      $("#howToPlayTxt").html($.i18n.prop('howToPlayTxt'));

      $("#howToPlay1Title").html($.i18n.prop('howToPlay1Title'));
      $("#howToPlay1p1").html($.i18n.prop('howToPlay1p1'));
      $("#howToPlay1p2").html($.i18n.prop('howToPlay1p2'));
      $("#howToPlay1p3").html($.i18n.prop('howToPlay1p3'));

      $("#howToPlay2Title").html($.i18n.prop('howToPlay2Title'));
      $("#howToPlay2p1").html($.i18n.prop('howToPlay2p1'));

      $("#howToPlay3Title").html($.i18n.prop('howToPlay3Title')); 
      $("#howToPlay3p1").html($.i18n.prop('howToPlay3p1')); 
      $("#howToPlay3p2").html($.i18n.prop('howToPlay3p2')); 
      $("#howToPlay3p3").html($.i18n.prop('howToPlay3p3')); 

      $("#investmentSplitTitle").html($.i18n.prop('investmentSplitTitle')); 
      $("#investmentSplitTxt").html($.i18n.prop('investmentSplitTxt')); 
      $("#invesmtentSplit1").html($.i18n.prop('invesmtentSplit1')); 
      $("#invesmtentSplit2").html($.i18n.prop('invesmtentSplit2')); 
      $("#invesmtentSplit3").html($.i18n.prop('invesmtentSplit3')); 
      $("#invesmtentSplit4").html($.i18n.prop('invesmtentSplit4')); 
      $("#invesmtentSplit5").html($.i18n.prop('invesmtentSplit5')); 
      $("#invesmtentSplit6").html($.i18n.prop('invesmtentSplit6')); 
      $('#socialTitle').html($.i18n.prop('socialTitle')); 
      $("#socialContent").html($.i18n.prop('socialContent')); 
    }
   });
  } else {

    $.i18n.properties({ 
      name: '333', 
      path: '/lang/', 
      mode: 'both', 
      debug: false,
      language: '', 
      callback: function() { 

        $("#headerTitle").html($.i18n.prop('headerTitle'));
        $("#headerIntro").html($.i18n.prop('headerIntro'));

        $("#grandPotCoundown").html($.i18n.prop('grandPotCoundown'));
        $("#currentLeader").html($.i18n.prop('currentLeader'));
        $("#contractFund").html($.i18n.prop('contractFund'));
        $("#totalDivsLabel").html($.i18n.prop('totalDivs'));
        $("#introDiv").html($.i18n.prop('introDiv'));

        $("#investHeader").html($.i18n.prop('investHeader'));
        $("#amount").html($.i18n.prop('amount'));
        $("#investBtn").html($.i18n.prop('investBtn'));

        $("#yourProfile").html($.i18n.prop('yourProfile'));
        $("#yourAddress").html($.i18n.prop('yourAddress'));
        $("#vanityName").html($.i18n.prop('vanityName'));
        $("#totalInvestment").html($.i18n.prop('totalInvestment'));
        $("#totalWithdrawnLabel").html($.i18n.prop('totalWithdrawnLabel'));
        $("#yourDivs").html($.i18n.prop('yourDivs'));
        $("#yourWon").html($.i18n.prop('yourWon'));
        $("#yourRefs").html($.i18n.prop('yourRefs'));
        $("#yourTotalReturns").html($.i18n.prop('yourTotalReturns'));
        $("#withdrawBtn").html($.i18n.prop('withdrawBtn'));
        $("#reinvestAll").html($.i18n.prop('reinvestAll'));
        $("#yourRefURL").html($.i18n.prop('yourRefURL'));
        $("#refTxt").html($.i18n.prop('refTxt'));
        $("#copyRefMobile").html($.i18n.prop('copyRefMobile'));
        $("#currentRoundPotTitle").html($.i18n.prop('currentRoundPotTitle'));
        $("#roundLeader").html($.i18n.prop('roundLeader'));
        $("#potPrize").html($.i18n.prop('potPrize'));

        $("#lastInvestorTxt").html($.i18n.prop('lastInvestorTxt'));



        $("#investmentThisRound").html($.i18n.prop('investmentThisRound'));
        $("#totalThisRound").html($.i18n.prop('totalThisRound'));
        $("#eventsTitle").html($.i18n.prop('eventsTitle'));
        $("#titlePlayer").html($.i18n.prop('titlePlayer'));
        $("#titleActivity").html($.i18n.prop('titleActivity'));
        $("#titleTime").html($.i18n.prop('titleTime'));



        
        $("#howToPlay").html($.i18n.prop('howToPlay'));
        $("#howToPlayTxt").html($.i18n.prop('howToPlayTxt'));

        $("#howToPlay1Title").html($.i18n.prop('howToPlay1Title'));
        $("#howToPlay1p1").html($.i18n.prop('howToPlay1p1'));
        $("#howToPlay1p2").html($.i18n.prop('howToPlay1p2'));
        $("#howToPlay1p3").html($.i18n.prop('howToPlay1p3'));

        $("#howToPlay2Title").html($.i18n.prop('howToPlay2Title'));
        $("#howToPlay2p1").html($.i18n.prop('howToPlay2p1'));

        $("#howToPlay3Title").html($.i18n.prop('howToPlay3Title')); 
        $("#howToPlay3p1").html($.i18n.prop('howToPlay3p1')); 
        $("#howToPlay3p2").html($.i18n.prop('howToPlay3p2')); 
        $("#howToPlay3p3").html($.i18n.prop('howToPlay3p3')); 

        $("#investmentSplitTitle").html($.i18n.prop('investmentSplitTitle')); 
        $("#investmentSplitTxt").html($.i18n.prop('investmentSplitTxt')); 
        $("#invesmtentSplit1").html($.i18n.prop('invesmtentSplit1')); 
        $("#invesmtentSplit2").html($.i18n.prop('invesmtentSplit2')); 
        $("#invesmtentSplit3").html($.i18n.prop('invesmtentSplit3')); 
        $("#invesmtentSplit4").html($.i18n.prop('invesmtentSplit4')); 
        $("#invesmtentSplit5").html($.i18n.prop('invesmtentSplit5')); 
        $("#invesmtentSplit6").html($.i18n.prop('invesmtentSplit6')); 
        $('#socialTitle').html($.i18n.prop('socialTitle')); 
        $("#socialContent").html($.i18n.prop('socialContent')); 
      }
     });

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

  let _name = document.getElementById('vanityNameInput').value;
  
  console.log("_NAME", _name); 
  let _cost = App.tronWeb.toSun(100);


  // check if name exists...
  console.log(_name);
  App.contracts.TronVault.vanityToAddress(_name).call().then(function(results){
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
    _cost = cardsInfo._bankersSilverPrice.toNumber();
  }
  if(_type == 1) {
    _cost = cardsInfo._bankersGoldPrice.toNumber();
  }
  if(_type == 2) {
    _cost = cardsInfo._bankersPlatinumPrice.toNumber();
  }

  let hasError = false;
  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');

  App.contracts.TronWin.buyBankersCard(_type).send({
    from: App.userWalletAddress,
    callValue: _cost.toString()
  }).catch(function(err){
    hasError = true;
    showError("Unable to buy card - check you have enough TRX to complete the process!", "Error with TX");
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

}

function submitBuyVanity(_name){
  let _cost = App.tronWeb.toSun(100);
  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');



    // Working...
    App.contracts.TronVault.buyVanity(_name).send(
        {
          from: App.userWalletAddress,
          callValue: _cost.toString()
        }, function( err, results) {
          if(err) {
            showToast('Investment Cancelled','Your investment was cancelled and no $TRX was spent this time - please try again!', 'info');

          } else {
            let _msg = "<h4>Congratulations!</h4>"
            _msg += '<p style="font-size: 10pt;"><b>You now own <b>' + _name + '</b>!</b></p>';
            _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';
            
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

    App.userWalletAddress = App.tronWeb.defaultAddress.hex;


    // now check for vanity..
    App.contracts.TronVault.addressToVanity(App.userWalletAddress).call().then(function(results){
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

    App.contracts.TronVault.vanityToAddress(_referer).call().then(function(results){
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
  }
}


function bankSellChange() {
  $('#bankSellAmnt').html(
    displayFromSUN(
        parseFloat(
          $('#bankAmount').val()
        )
        *
        parseFloat(
          roundInfo._sellPrice
        )
      ,2)

    );
}

function bankBuyChange() {
  $('#bankBuyAmnt').html(  roundNumber(parseFloat(parseInt($('#betAmount').val()) * 1000000) / parseFloat(roundInfo._buyPrice),2) );
}



var bankPlayerTotalReturns = 0;
function updateBankGameStats(isInit){
  App.contracts.TronWinBank.latestRoundID().call().then(function(results){
    let _newRoundID = parseInt(results.toString());
    if(_newRoundID > latestRoundID ) {
      latestRoundID = _newRoundID;
      roundEnded = false;      
    } 


    App.contracts.TronWinBank.roundInfoInGame(latestRoundID).call().then(function(results){

      roundInfo = results;

      if(!App.isReadonly){
          

          if(isMobile)
            $('#playerAddress').html(displayWalletAddress(App.userWalletAddress).substring(0,20));
          else
            $('#playerAddress').html(displayWalletAddress(App.userWalletAddress));

          App.contracts.TronWinBank.getRoundPlayersRoundInvested(latestRoundID, App.userWalletAddress).call().then(function(results){
            $('#roundInvested').html(displayFromSUN(results.toString(),2));
          });

          App.contracts.TronWinBank.playerInfo(App.userWalletAddress).call().then(function(results){
            $('#yourBANK').html( displayFromSUN(results.bankHolding.toString(),2));
            $('#totalBank').html( displayFromSUN(results.bankHolding.toString(),2));


            

            $('#totalBankTRX').html(
              displayFromSUN(
                  (results.bankHolding.toNumber() * 
                  roundInfo._sellPrice.toNumber()) / 1000000
                  ,2)
                );

            $('#playerDivs').html( displayFromSUN(results.divs,2));
            $('#playerRefReturns').html(displayFromSUN(results.refs,2));
            $('#playerTotal').html(displayFromSUN(
                parseInt(results.divs.toString()) + parseInt(results.refs.toString()), 2
              ));


            bankPlayerTotalReturns = parseInt(results.divs.toString()) + parseInt(results.refs.toString());

            //$('#yourDIVS').html( displayFromSUN(results.divs.toNumber() + results.refs.toNumber() ,2));


            $('#rangeSliderMax2').html(displayFromSUN(results.bankHolding,2) + " BANK");
            $('#rangeSelector2').attr('max', displayFromSUN(results.bankHolding,0));
            $('#bankAmount').attr('max', displayFromSUN(results.bankHolding,0));
          });

          App.tronWeb.trx.getBalance(App.userWalletAddress).then(function(results){

            $('#rangeSliderMax').html(displayFromSUN(results,2) + " TRX"); //88425976594
            $('#rangeSelector').attr('max', displayFromSUN(results,0));
            $('#betAmount').attr('max', displayFromSUN(results.bankHolding,0));

          });

          App.contracts.TronToken.fullBalanceOf(App.userWalletAddress).call().then(function(results){
            //console.log("TOKENS:", results, results.toString());
            $('#twnTotal').html(results.toNumber() / 1000000);

            App.contracts.TronToken.balanceOfFrozen(App.userWalletAddress).call().then(function(results){
              let _playerTokens = results.toNumber() / 1000000;
              $('#twnFrozen').html(_playerTokens);
              $('#playerFrozen').html(_playerTokens);
            });

          });

          App.contracts.TronWinBank.totalSupply().call().then(function(results){
            $('#bankSupply').html(displayFromSUN(results,4));
          });

      }

      populateBankRoundInfo();

      if(isInit)
        bankBuyChange();

      


      App.contracts.TronToken.tokensInPlay().call().then(function(results){
        $('#totalMined').html(displayFromSUN(results.toString(),2));
      });

      App.contracts.TronVault.tokenDay().call().then(function(results){
        let _tokenDay = parseInt(results.toString());
        App.contracts.TronVault.getTokenDayDetail(_tokenDay).call().then(function(results){
          /*
          int256      fundsAvail,
          bool        processed,
          uint256     startTS
          */
          tokenDayDetail = results;
          tokenDayDetail.endTS = parseInt(tokenDayDetail.startTS) + 86400;
          if(tokenDayDetail.fundsAvail > 0)
            $('#tokenDivs').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail * 0.8)); // split 50/50 to token holders and 333 game
          else
            $('#tokenDivs').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail));

          if(tokenDayDetail.fundsAvail > 0)
            $('#tokenDivs2').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail * 0.8)); // split 50/50 to token holders and 333 game
          else
            $('#tokenDivs2').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail));
          

          updateBankClocks();

        });
      });


      if(isInit){
        // then events
        ///getPlayersInRound();
        getInitEvents();
      }

      setTimeout(function(){
        updateBankGameStats();
      }, 1000);

    });


    //console.log("ROUND:", latestRoundID);

  }).catch(function(err){
    setTimeout(function(){
      updateBankGameStats();
    }, 1000);
  });
}


function updateGameStats(isInit) {
  console.log("UPDATING..", App.gameType);

  App.contracts.TronWin.latestRoundID().call().then(function(results){
    let _newRoundID = parseInt(results.toString());
    if(_newRoundID > latestRoundID ) {
      latestRoundID = _newRoundID;
      roundEnded = false;
      //if(!isInit)
        //getPlayersInRound();
      
    } 

    if(App.currentGame == '333') {
      getRoundInfo(updateClocks);
    } else {
      if(App.currentGame == 'scratchCards') {
        App.contracts.TronWinGamerFunds.gamerFundsAvail(App.userWalletAddress).call().then(function(results){

          let _totalBalance = parseInt(results.toString());
          $('#gamerCredit').html(displayFromSUN(_totalBalance));


          $('#gamerCreditBalance').html(displayFromSUN(_totalBalance,2));
          $('#withdrawAmount').attr('max', displayFromSUN(_totalBalance));

          $('#rangeSelector').attr('max', displayFromSUN(_totalBalance,2));
          $('#rangeSliderMax').html(displayFromSUN(_totalBalance,2) + " TRX");



        });


      } else {
        getCardsInfo(updateClocks);
      }
    }
    

    if(App.currentGame == 'cards') {
      //bankersProfit
      App.contracts.TronWin.totalBankersProfit().call().then(function(results){
        $('#bankersProfit').html(App.tronWeb.fromSun(results));
      });

    } else {
      App.contracts.TronVault.getGameFund().call().then(function(results){
      //App.contracts.TronWin.gameFund().call().then(function(results){
        updateInnerHTML('gameFund', App.tronWeb.fromSun(results));
      }).catch(function(e){

      });

    }

    App.contracts.TronWin.MIN_JACKPOT_INVESTMENT().call().then(function(results){
      if(App.currentGame == 'cards') {}else {
        $('#jackpotMin5').html(displayFromSUN(results.toString(),0));  
      }
      
      $('#jackpotMin4').html(displayFromSUN(results.toString(),0));
      $('#jackpotMin3').html(displayFromSUN(results.toString(),0));
      $('#jackpotMin2').html(displayFromSUN(results.toString(),0));
      $('#jackpotMin').html(displayFromSUN(results.toString(),0));
    });

/*
    App.contracts.TronWin.getTotalDivs().call().then(function(results){
      if(results)
        $('#totalDivs').html(App.tronWeb.fromSun(results));
    }).catch(function(e){
      console.log(e);
    });
*/

    App.contracts.TronToken.tokensInPlay().call().then(function(results){
      $('#totalMined').html(displayFromSUN(results.toString(),2));
    });

    App.contracts.TronVault.tokenDay().call().then(function(results){
      let _tokenDay = parseInt(results.toString());
      App.contracts.TronVault.getTokenDayDetail(_tokenDay).call().then(function(results){
        /*
        int256      fundsAvail,
        bool        processed,
        uint256     startTS
        */
        tokenDayDetail = results;
        tokenDayDetail.endTS = parseInt(tokenDayDetail.startTS) + 86400;
        if(tokenDayDetail.fundsAvail > 0)
          $('#tokenDivs').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail * 0.8)); // split 50/50 to token holders and 333 game
        else
          $('#tokenDivs').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail));

        if(tokenDayDetail.fundsAvail > 0)
          $('#tokenDivs2').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail * 0.8)); // split 50/50 to token holders and 333 game
        else
          $('#tokenDivs2').html(App.tronWeb.fromSun(tokenDayDetail.fundsAvail));
        
      });
    });
    



    // player info
    //console.log("userWalletAddress:", App.userWalletAddress);

    if(App.currentGame == 'casino' || App.currentGame == 'scratchCards') {
      if(!App.isReadonly){
        App.tronWeb.trx.getBalance(App.userWalletAddress).then(function(results){
          $('#balance').html(displayFromSUN(results,2));
          $('#rangeSelector2').attr('max', displayFromSUN(results,0)-1);
          $('#betAmount').attr('max', displayFromSUN(results,0)-1);
          $('#rangeSliderMax2').html(displayFromSUN(results,0)-1 + " TRX");
        });
      }
    } else {


      if(!App.isReadonly && App.tronWeb.isAddress(App.userWalletAddress)){

        App.contracts.TronWin.investorInfo(App.userWalletAddress).call().then(function(results){
          playerInfo = results;
        //  console.log("playerInfo", playerInfo);
          populatePlayerInfo();
        });


        App.contracts.TronToken.fullBalanceOf(App.userWalletAddress).call().then(function(results){
          //console.log("TOKENS:", results, results.toString());
          $('#twnTotal').html(results.toNumber() / 1000000);

          App.contracts.TronToken.balanceOfFrozen(App.userWalletAddress).call().then(function(results){
            let _playerTokens = results.toNumber() / 1000000;
            $('#twnFrozen').html(_playerTokens);
            $('#playerFrozen').html(_playerTokens);
          });

        });


      }
    }


    if(isInit){
      // then events
      ///getPlayersInRound();
      getInitEvents();
    }




    setTimeout(function(){
      updateGameStats();
    }, 1000);

  }).catch(function(e){
    setTimeout(function(){
      updateGameStats();
    }, 1000);    
  });



}






var dailyActivePlayerAddress = [];

function getDayScore(_pos) {
  if(App.tronWeb.isAddress(solidityAddrToTronAddr(dailyActivePlayerAddress[_pos]))){
    App.contracts.TronWin.day_dayBonusKeysBought(currentDay, dailyActivePlayerAddress[_pos]).call().then(function(res){

      currentDayScores.push({
        player: dailyActivePlayerAddress[_pos],
        keys: parseInt(res.toString())
      });

      _pos++;
      if(_pos < dailyActivePlayerAddress.length){
        getDayScore(_pos);
      } else {
        //console.log("DAY SCORE:", currentDayScores);
        updateLeaderboard();
      }

    });
  } else {
    console.log("Day Post Not Valid:", dailyActivePlayerAddress[_pos]);
    //updateLeaderboard();

  }
}

function solidityAddrToTronAddr(_in) {
  return "41" + _in.substring(2);
}
function updatePlayerDailyInfo() {
  currentDayScores = [];

  App.contracts.TronWin.day_dayBonusActivePlayers(currentDay).call().then(function(results){
    
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


function updateLeaderboard() {
  console.log("updateLeaderboard", currentDayScores.length);
  $('#leaderboardTable tbody').empty();

  let _sortedPlayers = playerStatsSortedByKeys();

  let _playersProcessed = [];

  if(_sortedPlayers.length == 0)
    return;

  for(let i=0; i< _sortedPlayers.length; i++) {

    _playersProcessed.push(formatAddr(_sortedPlayers[i].addr).toUpperCase());

    let _row = '<tr class="standardEventRow">';
    if(isMobile)
      _row += '<td>' + displayWalletAddress(_sortedPlayers[i].addr).substring(0,15) + '</td>';
    else
      _row += '<td>' + displayWalletAddress(_sortedPlayers[i].addr) + '</td>';

    _row += '<td>' + _sortedPlayers[i].keys.toString() + '</td>';


    let _dayKeys = 0;
    for(let c=0; c< currentDayScores.length; c++) {
      //console.log("CHECKING:", formatAddr(currentDayScores[c].player).toUpperCase(), formatAddr(_sortedPlayers[i].addr).toUpperCase());

      if(formatAddr(currentDayScores[c].player).toUpperCase() == formatAddr(_sortedPlayers[i].addr).toUpperCase()) {
        _dayKeys = currentDayScores[c].keys;
        break    
      }
    }
    _row += '<td>' + _dayKeys + '</td>';

    _row += '<td>' + (_sortedPlayers[i].keys / roundInfo.keys * 100).toFixed(3) + '%</td>';


    if(_dayKeys == 0){
      _row += "<td>--</td>";
    } else {
      _row += '<td>' +  App.tronWeb.fromSun( 
                          dayBonusAvail.toString() * (_dayKeys / dayBonuses.keysBoughtTotals * 100) / 100
                          ) + ' $TRX</td>'; 
    }

    _row += '</tr>';
    $('#leaderboardTable tbody').append(_row);

  }

  // check for any daily players without keys...
  for(let c=0; c<currentDayScores.length;c++) {
    if(_playersProcessed.includes( formatAddr(currentDayScores[c].player).toUpperCase())){

    } else {
      //console.log("Daily Player Only...");
      let _row = '<tr class="standardEventRow">';
      if(isMobile)
        _row += '<td>' + displayWalletAddress(currentDayScores[c].player).substring(0,15) + '</td>';
      else
        _row += '<td>' + displayWalletAddress(currentDayScores[c].player) + '</td>';

      _row += '<td>0</td>';


      _row += '<td>' + currentDayScores[c].keys + '</td>';

      _row += '<td>--</td>';

      _row += '<td>' +  App.tronWeb.fromSun( 
                          dayBonusAvail.toString() * (currentDayScores[c].keys / dayBonuses.keysBoughtTotals * 100) / 100
                          ) + ' $TRX</td>'; 

      _row += '</tr>';
      $('#leaderboardTable tbody').append(_row);

    }
  }


}




function getInitEvents() {

  if(App.currentGame == 'scratchCards') {

    App.tronWeb.getEventResult("TUU2tzyNe6wMfTwgod3UhpLjHnjPht86N7", {
      eventName:'gameResult',
      size: 100,
      page: 1
    }).then(resultsOld => {

        //$("time.timeago").timeago();
        //console.log("OLD:", resultsOld);

        App.tronWeb.getEventResult(gamerFundsAddress, {
          eventName:'gameResult',
          size: 100,
          page: 1
        }).then(results => {
            
            //console.log("NEW:", results);
            
            for(let i=0; i< 100; i++){
              processEvent(results[i], true);
            }
            for(let i=0; i< 100; i++){
              processEvent(resultsOld[i], true);
            }
            $("time.timeago").timeago();
        });

    });



    checkEvents();

  } else {

    if(App.currentGame == "bank") {

      App.tronWeb.getEventResult(bankAddress, {
        eventName:'Action',
        size: 100,
        page: 1
      }).then(results => {
          for(let i=0; i< 100; i++){
            processEvent(results[i], true);
          }
          $("time.timeago").timeago();
      });


      if(1==1 || isMobile){
        checkEvents();
      } else {
        App.contracts.TronWinBank.Action().watch((err, event) => {
          if (err) return console.error('Error with "method" event:', err);
          if (event) { 
            processEvent(event, false, false);
          }
        });
      }


    } else {


      App.tronWeb.getEventResult("TMv2iRzwxE43GiYENP4sBXR3JydsVCFhYk", {
        eventName:'Action',
        size: 100,
        page: 1
      }).then(resultsOLD => {




          App.tronWeb.getEventResult(contractAddress, {
            eventName:'Action',
            size: 100,
            page: 1
          }).then(results => {
              for(let i=0; i< 100; i++){
                processEvent(results[i], true);
              }
              for(let i=0; i< 100; i++){
                processEvent(resultsOLD[i], true);
              }
              $("time.timeago").timeago();
          });
      });





      if(1==1 || isMobile){
        checkEvents();
      } else {
        App.contracts.TronWin.Action().watch((err, event) => {
          if (err) return console.error('Error with "method" event:', err);
          if (event) { 
            processEvent(event, false, false);
          }
        });
      }


    }



  }
}




var startTimestamp = new Date().getTime();
var initEvents = [];
var lastTimeStamp = 0;
let txSeen = [];
let _fingerprint = "";

var api_url;
if(isDebug)
  api_url = "api.shasta.trongrid.io";
else
  api_url = "api.trongrid.io";

function checkEvents() {
  //console.log("CHECK EVENTS:");
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

  let _url = "https://" + api_url + "/event/contract/";
  if(App.currentGame == 'scratchCards')
    _url += gamerFundsAddress + "/" 
  else {
    if(App.currentGame == "bank")
      _url += bankAddress + "/"
    else
      _url += contractAddress + "/";
  }

  _url += name + "?size=";
  _url += "200&page=" + page.toString();

  if(_sinceTimestamp)
    _url += "&sinceTimestamp=" + _sinceTimestamp;

  _url += "&previousLastEventFingerprint=" + _fingerprint;
  _url += "&sort=block_timestamp"
  //console.log(_url);

  let _fpSet = false;
  await $.getJSON( _url, function( _data ) {

    //console.log("data:", _data);

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
            if(App.currentGame == 'bank')
              dataItem.result.player = "41" + _data[c].result.player.substring(2);  
            else
              dataItem.result.from = "41" + _data[c].result.from.substring(2);

            dataItem.transaction = _data[c].transaction_id;
          } else {
            if(_data[c].event_name == "gameResult") {
              dataItem.result  = _data[c].result;
              dataItem.result.player = "41" + _data[c].result.player.substring(2);
              dataItem.transaction = _data[c].transaction_id;
            }
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

  //console.log("NEW EVENT:", event);

  let eventRow = '';
  let hasEventRow = false;
  let _logDate;// = new Date(parseInt(event.result.timestamp)*1000).toISOString();



  if( (isInit||isMobileEventsCheck) && event.blockNumber > highestBlocknumber)
    highestBlocknumber = event.block;



  if(event.name == "gameResult") {
    // scratch card game results...
    //console.log(event);
    _logDate = new Date(parseInt(event.timestamp)).toISOString();

      eventRow = '<tr class="standardEventRow">';
      


      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.player).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.player) + '</td>';

      if(parseInt(event.result.game_id) == 1) {
        eventRow += '<td>Magic Lamp: ';
      } else {
        if(parseInt(event.result.game_id) == 2) {
          eventRow += '<td>Pirates!: ';
        } else {
          if(parseInt(event.result.game_id) == 3) {
            eventRow += '<td>Mine: ';
          } else {
            if(parseInt(event.result.game_id) == 4) {
              eventRow += '<td>Slots: ';
            } else {
              eventRow += '<td>&nbsp;';  
            }
            
          }
        }

      }

      
      // show result icons here...
      //console.log(event.result.results.split(",").length);
      let _resultIcons = event.result.results.replace(/\s/g, '').split(",")
      for(let c=0; c< _resultIcons.length;c++) {
        //scratch_card_cell_icon
        eventRow += '<img class="scratch_card_cell_icon_sm scratch_card_cell_icon_' + event.result.game_id + ' icon_' + _resultIcons[c] + '_half2" src="/images/sp.png" style="border:0px; width:16px; height: 16px; background-size: 16px; background-color: rgba(0,0,0,0);"/>';
        
      }

      if(parseInt(event.result.winAmnt) > 0)
        eventRow += ' <b>Winning: ' + App.tronWeb.fromSun(event.result.winAmnt) + ' TRX!</b>'


      eventRow += '</td>';

      hasEventRow = true;

      if(!isInit){
        if(parseInt(event.result.winAmnt) > 0)
          showToast("Winner!", displayWalletAddress(event.result.player).substring(0,10) + ' has WON: ' + App.tronWeb.fromSun(event.result.winAmnt) + ' TRX!', 'info');


      }


  }

  if(event.name == "Action"){

    if(App.currentGame == 'bank')
      event.result.from = event.result.player;

    _logDate = new Date(parseInt(event.result.timestamp)*1000).toISOString();

    if(event.result.event_type == 99){
      console.log("NEW EVENT:", event);

      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      eventRow += '<td>Debug Dist: ' + App.tronWeb.fromSun(event.result.amnt) + 
      '  |' + event.result.instant_guess + ':' + event.result.instant_result 
      + ':' + event.result.instant_prize + ':' + event.result.bonus_guess + '</td>';

      hasEventRow = true;

    }

    if(event.result.event_type == 0 || event.result.event_type == 1) {
      // keys issued

      // check for win row...
      let _winRow = false;



      eventRow = '<tr class="standardEventRow">';
      

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      if(event.result.event_type == 0)
        eventRow += '<td><b>' + App.tronWeb.fromSun(event.result.amnt) + ' TRX</b> New Investment'
      else
        eventRow += '<td><b>' + App.tronWeb.fromSun(event.result.amnt) + ' TRX</b> New ReInvestment'

      eventRow += '</td>';

      hasEventRow = true;

      if(!isInit){
        if(event.result.event_type == 0)
          showToast("New Investment", displayWalletAddress(event.result.from).substring(0,10) + ' has Invested: ' + App.tronWeb.fromSun(event.result.amnt) + ' TRX!', 'info');
        else
         showToast("ReInvestment", displayWalletAddress(event.result.from).substring(0,10) + ' has ReInvested: ' + App.tronWeb.fromSun(event.result.amnt) + ' TRX!', 'info');

      }


    }


    if(event.result.event_type == 4) {
      if(App.currentGame == 'bank') {
        // is referral paid
        eventRow = '<tr class="standardEventRow">';

        if(isMobile)
          eventRow += '<td>' + displayWalletAddress(event.result.to).substring(0,15) + '</td>';
        else
          eventRow += '<td>' + displayWalletAddress(event.result.to) + '</td>';

        eventRow += '<td>Earned Referral Bonus: ' + App.tronWeb.fromSun(event.result.amnt) + '</td>';

        hasEventRow = true;

        if(!isInit)
          showToast('Referral Bonus Earned', displayWalletAddress(event.result.to).substring(0,15) + ' just earned a referral bonus of: <b>' + App.tronWeb.fromSun(event.result.amnt) + '</b>', 'info');
      } else {
        // is vanity purchase
        eventRow = '<tr class="standardEventRow">';

        if(isMobile)
          eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
        else
          eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

        eventRow += '<td>Vanity Name Purchased: ' + event.result.data + '</td>';

        hasEventRow = true;

        if(!isInit)
          showToast('New Vanity Name', 'New Vanity Name Purchased: <b>' + event.result.data + '</b>', 'info');


        updateVanityAddress(event.result.from, event.result.data)

      }
      
    }

    if(event.result.event_type == 7) {
      // is silver card
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.to).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.to) + '</td>';

      eventRow += '<td>Silver Bankers Card Bought for ' + displayFromSUN(event.result.amnt,2) + ' TRX</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Silver Card Bought', 'Silver Bankers Card has been Bought for  <b>' +  displayFromSUN(event.result.amnt,2) + ' TRX</b>', 'info'); 
    }

    if(event.result.event_type == 8) {
      // is gold card
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.to).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.to) + '</td>';

      eventRow += '<td>Gold Bankers Card Bought for ' + displayFromSUN(event.result.amnt,2) + ' TRX</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Gold Card Bought', 'Gold Bankers Card has been Bought for  <b>' +  displayFromSUN(event.result.amnt,2) + ' TRX</b>', 'info'); 
    }

    if(event.result.event_type == 9) {
      // is plat card
      eventRow = '<tr class="standardEventRow">';

      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.to).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.to) + '</td>';

      eventRow += '<td>Platinum Bankers Card Bought for ' + displayFromSUN(event.result.amnt,2) + ' TRX</td>';

      hasEventRow = true;

      if(!isInit)
        showToast('Platinum Card Bought', 'Platinum Bankers Card has been Bought for  <b>' +  displayFromSUN(event.result.amnt,2) + '</b> TRX', 'info'); 
    }

    if(event.result.event_type == 5) {
      // is referral paid
      console.log("REF EVENT:", event);
      if(event.result.amnt == 0) {

      } else {
        eventRow = '<tr class="standardEventRow">';

        if(isMobile)
          eventRow += '<td>' + displayWalletAddress(event.result.to).substring(0,15) + '</td>';
        else
          eventRow += '<td>' + displayWalletAddress(event.result.to) + '</td>';

        eventRow += '<td>Earned Referral Bonus: ' + App.tronWeb.fromSun(event.result.amnt) + '</td>';

        hasEventRow = true;

        if(!isInit)
          showToast('Referral Bonus Earned', displayWalletAddress(event.result.to).substring(0,15) + ' just earned a referral bonus of: <b>' + App.tronWeb.fromSun(event.result.amnt) + '</b>', 'info');        
      }

    }

    if(event.result.event_type == 3) {
      // tax dist
      //if(!isInit)
      //  showToast("Divs Distributed!", App.tronWeb.fromSun(event.result.amnt) + " $TRX has just been distributed to all players!", 'success');
    }


    if(event.result.event_type == 2){
      // vault won!
      eventRow = '<tr class="winEventRow">';
      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      if(App.currentGame == 'bank') {
        eventRow += '<td><strong>Top Hourly Prize WON: ' + displayFromSUN(event.result.amnt, 2) + ' $BANK + ' + displayFromSUN(event.result.amnt2,2) + ' TRX</strong></td>';
      } else
        eventRow += '<td><strong>Top Hourly Prize WON: ' + App.tronWeb.fromSun(event.result.amnt * 0.4) + ' $TRX</strong></td>';

      hasEventRow = true;

      if(!isInit) {
        if(App.currentGame == 'bank')
          showToast('Top Hourly Prize WON!', displayWalletAddress(event.result.from).substring(0,10) +  ' has won the Top Houlry Prize of: <b>' + displayFromSUN(event.result.amnt,2) + ' $BANK + ' + displayFromSUN(event.result.amnt2,2) + ' TRX</b>', 'info');
        else
          showToast('Top Hourly Prize WON!', displayWalletAddress(event.result.from).substring(0,10) +  ' has won the Top Houlry Prize of: <b>' + App.tronWeb.fromSun(event.result.amnt * 0.4) + ' + 100 TWN</b>', 'info');
      }
    }

    if(event.result.event_type == 10){
      // vault won!
      eventRow = '<tr class="winEventRow">';
      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      if(App.currentGame == 'bank')
        eventRow += '<td><strong>Hourly Top Investor Prize WON: ' + displayFromSUN(event.result.amnt,2) + ' $BANK + ' + displayFromSUN(event.result.amnt2,2) + ' TRX</strong></td>';
      else
        eventRow += '<td><strong>Hourly Top Investor Prize WON: ' + App.tronWeb.fromSun(event.result.amnt) + ' $TRX</strong></td>';

      hasEventRow = true;

      if(!isInit){
        if(App.currentGame == 'bank')
          showToast('Hourly Top Investor Prize WON!', displayWalletAddress(event.result.from).substring(0,10) +  ' has won the Top Houlry Prize of: <b>' + displayFromSUN(event.result.amnt,2) + ' $BANK + ' + displayFromSUN(event.result.amnt2,2) + ' TRX</b>', 'info');
        else
          showToast('Hourly Top Investor Prize WON!', displayWalletAddress(event.result.from).substring(0,10) +  ' has won the Top Houlry Prize of: <b>' + App.tronWeb.fromSun(event.result.amnt) + ' + 50 TWN</b>', 'info');
      }
    }

    if(event.result.event_type == 11){
      // vault won!
      eventRow = '<tr class="winEventRow">';
      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      if(App.currentGame == 'bank')
        eventRow += '<td><strong>Hourly Random Winner Prize WON: ' + displayFromSUN(event.result.amnt,2) + ' $BANK + ' + displayFromSUN(event.result.amnt2,2) + ' TRX</strong></td>';
      else
        eventRow += '<td><strong>Hourly Random Winner Prize WON: ' + App.tronWeb.fromSun(event.result.amnt) + ' $TRX</strong></td>';

      hasEventRow = true;

      if(!isInit){
        if(App.currentGame == 'bank')
          showToast('Hourly Random Winner Prize WON!', displayWalletAddress(event.result.from).substring(0,10) +  ' has won the Top Houlry Prize of: <b>' + displayFromSUN(event.result.amnt,2) + ' $BANK + ' + displayFromSUN(event.result.amnt2,2) + ' TRX</b>', 'info');
        else
          showToast('Hourly Random Winner Prize WON!', displayWalletAddress(event.result.from).substring(0,10) +  ' has won the Top Houlry Prize of: <b>' + App.tronWeb.fromSun(event.result.amnt) + ' + 10 TWN</b>', 'info');
      }
    }

    if(event.result.event_type == 6){
      // new leader
      eventRow = '<tr class="winEventRow">';
      if(isMobile)
        eventRow += '<td>' + displayWalletAddress(event.result.from).substring(0,15) + '</td>';
      else
        eventRow += '<td>' + displayWalletAddress(event.result.from) + '</td>';

      eventRow += '<td><strong>Now leading the round - and set to win the top Hourly Prize!</strong></td>';

      hasEventRow = true;

      if(!isInit)
        showToast('New Round Leader!', displayWalletAddress(event.result.from).substring(0,10) +  ' is now leading the round!', 'info');
    }

  } else {



  }


  if(hasEventRow){
    eventRow += '<td><time class="timeago" datetime="' + _logDate + '">' + _logDate + '</time></td></tr>';

    if(!isInit){
      $('#eventsTable tbody').prepend(eventRow);
      $("time.timeago").timeago();
    } else {
      $('#eventsTable tbody').append(eventRow);
    }
  }


}




function getRoundInfo(_callback){
  App.contracts.TronWin.roundInfoInGame(latestRoundID).call().then(function(results){

    roundInfo = results;

    if(!App.isReadonly){
      App.contracts.TronWin.latestRoundID().call().then(function(results){
        let _latestRoundID = parseInt(results.toString());
        App.contracts.TronWin.getRoundPlayersRoundInvested(_latestRoundID, App.userWalletAddress).call().then(function(results){
          $('#roundInvested').html(displayFromSUN(results.toString(),2));
        });
      });

      App.contracts.TronWin.totalTRXInvested().call().then(function(results){
        $('#currentTRXinvested').html(displayFromSUN(results,2));
      });

    }

    populateRoundInfo();

    if(_callback)
      _callback();

  });
}

function getBankRoundInfo(_callback) {
  App.contracts.TronWinBank.roundInfoInGame(latestRoundID).call().then(function(results){

    roundInfo = results;


    populateBankRoundInfo();



    if(_callback && roundEnded)
      _callback();

  });
}

var cardsInfo = {};
function getCardsInfo(_callback) {
  App.contracts.TronWin.bankerCardsInfo().call().then(function(results){
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
  $('#silverPrice').html(displayFromSUN(cardsInfo._bankersSilverPrice.toNumber(),0));
  

  

  //console.log("SILVER TIME:", cardsInfo._bankersSilverStartTime.toNumber(),  cardsInfo._bankersSilverCardHalfLife.toNumber());
  //uint _silverDivider = (now - bankersSilverStartTime) / bankersSilverCardHalfLife;
  let dateNow = new Date().getTime();


  //console.log(":", (dateNow - cardsInfo._bankersSilverStartTime.toNumber()*1000) / (cardsInfo._bankersSilverCardHalfLife.toNumber()*1000));

  let _silverStartMultiples = 
    (dateNow - cardsInfo._bankersSilverStartTime.toNumber()*1000) 
      / (cardsInfo._bankersSilverCardHalfLife.toNumber()*1000);

  _silverStartMultiples = Math.floor(_silverStartMultiples);
  //console.log("_silverStartMultiples", _silverStartMultiples);

  let _silverStart = 
      parseInt(cardsInfo._bankersSilverStartTime.toString()) + 
            ( _silverStartMultiples * ( parseInt(cardsInfo._bankersSilverCardHalfLife.toString()) ));

  $('#silverTimer').html(formatDiff(
          _silverStart + cardsInfo._bankersSilverCardHalfLife.toNumber()
      ));

  $('#silverOwner').html(displayWalletAddress(cardsInfo._bankersSilverOwner).substring(0,25));

  //console.log("STARTTIME:", cardsInfo._bankersSilverStartTime.toNumber() + cardsInfo._bankersSilverCardHalfLife.toNumber());

  $('#goldPrice').html(displayFromSUN(cardsInfo._bankersGoldPrice.toNumber(),0));
  $('#goldOwner').html(displayWalletAddress(cardsInfo._bankersGoldOwner).substring(0,25));


  let _goldStartMultiples = 
    (dateNow - cardsInfo._bankersGoldStartTime.toNumber()*1000) / (cardsInfo._bankersGoldCardHalfLife.toNumber()*1000);
  _goldStartMultiples = Math.floor(_goldStartMultiples);

  let _goldStart = cardsInfo._bankersGoldStartTime.toNumber() + (_goldStartMultiples * (cardsInfo._bankersGoldCardHalfLife.toNumber()));

  $('#goldTimer').html(formatDiff(
        _goldStart + cardsInfo._bankersGoldCardHalfLife.toNumber()
//      cardsInfo._bankersGoldStartTime.toNumber() + cardsInfo._bankersGoldCardHalfLife.toNumber()
      ));

  $('#platinumPrice').html(displayFromSUN(cardsInfo._bankersPlatinumPrice.toNumber(),0));
  $('#platinumOwner').html(displayWalletAddress(cardsInfo._bankersPlatinumOwner).substring(0,25));

  let _platinumStartMultiples = 
    (dateNow - cardsInfo._bankersPlatinumStartTime.toNumber()*1000) / (cardsInfo._bankersPlatinumCardHalfLife.toNumber()*1000);
  _platinumStartMultiples = Math.floor(_platinumStartMultiples);
  let _platinumStart = cardsInfo._bankersPlatinumStartTime.toNumber() + (_platinumStartMultiples * (cardsInfo._bankersPlatinumCardHalfLife.toNumber()));


  $('#platinumTimer').html(formatDiff(
      _platinumStart + cardsInfo._bankersPlatinumCardHalfLife.toNumber()
      //cardsInfo._bankersPlatinumStartTime.toNumber() + cardsInfo._bankersPlatinumCardHalfLife.toNumber()
      ));


}

var restartMsgShown = false;

function showRestartMessage() {
  //console.log("showRestartMessage",roundEnded, !restartMsgShown);
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

var tokenDayDetail;

function updateBankClocks() {

  // if round hasn't yet started show the game countdown timer here...
  if(roundInfo.startTime > Date.now) {

  }



  var dateNow = new Date().getTime();

  var divDiff = (tokenDayDetail.endTS*1000) - dateNow;
  var div_daysDifference = Math.floor(divDiff/1000/60/60/24);
  divDiff -= div_daysDifference*1000*60*60*24

  var div_hoursDifference = Math.floor(divDiff/1000/60/60);
  divDiff -= div_hoursDifference*1000*60*60

  var div_minutesDifference = Math.floor(divDiff/1000/60);
  divDiff -= div_minutesDifference*1000*60

  var div_secondsDifference = Math.floor(divDiff/1000);
  
  var div_diffStr = padNumber(div_hoursDifference,2) + ":" + padNumber(div_minutesDifference,2) + ":" + padNumber(div_secondsDifference,2);
  $('#divClock').html(div_diffStr);
  $('#divClock2').html(div_diffStr);




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

        getBankRoundInfo(showRestartMessage);
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



  if(roundEnded){

    updateInnerHTML('roundLeaderAddr', "Selecting...");
    updateInnerHTML('roundWinner', "Selecting...");
    updateInnerHTML('roundCountdown', '[OPEN]');
    updateInnerHTML('finalJackpot', App.tronWeb.fromSun(roundInfo.jackpotBank,2));
    updateInnerHTML('finalJackpot2', App.tronWeb.fromSun(roundInfo.jackpotDivs,2));

    if(roundCountdownDarkAdded){
      $('#roundCountdown').removeClass('roundCountdownDark');  
      roundCountdownDarkAdded = false;
    }

  


  } else {

    restartMsgShown = false;
    if(isMobile){
      updateInnerHTML('roundLeaderAddr', displayWalletAddress(roundInfo.leader).substring(0,10));
      updateInnerHTML('roundHighestAddr', displayWalletAddress(roundInfo.highestInvestor).substring(0,10));
    }

    else{
      updateInnerHTML('roundLeaderAddr', displayWalletAddress(roundInfo.leader).substring(0,20));
      updateInnerHTML('roundHighestAddr', displayWalletAddress(roundInfo.highestInvestor).substring(0,20));
    }
    updateInnerHTML('roundHighestAmount', App.tronWeb.fromSun(roundInfo.highestInvested));

    updateInnerHTML('roundWinner', displayWalletAddress(roundInfo.leader).substring(0,13));

    //console.log("OK", displayWalletAddress(roundInfo.leader));

  }

}

function updateClocks() {

  // if round hasn't yet started show the game countdown timer here...
  if(roundInfo.startTime > Date.now) {

  }



  var dateNow = new Date().getTime();



  var divDiff = (tokenDayDetail.endTS*1000) - dateNow;
  var div_daysDifference = Math.floor(divDiff/1000/60/60/24);
  divDiff -= div_daysDifference*1000*60*60*24

  var div_hoursDifference = Math.floor(divDiff/1000/60/60);
  divDiff -= div_hoursDifference*1000*60*60

  var div_minutesDifference = Math.floor(divDiff/1000/60);
  divDiff -= div_minutesDifference*1000*60

  var div_secondsDifference = Math.floor(divDiff/1000);
  
  var div_diffStr = padNumber(div_hoursDifference,2) + ":" + padNumber(div_minutesDifference,2) + ":" + padNumber(div_secondsDifference,2);
  $('#divClock').html(div_diffStr);
  $('#divClock2').html(div_diffStr);



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
      updateInnerHTML('playerAddress', displayWalletAddress(App.userWalletAddress));

    //console.log(playerInfo);

    updateInnerHTML('totalInvested', displayFromSUN(playerInfo.invested,2));
    updateInnerHTML('totalWithdrawn', displayFromSUN(playerInfo.totalWithdrawn,2));
    updateInnerHTML('playerDivs', displayFromSUN(parseInt(playerInfo.divs) + parseInt(playerInfo.divsLocked),2));
    updateInnerHTML('playerReturns',  displayFromSUN(parseInt(playerInfo.totalReturns) - parseInt(playerInfo.refReturns),2));
    updateInnerHTML('playerRefReturns', displayFromSUN(playerInfo.refReturns,2));
    updateInnerHTML('playerTotal', displayFromSUN( parseInt(playerInfo.totalReturns) 
                                              + parseInt(playerInfo.divs) 
                                              + parseInt(playerInfo.divsLocked),2
                                                      ));
  }

}



function populateBankRoundInfo() {

//    updateInnerHTML('vaultPrize', App.tronWeb.fromSun(roundInfo.jackpot));
//    updateInnerHTML('grandPrize2', App.tronWeb.fromSun(roundInfo.jackpot));


    var dateNow = new Date().getTime();
    var difference = (roundInfo.softDeadline*1000) - dateNow;
    if(difference < 1 ) 
      roundEnded = true;
    else
      roundEnded = false;

    //console.log(roundInfo);
    $('#vaultPrize').html( displayFromSUN(roundInfo.jackpotBank,1));
    $('#jackpotTRX').html( displayFromSUN(roundInfo.jackpotDivs,1));
    $('#grandPrize2').html( displayFromSUN(roundInfo.jackpotBank,1));
    $('#jackpotTRX2').html( displayFromSUN(roundInfo.jackpotDivs,1));
    $('#roundTotalInvested').html( displayFromSUN(roundInfo.totalInvested,2));
    
    $('#buyRate').html(displayFromSUN(roundInfo._buyPrice,4));
    $('#sellRate').html(displayFromSUN(roundInfo._sellPrice,4));

}


function populateRoundInfo(){
  //console.log(roundInfo);


  updateInnerHTML('vaultPrize', App.tronWeb.fromSun(roundInfo.jackpot));
  updateInnerHTML('grandPrize2', App.tronWeb.fromSun(roundInfo.jackpot));


  var dateNow = new Date().getTime();
  var difference = (roundInfo.softDeadline*1000) - dateNow;
  if(difference < 1 ) 
    roundEnded = true;
  else
    roundEnded = false;

  //console.log(roundInfo.jackpot.toNumber());

  if(parseInt(roundInfo.jackpot.toString()) < 25000000000) {
    //console.log("stage1");
    $('#jackpotTWN').html('100');
    $('#jackpotTWN2').html('100');
    $('#jackpotTWN3').html('100');
    $('#jackpotTWN4').html('100');

    $('#jackpot2ndTWN').html('50');
    $('#jackpot2ndTWN2').html('50');

    $('#jackpot3rdTWN').html('10');
    $('#jackpot3rdTWN2').html('10');

  } else {
                                               
    if(parseInt(roundInfo.jackpot.toString()) <50000000001) {
      console.log("stage2");
      $('#jackpotTWN').html('200');
      $('#jackpotTWN2').html('200');
      $('#jackpotTWN3').html('200');
      $('#jackpotTWN4').html('200');

      $('#jackpot2ndTWN').html('100');
      $('#jackpot2ndTWN2').html('100');

      $('#jackpot3rdTWN').html('20');
      $('#jackpot3rdTWN2').html('20');

    } else {
                                                  
      if(parseInt(roundInfo.jackpot.toString()) < 75000000001) {
        console.log("stage3");
        $('#jackpotTWN').html('400');
        $('#jackpotTWN2').html('400');
        $('#jackpotTWN3').html('400');
        $('#jackpotTWN4').html('400');

        $('#jackpot2ndTWN').html('200');
        $('#jackpot2ndTWN2').html('200');

        $('#jackpot3rdTWN').html('40');
        $('#jackpot3rdTWN2').html('40');

      } else {

        if(parseInt(roundInfo.jackpot.toString()) < 100000000001) {
          console.log("stage4");
          $('#jackpotTWN').html('800');
          $('#jackpotTWN2').html('800');
          $('#jackpotTWN3').html('800');
          $('#jackpotTWN4').html('800');

          $('#jackpot2ndTWN').html('400');
          $('#jackpot2ndTWN2').html('400');

          $('#jackpot3rdTWN').html('80');
          $('#jackpot3rdTWN2').html('80');

        } else {
          console.log("stage5");
          $('#jackpotTWN').html('1600');
          $('#jackpotTWN2').html('1600');
          $('#jackpotTWN3').html('1600');
          $('#jackpotTWN4').html('1600');

          $('#jackpot2ndTWN').html('800');
          $('#jackpot2ndTWN2').html('800');

          $('#jackpot3rdTWN').html('160');
          $('#jackpot3rdTWN2').html('160');
        }
      }
    }
  }

  if(roundEnded){

    updateInnerHTML('roundLeaderAddr', "Selecting...");
    updateInnerHTML('roundWinner', "Selecting...");
    updateInnerHTML('roundCountdown', '[OPEN]');
    updateInnerHTML('finalJackpot', App.tronWeb.fromSun(roundInfo.jackpot));

    if(roundCountdownDarkAdded){
      $('#roundCountdown').removeClass('roundCountdownDark');  
      roundCountdownDarkAdded = false;
    }

  


  } else {

    restartMsgShown = false;
    if(isMobile){
      updateInnerHTML('roundLeaderAddr', displayWalletAddress(roundInfo.leader).substring(0,10));
      updateInnerHTML('roundHighestAddr', displayWalletAddress(roundInfo.highestInvestor).substring(0,10));
    }

    else{
      updateInnerHTML('roundLeaderAddr', displayWalletAddress(roundInfo.leader).substring(0,20));
      updateInnerHTML('roundHighestAddr', displayWalletAddress(roundInfo.highestInvestor).substring(0,20));
    }
    updateInnerHTML('roundHighestAmount', App.tronWeb.fromSun(roundInfo.highestInvested));

    updateInnerHTML('roundWinner', displayWalletAddress(roundInfo.leader).substring(0,13));

    //console.log("OK", displayWalletAddress(roundInfo.leader));

  }
  //console.log("ROUNDINFO:", roundInfo);

  updateInnerHTML('roundTotalInvested', displayFromSUN(roundInfo.totalInvested,2));

  //if(roundInfo.leader_vanity.length > 0){
  //  updateVanityAddress(roundInfo.leader, roundInfo.leader_vanity);
  //}



}

function doCashOut() {
  if(App.isReadonly) {
    showNotConnectedMsg();
    return;
  }



    showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');    


    App.contracts.TronWin.cashoutToTWN().send({
    }, function(err, results){
      if(err){
        showToast('Cash Out Cancelled','Your cash out was cancelled - please try again!', 'info');  
      } else {
        let _msg = "<h4>Cash Out Compelte!</h4>"
        _msg += '<p style="font-size: 10pt;"><b>Your Cash Out is Complete</b>!</b></p>';
        _msg += '<p style="font-size: 10pt;">The transaction will be mined by the Blockchain and the TWN will show up in your wallet shortly!</p>';

        showError(_msg);
      }
      
    });


}

function doGamerFundsWithdraw() {
  if(App.isReadonly) {
    showNotConnectedMsg();
    return;
  }

  let _amnt = parseInt($('#withdrawAmount').val());
  if(_amnt <6) {
    showToast('Withdraw Cancelled','Your withdrawal was cancelled due to not meeting the min requirements of 6 TRX', 'info');  
    return;
  }

  _amnt = _amnt * 1000000;

  
  App.contracts.TronWinGamerFunds.gamerFundsAvail(App.userWalletAddress).call().then(function(results){
    let _balance = parseInt(results.toString());
    if(_amnt > _balance){
      showToast('Withdraw Cancelled', 'You do not have enough funds for this withdrawal', 'info');  
      return;

    } else {
      showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');    

      if(_amnt == _balance)
        _amnt = _amnt - 1;

      App.contracts.TronWinGamerFunds.withdraw(_amnt).send({
      }, function(err, results){
        if(err){
          showToast('Withdrawal Cancelled','Your withdrawal was cancelled and no TRX was withdrawn this time - please try again!', 'info');  
        } else {
          let _msg = "<h4>Withdrawal Compelte!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>Your Withdrawal is Complete</b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">The transaction will be mined by the Blockchain and the funds will show up in your wallet shortly!</p>';

          showError(_msg);
        }
        
      });

    }
    
  });

}

function doDeposit() {
  if(App.isReadonly) {
    showNotConnectedMsg();
    return;
  }

  let _amnt = parseInt($('#betAmount').val());
  if(_amnt <5) {
    showToast('Deposit Cancelled','Your deposit was cancelled due to not meeting the min requirements of 5 TRX', 'info');  
    return;
  }

  _amnt = _amnt * 1000000;

  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');
console.log(_amnt);

  App.contracts.TronWinGamerFunds.deposit().send({
       callValue: _amnt
  }, function(err, results){
    if(err){
      showToast('Deposit Cancelled','Your deposit was cancelled and no $TRX was sent this time - please try again!', 'info');  
    } else {
      let _msg = "<h4>deposit Compelte!</h4>"
      _msg += '<p style="font-size: 10pt;"><b>Your Deposit is Complete</b>!</b></p>';
      _msg += '<p style="font-size: 10pt;">The transaction will be mined by the Blockchain and the funds will show up on your account shortly!</p>';

      showError(_msg);
    }
    
  });

}

function withdrawBankReturns() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  App.contracts.TronWinBank.withdraw().send(
      {
        from: App.userWalletAddress
      }, function( err, results) {
        if(err) {
          showToast('Withdraw Cancelled','Your withdrawal was cancelled and no $TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Withdrawal Compelte!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>Your Winnings are on their way!</b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">The transaction will be mined by the Blockchain and the funds will show up in your wallet shortly!</p>';
          
          showError(_msg);
          
        }
  });
}


function withdrawReturns() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  App.contracts.TronWin.withdrawReturns().send(
      {
        from: App.userWalletAddress
      }, function( err, results) {
        if(err) {
          showToast('Withdraw Cancelled','Your withdrawal was cancelled and no $TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Withdrawal Compelte!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>Your Winnings are on their way!</b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">The transaction will be mined by the Blockchain and the funds will show up in your wallet shortly!</p>';
          


          showError(_msg);
          
        }
  });

}

function revinvestBankReturns(){
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }




  if(bankPlayerTotalReturns < 5000000) {
    showError("You must have at least 5 TRX in your Total Returns to reinvest.", "Reinvestment");
    return;
  }
  


  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');


  App.contracts.TronWinBank.reinvest().send(
      {
        from: App.userWalletAddress
      }, function( err, results) {
        if(err) {
          showToast('Investment Cancelled','Your investment was cancelled and no TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Congratulations!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>You\'ve reinvested and will have received new BANK, you\'ll start to see an increase on your dividends!</b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';

          showError(_msg);
          
        }
      });
}


// working
function reinvestReturns() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  if(roundEnded) {
    showError("You cannot start a new round with your returns - it must be started with $TRX", "Round restarting");
    return;
  }

  let _playerTotal = 
        parseInt(playerInfo.totalReturns) 
        + parseInt(playerInfo.divs) 
        + parseInt(playerInfo.divsLocked);

  if(App.tronWeb.fromSun(_playerTotal) < 5) {
    showError("You must have at least 5 TRX in your Total Returns to reinvest.", "Reinvestment");
    return;
  }
  


  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');


  App.contracts.TronWin.reinvestFull().send(
      {
        from: App.userWalletAddress
      }, function( err, results) {
        if(err) {
          showToast('Investment Cancelled','Your investment was cancelled and no TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Congratulations!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>You\'ve reinvested and will start to see an increase on your dividends!</b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';

          showError(_msg);
          
        }
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


function buyBANK() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  let _amnt = $('#betAmount').val();
  let _amntSUN = parseInt(_amnt) * 1000000;
  if(_amntSUN < 10000000) {
    showToast('Insufficient TRX', 'Min BANK buy is 10TRX', 'info');
    return;
  }



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

  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');
  console.log("REF:", _ref);
  // Working...
  App.contracts.TronWinBank.buyBANK(_ref).send(
      {
        callValue: _amntSUN.toString(),
        feeLimit: 50000000
      }, function( err, results) {
        if(err) {
          console.log("ERR:", err);
          showToast('Purcahse Cancelled','Your purchase was cancelled and no TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Congratulations!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>You\'ve invested <b>' + _amnt.toString() + ' TRX </b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';
          
          showError(_msg);
          
        }
      });

}

/*
939.82 $BANK (960.12 TRX)
Divs: 68.87 TRX + Refs: 0.00 TRX
*/
/*
938.82 $BANK (959.01 TRX)
Divs: 69.91 TRX + Refs: 0.00 TRX
*/
function sellBANK() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  let _amnt = $('#bankAmount').val();
  let _amntSUN = roundNumber(parseFloat(_amnt) * 1000000,0);



  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');


  App.contracts.TronWinBank.sellBANK(_amntSUN).send(
      {
        feeLimit: 50000000
      }, function( err, results) {
        if(err) {
          console.log("ERR:", err);
          showToast('Purcahse Cancelled','Your purchase was cancelled and no TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Congratulations!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>You\'ve sold <b>' + _amnt.toString() + ' $BANK </b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and your TRX will be available on your account shortly.</p>';
          
          showError(_msg);
          
        }
      });

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

function doFreeze() {
  $('#freezeTWNDiv').foundation('close');
  let _amnt = document.getElementById('freezeNum').value * 1000000;
  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');
  
  App.contracts.TronToken.freeze(_amnt).send(
      {
        feeLimit: 50000000
      }, function( err, results) {
        if(err) {
          showToast('Freeze Cancelled','Your freeze was cancelled - please try again!', 'info');

        } else {
          let _msg = "<h4>Freeze Request Submitted!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>If you have enough available TWN they\'ll be frozen shortly!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';
          
          showError(_msg);
          
        }
      });
}

function doUnFreeze() {
  $('#unfreezeTWNDiv').foundation('close');
  let _amnt = document.getElementById('unfreezeNum').value * 1000000;
  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');
  
  App.contracts.TronToken.unfreeze(_amnt).send(
      {
        feeLimit: 50000000
      }, function( err, results) {
        if(err) {
          showToast('Freeze Cancelled','Your unfreeze was cancelled - please try again!', 'info');

        } else {
          let _msg = "<h4>Un-Freeze Request Submitted!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>If you have enough available TWN they\'ll be unfrozen shortly!</b></p>';
          _msg += '<p style="font-size: 10pt;">Un-Freeze requests take approx. 24 Hours.</p>';
          
          showError(_msg);
          
        }
      });
}

function submitInvest() {
  let num = new App.tronWeb.BigNumber(document.getElementById('investmentAmount').value);
  let numSUN = App.tronWeb.toSun(num);

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

  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');
  console.log("REF:", _ref);
  // Working...
  App.contracts.TronWin.invest(_ref).send(
      {
        callValue: numSUN.toString(),
        feeLimit: 50000000
      }, function( err, results) {
        if(err) {
          console.log("ERR:", err);
          showToast('Purcahse Cancelled','Your purchase was cancelled and no $TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Congratulations!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>You\'ve invested <b>' + num.toString() + ' TRX </b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';
          
          showError(_msg);
          
        }
      });

}
function submitFinalizeAndRestart() {
  let num = new App.tronWeb.BigNumber(document.getElementById('investmentAmount').value);
  let numSUN = App.tronWeb.toSun(num);

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

  showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');

  // Working...
  App.contracts.TronWin.finalizeAndRestart(_ref).send(
      {
        from: App.userWalletAddress,
        callValue: numSUN.toString()
      }, function( err, results) {
        if(err) {
          showToast('Purcahse Cancelled','Your purchase was cancelled and no $TRX was spent this time - please try again!', 'info');

        } else {
          let _msg = "<h4>Congratulations!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>You\'ve invested <b>' + num.toString() + ' TRX </b>!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';

          showError(_msg);
          
        }
      });
}

// working
function freeDailyKey() {
  if(App.isReadOnly) {
    showNotConnectedMsg();
    return;
  }

  // check player has > 1 key this round..
  if(playerInfo.keys == 0) {
    showError("You must purchase at least one key in the game round to unlock this feature!","No Keys Held");
    return;
  }

  
  App.contracts.TronWin.timeToFreeKey(App.userWalletAddress).call().then(function(results){
    let _timeRemaining = parseInt(results);
    console.log("TIME:", _timeRemaining);

    if(_timeRemaining < 86400) {
      showError("You've already claimed your Free Key for today - check back tomorrow for another!","Daily Free Key Claimed");
      return;
    }

    let _instantWinCode = document.getElementById('instantWinCode').value;
    let instantWinCode = 300;
    if(isNaN(_instantWinCode)) {
    } else {
      _instantWinCode = parseInt(_instantWinCode);
      if(_instantWinCode>0 && _instantWinCode<301) {
        instantWinCode = _instantWinCode;
      }
    }




    showToast('Sending Transaction', 'Check your Tron Wallet to complete the transaction', 'info');



    App.contracts.TronWin.dailyFreeKey(_instantWinCode).send(
        {
          from: App.userWalletAddress
        }, function( err, results) {
          if(err) {
            showToast('Purcahse Cancelled','Your purchase was cancelled and no $TRX was spent this time - please try again!', 'info');

          } else {
            let _msg = "<h4>Congratulations!</h4>"
            _msg += '<p style="font-size: 10pt;"><b>You now own <b>1 new Free Key(s)!</b>!</b></p>';
            _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and visible shortly.</p>';


            showError(_msg, "Sucess");
            
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


  var _newReferer = getUrlParameter('tron')||"";
  if(_newReferer.length > 0) { // newly referred
    _referer = _newReferer;
  } else { // existing user referred by someone
    var _cookieRef = Cookies.get('tron')||"";
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



var scratchCard;

function _hideScratchCardsDiv() {
  console.log("HIDING!!!");
  
  $(".scratch_card_logged_out_dialog2").hide();
  $(".scratch_card_dialog_overlay").hide();
  scratchCard.start();

}


function checkForSession(_callback){
  let _session = getSessionSignature();
  if(_session.length > 0) {
    validateSession(_session,false,_callback);
  }
}
function doSessionLogin(_callback) {
  // check if we have a session cookie
  // if so - need to check the session is valid (On server side as we'll have access to the clear msg there)...
  // result = await tronWeb.trx.verifyMessage(tronWeb.toHex(msg), signature, signer)
  //
  //
  // else 
  // api request to get new msg/none from server
  // and then sign it...
  // signature = await tronWeb.trx.sign(tronWeb.toHex(msg))

  if(App.currentGame == 'scratchCards') {
    if(!_callback){
      _callback = _startScratchCards;
    }
  }

  var _sessionSignature = getSessionSignature();
  if(_sessionSignature.length>0) {
    // check it is valid..
    validateSession(_sessionSignature,true, _callback);


  } else {
    showSessionLogin(_callback);

  }

  return;


}

var sessionLoggedOn = false;

function getSessionSignature() {
  var _sessionSignature = Cookies.get('_sessionSignature')||"";
  return _sessionSignature;
}

function validateSession(_signature, presentLogin, _callback) {
  sessionLoggedOn = false;
  $.ajax({
    type: "POST",
    url: "https://api.tronwin.app/validateSession",
    //url: "http://127.0.0.1:444/validateSession",
    data: "signature=" + _signature + "&wallet=" + App.userWalletAddress,
    mimeType: 'text/json',
    success: function(data){
      console.log("RESULT:", data);  

      // {success: false, nonce: "b72d35ee72c14dd98d3ef3964431003c"}
      if(data.success == false) {
        console.log("Invalid login!");
        if(presentLogin)
          showSessionLogin(_callback);

      } else {
        $('#sessionLoginBtn').addClass('disabled');

        $('#gamerFundsDepositBtn').removeClass('disabled');
        $('#gamerFundsWithdrawBtn').removeClass('disabled');
        sessionLoggedOn = true;
        if(_callback)
          _callback();
      }
    },
    error: function(jqXHR, textStatus, err) {
      console.log("ERROR:", err);
      if(presentLogin)
        showSessionLogin(_callback);
    }
  });
}

function showSessionLogin(_callback) {
  $.ajax({
    type: "GET",
    url: "https://api.tronwin.app/user?wallet=" + App.userWalletAddress,
    //url: "http://127.0.0.1:444/user?wallet=" + App.userWalletAddress,
    success: function(data){
      console.log("RESULT:", data);   // WORKING
      // now sign the nonce...
      App.tronWeb.trx.sign(App.tronWeb.toHex(data.nonce)).then(function(results){
        console.log("Result signing:", results);
        // 0x414860a787c90f56d6b63f7878f40dfc9fc399144da3c7c44450c3f41a25d6d0143deb50c2ba41573488ee6bc343b98c280894fb096b9df179eaf68c358fc3631c
        // confirm it now...
        let _now = new Date();
        let _time = _now.getTime();
        _time += 3600 * 1000;
        _now.setTime(_time);
        Cookies.set('_sessionSignature', results, { expires: _now });
        validateSession(results,false,_callback);


      }).catch(function(err){
        console.log("Error signing:", err);
      });
    }
  });
}

// clear msg on server
//
// post signature + wallet to server
//
// validate against msg (With tronWeb.trx.verifyMessage(tronWeb.toHex(msg), signature, signer))
//   If correct can process game action (Deal cards etc)
//
//
// without signature + signer - cannot impersonate player
//


// Other Game UI


var instantWinActive = false;



function keysPlus(num) {


  if(num == 0) {
    document.getElementById('investmentAmount').value = '5';
  } else {
    document.getElementById('investmentAmount').value = parseInt(document.getElementById('investmentAmount').value) + parseInt(num);
    if(parseInt(document.getElementById('investmentAmount').value) > maxTrx){
      document.getElementById('investmentAmount').value = maxTrx;
      showToast('Max Keys Limit','The Max investment per Play is: ' + maxTrx, 'info');
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
    return parseFloat(App.tronWeb.fromSun(_in)).toFixed(0);
  }else
  return parseFloat(App.tronWeb.fromSun(_in)).toFixed(_round||4);
}

// admin


function pushDataToRandos(){
    let _body = JSON.parse(_randosData);
    let _NewRandos = [];
    for(let i=0; i<_body.data.length;i++){
      _NewRandos.push(_body.data[i]);
    }


    //App.contracts.Rando2.pushRandos(_NewRandos).send(
    App.contracts.TronWin.pushRandos(_NewRandos).send(
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

  // shasta = THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky
  // mainnet = TEEEQGmbZoeHA24EVG91b6u9zsbWUfefPF

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
  App.contracts.TronWin.updateAllowedContracts("TQd7vsWKNZGuF5Hfn1QEPdqcN9Auwygtun", true).send({},function(error,results){
    console.log("TX:", results);
  });
}

function validateAllowedContracts() {
  App.contracts.TronWin.validateAllowedContracts("TQd7vsWKNZGuF5Hfn1QEPdqcN9Auwygtun", true).send({},function(error,results){
    console.log("TX:", results);
  });
}

function setGamePause(){
    App.contracts.TronWin.p_setGamePaused(false).send(
      {}, 
        function(error, result){
          if(error) {
            showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
          } else {
            console.log("tx:", result);                    
            
          }
    });
}





var _randosData = '{"type":"uint16","length":1000,"data":[35442,624,33760,61965,27646,32686,63450,5872,3440,63844,29026,46244,58964,53955,21140,12072,59161,64898,20369,40775,40163,53613,47850,47927,10839,47410,16980,62324,24382,16184,33674,50036,31035,19611,43649,30930,26236,1882,36241,20215,3080,60088,58866,61291,5600,16840,11546,32564,44802,14174,12523,58524,63153,2790,42639,41439,32387,25949,62839,31361,7364,53226,14512,54894,65361,64698,2149,7468,21505,36395,33865,56702,13352,61288,4399,17345,32123,28795,58397,11341,26100,27554,14554,19353,56567,53214,51135,42793,28080,61252,56609,34356,14919,8163,56921,41796,42690,34433,21896,4603,11171,50868,15772,31227,22761,32670,54568,6141,257,47217,21398,28729,18421,40800,17250,62458,22715,17459,28524,63636,37140,40190,42997,925,51132,5496,56239,42952,12464,23677,52981,45030,45151,58108,53801,35589,64295,49328,6737,10363,55489,5384,5517,47805,54003,20028,17654,7866,10913,34817,43845,13670,53133,51163,38761,19420,25721,46801,10578,392,26146,64115,30027,60954,7302,58201,26569,3797,25295,54155,46035,13495,61757,5145,24278,59650,15658,36147,2418,26065,57315,60403,20760,48574,33582,40004,62209,53157,27035,5096,46915,11529,48964,61082,2632,17222,53647,21654,42841,28171,40606,44475,44755,54995,36625,6763,61302,15950,40292,30612,21369,58840,65314,20861,9808,20340,21040,50308,52622,46058,34204,22409,46937,28679,13454,41146,62620,36205,13180,64739,9684,43651,15932,27243,41933,30425,51735,29582,12339,45841,29615,17202,33684,10569,41646,61206,18168,27816,15384,62109,16792,6921,4439,35381,23657,46590,15770,49135,8774,57515,59216,16002,22839,40375,51015,11252,2212,30161,7616,9759,8833,4708,44060,39468,40484,6781,57630,3593,33838,63763,35491,8588,42671,15296,33164,62231,38187,28530,20269,42616,18866,56081,45445,13915,58541,16016,9865,62629,31600,13158,47968,13209,65227,63626,24588,54963,27295,64282,20480,31659,38568,50280,52473,35323,20090,12635,27930,14991,15664,9823,33873,42671,55327,64196,29427,45921,49279,38217,6504,25150,40543,9664,58350,61457,53826,303,16937,16798,44270,44172,65405,51432,58218,26654,31238,380,34662,52685,15615,62241,64181,50125,9268,22452,31944,237,34112,36820,50099,13424,50930,38622,37343,53476,19543,46632,37108,45463,7204,10075,33874,29130,20485,42559,11877,29764,44337,36740,38153,2823,55148,14854,28652,63562,36339,33853,63629,15060,35781,45008,53759,22216,6112,5976,61834,36512,24255,40676,55019,30232,36154,6951,26352,52251,32381,10657,33091,63698,15719,54957,25322,35188,33836,31463,30445,33739,32651,15737,35264,38749,9233,26189,43159,51151,45463,17259,28000,53247,20977,21420,57001,63474,43513,55792,15004,56406,27823,27925,3376,5153,54969,13120,37791,57417,59536,52542,36906,56290,38525,4082,54872,10639,12293,60714,36197,32832,32863,62416,21167,9367,58590,53532,6316,27807,7547,32145,32362,18478,29320,63578,19955,57842,64431,44857,57122,7851,60441,45199,52130,28173,11542,36160,27157,47358,60400,44514,35891,40537,10201,40747,58787,17255,16080,57133,52100,9502,25184,63491,22868,27832,12538,59105,29334,26620,11068,57403,13797,53314,36204,17977,65371,51744,57185,64032,51167,50358,63865,12049,50713,47991,2711,13600,52192,38943,28844,2011,63019,21350,13616,40065,22352,49947,62175,19733,50666,60652,63782,23710,33218,31758,11866,32091,3308,31439,48070,353,898,61288,43723,13280,43784,21558,4629,25198,42242,8754,58700,46849,17885,9764,62505,53239,42067,46366,34101,46794,46786,22559,47417,41947,62477,33098,28558,42046,28530,49917,55417,18296,47060,2258,34211,48884,26854,40083,15952,38267,55068,31905,29759,41356,26077,23711,62283,55349,64723,4634,54147,56575,11619,57258,45318,45245,44011,43872,27332,14838,4247,14455,3474,7251,6714,41754,47451,41258,15701,62740,39967,27217,42259,26940,34302,17986,47638,56867,60342,21711,1215,57262,33970,16939,26988,20049,5291,3718,46222,39699,3531,25382,39743,8056,20897,4550,20925,27802,11194,25002,43789,37632,38700,24647,64948,8626,37894,63446,28338,58660,20722,4456,10951,55267,34018,57398,15915,58362,61119,34663,55574,41692,20302,42064,8869,55295,16287,5453,36535,17269,39655,9332,26621,47233,20599,63138,7275,60249,35749,59999,50149,35009,9538,49781,3484,26678,64764,5719,65270,51737,37710,18976,6359,9468,41714,48065,16385,34235,23055,18334,25736,26217,62132,44431,13785,59628,28159,37931,57460,35758,34411,28271,869,28681,48587,26507,55311,13208,42737,1583,65488,38944,31643,22732,18743,15623,12609,18303,16695,62806,14611,9901,49666,49818,21631,53888,30424,61274,45244,59680,56130,48779,53229,49098,15796,61864,30692,32699,48260,65070,37149,51867,62750,39210,46501,18804,275,37741,2602,10608,49938,8528,17109,25704,42994,64500,33496,51011,62075,1796,20878,16444,53143,16091,13646,7304,6382,33869,49780,31753,22858,28632,3911,40178,985,34903,19325,3826,52615,41964,32885,24837,54894,15316,64354,41882,23988,60232,61089,46385,48858,60089,34466,21444,14620,7098,16729,32496,13966,30000,30502,55206,17334,26738,50441,8205,1874,47265,23533,57758,26543,27071,44854,38888,62865,54874,55758,42624,32556,39813,32184,34780,23774,36596,52118,53580,45419,28621,29161,20022,1237,57134,59172,64482,44539,43958,49841,43334,32531,8036,47193,30533,59094,29382,7867,20312,42436,4249,15446,44433,39927,20873,11417,41577,45907,12842,18832,45460,55362,10125,63152,56342,49843,12347,57728,34566,30542,59116,3657,41253,53036,41684,32493,13253,12492,27220,8757,59003,4213,3379,57991,2243,38076,60532,49764,24969,17115,29150,49966,52358,27461,11196,45308,62044,34641,25024,18026,57699,37510,1188,21729,1307,34663,20027,63357,5846,52709,63029,64228,6598,56601,60564,26092,23729,13721,27329,10653,64118,30711,5881,48563,38008,62087,42833,63349,35610,6957,586,19134,10522,5278,13810,17600,41479,24309,22697,35079,30388,3416,52218,44160,17965,42750,62739,21070,64751,34174,22196,44250,58258,28674,3269,32402,3961,27182,18823,44006,36591,40682,51093,11811,35231,64762,47215,21329,6104,4108,8466,38849,34158,51459,20417,45210,16975,20967,8251,18080,49976,46986,401,29036,17382,65018,62538],"success":true}';


/**
 * Minified by jsDelivr using UglifyJS v3.4.4.
 * Original file: /npm/js-cookie@2.2.0/src/js.cookie.js
 * 
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!function(e){var n=!1;if("function"==typeof define&&define.amd&&(define(e),n=!0),"object"==typeof exports&&(module.exports=e(),n=!0),!n){var o=window.Cookies,t=window.Cookies=e();t.noConflict=function(){return window.Cookies=o,t}}}(function(){function g(){for(var e=0,n={};e<arguments.length;e++){var o=arguments[e];for(var t in o)n[t]=o[t]}return n}return function e(l){function C(e,n,o){var t;if("undefined"!=typeof document){if(1<arguments.length){if("number"==typeof(o=g({path:"/"},C.defaults,o)).expires){var r=new Date;r.setMilliseconds(r.getMilliseconds()+864e5*o.expires),o.expires=r}o.expires=o.expires?o.expires.toUTCString():"";try{t=JSON.stringify(n),/^[\{\[]/.test(t)&&(n=t)}catch(e){}n=l.write?l.write(n,e):encodeURIComponent(String(n)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,decodeURIComponent),e=(e=(e=encodeURIComponent(String(e))).replace(/%(23|24|26|2B|5E|60|7C)/g,decodeURIComponent)).replace(/[\(\)]/g,escape);var i="";for(var c in o)o[c]&&(i+="; "+c,!0!==o[c]&&(i+="="+o[c]));return document.cookie=e+"="+n+i}e||(t={});for(var a=document.cookie?document.cookie.split("; "):[],s=/(%[0-9A-Z]{2})+/g,f=0;f<a.length;f++){var p=a[f].split("="),d=p.slice(1).join("=");this.json||'"'!==d.charAt(0)||(d=d.slice(1,-1));try{var u=p[0].replace(s,decodeURIComponent);if(d=l.read?l.read(d,u):l(d,u)||d.replace(s,decodeURIComponent),this.json)try{d=JSON.parse(d)}catch(e){}if(e===u){t=d;break}e||(t[u]=d)}catch(e){}}return t}}return(C.set=C).get=function(e){return C.call(C,e)},C.getJSON=function(){return C.apply({json:!0},[].slice.call(arguments))},C.defaults={},C.remove=function(e,n){C(e,"",g(n,{expires:-1}))},C.withConverter=e,C}(function(){})});
//# sourceMappingURL=/sm/31d5cd1b58ce5e6231e4ea03a69b2801a53e76e98152bc29dc82a494ed0a1ee6.map



/*!
 * clipboard.js v2.0.4
 * https://zenorocha.github.io/clipboard.js
 * 
 * Licensed MIT © Zeno Rocha
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.ClipboardJS=e():t.ClipboardJS=e()}(this,function(){return function(n){var o={};function r(t){if(o[t])return o[t].exports;var e=o[t]={i:t,l:!1,exports:{}};return n[t].call(e.exports,e,e.exports,r),e.l=!0,e.exports}return r.m=n,r.c=o,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=0)}([function(t,e,n){"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=function(){function o(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(t,e,n){return e&&o(t.prototype,e),n&&o(t,n),t}}(),a=o(n(1)),c=o(n(3)),u=o(n(4));function o(t){return t&&t.__esModule?t:{default:t}}var l=function(t){function o(t,e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,o);var n=function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}(this,(o.__proto__||Object.getPrototypeOf(o)).call(this));return n.resolveOptions(e),n.listenClick(t),n}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}(o,c.default),i(o,[{key:"resolveOptions",value:function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};this.action="function"==typeof t.action?t.action:this.defaultAction,this.target="function"==typeof t.target?t.target:this.defaultTarget,this.text="function"==typeof t.text?t.text:this.defaultText,this.container="object"===r(t.container)?t.container:document.body}},{key:"listenClick",value:function(t){var e=this;this.listener=(0,u.default)(t,"click",function(t){return e.onClick(t)})}},{key:"onClick",value:function(t){var e=t.delegateTarget||t.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new a.default({action:this.action(e),target:this.target(e),text:this.text(e),container:this.container,trigger:e,emitter:this})}},{key:"defaultAction",value:function(t){return s("action",t)}},{key:"defaultTarget",value:function(t){var e=s("target",t);if(e)return document.querySelector(e)}},{key:"defaultText",value:function(t){return s("text",t)}},{key:"destroy",value:function(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:"isSupported",value:function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:["copy","cut"],e="string"==typeof t?[t]:t,n=!!document.queryCommandSupported;return e.forEach(function(t){n=n&&!!document.queryCommandSupported(t)}),n}}]),o}();function s(t,e){var n="data-clipboard-"+t;if(e.hasAttribute(n))return e.getAttribute(n)}t.exports=l},function(t,e,n){"use strict";var o,r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},i=function(){function o(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}return function(t,e,n){return e&&o(t.prototype,e),n&&o(t,n),t}}(),a=n(2),c=(o=a)&&o.__esModule?o:{default:o};var u=function(){function e(t){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),this.resolveOptions(t),this.initSelection()}return i(e,[{key:"resolveOptions",value:function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};this.action=t.action,this.container=t.container,this.emitter=t.emitter,this.target=t.target,this.text=t.text,this.trigger=t.trigger,this.selectedText=""}},{key:"initSelection",value:function(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:"selectFake",value:function(){var t=this,e="rtl"==document.documentElement.getAttribute("dir");this.removeFake(),this.fakeHandlerCallback=function(){return t.removeFake()},this.fakeHandler=this.container.addEventListener("click",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement("textarea"),this.fakeElem.style.fontSize="12pt",this.fakeElem.style.border="0",this.fakeElem.style.padding="0",this.fakeElem.style.margin="0",this.fakeElem.style.position="absolute",this.fakeElem.style[e?"right":"left"]="-9999px";var n=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=n+"px",this.fakeElem.setAttribute("readonly",""),this.fakeElem.value=this.text,this.container.appendChild(this.fakeElem),this.selectedText=(0,c.default)(this.fakeElem),this.copyText()}},{key:"removeFake",value:function(){this.fakeHandler&&(this.container.removeEventListener("click",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(this.container.removeChild(this.fakeElem),this.fakeElem=null)}},{key:"selectTarget",value:function(){this.selectedText=(0,c.default)(this.target),this.copyText()}},{key:"copyText",value:function(){var e=void 0;try{e=document.execCommand(this.action)}catch(t){e=!1}this.handleResult(e)}},{key:"handleResult",value:function(t){this.emitter.emit(t?"success":"error",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:"clearSelection",value:function(){this.trigger&&this.trigger.focus(),window.getSelection().removeAllRanges()}},{key:"destroy",value:function(){this.removeFake()}},{key:"action",set:function(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:"copy";if(this._action=t,"copy"!==this._action&&"cut"!==this._action)throw new Error('Invalid "action" value, use either "copy" or "cut"')},get:function(){return this._action}},{key:"target",set:function(t){if(void 0!==t){if(!t||"object"!==(void 0===t?"undefined":r(t))||1!==t.nodeType)throw new Error('Invalid "target" value, use a valid Element');if("copy"===this.action&&t.hasAttribute("disabled"))throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');if("cut"===this.action&&(t.hasAttribute("readonly")||t.hasAttribute("disabled")))throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');this._target=t}},get:function(){return this._target}}]),e}();t.exports=u},function(t,e){t.exports=function(t){var e;if("SELECT"===t.nodeName)t.focus(),e=t.value;else if("INPUT"===t.nodeName||"TEXTAREA"===t.nodeName){var n=t.hasAttribute("readonly");n||t.setAttribute("readonly",""),t.select(),t.setSelectionRange(0,t.value.length),n||t.removeAttribute("readonly"),e=t.value}else{t.hasAttribute("contenteditable")&&t.focus();var o=window.getSelection(),r=document.createRange();r.selectNodeContents(t),o.removeAllRanges(),o.addRange(r),e=o.toString()}return e}},function(t,e){function n(){}n.prototype={on:function(t,e,n){var o=this.e||(this.e={});return(o[t]||(o[t]=[])).push({fn:e,ctx:n}),this},once:function(t,e,n){var o=this;function r(){o.off(t,r),e.apply(n,arguments)}return r._=e,this.on(t,r,n)},emit:function(t){for(var e=[].slice.call(arguments,1),n=((this.e||(this.e={}))[t]||[]).slice(),o=0,r=n.length;o<r;o++)n[o].fn.apply(n[o].ctx,e);return this},off:function(t,e){var n=this.e||(this.e={}),o=n[t],r=[];if(o&&e)for(var i=0,a=o.length;i<a;i++)o[i].fn!==e&&o[i].fn._!==e&&r.push(o[i]);return r.length?n[t]=r:delete n[t],this}},t.exports=n},function(t,e,n){var d=n(5),h=n(6);t.exports=function(t,e,n){if(!t&&!e&&!n)throw new Error("Missing required arguments");if(!d.string(e))throw new TypeError("Second argument must be a String");if(!d.fn(n))throw new TypeError("Third argument must be a Function");if(d.node(t))return s=e,f=n,(l=t).addEventListener(s,f),{destroy:function(){l.removeEventListener(s,f)}};if(d.nodeList(t))return a=t,c=e,u=n,Array.prototype.forEach.call(a,function(t){t.addEventListener(c,u)}),{destroy:function(){Array.prototype.forEach.call(a,function(t){t.removeEventListener(c,u)})}};if(d.string(t))return o=t,r=e,i=n,h(document.body,o,r,i);throw new TypeError("First argument must be a String, HTMLElement, HTMLCollection, or NodeList");var o,r,i,a,c,u,l,s,f}},function(t,n){n.node=function(t){return void 0!==t&&t instanceof HTMLElement&&1===t.nodeType},n.nodeList=function(t){var e=Object.prototype.toString.call(t);return void 0!==t&&("[object NodeList]"===e||"[object HTMLCollection]"===e)&&"length"in t&&(0===t.length||n.node(t[0]))},n.string=function(t){return"string"==typeof t||t instanceof String},n.fn=function(t){return"[object Function]"===Object.prototype.toString.call(t)}},function(t,e,n){var a=n(7);function i(t,e,n,o,r){var i=function(e,n,t,o){return function(t){t.delegateTarget=a(t.target,n),t.delegateTarget&&o.call(e,t)}}.apply(this,arguments);return t.addEventListener(n,i,r),{destroy:function(){t.removeEventListener(n,i,r)}}}t.exports=function(t,e,n,o,r){return"function"==typeof t.addEventListener?i.apply(null,arguments):"function"==typeof n?i.bind(null,document).apply(null,arguments):("string"==typeof t&&(t=document.querySelectorAll(t)),Array.prototype.map.call(t,function(t){return i(t,e,n,o,r)}))}},function(t,e){if("undefined"!=typeof Element&&!Element.prototype.matches){var n=Element.prototype;n.matches=n.matchesSelector||n.mozMatchesSelector||n.msMatchesSelector||n.oMatchesSelector||n.webkitMatchesSelector}t.exports=function(t,e){for(;t&&9!==t.nodeType;){if("function"==typeof t.matches&&t.matches(e))return t;t=t.parentNode}}}])});







