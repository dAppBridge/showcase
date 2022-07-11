
var OLD_TOKEN_LIMIT = 150; // TODO
var canPlay = false;

var minBet = 0.001;
var maxBet = 0.002;
var account = 0x00;
var PlanetCryptoContract;
var PlanetCryptoContractOld;
var PlanetCryptoContractOld2;
var PlanetCryptoContractPlay;
var PlanetCryptoCoinContract;
var PlanetCryptoCoinContractPlay;

var playing = false;

//var useGasPrice = 9000000000;
var useGasPrice = 10000000000;

var ethGasStationAPI = 'https://ethgasstation.info/json/ethgasAPI.json';

//var img_map;

// live   
var contractAddress = "0x533bafa16aa76218ec4a365ad71bf8816cf21bbb"; // v2
//var contractAddress = "0x1806B3527C18Fb532C46405f6f014C1F381b499A"; // v2
var coinsContractAddress = "0xA1c8031EF18272d8BfeD22E1b61319D6d9d2881B"; // latest
var contractAddressOld = "0x8C55B18e6bb7083b29102e57c34d0C3124c0a952"; // orig
var contractAddressOld2 = "0x1806B3527C18Fb532C46405f6f014C1F381b499A"; // v1
var logsSubscription;

// dev
//var contractAddressOld = "0x4404a0b69fd19fb8ea05ff883598e0a3883f7557";
//var coinsContractAddress = "0xe1418a2546fe0c35653c89b354978bd1772bb431";

// dev new contract..
//var contractAddress = "0xd13faafc8e8b3f1acc6b84c8df845992e56dcd5b";
//var coinsContractAddress = "0xe1418a2546fe0c35653c89b354978bd1772bb431";

var useTestnet = false;
var isMainGame = true;
var isDetail = false;


var eth_to_usd = 194.683;
var PLOT_SIZE = 20;
var CURRENT_RESALE_MULTIPLIER = 2;
var CURRENT_EMPIRE_MULTIPLIER = 1.5;
var PERCENT_SPEED = 200;
var GAME_UPDATE_SPEED = 10000;


//L.MakiMarkers.accessToken = MB_TOKEN;

var MIN_BUY_LVL = 17; // min zoom level we allow buys to operate at
var MAX_BUY_RADIUS = 200;
var currentLandPrice = new BigNumber(20000000000000000); // 0.02 ETH
var currentEmpirePerPlot = 100;
var displayGameID = 1;
var maxGames = 2;
var _referer = "0x0000000000000000000000000000000000000000";


var rects = {};

var grid18;
var grid17;
var grid16;

var grid15;

var lightGrids = {};


var grid14;
var grid13;
var grid12;
var grid11;
var grid10;
var grid9;
var grid8;
var grid7;
var grid6;
var grid5;
var grid4;
var grid3;
var grid2;
var grid1;
var grid0;

var gridIinit = false;
var grid17Iinit = false;
var grid16Iinit = false;
var grid15Iinit = false;
var grid14Iinit = false;
var grid13Iinit = false;
var grid12Iinit = false;
var grid11Iinit = false;
var grid10Iinit = false;
var grid9Iinit = false;
var grid8Iinit = false;
var grid7Iinit = false;
var grid6Iinit = false;
var grid5Iinit = false;
var grid4Iinit = false;
var grid3Iinit = false;
var grid2Iinit = false;
var grid1Iinit = false;
var grid0Iinit = false;
var onDownEvent = false;
var inSubtractionMode = false;
var rectsToBuy = {};

//var currentDisplayMinGridMinX = 180;
//var currentDisplayMinGridMaxX = -180;
//var currentDisplayMinGridMinY = 85;
//var currentDisplayMinGridMaxY = -85;
var mymap;




var _findTokenId;



var layer;
var layerLabels;
var actionMode = '';
var allowedPlotsCircle;
var currentlySelectedMarker;
var currentlySelectedMarkerRemoved = false;
var blankCardIcon = L.icon({
    iconUrl: 'images/blank-card.png',
    iconSize: [37, 50],
    iconAnchor: [37,50],

    shadowUrl: 'images/card-shadow.png',
    shadowSize: [38, 52],
    shadowAnchor: [34, 47]

	});


var isConnected = false;
var minPlayAmount = new BigNumber(0);
var userWalletAddress = "0x00";
var userWalletAddressShort = "0x00";
var userWalletBalance = 0;

var TOAST_HIDE_DELAY = 10000;
var TOAST_HIDE_TRANSITION = 'slide';

var web3Connection;
var gameConnection;
var gameConnectionConnected = false;
var statsConnectionConnected = false;


var currentPlayers = 0;
var currentUserLand = 0;
var currentUserEmpireScore = 0;

var tokens = {}; 

var plots = {};

var isCard = 0;

var CONNECTION_TO_USE = "wss://mainnet.infura.io/ws";
//var CONNECTION_TO_USE = "wss://ropsten.infura.io/ws";

function viewContract() {
  var win = window.open('https://etherscan.io/address/' + contractAddress, '_blank');
  if (win) {
      win.focus();
  } 
}


var share_url = 'https://planetcrypto.app';
var share_title = 'Planet Crypto ~ Own the World!';
var share_description = 'Im playing the biggest Crypto Game - Plant Crypto...';


function shareExistingCard(){
	//
	//$("#addThisIframe").attr("src","//api.addthis.com/oexchange/0.8/offer?url=" + escape(share_url) + '&pub_id=ra-5bed6d6fe2749d93&description=' + escape(share_description));

	var win = window.open("https://www.addthis.com/bookmark.php?url=" + escape(share_url) + '&pub_id=ra-5bed6d6fe2749d93&description=' + escape(share_description), '_blank');
	//$("#addThisIframe").attr("src","https://www.addthis.com/bookmark.php?url=" + escape(share_url) + '&pub_id=ra-5bed6d6fe2749d93&description=' + escape(share_description));
	//$("#shareDiv").foundation('open');

}


var isMobile = false;
var shareEarnEthBtn;
var provider;
//isMobile = true; // DEBUG DEBUG DEBUG

//window.addEventListener('load', async () => {



// ENTRY
window.addEventListener('load', function(){



	var reconnectTries = 0;

	if(window.location.href.indexOf("card.htm") > -1)
		isCard = "1";


	if(isCard == "1"){
		setupReadOnlyWeb3();
	} else {


	    if (window.ethereum) {


	        gameConnection = new Web3(ethereum);
	        try {
	            // Request account access if needed



				async function setupWeb3Permission() {
					try{
						var result = await ethereum.enable();
			            gameConnectionConnected = true;

						try{
							PlanetCryptoContractPlay = new gameConnection.eth.Contract(planetCryptoABI, contractAddress);
							PlanetCryptoContractOld = new gameConnection.eth.Contract(planetCryptoABI, contractAddressOld);
							PlanetCryptoContractOld2 = new gameConnection.eth.Contract(planetCryptoABI, contractAddressOld2);
						} catch(e){
						}

						try{
							PlanetCryptoCoinContractPlay = new gameConnection.eth.Contract(planetCryptoCoinABI, coinsContractAddress);
						} catch(e){
						}

						checkNetwork();

					} catch(e){
						console.log("Error getting permission", e);
						gameConnectionConnected = false
						startApp();
					}
		            

					setupReadOnlyWeb3();
				}

				setupWeb3Permission();



	        } catch (error) {
	        	//console.log("ERROR", error);
	            // User denied account access...
	            setupReadOnlyWeb3();
	            showError('To play PlanetCrypto.app you need to enable permission for our domain (planetcrypto.app) for your Ethereum Wallet', 'Planet Crypto');
	            //startApp();
	        }

		    
	    }
	    // Legacy dapp browsers...
	    else if (window.web3) {


	    	// Acccounts always exposed
	        gameConnection = new Web3(web3.currentProvider);
	        gameConnectionConnected = true;
			try{
				PlanetCryptoContractPlay = new gameConnection.eth.Contract(planetCryptoABI, contractAddress);
				PlanetCryptoContractOld = new gameConnection.eth.Contract(planetCryptoABI, contractAddressOld);
				PlanetCryptoContractOld2 = new gameConnection.eth.Contract(planetCryptoABI, contractAddressOld2);
			} catch(e){
			}
			try{
				PlanetCryptoCoinContractPlay = new gameConnection.eth.Contract(planetCryptoCoinABI, coinsContractAddress);
			} catch(e){
			}
			checkNetwork();


			setupReadOnlyWeb3();
	        

	    }
	    // Non-dapp browsers...
	    else {
	        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');

	        setupReadOnlyWeb3();
	    }
	    setNewCardBg();
	}


    




	$(document).foundation();



	_findTokenId = getUrlParameter('token_id')||"";

	


	if(isCard == "1") {
		setupImgMap();

	} else {

		var isMobileCheck = window.matchMedia("only screen and (max-width: 760px)");
		if(isMobileCheck.matches){
			isMobile = true;
		}

		setupMap();


		var _newReferer = getUrlParameter('ref')||"";
		if(_newReferer.length > 0) { // newly referred
		_referer = _newReferer;
		} else { // existing user referred by someone
		var _cookieRef = Cookies.get('ref')|"";
		if(_cookieRef.length >0)
		  _referer = _cookieRef;
		}
		Cookies.set('ref', _referer, { expires: 30 });






		googleTranslateElementInit();




		$.getJSON( ethGasStationAPI, function( data ) {

			if(isNaN(data.average)){
				console.log("Unable to access ethgasstation");
			} else {
				//10000000000
				//11100000000
				//var _newGas = new BigNumber(data.safeLow).times(100000000);
				var _newGas = new BigNumber(data.average).times(100000000);
				
				console.log("New Gas:", _newGas.toString());
				useGasPrice = parseInt(_newGas.toString());
			}
			console.log("Average", data.average);
		});
		


		// https://www.cssscript.com/create-social-share-popup-box-with-pure-javascript-needsharebutton/
		


      	if(shareEarnEthBtn){
      		shareEarnEthBtn.options.url = "https://planetcrypto.app/?ref=" + userWalletAddress;
      	} else {
			shareEarnEthBtn =  new needShareDropdown(document.getElementById('shareEarnEth'), {
	      		url: 'https://planetcrypto.app/?ref=' + userWalletAddress
	      	});
      	}


		$("#jumpToLocation").change(function(e){
			$('#welcomeDiv').foundation('close');
			processJumpToLocationEvent(this);
		});

		$("#jumpToLocation2").change(function(e){
			$('#guideDiv').foundation('close');
			processJumpToLocationEvent(this);
		});



		$('#buyUpsellButtonConfirm').click(function(){  buyWithEth(); });
		$("#buywthETH").click(function(){  buyWithEthUpsell(); });
		//$("#buywthETH").click(function(){  buyWithEth(); });
		$("#buywthTokens").click(function(){ buyWithTokens(); })
		$("#withdrawButton").click(function(){ withdrawFunds();});
		$("#withdrawButton2").click(function(){ withdrawFunds();});

		//$("#shareExistingCard").click(function(){ shareExistingCard()});
		$("#existingCardURLLink").click(function(){
			var win = window.open('https://' + document.getElementById('existingCardsURL').innerHTML, '_blank');
		})


		$("#ownedCardsBtn").click(function(){
			$("#userLostCards2").removeClass("hide").addClass("hide");
			$("#userCards2").removeClass("hide");
		});

		$("#previousCardsBtn").click(function(){
			$("#userCards2").removeClass("hide").addClass("hide");
			$("#userLostCards2").removeClass("hide");
		});


		$("#cancelBuy").click(function(){
			$("#clearBuyConfirm").foundation('open');
		});

		$("#getStartedButton").click(function(){ 
			$('#welcomeDiv').foundation('close'); 
		});
		$("#welcomeIntroImage").click(function(){ 
			$('#welcomeDiv').foundation('close'); 
		});
		$("#welcomeIntroImage2").click(function(){ 
			$('#guideDiv').foundation('close'); 
			ga('send', 'event', 'GeneralActions', 'StartGameClicked');
		});

		$('#welcomeDiv').on('closed.zf.reveal', function () {
			console.log("WELCOME CLOSED");
			ga('send', 'event', 'GeneralActions', 'StartGameClicked');
			$("#google_translate_element").removeClass("google_translate_element").addClass("google_translate_element_final");
		});

		$("#readMoreButton").click(function(){ showGuide(); });
		$("#cryptoGuideBtn").click(function(){ showGuide(); });
		$("#cryptoGuideBtnMobile").click(function(){ showGuide(); });
		$("#buyMultiple").click(function(){   startBuyMultiple() ;} );
		$("#buySingle").click(function(){  startBuySingle();} );
		$("#removeSingle").click(function(){ startRemoveSingle();} );
		$("#removeAll").click(function(){ 
			$("#clearBuyConfirm").foundation('open');
		} );

		$("#buySingleMobile").click(function(){  startBuySingle();} );
		$("#removeSingleMobile").click(function(){ startRemoveSingle();} );
		$("#removeAllMobile").click(function(){ 
		$("#clearBuyConfirm").foundation('open');
		} );


		$('#padlockLink').click(function() {
			switchCOINlockstatus();
		})
		$('#padlockLinkMobile').click(function() {
			switchCOINlockstatus();
		})

		$("#clearBuyButtonConfirm").click(function(){
			startRemoveAll();
		});

		$("#newCardStartPointLink").click(function(){ gotoStartPointLink(); })
		$("#existingCardStartPointLink").click(function(){ gotoExistingCardStartPoint(); })
		$('#existingCardOwner').click(function(){
			var win = window.open('https://etherscan.io/address/' + document.getElementById('existingCardOwner').value, '_blank');
		});
		$('#buyExistingWthETH').click(function(){ buyExistingCard(); });
		$('#destoryButtonBuy').click(function(){ buyExistingCard(); });
		$('#destoryButtonConfirm').click(function() {destroyCard(); });


		$('#newCardStartOwner').click(function(){
			var win = window.open('https://etherscan.io/address/' + document.getElementById('newCardOwnerAddr').value, '_blank');
		});

		$('#closeExistingCard').click(function(){
			$('#existingCardDiv').foundation('close'); 
		});

		$('#destoryExistingCard').click(function(){
			destroyConfirm();
		});


		var tabs = new Foundation.Tabs($("#bottomCardsTabs"));
		$("#bottomCardsTabs").on('change.zf.tabs', function(e){


			if($('#panel1:visible').length){
			  $("#tab1").addClass("tabs-title1-selected").removeClass("tabs-title1");
			  $("#tab2").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab3").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab4").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab5").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab6").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab7").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			}
			if($('#panel2:visible').length){
			  $("#tab1").addClass("tabs-title1").removeClass("tabs-title1-selected");
			  $("#tab2").addClass("tabs-title-standard-selected").removeClass("tabs-title-standard");
			  $("#tab3").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab4").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab5").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab6").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab7").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			}
			if($('#panel3:visible').length){
			  $("#tab1").addClass("tabs-title1").removeClass("tabs-title1-selected");
			  $("#tab2").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab3").addClass("tabs-title-standard-selected").removeClass("tabs-title-standard");
			  $("#tab4").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab5").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab6").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab7").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			}
			if($('#panel4:visible').length){
			  $("#tab1").addClass("tabs-title1").removeClass("tabs-title1-selected");
			  $("#tab2").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab3").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab4").addClass("tabs-title-standard-selected").removeClass("tabs-title-standard");
			  $("#tab5").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab6").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab7").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			}
			if($('#panel5:visible').length){
			  $("#tab1").addClass("tabs-title1").removeClass("tabs-title1-selected");
			  $("#tab2").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab3").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab4").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab5").addClass("tabs-title-standard-selected").removeClass("tabs-title-standard");
			  $("#tab6").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab7").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			}
			if($('#panel6:visible').length){
			  $("#tab1").addClass("tabs-title1").removeClass("tabs-title1-selected");
			  $("#tab2").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab3").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab4").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab5").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab6").addClass("tabs-title-standard-selected").removeClass("tabs-title-standard");
			  $("#tab7").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			}
			if($('#panel7:visible').length){
			  $("#tab1").addClass("tabs-title1").removeClass("tabs-title1-selected");
			  $("#tab2").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab3").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab4").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab5").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab6").addClass("tabs-title-standard").removeClass("tabs-title-standard-selected");
			  $("#tab7").addClass("tabs-title-standard-selected").removeClass("tabs-title-standard");
			}
		});



		$('#loadingGif').attr('src', 'images/loading.gif');
		$('#loadingGif2').attr('src', 'images/loading.gif');
		
		$('#welcomeCard1').attr('src','images/real_madrid_card.jpg');
		$('#welcomeCard2').attr('src','images/the_alamo_card.jpg');

		
		var hideWelcome = getUrlParameter('hideWelcome')||"";
		if(hideWelcome == "1") {

		} else {

			//setTimeout(function(){
			$('#welcomeDiv').removeClass("hide");
			$('#welcomeDiv').foundation('open');
			//},200);

		}


	}
	


});



function setupReadOnlyWeb3() {
	console.log("gameConnectionConnected", gameConnectionConnected);

    if(!gameConnectionConnected) {



	    // READ ONLY CONNECTION...
	    provider = new Web3.providers.WebsocketProvider(CONNECTION_TO_USE);
	    console.log("provider:", provider);
	    console.log("GAME CONNECTION:", gameConnection);
	    
	    provider.on('connect',function(e){
			web3Connection = new Web3(provider);


			console.log("Starting main listeners");

			//if(gameConnection){
				// it will be started after trying to get user wallet address
			//	console.log("HAVE GAME CONNECTION");
			//} else {
			//	console.log("NO GAME CONNECTION");
				setTimeout(function(){
					statsConnectionConnected = true;
					startApp();	
				},500);
				
			//}
/*
		    var subscription = getReadOnlyWeb3Utils().eth.subscribe('newBlockHeaders', function(error, blockHeader) {

		      if (error) return console.error(error);


		      statsConnectionConnected = true;

		    }).on('data', function(blockHeader){
		      
		    }).on('error', function(error){
		      
		    });
*/
	    });

	    provider.on('error', function(e){
	      console.error('WS Error', e);
	      reconnectProvider(0);
	    });

	    provider.on('end', function(e) {
	    	//console.log("Resetting provider...");
	    	

	      reconnectProvider(0);
	    });

    }
}


