var isBETA = true;

var canPlay = false;

var fc333WinContract;



var playing = false;
var canFlyHome = true;

var isFirstPlay = false;




//var contractAddress = "TNygrKq5juZ5Rvk8XLyZPCXLj7rNjqVG1T"; //live NEW

var contractAddress = "TFuZ5Hsjtx1jZjsdEwSskV16RoU9un3yZd"; // shasta NEW


var logsSubscription;



var useTestnet = false;
var isMainGame = true;




//L.MakiMarkers.accessToken = MB_TOKEN;
var NULL_ADDR = "410000000000000000000000000000000000000000";



var _referer = NULL_ADDR; // "0x0000000000000000000000000000000000000000";

var vanity = "";
var CONTRACT_START_TIME = 1551787047000; // 1548174345000;




var isConnected = false;
var minPlayAmount = new BigNumber(0);
var userWalletAddress = NULL_ADDR; 
var userWalletAddressShort = NULL_ADDR; 
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






var share_url = 'https://333win.network';
var share_title = 'Planet Crypto ~ TRON/TRX Crypto Collectible Game ~ Own the World!';
var share_description = 'Im playing the biggest Tron Crypto Game - Plant Crypto...';


function shareExistingCard(){

	var win = window.open("https://www.addthis.com/bookmark.php?url=" + escape(share_url) + '&pub_id=ra-5bed6d6fe2749d93&description=' + escape(share_description), '_blank');

}


var isMobile = false;


//window.addEventListener('load', async () => {
var isReadonly = true;
var currentSearchDisplayPage = 1;

var totalInvested = new BigNumber(0);
var totalEarnings = new BigNumber(0);

