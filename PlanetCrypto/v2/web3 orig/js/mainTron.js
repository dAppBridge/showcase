var canPlay = false;

var PlanetCryptoContract;
var PlanetCryptoContractOld;
var PlanetCryptoContractOld2;

var PlanetCryptoCoinContract;


var playing = false;
var canFlyHome = true;




//var contractAddress = "TM7xwW5F4HideRk61v5XFDE4SBe77TFQpA"; //shasta //"TTFnbwbySrENg9aGYUkNYos12YdB1Q6huB"; // v2
//var contractAddress = "TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt"; // live
var contractAddress = "TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N"; // latest v3
var contractAddressOld = "TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG"; //live old - testing
var contractAddressOld2 = "TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt"; //live old2 - testing
//var coinsContractAddress = "TNE3dZuxpsmJSb7ToLk2W615yRxwAXHsny"; // shasta
var coinsContractAddress = "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz"; // live

var logsSubscription;



var useTestnet = false;
var isMainGame = true;



var PLOT_SIZE = 20;
var CURRENT_RESALE_MULTIPLIER = 2;
var CURRENT_EMPIRE_MULTIPLIER = 1.5;


//L.MakiMarkers.accessToken = MB_TOKEN;
var NULL_ADDR = "410000000000000000000000000000000000000000";
var MIN_BUY_LVL = 17; // min zoom level we allow buys to operate at
var MAX_BUY_RADIUS = 200;
var currentLandPrice = new BigNumber(20000000000000000); // 0.02 SUN
var currentEmpirePerPlot = 100;
var displayGameID = 1;
var maxGames = 2;
var _referer = NULL_ADDR; // "0x0000000000000000000000000000000000000000";
var CONTRACT_START_TIME = 1551787047000; // 1548174345000;
//var CONTRACT_START_TIME = 1548174345;



var rects = {};

var grid18;
var grid17;
var grid16;

var grid15;

var lightGrids = {};

var markerCluster = L.markerClusterGroup({
	spiderfyOnMaxZoom: false,
	showCoverageOnHover: true,
	zoomToBoundsOnClick: true,
	disableClusteringAtZoom: 9,
	chunkedLoading: true,
	maxClusterRadius: 60
});



var markersVisible = true;

var mainMarkersLayer = new L.FeatureGroup();




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
var userWalletAddress = NULL_ADDR; "0x00";
var userWalletAddressShort = NULL_ADDR; "0x00";
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




var share_url = 'https://planetcrypto.app';
var share_title = 'Planet Crypto ~ TRON/TRX Crypto Collectible Game ~ Own the World!';
var share_description = 'Im playing the biggest Tron Crypto Game - Plant Crypto...';


function shareExistingCard(){

	var win = window.open("https://www.addthis.com/bookmark.php?url=" + escape(share_url) + '&pub_id=ra-5bed6d6fe2749d93&description=' + escape(share_description), '_blank');

}


var isMobile = false;
var shareEarnEthBtn;
var provider;
//isMobile = true; // DEBUG DEBUG DEBUG

//window.addEventListener('load', async () => {
var isReadonly = true;
var currentSearchDisplayPage = 1;
var searchMaxPages = 1;
var totalInvested = new BigNumber(0);
var totalEarnings = new BigNumber(0);

// ENTRY
window.addEventListener('load', function(){

	var isMobileCheck = window.matchMedia("only screen and (max-width: 760px)");
	if(isMobileCheck.matches){
		isMobile = true;
	}



	if(isMobile){
		$('#welcomeIntroText').removeClass('smallTxt').addClass('smallTxt3');
	}




	//isMainGame
	if(window.location.href.indexOf("tron.htm") < 0) {
		isMainGame = false;
		console.log("Not map page!");
	}


	function setupTron(){
		if(window.tronWeb) {
			// need to check they are on the right network
			isReadonly = false;

		} else {
			console.log("READ ONLY TRON");
			const HttpProvider = TronWeb.providers.HttpProvider;
			/*
			const fullNode = new HttpProvider('https://api.shasta.trongrid.io');
			const solidityNode = new HttpProvider('https://api.shasta.trongrid.io');
			const eventServer = 'https://api.shasta.trongrid.io/';
			*/
			const fullNode = new HttpProvider('https://api.trongrid.io');
			const solidityNode = new HttpProvider('https://api.trongrid.io');
			const eventServer = 'https://api.trongrid.io/';
			
			const tronWeb = new TronWeb(
			    fullNode,
			    solidityNode,
			    eventServer,
			    NULL_ADDR
			);
			window.tronWeb = tronWeb;

		}



		if(window.location.href.indexOf("card.htm") > -1)
			isCard = "1";


		console.log("Init Referer:", _referer);

		console.log("Hex Fix:", solidityEncodeAddr(_referer));
		//_referer = NULL_ADDR;
		console.log("Init Referer:", _referer);


		
		statsConnectionConnected = true;
		startApp();	
	}

	if(isMobile) {
		setTimeout(function(){setupTron();}, 1000);

	} else {
		setTimeout(function(){setupTron();}, 500);

	}


	$(document).foundation();


	_findTokenId = getUrlParameter('token_id')||"";


	if(isCard == "1") {
		setupImgMap();

	} else {



		if(isMainGame)
			setupMap();
		else {
			let _searchAddress = getUrlParameter('ownerAddress')||"";
			if(_searchAddress != "") {
				document.getElementById('searchCardOwner').value = _searchAddress;
			}
		}


		var _newReferer = getUrlParameter('tron')||"";
		if(_newReferer.length > 0) { // newly referred
			_referer = _newReferer;
			Cookies.set('tron', _referer, { expires: 30, path: '/' });

		} else { // existing user referred by someone
			var _cookieRef = Cookies.get('tron')||"";

			console.log("_cookieRef", _cookieRef);
			if(_cookieRef.length >0) {
		  		_referer = _cookieRef;
		  		Cookies.set('tron', _referer, { expires: 30, path: '/' });
		  	}
		}


		googleTranslateElementInit();


		$("#jumpToLocation").change(function(e){
			$('#welcomeDiv').foundation('close');
			processJumpToLocationEvent(this);
		});

		$("#jumpToLocation2").change(function(e){
			$('#guideDiv').foundation('close');
			processJumpToLocationEvent(this);
		});

		$("#jumpToLocation3").change(function(e){
			$('#guideDiv').foundation('close');
			processJumpToLocationEvent(this);
		});



		$('#buyUpsellButtonConfirm').click(function(){  buyWithTrx(); });
		$("#buywthTRX").click(function(){  buyWithTrxUpsell(); });

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
			//var win = window.open('https://tronscan.org/#/address/' + window.tronWeb.address.fromHex(document.getElementById('existingCardOwner').value), '_blank');
			document.location.href = './tronCards.htm?ownerAddress=' + window.tronWeb.address.fromHex(document.getElementById('existingCardOwner').value);
			
		});
		$('#buyExistingWthETH').click(function(){ buyExistingCard(); });
		$('#destoryButtonBuy').click(function(){ buyExistingCard(); });
		$('#destoryButtonConfirm').click(function() {destroyCard(); });


		$('#newCardStartOwner').click(function(){
			//var win = window.open('https://tronscan.org/#/address/' + window.tronWeb.address.fromHex(document.getElementById('newCardOwnerAddr').value), '_blank');
			document.location.href = './tronCards.htm?ownerAddress=' + window.tronWeb.address.fromHex(document.getElementById('newCardOwnerAddr').value);
			
		});

		$('#closeExistingCard').click(function(){
			$('#existingCardDiv').foundation('close'); 
		});

		$('#destoryExistingCard').click(function(){
			destroyConfirm();
		});

		$('#searchNextPage').click(function(){
			
			goSearchPage(1);
		});

		$('#searchPrevPage').click(function(){
			goSearchPage(-1);
		});

		$('#mapViewBTN').click(function(){
			document.location.href = './tron.htm';
		});
		$('#searchBTN').click(function(){
			doSearch();
		});
		$('#mobileSearchBtn').click(function(){
			document.location.href = './tronCards.htm';
		});
		$('#tab8').click(function(){
			document.location.href = './tronCards.htm';
		});



		if(isMainGame) {


			var tabs = new Foundation.Tabs($("#bottomCardsTabs"));
			$("#bottomCardsTabs").on('change.zf.tabs', function(e){

				if($('panel8:visible').length){
					console.log("panel8");
					document.location.href = './tronCards.htm';
					return;
				}

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

		}

		$('#loadingGif').attr('src', 'images/loading.gif');
		$('#loadingGif2').attr('src', 'images/loading.gif');
		
		$('#welcomeCard1').attr('src','images/real_madrid_card.jpg');
		$('#welcomeCard2').attr('src','images/the_alamo_card.jpg');

		
		var hideWelcome = getUrlParameter('hideWelcome')||"";
		if(hideWelcome == "1") {

		} else {
			if(_findTokenId.length == 0 && isMainGame) {


				setTimeout(function(){
					$('#welcomeDiv').removeClass("hide");
			  		$('#welcomeDiv').foundation('open');
				},200);
			}

		}


	}
	


});





var fireGameDataReadyCounter = 20;
var finalLogItemProcessed = false;

async function getTokenDetails(_token_id, _shortDetails, _processor) {
	let hasError = false;
	let results = await PlanetCryptoContract.getToken(_token_id, _shortDetails).call().catch(function(err){
		//console.log("Token doesn't exist!",_token_id,err);
		hasError = true;
	}).then(function(results){
		//if(!hasError)
			_processor(results, _token_id);
	});
	
}