var fireGameDataReadyCounter = 0;
var finalLogItemProcessed = false;

function processLogResult(logResult, isInit, isFinalItem, callback_func){

	//if(isFinalItem)
	//console.log("isFinalItem", isFinalItem, logResult);

	var showToast = true;

	if(isInit == true) {
		showToast = false;
	}

	if(logResult.event =='landPurchased'){

		
		if(isInit == true) {

			// need to stager them 
			if(isFinalItem == true) {
				populateTokens(logResult.returnValues.token_id, true, callback_func);
				finalLogItemProcessed = true;
			} else {
				if(fireGameDataReadyCounter == 0){
					populateTokens(logResult.returnValues.token_id, true, callback_func);
					fireGameDataReadyCounter = 10;
				}else{
					populateTokens(logResult.returnValues.token_id, false, callback_func);
					fireGameDataReadyCounter --;
				}
			}

			// only inc if new card...
			if(parseInt(logResult.returnValues.token_id) > totalCards) {
				totalCards = parseInt(logResult.returnValues.token_id);
			}

			updateInnerHTML('totalCards', totalCards);
			updateInnerHTML('totalCardsMobile', totalCards);

			if(totalCards > 200){
				updateInnerHTML('startCards', totalCards);
			}

		} else {
			// could be this is not getting data due to it not being available on all nodes yet???
			setTimeout(function(){
				populateTokens(logResult.returnValues.token_id, true, callback_func);
			},2500);

		


			var _msg = 'By: ' + logResult.returnValues.buyer.substring(0,10) + "..." + "<br/>";
			_msg += 'For: ' + getReadOnlyWeb3Utils().utils.fromWei(logResult.returnValues.bought_at.toString(), 'ether').substring(0,8) + " ETH<br/>";
			_msg += 'Size: ' + parseInt(logResult.returnValues.size) * PLOT_SIZE + 'm<sup>2</sup><br/>';
			_msg += 'Empire Score: +' + logResult.returnValues.empire_score;

			$.toast({
			  heading: 'New Card Purchased!',
			  text: _msg,
			  icon: 'info',
			  allowToastClose: true,
			  position: 'bottom-right',
			  hideAfter: TOAST_HIDE_DELAY,
			  showHideTransition: TOAST_HIDE_TRANSITION
			});
		

			// inc game stats...
			totalLandSize += parseInt(logResult.returnValues.size) * PLOT_SIZE;
			updateTotalLandSize(); 

			totalCards++;
			updateInnerHTML('totalCards', totalCards);
			updateInnerHTML('totalCardsMobile', totalCards);
			if(totalCards > 200){
				updateInnerHTML('startCards', totalCards);
			}

			// check if it is this players card...
			if(logResult.returnValues.buyer.toUpperCase() == userWalletAddress.toUpperCase()){
				currentUserLand = currentUserLand + (parseInt(logResult.returnValues.size) * PLOT_SIZE);
				var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
				var userLandSizeUnit = "m";
				if(userLandSize > 99999) {
					userLandSize = userLandSize / 1000;
					userLandSizeUnit = "km";
				}

				updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
				updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

				currentUserEmpireScore = currentUserEmpireScore + parseInt(logResult.returnValues.empire_score);

				updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
				updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);
			}
		}

		if(callback_func)
			callback_func();
		

	}

	if(showToast) {
		if(logResult.event == 'taxDistributed') {
			// logResult.returnValues.amnt
			// logResult.returnValues.timestamp
			// logResult.returnValues.total_players
			if(parseInt(logResult.returnValues.amnt) > 0) {

				var _msg = "Amount: " + getReadOnlyWeb3Utils().utils.fromWei(logResult.returnValues.amnt.toString(), 'ether').substring(0,8) + " ETH<br/>";
				_msg += "To: " + logResult.returnValues.total_players + " Players";

				$.toast({
				  heading: 'Land Tax Distributed!',
				  text: _msg,
				  icon: 'info',
				  allowToastClose: true,
				  position: 'bottom-right',
				  hideAfter: TOAST_HIDE_DELAY,
				  showHideTransition: TOAST_HIDE_TRANSITION
				});
			}
		}

		if(logResult.event == 'referralPaid') {
			var _msg = logResult.returnValues.to.substring(0,10) + "...<br/>";
			_msg += "has just earned a referral bonus of:<br/>"
			_msg += getReadOnlyWeb3Utils().utils.fromWei(logResult.returnValues.amnt.toString(), 'ether').substring(0,8) + " ETH<br/>";
			_msg += "Check the Guide for info on how you can earn ETH!";

			$.toast({
			  heading: 'Referral Bonus Earned!',
			  text: _msg,
			  icon: 'info',
			  allowToastClose: true,
			  position: 'bottom-right',
			  hideAfter: TOAST_HIDE_DELAY,
			  showHideTransition: TOAST_HIDE_TRANSITION
			});
		}

		if(logResult.event == 'issueCoinTokens'){
			var _msg = logResult.returnValues.to.substring(0,10) + "...<br/>";
			_msg += "has just earned a PlanetCOINs:<br/>"
			_msg += logResult.returnValues.amnt.toString() + " PlanetCOINS<br/>";
			_msg += "Check the Guide for info on how you can earn PlanetCOINS!";
			$.toast({
			  heading: 'PlanetCOINs Earned!',
			  text: _msg,
			  icon: 'info',
			  allowToastClose: true,
			  position: 'bottom-right',
			  hideAfter: TOAST_HIDE_DELAY,
			  showHideTransition: TOAST_HIDE_TRANSITION
			});
		}
	}

	if(logResult.event == 'cardBought'){

		// update the tokens total trades stats
		// find the token in tokens[]
		// add to tokens[].previous_owners

		//console.log("cardBought", logResult);

		//console.log("before", tokens[logResult.returnValues.token_id]);
		//console.log(tokens);
		tokens[logResult.returnValues.token_id].buy_history.push(
				{
					token_owner: logResult.returnValues.to,
					from: logResult.returnValues.from,
					bought_at: logResult.returnValues.new_value,
					orig_value: logResult.returnValues.orig_value,
					ts: logResult.returnValues.now
				}
			);

		//console.log("after", tokens[logResult.returnValues.token_id]);

		
		if(isInit) {

			


		} else {

			//populateTokens(logResult.returnValues.token_id, true, callback_func);

			var _encodedName;

			try{
				_encodedName = getReadOnlyWeb3Utils().utils.utf8ToHex(logResult.returnValues.name);
			} catch(e) {
				_encodedName = getReadOnlyWeb3Utils().utils.fromAscii(logResult.returnValues.name);
			}

		
			var _msg = "Name: " + _encodedName + "<br/>";
			_msg += 'By: ' + logResult.returnValues.to.substring(0,10) + "..." + "<br/>";
			_msg += 'From: ' + logResult.returnValues.from.substring(0,10) + "..." + "<br/>";
			_msg += 'For: ' + getReadOnlyWeb3Utils().utils.fromWei(logResult.returnValues.new_value.toString(), 'ether').substring(0,8) + " ETH<br/>";
			_msg += 'Empire Score: +' + logResult.returnValues.newEmpireScore;

			if(logResult.returnValues.from.toUpperCase() == userWalletAddress.toUpperCase()){
				$.toast({
				  heading: 'One of your cards has been taken over!',
				  text: _msg,
				  icon: 'error',
				  allowToastClose: true,
				  position: 'bottom-right',
				  hideAfter: TOAST_HIDE_DELAY,
				  showHideTransition: TOAST_HIDE_TRANSITION
				});
			} else {
				$.toast({
				  heading: 'Card Hostile Take Over!',
				  text: _msg,
				  icon: 'info',
				  allowToastClose: true,
				  position: 'bottom-right',
				  hideAfter: TOAST_HIDE_DELAY,
				  showHideTransition: TOAST_HIDE_TRANSITION
				});
			}
		


			totalTrades ++;
			updateInnerHTML('totalTrades', totalTrades);
			updateInnerHTML('totalTradesMobile', totalTrades);


			// check if it is this players card...
			if(logResult.returnValues.to.toUpperCase() == userWalletAddress.toUpperCase()){

				getReadOnlyPlanetCryptoContract().methods.getToken(logResult.returnValues.token_id,false).call(function(err,results){
					if(!err){
						//console.log(results);

						currentUserLand = currentUserLand + (parseInt(results.plots_lat.length) * PLOT_SIZE);
						var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
						var userLandSizeUnit = "m";
						if(userLandSize > 99999) {
							userLandSize = userLandSize / 1000;
							userLandSizeUnit = "km";
						}

						updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
						updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

						currentUserEmpireScore = currentUserEmpireScore + parseInt(logResult.returnValues.newEmpireScore);

						updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
						updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);
					}
				});
				// add to card deck below..
				// cards updated with populateTokens call
			}
			if(logResult.returnValues.from.toUpperCase() == userWalletAddress.toUpperCase()){
				// has been sold from the user
				// remove from the cards below...
				$('#userCardFull' + logResult.returnValues.token_id).remove();

				getReadOnlyPlanetCryptoContract().methods.getToken(logResult.returnValues.token_id,false).call(function(err,results){
					if(!err){
						//console.log(results);

						currentUserLand = currentUserLand - (parseInt(results.plots_lat.length) * PLOT_SIZE);
						var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
						var userLandSizeUnit = "m";
						if(userLandSize > 99999) {
							userLandSize = userLandSize / 1000;
							userLandSizeUnit = "km";
						}

						updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
						updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

						currentUserEmpireScore = currentUserEmpireScore - parseInt(logResult.returnValues.empireScore);

						updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
						updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);
					}
				});

			}

		}

		if(callback_func)
			callback_func();


	}

	if(logResult.event == 'Transfer'){

		//console.log("Token_id", logResult.returnValues.tokenId);
		//console.log("Have Transfer", logResult);
		//console.log("Token", tokens[logResult.returnValues.tokenId]);
		if(tokens[logResult.returnValues.tokenId]) {


			tokens[logResult.returnValues.tokenId].buy_history.push(
					{
						token_owner: logResult.returnValues.to,
						from: logResult.returnValues.from//,
						//bought_at: logResult.returnValues.new_value,
						//orig_value: logResult.returnValues.orig_value,
						//ts: logResult.returnValues.now
					}
				);

			//console.log("after", tokens[logResult.returnValues.token_id]);

			
			if(isInit) {

				


			} else {

				//populateTokens(logResult.returnValues.token_id, true, callback_func);


				totalTrades ++;
				updateInnerHTML('totalTrades', totalTrades);
				updateInnerHTML('totalTradesMobile', totalTrades);


				// check if it is this players card...
				if(logResult.returnValues.to.toUpperCase() == userWalletAddress.toUpperCase()){

					getReadOnlyPlanetCryptoContract().methods.getToken(logResult.returnValues.token_id,false).call(function(err,results){
						if(!err){
							//console.log(results);

							currentUserLand = currentUserLand + (parseInt(results.plots_lat.length) * PLOT_SIZE);
							var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
							var userLandSizeUnit = "m";
							if(userLandSize > 99999) {
								userLandSize = userLandSize / 1000;
								userLandSizeUnit = "km";
							}

							updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
							updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

							currentUserEmpireScore = currentUserEmpireScore + parseInt(logResult.returnValues.newEmpireScore);

							updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
							updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);
						}
					});
					// add to card deck below..
					// cards updated with populateTokens call
				}
				if(logResult.returnValues.from.toUpperCase() == userWalletAddress.toUpperCase()){
					// has been sold from the user
					// remove from the cards below...
					$('#userCardFull' + logResult.returnValues.token_id).remove();

					getReadOnlyPlanetCryptoContract().methods.getToken(logResult.returnValues.token_id,false).call(function(err,results){
						if(!err){
							//console.log(results);

							currentUserLand = currentUserLand - (parseInt(results.plots_lat.length) * PLOT_SIZE);
							var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
							var userLandSizeUnit = "m";
							if(userLandSize > 99999) {
								userLandSize = userLandSize / 1000;
								userLandSizeUnit = "km";
							}

							updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
							updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

							currentUserEmpireScore = currentUserEmpireScore - parseInt(logResult.returnValues.empireScore);

							updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
							updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);
						}
					});

				}

			}
		}

		if(callback_func)
			callback_func();


	}


	if(isInit == true){

	} else {

		// update number of players, tax dist etc on each new log entry...
		processOtherStats();
	}


}


function getReadOnlyPlanetCryptoContract() {
	if(gameConnectionConnected) {
		return PlanetCryptoContractPlay;
	} else {
		return PlanetCryptoContract;
	}
}

function getReadOnlyPlanetCryptoCoinContract() {
	if(gameConnectionConnected) {
		return PlanetCryptoCoinContractPlay;
	} else {
		return PlanetCryptoCoinContract;
	}
}

function getReadOnlyWeb3Utils() {
	if(gameConnectionConnected) {
		return gameConnection;
	} else {
		return web3Connection;
	}
}

function processOtherStats(){
	// totalPlayers, PlayerCoins currentPlotPrice
	getReadOnlyPlanetCryptoContract().methods.getAllPlayerObjectLen().call(function(err,results){
		if(err){
			
		} else {
			currentPlayers = parseInt(results);

			// ignore c=0 which is blank
			updateInnerHTML('totalPlayers', currentPlayers-1);
			updateInnerHTML('totalPlayersMobile', currentPlayers-1);
		}
	});

	updateCurrentLandPrice();


	//taxFund
	getReadOnlyPlanetCryptoContract().methods.tax_fund().call(function(err,results){
		if(err){

		} else {
			tax_fund = new BigNumber(results);
			updateInnerHTML('taxFund', getReadOnlyWeb3Utils().utils.fromWei(tax_fund.toString(), 'ether').substring(0,8));
			updateInnerHTML('taxFundMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_fund.toString(), 'ether').substring(0,8));
		}
	});




	//taxDist
	getReadOnlyPlanetCryptoContract().methods.tax_distributed().call(function(err,results){
		if(err){

		} else {
			tax_distributed = new BigNumber(results);
			updateInnerHTML('taxDist', getReadOnlyWeb3Utils().utils.fromWei(tax_distributed.toString(), 'ether').substring(0,8));
			updateInnerHTML('taxDistMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_distributed.toString(), 'ether').substring(0,8));
		}
	});


	// update player coins...
	if(canPlay) {
		//yourCOINS
		getReadOnlyPlanetCryptoCoinContract().methods.balanceOf(userWalletAddress).call(function(err,results){
			if(err){

			} else {
				yourCOINS = parseInt(results);
				updateInnerHTML('yourCOINS', yourCOINS);
				updateInnerHTML('yourCOINSMobile', yourCOINS);

				// and now check lock status
				//currentPadlockstateLocked
				getReadOnlyPlanetCryptoCoinContract().methods.allowance(userWalletAddress, contractAddress).call(function(err,results){
					if(!err){
						var _newAllowance = parseInt(results);
						if(_newAllowance < yourCOINS) {
							currentPadlockstateLocked = true;
							$('#padlock').attr('src', 'images/padlock.png');
							$('#padlockMobile').attr('src', 'images/padlock.png');
						} else  {
							currentPadlockstateLocked = false;
							$('#padlock').attr('src', 'images/padlock_open.png');
							$('#padlockMobile').attr('src', 'images/padlock_open.png');
						}
					}
				});
			}
		});



		// your tax
		PlanetCryptoContractPlay.methods.taxEarningsAvailable().call({from: userWalletAddress}, function(err,results){
			if(err){
			} else {

				// from the main contract
				tax_available = new BigNumber(results);

				updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));
				updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));

				// check if there is any available on the old contract...
				PlanetCryptoContractOld2.methods.taxEarningsAvailable().call({from: userWalletAddress}, function(err,results){
					if(err){

					} else {

						//console.log("results", results);

						tax_available_old = new BigNumber(results);
						
						//console.log("tax_available player contract", tax_available.toString());
						updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));
						updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));


						// check if there is any available on the old contract...
						PlanetCryptoContractOld.methods.taxEarningsAvailable().call({from: userWalletAddress}, function(err,results){
							if(err){

							} else {

								//console.log("results", results);

								tax_available_old = new BigNumber(results);
								
								//console.log("tax_available player contract", tax_available.toString());
								updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));
								updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));


							}
						});


					}
				});



			}
		});	
	}

}

function setNewCardBg() {
	if(userWalletAddress.length > 5){
		$('#newCardHeader').css("background-color", '#' + userWalletAddress.substring(userWalletAddress.length-6));
		document.getElementById('newCardOwnerAddr').value = userWalletAddress;
		updateInnerHTML('newCardOwnerAddr', userWalletAddressShort);
	}
}

function reconnectProvider(_tries) {
  try {
  	console.log("restarting...");
  	provider = new Web3.providers.WebsocketProvider(CONNECTION_TO_USE);
  	
    provider = new Web3.providers.WebsocketProvider(CONNECTION_TO_USE);

    provider.on('connect', function () {
        console.log('WSS Reconnected');
    	web3Connection.setProvider(provider);
    	restartApp();
    });

    provider.on('error', function(e) {
		console.log('reconnect error', e);
		reconnectProvider(_tries++);
    });

    provider.on('end', function(e) {
		console.log('reconnect end', e);
		reconnectProvider(_tries++);
    })
    


  } catch (e) {
  	console.log(e);
    _tries++;
    if(_tries < 120){
      setTimeout(function() {
        reconnectProvider(_tries); 
      }, 500);
    } else {
    	showError('Unable to connect to the Blockchain - please refresh this page to try again.', 'PlanetCrypto');
    }
  }
}