// ENTRY
window.addEventListener('load', function(){

	var isMobileCheck = window.matchMedia("only screen and (max-width: 760px)");
	if(isMobileCheck.matches){
		isMobile = true;
	}

	$(document).foundation();



	if(isMobile){
		$('#welcomeIntroText').removeClass('smallTxt').addClass('smallTxt3');
	}




	var clipboard;


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

	console.log("Init Referer:", _referer);

	function setupTron(){
		if(window.tronWeb) {
			// need to check they are on the right network
			isReadonly = false;

		} else {
			console.log("READ ONLY TRON");
			const HttpProvider = TronWeb.providers.HttpProvider;
			
			var fullNode;
			var solidityNode;
			var eventServer;

			if(isBETA){
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
			window.tronWeb = tronWeb;



		}
		
		statsConnectionConnected = true;
		startApp();	
	}

	if(isMobile) {
		setTimeout(function(){setupTron();}, 1000);

	} else {
		setTimeout(function(){setupTron();}, 500);

	}

	


	


});



function startApp() {
  //if(isMainGame) {

	async function setupContracts() {


    	var contractSetupHasError = false;
    	try{
    		fc333WinContract = await window.tronWeb.contract(fc333win_tron.abi, contractAddress);
			console.log("fc333WinContract Setup");


    	}	
    	catch(err) {
    		contractSetupHasError = true;
    		console.log("fc333WinContract Setup Err:", err);

			var _msg = ""
			_msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
			_msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
			_msg += '<p style="font-size: 10pt;">Please ensure you are logged into your TRON Wallet and then refresh the page to try again.</p>';
			showError(_msg, "Error connecting to Tron Network");
    	}



    	if(contractSetupHasError)
    		return;


    	if(!isReadonly){

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
			console.log("ADDR:", userWalletAddress);




			// TODO
			setupButtons();
			gameStats();

/*
    		// check if user owns vanity..
    		PlanetCryptoContract.addressToVanity(userWalletAddress).call().then(function(results){
    			console.log("VANITY:", results);
    			vanity = results.toString();
    			$('#vanityName').attr('value', vanity);
    			$('#vanityNamemobile').attr('value', vanity);

				if(vanity.length > 0){
					$("#refid").attr('value', "https://planetcrypto.app/?tron=" + vanity);
					$("#refidmobile").attr('value', "https://planetcrypto.app/?tron=" + vanity);
				}
				else{
	          		$("#refid").attr('value', "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress));
	          		$("#refidmobile").attr('value', "https://planetcrypto.app/?tron=" + window.tronWeb.address.fromHex(userWalletAddress));
				}


	          	// check for reverse _referer...
	          	console.log("CHECKING", _referer);

	          	PlanetCryptoContract.vanityToAddress(_referer).call().then(function(results){
	          		console.log("VANITY ADDR:", results);
	          		if(window.tronWeb.isAddress(results)){
	          			console.log("IS ADDRESS!")
	          			if(results == NULL_ADDR){

	          			} else {
	          				_referer = window.tronWeb.address.fromHex(results);	
	          				console.log("DONE", _referer);
	          			}
	          			
	          			
	          		}

	          	}).catch(function(err){

	          	});

    		}).catch(function(err){
    			console.log("ERR:", err);
    		});

*/
          	


    	} else {

//			setupGameStats(true, function(){ setupLogSubscription();}); 

			console.log("DONE");    
			setupButtons();	
			gameStats();	

    	}
		




    }


    let _connected = true;

    if(!window.tronWeb.isConnected()) {
    	_connected = false;
    } else {


    	if(!isReadonly) {
    		console.log("CHECK:", window.tronWeb.defaultAddress.hex);
    		if(!window.tronWeb.defaultAddress.hex) {
    			_connected = false;
    		}
    	}
    }

    if(_connected){
    	setupContracts();	
    } else {
    	connectionAttempts++;

    	console.log("RETRY:", connectionAttempts);
    	if(connectionAttempts < 30) {
	    	setTimeout(function(){
	    		startApp();
	    	}, 2000);

    	} else {
			var _msg = ""
			_msg += '<p style="font-size: 10pt;"><i>Unable to connect to the network</i></p>';
			_msg += '<p style="font-size: 10pt;"><b>You were unable to connect to the TRON Network</b></p>';
			_msg += '<p style="font-size: 10pt;">Please ensure you are logged into your TRON Wallet and then refresh the page to try again.</p>';
			_msg += '<center><button type="button" onclick="reloadPage();" class="button bordered information " data-close>Retry</button></center>';

			showError(_msg, "Error connecting to Tron Network");
			return;
    	}


    }

    



  //} else {

  //}
}


var userDivs = new BigNumber(0);
var userRefs = new BigNumber(0);

function gameStats() {

	fc333WinContract.gameStats().call().then(function(results){
		
		updateInnerHTML('totalInvestments', window.tronWeb.fromSun(results._totalInvestments.toString()).substring(0,8));
		updateInnerHTML('totalInvestors', results._totalInvestors.toString());
		updateInnerHTML('reinvestments', results._reinvestments.toString());
		updateInnerHTML('currentPrize', window.tronWeb.fromSun(results._currentPrize.toString()).substring(0,8));
		updateInnerHTML('prizesWon', results._prizesWon.toString());
		updateInnerHTML('prizeTotalWon', window.tronWeb.fromSun(results._prizeTotalWon.toString()).substring(0,8));
		updateInnerHTML('fundsWithdrawn', window.tronWeb.fromSun(results._fundsWithdrawn.toString()).substring(0,8));

		if(!isReadonly){
			//yourInvestment
			fc333WinContract.checkInvestments(userWalletAddress).call().then(function(results){
				updateInnerHTML('yourInvestment', window.tronWeb.fromSun(results.toString()).substring(0,8));

				//currentReturns
				fc333WinContract.investorDividends(userWalletAddress).call().then(function(results){
					userDivs = new BigNumber(results.toString());
					updateInnerHTML('currentReturns', window.tronWeb.fromSun(userDivs.toString()).substring(0,8));

					//currentRefIncome
					fc333WinContract.checkReferral(userWalletAddress).call().then(function(results){
						userRefs = new BigNumber(results.toString());
						updateInnerHTML('currentRefIncome', window.tronWeb.fromSun(userRefs.toString()).substring(0,8));
					});

					debug();
					setTimeout(function(){
						gameStats();
					},1000);
					
				});

			

			});
			


		}
	});



}

function debug() {
	if(isReadonly)
		return;

	fc333WinContract.daysSinceInitialInvestment(userWalletAddress).call().then(function(results){
		updateInnerHTML('daysSinceInitialInvestment', results.toString());
	});

	fc333WinContract.daysSinceLastAction(userWalletAddress).call(userWalletAddress).then(function(results){
		updateInnerHTML('daysSinceLastAction', results.toString());
	});

	fc333WinContract.daysSinceLastWithDraw(userWalletAddress).call().then(function(results){
		updateInnerHTML('daysSinceLastWithDraw', results.toString());
	});

	fc333WinContract.daysSinceLastSpin(userWalletAddress).call().then(function(results){
		updateInnerHTML('daysSinceLastSpin', results.toString());
	});

	fc333WinContract.spinsAvailable(userWalletAddress).call().then(function(results){
		updateInnerHTML('spinsAvailable', results.toString());
	});


}

function setupButtons() {


	$('#investBtn').click(function(){
		console.log("button");
		doInvest();
	});
}

var connectionAttempts = 0;



function doInvest(){
	if(isReadonly){
//		$('#notConnectedModel').foundation('open');
//		return;
	}


	console.log("REF:", _referer);

	let _ref = _referer;
	let _amnt = document.getElementById('investmentAmnt').value;

	_amnt = window.tronWeb.toSun(_amnt);

	if(_referer == NULL_ADDR) {
		_ref = NULL_ADDR;
	} else {
		if(window.tronWeb.isAddress(_referer)) {
			console.log("Referer:", _referer);
			_ref = _referer; // solidityEncodeAddr(_referer);
			console.log("REF TO USE:", _ref);
		} else {
			console.log("Invalid Referer");
			_ref = NULL_ADDR;
		}
	}

	$.toast({
		heading: 'Sending Transaction',
		text: 'Check your Tron Wallet to complete the transaction',
		icon: 'info',
		allowToastClose: true,
		stack: 10,
		position: 'bottom-right',
		hideAfter: TOAST_HIDE_DELAY,
		showHideTransition: TOAST_HIDE_TRANSITION
	});

	console.log(_amnt);
	let hasError = false;
	fc333WinContract.invest(_ref).send({callValue: _amnt}).catch(function(err){
		hasError = true;
		console.log("error", err);
		if(err == "Confirmation declined by user"){
			$.toast({
				heading: 'Purchase Cancelled',
				text: 'Your purchase was cancelled and no TRX was spent this time - please try again!',
				icon: 'info',
				allowToastClose: true,
				stack: 10,
				position: 'bottom-right',
				hideAfter: TOAST_HIDE_DELAY,
				showHideTransition: TOAST_HIDE_TRANSITION
			});					
		} else {
			// unable to process - likely due to low energy of user
			processGenericErrors(err, showInsufficientTRX);

		}
	}).then(function(results){
		if(!hasError){
	      	var _msg = ""
	      	_msg += '<p style="font-size: 10pt;"><i>Congratulations!, you\'ve invested  <b>' + window.tronWeb.fromSun(_amnt) + ' TRX!</b>!</i></p>';


	      	_msg += '<p style="font-size: 10pt;"><b>You\'re in the network now and will start to earn 3.33% daily!</p>';

	      	_msg += '<p style="font-size: 10pt;">After day 5 you will unlock the Jackpot Spin!</p>';

	      	_msg += '<p style="font-size: 10pt;">Share your Master Node link to earn 5%!</p>';
	      	_msg += '<p>';
	      	_msg += '<strong style="font-size: 12pt;">Your Referral Master Node Link</strong>';
	      	_msg += '</p>';
	      	_msg += '<p style="font-size: 10pt;">';
	      	_msg += '<code style="font-size: 8pt;">https://333win.network/?tron=' + showUserWallet() + '</code>';
	      	_msg += '</p>';
	      	_msg += '<p style="font-size: 10pt;">';
	      	_msg += ' For every new player you refer on - you will earn 5% from purchases as an instant bonus!';
	      	_msg += '</p>';


	      	_msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you share!</b></p>';
	      	showError(_msg, "Purchase Complete");
		}
	});
}



function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}
function showProcessing() {
	$("#processingDiv").removeClass("hide");
}
function hideProcessing() {
	$("#processingDiv").addClass('hide');
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
	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + showUserWallet() + '</code>';
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
	_msg += '<code style="font-size: 8pt;">https://planetcrypto.app/?tron=' + showUserWallet() + '</code>';
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
function reloadPage() {
	window.location.reload(false);
}
function showUserWallet(){
	if(vanity.length > 0) {
		return vanity;
	} else {
		return window.tronWeb.address.fromHex(userWalletAddress);
	}
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