function processLogResult(logResult, isInit, isFinalItem, callback_func){

	//if(isFinalItem)
	//console.log("isFinalItem", isFinalItem, logResult);

	//console.log("logResult", logResult);
/*
PlanetCryptoContract.totalSupply().call().then(function(result){
	console.log("totalSupply:", new BigNumber(result).toString());
})
*/
// 261

/*
if(logResult.result.buyer =="0x2e3ccafe037cdd4af3f73f96372e853023ab3fb0"){
	//console.log("debug2:", logResult);
}
*/
	var showToast = true;

	if(isInit == true) {
		showToast = false;
	}

	if(logResult.name =='landPurchased'){

		console.log("logResult:", logResult);

		if(isInit == true) {

			// need to stager them 
			if(isFinalItem == true) {
				populateTokens(logResult.result.token_id, true, callback_func);
				finalLogItemProcessed = true;
			} else {
				if(fireGameDataReadyCounter == 0){
					populateTokens(logResult.result.token_id, true, callback_func);
					fireGameDataReadyCounter = 10;
				}else{
					populateTokens(logResult.result.token_id, false, callback_func);
					fireGameDataReadyCounter --;
				}
			}

			// only inc if new card...
			if(parseInt(logResult.result.token_id) > totalCards) {
				totalCards = parseInt(logResult.result.token_id);
			}

			updateInnerHTML('totalCards', totalCards);
			updateInnerHTML('totalCardsMobile', totalCards);

			if(totalCards > 730){
				updateInnerHTML('startCards', totalCards);
			}



		} else {

			populateTokens(logResult.result.token_id, true, callback_func);

			var _msg = 'By: ' + window.tronWeb.address.fromHex(logResult.result.buyer).substring(0,15) + "..." + "<br/>";
			_msg += 'For: ' + window.tronWeb.fromSun(parseInt(logResult.result.bought_at) * parseInt(logResult.result.size)).substring(0,8) + " TRX<br/>";
			_msg += 'Size: ' + parseInt(logResult.result.size) * PLOT_SIZE + 'm<sup>2</sup><br/>';
			_msg += 'Empire Score: +' + logResult.result.empire_score;

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
			totalLandSize += parseInt(logResult.result.size) * PLOT_SIZE;
			updateTotalLandSize(); 

			

			totalCards++;
			updateInnerHTML('totalCards', totalCards);
			updateInnerHTML('totalCardsMobile', totalCards);
			if(totalCards > 730){
				updateInnerHTML('startCards', totalCards);
			}

			// check if it is this players card...
			if(logResult.result.buyer.toUpperCase() == userWalletAddress.toUpperCase()){
				currentUserLand = currentUserLand + (parseInt(logResult.result.size) * PLOT_SIZE);
				var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
				var userLandSizeUnit = "m";
				if(userLandSize > 99999) {
					userLandSize = userLandSize / 1000;
					userLandSizeUnit = "km";
				}

				updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
				updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

				currentUserEmpireScore = currentUserEmpireScore + parseInt(logResult.result.empire_score);

				updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
				updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);
			}


			totalInvested = totalInvested.plus(
				new BigNumber(parseInt(logResult.result.bought_at) * parseInt(logResult.result.size)));
			updateInnerHTML('totalInvested', window.tronWeb.fromSun(totalInvested.toString()));
			updateInnerHTML('totalInvestedMobile', window.tronWeb.fromSun(totalInvested.toString()));
			
		}

/*
		if(callback_func)
			callback_func();
*/		


	}

	if(showToast) {
		if(logResult.name == 'taxDistributed') {

			if(parseInt(logResult.result.amnt) > 0) {

				var _msg = "Amount: " + window.tronWeb.fromSun(logResult.result.amnt.toString()).substring(0,8) + " TRX<br/>";
				_msg += "To: " + logResult.result.total_players + " Players";

				$.toast({
				  heading: 'Land Tax Distributed!',
				  text: _msg,
				  icon: 'info',
				  allowToastClose: true,
				  position: 'bottom-right',
				  hideAfter: TOAST_HIDE_DELAY,
				  showHideTransition: TOAST_HIDE_TRANSITION
				});


				totalEarnings = totalEarnings.plus(new BigNumber(logResult.result.amnt));
				updateInnerHTML('totalEarnings', window.tronWeb.fromSun(totalEarnings.toString()));
				updateInnerHTML('totalEarningsMobile', window.tronWeb.fromSun(totalEarnings.toString()));

				if(window.tronWeb.fromSun(totalEarnings.toString()) > 411611)
					updateInnerHTML('startTaxDist', window.tronWeb.fromSun(totalEarnings.toString()).substring(0,8));
			}
		}

		if(logResult.name == 'referralPaid') {
			var _msg = window.tronWeb.address.fromHex(logResult.result.to).substring(0,15) + "...<br/>";
			_msg += "has just earned a referral bonus of:<br/>"
			_msg += window.tronWeb.fromSun(logResult.result.amnt.toString()).substring(0,8) + " TRX<br/>";
			_msg += "Check the Guide for info on how you can earn TRX!";

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

		if(logResult.name == 'issueCoinTokens'){
			var _msg = window.tronWeb.address.fromHex(logResult.result.to).substring(0,15) + "...<br/>";
			_msg += "has just earned a PlanetCOINs:<br/>"
			_msg += logResult.result.amnt.toString() + " PlanetCOINS<br/>";
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



	if(logResult.name == 'cardBought'){

		totalEarnings = totalEarnings.plus(new BigNumber(logResult.result.new_value).div(100).times(80));
		totalInvested = totalInvested.plus(new BigNumber(logResult.result.new_value));

		//console.log("totalInvested:", window.tronWeb.fromSun(totalInvested.toString()));
		//console.log("totalEarnings:", window.tronWeb.fromSun(totalEarnings.toString()));
		updateInnerHTML('totalInvested', window.tronWeb.fromSun(totalInvested.toString()));
		updateInnerHTML('totalEarnings', window.tronWeb.fromSun(totalEarnings.toString()));

		updateInnerHTML('totalInvestedMobile', window.tronWeb.fromSun(totalInvested.toString()));
		updateInnerHTML('totalEarningsMobile', window.tronWeb.fromSun(totalEarnings.toString()));

		if(window.tronWeb.fromSun(totalEarnings.toString()) > 411611)
			updateInnerHTML('startTaxDist', window.tronWeb.fromSun(totalEarnings.toString()).substring(0,8));

/*
16,734,116.25
13,387,293
*/
		if(tokens[logResult.result.token_id]) {


			tokens[logResult.result.token_id].buy_history.push(
					{
						token_owner: logResult.result.to.replace("0x", "41"),
						from: logResult.result.from.replace("0x", "41")//,
						//bought_at: logResult.result.new_value,
						//orig_value: logResult.result.orig_value,
						//ts: logResult.result.now
					}
				);

		}

		if(isInit) {


		} else {


			var _encodedName;

			try{
				_encodedName = window.tronWeb.fromUtf8(logResult.result.name);
			} catch(e) {
				_encodedName = window.tronWeb.toHex(logResult.result.name);
			}

		
			var _msg = "Name: " + _encodedName + "<br/>";
			_msg += 'By: ' + window.tronWeb.address.fromHex(logResult.result.to).substring(0,15) + "..." + "<br/>";
			_msg += 'From: ' + window.tronWeb.address.fromHex(logResult.result.from).substring(0,15) + "..." + "<br/>";
			_msg += 'For: ' + window.tronWeb.fromSun(logResult.result.new_value.toString()).substring(0,8) + " TRX<br/>";
			_msg += 'Empire Score: +' + logResult.result.newEmpireScore;

			if(logResult.result.from.toUpperCase() == userWalletAddress.toUpperCase()){
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
		



		}

		if(callback_func)
			callback_func();


	}

	if(logResult.name == 'Transfer'){



		if(logResult.result.from == NULL_ADDR) {
			// is creation = ignore
		} else {


			if(tokens[logResult.result.tokenId]) {


				tokens[logResult.result.tokenId].buy_history.push(
						{
							token_owner: logResult.result.to.replace("0x", "41"),
							from: logResult.result.from.replace("0x", "41")//,
							//bought_at: logResult.result.new_value,
							//orig_value: logResult.result.orig_value,
							//ts: logResult.result.now
						}
					);

				
				if(isInit) {
				} else {

					//populateTokens(logResult.result.token_id, true, callback_func);


					if(logResult.result.to != NULL_ADDR) {
						totalTrades ++;
						updateInnerHTML('totalTrades', totalTrades);
						updateInnerHTML('totalTradesMobile', totalTrades);						
					}

					if(existingCardTokenId == logResult.result.tokenId) {
						$('#existingCardDiv').foundation('close'); 
					}

					// check if it is this players card...
					if(logResult.result.to.toUpperCase() == userWalletAddress.toUpperCase()){


						getTokenDetails(logResult.result.tokenId, false, function(results){
							console.log("***results:", results);

							currentUserLand = currentUserLand + (parseInt(results.plots_lat.length) * PLOT_SIZE);
							var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
							var userLandSizeUnit = "m";
							if(userLandSize > 99999) {
								userLandSize = userLandSize / 1000;
								userLandSizeUnit = "km";
							}

							updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
							updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

							currentUserEmpireScore = currentUserEmpireScore + parseInt(results.empire_score);

							updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
							updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);


							tokens[logResult.result.tokenId].empire_score = results.empire_score;
							tokens[logResult.result.tokenId].current_value = results.current_value;

						});



						tokens[logResult.result.tokenId].token_owner = 
							logResult.result.to;

						// add to previous cards (With updated details)
						processPreviousCardsToken(tokens[logResult.result.tokenId], logResult.result.tokenId);


						// update details on latestCardFull
						$('#latestCardHeader' + logResult.result.tokenId).css("background-color", '#' + 
									logResult.result.to.substring(logResult.result.to.length-6));

						updateInnerHTML('latestCardsCardOwner' + logResult.result.tokenId, logResult.result.to.substring(0,20) + "...");

						// add to your cards...
						updateUserCards();

						moveEndEvent(mymap.getZoom());
						queryMap(mymap.getZoom());

					}

					//console.log(logResult.result.from.toUpperCase() + "==" + userWalletAddress.toUpperCase());
					
					if(logResult.result.from.toUpperCase() == userWalletAddress.toUpperCase()){
						// has been sold from the user
						// remove from the cards below...
						

						console.log("User has lost:", logResult.result.tokenId);
						console.log("User has lost:", tokens[logResult.result.tokenId]);


						currentUserLand = currentUserLand - (parseInt(tokens[logResult.result.tokenId].plots_lat.length) * PLOT_SIZE);

						if(logResult.result.to == NULL_ADDR) {
							totalLandSize = totalLandSize - (parseInt(tokens[logResult.result.tokenId].plots_lat.length) * PLOT_SIZE);
							updateTotalLandSize();
						}

						var userLandSize = currentUserLand; //parseInt(logResult.results.totalLand) * PLOT_SIZE;
						var userLandSizeUnit = "m";
						if(userLandSize > 99999) {
							userLandSize = userLandSize / 1000;
							userLandSizeUnit = "km";
						}

						updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
						updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);

						currentUserEmpireScore = currentUserEmpireScore - parseInt(tokens[logResult.result.tokenId].empire_score);

						updateInnerHTML('yourEmpireScore', currentUserEmpireScore);
						updateInnerHTML('yourEmpireScoreMobile', currentUserEmpireScore);



						$('#userCardFull' + logResult.result.tokenId).remove();
						if(logResult.result.to == NULL_ADDR) {
							// remove from main card
							$('#latestCardFull' + logResult.result.tokenId).remove();
							// and remove from the map...	

							delete tokens[logResult.result.tokenId];

							moveEndEvent(mymap.getZoom());
							queryMap(mymap.getZoom());
							


						} else {
							console.log("Transfer changing details");
							// change details on token[] object
							tokens[logResult.result.tokenId].token_owner = 
								logResult.result.to;

							// add to previous cards (With updated details)
							processPreviousCardsToken(tokens[logResult.result.tokenId], logResult.result.tokenId);


							// update details on latestCardFull
							$('#latestCardHeader' + logResult.result.tokenId).css("background-color", '#' + 
										logResult.result.to.substring(logResult.result.to.length-6));

							updateInnerHTML('latestCardsCardOwner' + logResult.result.tokenId, logResult.result.to.substring(0,20) + "...");

						}

						// TODO
						// updateleaderboard
						updateLeaderboard();



					}

				}

			} else {
				//console.log("DEBUG -> TOKEN NOT FOUND", logResult.result.tokenId);
			}


		}

		if(callback_func)
			callback_func();


	}


	if(isInit == true){

	} else {

		// update number of players, tax dist etc on each new log entry...
		//processOtherStats();
		updateMainGameStats(true);
		updateCurrentLandPrice();
	}


}



function setNewCardBg() {

	if(userWalletAddress.length > 5){
		$('#newCardHeader').css("background-color", '#' + userWalletAddress.substring(userWalletAddress.length-6));
		document.getElementById('newCardOwnerAddr').value = userWalletAddress;
		updateInnerHTML('newCardOwnerAddr', userWalletAddressShort);
	}
}



function startApp() {
  //if(isMainGame) {




	async function setupContracts() {


    	/*
    	can timeout on contract creation here:
			Uncaught (in promise) Error: timeout of 30000ms exceeded
    	*/
    	//PlanetCryptoContract = await window.tronWeb.contract(planetCryptoABI_tron.abi).at(contractAddress);
    	// TODO - can fail here and needs restarting
    	// error can be due to user not being logged into their tronlink wallet!!

    	var contractSetupHasError = false;
    	try{
    		PlanetCryptoContract = await window.tronWeb.contract(planetCryptoABI_tron.abi, contractAddress);
			console.log("PlanetCryptoContract Setup");

			PlanetCryptoContractOld = await window.tronWeb.contract(planetCryptoABI_tron.abi, contractAddressOld);
			PlanetCryptoContractOld2 = await window.tronWeb.contract(planetCryptoABI_tron.abi, contractAddressOld2);
    	}	
    	catch(err) {
    		contractSetupHasError = true;
    		console.log("PlanetCryptoContract Setup Err:", err);

			var _msg = ""
			_msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
			_msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
			_msg += '<p style="font-size: 10pt;">Please ensure you are logged into your TRON Wallet and then refresh the page to try again.</p>';
			showError(_msg, "Error connecting to Tron Network");
    	}

    	try{
    		PlanetCryptoCoinContract = await window.tronWeb.contract(planetCryptoCoinABI_tron.abi, coinsContractAddress)
    	}catch(err){
    		contractSetupHasError = true;
    		console.log("PlanetCryptoContract Setup Err:", err);

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
    		if(1==1){

	    		console.log("ACCOUNT", window.tronWeb.defaultAddress);
	    		if(!window.tronWeb.defaultAddress.hex) {
					var _msg = ""
					_msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
					_msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
					_msg += '<p style="font-size: 10pt;">Please ensure you are logged into your TRON Wallet and then refresh the page to try again.</p>';
					_msg += '<center><button type="button" onclick="reloadPage();" class="button bordered information " data-close>Retry</button></center>';

					showError(_msg, "Error connecting to Tron Network");
					return;
	    		}
	    		userWalletAddress = window.tronWeb.defaultAddress.hex;
	    		userWalletAddressShort = userWalletAddress.substring(0,15) + "...";
	    		setNewCardBg();
	    		 

	    		if(isMainGame){


		    		// mobile comes in as 41ae... format
		    		// desktop same format
			      	if(shareEarnEthBtn){
			      		shareEarnEthBtn.options.url = "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress);
			      	} else {
						shareEarnEthBtn =  new needShareDropdown(document.getElementById('shareEarnEth'), {
				      		url: 'https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress)
				      	});
			      	}

		          	if(shareEarnEthBtn){
		          		shareEarnEthBtn.options.url = "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress);
		          	} else {
						shareEarnEthBtn =  new needShareDropdown(document.getElementById('shareEarnEth'), {
				      		url: 'https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress)
				      	});
		          	}
		          	updateInnerHTML('refid', "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress));
	          	}
          	} else {
				let hasError = false;
	    		let _account = await window.tronWeb.trx.getAccount().catch(function(err){
	    			console.log("Error getting account:", err);
	    			hasError = true;
					var _msg = ""
					_msg += '<p style="font-size: 10pt;"><i>Unable to connect to your TRON Wallet</i></p>';
					_msg += '<p style="font-size: 10pt;">Make sure you are logged in to your wallet, refresh the page and try again.</p>';

					_msg += '<center><button type="button" onclick="reloadPage();" class="button bordered information " data-close>Retry</button></center>';

	    			showError(_msg, "Unable to connect to wallet");

	    		}).then(function(results){

	    			console.log(results);
					if(!hasError){
			    		userWalletAddress = results.__payload__.address;
			    		userWalletAddressShort = userWalletAddress.substring(0,15) + "...";
			    		setNewCardBg();	


						// https://www.cssscript.com/create-social-share-popup-box-with-pure-javascript-needsharebutton/
				      	if(shareEarnEthBtn){
				      		shareEarnEthBtn.options.url = "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress);
				      	} else {
							shareEarnEthBtn =  new needShareDropdown(document.getElementById('shareEarnEth'), {
					      		url: 'https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress)
					      	});
				      	}

			          	if(shareEarnEthBtn){
			          		shareEarnEthBtn.options.url = "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress);
			          	} else {
							shareEarnEthBtn =  new needShareDropdown(document.getElementById('shareEarnEth'), {
					      		url: 'https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress)
					      	});
			          	}
			          	updateInnerHTML('refid', "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress));
					}    			
	    		});
          	}


    	}
		

		if(isCard == "1") {
			// get card...
			// TODO
			console.log(_findTokenId);
			getReadOnlyPlanetCryptoContract().methods.getToken(_findTokenId,false).call(function(err,results){
				if(!err){
					tokens[_findTokenId] = {
						token_owner: results.token_owner,
						current_value: results.current_value,
						empire_score: results.empire_score,
						name: uft8Tidy(getReadOnlyWeb3Utils().utils.hexToUtf8(results.name)),
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

			setupGameStats(true, function(){ setupLogSubscription();}); 


		    if(_findTokenId){
			    if(_findTokenId.length > 0) {
			    	canFlyHome = false;
			    	$('#welcomeDiv').foundation('close'); 
					showExistingCard(parseInt(_findTokenId), true);
			    }
			}
		}

	    
		console.log("DONE");
    }

    setupContracts();



  //} else {

  //}
}


var _maxPages = 10;
var _tokens = [];
var _startTime = CONTRACT_START_TIME;
//CONTRACT_START_TIME
//1549533801000
//1548174345000
function getLandPurchasedEvent(_currentPage) {
	




	async function getEvents(_currentPage) {
		console.log("_currentPage", _currentPage);

		/*
		let _url = "https://api.trongrid.io/event/contract/TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt/landPurchased?since=0&size=50&page=" + _currentPage;
		$.get( "ajax/test.html", function(logResults ) {
			console.log("AJAX RESULT:", logResult);

			var lastCardSaleID = logResults.length-1;
			if(logResults.length == 0) {
				console.log("TOKENS LEN:", _tokens.length);
				grabTokens();
				_currentPage = _maxPages+1;
			}

			for(var c=0; c<logResults.length;c++){
				_tokens.push(logResults[c].result.token_id);




				if(c==lastCardSaleID) {
					if(_currentPage==_maxPages){
						console.log("TOKENS LEN:", _tokens.length);
						grabTokens();
					}
						//processLogResult(logResults[c], true, true, processTransfers);
					else{
						//processLogResult(logResults[c], true, true);
					}
				}
				else {
					//processLogResult(logResults[c], true, false);
				}
				

			}
		});
		*/

		window.tronWeb.getEventResult(
			contractAddress, {
			//sinceTimestamp: _startTime,
			eventName: "landPurchased",
			size: 100, 
			page: _currentPage,
			onlyConfirmed: true}
			).then(function(logResults){
				console.log("Tron landPurchased logs:", logResults);

				var lastCardSaleID = logResults.length-1;
				if(logResults.length == 0) {
					console.log("TOKENS LEN:", _tokens.length);
					grabTokens();
					_currentPage = _maxPages+1;
				}

				for(var c=0; c<logResults.length;c++){
					_tokens.push(logResults[c].result.token_id);




					if(c==lastCardSaleID) {
						if(_currentPage==_maxPages){
							console.log("TOKENS LEN:", _tokens.length);
							grabTokens();
						}
							//processLogResult(logResults[c], true, true, processTransfers);
						else{
							//processLogResult(logResults[c], true, true);
						}
					}
					else {
						//processLogResult(logResults[c], true, false);
					}
					

				}

			}).then(function(){
				if(_currentPage+1 < _maxPages)
					getLandPurchasedEvent(_currentPage+1);
				else {
							console.log("TOKENS LEN:", _tokens.length);
					//		grabTokens();
				}

			});	
			
	}
	getEvents(_currentPage);


	async function grabTokens() {
		for(let c=0; c< _tokens.length; c++) {
			console.log("TOKENS ID:", _tokens[c]);
			/*
			let hasError = false;
			let results = await PlanetCryptoContract.getToken(_tokens[c], false).call().catch(function(err){
				//console.log("Token doesn't exist!",_token_id,err);
				hasError = true;
			}).then(function(results){
				if(!hasError)
					tokens[_tokens[c]] = {
								token_owner: results.token_owner,
								current_value: results.current_value,
								empire_score: results.empire_score,
								name: uft8Tidy(window.tronWeb.toUtf8(results.name)),
								////img: getReadOnlyWeb3Utils().utils.hexToUtf8(results.img),
								orig_value: results.orig_value,
								card_size: results.plots_lat.length,
								plots_lat: results.plots_lat,
								plots_lng: results.plots_lng,
								buy_history: [
								]
							}; // was toAscii
			});
*/
		}

		//processTransfers();
	}
}


let lastHighestTokenId = 0;
let lastTokenIDCount = 0;
let _tokenIDCount = 0;
let _initTotalReceived = 0;

let _maxBatch = 300;
let _batchDelay = 500;

function checkForNewTokens(isInit){
	if(isMobile){
		_maxBatch = 100;
		_batchDelay = 1000;
	}

	PlanetCryptoContract.tokenIDCount().call().then(function(result){
		
		_tokenIDCount = parseInt(new BigNumber(result).toString());

		if(_tokenIDCount > lastTokenIDCount) {
			// more available so can update...
			

			console.log("TOTAL:", _tokenIDCount);

			let _markersToAdd = [];

			// do this in batches of 20 gets...

			//for(let c=lastTokenIDCount+1; c<_tokenIDCount; c++) {

			//let _token_id = lastTokenIDCount+1;
			//console.log("_token_id:", _token_id, _tokenIDCount);
			//if(isInit) {
			//	for(let _run=0; _run< 1000; _run ++) {
			//		getTokenDetails(_token_id, false, processInitToken);		
			//	}
			//}
			

			let _currentCount = 0;
			for(let c=lastTokenIDCount+1; c<_tokenIDCount; c++) {
				let _token_id = c+1;

				_currentCount++;



				if(tokens[_token_id]) {
					if(_token_id == _tokenIDCount) {
						console.log("Processed last token at setup");
						$("#loadingDiv").addClass('hide');
						startFireGameDataReady();
						updateInnerHTML('totalInvested', window.tronWeb.fromSun(totalInvested.toString()));
						updateInnerHTML('totalEarnings', window.tronWeb.fromSun(totalEarnings.toString()));
						updateInnerHTML('totalInvestedMobile', window.tronWeb.fromSun(totalInvested.toString()));
						updateInnerHTML('totalEarningsMobile', window.tronWeb.fromSun(totalEarnings.toString()));

						if(window.tronWeb.fromSun(totalEarnings.toString()) > 411611)
							updateInnerHTML('startTaxDist', window.tronWeb.fromSun(totalEarnings.toString()).substring(0,8));

						processTransfers();
						updateUserCards();
						//mymap.addLayer(markerCluster);
					}

				} else {

					getTokenDetails(_token_id, false, function(results){

						if(isInit)
							_initTotalReceived++;

						if(results) {

							if(c+1 > totalCards) {
								totalCards = c+1;
							}

							totalInvested = totalInvested.plus(new BigNumber(results.orig_value));
							//if(_token_id < 797) {
								// 25% rate
							//	totalEarnings = totalEarnings.plus(new BigNumber(results.orig_value).div(100).times(25));
							//} else {
								totalEarnings = totalEarnings.plus(new BigNumber(results.orig_value).div(100).times(40));
							//}

							if(totalCards > 730){
								updateInnerHTML('startCards', totalCards);
							}
							if(window.tronWeb.fromSun(totalEarnings.toString()) > 411611)
								updateInnerHTML('startTaxDist', window.tronWeb.fromSun(totalEarnings.toString()).substring(0,8));

							updateInnerHTML('totalCards', totalCards);
							updateInnerHTML('totalCardsMobile', totalCards);
							if(_token_id > lastHighestTokenId)
								lastHighestTokenId = _token_id;

							try{
								tokens[_token_id] = {
									token_owner: results.token_owner,
									current_value: results.current_value,
									empire_score: results.empire_score,
									name: uft8Tidy(window.tronWeb.toUtf8(results.name)),
									////img: getReadOnlyWeb3Utils().utils.hexToUtf8(results.img),
									orig_value: results.orig_value,
									card_size: results.plots_lat.length,
									plots_lat: results.plots_lat,
									plots_lng: results.plots_lng,
									buy_history: [
									]
								}; // was toAscii
							} catch(e){
								tokens[_token_id] = {
									token_owner: results.token_owner,
									current_value: results.current_value,
									empire_score: results.empire_score,
									name: uft8Tidy(window.tronWeb.toAscii(results.name)),
									////img: getReadOnlyWeb3Utils().utils.toAscii(results.img),
									orig_value: results.orig_value,
									card_size: results.plots_lat.length,
									plots_lat: results.plots_lat,
									plots_lng: results.plots_lng,
									buy_history: [
									]
								}; // was toAscii
							}



							if(isMainGame) {


								if(fireGameDataReadyCounter == 0 || c == _tokenIDCount-1){

									//console.log("PING");
									markerCluster.addLayers(_markersToAdd);
									/*
									for(let i=0; i< _markersToAdd.length; i++) {
										//console.log("_marker", i, _markersToAdd[i]);
										//if(_markersToAdd[i])
										//	setTimeout(_markersToAdd[i].addTo(mymap),100);

										_markersToAdd[i].addTo(mymap);
									}
									*/

									_markersToAdd=[]
									if(isMobile)
										fireGameDataReadyCounter = 100;
									else
										fireGameDataReadyCounter = 50;
									
									//startFireGameDataReady();
									//processTransfers();
								} else {
									fireGameDataReadyCounter --;
								}


								if(markersAllLvls[mymap.getZoom() + ':' + _token_id]) {
									//console.log("Already set");

								} else {
									var latLngPoint = L.latLng([parseFloat(hardFixed(tokens[_token_id].plots_lat[0]/1000000,5)), parseFloat(hardFixed(tokens[_token_id].plots_lng[0]/1000000,5))]);
									var _marker = createMarker(_token_id, tokens[_token_id], latLngPoint);
									//_marker.addTo(mymap);
									_markersToAdd.push(_marker);

									markersAllLvls[mymap.getZoom() + ':' + _token_id] = _marker;
								}
							} else {

								// display for search???

							}

						}

						//if(_token_id == _tokenIDCount) {
							//console.log("_initTotalReceived", _initTotalReceived, _tokenIDCount);
						if(_initTotalReceived == _tokenIDCount-1) {
							console.log("Processed last token at setup");
							$("#loadingDiv").addClass('hide');
							//startFireGameDataReady();

							if(isMainGame) {

								updateInnerHTML('totalInvested', window.tronWeb.fromSun(totalInvested.toString()));
								updateInnerHTML('totalEarnings', window.tronWeb.fromSun(totalEarnings.toString()));
								updateInnerHTML('totalInvestedMobile', window.tronWeb.fromSun(totalInvested.toString()));
								updateInnerHTML('totalEarningsMobile', window.tronWeb.fromSun(totalEarnings.toString()));
								if(window.tronWeb.fromSun(totalEarnings.toString()) > 411611)
									updateInnerHTML('startTaxDist', window.tronWeb.fromSun(totalEarnings.toString()).substring(0,8));
								if(isMobile){
									setTimeout(function(){
										processTransfers();
										updateUserCards();
									},1000);
								} else {
									processTransfers();
									updateUserCards();							
								}
							} else {
								updateSearchDisplay();
							}

						

							if(isInit){
								console.log("Setting up listeners...");
								setupListeners();
							}

							//mymap.addLayer(markerCluster);
						}
					});

				}


				if(_currentCount > _maxBatch) {
					lastTokenIDCount = _token_id-1;
					setTimeout(function(){ checkForNewTokens(isInit);}, _batchDelay);
					return;
				}
			}

			lastTokenIDCount = _tokenIDCount;

		}
	});
}


// unsed at moment
function processInitToken(results, _token_id){
//console.log("results", results);


	if(results) {

		if(_token_id+1 > totalCards) {
			//totalCards = c+1;
			//_hasMore = false;
			totalCards = _token_id;
		}

		updateInnerHTML('totalCards', totalCards);
		updateInnerHTML('totalCardsMobile', totalCards);
		if(_token_id > lastHighestTokenId)
			lastHighestTokenId = _token_id;

		if(_token_id > lastTokenIDCount)
			lastTokenIDCount = _token_id;

		try{
			tokens[_token_id] = {
				token_owner: results.token_owner,
				current_value: results.current_value,
				empire_score: results.empire_score,
				name: uft8Tidy(window.tronWeb.toUtf8(results.name)),
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
				name: uft8Tidy(window.tronWeb.toAscii(results.name)),
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

		if(fireGameDataReadyCounter == 0 || _token_id == _tokenIDCount-1){

			fireGameDataReadyCounter = 20;
			//startFireGameDataReady();
			//processTransfers();
		} else {
			fireGameDataReadyCounter --;
		}


		if(markersAllLvls[mymap.getZoom() + ':' + _token_id]) {
			//console.log("Already set");

		} else {
			var latLngPoint = L.latLng([parseFloat(hardFixed(tokens[_token_id].plots_lat[0]/1000000,5)), parseFloat(hardFixed(tokens[_token_id].plots_lng[0]/1000000,5))]);
			var _marker = createMarker(_token_id, tokens[_token_id], latLngPoint);
		//	_marker.addTo(mymap);

			markersAllLvls[mymap.getZoom() + ':' + _token_id] = _marker;
		}



	}

	if(_token_id == _tokenIDCount) {
		console.log("Processed last token at setup");
		$("#loadingDiv").addClass('hide');
		startFireGameDataReady();

		//processTransfers();
		//mymap.addLayer(markerCluster);
	} else {
		// do more...
		getTokenDetails(_token_id+1, false, processInitToken);
	}

}



//processTransfers
function setupLogSubscription() {

	//console.log("setupLogSubscription");
	if(finalLogItemProcessed == false) {


		// request working on TRON

	

/*
tronWeb.getEventByTransactionID("597ef94f9195882e0274296bcd603f3e48d483a54593907f987416b7484fdc21").then(function(result){
	console.log("DEBUG:", result);
});
*/

	
	console.log("STARTING");
	checkForNewTokens(true);

	//getLandPurchasedEvent(1);


	// now grab the tokens...
	








    }

}


var _listendersSetup = false;
function setupListeners() {
	if(_listendersSetup)
		return;

	_listendersSetup = true;
	PlanetCryptoContract["landPurchased"]().watch(function(err,res){
		//console.log("Event Watched:", res);
		if(res)
			processLogResult(res, false, false);
	}).catch(function(err){
		console.log("Error getting landPurchased events", err);
	});

	PlanetCryptoContract["taxDistributed"]().watch(function(err,res){
		console.log("Event Watched:", res);
		if(res)
			processLogResult(res, false, false);
	}).catch(function(err){
		console.log("Error getting taxDistributed events", err);
	});

	PlanetCryptoContract["referralPaid"]().watch(function(err,res){
		console.log("Event Watched:", res);
		if(res)
			processLogResult(res, false, false);
	}).catch(function(err){
		console.log("Error getting referralPaid events", err);
	});

	PlanetCryptoContract["issueCoinTokens"]().watch(function(err,res){
		console.log("Event Watched:", res);
		if(res)
			processLogResult(res, false, false);
	}).catch(function(err){
		console.log("Error getting issueCoinTokens events", err);
	});

	PlanetCryptoContract["cardBought"]().watch(function(err,res){
		console.log("Event Watched:", res);
		if(res)
			processLogResult(res, false, false);
	}).catch(function(err){
		console.log("Error getting cardBought events", err);
	});

	PlanetCryptoContract["Transfer"]().watch(function(err,res){
		console.log("Event Watched:", res);
		if(res)
			processLogResult(res, false, false);
	}).catch(function(err){
		console.log("Error getting Transfer events", err);
	});
}


var logItemsProcessed = [];

function processTransfers(){
	console.log("Checking for bought cards");

	let _maxPages = 50;

	for(var page=1; page < (_maxPages+1); page++) {

		window.tronWeb.getEventResult(contractAddressOld, 0,
			"cardBought",false,200,page). then(function(logResults){


				let isFound = false;
				for(let i=0; i<logItemsProcessed.length;i++){
					if(logItemsProcessed[i] == logResults.transaction){
						//console.log("DUPLICATE:", logResults);
						isFound = true;
						break;
					}
				}
				if(!isFound) {
					
					logItemsProcessed.push(logResults.transaction);

					if(logResults.length == 0){
						updatePreviousCards();
						page = _maxPages+1;
					} else {


			    		var lastCardSaleID = logResults.length-1;

						for(var c=0; c<logResults.length;c++){

							if(c==lastCardSaleID) {
								if(page==_maxPages)
									processLogResult(logResults[c], true, true, updatePreviousCards);
								else
									processLogResult(logResults[c], true, true);
							}
							else {
								processLogResult(logResults[c], true, false);
							}

						}
					}

				}
			});

	}

	_maxPages = 100;
	for(var page=1; page < (_maxPages+1); page++) {

		window.tronWeb.getEventResult(contractAddressOld2, 0,
			"cardBought",false,200,page). then(function(logResults){


				let isFound = false;
				for(let i=0; i<logItemsProcessed.length;i++){
					if(logItemsProcessed[i] == logResults.transaction){
						//console.log("DUPLICATE:", logResults);
						isFound = true;
						break;
					}
				}
				if(!isFound) {

	//console.log("logResults2", logResults);
					if(logResults.length == 0){
						updatePreviousCards();
						page = _maxPages+1;
					} else {


			    		var lastCardSaleID = logResults.length-1;

						for(var c=0; c<logResults.length;c++){

							if(c==lastCardSaleID) {
								if(page==_maxPages)
									processLogResult(logResults[c], true, true, updatePreviousCards);
								else
									processLogResult(logResults[c], true, true);
							}
							else {
								processLogResult(logResults[c], true, false);
							}

						}
					}

				}


			});

	}

	_maxPages = 50;
	for(var page=1; page < (_maxPages+1); page++) {


		window.tronWeb.getEventResult(contractAddress,CONTRACT_START_TIME,
			"cardBought",false,200,page). then(function(logResults){


				let isFound = false;
				for(let i=0; i<logItemsProcessed.length;i++){
					if(logItemsProcessed[i] == logResults.transaction){
						//console.log("DUPLICATE:", logResults);
						isFound = true;
						break;
					}
				}
				if(!isFound) {
					//console.log("Tron Bought logs:", logResults);

					if(logResults.length == 0){
						updatePreviousCards();
						page = _maxPages+1;
					} else {



			    		var lastCardSaleID = logResults.length-1;

						//console.log("logResults INIT", logResults);
						for(var c=0; c<logResults.length;c++){

							if(c==lastCardSaleID) {
								if(page==_maxPages)
									processLogResult(logResults[c], true, true, updatePreviousCards);
								else
									processLogResult(logResults[c], true, true);
							}
							else {
								processLogResult(logResults[c], true, false);
							}

						}
					}
				}

			});

	}

	/*
	window.tronWeb.getEventResult(contractAddress,CONTRACT_START_TIME,"Transfer",false,100,1). then(function(logResults){

			//console.log("Tron Transfer logs:", logResults);

			if(logResults.length == 0){
				updatePreviousCards();
			} else {



	    		var lastCardSaleID = logResults.length-1;

				//console.log("logResults INIT", logResults);
				for(var c=0; c<logResults.length;c++){

					if(c==lastCardSaleID) {
						processLogResult(logResults[c], true, true, processTransfers2);
					}
					else {
						processLogResult(logResults[c], true, false);
					}

				}
			}


		});*/
}

var lastBlock = 0;
var shownInitialWarning = false;


function setupGameStats(isInit, _callback) {
	initStats(_callback);

}


var mapData = {
	tokens: {},
	plots: {}
};
var tokens = {};



function populateTokens(_token_id, fireGameDataReady, callback_func, logResult) {
	//console.log("requiresLogRead", requiresLogRead);


		getTokenDetails(_token_id, false, function(results){
	//console.log("RESULTS:", results);
	//console.log("NAME:", uft8Tidy(window.tronWeb.toUtf8(results.name)));
			if(results) {
				try{
					tokens[_token_id] = {
						token_owner: results.token_owner,
						current_value: results.current_value,
						empire_score: results.empire_score,
						name: uft8Tidy(window.tronWeb.toUtf8(results.name)),
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
						name: uft8Tidy(window.tronWeb.toAscii(results.name)),
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




			}

			if(fireGameDataReady){

				startFireGameDataReady();
			}
			if(callback_func)
				callback_func();

		});



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
var tax_fund2 = new BigNumber(0);
var tax_fund3 = new BigNumber(0);
var tax_distributed = new BigNumber(0);
var tax_available = new BigNumber(0);
var tax_available2 = new BigNumber(0);
var tax_available3 = new BigNumber(0);

var totalCards = 0;
var yourCOINS = 0;
var currentLandPrice = new BigNumber(0);



function initStats(_callback) {
	updateCurrentLandPrice();
	
	// TO TEST TRON WITH PLAYERS
	// get number of players in game first...
	async function getCurrentPlayers() {
		//let val = await PlanetCryptoContract.current_plot_price().call();
		let currentPlayersLen = await PlanetCryptoContract.getAllPlayerObjectLen().call();
		currentPlayers = currentPlayersLen.toNumber();
		if(currentPlayers == 0)
			currentPlayers = 1;

		updateInnerHTML('totalPlayers', currentPlayers-1);
		updateInnerHTML('totalPlayersMobile', currentPlayers-1);

		totalLandSize = 0;
		var updatedUserStats = false;

		for(var c=1;c<currentPlayers;c++) {
			let _playerObj = await PlanetCryptoContract.all_playerObjects(c).call();

			players.push({
				lastAccess: _playerObj.lastAccess,
				playerAddress: _playerObj.playerAddress,
				totalEmpireScore: _playerObj.totalEmpireScore,
				totalLand: _playerObj.totalLand
			});

			totalLandSize += parseInt(_playerObj.totalLand) * PLOT_SIZE;

			updateTotalLandSize();

			if(!isReadonly){
				try {
					if(_playerObj.playerAddress.toUpperCase() == userWalletAddress.toUpperCase()){
						//console.log(userWalletAddress);
						// update current stats
						updatedUserStats = true;
						currentUserLand = currentUserLand + (parseInt(_playerObj.totalLand) * PLOT_SIZE);
						var userLandSize = currentUserLand; //parseInt(results.totalLand) * PLOT_SIZE;
						var userLandSizeUnit = "m";
						if(userLandSize > 99999) {
							userLandSize = userLandSize / 1000;
							userLandSizeUnit = "km";
						}

						updateInnerHTML('yourLandSize', userLandSize + userLandSizeUnit);
						updateInnerHTML('yourLandSizeMobile', userLandSize + userLandSizeUnit);
						currentUserEmpireScore = currentUserEmpireScore + parseInt(_playerObj.totalEmpireScore);
						updateInnerHTML('yourEmpireScore', _playerObj.totalEmpireScore);
						updateInnerHTML('yourEmpireScoreMobile', _playerObj.totalEmpireScore);
					}
				} catch(e) {
				}
			}

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

	getCurrentPlayers();



	updateMainGameStats(false, _callback);


}

function updateMainGameStats(withPlayerCount, _callback) {


	if(withPlayerCount == true) {
		async function getCurrentPlayers() {
			//let val = await PlanetCryptoContract.current_plot_price().call();
			let currentPlayersLen = await PlanetCryptoContract.getAllPlayerObjectLen().call();
			currentPlayers = currentPlayersLen.toNumber();
			if(currentPlayers == 0)
				currentPlayers = 1;

			updateInnerHTML('totalPlayers', currentPlayers-1);
			updateInnerHTML('totalPlayersMobile', currentPlayers-1);
		}

		getCurrentPlayers();
	}


	async function getBaseStats() {
		let _totalTrades = await PlanetCryptoContract.total_trades().call();
		totalTrades = _totalTrades.toNumber();
		updateInnerHTML('totalTrades', totalTrades);
		updateInnerHTML('totalTradesMobile', totalTrades);
/*
		let _taxFund = await PlanetCryptoContract.tax_fund().call();
		tax_fund = new BigNumber(_taxFund.toNumber());
		updateInnerHTML('taxFund', window.tronWeb.fromSun(tax_fund.toString()).substring(0,8));
		updateInnerHTML('taxFundMobile', window.tronWeb.fromSun(tax_fund.toString()).substring(0,8));


		let _taxFund2 = await PlanetCryptoContractOld.tax_fund().call();
		tax_fund2 = new BigNumber(_taxFund2.toNumber());
		updateInnerHTML('taxFund', window.tronWeb.fromSun(tax_fund.plus(tax_fund2).toString()).substring(0,8));
		updateInnerHTML('taxFundMobile', window.tronWeb.fromSun(tax_fund.plus(tax_fund2).toString()).substring(0,8));


		let _taxFund3 = await PlanetCryptoContractOld2.tax_fund().call();
		tax_fund3 = new BigNumber(_taxFund2.toNumber());
		updateInnerHTML('taxFund', window.tronWeb.fromSun(tax_fund.plus(tax_fund2.plus(tax_fund3)).toString()).substring(0,8));
		updateInnerHTML('taxFundMobile', window.tronWeb.fromSun(tax_fund.plus(tax_fund2.plus(tax_fund3)).toString()).substring(0,8));


		let _taxDist = await PlanetCryptoContract.tax_distributed().call();
		tax_distributed = new BigNumber(_taxDist.toNumber());
		updateInnerHTML('taxDist', window.tronWeb.fromSun(tax_distributed.toString()).substring(0,8));
		updateInnerHTML('taxDistMobile', window.tronWeb.fromSun(tax_distributed.toString()).substring(0,8));
		updateInnerHTML('startTaxDist', window.tronWeb.fromSun(tax_distributed.toString()).substring(0,8));

		let _taxDist2 = await PlanetCryptoContractOld.tax_distributed().call();
		tax_distributed2 = new BigNumber(_taxDist2.toNumber());
		updateInnerHTML('taxDist', window.tronWeb.fromSun(tax_distributed.plus(tax_distributed2).toString()).substring(0,8));
		updateInnerHTML('taxDistMobile', window.tronWeb.fromSun(tax_distributed.plus(tax_distributed2).toString()).substring(0,8));
		updateInnerHTML('startTaxDist', window.tronWeb.fromSun(tax_distributed.plus(tax_distributed2).toString()).substring(0,8));

		let _taxDist3 = await PlanetCryptoContractOld2.tax_distributed().call();
		tax_distributed3 = new BigNumber(_taxDist3.toNumber());
		updateInnerHTML('taxDist', window.tronWeb.fromSun(tax_distributed.plus(tax_distributed2.plus(tax_distributed3)).toString()).substring(0,8));
		updateInnerHTML('taxDistMobile', window.tronWeb.fromSun(tax_distributed.plus(tax_distributed2).toString()).substring(0,8));
		updateInnerHTML('startTaxDist', window.tronWeb.fromSun(tax_distributed.plus(tax_distributed2.plus(tax_distributed3)).toString()).substring(0,8));
*/

		if(_callback)
			_callback();

	}

	getBaseStats();


	// now the players PlanetCOINs balance...
	if(!isReadonly)
		updatePlayerPlanetCOINs();
	else {
		yourCOINS = 0;
		updateInnerHTML('yourCOINS', yourCOINS);
		updateInnerHTML('yourCOINSMobile', yourCOINS);
	}


	// and tax earnings available...
	if(!isReadonly)
		updateTaxEarningsAvail();
	else {
		tax_available = 0;
		tax_available2 = 0;
		updateInnerHTML('yourTaxAvailable', 0);
		updateInnerHTML('yourTaxAvailableMobile', 0);		
	}
}


function updateTaxEarningsAvail() {
	async function updateTaxAvail() {
		let _taxAvail = await PlanetCryptoContract.taxEarningsAvailable().call();
		tax_available = new BigNumber(_taxAvail.toNumber());

		let _taxAvail2 = await PlanetCryptoContractOld.taxEarningsAvailable().call();
		tax_available2 = new BigNumber(_taxAvail2.toNumber());

		let _taxAvail3 = await PlanetCryptoContractOld2.taxEarningsAvailable().call();
		tax_available3 = new BigNumber(_taxAvail3.toNumber());

		updateInnerHTML('yourTaxAvailable', window.tronWeb.fromSun(tax_available.plus(tax_available2.plus(tax_available3)).toString()).substring(0,8));
		updateInnerHTML('yourTaxAvailableMobile', window.tronWeb.fromSun(tax_available.plus(tax_available2.plus(tax_available3)).toString()).substring(0,8));

	}

	updateTaxAvail();
}

function updatePlayerPlanetCOINs() {
	async function updatePlanetCOINs() {
		let _coins = await PlanetCryptoCoinContract.balanceOf(userWalletAddress).call();
		yourCOINS = _coins.toNumber();
		updateInnerHTML('yourCOINS', yourCOINS);
		updateInnerHTML('yourCOINSMobile', yourCOINS);

		let _allowance = await PlanetCryptoCoinContract.allowance(userWalletAddress, contractAddress).call();
		let _newAllowance = _allowance.toNumber();
		if(_newAllowance < yourCOINS) {
			currentPadlockstateLocked = true;
			$('#padlock').attr('src', 'images/padlock.png');
			$('#padlockMobile').attr('src', 'images/padlock.png');
		}
		else {
			currentPadlockstateLocked = false;
			$('#padlock').attr('src', 'images/padlock_open.png');
			$('#padlockMobile').attr('src', 'images/padlock_open.png');
		}
	}

	updatePlanetCOINs();

}



// WORKING FOR TRON
function updateCurrentLandPrice(_callback) {


	async function doGetCurrentLandPrice() {
		let hasError = false;
		let val = await PlanetCryptoContract.current_plot_price().call().catch(function(err){
			console.log("Error getting latest price:", err);
			hasError = true;
			var _msg = ""
			_msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
			_msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
			_msg += '<p style="font-size: 10pt;">Please ensure you are connected to the Tron Mainnet, refresh the page and try again.</p>';
			_msg += '<center><button type="button" onclick="reloadPage();" class="button bordered information " data-close>Retry</button></center>';
			showError(_msg, "Error connecting to Tron Network");    

		}).then(function(result){
			if(!hasError){
				console.log("VAL", result.toNumber());

				currentLandPrice = new BigNumber(result.toNumber());

				console.log("currentLandPrice", currentLandPrice.toString());

				if(isMainGame)
					updateInnerHTML('currentLandPrice', window.tronWeb.fromSun(currentLandPrice.toString()).substring(0,8));				
			}
		});
		/*.catch(function(err){
			var _msg = ""
			_msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
			_msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
			_msg += '<p style="font-size: 10pt;">Please ensure you are connected to the Tron Mainnet, refresh the page and try again.</p>';
			showError(_msg, "Error connecting to Tron Network");    
		});*/




		try{
			if(_callback)
				_callback();
		}catch(e){
		}

	}


	doGetCurrentLandPrice();




}


function updateTotalLandSize(){
	var _displayLandSize = totalLandSize;
	var _displayUnit = "m";

	if(totalLandSize > 99999) {
		_displayLandSize = _displayLandSize / 1000;
	}
	updateInnerHTML('totalLandSize', _displayLandSize + _displayUnit);
	updateInnerHTML('totalLandSizeMobile', _displayLandSize + _displayUnit);

	if(totalLandSize/20 > 4000){
		updateInnerHTML('startPlots', totalLandSize/20);
	}
}



// working
function withdrawFunds() {
	if(isReadonly){
		$('#notConnectedModel').foundation('open');
		return;
	}
	if(tax_available.eq(0) && tax_available2.eq(0)) {
		showError("You don't have any have tax earnings available at the moment.<br/><br/>The more land you own, the more property tax you'll ean - tax is earned instantly someone else buys land!<br/><br/>For more information check our the CryptoLand Guide (Click the blue help button above).", "No Tax Earnings");
		return;
	}



	async function doWithdrawel(_contract, _callback) {
		$.toast({
			heading: 'Sending Transaction',
			text: 'Check your TRON Wallet to complete the transaction',
			icon: 'info',
			allowToastClose: true,
			position: 'bottom-right',
			hideAfter: TOAST_HIDE_DELAY,
			showHideTransition: TOAST_HIDE_TRANSITION
		});
		let hasError = false;

		let result = _contract.withdrawTaxEarning().send(
			{
				shouldPollResponse: true
			}).catch(function(err){
				hasError = true;
				
				//Not enough energy for 'ISZERO' operation executing…100000000], curOpEnergy[3], usedEnergy[100000000]"
				// Note: once energy has been gained the wallet/page needs refreshing
				hideProcessing();
				console.log("error", err);
				if(err == "Confirmation declined by user"){
					$.toast({
						heading: 'Withdraw Cancelled',
						text: 'Your tax withdraw was cancelled and no Energy was used this time - please try again!',
						icon: 'info',
						allowToastClose: true,
						position: 'bottom-right',
						hideAfter: TOAST_HIDE_DELAY,
						showHideTransition: TOAST_HIDE_TRANSITION
					});					
				} else {
					processGenericErrors(err);
				}

			}).then(function(res){
				//console.log("RES", res);
				hideProcessing();
				if(!hasError) {
		          	var _msg = ""
		          	//_msg += '<p style="font-size: 10pt;"><i>Withdrawel of Tax Earnings Complete!</i></p>';
		          	_msg += '<p style="font-size: 10pt;">Your TRX earnings will now be in your wallet!</p>';


		          	_msg += '<p style="font-size: 12pt;"><b>Now is a great time to buy more land to improve your Empire Score!</b></p>';
		          	_msg += '<p style="font-size: 10pt;">Adding more land to your collection increases your Empire Score which gives you more Tax Earnings.</p>';

		          	
		          	_msg += '<p>';
		          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
		          	_msg += '</p>';

		          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5% on every purchase!</p>';

		          	_msg += '<p style="font-size: 10pt;">';
		          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
		          	_msg += '</p>';
		          	_msg += '<p style="font-size: 10pt;">';
		          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
		          	_msg += '</p>';

		          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
		          	showError(_msg, "Withdrawal Complete!");
		          	//tax_available = new BigNumber(0);
					//updateInnerHTML('yourTaxAvailable', "0");
					//updateInnerHTML('yourTaxAvailableMobile', "0");
					if(_callback)
						_callback();
				}
			});


	}

	if(tax_available3.gt(0)){
		doWithdrawel(PlanetCryptoContractOld2, function(){updateTaxEarningsAvail()});
	} else {
		if(tax_available2.gt(0))
			doWithdrawel(PlanetCryptoContractOld, function(){updateTaxEarningsAvail()});
		else
			doWithdrawel(PlanetCryptoContract, function(){updateTaxEarningsAvail()});		
	}


}

function destroyCard(){
	if(isReadonly){
		$('#notConnectedModel').foundation('open');
		return;
	}


	showProcessing();


	destoryCardProcess();


}

function destoryCardProcess() {


	//console.log("existingCardTokenId", existingCardTokenId);
	//console.log("existingCardPaymentAmount", existingCardPaymentAmount);

	async function doDestroy(_existingCardTokenId) {

		$.toast({
			heading: 'Sending Transaction',
			text: 'Check your Tron Wallet to complete the transaction',
			icon: 'info',
			allowToastClose: true,
			position: 'bottom-right',
			hideAfter: TOAST_HIDE_DELAY,
			showHideTransition: TOAST_HIDE_TRANSITION
		});
		let hasError = false;
		let result = await PlanetCryptoContract.burn(_existingCardTokenId).send().catch(function(err){
			
			//Not enough energy for 'ISZERO' operation executing…100000000], curOpEnergy[3], usedEnergy[100000000]"
			// Note: once energy has been gained the wallet/page needs refreshing
			hideProcessing();
			hasError = true;
			console.log("error", err);
			if(err == "Confirmation declined by user"){
				$.toast({
					heading: 'Destory Cancelled',
					text: 'Your Destory Action was cancelled and no Energy was used this time - please try again!',
					icon: 'info',
					allowToastClose: true,
					position: 'bottom-right',
					hideAfter: TOAST_HIDE_DELAY,
					showHideTransition: TOAST_HIDE_TRANSITION
				});
			} else {
				// unable to process - likely due to low energy of user // may be unowned prop
				processGenericErrors(err);
			}
		}).then(function(){
			hideProcessing();

			if(!hasError){
				var _msg = ""
				_msg += '<p style="font-size: 10pt;"><i>Your new PlaneteCOINs will be in your wallet shortly.</i></p>';

				_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
				_msg += '<p>';
				_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
				_msg += '</p>';
				_msg += '<p style="font-size: 10pt;">';
				_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
				_msg += '</p>';
				_msg += '<p style="font-size: 10pt;">';
				_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
				_msg += '</p>';

				_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
				showError(_msg, "Property Destored!");
				$('#existingCardDiv').foundation('close'); 

				ga('send', 'event', 'BuyTools', 'DestroyExistingCardComplete');
			}
		});

	}

	doDestroy(existingCardTokenId);


}



function buyExistingCard(){
	if(isReadonly){
		$('#notConnectedModel').foundation('open');
		return;
	}


	showProcessing();

	buyExistingCardProcess();

}

function buyExistingCardProcess() {


	//console.log("existingCardTokenId", existingCardTokenId);
	//console.log("existingCardPaymentAmount", existingCardPaymentAmount);

	if(!window.tronWeb.isAddress(_referer)){
		//console.log("Invalid Referer");
		_referer = NULL_ADDR; 
		console.log("New Referer:" + _referer);
	}
	
	async function doBuyCard(_existingCardTokenId){
		let hasError = false;
		$.toast({
			heading: 'Sending Transaction',
			text: 'Check your Tron Wallet to complete the transaction',
			icon: 'info',
			allowToastClose: true,
			position: 'bottom-right',
			hideAfter: TOAST_HIDE_DELAY,
			showHideTransition: TOAST_HIDE_TRANSITION
		});

		console.log("_existingCardTokenId", _existingCardTokenId);
		console.log("_referer", _referer);

		let result = PlanetCryptoContract.buyCard(_existingCardTokenId, _referer).send({
			callValue: existingCardPaymentAmount,
			shouldPollResponse: true
		}).catch(function(err){
			hasError = true;
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
				// unable to process - likely due to low energy of user
				// generic error = try again:
				/*
	{error: "REVERT opcode executed", transaction: {…}, output: {…}}
	error: "REVERT opcode executed"
	output: {id: "05329b2b95a16245ae6a5dbf495e2e58aedfd7924137cb6c06b93d4c9fb74ff2", fee: 48790, blockNumber: 972446, blockTimeStamp: 1548764835000, contractResult: Array(1), …}
	transaction: {txID: "05329b2b95a16245ae6a5dbf495e2e58aedfd7924137cb6c06b93d4c9fb74ff2", raw_data: {…}, signature: Array(1)}
	__proto__: Object
				*/
				processGenericErrors(err, showInsufficientTRX);

			}

		}).then(function(){
			hideProcessing();
			if(!hasError) {
				var _msg = ""
				_msg += '<p style="font-size: 10pt;"><i>Congratulations! You now own the card!</i></p>';


				_msg += '<p style="font-size: 10pt;"><b>Your EMPIRE SCORE will be boosted and you will start to earn more TRX!</b><br/>';

				_msg += 'Check out the new card that you own in the Your Cards section and share on social media to show the world what you now own!</p>';

				_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
				_msg += '<p>';
				_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
				_msg += '</p>';
				_msg += '<p style="font-size: 10pt;">';
				_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
				_msg += '</p>';
				_msg += '<p style="font-size: 10pt;">';
				_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
				_msg += '</p>';

				_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
				showError(_msg, "Purchase Complete");


				ga('send', 'event', 'BuyTools', 'BuyExistingCardComplete');
				gtag_report_conversion2();
			}
		});

	}

	if(_referer == NULL_ADDR) {
		//buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
		doBuyCard(existingCardTokenId, NULL_ADDR);
	} else {

		
		if(window.tronWeb.isAddress(_referer)) {
			console.log("Referer:", _referer);

			//buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
			doBuyCard(existingCardTokenId, _referer);

		} else {
			console.log("Invalid Referer");
			//buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, NULL_ADDR, playAmountSun);	
			doBuyCard(existingCardTokenId, NULL_ADDR);
		}

	}

	


}

function buyWithTrxUpsell() {
	// check number of plots and offer upsell...

	var _rectsToBuyLen2 = parseInt(rectsToBuyLen());

	console.log("UPSELL", _rectsToBuyLen2);

	if(_rectsToBuyLen2 > 0 && _rectsToBuyLen2 < 10) {
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

				buyWithTrx();	
			}
		}
	}
}
function buyWithTrx(){


	if(isReadonly){
		$('#notConnectedModel').foundation('open');
		return;
	}

	showProcessing();
	buyWithTrxProcess();

}

function buyWithTrxProcess() {

	
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

	if(!window.tronWeb.isAddress(_referer)){
		console.log("Invalid Referer");
		_referer = NULL_ADDR; //userWalletAddress; //getReadOnlyWeb3Utils().utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
		//console.log("New Referer:" + _referer);
	}

	// get latest price before completing purchase...
	updateCurrentLandPrice(function(){

		//var playAmountWei = currentLandPrice * _lat.length;
		//currentLandPrice = 100000000;
		var playAmountSun = currentLandPrice * _lat.length;
		var _encodedName;
		/*
		try{
			_encodedName = window.web3.fromUtf8(_newCardName); //getReadOnlyWeb3Utils().utils.utf8ToHex(_newCardName);
		} catch(e) {
			_encodedName = window.web3.toHex(_newCardName); //getReadOnlyWeb3Utils().utils.fromAscii(_newCardName);
		}
		*/
		_encodedName = window.tronWeb.toHex(_newCardName);


		console.log("ENCODED NAME:", _encodedName);
		console.log("REF:", _referer);
		console.log("lat/lng", _lat, _lng)
		let _ref = _referer;
		let _name = strToBytes32Array(_encodedName);
		let _amnt = playAmountSun;

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
		// working on shasta...

		//_ref = NULL_ADDR;
		// need to log it out for further tally up...



		let _results;

		async function buyLandFnc(){

			$.toast({
				heading: 'Sending Transaction',
				text: 'Check your Tron Wallet to complete the transaction',
				icon: 'info',
				allowToastClose: true,
				position: 'bottom-right',
				hideAfter: TOAST_HIDE_DELAY,
				showHideTransition: TOAST_HIDE_TRANSITION
			});
//console.log("PlanetCryptoContract", PlanetCryptoContract);
			let hasError = false;
			_results = await PlanetCryptoContract.buyLand(_name, _lat, _lng, _ref).send({
				callValue: _amnt,
				shouldPollResponse: true
				}).catch(function(err){

					//TODO - need to show this error to the user!!
					//Not enough energy for 'ISZERO' operation executing…100000000], curOpEnergy[3], usedEnergy[100000000]"

					// Note: once energy has been gained the wallet/page needs refreshing
					hasError = true;
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
						// unable to process - likely due to low energy of user
						// generic error = try again:
						/*
{error: "REVERT opcode executed", transaction: {…}, output: {…}}
error: "REVERT opcode executed"
output: {id: "05329b2b95a16245ae6a5dbf495e2e58aedfd7924137cb6c06b93d4c9fb74ff2", fee: 48790, blockNumber: 972446, blockTimeStamp: 1548764835000, contractResult: Array(1), …}
transaction: {txID: "05329b2b95a16245ae6a5dbf495e2e58aedfd7924137cb6c06b93d4c9fb74ff2", raw_data: {…}, signature: Array(1)}
__proto__: Object
						*/

						processGenericErrors(err, showInsufficientTRX);

					}

				}).then(function(result){
					try {

						//console.log("RESULT:", result);


						hideProcessing();

						if(!hasError){

				          	var _msg = ""
				          	_msg += '<p style="font-size: 10pt;"><i>Congratulations!, you now own <b>' + document.getElementById('newCardName').value + '</b>!</i></p>';


				          	_msg += '<p style="font-size: 10pt;"><b>Check out the Leaderboard/Top Players section to see far away you are from the top and purchase ';
				          	_msg += 'more land to increase your EMPIRE SCORE to earn more profit</b></p>';

				          	_msg += '<p style="font-size: 10pt;"><b>Your EMPIRE SCORE will be boosted and you will start to earn more TRX!</b><br/>';
							_msg += 'Check out the new card that you own in the Your Cards section and share on social media to show the world what you now own!</p>';

				          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
				          	_msg += '<p>';
				          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
				          	_msg += '</p>';
				          	_msg += '<p style="font-size: 10pt;">';
				          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
				          	_msg += '</p>';
				          	_msg += '<p style="font-size: 10pt;">';
				          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
				          	_msg += '</p>';


				          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
				          	showError(_msg, "Purchase Complete");

				          	resetSelectedRects();

				          	ga('send', 'event', 'BuyTools', 'BuyWithTrxComplete');
				          	gtag_report_conversion();

				          	setTimeout(function(){
				          		checkForNewTokens(false);
								updateMainGameStats(true);
								updateCurrentLandPrice();
				          	}, 5000);


						}
					}catch(e) {
						console.log("error in return:", e);

					}

				});



			//hideProcessing();
			//console.log("results", _results);

		}
		buyLandFnc();
		


		//buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, NULL_ADDR, playAmountSun);
/*
		if(_referer == NULL_ADDR) {
			buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
		} else {

			
			if(window.tronWeb.isAddress(_referer)) {
				console.log("Referer:", _referer);

				buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, _referer, playAmountSun);
			} else {
				console.log("Invalid Referer");
				buyLandFnc(strToBytes32Array(_encodedName), _lat, _lng, NULL_ADDR, playAmountSun);	
			}

		}
*/

		

	});

}


function buyWithTokens(){


	if(isReadonly){
		$('#notConnectedModel').foundation('open');
		return;
	}



	showProcessing();
	buyWithTokenProcess();

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

	if(_lat.length > 30) {
		showError("When using PlanetCOIN tokens the maxium size is 30 plots of land.<br/><br/>Please adjust the size of this new card and try again.", "Card size too large!");
		hideProcessing();
		return;
	}

	if(!window.tronWeb.isAddress(_referer)){
		//console.log("Invalid Referer");
		_referer = NULL_ADDR; //getReadOnlyWeb3Utils().utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
		//console.log("New Referer:" + _referer);
	}

	var _encodedName;
	_encodedName = strToBytes32Array(window.tronWeb.toHex(_newCardName));

	
	async function doBuyLandWithTokens(){
		let hasError = false;
		$.toast({
			heading: 'Sending Transaction',
			text: 'Check your Tron Wallet to complete the transaction',
			icon: 'info',
			allowToastClose: true,
			position: 'bottom-right',
			hideAfter: TOAST_HIDE_DELAY,
			showHideTransition: TOAST_HIDE_TRANSITION
		});
		let result = await PlanetCryptoContract.buyLandWithTokens(_encodedName, _lat, _lng).send({
			shouldPollResponse: true
		}).catch(function(err){
			//TODO - need to show this error to the user!!
			//Not enough energy for 'ISZERO' operation executing…100000000], curOpEnergy[3], usedEnergy[100000000]"

			// Note: once energy has been gained the wallet/page needs refreshing
			hasError = true;
			hideProcessing();
			console.log("error", err);
			if(err == "Confirmation declined by user"){
				$.toast({
					heading: 'Purchase Cancelled',
					text: 'Your purchase was cancelled and no PlanetCOIN tokens were spent this time - please try again!',
					icon: 'info',
					allowToastClose: true,
					position: 'bottom-right',
					hideAfter: TOAST_HIDE_DELAY,
					showHideTransition: TOAST_HIDE_TRANSITION
				});					
			} else {
				// unable to process - likely due to low energy of user
				// generic error = try again:
				/*
{error: "REVERT opcode executed", transaction: {…}, output: {…}}
error: "REVERT opcode executed"
output: {id: "05329b2b95a16245ae6a5dbf495e2e58aedfd7924137cb6c06b93d4c9fb74ff2", fee: 48790, blockNumber: 972446, blockTimeStamp: 1548764835000, contractResult: Array(1), …}
transaction: {txID: "05329b2b95a16245ae6a5dbf495e2e58aedfd7924137cb6c06b93d4c9fb74ff2", raw_data: {…}, signature: Array(1)}
__proto__: Object
				*/

				processGenericErrors(err, showFailedTokenBuy);

			}
		}).then(function(){
			hideProcessing();
			if(!hasError){
	          	var _msg = ""
	          	_msg += '<p style="font-size: 10pt;"><i>Congratulations!, you now own <b>' + document.getElementById('newCardName').value + '</b>!</i></p>';


	          	_msg += '<p style="font-size: 10pt;"><b>Check out the Leaderboard/Top Players section to see far away you are from the top and purchase ';
	          	_msg += 'more land to increase your EMPIRE SCORE to earn more profit</b></p>';

	          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
	          	_msg += '<p>';
	          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
	          	_msg += '</p>';
	          	_msg += '<p style="font-size: 10pt;">';
	          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
	          	_msg += '</p>';
	          	_msg += '<p style="font-size: 10pt;">';
	          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
	          	_msg += '</p>';


	          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
	          	showError(_msg, "Purchase Complete");

	          	resetSelectedRects();

				ga('send', 'event', 'BuyTools', 'BuyWithTokensComplete');
	          	//gtag_report_conversion();
			}
		});
	}

	doBuyLandWithTokens();


}


var currentPadlockstateLocked = true;

function switchCOINlockstatus() {
	//padlock
	//PlanetCryptoCoinContract
	if(isReadonly){
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

	async function doUnlock() {
		$.toast({
			heading: 'Altering PlanetCOINS State',
			text: 'Check your Tron Wallet to complete the transaction',
			icon: 'info',
			allowToastClose: true,
			position: 'bottom-right',
			hideAfter: TOAST_HIDE_DELAY,
			showHideTransition: TOAST_HIDE_TRANSITION
		});

		let hasError = false;
		let results = PlanetCryptoCoinContract.approve(contractAddress, _amount).send({
				shouldPollResponse: true
			}).catch(function(err){
				hasError = true;
				//TODO - need to show this error to the user!!
				//Not enough energy for 'ISZERO' operation executing…100000000], curOpEnergy[3], usedEnergy[100000000]"
				// Note: once energy has been gained the wallet/page needs refreshing
				hideProcessing();
				console.log("error", err);
				if(err == "Confirmation declined by user"){
					$.toast({
						heading: 'Altering Transaction Cancelled',
						text: 'Your transaction was cancelled and no Energy was used this time - please try again!',
						icon: 'info',
						allowToastClose: true,
						position: 'bottom-right',
						hideAfter: TOAST_HIDE_DELAY,
						showHideTransition: TOAST_HIDE_TRANSITION
					});
				} else {
					// unable to process - likely due to low energy of user
					processGenericErrors(err);
				}

			}).then(function(result){
				if(!hasError){
		          	var _msg = ""
		          	_msg += '<p style="font-size: 10pt;"><i>Please Note: Your PlanetCOINS are now approved for use!</i></p>';

		          	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
		          	_msg += '<p>';
		          	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
		          	_msg += '</p>';
		          	_msg += '<p style="font-size: 10pt;">';
		          	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
		          	_msg += '</p>';
		          	_msg += '<p style="font-size: 10pt;">';
		          	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
		          	_msg += '</p>';

		          	//_msg += '<div class="addthis_inline_share_toolbox"></div>';
		          	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
		          	showError(_msg, "PlanetCOINS Unlocked");
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
			});


	}

	doUnlock();

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

//console.log("QUERYMAP:", zoomLvl, zoom);
	if(zoom == 0) { // testing



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
						//markersAllLvls[zoomLvl + ':' + _token_id].addTo(mymap);

					} else {


						//var icon = L.MakiMarkers.icon({icon: "embassy", color: "#" + _token.token_owner.substring(_token.token_owner.length-6), size: "m"});
						//var _marker = L.marker(latLngPoint, {icon: icon});

						var _marker = createMarker(_token_id, _token, latLngPoint);

						//mainMarkersLayer.addLayer(_marker);

						//markerCluster.addLayer(L.marker(latLngPoint));
						//markerCluster.refreshClusters();

						//_marker.addTo(mymap);
						//markerCluster.addLayer(_marker);


						markersAllLvls[zoomLvl + ':' + _token_id] = _marker;
					}

		           
				}



			}
		});
	}

	if(zoom == 0) {


		//Object.keys(lightGrids[zoomLvl].rects).forEach(function(rectsKey,rectIndex) {
		//console.log("LEN", Object.keys(lightGrids[zoomLvl].cellDetails).length);
		Object.keys(lightGrids[zoomLvl].cellDetails).forEach(function(cellKey,cellIndex) {
			//console.log(cellKey);
			//console.log(rects[cellKey]);
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
					_msg += "<b>Owned By:</b><br/> " + window.tronWeb.address.fromHex(_secondaryLookups[c].token.token_owner);
					_msg += "<br/><b>Total Size:</b> " + _secondaryLookups[c].token.card_size * PLOT_SIZE + "m<sup>2</sup>";
					_msg += "<br/><b>Empire Score:</b> " + _secondaryLookups[c].token.empire_score;
					_msg += "<br/><b>Bought At:</b> " + window.tronWeb.fromSun(_secondaryLookups[c].token.current_value.toString()).substring(0,8) + " TRX";
					_msg += "<br/>~ You can run a hostile take-over and own this card for: " + 
						window.tronWeb.fromSun((_secondaryLookups[c].token.current_value * CURRENT_RESALE_MULTIPLIER).toString()).substring(0,8);
					_msg += " TRX.";
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

function createMarker(_token_id,_token, latLngPoint) {
	var _Marker = L.ExtraMarkers.icon({
		icon: 'fa-flag',
		markerColor: 'white',
		iconColor: "#" + _token.token_owner.substring(_token.token_owner.length-6),
		shape: 'square',
		prefix: 'fa',

        iconSize: [ 30, 35 ],
        iconAnchor: [ 10, 27 ],
        popupAnchor: [ 1, -22 ],
        shadowAnchor: [ 10, 12 ],
        shadowSize: [ 26, 16 ],
	});

	var _marker = L.marker(latLngPoint, {icon: _Marker});


	var _msg = "<span style='font-size:0.9em;'><b style='font-size:1.2em;'>Token: #" + _token_id + " ~ " + _token.name + "</b><br/>";
	_msg += "<b>Owner:</b><br/> " + window.tronWeb.address.fromHex(_token.token_owner) + "";
	//_msg += "<br/><b>Total Size:</b> " + _token.card_size * PLOT_SIZE + "m<sup>2</sup>";
	_msg += "<br/><b>Empire Score:</b> " + _token.empire_score;
	_msg += "<br/><b>Bought At:</b> " + window.tronWeb.fromSun(_token.current_value.toString()).substring(0,8) + " TRX";
	_msg += "<br/>~ Run a hostile take-over for: <strong>" + 
		window.tronWeb.fromSun((_token.current_value * CURRENT_RESALE_MULTIPLIER).toString()).substring(0,8);
	_msg += " TRX</strong>";
	_msg +="<br/>~ Increasing it's EMPIRE SCORE to: <strong>" +
		_token.empire_score * CURRENT_EMPIRE_MULTIPLIER + '</strong>';
	//_msg += "<br/> &nbsp;&nbsp; - increasing your score whilst reducing the previous owners!"
	_msg += "<br/><center><strong>~ Click for Full Card Details ~</strong></center></span>";


	_marker.bindTooltip(
		_msg);

	_marker.on('click', function(e){
		showExistingCard(_token_id, true);
	});

	return _marker;
}


var rectsDisplayedKeys = {};
var markersAllLvls = {};



// TODO
function manageCaches() {
	// clear out old cache items on timeout
}

function clearMarkers() {
	return; // TO TEST
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
	resetButtons();
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
	canFlyHome = false;

	existingCardTokenId = _token_id;
	if(tokens[_token_id]) {
	} else {
		console.log("Token not loaded...");
		// get it now...
		// wait for it to be loaded...
		/*
		getTokenDetails(_token_id,false, function(results){
			try{
				tokens[_token_id] = {
					token_owner: results.token_owner,
					current_value: results.current_value,
					empire_score: results.empire_score,
					name: uft8Tidy(window.tronWeb.toUtf8(results.name)),
					////img: getReadOnlyWeb3Utils().utils.hexToUtf8(results.img),
					orig_value: results.orig_value,
					card_size: results.plots_lat.length,
					plots_lat: results.plots_lat,
					plots_lng: results.plots_lng,
					buy_history: [
					]
				}; // was toAscii
			} catch(e){
				tokens[_token_id] = {
					token_owner: results.token_owner,
					current_value: results.current_value,
					empire_score: results.empire_score,
					name: uft8Tidy(window.tronWeb.toAscii(results.name)),
					////img: getReadOnlyWeb3Utils().utils.toAscii(results.img),
					orig_value: results.orig_value,
					card_size: results.plots_lat.length,
					plots_lat: results.plots_lat,
					plots_lng: results.plots_lng,
					buy_history: [
					]
				}; // was toAscii
			}
			

			setTimeout(function(){ showExistingCard(_token_id, _flyTo);}, 1000);
		});
		*/
		setTimeout(function(){ showExistingCard(_token_id, _flyTo);}, 1000);

	}
	var _token = tokens[_token_id];
	if(!_token)
		return;

	//console.log(_token);

	_findTokenId = "";

	$('#existingCardHeader').css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6));
	if(isMobile)
		updateInnerHTML('existingCardOwner', window.tronWeb.address.fromHex(_token.token_owner).substring(0,10) + "...");
	else
		updateInnerHTML('existingCardOwner', window.tronWeb.address.fromHex(_token.token_owner).substring(0,25) + "...");


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
	updateInnerHTML('existingCardsCost', window.tronWeb.fromSun(_token.current_value.toString()).substring(0,8));

	existingCardPaymentAmount = _token.current_value * CURRENT_RESALE_MULTIPLIER;

	updateInnerHTML('existingCardBuyPrice', window.tronWeb.fromSun((_token.current_value * CURRENT_RESALE_MULTIPLIER).toString()).substring(0,8));

	if(document.getElementById('destoryCost')){

		updateInnerHTML('destoryCost', window.tronWeb.fromSun((_token.current_value * CURRENT_RESALE_MULTIPLIER).toString()).substring(0,8));
		
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
	$('#existingCardImg').css("background-image", "url(https://api.planetcrypto.app/tronImg/" + _token_id + ")"); 
	$('#existingCardImgBack2').css("background-image", "url(https://api.planetcrypto.app/tronImg/" + _token_id + ")"); 


	//$('#existingCardImg').attr("src","img_srv/index.htm?lat=" + _token.plots_lat[0]/1000000 + "&lng=" + _token.plots_lng[0]/1000000);

	//$( "#existingCardImg" ).load( "img_srv/index.htm?lat=" + _token.plots_lat[0]/1000000 + "&lng=" + _token.plots_lng[0]/1000000 );


	if(_flyTo && isMainGame){
		mymap.flyTo(existingCardStartPoint, MIN_BUY_LVL);		
	}

	share_url = 'https://planetcrypto.app/trxToken/' + _token_id;
	$("meta[property='og:url']").attr("content", share_url);

	share_title = 'PlanetCrypto TRON Collectible: ' + _token.name + " - Where will you buy? #blockchain #tron #trx #blockchaingames #crypto ";
	$('meta[property="og:title"]').attr("content", share_title);


	share_description = _token.name + ' @ ' + hardFixed(existingCardStartPoint.lat,4) + "," + hardFixed(existingCardStartPoint.lng,4);
	share_description += ", owned by: " + _token.token_owner + " ";

	$("meta[property='og:description']").attr("content", share_description);

	$("meta[property='og:image']").attr("content", 'https://api.planetcrypto.app/tronImg/' + _token_id);

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

	updateInnerHTML('existingCardsURL', 'planetcrypto.app/trxToken/' + _token_id);

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
		}).setView([38.3796072,-93.0596094],4, {paddingTopLeft: [300,300]});
	}

	//38.3796072,-93.0596094
	//51.505, -0.09
	mymap.setMaxZoom(18);
	mymap.setMinZoom(3);
	



	//setupImgMap();


	//layer = L.esri.basemapLayer('Streets').addTo(mymap);
	layer = L.esri.basemapLayer('Imagery' ).addTo(mymap);
	L.esri.basemapLayer('ImageryLabels').addTo(mymap)

			

	if(!isMobile){
		markerCluster.on('clustermouseover', function(c) {
		          var popup = L.popup()
		              .setLatLng(c.layer.getLatLng())
		              .setContent(c.layer._childCount +' Cards in area (Click to Zoom)')
		              .openOn(mymap);
		          }).on('clustermouseout',function(c){
		               mymap.closePopup();
		          }).on('clusterclick',function(c){
		               mymap.closePopup();
		          });
	}
	mymap.addLayer(markerCluster);


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
		if(canFlyHome)
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
		//console.log("zoomstart");
		clearMarkers();
		clearGrids();
		// clear up rectsDisplayedKeys
		clearDisplayedKeys();
		clearSelectedRects();

	});
	mymap.on('movestart', function(ev){
		
	})
	mymap.on('moveend', function(ev){
		console.log("MOVE:" + ev.target._zoom);
		moveEndEvent(ev.target._zoom);



	});




	mymap.on('gameDataReady', function(ev){
		//console.log("gameDataReady");

		

		if(_findTokenId.length > 0) {

			try {
				document.getElementById('ogurl').content = 'https://planetcyrpto.app/trxToken/' + _findTokenId;
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



		}

		if(ev.target._zoom > 16) {
			if(markersVisible){
				mymap.removeLayer(markerCluster);
				markersVisible = false;
			}
		} else {
			if(!markersVisible){
				mymap.addLayer(markerCluster);
				markersVisible = true;
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
			updateInnerHTML('newCardsCost', window.tronWeb.fromSun(_currentCost.toString()).substring(0,8));
		} catch(e){
			updateInnerHTML('newCardsCost', _currentCost.div(100000000).toString().substring(0,8));
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
				//M {lat: 51.5085, lng: -0.0972}	
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
				//M {lat: 51.5085, lng: -0.0972}

				//M {lat: 51.5, lng: -0.0972}	
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

	//console.log("updatePreviousCards", tokens);
	//console.log("canPlay", canPlay);
	if(!isReadonly) {
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
			

			
			//$('#smallCardImg' + '_previous_' + key).attr('src', 'https://api.planetcrypto.app/tronImg/' + key);
			$('#lastestCardImg' + '_previous_' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 
			$('#lastestCardImgBack2' + '_previous_' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 

			$('#latestCardHeader' + '_previous_' + key).css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6))
			updateInnerHTML('latestCardsName' + '_previous_' + key, _token.name);
			updateInnerHTML('latestCardsCardOwner' + '_previous_' + key, window.tronWeb.address.fromHex(_token.token_owner).substring(0,20) + "...");
			updateInnerHTML('latestCardsStartPoint' + '_previous_' + key, hardFixed(_token.plots_lat[0] /1000000,4)+ "," + hardFixed(_token.plots_lng[0]/1000000,4));

			if(_token.plots_lat.length > 1)
				updateInnerHTML('latestCardsTotalPlots' + '_previous_' + key, _token.plots_lat.length + " Plots");
			else
				updateInnerHTML('latestCardsTotalPlots' + '_previous_' + key, _token.plots_lat.length + " Plot");

			updateInnerHTML('latestCardsTotalPlotsSize' + '_previous_' + key, _token.plots_lat.length * PLOT_SIZE + "m<sup>");
			//updateInnerHTML('latestCardsEmpireScore' + '_previous_' + key, _token.empire_score);
			updateInnerHTML('latestCardsBadge' + '_previous_' + key, pad(_token.empire_score,5));
			updateInnerHTML('latestCardsCost' + '_previous_' + key, window.tronWeb.fromSun(_token.current_value.toString()).substring(0,8));
			
			document.getElementById('latestCardFull' + '_previous_' + key).value = key;


		}

	}
}


var _currentPage = 1;

function updateSearchDisplay() {
	updateInnerHTML('maxPages', 1);
	searchMaxPages = 1;
	$("#searchContainer").empty();
	$("#searchContainer").append("<div class='grid-x grid-margin-x' id='searchResults1'' style='width: 100%; position: relative; top: 110px; ''></div>");
	let _size = Object.keys(tokens).length;
	let _currentPageDisplayed = 0; 
	let _searchOwner = document.getElementById('searchCardOwner').value;

	//if(!window.tronWeb.isAddress(_searchOwner))
	//	_searchOwner = "";

	let _searchName = document.getElementById('searchCardName').value;
	let _searchMinTRX = document.getElementById('searchMinTrx').value;
	if(isNaN(parseFloat(_searchMinTRX)))
		_searchMinTRX = "";

	

	let _searchMaxTRX = document.getElementById('searchMaxTrx').value;
	if(isNaN(parseFloat(_searchMaxTRX)))
		_searchMaxTRX = "";

	for(let c=_size-1; c> -1; c--){
		let key = Object.keys(tokens)[c];
		let _token = tokens[key];
//console.log("_token", tokens[key]);
/*
buy_history: []
card_size: 1
current_value: BigNumber {_hex: "0x0d59f800", _ethersType: "BigNumber"}
empire_score: BigNumber {_hex: "0x96", _ethersType: "BigNumber"}
name: "Nelson's Column"
orig_value: BigNumber {_hex: "0x06acfc00", _ethersType: "BigNumber"}
plots_lat: [BigNumber]
plots_lng: [BigNumber]
token_owner: "41163a1e4b4a1e12dc7c46dea832aa7c01577d285a"
__proto__: Object
*/

		let validToken= true;

		if(_searchOwner != "") {
			if(window.tronWeb.address.fromHex(tokens[key].token_owner).toUpperCase() == _searchOwner.toUpperCase()) {
				validToken = true;
			} else {
				validToken = false;
				//continue;
			}
		}
		if(_searchName != "") {
			if(tokens[key].name.toUpperCase().indexOf(_searchName.toUpperCase()) > -1){
				validToken = true;
			} else {
				validToken = false;
			}
		}
		if(_searchMinTRX != "") {
			if(
				parseFloat(window.tronWeb.fromSun(tokens[key].current_value.toString()))
					>= parseFloat(_searchMinTRX)
				)
				{
				validToken = true;
			} else {
				validToken = false;
			}
		}
		if(_searchMaxTRX != "") {
			if(
				parseFloat(window.tronWeb.fromSun(tokens[key].current_value.toString()))
					<= parseFloat(_searchMaxTRX)
				)
				{
				validToken = true;
			} else {
				validToken = false;
			}
		}



		if(validToken){


			if(_currentPageDisplayed > 17) {
				// need a new page

				_currentPage ++;
				_currentPageDisplayed = 0;
				console.log("NEW PAGE:", _currentPage);
				updateInnerHTML('maxPages', _currentPage);
				searchMaxPages = _currentPage;


				$("#searchContainer").append("<div class='grid-x grid-margin-x hide' id='searchResults" + _currentPage + "'' style='width: 100%; position: relative; top: 110px; ''></div>");
				//$("#searchPagination").append("<li><a href='#' aria-label='Page " + _currentPage + "'>" + _currentPage + "</a></li>");
			}

			//Object.keys(tokens).forEach(function(key,index){
			//let _token = tokens[key];

			var _newCard = userCardsFull.replace(/\[\]/g, key);	

			
			$("#searchResults" + _currentPage).append('<div class="cell medium-2 small-6">' + _newCard + "</div>");




			$('#userCardHeader' + key).css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6))

			$('#lastestCardImg' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 
			$('#lastestCardImgBack2' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 

			updateInnerHTML('userCardsName' + key, _token.name);
			updateInnerHTML('userCardsCardOwner' + key, window.tronWeb.address.fromHex(_token.token_owner).substring(0,15) + "...");
			updateInnerHTML('userCardsStartPoint' + key, hardFixed(_token.plots_lat[0] /1000000,4)+ "," + hardFixed(_token.plots_lng[0]/1000000,4));

			if(_token.plots_lat.length > 1)
				updateInnerHTML('userCardsTotalPlots' + key, _token.plots_lat.length + " Plots");
			else
				updateInnerHTML('userCardsTotalPlots' + key, _token.plots_lat.length + " Plot");

			updateInnerHTML('userCardsTotalPlotsSize' + key, _token.plots_lat.length * PLOT_SIZE + "m<sup>");
			//updateInnerHTML('userCardsEmpireScore' + key, _token.empire_score);
			updateInnerHTML('userCardsBadge' + key, pad(_token.empire_score,5));
			updateInnerHTML('userCardsCost' + key, window.tronWeb.fromSun(_token.current_value.toString()).substring(0,6));
			
			document.getElementById('userCardFull' + key).value = key;


			_currentPageDisplayed++;
		}

	//});
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
	//console.log("updateUserCards", tokens);
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

		

	
		if(!isReadonly ) {
			
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

				$('#lastestCardImg' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 
				$('#lastestCardImgBack2' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 

				updateInnerHTML('userCardsName' + key, _token.name);
				updateInnerHTML('userCardsCardOwner' + key, window.tronWeb.address.fromHex(_token.token_owner).substring(0,15) + "...");
				updateInnerHTML('userCardsStartPoint' + key, hardFixed(_token.plots_lat[0] /1000000,4)+ "," + hardFixed(_token.plots_lng[0]/1000000,4));

				if(_token.plots_lat.length > 1)
					updateInnerHTML('userCardsTotalPlots' + key, _token.plots_lat.length + " Plots");
				else
					updateInnerHTML('userCardsTotalPlots' + key, _token.plots_lat.length + " Plot");

				updateInnerHTML('userCardsTotalPlotsSize' + key, _token.plots_lat.length * PLOT_SIZE + "m<sup>");
				//updateInnerHTML('userCardsEmpireScore' + key, _token.empire_score);
				updateInnerHTML('userCardsBadge' + key, pad(_token.empire_score,5));
				updateInnerHTML('userCardsCost' + key, window.tronWeb.fromSun(_token.current_value.toString()).substring(0,6));
				
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
			

			//$('#smallCardImg' + key).attr('src', 'https://api.planetcrypto.app/tronImg/' + key);
			$('#lastestCardImg' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 
			$('#lastestCardImgBack2' + key).css("background-image", "url(https://api.planetcrypto.app/tronImg/" + key + ")"); 

			$('#latestCardHeader' + key).css("background-color", '#' + _token.token_owner.substring(_token.token_owner.length-6))

			updateInnerHTML('latestCardsName' + key, _token.name);
			updateInnerHTML('latestCardsCardOwner' + key, window.tronWeb.address.fromHex(_token.token_owner).substring(0,20) + "...");
			updateInnerHTML('latestCardsStartPoint' + key, hardFixed(_token.plots_lat[0] /1000000,4)+ "," + hardFixed(_token.plots_lng[0]/1000000,4));

			if(_token.plots_lat.length > 1)
				updateInnerHTML('latestCardsTotalPlots' + key, _token.plots_lat.length + " Plots");
			else
				updateInnerHTML('latestCardsTotalPlots' + key, _token.plots_lat.length + " Plot");

			updateInnerHTML('latestCardsTotalPlotsSize' + key, _token.plots_lat.length * PLOT_SIZE + "m<sup>");
			//updateInnerHTML('latestCardsEmpireScore' + key, _token.empire_score);
			updateInnerHTML('latestCardsBadge' + key, pad(_token.empire_score,5));
			updateInnerHTML('latestCardsCost' + key, window.tronWeb.fromSun(_token.current_value.toString()).substring(0,8));
			
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
		var _row = '<tr><td width="50">';

		if(sortedIdx==0)
			_row += '<span class="large badge info" style="width: 40px; height: 40px; font-size: 1.3em;"><i class="fi-trophy" style="color: gold; font-weight: bold;"></i></span>';
		else
			_row += '<center><span class="small badge warning">' + (sortedIdx+1) + '</span></center>';

		//_row += '</td><td width="450"><a href="https://tronscan.org/#/address/' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" target="_new">' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '</a></td>';
		_row += '</td><td width="450"><a href="./tronCards.htm?ownerAddress=' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" >' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '</a></td>';

		//var _mobileRow = '<tr><td width="50"><span class="small badge alert">' + (sortedIdx+1) + '</span></td><td width="450"><a href="https://tronscan.org/#/address/' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" target="_new">' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress).substring(0,7) + '...</a></td>';
		var _mobileRow = '<tr><td width="50"><span class="small badge alert">' + (sortedIdx+1) + '</span></td><td width="450"><a href="./tronCards.htm?ownerAddress=' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" >' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress).substring(0,7) + '...</a></td>';

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


function updateLeaderboard() {
	playerStats = [];

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
		var _row = '<tr><td width="50">';

		if(sortedIdx==0)
			_row += '<span class="large badge info" style="width: 40px; height: 40px; font-size: 1.3em;"><i class="fi-trophy" style="color: gold; font-weight: bold;"></i></span>';
		else
			_row += '<center><span class="small badge warning">' + (sortedIdx+1) + '</span></center>';

		//_row += '</td><td width="450"><a href="https://tronscan.org/#/address/' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" target="_new">' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '</a></td>';
		_row += '</td><td width="450"><a href="./tronCards.htm?ownerAddress=' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" >' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '</a></td>';

		//var _mobileRow = '<tr><td width="50"><span class="small badge alert">' + (sortedIdx+1) + '</span></td><td width="450"><a href="https://tronscan.org/#/address/' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" target="_new">' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress).substring(0,7) + '...</a></td>';
		var _mobileRow = '<tr><td width="50"><span class="small badge alert">' + (sortedIdx+1) + '</span></td><td width="450"><a href="./tronCards.htm?ownerAddress=' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress) + '" >' + window.tronWeb.address.fromHex(_sortedPlayers[sortedIdx].playerAddress).substring(0,7) + '...</a></td>';

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
userCardsFull+= '                                    <h4 style="width: 100%; height: 20px; line-height: 20px; background-color: #efefef; color: black; font-size:0.9em; overflow: hidden;" id="userCardsName[]"></h4>';
userCardsFull+= '                                    ';
userCardsFull+= '                                  </div>';
userCardsFull+= '                                </div>';
userCardsFull+= '';
userCardsFull+= '                                <div class="card-section2" style="margin: 5px; padding:5px; ">';

userCardsFull+= '                    <div id="lastestCardImgBack2[]" style="width: 155px; height: 80px; top-margin: 5px; ';
userCardsFull+= '                    filter: blur(8px) brightness(125%) opacity(70%); -webkit-filter: blur(8px) brightness(125%) opacity(70%); background-position: center;">';
userCardsFull+= '                    </div>';
userCardsFull+= '                    <div id="lastestCardImg[]" style="width: 75px; height: 75px; ';
userCardsFull+= '                          background-position: center; background-size: contain;';
userCardsFull+= '							 filter: brightness(105%); -webkit-filter: brightness(105%);'
userCardsFull+= '                          border-radius: 5px;';
userCardsFull+= '                          position: absolute; top: 65px; left: 42px;">';
userCardsFull+= '                      &nbsp;&nbsp;&nbsp;';
userCardsFull+= '                    </div>';


userCardsFull+= '                                  <p class="smallTxt3" style="font-weight: bold;">';
userCardsFull+= '                                    <img class="icon-house"/> <strong><span id="userCardsCardOwner[]">0x0</span></strong><br/>';
userCardsFull+= '                                    <img class="icon-compass"/> <strong><span id="userCardsStartPoint[]">0.0000, 0.0000</span></strong><br/>';
userCardsFull+= '                                    <img class="icon-size"/> <strong><span id="userCardsTotalPlots[]">0</span>, <strong><span id="userCardsTotalPlotsSize[]">0m</span><sup>2</sup></strong>&nbsp;';
//userCardsFull+= '                                    <img class="icon-ruler"/> <strong><span id="userCardsTotalPlotsSize[]">0m</span><sup>2</sup></strong><br/>';
//userCardsFull+= '                                    <img class="icon-trophy"/> <strong>+<span id="userCardsEmpireScore[]">0</span></strong><br/>';
userCardsFull+= '                                    <img class="icon-eth"/> <strong><span id="userCardsCost[]">0.000</span> TRX</strong></p>';
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
latestCardsFull+= '                                <div class="card-section2" style="margin: 5px; padding:5px; ">';


latestCardsFull+= '                    <div id="lastestCardImgBack2[]" style="width: 155px; height: 80px; top-margin: 5px; ';
latestCardsFull+= '                    filter: blur(8px) brightness(125%) opacity(70%); -webkit-filter: blur(8px) brightness(125%) opacity(70%); background-position: center;">';
latestCardsFull+= '                    </div>';
latestCardsFull+= '                    <div id="lastestCardImg[]" style="width: 80px; height: 80px; ';
latestCardsFull+= '                          background-position: center; background-size: contain;';
latestCardsFull+= '							 filter: brightness(105%); -webkit-filter: brightness(105%);'
latestCardsFull+= '                          border-radius: 5px;';
latestCardsFull+= '                          position: absolute; top: 59px; left: 42px;">';
latestCardsFull+= '                      &nbsp;&nbsp;&nbsp;';
latestCardsFull+= '                    </div>';


latestCardsFull+= '                                  <p class="smallTxt3" style="font-weight: bold;">';
latestCardsFull+= '                                    <img class="icon-house"/> <strong><span id="latestCardsCardOwner[]">0x0</span></strong><br/>';
latestCardsFull+= '                                    <img class="icon-compass"/> <strong><span id="latestCardsStartPoint[]">0.0000, 0.0000</span></strong><br/>';
latestCardsFull+= '                                    <img class="icon-size"/> <strong><span id="latestCardsTotalPlots[]">0</span>, <span id="latestCardsTotalPlotsSize[]">0m</span></strong>&nbsp;';

//latestCardsFull+= '                                    <img class="icon-trophy"/> <strong>+<span id="latestCardsEmpireScore[]">0</span></strong><br/>';
latestCardsFull+= '                                    <img class="icon-eth"/> <strong><span id="latestCardsCost[]">0.000</span> TRX</strong></p>';
latestCardsFull+= '';
latestCardsFull+= '                                </div>';
latestCardsFull+= '';
latestCardsFull+= '                              </div></div>';
latestCardsFull+= '';
latestCardsFull+= '                        </form>';
latestCardsFull+= '                      </div>';
latestCardsFull+= '                    </div>';

//<img src="" id="smallCardImg[]" class="smallCardImg" align="right"/>


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


	
	canFlyHome = false;

	if(valueSelected.substring(0,5) == 'token_id') {

		_findTokenId = valueSelected.split(":")[1];


		

	} else {
		
		mymap.flyTo(
				L.latLng(   valueSelected.split(",")[0], valueSelected.split(",")[1])
			, valueSelected.split(",")[2]);		

	}

}
/*
	share_url = 'https://planetcrypto.app/trxToken/' + _token_id;
	share_title = 'PlanetCrypto Property: ' + _token.name;
	share_description = _token.name + ' @ ' + hardFixed(existingCardStartPoint.lat,4) + "," + hardFixed(existingCardStartPoint.lng,4);
	share_description += ", owned by: " + _token.token_owner

*/
// 0x74657374657200000000000000000000
function strToBytes32Array(_in) {
	_in = _in.substring(2);
	let _array = [];
	for (let c=0; c< _in.length; c=c+2) {
		_array.push( hexToDec (
								(_in[c] + _in[c+1]).toString()
						)
			) ;
	}

	if(_array.length < 32) {
		let _max = 32 - _array.length;
		for(let c=0; c<_max;c++) {
			_array.push("00");
		}
	}

	/*
	for(c=0; c< 32;c++){
		if(c > _in.length-1)
			_array.push("0");
		else
			_array.push(_in[c]);
	}
	*/
	//console.log("ARRAY", _array);
	return _array;
}


function hexToDec(hex) {
    var result = 0, digitValue;
    hex = hex.toLowerCase();
    for (var i = 0; i < hex.length; i++) {
        digitValue = '0123456789abcdefgh'.indexOf(hex[i]);
        result = result * 16 + digitValue;
    }
    return result;
}

function getShareURL() {
	return 'https://planetcrypto.app/trxToken/' + existingCardTokenId;
}
function getShareDescription() {
	return share_description;
}
function getShareTitle() {
	return share_title;
}
function getShareImage() {
	return 'https://api.planetcrypto.app/tronImg/' + existingCardTokenId;
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
function moveEndEvent(_zoomLvl){
	
	clearDisplayedKeys();
	

	if(_zoomLvl >16) {
		//console.log("CHECKS:");
		//console.log(getPixelSize(PLOT_SIZE));
		//console.log(lightGrids[ev.target._zoom].options.cellSize);
		if(
			hardFixed(lightGrids[_zoomLvl].options.cellSize,2)
			!= 
			hardFixed(getPixelSize(PLOT_SIZE),2)
			) {
			// needs a reset
			//console.log("Resetting grid");
			var _cellSize = getPixelSize(PLOT_SIZE);
			lightGrids[_zoomLvl].remove();
			lightGrids[_zoomLvl].removeFrom(mymap);
			
			lightGrids[_zoomLvl] = new VirtualGrid({
				cellSize: _cellSize,
				minZoom: _zoomLvl,
				maxZoom: _zoomLvl,
				zoomTriger: _zoomLvl
			});
			lightGrids[_zoomLvl].on('cellsupdated', function(ev){
				clearDisplayedKeys();
				queryMap(ev.target._map._zoom);
			});
			lightGrids[_zoomLvl].addTo(mymap)
		}

		//queryMap(ev.target._zoom);
	} else {
		queryMap(_zoomLvl);
	}
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


	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
	_msg += '<p>';
	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
	_msg += '</p>';
	_msg += '<p style="font-size: 10pt;">';
	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
	_msg += '</p>';
	_msg += '<p style="font-size: 10pt;">';
	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
	_msg += '</p>';

	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
	showError(_msg, "Invalid Account or Insufficient Funds");
}
function showFailedTokenBuy() {
	var _msg = ""
	_msg += '<p style="font-size: 10pt;"><i>Unable to Complete Transaction</i></p>';

	_msg += '<p style="font-size: 10pt;">Please confirm that you have sufficient PlanetCOIN tokens for this transaction and that they are unlocked.<br/><br/></p>';					

	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
	_msg += '<p>';
	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
	_msg += '</p>';
	_msg += '<p style="font-size: 10pt;">';
	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + window.tronWeb.address.fromHex(userWalletAddress) + '</code>';
	_msg += '</p>';
	_msg += '<p style="font-size: 10pt;">';
	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
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
function reloadPage(){
	location.reload();
}
function uft8Tidy(_in){
	var re = /[\0-\x1F\x7F-\x9F\xAD\u0378\u0379\u037F-\u0383\u038B\u038D\u03A2\u0528-\u0530\u0557\u0558\u0560\u0588\u058B-\u058E\u0590\u05C8-\u05CF\u05EB-\u05EF\u05F5-\u0605\u061C\u061D\u06DD\u070E\u070F\u074B\u074C\u07B2-\u07BF\u07FB-\u07FF\u082E\u082F\u083F\u085C\u085D\u085F-\u089F\u08A1\u08AD-\u08E3\u08FF\u0978\u0980\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA\u09BB\u09C5\u09C6\u09C9\u09CA\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4\u09E5\u09FC-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A\u0A3B\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4E-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A65\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA\u0ABB\u0AC6\u0ACA\u0ACE\u0ACF\u0AD1-\u0ADF\u0AE4\u0AE5\u0AF2-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A\u0B3B\u0B45\u0B46\u0B49\u0B4A\u0B4E-\u0B55\u0B58-\u0B5B\u0B5E\u0B64\u0B65\u0B78-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCE\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BE5\u0BFB-\u0C00\u0C04\u0C0D\u0C11\u0C29\u0C34\u0C3A-\u0C3C\u0C45\u0C49\u0C4E-\u0C54\u0C57\u0C5A-\u0C5F\u0C64\u0C65\u0C70-\u0C77\u0C80\u0C81\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA\u0CBB\u0CC5\u0CC9\u0CCE-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4\u0CE5\u0CF0\u0CF3-\u0D01\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4F-\u0D56\u0D58-\u0D5F\u0D64\u0D65\u0D76-\u0D78\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DC9\u0DCB-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF5-\u0E00\u0E3B-\u0E3E\u0E5C-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7\u0ECE\u0ECF\u0EDA\u0EDB\u0EE0-\u0EFF\u0F48\u0F6D-\u0F70\u0F98\u0FBD\u0FCD\u0FDB-\u0FFF\u10C6\u10C8-\u10CC\u10CE\u10CF\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B\u135C\u137D-\u137F\u139A-\u139F\u13F5-\u13FF\u169D-\u169F\u16F1-\u16FF\u170D\u1715-\u171F\u1737-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17DE\u17DF\u17EA-\u17EF\u17FA-\u17FF\u180F\u181A-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191D-\u191F\u192C-\u192F\u193C-\u193F\u1941-\u1943\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19CF\u19DB-\u19DD\u1A1C\u1A1D\u1A5F\u1A7D\u1A7E\u1A8A-\u1A8F\u1A9A-\u1A9F\u1AAE-\u1AFF\u1B4C-\u1B4F\u1B7D-\u1B7F\u1BF4-\u1BFB\u1C38-\u1C3A\u1C4A-\u1C4C\u1C80-\u1CBF\u1CC8-\u1CCF\u1CF7-\u1CFF\u1DE7-\u1DFB\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FC5\u1FD4\u1FD5\u1FDC\u1FF0\u1FF1\u1FF5\u1FFF\u200B-\u200F\u202A-\u202E\u2060-\u206F\u2072\u2073\u208F\u209D-\u209F\u20BB-\u20CF\u20F1-\u20FF\u218A-\u218F\u23F4-\u23FF\u2427-\u243F\u244B-\u245F\u2700\u2B4D-\u2B4F\u2B5A-\u2BFF\u2C2F\u2C5F\u2CF4-\u2CF8\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D71-\u2D7E\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E3C-\u2E7F\u2E9A\u2EF4-\u2EFF\u2FD6-\u2FEF\u2FFC-\u2FFF\u3040\u3097\u3098\u3100-\u3104\u312E-\u3130\u318F\u31BB-\u31BF\u31E4-\u31EF\u321F\u32FF\u4DB6-\u4DBF\u9FCD-\u9FFF\uA48D-\uA48F\uA4C7-\uA4CF\uA62C-\uA63F\uA698-\uA69E\uA6F8-\uA6FF\uA78F\uA794-\uA79F\uA7AB-\uA7F7\uA82C-\uA82F\uA83A-\uA83F\uA878-\uA87F\uA8C5-\uA8CD\uA8DA-\uA8DF\uA8FC-\uA8FF\uA954-\uA95E\uA97D-\uA97F\uA9CE\uA9DA-\uA9DD\uA9E0-\uA9FF\uAA37-\uAA3F\uAA4E\uAA4F\uAA5A\uAA5B\uAA7C-\uAA7F\uAAC3-\uAADA\uAAF7-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F-\uABBF\uABEE\uABEF\uABFA-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBC2-\uFBD2\uFD40-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFE\uFDFF\uFE1A-\uFE1F\uFE27-\uFE2F\uFE53\uFE67\uFE6C-\uFE6F\uFE75\uFEFD-\uFF00\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFDF\uFFE7\uFFEF-\uFFFB\uFFFE\uFFFF]/g;
	return _in.replace(re, "");
}


function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
    	console.log("CA:", ca[i]);
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
        	console.log("match:");
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}
function solidityEncodeAddr(_in) {

	if(_in !== ''){
		if(window.tronWeb.isAddress(_in)){
			return "0x" + window.tronWeb.address.toHex(_in).substring(2)
			//0xa10645c5e4edb159d8a449d765f639ff69cad3a2
			// should be: 
			//0xa10645c5E4Edb159d8a449d765F639ff69cad3A2

		}
		else
			return NULL_ADDR;		
	} else  {
		return NULL_ADDR;
	}

}
function goSearchPage(_amnt) {
	
	if(_amnt == -1) {
		if(currentSearchDisplayPage == 1) {
			
			return;
		} else {
			currentSearchDisplayPage--;
		}

		$('#searchResults' + (parseInt(currentSearchDisplayPage)+1)).addClass("hide");

	} else {
		if(currentSearchDisplayPage +1 > searchMaxPages) {
			return;
		} else {
			currentSearchDisplayPage++;
			$('#searchPrevPage').removeClass('disabled');
		}

		$('#searchResults' + (parseInt(currentSearchDisplayPage)-1)).addClass("hide");
	}
	if(currentSearchDisplayPage == 1){
		$('#searchPrevPage').removeClass('disabled').addClass('disabled');
	}

	updateInnerHTML("searchCurrentPage", currentSearchDisplayPage);	
	$('#searchResults' + currentSearchDisplayPage).removeClass("hide");
}

function doSearch() {
	showProcessing();
	currentSearchDisplayPage = 1;
	_currentPage = 1;
	updateInnerHTML("searchCurrentPage", currentSearchDisplayPage);	
	$('#searchPrevPage').removeClass('disabled').addClass('disabled');
	updateSearchDisplay();
}