function startApp() {
  if(isMainGame) {

    if(gameConnectionConnected) {
    	/*
		try{
		PlanetCryptoContractPlay = new gameConnection.eth.Contract(planetCryptoABI, contractAddress);
		} catch(e){

		}
		checkNetwork();
		*/
    } else {
      // no need to check if they are connected to mainnet...
      // show alert
      if(!shownInitialWarning){

      }
    }

	//console.log("web3Connection obj", web3Connection);
	
	if(!gameConnectionConnected){
		PlanetCryptoContractOld = new web3Connection.eth.Contract(planetCryptoABI, contractAddressOld);
		PlanetCryptoContractOld2 = new web3Connection.eth.Contract(planetCryptoABI, contractAddressOld2);
    	PlanetCryptoContract = new web3Connection.eth.Contract(planetCryptoABI, contractAddress);
    	PlanetCryptoCoinContract = new web3Connection.eth.Contract(planetCryptoCoinABI, coinsContractAddress);
	}




	if(isCard == "1") {
		// get card...
		console.log(_findTokenId);
		getReadOnlyPlanetCryptoContract().methods.getToken(_findTokenId,false).call(function(err,results){
			if(!err){
				tokens[_findTokenId] = {
					token_owner: results.token_owner,
					current_value: results.current_value,
					empire_score: results.empire_score,
					name: getReadOnlyWeb3Utils().utils.hexToUtf8(results.name),
					////img: getReadOnlyWeb3Utils().utils.hexToUtf8(results.img),
					orig_value: results.orig_value,
					card_size: results.plots_lat.length,
					plots_lat: results.plots_lat,
					plots_lng: results.plots_lng,
					buy_history: [/*
						{
							token_owner: results.token_owner,
							bought_at: results.current_value,
							ts: results.now
						}*/
					]
				};
				showExistingCard(_findTokenId, false)
			} else {
				console.log(err);
			}
		});



		

	} else {
	    processOtherStats();
		setupGameStats(true); // use web3Connection
		populateGameStats(); // use web3Connection
	    setupLogSubscription(); 


	    if(_findTokenId.length > 0) {
			showExistingCard(parseInt(_findTokenId), true);
	    }
	}

    
	console.log("DONE");



  } else {
/*
    checkNetwork(function() {
      if(!isDetail){

      } else {
        
      }
  
    });
    */
  }
}
function restartApp() {
  if(isMainGame) {

    if(gameConnectionConnected) {

      try{
        PlanetCryptoContractPlay = new gameConnection.eth.Contract(planetCryptoABI, contractAddress);
        PlanetCryptoContractOld = new gameConnection.eth.Contract(planetCryptoABI, contractAddressOld);
        PlanetCryptoContractOld2 = new gameConnection.eth.Contract(planetCryptoABI, contractAddressOld2);
       	
      } catch(e){

      }
      checkNetwork();

    } else {
      // no need to check if they are connected to mainnet...
      // show alert
      if(!shownInitialWarning){

        //showError(_msg, "Browser Check");
        //shownInitialWarning = true;
      }
    }



    console.log("Contract reset");



	//console.log("web3Connection obj", web3Connection);
	PlanetCryptoContractOld = new web3Connection.eth.Contract(planetCryptoABI, contractAddressOld);
	PlanetCryptoContractOld2 = new web3Connection.eth.Contract(planetCryptoABI, contractAddressOld2);
    PlanetCryptoContract = new web3Connection.eth.Contract(planetCryptoABI, contractAddress);
    //console.log(PlanetCryptoContract);
    PlanetCryptoCoinContract = new web3Connection.eth.Contract(planetCryptoCoinABI, coinsContractAddress);

    try{
    	setupLogSubscription();
    	processOtherStats();
	}
	catch(e)
	{
		console.log("Erorr in reset:", e);
	}


    //populateGameStats(); // runs on timer
    setupGameStats(false); // use web3Connection

  } else {
/*
    checkNetwork(function() {
      if(!isDetail){

      } else {
        
      }
    });
   */
  }
}


//var startBlock = 0;

function setupLogSubscription() {
	//console.log("setupLogSubscription");

/*	getReadOnlyWeb3Utils().eth.getBlockNumber().then(function(blockNum){
		console.log("blockNum", blockNum);
		startBlock = parseInt(blockNum);


	});*/

	//processInitBoughtCards();

	if(finalLogItemProcessed == false) {


		PlanetCryptoContractOld.getPastEvents("landPurchased",
	    	{
	    		fromBlock: 6714797
	    	},function(err, event){

	    	}).then(function(logResults){

	    		/*
	    		var lastCardSaleID = 0;
	    		for(var c=logResults.length-1; c>-1; c--){
	    			if(logResults[c].event == 'landPurchased') {
	    				lastCardSaleID = c;
	    				break;
	    			}
	    		}
	    		*/
	    		var lastCardSaleID = logResults.length-1;

				//console.log("logResults INIT", logResults);
				for(var c=0; c<logResults.length;c++){

					if(c==lastCardSaleID) {
						processLogResult(logResults[c], true, true, getOldEvents);
					}
					else {
						processLogResult(logResults[c], true, false);
					}

				}
				

			});
	
    }

	logsSubscription = getReadOnlyPlanetCryptoContract().events.allEvents(
    	{
    		fromBlock: 'latest'
    	},function(err, event){
    		//console.log("ev",err, event);
    	}).on('data', function(logResult){

			//console.log("logResults", logResult);
			processLogResult(logResult, false, false);


		}).on('error', function(logError){
			console.log("logError", logError);
		});

}

function getOldEvents() {
	PlanetCryptoContractOld2.getPastEvents("landPurchased",
    	{
    		fromBlock: 6926277
    	},function(err, event){

    	}).then(function(logResults){

    		
    		var lastCardSaleID = logResults.length-1;

			//console.log("logResults INIT", logResults);
			for(var c=0; c<logResults.length;c++){

				if(c==lastCardSaleID) {
					processLogResult(logResults[c], true, true, processInitBoughtCards);
				}
				else {
					processLogResult(logResults[c], true, false);
				}

			}
			

		});
}

function processInitBoughtCards() {

	// land purchased from the new contract...
	getReadOnlyPlanetCryptoContract().getPastEvents("landPurchased",
    	{
    		fromBlock: 7049299 
    	},function(err, event){

    	}).then(function(logResults){

    		/*
    		var lastCardSaleID = 0;
    		for(var c=logResults.length-1; c>-1; c--){
    			if(logResults[c].event == 'landPurchased') {
    				lastCardSaleID = c;
    				break;
    			}
    		}
    		*/
    		var lastCardSaleID = logResults.length-1;

			//console.log("logResults INIT", logResults);
			//console.log("lastCardSaleID", lastCardSaleID)
			for(var c=0; c<logResults.length;c++){
				//console.log("c", c);
				if(c==lastCardSaleID) {
					processLogResult(logResults[c], true, true, processTransfers);
				}
				else {
					processLogResult(logResults[c], true, false);
				}

			}

		});



}

function processInitBoughtCards2(){


	getReadOnlyPlanetCryptoContract().getPastEvents("cardBought",
    	{
    		fromBlock: 6926277
    	},function(err, event){

    	}).then(function(logResults){

    		/*
    		var lastCardSaleID = 0;
    		for(var c=logResults.length-1; c>-1; c--){

    			if(logResults[c].event == 'cardBought') {
    				lastCardSaleID = c;
    				break;
    			}
    		}
    		*/
    		var lastCardSaleID = logResults.length-1;

    		//console.log("logResults", logResults);
			console.log("lastCardSaleID",lastCardSaleID);
			for(var c=0; c<logResults.length;c++){

				if(c==lastCardSaleID) {
					processLogResult(logResults[c], true, true, processTransfers);

				}
				else {
					processLogResult(logResults[c], true, false);
				}

			}

		});
}

	// need to check Transfer events too

function processTransfers(){

	
	getReadOnlyPlanetCryptoContract().getPastEvents("Transfer",
    	{
    		fromBlock: 7049299
    	},function(err, event){

    	}).then(function(logResults){
    		
    		if(logResults.length == 0){
    			processTransfers2();
    		} else {


	    		var lastCardSaleID = logResults.length-1;

	    		//console.log("logResults", logResults);

				for(var c=0; c<logResults.length;c++){

					if(c==lastCardSaleID) {
						processLogResult(logResults[c], true, true, processTransfers2);

					}
					else {
						processLogResult(logResults[c], true, false);
					}

				}

			}

		});
}

function processTransfers2(){

	PlanetCryptoContractOld.getPastEvents("Transfer",
    	{
    		fromBlock: 6714797
    	},function(err, event){

    	}).then(function(logResults){

    		//console.log(logResults);

    		if(logResults.length == 0){
    			updatePreviousCards();
    		} else {


	    		var lastCardSaleID = logResults.length-1;

	    		//console.log("logResults", logResults);
				//console.log("lastCardSaleID",lastCardSaleID);
				for(var c=0; c<logResults.length;c++){

					if(c==lastCardSaleID) {
						processLogResult(logResults[c], true, true, processTransfers3);

					}
					else {
						processLogResult(logResults[c], true, false);
					}

				}

			}

		});
}

function processTransfers3(){
	PlanetCryptoContractOld2.getPastEvents("Transfer",
    	{
    		fromBlock: 6926277
    	},function(err, event){

    	}).then(function(logResults){

    		//console.log(logResults);

    		if(logResults.length == 0){
    			updatePreviousCards();
    		} else {


	    		var lastCardSaleID = logResults.length-1;

	    		//console.log("logResults", logResults);
				//console.log("lastCardSaleID",lastCardSaleID);
				for(var c=0; c<logResults.length;c++){

					if(c==lastCardSaleID) {
						processLogResult(logResults[c], true, true, updatePreviousCards);

					}
					else {
						processLogResult(logResults[c], true, false);
					}

				}

			}

		});
}


var lastBlock = 0;
var shownInitialWarning = false;
function checkNetwork(_callback) {
	console.log("checkNetwork", gameConnection);
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
		console.log("GETTING WALLET ADDR");
        getUserWalletAddress();


      } else {


        console.log("NOT CONNECTED" + searchNetwork + ":" + output);

      	gameConnectionConnected = false;
      	setupReadOnlyWeb3();

        //deactivateGame();

        //if(!shownInitialWarning){
         // 	canPlay = false;

        	//startApp();
        // don't do anything here as it is handled when they try and play...
        //  $('#notConnectedModel').foundation('open');
        //  shownInitialWarning = true;
        //}
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

function getUserWalletAddress() {

  try {
    gameConnection.eth.getCoinbase(function(err, res) {

      	if (!err) {
      		var output = "";
          	output = res;
          	if(!output) {
          		console.log("NOT LOGGED IN!");
          		userWalletAddressShort = "";
          		userWalletAddress = ""
          		startApp();

          	} else {

	          	userWalletAddress = output;

	          	if(shareEarnEthBtn){
	          		shareEarnEthBtn.options.url = "https://planetcrypto.app/?ref=" + userWalletAddress;
	          	} else {
					shareEarnEthBtn =  new needShareDropdown(document.getElementById('shareEarnEth'), {
			      		url: 'https://planetcrypto.app/?ref=' + userWalletAddress
			      	});
	          	}


	          	updateInnerHTML('refid', "https://planetcrypto.app/?ref=" + userWalletAddress);
	          	
	          	
	          	console.log("userWalletAddress:", userWalletAddress);
	          	if(output) {
	            	userWalletAddressShort = output.substring(0,10) + "...";
	          	}
	        	canPlay = true;

	        	setNewCardBg();

	        	startApp();
	        	initUserStats();
        	}
        }
        else
        {
          
          canPlay = false;
          startApp();

        }
      
    });
  } catch(e) {
	console.log(e);
	canPlay = false;
	startApp();
  }
}










function setupGameStats(isInit) {
	initStats();

}

function populateGameStats(){
	//refreshStats();
}
var mapData = {
	tokens: {},
	plots: {}
};
var tokens = {};



function populateTokens(_token_id, fireGameDataReady, callback_func) {
	//console.log("requiresLogRead", requiresLogRead);



	//getReadOnlyPlanetCryptoContract().methods.getToken(_token_id,false).call(function(err,results){
	var _processPopulateTokens = function(err,results){
		if(!err){
			//console.log(results);


			try{
				tokens[_token_id] = {
					token_owner: results.token_owner,
					current_value: results.current_value,
					empire_score: results.empire_score,
					name: getReadOnlyWeb3Utils().utils.hexToUtf8(results.name),
					////img: getReadOnlyWeb3Utils().utils.hexToUtf8(results.img),
					orig_value: results.orig_value,
					card_size: results.plots_lat.length,
					plots_lat: results.plots_lat,
					plots_lng: results.plots_lng,
					buy_history: [/*
						{
							token_owner: results.token_owner,
							bought_at: results.current_value,
							ts: results.now
						}*/
					]
				}; // was toAscii
			} catch(e){
				tokens[_token_id] = {
					token_owner: results.token_owner,
					current_value: results.current_value,
					empire_score: results.empire_score,
					name: getReadOnlyWeb3Utils().utils.toAscii(results.name),
					////img: getReadOnlyWeb3Utils().utils.toAscii(results.img),
					orig_value: results.orig_value,
					card_size: results.plots_lat.length,
					plots_lat: results.plots_lat,
					plots_lng: results.plots_lng,
					buy_history: [/*
						{
							token_owner: results.token_owner,
							bought_at: results.current_value,
							ts: results.now
						}*/
					]
				}; // was toAscii
			}




			if(fireGameDataReady){

				startFireGameDataReady();
			}

			if(callback_func)
				callback_func();

		}
	};

	
	//getReadOnlyPlanetCryptoContract().methods.getTokenEnhanced(_token_id,false).call(_processPopulateTokens);		
	getReadOnlyPlanetCryptoContract().methods.getToken(_token_id,false).call(_processPopulateTokens);		
	
}


function startFireGameDataReady(){
	if(mymap){
		mymap.fire("gameDataReady");	
	} else {
		// retry in 5s
		setTimeout(function(){
			startFireGameDataReady();
		},2000);
	}
}

var players = [];


var playersSortedByEmpireScore = players.sort(function(obj1, obj2) {
	return parseFloat(obj2.totalEmpireScore) - parseFloat(obj1.totalEmpireScore);
});

var playersSortedByTotalLand = players.sort(function(obj1, obj2) {
	return parseFloat(obj2.totalLand) - parseFloat(obj1.totalLand);
});


var totalLandSize = 0;
var totalTrades = 0;
var tax_fund = new BigNumber(0);
var tax_distributed = new BigNumber(0);
var tax_available = new BigNumber(0);
var tax_available_old = new BigNumber(0);
var tax_available_old2 = new BigNumber(0);
var totalCards = 0;
var yourCOINS = 0;
var currentLandPrice = new BigNumber(0);



function initStats() {
	updateCurrentLandPrice();

	// get number of players in game first...
	getReadOnlyPlanetCryptoContract().methods.getAllPlayerObjectLen().call(function(err,results){
		if(err){
			
		} else {
			currentPlayers = parseInt(results);

			// ignore c=0 which is blank
			updateInnerHTML('totalPlayers', currentPlayers-1);
			updateInnerHTML('totalPlayersMobile', currentPlayers-1);

			totalLandSize = 0;
			var updatedUserStats = false;
			for(var c=1;c<currentPlayers;c++) {
				getReadOnlyPlanetCryptoContract().methods.all_playerObjects(c).call(function(err,results){
					if(err){
						
					} else {
						//console.log("player", results);
						players.push({
							lastAccess: results.lastAccess,
							playerAddress: results.playerAddress,
							totalEmpireScore: results.totalEmpireScore,
							totalLand: results.totalLand
						});

						totalLandSize += parseInt(results.totalLand) * PLOT_SIZE;
						updateTotalLandSize();
						if(canPlay){
							try {
								if(results.playerAddress.toUpperCase() == userWalletAddress.toUpperCase()){
									console.log(userWalletAddress);
									// update current stats
									updatedUserStats = true;
									currentUserLand = currentUserLand + (parseInt(results.totalLand) * PLOT_SIZE);
									var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
									var userLandSizeUnit = "m";
									if(userLandSize > 99999) {
										userLandSize = userLandSize / 1000;
										userLandSizeUnit = "km";
									}

									updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
									updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);
									currentUserEmpireScore = currentUserEmpireScore + parseInt(results.totalEmpireScore);
									updateInnerHTML('yourEmpireScore', results.totalEmpireScore);
									updateInnerHTML('yourEmpireScoreMobile', results.totalEmpireScore);
								}
							} catch(e) {


							}
						}

					}
				});
			}
			if(!updatedUserStats){
				updateInnerHTML('yourLandSize', '0m');
				updateInnerHTML('yourLandSizeMobile', '0m');
				updateInnerHTML('yourEmpireScore', '0');
				updateInnerHTML('yourEmpireScoreMobile', '0');
			}
			updateTotalLandSize();

			$("#loadingDiv").addClass('hide');
		}

	});

	getReadOnlyPlanetCryptoContract().methods.total_trades().call(function(err,results){
		if(err){
		} else {
			totalTrades = parseInt(results);
			updateInnerHTML('totalTrades', totalTrades);
			updateInnerHTML('totalTradesMobile', totalTrades);
		}
	});

	//taxFund
	getReadOnlyPlanetCryptoContract().methods.tax_fund().call(function(err,results){
		if(err){

		} else {
			tax_fund = new BigNumber(results);
			updateInnerHTML('taxFund', getReadOnlyWeb3Utils().utils.fromWei(tax_fund.toString(), 'ether').substring(0,8));
			updateInnerHTML('taxFundMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_fund.toString(), 'ether').substring(0,8));
		}
	});




	//taxDist
	getReadOnlyPlanetCryptoContract().methods.tax_distributed().call(function(err,results){
		if(err){

		} else {
			tax_distributed = new BigNumber(results);
			updateInnerHTML('taxDist', getReadOnlyWeb3Utils().utils.fromWei(tax_distributed.toString(), 'ether').substring(0,8));
			updateInnerHTML('taxDistMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_distributed.toString(), 'ether').substring(0,8));
		}
	});
}
function initUserStats() {
	//console.log("initUserStats", PlanetCryptoContract);
	if(canPlay) {
		//yourCOINS
		getReadOnlyPlanetCryptoCoinContract().methods.balanceOf(userWalletAddress).call(function(err,results){
			if(err){

			} else {
				yourCOINS = parseInt(results);
				updateInnerHTML('yourCOINS', yourCOINS);
				updateInnerHTML('yourCOINSMobile', yourCOINS);

				// and now check lock status
				//currentPadlockstateLocked
				getReadOnlyPlanetCryptoCoinContract().methods.allowance(userWalletAddress, contractAddress).call(function(err,results){
					if(!err){
						var _newAllowance = parseInt(results);
						if(_newAllowance < yourCOINS) {
							currentPadlockstateLocked = true;
							$('#padlock').attr('src', 'images/padlock.png');
							$('#padlockMobile').attr('src', 'images/padlock.png');
						} else  {
							currentPadlockstateLocked = false;
							$('#padlock').attr('src', 'images/padlock_open.png');
							$('#padlockMobile').attr('src', 'images/padlock_open.png');
						}
					}
				});

			}
		});

		//yourTaxAvailable
		PlanetCryptoContractPlay.methods.taxEarningsAvailable().call({from: userWalletAddress}, function(err,results){
			if(err){
			} else {
				//console.log("results", results);
				tax_available = new BigNumber(results);
				//console.log("tax_available player contract", tax_available.toString());
				updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old.plus(tax_available_old2)).toString(), 'ether').substring(0,8));
				updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old.plus(tax_available_old2)).toString(), 'ether').substring(0,8));

				// check if there is any available on the old contract...
				PlanetCryptoContractOld2.methods.taxEarningsAvailable().call({from: userWalletAddress}, function(err,results){
					if(err){

					} else {

						//console.log("results", results);

						tax_available_old2 = new BigNumber(results);
						
						//console.log("tax_available player contract", tax_available.toString());
						updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old.plus(tax_available_old2)).toString(), 'ether').substring(0,8));
						updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old.plus(tax_available_old2)).toString(), 'ether').substring(0,8));

						// check if there is any available on the old contract...
						PlanetCryptoContractOld.methods.taxEarningsAvailable().call({from: userWalletAddress}, function(err,results){
							if(err){

							} else {

								//console.log("results", results);

								tax_available_old = new BigNumber(results);
								
								//console.log("tax_available player contract", tax_available.toString());
								updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old.plus(tax_available_old2)).toString(), 'ether').substring(0,8));
								updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old.plus(tax_available_old2)).toString(), 'ether').substring(0,8));


							}
						});


					}
				});
			}
		});	
	}
}
function updateCurrentLandPrice(_callback) {
	//console.log("updateCurrentLandPrice", PlanetCryptoContract);
	getReadOnlyPlanetCryptoContract().methods.current_plot_price().call(function(err,results){
		if(err){

		} else {
			currentLandPrice = new BigNumber(results);
			updateInnerHTML('currentLandPrice', getReadOnlyWeb3Utils().utils.fromWei(currentLandPrice.toString(), 'ether').substring(0,8));

			//updateInnerHTML('startPrice', getReadOnlyWeb3Utils().utils.fromWei(currentLandPrice.toString(), 'ether').substring(0,6) + " ETH");

			//var _toPrice = currentLandPrice.times(45);
			//updateInnerHTML('startFullPrice', getReadOnlyWeb3Utils().utils.fromWei(_toPrice.toString(), 'ether').substring(0,6) + " ETH");

			try {
				if(_callback)
					_callback();
			}catch(e){

			}
		}
	});
}
function updateTotalLandSize(){
	var _displayLandSize = totalLandSize;
	var _displayUnit = "m";

	if(totalLandSize > 99999) {
		_displayLandSize = _displayLandSize / 1000;
	}
	updateInnerHTML('totalLandSize', _displayLandSize + _displayUnit);
	updateInnerHTML('totalLandSizeMobile', _displayLandSize + _displayUnit);

	if(totalLandSize/20 > 700){
		updateInnerHTML('startPlots', totalLandSize/20);
	}
}



// working
function withdrawFunds() {
	if(!canPlay){
		$('#notConnectedModel').foundation('open');
		return;
	}
	if(tax_available.eq(0) && tax_available_old.eq(0) && tax_available_old2.eq(0)) {
		showError("You don't have any have tax earnings available at the moment.<br/><br/>The more land you own, the more property tax you'll ean - tax is earned instantly someone else buys land!<br/><br/>For more information check our the CryptoLand Guide (Click the blue help button above).", "No Tax Earnings");
		return;
	}



	if(tax_available.gt(0)){


		PlanetCryptoContractPlay.methods.withdrawTaxEarning().estimateGas(
			{from: userWalletAddress}, 
	            	function(error, gasAmount){
	            		if(error){
	            			console.log(error);
	            			showError("Unable to contact the blockchain - please try again.", "Planet Crypto");
	            		} else {
						  $.toast({
						      heading: 'Sending Transaction',
						      text: 'Check your Ethereum Wallet to complete the transaction',
						      icon: 'info',
						      allowToastClose: true,
						      position: 'bottom-right',
						      hideAfter: TOAST_HIDE_DELAY,
						      showHideTransition: TOAST_HIDE_TRANSITION
						  });

						  

						  PlanetCryptoContractPlay.methods.withdrawTaxEarning().send(
						      {
						        from: userWalletAddress,
						        gas: gasAmount,
						        gasPrice: useGasPrice
						      }, function( err, results) {
						        if(err) {
						          $.toast({
						              heading: 'Withdrawal Cancelled',
						              text: 'Your withdrawel was cancelled and no GAS was spent - please try again!',
						              icon: 'info',
						              allowToastClose: true,
						              position: 'bottom-right',
						              hideAfter: TOAST_HIDE_DELAY,
						              showHideTransition: TOAST_HIDE_TRANSITION
						          })

						        } else {
						          	var _msg = ""
						          	_msg += '<p style="font-size: 10pt;"><i>Please Note: Your FUNDS will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
						          	_msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
						          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
						          	_msg += '<p>';
						          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
						          	_msg += '</p>';
						          	_msg += '<p style="font-size: 10pt;">';
						          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
						          	_msg += '</p>';
						          	_msg += '<p style="font-size: 10pt;">';
						          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
						          	_msg += '</p>';

						          	//_msg += '<div class="addthis_inline_share_toolbox"></div>';
						          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
						          	showError(_msg, "Withdrawal Complete");
						          	tax_available = new BigNumber(0);
									updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));
									updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));

						        }
						      }
						    );
	            		}
	            });

	} else {

		if(tax_available_old.gt(0)){

		PlanetCryptoContractOld.methods.withdrawTaxEarning().estimateGas(
			{from: userWalletAddress}, 
	            	function(error, gasAmount){
	            		if(error){
	            			console.log(error);
	            			showError("Unable to contact the blockchain - please try again.", "Planet Crypto");
	            		} else {
						  $.toast({
						      heading: 'Sending Transaction',
						      text: 'Check your Ethereum Wallet to complete the transaction',
						      icon: 'info',
						      allowToastClose: true,
						      position: 'bottom-right',
						      hideAfter: TOAST_HIDE_DELAY,
						      showHideTransition: TOAST_HIDE_TRANSITION
						  });

						  

						  PlanetCryptoContractOld.methods.withdrawTaxEarning().send(
						      {
						        from: userWalletAddress,
						        gas: gasAmount,
						        gasPrice: useGasPrice
						      }, function( err, results) {
						        if(err) {
						          $.toast({
						              heading: 'Withdrawal Cancelled',
						              text: 'Your withdrawel was cancelled and no GAS was spent - please try again!',
						              icon: 'info',
						              allowToastClose: true,
						              position: 'bottom-right',
						              hideAfter: TOAST_HIDE_DELAY,
						              showHideTransition: TOAST_HIDE_TRANSITION
						          })

						        } else {
						          	var _msg = ""
						          	_msg += '<p style="font-size: 10pt;"><i>Please Note: Your FUNDS will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
						          	_msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
						          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
						          	_msg += '<p>';
						          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
						          	_msg += '</p>';
						          	_msg += '<p style="font-size: 10pt;">';
						          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
						          	_msg += '</p>';
						          	_msg += '<p style="font-size: 10pt;">';
						          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
						          	_msg += '</p>';

						          	//_msg += '<div class="addthis_inline_share_toolbox"></div>';
						          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
						          	showError(_msg, "Withdrawal Complete");
						          	tax_available_old = new BigNumber(0);
									updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));
									updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));

						        }
						      }
						    );
	            		}
	            });

		} else {

			PlanetCryptoContractOld2.methods.withdrawTaxEarning().estimateGas(
				{from: userWalletAddress}, 
	            	function(error, gasAmount){
	            		if(error){
	            			console.log(error);
	            			showError("Unable to contact the blockchain - please try again.", "Planet Crypto");
	            		} else {
						  $.toast({
						      heading: 'Sending Transaction',
						      text: 'Check your Ethereum Wallet to complete the transaction',
						      icon: 'info',
						      allowToastClose: true,
						      position: 'bottom-right',
						      hideAfter: TOAST_HIDE_DELAY,
						      showHideTransition: TOAST_HIDE_TRANSITION
						  });

						  

						  PlanetCryptoContractOld2.methods.withdrawTaxEarning().send(
						      {
						        from: userWalletAddress,
						        gas: gasAmount,
						        gasPrice: useGasPrice
						      }, function( err, results) {
						        if(err) {
						          $.toast({
						              heading: 'Withdrawal Cancelled',
						              text: 'Your withdrawel was cancelled and no GAS was spent - please try again!',
						              icon: 'info',
						              allowToastClose: true,
						              position: 'bottom-right',
						              hideAfter: TOAST_HIDE_DELAY,
						              showHideTransition: TOAST_HIDE_TRANSITION
						          })

						        } else {
						          	var _msg = ""
						          	_msg += '<p style="font-size: 10pt;"><i>Please Note: Your FUNDS will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
						          	_msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
						          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
						          	_msg += '<p>';
						          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
						          	_msg += '</p>';
						          	_msg += '<p style="font-size: 10pt;">';
						          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
						          	_msg += '</p>';
						          	_msg += '<p style="font-size: 10pt;">';
						          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
						          	_msg += '</p>';

						          	//_msg += '<div class="addthis_inline_share_toolbox"></div>';
						          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
						          	showError(_msg, "Withdrawal Complete");
						          	tax_available_old = new BigNumber(0);
									updateInnerHTML('yourTaxAvailable', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));
									updateInnerHTML('yourTaxAvailableMobile', getReadOnlyWeb3Utils().utils.fromWei(tax_available.plus(tax_available_old).toString(), 'ether').substring(0,8));

						        }
						      }
						    );
	            		}
	            });

		}


	}


}

function destroyCard(){
	if(!canPlay){
		$('#notConnectedModel').foundation('open');
		return;
	}


	showProcessing();

	$.getJSON( ethGasStationAPI, function( data ) {

		if(isNaN(data.average)){
			console.log("Unable to access ethgasstation");
			destoryCardProcess();

		} else {

			var _newGas = new BigNumber(data.average).times(100000000);
			console.log("New Gas:", _newGas.toString());
			useGasPrice = parseInt(_newGas.toString());

			destoryCardProcess();
			
		}
	});

}

function destoryCardProcess() {


	//console.log("existingCardTokenId", existingCardTokenId);
	//console.log("existingCardPaymentAmount", existingCardPaymentAmount);



	PlanetCryptoContractPlay.methods.burn(
			existingCardTokenId
		).estimateGas({from: userWalletAddress}, 
        	function(error, gasAmount){
        		if(error){
        			console.log(error);
        			showError("Destory action not possible - make sure you own this card first.", "Planet Crypto");
        			hideProcessing();
        		} else {
				  $.toast({
				      heading: 'Sending Transaction',
				      text: 'Check your Ethereum Wallet to complete the transaction',
				      icon: 'info',
				      allowToastClose: true,
				      position: 'bottom-right',
				      hideAfter: TOAST_HIDE_DELAY,
				      showHideTransition: TOAST_HIDE_TRANSITION
				  });

				  

				  PlanetCryptoContractPlay.methods.burn(existingCardTokenId).send(
				      {
				        from: userWalletAddress,
				        gas: gasAmount,
				        gasPrice: useGasPrice
				      }, function( err, results) {

				      	hideProcessing();

				        if(err) {
				          $.toast({
				              heading: 'Destory Action Cancelled',
				              text: 'Your destroy action was cancelled and no ETH was spent this time - please try again!',
				              icon: 'info',
				              allowToastClose: true,
				              position: 'bottom-right',
				              hideAfter: TOAST_HIDE_DELAY,
				              showHideTransition: TOAST_HIDE_TRANSITION
				          })

				        } else {
				          var _msg = ""
				          _msg += '<p style="font-size: 10pt;"><i>Please Note: Your Destroy Action and your new PlaneteCOINs will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
				          _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
				          _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
				          _msg += '<p>';
				          _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
				          _msg += '</p>';
				          _msg += '<p style="font-size: 10pt;">';
				          _msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
				          _msg += '</p>';
				          _msg += '<p style="font-size: 10pt;">';
				          _msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
				          _msg += '</p>';

				          _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
				          showError(_msg, "Purchase Complete");


				          ga('send', 'event', 'BuyTools', 'DestroyExistingCardComplete');
				        }
				      }
				    );
        		}
        });
}



function buyExistingCard(){
	if(!canPlay){
		$('#notConnectedModel').foundation('open');
		return;
	}


	showProcessing();

	$.getJSON( ethGasStationAPI, function( data ) {

		if(isNaN(data.average)){
			console.log("Unable to access ethgasstation");
			buyExistingCardProcess();
		} else {

			var _newGas = new BigNumber(data.average).times(100000000);
			console.log("New Gas:", _newGas.toString());
			useGasPrice = parseInt(_newGas.toString());

			buyExistingCardProcess();
			
		}
		//console.log("SAFE LOW", data.average);
	});

}

function buyExistingCardProcess() {


	//console.log("existingCardTokenId", existingCardTokenId);
	//console.log("existingCardPaymentAmount", existingCardPaymentAmount);

	if(!getReadOnlyWeb3Utils().utils.isAddress(_referer)){
		//console.log("Invalid Referer");
		_referer = getReadOnlyWeb3Utils().utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
		//console.log("New Referer:" + _referer);
	}

	PlanetCryptoContractPlay.methods.buyCard(
			existingCardTokenId,
			_referer
		).estimateGas({from: userWalletAddress, value: existingCardPaymentAmount}, 
        	function(error, gasAmount){
        		if(error){
        			console.log(error);
        			showError("Purchase not possible - make sure your not trying to buy your own land!", "Planet Crypto");
        			hideProcessing();
        		} else {
				  $.toast({
				      heading: 'Sending Transaction',
				      text: 'Check your Ethereum Wallet to complete the transaction',
				      icon: 'info',
				      allowToastClose: true,
				      position: 'bottom-right',
				      hideAfter: TOAST_HIDE_DELAY,
				      showHideTransition: TOAST_HIDE_TRANSITION
				  });

				  

				  PlanetCryptoContractPlay.methods.buyCard(existingCardTokenId,_referer).send(
				      {
				        from: userWalletAddress,
				        gas: gasAmount,
				        gasPrice: useGasPrice,
				        value: existingCardPaymentAmount
				      }, function( err, results) {

				      	hideProcessing();

				        if(err) {
				          $.toast({
				              heading: 'Purchase Cancelled',
				              text: 'Your purchase was cancelled and no ETH was spent this time - please try again!',
				              icon: 'info',
				              allowToastClose: true,
				              position: 'bottom-right',
				              hideAfter: TOAST_HIDE_DELAY,
				              showHideTransition: TOAST_HIDE_TRANSITION
				          })

				        } else {
				          var _msg = ""
				          _msg += '<p style="font-size: 10pt;"><i>Please Note: Your Purchase will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
				          _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
				          _msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
				          _msg += '<p>';
				          _msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
				          _msg += '</p>';
				          _msg += '<p style="font-size: 10pt;">';
				          _msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
				          _msg += '</p>';
				          _msg += '<p style="font-size: 10pt;">';
				          _msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
				          _msg += '</p>';

				          //_msg += '<div class="addthis_inline_share_toolbox"></div>';
				          _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
				          showError(_msg, "Purchase Complete");

				          //addthis.layers.refresh();

				          ga('send', 'event', 'BuyTools', 'BuyExistingCardComplete');
				          gtag_report_conversion2();
				        }
				      }
				    );
        		}
        });
}

function buyWithEthUpsell() {
	// check number of plots and offer upsell...

	var _rectsToBuyLen2 = parseInt(rectsToBuyLen());

	console.log("UPSELL", _rectsToBuyLen2);

	if(_rectsToBuyLen2 > 3 && _rectsToBuyLen2 < 10) {
		updateInnerHTML('upsellCount', 10 - _rectsToBuyLen2);
		updateInnerHTML('upsellTokenCount', 1);

		$('#buyUpsell').foundation('open');

	} else {

		if(_rectsToBuyLen2 > 12 && _rectsToBuyLen2 < 20) {
			updateInnerHTML('upsellCount', 20 - _rectsToBuyLen2);
			updateInnerHTML('upsellTokenCount', 2);
			$('#buyUpsell').foundation('open');
		} else {

			if(_rectsToBuyLen2 > 23 && _rectsToBuyLen2 < 30) {
				updateInnerHTML('upsellCount', 30 - _rectsToBuyLen2);
				updateInnerHTML('upsellTokenCount', 3);
				$('#buyUpsell').foundation('open');
			} else {

				buyWithEth();	
			}
		}
	}
}
function buyWithEth(){


	if(!canPlay){
		$('#notConnectedModel').foundation('open');
		return;
	}



	
	showProcessing();


	$.getJSON( ethGasStationAPI, function( data ) {

		if(isNaN(data.average)){
			console.log("Unable to access ethgasstation");
			buyWithEthProcess();
		} else {

			var _newGas = new BigNumber(data.average).times(100000000);
			console.log("New Gas:", _newGas.toString());
			useGasPrice = parseInt(_newGas.toString());

			buyWithEthProcess();

		}
		//console.log("SAFE LOW", data.average);
	});


}

function buyWithEthProcess() {

	
	var _newCardName = document.getElementById('newCardName').value;
	
	if(_newCardName.length < 4) {
		showError('Card Names must be at least 4 characters long', "Name too short");
		hideProcessing();
		return;
	}

	if(byteCount(_newCardName) > 32){
		showError('Card Names must be less than 33 Bytes in size.<br/><br/>Yours is currently: ' + byteCount(_newCardName) +'<br/><br/>Please reduce the name size', "Name Too Long!");
		hideProcessing();
		return;
	}


	// get plots...
	var _lat = [];
	var _lng = [];

	for(key in rectsToBuy){
		//console.log("item:", rectsToBuy[key].lat);
		_lat.push(parseInt(new BigNumber( hardFixed(rectsToBuy[key].lat,5)).times(1000000).toFixed(0)));
		_lng.push(parseInt(new BigNumber( hardFixed(rectsToBuy[key].lng,5)).times(1000000).toFixed(0)));

		//_lat.push(parseInt(new BigNumber(rectsToBuy[key].lat.toFixed(5)).times(1000000).toFixed(0)));
		//_lng.push(parseInt(new BigNumber(rectsToBuy[key].lng.toFixed(5)).times(1000000).toFixed(0)));
		//console.log("buy lat:", _lat[_lat.length-1]);
		//console.log("buy lng:", _lng[_lng.length-1]);
	}

	if(!getReadOnlyWeb3Utils().utils.isAddress(_referer)){
		console.log("Invalid Referer");
		_referer = getReadOnlyWeb3Utils().utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
		//console.log("New Referer:" + _referer);
	}

	// get latest price before completing purchase...
	updateCurrentLandPrice(function(){

		var playAmountWei = currentLandPrice * _lat.length;

		var _encodedName;

		try{
			_encodedName = getReadOnlyWeb3Utils().utils.utf8ToHex(_newCardName);
		} catch(e) {
			_encodedName = getReadOnlyWeb3Utils().utils.fromAscii(_newCardName);
		}

		console.log("ENCODED NAME:", _encodedName);

		console.log("_lat", _lat);
		console.log("_lng", _lng);

	/*	PlanetCryptoContractPlay.methods.buyLand(
				_encodedName,
				_lat,
				_lng,
				_referer
			).estimateGas({from: userWalletAddress, value: playAmountWei}, 
            	function(error, gasAmount){
            		if(error){
            			console.log(error);
            			hideProcessing();
            			showError("ESTIMATE NOT POSSIBLE: Purchase not possible - check your not trying to buy part of someone elses land!", "Planet Crypto");
            		} else {

					  $.toast({
					      heading: 'Sending Transaction',
					      text: 'Check your Ethereum Wallet to complete the transaction',
					      icon: 'info',
					      allowToastClose: true,
					      position: 'bottom-right',
					      hideAfter: TOAST_HIDE_DELAY,
					      showHideTransition: TOAST_HIDE_TRANSITION
					  });*/

					  

					  PlanetCryptoContractPlay.methods.buyLand(_encodedName,_lat,_lng,_referer).send(
					      {
					        from: userWalletAddress,
					      //  gas: gasAmount,
//					        gasPrice: useGasPrice,
					        value: playAmountWei
					      }, function( err, results) {

					      	hideProcessing();

					        if(err) {


					          $.toast({
					              heading: 'Purchase Cancelled',
					              text: 'Your purchase was cancelled and no ETH was spent this time - please try again!',
					              icon: 'info',
					              allowToastClose: true,
					              position: 'bottom-right',
					              hideAfter: TOAST_HIDE_DELAY,
					              showHideTransition: TOAST_HIDE_TRANSITION
					          })

					        } else {
					          	var _msg = ""
					          	_msg += '<p style="font-size: 10pt;"><i>Please Note: Your Purchase will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
					          	_msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
					          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
					          	_msg += '<p>';
					          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
					          	_msg += '</p>';
					          	_msg += '<p style="font-size: 10pt;">';
					          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
					          	_msg += '</p>';
					          	_msg += '<p style="font-size: 10pt;">';
					          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
					          	_msg += '</p>';

					          	//_msg += '<div class="addthis_inline_share_toolbox"></div>';
					          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
					          	showError(_msg, "Purchase Complete");

					          	resetSelectedRects();


					          	ga('send', 'event', 'BuyTools', 'BuyWithEthComplete');
					          	gtag_report_conversion();
					        }
					      }
					    );

						/*
            		}
            });*/
	});

}

// WORKING
function buyWithTokens(){


	if(!canPlay){
		$('#notConnectedModel').foundation('open');
		return;
	}


	showProcessing();

	$.getJSON( ethGasStationAPI, function( data ) {

		if(isNaN(data.average)){
			console.log("Unable to access ethgasstation");
			buyWithTokenProcess();
		} else {

			var _newGas = new BigNumber(data.average).times(100000000);
			console.log("New Gas:", _newGas.toString());
			useGasPrice = parseInt(_newGas.toString());

			buyWithTokenProcess();
			
		}
		//console.log("Average", data.average);
	});

}

function buyWithTokenProcess() {

	var _newCardName = document.getElementById('newCardName').value;
	
	if(_newCardName.length < 4) {
		showError('Card Names must be at least 4 characters long', "Name too short");
		hideProcessing();
		return;
	}

	if(byteCount(_newCardName) > 32){
		showError('Card Names must be less than 33 Bytes in size.<br/><br/>Yours is currently: ' + byteCount(_newCardName) +'<br/><br/>Please reduce the name size', "Name Too Long!");
		hideProcessing();
		return;
	}
	


	// get plots...
	var _lat = [];
	var _lng = [];

	for(key in rectsToBuy){
		_lat.push(parseInt(new BigNumber( hardFixed(rectsToBuy[key].lat,5)).times(1000000).toFixed(0)));
		_lng.push(parseInt(new BigNumber( hardFixed(rectsToBuy[key].lng,5)).times(1000000).toFixed(0)));
	}

	if(!getReadOnlyWeb3Utils().utils.isAddress(_referer)){
		//console.log("Invalid Referer");
		_referer = getReadOnlyWeb3Utils().utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
		//console.log("New Referer:" + _referer);
	}

	var _encodedName;

	try{
		_encodedName = getReadOnlyWeb3Utils().utils.utf8ToHex(_newCardName);
	} catch(e) {
		_encodedName = getReadOnlyWeb3Utils().utils.fromAscii(_newCardName);
	}


	PlanetCryptoContractPlay.methods.buyLandWithTokens(
			_encodedName,
			_lat,
			_lng
		).estimateGas({from: userWalletAddress}, 
        	function(error, gasAmount){
        		if(error){
        			console.log(error);
        			showError("Purchase not possible - check you have UNLOCKED your PlanetCOINS tokens and that you have 1 Token for each plot of Land.", "Planet Crypto");
        			hideProcessing();
        		} else {

				  $.toast({
				      heading: 'Sending Transaction',
				      text: 'Check your Ethereum Wallet to complete the transaction',
				      icon: 'info',
				      allowToastClose: true,
				      position: 'bottom-right',
				      hideAfter: TOAST_HIDE_DELAY,
				      showHideTransition: TOAST_HIDE_TRANSITION
				  });

				  

				  PlanetCryptoContractPlay.methods.buyLandWithTokens(_encodedName,_lat,_lng).send(
				      {
				        from: userWalletAddress,
				        gas: gasAmount,
				        gasPrice: useGasPrice
				      }, function( err, results) {

				      	hideProcessing();

				        if(err) {
				          $.toast({
				              heading: 'Purchase Cancelled',
				              text: 'Your purchase was cancelled and no PlanetCOINS were spent this time - please try again!',
				              icon: 'info',
				              allowToastClose: true,
				              position: 'bottom-right',
				              hideAfter: TOAST_HIDE_DELAY,
				              showHideTransition: TOAST_HIDE_TRANSITION
				          })

				        } else {
				          	var _msg = ""
				          	_msg += '<p style="font-size: 10pt;"><i>Please Note: Your Purchase will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
				          	_msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
				          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
				          	_msg += '<p>';
				          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
				          	_msg += '</p>';
				          	_msg += '<p style="font-size: 10pt;">';
				          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
				          	_msg += '</p>';
				          	_msg += '<p style="font-size: 10pt;">';
				          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
				          	_msg += '</p>';

				          	//_msg += '<div class="addthis_inline_share_toolbox"></div>';
				          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
				          	showError(_msg, "Purchase Complete");

							resetSelectedRects();


							ga('send', 'event', 'BuyTools', 'BuyWithTokensComplete');

				        }
				      }
				    );
        		}
        });

}


var currentPadlockstateLocked = true;

function switchCOINlockstatus() {
	//padlock
	//PlanetCryptoCoinContract
	if(!canPlay){
		$('#notConnectedModel').foundation('open');
		shownInitialWarning = true;
		return;
	}

	var _amount;

	if(currentPadlockstateLocked){
		_amount = yourCOINS;
	} else {
		_amount = 0;
	}

	PlanetCryptoCoinContractPlay.methods.approve(
		contractAddress,
		_amount
		).estimateGas({from: userWalletAddress}, 
            	function(error, gasAmount){
            		if(error){
            			console.log(error);
            			showError("Unable to contact blockchain - please refresh and try again", "Planet Crypto");
            		} else {
					  $.toast({
					      heading: 'Altering PlanetCOINS State',
					      text: 'Check your Ethereum Wallet to complete the transaction',
					      icon: 'info',
					      allowToastClose: true,
					      position: 'bottom-right',
					      hideAfter: TOAST_HIDE_DELAY,
					      showHideTransition: TOAST_HIDE_TRANSITION
					  });

					  

					  PlanetCryptoCoinContractPlay.methods.approve(
					  	contractAddress, _amount
					  	).send(
					      {
					        from: userWalletAddress,
					        gas: gasAmount,
					        gasPrice: useGasPrice
					      }, function( err, results) {
					        if(err) {
					          $.toast({
					              heading: 'Altering Transaction Cancelled',
					              text: 'Your transaction was cancelled and no ETH was spent this time - please try again!',
					              icon: 'info',
					              allowToastClose: true,
					              position: 'bottom-right',
					              hideAfter: TOAST_HIDE_DELAY,
					              showHideTransition: TOAST_HIDE_TRANSITION
					          })

					        } else {
					          	var _msg = ""
					          	_msg += '<p style="font-size: 10pt;"><i>Please Note: Your Transaction will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
					          	_msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
					          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
					          	_msg += '<p>';
					          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
					          	_msg += '</p>';
					          	_msg += '<p style="font-size: 10pt;">';
					          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?ref=' + userWalletAddress + '</code>';
					          	_msg += '</p>';
					          	_msg += '<p style="font-size: 10pt;">';
					          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
					          	_msg += '</p>';

					          	//_msg += '<div class="addthis_inline_share_toolbox"></div>';
					          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
					          	showError(_msg, "Transaction Sent");
					          	if(currentPadlockstateLocked){
					          		$('#padlock').attr('src', 'images/padlock_open.png');
					          		$('#padlockMobile').attr('src', 'images/padlock_open.png');
					          		currentPadlockstateLocked = false;
					          	} else {
					          		$('#padlock').attr('src', 'images/padlock.png');
					          		$('#padlockMobile').attr('src', 'images/padlock.png');
					          		currentPadlockstateLocked = true;
					          	}
					          	
					        }
					      }
					    );
            		}
            });

}



















var QUERY_CACHE_TIME = 15000; // 15s
var queryCache = {
};

function queryMap(zoomLvl){


	var latRows = [];
	var lngCols = [];


	var _latRows;
	var _lngColumns;
	var zoom;
	var _divisor = 1000000;
	var _remover = 2;
	//, grid17.currentRows, grid17.currentColumns

	// cache query for x seconds...
	//console.log("queryMap", zoomLvl);
	if(zoomLvl ==18){

		//_latRows = lightGrids[zoomLvl].currentRows;
		//_lngColumns = lightGrids[zoomLvl].currentColumns;
		_remover = 0;
		zoom = 0;
		// lat = grid18.currentColumns.currentRows
		// lng = grid18.currentColumns.currentColumns
		//console.log("GRID", grid18);
	}

	if(zoomLvl ==17){
		// generate queryMap(uint8 zoom, int256[] lat_rows, int256[] lng_columns)

		//_latRows = grid17.currentRows;
		//_lngColumns = grid17.currentColumns;
		_remover = 0;
		zoom = 0;
		// lat = grid18.currentColumns.currentRows
		// lng = grid18.currentColumns.currentColumns
		//console.log("GRID", grid18);
	}
	if(zoomLvl ==16){
		// generate queryMap(uint8 zoom, int256[] lat_rows, int256[] lng_columns)

		zoom = 4;
		_divisor = 10000;
		//_latRows = grid16.currentRows;
		//_lngColumns = grid16.currentColumns;
		// no grid to use here

	}
	if(zoomLvl == 15) {
		zoom = 3;
		_divisor = 1000;
		_remover = 3;
		//_latRows = grid15.currentRows;
		//_lngColumns = grid15.currentColumns;
	}
	if(zoomLvl < 15){


//		return;
	}
	if(zoomLvl == 14) {
		zoom = 3;
		_divisor = 1000;
		_remover = 3;

		//_latRows = grid14.currentRows;
		//_lngColumns = grid14.currentColumns;
	}
	if(zoomLvl == 13) {
		zoom = 2;
		_divisor = 100;
		_remover = 4;
	}
	//_latRows = lightGrids[zoomLvl].currentRows;
	//_lngColumns = lightGrids[zoomLvl].currentColumns;
	//if(zoomLvl < 10){
	//	return;
	//}


	/*
		New format:
		var plots = {};
		[lat:lng] = {token_id}
	*/
	// check it plots[] is on screen...
	
	var latlongBound = mymap.getBounds();
	//console.log(tokens);
	
	
	//console.log(mapData.plots["40.73127:-73.9875:"]);
	var _secondaryLookups = [];

	if(zoom ==0){
		/*
		Object.keys(lightGrids[zoomLvl].rects).forEach(function(rectsKey,rectIndex) {

		});*/
	}
	
	Object.keys(tokens).forEach(function(key,index) {


		var latLngPoint = L.latLng([parseFloat(hardFixed(tokens[key].plots_lat[0]/1000000,5)), parseFloat(hardFixed(tokens[key].plots_lng[0]/1000000,5))]);

		if(!latlongBound.contains(latLngPoint)){
			
			//console.log("Not in view:", key); // ignore this point
			//var _token_id = plots[key];
			//console.log("Not in view token_id", _token_id);
			

		} else {

			if(zoom == 0 ) {

				// check we've not already added it..
				//var _token_id = mapData.plots[key];
				var _token_id = key;
				//var _token = tokens[_token_id];
				var _token = tokens[key];
				

				for(var c=0; c<_token.card_size;c++){

					var _latLngPoint = L.latLng(
						[parseFloat(hardFixed(_token.plots_lat[c]/1000000,5)), 
						parseFloat(hardFixed(_token.plots_lng[c]/1000000,5))]);

					_secondaryLookups.push({
						token_id: _token_id,
						latLngPoint: _latLngPoint,
						token: _token
					});

				} // end of for loop

			} else  {

				// show markers direct

				var _token_id = key;

				var _token = tokens[key];

				//console.log("token_id", _token_id);


				if(markersAllLvls[zoomLvl + ':' + _token_id]) {
					//console.log("Already set");
					// update stats in case scores have changed
					markersAllLvls[zoomLvl + ':' + _token_id].addTo(mymap);
				} else {


					//var icon = L.MakiMarkers.icon({icon: "embassy", color: "#" + _token.token_owner.substring(_token.token_owner.length-6), size: "m"});
					//var _marker = L.marker(latLngPoint, {icon: icon});

					var _Marker = L.ExtraMarkers.icon({
						icon: 'fa-flag',
						markerColor: 'white',
						iconColor: "#" + _token.token_owner.substring(_token.token_owner.length-6),
						shape: 'square',
						prefix: 'fa'
					});

					var _marker = L.marker(latLngPoint, {icon: _Marker});


					var _msg = "<span style='font-size:0.9em;'><b style='font-size:1.2em;'>Token: #" + _token_id + " ~ " + _token.name + "</b><br/>";
					_msg += "<b>Owner:</b><br/> " + _token.token_owner + "...";
					//_msg += "<br/><b>Total Size:</b> " + _token.card_size * PLOT_SIZE + "m<sup>2</sup>";
					_msg += "<br/><b>Empire Score:</b> " + _token.empire_score;
					_msg += "<br/><b>Bought At:</b> " + getReadOnlyWeb3Utils().utils.fromWei(_token.current_value.toString(), 'ether').substring(0,8) + " ETH";
					_msg += "<br/>~ Run a hostile take-over for: <strong>" + 
						getReadOnlyWeb3Utils().utils.fromWei((_token.current_value * CURRENT_RESALE_MULTIPLIER).toString(), 'ether').substring(0,8);
					_msg += " ETH</strong>";
					_msg +="<br/>~ Increasing it's EMPIRE SCORE to: <strong>" +
						_token.empire_score * CURRENT_EMPIRE_MULTIPLIER + '</strong>';
					//_msg += "<br/> &nbsp;&nbsp; - increasing your score whilst reducing the previous owners!"
					_msg += "<br/><center><strong>~ Click for Full Card Details ~</strong></center></span>";

					_marker.bindTooltip(
						_msg);

					_marker.on('click', function(e){
						showExistingCard(_token_id, true);
					});
					_marker.addTo(mymap);



					markersAllLvls[zoomLvl + ':' + _token_id] = _marker;
				}

	           
			}



		}
	});

	if(zoom == 0) {


		//Object.keys(lightGrids[zoomLvl].rects).forEach(function(rectsKey,rectIndex) {
		//console.log("LEN", Object.keys(lightGrids[zoomLvl].cellDetails).length);
		Object.keys(lightGrids[zoomLvl].cellDetails).forEach(function(cellKey,cellIndex) {
			//console.log(rectsKey);
			//console.log(rects[rectsKey]);
			for(var c=0; c< _secondaryLookups.length; c++) {




				if(lightGrids[zoomLvl].cellDetails[cellKey].bounds.contains(_secondaryLookups[c].latLngPoint)){
					//console.log("FOUND", lightGrids[zoomLvl].cellDetails[cellKey]);


					
					var _rect = L.rectangle(
						lightGrids[zoomLvl].cellDetails[cellKey].bounds, 
						{color: '#' + _secondaryLookups[c].token.token_owner.substring(_secondaryLookups[c].token.token_owner.length-6),
						 weight: 2, fillOpacity: 0.5});


		            lightGrids[zoomLvl].rects[
		            		lightGrids[zoomLvl].cellDetails[cellKey].key
		            		].token_id = _secondaryLookups[c].token_id;
		            /*
					lightGrids[zoomLvl].rects[rectsKey].setStyle({
		                fill: true, 
		                fillOpacity: 0.7, 
		                fillColor: '#' + _secondaryLookups[c].token.token_owner.substring(_secondaryLookups[c].token.token_owner.length-6)
		            });
		            */

					var _msg = "<b style='font-size:1.2em;'>[" + _secondaryLookups[c].token_id + "] " + _secondaryLookups[c].token.name + "</b><br/>";
					_msg += "<b>Owned By:</b><br/> " + _secondaryLookups[c].token.token_owner;
					_msg += "<br/><b>Total Size:</b> " + _secondaryLookups[c].token.card_size * PLOT_SIZE + "m<sup>2</sup>";
					_msg += "<br/><b>Empire Score:</b> " + _secondaryLookups[c].token.empire_score;
					_msg += "<br/><b>Bought At:</b> " + getReadOnlyWeb3Utils().utils.fromWei(_secondaryLookups[c].token.current_value.toString(), 'ether').substring(0,8) + " ETH";
					_msg += "<br/>~ You can run a hostile take-over and own this card for: " + 
						getReadOnlyWeb3Utils().utils.fromWei((_secondaryLookups[c].token.current_value * CURRENT_RESALE_MULTIPLIER).toString(), 'ether').substring(0,8);
					_msg += " ETH.";
					_msg +="<br/>~ Doing so will also increase it's EMPIRE SCORE to: " +
						_secondaryLookups[c].token.empire_score * CURRENT_EMPIRE_MULTIPLIER;
					_msg += "<br/> &nbsp;&nbsp; - increasing your score whilst reducing the previous owners!"
					_msg += "<br/><br/><center><span class='smallTxt'><strong>Click for full card details</strong></span></center>";


					//lightGrids[zoomLvl].rects[rectsKey].bindTooltip(_msg);
					_rect.bindTooltip(_msg);



					try{
						//lightGrids[zoomLvl].rects[rectsKey].removeFrom(mymap);
					}catch(e){}

					//lightGrids[zoomLvl].rects[rectsKey].addTo(mymap);
					
					_rect.token_id = _secondaryLookups[c].token_id;
					_rect.on('click', function(e){
						showExistingCard(e.sourceTarget.token_id, true);
					});

					_rect.addTo(mymap);
					//console.log(_rect);

					//rectsDisplayedKeys.push(lightGrids[zoomLvl].rects[rectsKey]);
					rectsDisplayedKeys.push(_rect);
					break;

				}
			}

		});
	}

	return;



}


var rectsDisplayedKeys = {};
var markersAllLvls = {};



// TODO
function manageCaches() {
	// clear out old cache items on timeout
}

function clearMarkers() {
	for(var key in markersAllLvls) {
		markersAllLvls[key].removeFrom(mymap);
	}
}
function clearGrids() {
	//for(key in lightGrids) {
	//	lightGrids[key].removeFrom(mymap);
	//}
}
function clearDisplayedKeys(){
	//console.log("clearDisplayedKeys");
	//for(var c=0; c< rectsDisplayedKeys.length; c++) {
	Object.keys(rectsDisplayedKeys).forEach(function(rectsKey,rectIndex) {
		//console.log("CLEARING:", rectsDisplayedKeys[rectIndex]);
		rectsDisplayedKeys[rectIndex].removeFrom(mymap);
		delete rectsDisplayedKeys[rectsKey];
	});
	rectsDisplayedKeys = [];
	//console.log("AFTER", rectsDisplayedKeys);
}
function clearSelectedRects(){
	if(mymap.getZoom() == 17 || mymap.getZoom() == 18){
		Object.keys(lightGrids[mymap.getZoom()].rectList).forEach(function(rectsKey,rectIndex){
			lightGrids[mymap.getZoom()].rectList[rectsKey].removeFrom(mymap);
		});
	}
}
function resetSelectedRects(){
	try{
	Object.keys(lightGrids[17].rectList).forEach(function(rectsKey,rectIndex){
		lightGrids[17].rectList[rectsKey].removeFrom(mymap);
	});
	}
	catch(e){}
	try{
	Object.keys(lightGrids[18].rectList).forEach(function(rectsKey,rectIndex){
		lightGrids[18].rectList[rectsKey].removeFrom(mymap);
	});
	} catch(e){}
	rectsToBuy = {};
	actionMode = '';
	if(allowedPlotsCircle)
		allowedPlotsCircle.remove();
	clearNewBuyCard();
	updateNewCard();	
}



var existingCardStartPoint;
var existingCardTokenId = 0;
var existingCardPaymentAmount = 0;
var existingCardOwned = false;
var shareDropdown;

function showExistingCard(_token_id, _flyTo){
	//console.log("GET TOKEN INFO", _token_id);
	

	existingCardTokenId = _token_id;
	if(tokens[_token_id]) {
	} else {
		console.log("Token not loaded...");
		// get it now...
		getReadOnlyPlanetCryptoContract().methods.getTokenEnhanced(_token_id,false).call(function(err,results){
			if(!err){
				//console.log(results);

				try{
					tokens[_token_id] = {
						token_owner: results.token_owner,
						current_value: results.current_value,
						empire_score: results.empire_score,
						name: getReadOnlyWeb3Utils().utils.hexToUtf8(results.name),
						////img: getReadOnlyWeb3Utils().utils.hexToUtf8(results.img),
						orig_value: results.orig_value,
						card_size: results.plots_lat.length,
						plots_lat: results.plots_lat,
						plots_lng: results.plots_lng,
						buy_history: [/*
							{
								token_owner: results.token_owner,
								bought_at: results.current_value,
								ts: results.now
							}*/
						]
					}; // was toAscii
				} catch(e){
					tokens[_token_id] = {
						token_owner: results.token_owner,
						current_value: results.current_value,
						empire_score: results.empire_score,
						name: getReadOnlyWeb3Utils().utils.toAscii(results.name),
						////img: getReadOnlyWeb3Utils().utils.toAscii(results.img),
						orig_value: results.orig_value,
						card_size: results.plots_lat.length,
						plots_lat: results.plots_lat,
						plots_lng: results.plots_lng,
						buy_history: [/*
							{
								token_owner: results.token_owner,
								bought_at: results.current_value,
								ts: results.now
							}*/
						]
					}; // was toAscii
				}

				setTimeout(function(){ showExistingCard(_token_id, _flyTo);}, 1000);

			}
		});

	}
	var _token = tokens[_token_id];
	if(!_token)
		return;

	//console.log(_token);

	_findTokenId = "";

	$('#existingCardHeader').css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6));
	if(isMobile)
		updateInnerHTML('existingCardOwner', _token.token_owner.substring(0,10) + "...");
	else
		updateInnerHTML('existingCardOwner', _token.token_owner.substring(0,20) + "...");


	if(_token.token_owner.toUpperCase() == userWalletAddress.toUpperCase())
		existingCardOwned = true;
	else
		existingCardOwned = false;


	document.getElementById('existingCardOwner').value = _token.token_owner;
	if(_token.plots_lng.length > 1)
		updateInnerHTML('existingCardTotalPlots', _token.plots_lng.length + " Plots");
	else
		updateInnerHTML('existingCardTotalPlots', _token.plots_lng.length + " Plot");

	if(document.getElementById('destoryCOINs')){


		updateInnerHTML('destoryCOINs', _token.plots_lng.length);
		updateInnerHTML('destoryCOINs2', _token.plots_lng.length);

	}


	var _LandSize = parseInt(_token.plots_lng.length) * PLOT_SIZE;
	var _LandSizeUnit = "m";
	if(_LandSize > 99999) {
		_LandSize = _LandSize / 1000;
		_LandSizeUnit = "km";
	}
	updateInnerHTML('existingCardTotalPlotsSize', _LandSize + _LandSizeUnit);

	

	//updateInnerHTML('existingCardsEmpireScore', _token.empire_score);
	updateInnerHTML('existingCardsCost', getReadOnlyWeb3Utils().utils.fromWei(_token.current_value.toString(), 'ether').substring(0,8));

	existingCardPaymentAmount = _token.current_value * CURRENT_RESALE_MULTIPLIER;

	updateInnerHTML('existingCardBuyPrice', getReadOnlyWeb3Utils().utils.fromWei((_token.current_value * CURRENT_RESALE_MULTIPLIER).toString(), 'ether').substring(0,8));

	if(document.getElementById('destoryCost')){

		updateInnerHTML('destoryCost', getReadOnlyWeb3Utils().utils.fromWei((_token.current_value * CURRENT_RESALE_MULTIPLIER).toString(), 'ether').substring(0,8));
		
	}
	

	updateInnerHTML('existingCardNewEmpireScore', _token.empire_score * CURRENT_EMPIRE_MULTIPLIER);

	updateInnerHTML('existingCardBadge', pad(_token.empire_score,5));
	$('#existingCardBadge').attr('title', 'EMPIRE SCORE:' + pad(_token.empire_score,5));



	updateInnerHTML('existingCardName', _token.name);
	updateInnerHTML('existingCardStartPoint', _token.plots_lat[0]/1000000 + "," + _token.plots_lng[0]/1000000);
	existingCardStartPoint = L.latLng(_token.plots_lat[0]/1000000, _token.plots_lng[0]/1000000);



	/*
	var _latLng = L.latLng(_token.plots_lat[0]/1000000, _token.plots_lng[0]/1000000);
	var layerPoint = img_map.project(_latLng).divideBy(256).floor();
	*/

	//$('#existingCardImg').attr("src","https://fly.maptiles.arcgis.com/arcgis/rest/services/World_Imagery_Firefly/MapServer/tile/16/" + layerPoint.y + "/" + layerPoint.x);
	//$('#existingCardImg').attr("src","https://api.planetcrypto.app/img/" + _token_id);
	$('#existingCardImg').css("background-image", "url(https://api.planetcrypto.app/img/" + _token_id + ")"); 
	$('#existingCardImgBack2').css("background-image", "url(https://api.planetcrypto.app/img/" + _token_id + ")"); 


	//$('#existingCardImg').attr("src","img_srv/index.htm?lat=" + _token.plots_lat[0]/1000000 + "&lng=" + _token.plots_lng[0]/1000000);

	//$( "#existingCardImg" ).load( "img_srv/index.htm?lat=" + _token.plots_lat[0]/1000000 + "&lng=" + _token.plots_lng[0]/1000000 );


	if(_flyTo){
		mymap.flyTo(existingCardStartPoint, MIN_BUY_LVL);		
	}

	share_url = 'https://planetcrypto.app/token/' + _token_id;
	$("meta[property='og:url']").attr("content", share_url);

	share_title = 'PlanetCrypto Card: ' + _token.name + " - Where will you buy? #blockchain #blockchaingames #crypto ";
	$('meta[property="og:title"]').attr("content", share_title);


	share_description = _token.name + ' @ ' + hardFixed(existingCardStartPoint.lat,4) + "," + hardFixed(existingCardStartPoint.lng,4);
	share_description += ", owned by: " + _token.token_owner + " ";

	$("meta[property='og:description']").attr("content", share_description);

	$("meta[property='og:image']").attr("content", 'https://api.planetcrypto.app/img/' + _token_id);

	//$('#existingCardDiv').removeClass('hide');
	//shareDropdown = new needShareDropdown(document.getElementById('shareExistingCard'));
	if(shareDropdown) {
		shareDropdown.options.title = getShareTitle();
		shareDropdown.options.url = getShareURL();
		shareDropdown.options.image = getShareImage();
		shareDropdown.options.description = getShareDescription();

	} else {

		shareDropdown = new needShareDropdown(document.getElementById('shareExistingCard'), {

			  // child selector of custom share button
			  shareButtonClass: false, 

			  // default or box
			  iconStyle: 'default', 

			  // horizontal or vertical
			  boxForm: 'horizontal', 

			  // top / middle / bottom + Left / Center / Right
			  //position: 'topLeft', 

			  // text for trigger button
			  buttonText: '',

			  // http or https
			  protocol: ['http', 'https'].indexOf(window.location.href.split(':')[0]) === -1 ? 'https://' : '//',

			  // url to share
			  url: getShareURL(), 

			  // title to share
			  title: getShareTitle(),

			  // image to share
			  image: getShareImage(),

			  // description to share
			  description: getShareDescription(),

			  // social networks
			  networks: 'Twitter,Facebook,Reddit,Mailto,Linkedin'
			  
			});

	}

	updateInnerHTML('existingCardsURL', 'planetcrypto.app/token/' + _token_id);

	$('#existingCardDiv').foundation('open'); 

	ga('send', 'event', 'GeneralActions', 'ShowExistingCard', _token_id);

}

function gotoExistingCardStartPoint(){
	try{
		if(mymap.getZoom() < MIN_BUY_LVL) {
			mymap.flyTo(
				existingCardStartPoint,
				18
			);
		} else {
			mymap.flyTo(
				existingCardStartPoint,
				18
			);
		}
	} catch(e){

	}	
}

function setupImgMap() {
	/*
	setTimeout(function(){
		console.log("setting up card map");

	 	img_map = L.map('img_mapid',{
			doubleClickZoom: false,
			zoomSnap: 1,
			boxZoom: false,
			scrollWheelZoom: true
		}).setView([51.505, -0.09],16);

	},500);
	*/
}
function setupMap() {

	if(!isMobile) {
		mymap = L.map('mapid',{
			doubleClickZoom: false,
			zoomSnap: 1,
			boxZoom: false,
			scrollWheelZoom: true
		}).setView([15,0],3, {paddingTopLeft: [300,300]});		
	} else {
		mymap = L.map('mapid',{
			doubleClickZoom: false,
			zoomSnap: 1,
			boxZoom: false,
			scrollWheelZoom: true
		}).setView([38.3796072,-93.0596094],3, {paddingTopLeft: [300,300]});
	}

	//38.3796072,-93.0596094
	//51.505, -0.09
	mymap.setMaxZoom(18);
	mymap.setMinZoom(3);



	//setupImgMap();


	layer = L.esri.basemapLayer('Streets').addTo(mymap);


	var mobileOpts = {
		url: 'https://nominatim.openstreetmap.org/search?format=json&q={s}',
		jsonpParam: 'json_callback',
		formatData: formatJSON,		
		textPlaceholder: 'Search...',
		autoType: false,
		tipAutoSubmit: true,
		autoCollapse: true,
		autoCollapseTime: 10000,
		delayType: 500,
		marker: {
			icon: true
		}		
	};

	mymap.addControl( new L.Control.Search(mobileOpts) );


	if (!navigator.geolocation) {
	} else {
		navigator.geolocation.getCurrentPosition(startWithUserPos, startWithDefaultPos);	
	}


	function startWithUserPos(location) {
		//console.log("startWithUserPos", location);
		if(_findTokenId.length > 0){

		} else {
			locateMap(new L.LatLng(location.coords.latitude, location.coords.longitude));
		}
	}
	function startWithDefaultPos(error) {
		//console.log("startWithDefaultPos", error);
	}

	function locateMap(locate_latlng) {
		console.log("Flying to:", locate_latlng);
		mymap.flyTo(locate_latlng);
	}

	mymap.on('click', function(ev){
		console.log("MAP CLICK", ev);
		if(actionMode == '') {
			$.toast({
              heading: 'Use BUY LAND Tools',
              text: "Use the tools at the top of the page to purchase land.<br/><br/>Click the [?] symbol for the GAME GUIDE.",
              icon: 'info',
              allowToastClose: true,
              position: 'bottom-right',
              hideAfter: TOAST_HIDE_DELAY,
              showHideTransition: TOAST_HIDE_TRANSITION
            });
		}
	});

	mymap.on('zoomstart', function(ev){
		clearMarkers();
		clearGrids();
		// clear up rectsDisplayedKeys
		clearDisplayedKeys();
		clearSelectedRects();

	});
	mymap.on('movestart', function(ev){
		
	})
	mymap.on('moveend', function(ev){
		//console.log("MOVE:" + ev.target._zoom);
		clearDisplayedKeys();
		

		if(ev.target._zoom >16) {
			//console.log("CHECKS:");
			//console.log(getPixelSize(PLOT_SIZE));
			//console.log(lightGrids[ev.target._zoom].options.cellSize);
			if(
				hardFixed(lightGrids[ev.target._zoom].options.cellSize,2)
				!= 
				hardFixed(getPixelSize(PLOT_SIZE),2)
				) {
				// needs a reset
				//console.log("Resetting grid");
				var _cellSize = getPixelSize(PLOT_SIZE);
				lightGrids[ev.target._zoom].remove();
				lightGrids[ev.target._zoom].removeFrom(mymap);
				
				lightGrids[ev.target._zoom] = new VirtualGrid({
					cellSize: _cellSize,
					minZoom: ev.target._zoom,
					maxZoom: ev.target._zoom,
					zoomTriger: ev.target._zoom
				});
				lightGrids[ev.target._zoom].on('cellsupdated', function(ev){
					//console.log("cellsupdated", ev);
					clearDisplayedKeys();
					queryMap(ev.target._map._zoom);
				});
				lightGrids[ev.target._zoom].addTo(mymap)
			}

			//queryMap(ev.target._zoom);
		} else {
			queryMap(ev.target._zoom);
		}

	});


	mymap.on('gameDataReady', function(ev){
		console.log("gameDataReady");

		

		if(_findTokenId.length > 0) {

			try {
				document.getElementById('ogurl').content = 'https://planetcyrpto.app/token/' + _findTokenId;
			} catch(e){

			}

			/*
			if(parseInt(_findTokenId) > 0){
				showExistingCard(parseInt(_findTokenId), true);

			}
			*/
			
		}
		queryMap(ev.target._zoom);
		updateUserCards();

	});


	mymap.on('zoomend', function(ev){

		//console.log("ZOOM:" + ev.target._zoom);






		if(grid14Iinit==false && ev.target._zoom == 14){


			if(rectsToBuyLen() > 0) {

				currentlySelectedMarker = L.marker(
					rectsToBuy[
						Object.keys(rectsToBuy)[0]
					],
					{
						title: 'Your Currently Selectd Plots of Land to Buy',
						icon: blankCardIcon,
						riseOnHover: true
					}

					).addTo(mymap);
			}
			
			grid14Iinit = true;
		}

		
		

		// grids only needs at 17/18???
		if(ev.target._zoom > 16) {
			if(!lightGrids[ev.target._zoom]) {

				var _cellSize = getPixelSize(PLOT_SIZE);

				lightGrids[ev.target._zoom] = new VirtualGrid({
					cellSize: _cellSize,
					minZoom: ev.target._zoom,
					maxZoom: ev.target._zoom,
					zoomTriger: ev.target._zoom
				});
				lightGrids[ev.target._zoom].on('cellsupdated', function(ev){
					//console.log("cellsupdated", ev);
					clearDisplayedKeys();
					queryMap(ev.target._map._zoom);
				});
				lightGrids[ev.target._zoom].addTo(mymap);


				
			} else {
				console.log("READY");
				//queryMap(ev.target._zoom);
			}
		} else {

			//if(ev.target._zoom < 13) {
			if(ev.target._zoom < 17) {
				// 14 and below just direct markers

			} else {

			}

		}

		if(ev.target._zoom > 16){
			//lightGrids[ev.target._zoom].addTo(mymap);
		}
		if(ev.target._zoom > 12) {
			//lightGrids[ev.target._zoom].addTo(mymap);	
		}


		if(ev.target._zoom < 15) {



			if(allowedPlotsCircle)
				allowedPlotsCircle.remove();

			if(currentlySelectedMarker && currentlySelectedMarkerRemoved == true) {
				currentlySelectedMarker.addTo(mymap);
				currentlySelectedMarkerRemoved = false;
			} 

			if(ev.target._zoom == 10) {
				// working code for resizing icon
				// do be done on lower zoom levels (maybe 5 for example)
				// also needs the shadow resizing
				/*
				blankCardIcon.options.iconSize = [10, 20];
				//var icon = centerMarker.options.icon;
				//icon.options.iconSize = [newwidth, newheight];
				//centerMarker.setIcon(icon)
				currentlySelectedMarker.setIcon(blankCardIcon);
				*/
			}

		} else {

			if(rectsToBuyLen() > 0)
				allowedPlotsCircle.addTo(mymap);

			if(currentlySelectedMarker){
				currentlySelectedMarker.remove();
				currentlySelectedMarkerRemoved = true;
			}

		}
	}); // zoom 15 = 3.36 pixels per 10m


}


var currentBaseMapsHidden = false;
function toggleBasemaps() {
	//console.log(currentBaseMapsHidden);
	if(!currentBaseMapsHidden){
		$("#basemaps").addClass('hide');
		currentBaseMapsHidden = true;
	} else {
		$("#basemaps").removeClass('hide');
		currentBaseMapsHidden = false;
	}
}

function setBasemap(basemap) {
	if (layer) {
	  mymap.removeLayer(layer);
	}

	layer = L.esri.basemapLayer(basemap);

	mymap.addLayer(layer);

	if (layerLabels) {
	  mymap.removeLayer(layerLabels);
	}

	if (basemap === 'ShadedRelief'
	 || basemap === 'Oceans'
	 || basemap === 'Gray'
	 || basemap === 'DarkGray'
	 || basemap === 'Terrain'
	) {
	  layerLabels = L.esri.basemapLayer(basemap + 'Labels');
	  mymap.addLayer(layerLabels);
	} else if (basemap.includes('Imagery')) {
	  layerLabels = L.esri.basemapLayer('ImageryLabels');
	  mymap.addLayer(layerLabels);
	}
}

function changeBasemap(basemaps){
	var basemap = basemaps.value;
	setBasemap(basemap);
}
function resetButtons() {
	document.getElementById('newCardName').value = '';
	$('#buySingle').removeClass('secondary').addClass('success');
	$('#buyMultiple').removeClass('secondary').addClass('success');
	$('#removeSingle').removeClass('secondary').addClass('warning');
	$('#removeAll').removeClass('secondary').addClass('alert');

	$('#buySingleMobile').removeClass('secondary').addClass('success');
	$('#removeSingleMobile').removeClass('secondary').addClass('warning');
	$('#removeAllMobile').removeClass('secondary').addClass('alert');
}

function startBuyMultiple() {
	if(mymap.getZoom() < MIN_BUY_LVL) {
		mymap.setZoom(MIN_BUY_LVL);
	}
	actionMode = 'BUYMULTI';


  	resetButtons();
  	$('#buyMultiple').addClass('secondary').removeClass('success');


  	ga('send', 'event', 'BuyTools', 'BuySingleOrMultiple');
}
function startRemoveSingle() {
	if(mymap.getZoom() < MIN_BUY_LVL)
		mymap.setZoom(MIN_BUY_LVL);
	actionMode = 'REMOVESINGLE';

  	resetButtons();
  	$('#removeSingle').addClass('secondary').removeClass('warning');	
  	$('#removeSingleMobile').addClass('secondary').removeClass('warning');	

}
function startBuySingle() {
	if(mymap.getZoom() < MIN_BUY_LVL)
		mymap.setZoom(MIN_BUY_LVL);
	actionMode = 'BUYSINGLE';

  	resetButtons();
  	$('#buySingle').addClass('secondary').removeClass('success');
  	$('#buySingleMobile').addClass('secondary').removeClass('success');

  	ga('send', 'event', 'BuyTools', 'BuySingleOrMultiple');
}
function startRemoveAll() {
	resetSelectedRects();
  	resetButtons();
}


function showNewCard(){
	$('#newCardDiv').removeClass('hide');
}
function hideNewCard(){
	$('#newCardDiv').removeClass('hide').addClass('hide');	
}

function gotoStartPointLink() {
	try{
		if(mymap.getZoom() < MIN_BUY_LVL) {
			mymap.flyTo(
				L.latLng(document.getElementById('newCardStartPoint').innerHTML.split(',')),
				18
			);
		} else {
			mymap.flyTo(
				L.latLng(document.getElementById('newCardStartPoint').innerHTML.split(',')),
				18
			);
		}
	} catch(e){

	}
}
function updateNewCard() {
	var _rectsToBuyLen = rectsToBuyLen();

	if(_rectsToBuyLen > 0) {

		updateInnerHTML('newCardStartPoint', 
			rectsToBuy[
					Object.keys(rectsToBuy)[0]
					].lat.toFixed(4) + "," + 
					rectsToBuy[Object.keys(rectsToBuy)[0]].lng.toFixed(4));

		updateInnerHTML('newCardTotalPlots', _rectsToBuyLen);
		updateInnerHTML('newCardTotalPlotsSize', _rectsToBuyLen * 20 + 'm');
		var _currentCost = currentLandPrice.times(_rectsToBuyLen); 
		try{
			updateInnerHTML('newCardsCost', getReadOnlyWeb3Utils().utils.fromWei(_currentCost.toString(), 'ether').substring(0,8));
		} catch(e){
			updateInnerHTML('newCardsCost', _currentCost.div(1000000000000000000).toString().substring(0,8));
		}

		updateInnerHTML('newCardsEmpireScore', _rectsToBuyLen * currentEmpirePerPlot);
		updateInnerHTML('newPlanetCOINs', Math.floor(_rectsToBuyLen / 10));
		updateInnerHTML('newCardBadge', pad(_rectsToBuyLen * currentEmpirePerPlot,5));
		checkforFirstPlot(_rectsToBuyLen);
	} else {

		// reset card to emtpy..
		clearNewBuyCard();
		// clear out the circle too..
		try {
			allowedPlotsCircle.remove();
		} catch(e){}
		//delete allowedPlotsCircle;

	}
}
function clearNewBuyCard() {
	$('#newCardDiv').addClass('hide');
	updateInnerHTML('newCardStartPoint', "--,--");

	updateInnerHTML('newCardTotalPlots', "0");
	updateInnerHTML('newCardTotalPlotsSize', '0m');
	updateInnerHTML('newCardsCost', '0' );
	hideNewCard();
}

function checkforFirstPlot(_rectsToBuyLen) {
	if(_rectsToBuyLen == 1) {
		showNewCard();
		if(allowedPlotsCircle)
			allowedPlotsCircle.remove();

		// is first plot so add in the max circumfrance layer...
		allowedPlotsCircle = L.circle(rectsToBuy[Object.keys(rectsToBuy)[0]], {
		color: 'black',
		radius: MAX_BUY_RADIUS,
		fill: false,

		});
		mymap.addLayer(allowedPlotsCircle);
	}
}
function checkBuyPointAllowed(_point, _showError) {

	if(rectsToBuyLen() > 0) {
		var centerPoint = rectsToBuy[Object.keys(rectsToBuy)[0]];
		if(Math.abs(centerPoint.distanceTo(_point)) <= MAX_BUY_RADIUS) {
			return true;
		} else {
			if(_showError) {
				var _msg = "<p>Each trading card can only hold plots of land that are within " + MAX_BUY_RADIUS + "m radius of the original plot.</p>";
				_msg += "<p>This helps prevent trading cards getting too split across the globe.</p>";
				_msg += "<p>Please select a plot that is within the circle shown on the map.</p>";
				showError(_msg, "plot too far from original");
			}

			return false;
		}
	} else {
		return true;
	}

}

// utils

function coordsToKey(coords){
  return coords.x + ':' + coords.y + ':' +coords.z;
}

function rectsToBuyLen() {
	return Object.keys(rectsToBuy).length;
}

function getPixelSize(baseMeters) {
	var _centerLatLng = mymap.getCenter(); // get map center
	var _pointC = mymap.latLngToContainerPoint(_centerLatLng); // convert to containerpoint (pixels)
	var _pointX = [_pointC.x + 1, _pointC.y]; // add one pixel to x
	var _pointY = [_pointC.x, _pointC.y + 1]; // add one pixel to y

	// convert containerpoints to latlng's
	var _latLngC = mymap.containerPointToLatLng(_pointC);
	var _latLngX = mymap.containerPointToLatLng(_pointX);
	var _latLngY = mymap.containerPointToLatLng(_pointY);

	var _pixelSizeX = _latLngC.distanceTo(_latLngX); // calculate distance between c and x (latitude)
	var _pixelSizeX = _latLngC.distanceTo(_latLngY); // calculate distance between c and y (longitude)
	//console.log("INIT SIZE:" + baseMeters / _pixelSizeX);
	return hardFixed(baseMeters / _pixelSizeX,2);
}

function getPixelSize2(baseMeters, map) {
	var _centerLatLng = map.getCenter(); // get map center
	var _pointC = map.latLngToContainerPoint(_centerLatLng); // convert to containerpoint (pixels)
	var _pointX = [_pointC.x + 1, _pointC.y]; // add one pixel to x
	var _pointY = [_pointC.x, _pointC.y + 1]; // add one pixel to y

	// convert containerpoints to latlng's
	var _latLngC = map.containerPointToLatLng(_pointC);
	var _latLngX = map.containerPointToLatLng(_pointX);
	var _latLngY = map.containerPointToLatLng(_pointY);

	var _pixelSizeX = _latLngC.distanceTo(_latLngX); // calculate distance between c and x (latitude)
	var _pixelSizeX = _latLngC.distanceTo(_latLngY); // calculate distance between c and y (longitude)
	//console.log("INIT SIZE:" + baseMeters / _pixelSizeX);
	return baseMeters / _pixelSizeX;
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
}

function formatJSON(rawjson) {	//callback that remap fields name
	var json = {},
		key, loc, disp = [];
		
	for(var i in rawjson)
	{	
		disp = rawjson[i].display_name.split(',');	

		key = disp[0] +', '+ disp[1];
		
		loc = L.latLng( rawjson[i].lat, rawjson[i].lon );
		
		json[ key ]= loc;	//key,value format
	}
	
	return json;
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
function updateInnerHTML(item, value){
  document.getElementById(item).innerHTML = value;
}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
function hardFixed(_in, _decimals) {
	if(_in == "0")
		return 0;
	var _a = _in.toString().split(".");
	if(_a.length >0) {
		return parseFloat( 
				_a[0].toString() + "." + _a[1].toString().substring(0,_decimals));
	} else {
		return parseFloat(_a[0]);
	}
}

function normaliseLatLngUp(_in){
	var _len = _in.toString().length;
	var _rightDigit = parseInt(_in.toString().substring(_len-1,1));
	var _rightDigit2 = parseInt(_in.toString().substring(_len-2,1));
	if(_rightDigit <= 5) {
		
		//console.log("normaliseLatLngUp:", parseFloat(_in.toString().substring(0,_len-1) + '1'));
		return parseFloat(_in.toString().substring(0,_len-1) + '1');
		
	} else {
		_rightDigit2++;
		//console.log("normaliseLatLngUp2:", parseFloat(_in.toString().substring(0,_len-2) + _rightDigit2.toString() + '1'));
		return parseFloat(_in.toString().substring(0,_len-2) + _rightDigit2.toString() + '1');

	}
	return _in;
				//M {lat: 51.5085, lng: -0.0972}	
}
function normaliseLatLngDown(_in){
	var _len = _in.toString().length;
	var _rightDigit = parseInt(_in.toString().substring(_len-1,1));
	var _rightDigit2 = parseInt(_in.toString().substring(_len-2,1));
	if(_rightDigit >= 5) {
		_rightDigit2++;
		//console.log("normaliseLatLngDown", parseFloat(_in.toString().substring(0,_len-1) + _rightDigit2.toString() + '1'));
		return  parseFloat(_in.toString().substring(0,_len-1) + _rightDigit2.toString() + '1');

		
		
	} else {
		//console.log("normaliseLatLngDown2",  parseFloat(_in.toString().substring(0,_len-2) + '1'));
		return  parseFloat(_in.toString().substring(0,_len-2) + '1');
	}
				//M {lat: 51.5085, lng: -0.0972}

				//M {lat: 51.5, lng: -0.0972}	
	return _in;
}
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// working on log event update & new page load


//var latestCardsOnDisplay = 0;
//var latestCardsIDs = [];
var playerStats = [];

function updatePreviousCards() {
	$("#userLostCards").empty();
	$("#userLostCards2").empty();

	console.log("updatePreviousCards", tokens[1]);
	console.log("canPlay", canPlay);
	if(canPlay) {
		Object.keys(tokens).forEach(function(key,index) {



			var _token = tokens[key];

			processPreviousCardsToken(_token, key);


		});
	}
}


function processPreviousCardsToken(_token, key){

	var usedToOwn=false;

	if(_token.token_owner.toUpperCase() != userWalletAddress.toUpperCase()){

		for(var c=0; c< _token.buy_history.length; c++) {
			if(_token.buy_history[c].from.toUpperCase() == userWalletAddress.toUpperCase()) {
				// user used to own this card
				usedToOwn = true;
				break;
			}
		}

		if(usedToOwn){
			console.log("Used to own but no longer:", _token);

			var existingDisplay;

			if(document.getElementById('latestCardFull' + '_previous_' + key)){
				try{
					existingDisplay = document.getElementById('latestCardFull' + '_previous_' + key).value;
				} catch(e){

				}
			}

			if(existingDisplay) {

			} else {
				var _newCard = latestCardsFull.replace(/\[\]/g, '_previous_' + key);	

				if(!isMobile)
					$("#userLostCards").prepend(_newCard);
				else{
					$("#userLostCards2").prepend(_newCard);
				}
			}
			
			$('#latestCardHeader' + '_previous_' + key).css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6))
			updateInnerHTML('latestCardsName' + '_previous_' + key, _token.name);
			updateInnerHTML('latestCardsCardOwner' + '_previous_' + key, _token.token_owner.substring(0,15) + "...");
			updateInnerHTML('latestCardsStartPoint' + '_previous_' + key, hardFixed(_token.plots_lat[0] /1000000,4)+ "," + hardFixed(_token.plots_lng[0]/1000000,4));

			if(_token.plots_lat.length > 1)
				updateInnerHTML('latestCardsTotalPlots' + '_previous_' + key, _token.plots_lat.length + " Plots");
			else
				updateInnerHTML('latestCardsTotalPlots' + '_previous_' + key, _token.plots_lat.length + " Plot");

			updateInnerHTML('latestCardsTotalPlotsSize' + '_previous_' + key, _token.plots_lat.length * PLOT_SIZE + "m<sup>");
			updateInnerHTML('latestCardsEmpireScore' + '_previous_' + key, _token.empire_score);
			updateInnerHTML('latestCardsBadge' + '_previous_' + key, pad(_token.empire_score,5));
			updateInnerHTML('latestCardsCost' + '_previous_' + key, getReadOnlyWeb3Utils().utils.fromWei(_token.current_value.toString(), 'ether').substring(0,8));
			
			document.getElementById('latestCardFull' + '_previous_' + key).value = key;


		}

	}
}

function updateUserCards() {
	var maxLatest = 50;
	var tokensLen = Object.keys(tokens).length;
	var latestStart = tokensLen - maxLatest; //tokensLen =69-50 = 19
	
	if(latestStart < 0)
		latestStart = 0;



	playerStats = [];

	$("#latestCards").empty();
	$("#latestCards2").empty();
	$("#userLostCards").empty();
	$("#userLostCards2").empty();

	Object.keys(tokens).forEach(function(key,index) {
		//console.log(tokens[key]);
		//console.log(key);
		var _token = tokens[key];


		var foundId = -1;
		for(var lookupC=0; lookupC<playerStats.length;lookupC++){
			if(playerStats[lookupC].playerAddress){

				if(playerStats[lookupC].playerAddress.toUpperCase() == _token.token_owner.toUpperCase()){
					foundId = lookupC;
					break;
				}

			}
		}
		if(foundId == -1){ // new player
			playerStats.push({
				playerAddress: _token.token_owner,
				totalEmpireScore: _token.empire_score,
				totalLand: _token.plots_lng.length
			});
		} else {
			playerStats[foundId].totalEmpireScore = parseInt(playerStats[foundId].totalEmpireScore) + parseInt(_token.empire_score);
			playerStats[foundId].totalLand =  parseInt(playerStats[foundId].totalLand) + parseInt(_token.plots_lng.length);
		}

		

	
		if(canPlay ) {
			
			if(tokens[key].token_owner.toUpperCase() == userWalletAddress.toUpperCase() ) {

				// do we already have it...
				var existingDisplay;

				if(document.getElementById('userCardFull' + key))
					existingDisplay = document.getElementById('userCardFull' + key).value;

				if(existingDisplay) {

				} else {
					var _newCard = userCardsFull.replace(/\[\]/g, key);	

					if(!isMobile)
						$("#userCards").prepend(_newCard);
					else
						$("#userCards2").prepend(_newCard);
				}
				
				$('#userCardHeader' + key).css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6))
				updateInnerHTML('userCardsName' + key, _token.name);
				updateInnerHTML('userCardsCardOwner' + key, _token.token_owner.substring(0,15) + "...");
				updateInnerHTML('userCardsStartPoint' + key, hardFixed(_token.plots_lat[0] /1000000,4)+ "," + hardFixed(_token.plots_lng[0]/1000000,4));

				if(_token.plots_lat.length > 1)
					updateInnerHTML('userCardsTotalPlots' + key, _token.plots_lat.length + " Plots");
				else
					updateInnerHTML('userCardsTotalPlots' + key, _token.plots_lat.length + " Plot");

				updateInnerHTML('userCardsTotalPlotsSize' + key, _token.plots_lat.length * PLOT_SIZE + "m<sup>");
				updateInnerHTML('userCardsEmpireScore' + key, _token.empire_score);
				updateInnerHTML('userCardsBadge' + key, pad(_token.empire_score,5));
				updateInnerHTML('userCardsCost' + key, getReadOnlyWeb3Utils().utils.fromWei(_token.current_value.toString(), 'ether').substring(0,8));
				
				document.getElementById('userCardFull' + key).value = key;
				
			}

			// did the user previously own it...

			processPreviousCardsToken(_token, key);

		}

		// populate the land sales tab with x cards...	
		if(index == latestStart ) {
			var existingDisplay = 0;

			if(document.getElementById('latestCardFull' + key)){
				try{
					existingDisplay = document.getElementById('latestCardFull' + key).value;
				} catch(e){

				}
			}

			if(existingDisplay > 0) {

			} else {
				var _newCard = latestCardsFull.replace(/\[\]/g, key);	

				if(!isMobile)
					$("#latestCards").prepend(_newCard);
				else{
					$("#latestCards2").prepend(_newCard);
				}
			}
			
			$('#latestCardHeader' + key).css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6))

			updateInnerHTML('latestCardsName' + key, _token.name);
			updateInnerHTML('latestCardsCardOwner' + key, _token.token_owner.substring(0,15) + "...");
			updateInnerHTML('latestCardsStartPoint' + key, hardFixed(_token.plots_lat[0] /1000000,4)+ "," + hardFixed(_token.plots_lng[0]/1000000,4));

			if(_token.plots_lat.length > 1)
				updateInnerHTML('latestCardsTotalPlots' + key, _token.plots_lat.length + " Plots");
			else
				updateInnerHTML('latestCardsTotalPlots' + key, _token.plots_lat.length + " Plot");

			updateInnerHTML('latestCardsTotalPlotsSize' + key, _token.plots_lat.length * PLOT_SIZE + "m<sup>");
			updateInnerHTML('latestCardsEmpireScore' + key, _token.empire_score);
			updateInnerHTML('latestCardsBadge' + key, pad(_token.empire_score,5));
			updateInnerHTML('latestCardsCost' + key, getReadOnlyWeb3Utils().utils.fromWei(_token.current_value.toString(), 'ether').substring(0,8));
			
			document.getElementById('latestCardFull' + key).value = key;
			//console.log("Adding latest", key, _newCard);
			latestStart++;



		}
		
	});
	//console.log("playerStats", playerStats);
	//console.log("playerStats SORTED", playerStatsSortedByEmpireScore());

	$('#LeaderboardTable').find("tr:gt(0)").remove();
	$('#LeaderboardTable2').find("tr:gt(0)").remove();


	var _sortedPlayers = playerStatsSortedByEmpireScore();

	var _totalEmpireScore = 0;
	for(var sortedIdx=0; sortedIdx<_sortedPlayers.length; sortedIdx++){
		_totalEmpireScore += parseInt(_sortedPlayers[sortedIdx].totalEmpireScore);
	}

	for(var sortedIdx=0; sortedIdx<_sortedPlayers.length; sortedIdx++){
		var _row = '<tr><td width="500"><a href="https://etherscan.io/address/' + _sortedPlayers[sortedIdx].playerAddress + '" target="_new">' + _sortedPlayers[sortedIdx].playerAddress + '</a></td>';

		var _mobileRow = '<tr><td width="500"><a href="https://etherscan.io/address/' + _sortedPlayers[sortedIdx].playerAddress + '" target="_new">' + _sortedPlayers[sortedIdx].playerAddress.substring(0,7) + '...</a></td>';

		var _displayLandSize = parseInt(_sortedPlayers[sortedIdx].totalLand) * PLOT_SIZE;
		var _displayLandSizeUnit = "m";
		if(_displayLandSize > 99999) {
			_displayLandSize = _displayLandSize / 1000;
			_displayLandSizeUnit = "km";
		}

		_row += '<td width="150">' + _displayLandSize + _displayLandSizeUnit + '<sup>2</sup></td>';
		_mobileRow += '<td width="150">' + _displayLandSize + _displayLandSizeUnit + '<sup>2</sup></td>';

		_row += '<td width="150">' + _sortedPlayers[sortedIdx].totalEmpireScore + '</td>'; //</tr>'

		// % of tax...
		_row += '<td width="150">' + ((parseFloat(_sortedPlayers[sortedIdx].totalEmpireScore) / parseFloat(_totalEmpireScore)) * 100).toFixed(2) + '%</td>';
		

		_mobileRow += '<td width="150">' + _sortedPlayers[sortedIdx].totalEmpireScore + '</td></tr>'

		$('#LeaderboardTable tbody').append(_row);
		$('#LeaderboardTable2 tbody').append(_mobileRow);

		if(sortedIdx >= 20)
			break;
	}

}


function playerStatsSortedByEmpireScore(){
	return playerStats.sort(function(a,b){
		return parseInt(b.totalEmpireScore) - parseInt(a.totalEmpireScore);
	});
}

function playerStatsSortedByLand(){
	return playerStats.sort(function(a,b){
		return parseInt(b.totalLand) - parseInt(a.totalLand);
	});
}


function showGuide() {
	$('#welcomeDiv').foundation('close');
	$('#guideDiv').foundation('open');

	ga('send', 'event', 'GeneralActions', 'ShowGuide');
}

// working
function showExistingUserCard(_userCard){
	showExistingCard(_userCard.value, true);
}
function showLatestUserCard(_latestCard){
	$('#offCanvasRightLatestCards').foundation('close');
	$('#offCanvasRightYourCards').foundation('close');
	

	showExistingCard(_latestCard.value, true);	
}
var userCardsFull = '<div class="userCardsItemFull" id="userCardFull[]" onclick="showExistingUserCard(this);">';
userCardsFull+= '                      <div class="large badge alert existingCardBadge" id="userCardsBadge[]">00000</div>';
userCardsFull+= '';
userCardsFull+= '                      <div class="card userCardItemInnerCardDiv"  >';
userCardsFull+= '                        <form style="padding: 4px;">';
userCardsFull+= '                          <div class="userCardsMainContent"><div style="background-color: rgba(255,255,255,0.9); width: 100%; height: 100%;">';
userCardsFull+= '                                ';
userCardsFull+= '                                <div id="userCardHeader[]" class="card-divider text-center userCardsHeader" >';
userCardsFull+= '                                  <div class="innerHeader">';
userCardsFull+= '                                    <strong style="font-size: 0.4em;">TITLE DEED</strong>';
userCardsFull+= '                                    <h4 style="width: 100%; background-color: #efefef; color: black; font-size:0.9em; overflow-y: scroll;" id="userCardsName[]"></h4>';
userCardsFull+= '                                    ';
userCardsFull+= '                                  </div>';
userCardsFull+= '                                </div>';
userCardsFull+= '';
userCardsFull+= '                                <div class="card-section" style="margin: 5px; padding:10px; ">';
userCardsFull+= '                                  <p class="smallTxt" style="font-weight: bold;">';
userCardsFull+= '                                    <img class="icon-house"/> <strong><span id="userCardsCardOwner[]">0x0</span></strong><br/>';
userCardsFull+= '                                    <img class="icon-compass"/> <strong><span id="userCardsStartPoint[]">0.0000, 0.0000</span></strong><br/>';
userCardsFull+= '                                    <img class="icon-size"/> <strong><span id="userCardsTotalPlots[]">0</span></strong><br/>';
userCardsFull+= '                                    <img class="icon-ruler"/> <strong><span id="userCardsTotalPlotsSize[]">0m</span><sup>2</sup></strong><br/>';
userCardsFull+= '                                    <img class="icon-trophy"/> <strong>+<span id="userCardsEmpireScore[]">0</span></strong><br/>';
userCardsFull+= '                                    <img class="icon-eth"/> <strong><span id="userCardsCost[]">0.000</span> ETH</strong></p>';
userCardsFull+= '';
userCardsFull+= '                                </div>';
userCardsFull+= '';
userCardsFull+= '                              </div></div>';
userCardsFull+= '';
userCardsFull+= '                        </form>';
userCardsFull+= '                      </div>';
userCardsFull+= '                    </div>';

var latestCardsFull = '<div class="userCardsItemFull" id="latestCardFull[]" onclick="showLatestUserCard(this);">';
latestCardsFull+= '                      <div class="large badge alert existingCardBadge" id="latestCardsBadge[]">00000</div>';
latestCardsFull+= '';
latestCardsFull+= '                      <div class="card userCardItemInnerCardDiv"  >';
latestCardsFull+= '                        <form style="padding: 4px;">';
latestCardsFull+= '                          <div class="userCardsMainContent"><div style="background-color: rgba(255,255,255,0.9); width: 100%; height: 100%;">';
latestCardsFull+= '                                ';
latestCardsFull+= '                                <div id="latestCardHeader[]" class="card-divider text-center userCardsHeader" >';
latestCardsFull+= '                                  <div class="innerHeader">';
latestCardsFull+= '                                    <strong style="font-size: 0.4em;">TITLE DEED</strong>';
latestCardsFull+= '                                    <h4 style="width: 100%; background-color: #efefef; color: black; font-size:0.9em; overflow-y: scroll;" id="latestCardsName[]"></h4>';
latestCardsFull+= '                                    ';
latestCardsFull+= '                                  </div>';
latestCardsFull+= '                                </div>';
latestCardsFull+= '';
latestCardsFull+= '                                <div class="card-section" style="margin: 5px; padding:10px; ">';
latestCardsFull+= '                                  <p class="smallTxt" style="font-weight: bold;">';
latestCardsFull+= '                                    <img class="icon-house"/> <strong><span id="latestCardsCardOwner[]">0x0</span></strong><br/>';
latestCardsFull+= '                                    <img class="icon-compass"/> <strong><span id="latestCardsStartPoint[]">0.0000, 0.0000</span></strong><br/>';
latestCardsFull+= '                                    <img class="icon-size"/> <strong><span id="latestCardsTotalPlots[]">0</span></strong><br/>';
latestCardsFull+= '                                    <img class="icon-ruler"/> <strong><span id="latestCardsTotalPlotsSize[]">0m</span><sup>2</sup></strong><br/>';
latestCardsFull+= '                                    <img class="icon-trophy"/> <strong>+<span id="latestCardsEmpireScore[]">0</span></strong><br/>';
latestCardsFull+= '                                    <img class="icon-eth"/> <strong><span id="latestCardsCost[]">0.000</span> ETH</strong></p>';
latestCardsFull+= '';
latestCardsFull+= '                                </div>';
latestCardsFull+= '';
latestCardsFull+= '                              </div></div>';
latestCardsFull+= '';
latestCardsFull+= '                        </form>';
latestCardsFull+= '                      </div>';
latestCardsFull+= '                    </div>';



function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}
function showProcessing() {
	$("#processingDiv").removeClass("hide");
}
function hideProcessing() {
	$("#processingDiv").addClass('hide');
}
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
  	{
  		pageLanguage: 'en', 
  		//,el,id,it,ja,jv,ms,pa,pt,tr
  		includedLanguages: 'ar,en,es,fr,jv,ko,ja,ru,zh-CN,de,id,it',
  		//includedLanguages: 'ar,zh-CN,en,es,fr,de,el,id,it,ja,jv,ko,ms,pa,pt,ru,tr', 
  		//layout: google.translate.TranslateElement.InlineLayout.SIMPLE, 
  		layout: google.translate.TranslateElement.InlineLayout.SIMPLE, 
  		autoDisplay: false}, 'google_translate_element');



    $('#google_translate_element').on("click", function () {

        // Change font family and color
        $("iframe").contents().find(".goog-te-menu2-item div, .goog-te-menu2-item:link div, .goog-te-menu2-item:visited div, .goog-te-menu2-item:active div, .goog-te-menu2 *")
            .css({
                'color': '#544F4B',
                'font-family': 'Roboto',
				'width':'100%'
            });
        // Change menu's padding
        $("iframe").contents().find('.goog-te-menu2-item-selected').css ('display', 'none');
			
				// Change menu's padding
        $("iframe").contents().find('.goog-te-menu2').css ('padding', '0px');
      
        // Change the padding of the languages
        $("iframe").contents().find('.goog-te-menu2-item div').css('padding', '20px');
      
        // Change the width of the languages
        $("iframe").contents().find('.goog-te-menu2-item').css('width', '100%');
        $("iframe").contents().find('td').css('width', '100%');
      
        // Change hover effects
        $("iframe").contents().find(".goog-te-menu2-item div").hover(function () {
            $(this).css('background-color', '#4385F5').find('span.text').css('color', 'white');
        }, function () {
            $(this).css('background-color', 'white').find('span.text').css('color', '#544F4B');
        });

        // Change Google's default blue border
        $("iframe").contents().find('.goog-te-menu2').css('border', 'none');

        // Change the iframe's box shadow
        $(".goog-te-menu-frame").css('box-shadow', '0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.3)');
        
      
      
        // Change the iframe's size and position?
        $(".goog-te-menu-frame").css({
            'height': '100%',
            'width': '100%',
            'top': '0px'
        });
        // Change iframes's size
        $("iframe").contents().find('.goog-te-menu2').css({
            'height': '100%',
            'width': '100%'
        });
    });
}


function processJumpToLocationEvent(_this) {
	var optionSelected = $("option:selected", _this);
	var valueSelected = _this.value;


	

	if(valueSelected.substring(0,5) == 'token') {

		_findTokenId = valueSelected.split(":")[1];


		

	} else {
		
		mymap.flyTo(
				L.latLng(   valueSelected.split(",")[0], valueSelected.split(",")[1])
			, 10);		

	}

}
/*
	share_url = 'https://planetcrypto.app/token/' + _token_id;
	share_title = 'PlanetCrypto Property: ' + _token.name;
	share_description = _token.name + ' @ ' + hardFixed(existingCardStartPoint.lat,4) + "," + hardFixed(existingCardStartPoint.lng,4);
	share_description += ", owned by: " + _token.token_owner

*/
function getShareURL() {
	return 'https://planetcrypto.app/token/' + existingCardTokenId;
}
function getShareDescription() {
	return share_description;
}
function getShareTitle() {
	return share_title;
}
function getShareImage() {
	return 'https://api.planetcrypto.app/img/' + existingCardTokenId;
}
function destroyConfirm() {
	if(existingCardOwned)
		$('#destroyConfirm').foundation('open');
	else
		$('#destroyConfirmUnowned').foundation('open');
}
function flyTo(_lat,_lng){
	mymap.flyTo(L.latLng(_lat, _lng), 12);	
}