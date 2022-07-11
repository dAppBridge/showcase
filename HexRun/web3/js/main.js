$(function () {

	function gweiTowei(_in) {
		return (_in * 1000000000);
	}

	var isMobile = false;
	var hasMetamask = false;
	var hasWeb3Wallet = false;
	var web3Provider;
	var useTestnet = false;


	var CONNECTION_TO_USE = "wss://mainnet.infura.io/ws/v3/b75603beb83a4a1a8a6e482eba7589a3";

	// ropsten addresses
	//var hexContractAddress = "0xc9c1c5583343944dba9bB72E5449854E72877D81";
	//var hexRunContractAddress = "0x58A74095038ECEadedBb67cB89c389775a592011";

	// mainnet
	var hexContractAddress = "0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39";
	var hexRunContractAddress = "0x19465ce34f3e41f1cbd29ba57e881fc65f067ee0"

	var hexTokenContract;
	var hexRunContract;

	var userWalletAddress;
	var currUserID = 0;
	var userStats = [];
	var usersActiveInLvls = [];
	var totalUsers = 0;
	var activeUsers = [];
	var userCurrentLvl = 1;
	var referer;
	var referrerAddress;
	var requiresFreeRef = false;
	//var TOKEN_DECIMALS = 1e18;
	var TOKEN_DECIMALS = 1e8;
	var currentHEXbalance = 0;
	var currentHEXapproved = 0;
	var userWalletEnabled = false;
	var canPlay = true;
	var registrationBtnOpen = false;
	var buyBtnOpen = false;
	var userHighestUnexpired = 1;
	var buyNxtLvlBtnHidden = false;
	var checkCounter = 0;
	var buyNextExpires = 0;
	var buyNextLvlLvl = 2;
	var buyNextLvlHex = 4000;
	var buyNextLvlHex2 = 4000;
	var buyBtnOpen2 = false;
	var dashboardLvlBuy = 2;
	var userLvls = {
		lvl1: 0,
		lvl2: 0,
		lvl3: 0,
		lvl4: 0,
		lvl5: 0,
		lvl6: 0,
		lvl7: 0,
		lvl8: 0,
		lvl9: 0,
		lvl10: 0,
	};

	var gasPrice = 350;


	var isMobileCheck = window.matchMedia("only screen and (pointer:coarse)");
	if(isMobileCheck.matches){
		isMobile = true;
	}

	var isMetaMaskInstalled = () => {
	//Have to check the ethereum binding on the window object to see if it's installed
		const { ethereum } = window;
		return Boolean(ethereum && ethereum.isMetaMask);
	};

	var onClickConnect = async () => {
	  try {
	    //Will Start the MetaMask Extension
	    if(ethereum.enable){
	    	try{
	    		await ethereum.enable();

				window.ethereum.on('accountsChanged', function (accounts) {
				  location.reload();
				});
	    		userWalletEnabled = true;
	    		beginSetup();	    		
	    	} catch (e) {
	    		// user denied
	    		beginSetup();
	    	}
	    } else if (window.web3) {
	    	userWalletEnabled = true;
	    	beginSetup();

	    } else {
	    	beginSetup();
	    }

	  } catch (error) {
	    console.error(error);
	  }
	};

	var ro_web3Provider;
	var ro_Conn;
	var ro_gameContract;
	
	function setupReadOnlyWeb3() {
	    // READ ONLY CONNECTION...
	    console.log("READONLY SETUP");
	    ro_web3Provider = new Web3.providers.WebsocketProvider(CONNECTION_TO_USE);
	    
	    console.log("RO PROV:", ro_web3Provider);
	    
	    
	    ro_web3Provider.on('connect',function(e){

	    	ro_Conn = new Web3(ro_web3Provider);
	    	ro_gameContract = new ro_Conn.eth.Contract(hexrunAbi.abi, hexRunContractAddress);

	    	setTimeout(function(){
	    		startListeners();
	    	},2000);
	    	
	    	//hexRunContract = new web3Provider.eth.Contract(hexrunAbi.abi,hexRunContractAddress);
	    });

	    ro_web3Provider.on('error', function(e){
	    	
	      //console.error('WS Error', e);
	      reconnectProvider(0);
	    });

	    ro_web3Provider.on('end', function(e) {
	      reconnectProvider(0);
	    });
	}
	function reconnectProvider(_tries) {
	  try {
	    console.log("restarting...");
	    ro_web3Provider = new Web3.providers.WebsocketProvider(CONNECTION_TO_USE);

	    ro_web3Provider.on('connect', function () {
	        console.log('WSS Reconnected');
	        ro_Conn = new Web3(ro_web3Provider);
	        ro_gameContract = new ro_Conn.eth.Contract(hexrunAbi.abi, hexContractAddress);
	    });

	    ro_web3Provider.on('error', function(e) {
	      console.log('reconnect error', e);
	      reconnectProvider(_tries++);
	    });

	    ro_web3Provider.on('end', function(e) {
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
	      // fail
	    }
	  }
	}



	function beginSetup() {
		for(let c=0; c< 10; c++) {
			usersActiveInLvls.push(0);
		}
		console.log("usersActiveInLvls:", usersActiveInLvls);

		web3Provider = new Web3(window.web3.currentProvider);

		

		checkNetwork(startGame);
		// check if user is already a user of the contract...
		// 	if so hide registrationDiv
		// 		show loggedInDiv
	}


	// entry point

	$(document).foundation();

	var _newReferer = getUrlParameter('id')||"";
	
	if(_newReferer.length > 0) { // newly referred
		referer = _newReferer;
	} else { // existing user referred by someone
		var _cookieRef = Cookies.get('id')||"";
		if(_cookieRef.length >0)
	  		referer = _cookieRef;
	}
	Cookies.set('id', referer, { expires: 60 });
	console.log("REF:", referer);



	hasMetamask = isMetaMaskInstalled();
	if(hasMetamask){
		hasWeb3Wallet = true;
	} else {
		if(window.web3){
			ethereum = window.web3;
			hasWeb3Wallet = true;
		}

	}

	console.log("hasWeb3Wallet:", hasWeb3Wallet);
  	console.log("isMetaMaskInstalled:", isMetaMaskInstalled());

	if(hasWeb3Wallet){
		onClickConnect();
	} else {

	}


	function getHEXApproved() {



		hexTokenContract.methods.allowance(userWalletAddress, hexRunContractAddress).call(function(err, results){

			let _needsRetry = false;
//HEX CHECK: 
//2000000000000000000000
//2001000000000000000000
			if(isApprovingHEXForReg || isApprovingHEXForBuy){
				
				if(checkCounter % 5 == 0) {
					toastMessage("We are still checking the blockchain for your transaction... please wait while it is processed.", "Processing Transaction");
				}
				checkCounter++;
				console.log("HEX CHECK:", currentHEXapproved, results);
				if(currentHEXapproved == results) {
					_needsRetry = true;
				} else {
					isApprovingHEXForReg = false;
					isApprovingHEXForBuy = false;
					$('#loadingDiv').addClass('hide');
				}
			}

			currentHEXapproved = results;

			$('#approvedHex').html( new BigNumber(results).div(TOKEN_DECIMALS).toFixed(2) + " HEX");
			$('#buyApprovedHex').html( new BigNumber(results).div(TOKEN_DECIMALS).toFixed(2) + " HEX");
			$('#buyApprovedHex2').html( new BigNumber(results).div(TOKEN_DECIMALS).toFixed(2) + " HEX");

			checkHEXApprovalLimits();
			checkHEXBuyApprovalLimits();
			checkHEXBuyApprovalLimits2();

			if(results == "0" && _needsRetry == false){
				setTimeout(function(){
					getHEXApproved();
				},5000);
			}

			if(_needsRetry){
				setTimeout(function(){
					updateHEXBalance();
				},1500);
			}

		});		
	}

	function checkUserLvls() {

		if(checkCounter % 5 == 0) {
			toastMessage("We are still checking the blockchain for your transaction... please wait while it is processed.", "Processing Transaction");
		}
		checkCounter++;


		hexRunContract.methods.viewUserLevelExpired(userWalletAddress, checkingForLevel).call(function(err,results){
			let _requiresRetry = true;

			console.log("checkUserLvls:", err, checkingForLevel, results, checkingForExpiry);


			if(!err){
				if(parseInt(results) > parseInt(checkingForExpiry)){
					_requiresRetry = false;

					$('#loadingDiv').addClass('hide');

					if(isInReg){
						$('#registrationPanel').foundation('close');
						
						toastMessage("Registration now complete ~ welcome to the game!", "HEXRun Registration");
						setTimeout(function(){setupUser();},2500);
						setTimeout(function(){ getHEXApproved()}, 3000);						
					} else {
						$('#buyLvlPanel').foundation('close');
						$('#buyLvlPanel2').foundation('close');
						
						toastMessage("Level Purchase complete ~ welcome to your upgrade!", "HEXRun Level Upgrade");
						setTimeout(function(){ setupUser();}, 2500);
						setTimeout(function(){ getHEXApproved();}, 3000);
					}

				}
			}

			if(_requiresRetry && (isInBuy || isInReg)){
				if(checkCounter < 2000)
					setTimeout(function(){checkUserLvls();}, 1500);
			}
		});
	}

	function setupUser(_callback) {
		console.log("CHECKING USER...");
		hexRun_getUser(userWalletAddress, function(_err, _user){
			console.log("USER...", _err, _user);
			if(!_err){
				console.log(_user);

				if(_user.isExist == true) {



					$('#registrationDiv').addClass('hide');
					$('#loggedInDiv').removeClass('hide');
					if(isMobile){
						$('#userAddress').html(userWalletAddress.substring(0,20));
						$('#dashboardAddress').html(userWalletAddress.substring(0,20));
						$('#dashboardAddress2').html(userWalletAddress.substring(0,20));
					}
					else{
						$('#userAddress').html(userWalletAddress);
						$('#dashboardAddress').html(userWalletAddress);
						$('#dashboardAddress2').html(userWalletAddress);
						console.log("dashboardAddress2", userWalletAddress);
					}
					
					$('#refURL').val("https://HEXRun.network/?id=" + _user.id);
					$('#dashboardRefURL').val("https://HEXRun.network/?id=" + _user.id);
					$('#dashboardRefURL2').val("https://HEXRun.network/?id=" + _user.id);

					// matrix id = _user.referrerID
					hexRunContract.methods.userList(_user.referrerID).call(function(err, results){
						if(!err){
							if(isMobile){
								$('#refByTrue').html(results.substring(0,20));
								$('#dashboardMatrix').html(results.substring(0,20));
								$('#dashboardMatrix2').html(results.substring(0,20));
							} else {
								$('#refByTrue').html(results);
								$('#dashboardMatrix').html(results);
								$('#dashboardMatrix2').html(results);
							}

						}


					});

					_noMoreActive = false;
					findUserLevel(1);

					toastMessage("Welcome back to HEXRun ~ don't forget to share your REF-LINK to keep earning!",null,15000);
				}


				if(_callback)
					_callback();
				else{
					// retry
					if(!_user.isExist){
						setTimeout(function(){setupUser();}, 2000);
					}
				}

				
			} else {
				//alert("USER ERR:" + _err);
			}
		});
	}
	function openContract() {
	  var win = window.open("https://etherscan.io/address/" + hexRunContractAddress, '_blank');
	  win.focus();
	}

	function openGuide() {
	  var win = window.open("https://hexrun.network/HEXRun.pdf", '_blank');
	  win.focus();		
	}

	var exchange_hex_eth = 0;
	var exchange_btc_eth = 0;
	var exchange_btc_usd = 0;

	function setupRates() {
		//
		$.ajax({ 
		    type: 'GET', 
		    url: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC', 
		    data: { get_param: 'value' }, 
		    dataType: 'json',
		    success: function (data) { 
		        console.log("BTC PRICE:", data.data.rates.USD);
		        exchange_btc_eth = data.data.rates.ETH;
		        exchange_btc_usd = data.data.rates.USD;

		    }
		});
		$.ajax({ 
		    type: 'GET', 
		    url: 'https://api.coingecko.com/api/v3/simple/price?ids=hex&vs_currencies=eth', 
		    type: 'GET',
		    headers: {'Access-Control-Allow-Origin':'*'},
		    crossDomain: true,
		    dataType: 'json',
		    success: function (data) { 
		    	console.log(data);
		        console.log("HEX PRICE:", data.hex.eth);
		        exchange_hex_eth = data.hex.eth;

		    }
		});
		
	}


	function getGasPrices() {
		//
		$.ajax({ 
		    type: 'GET', 
		    url: 'https://ethgasstation.info/json/ethgasAPI.json', 
		    data: { get_param: 'value' }, 
		    dataType: 'json',
		    success: function (data) { 
		        console.log("GAS PRICES:", data, data.fast, data.fastest, data.average);
		        gasPrice = data.fast/10;

		    }
		});
	}

	function calcActiveDays() {

		const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		const firstDate = new Date(2020, 4, 27);
		const secondDate = new Date();

		const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
		if(diffDays > 1)
			$('#activeDays').html(Number(diffDays-1) + " days");
		else
			$('#activeDays').html(Number(diffDays-1) + " day");

	}

	function startGame() {
		console.log("STARTING GAME");

		jQuery.timeago.settings.allowFuture = true;

		setupRates();
		getGasPrices();

		// setup days running
		calcActiveDays();


		if(isMobile){
			setTimeout(function(){ mainEntry();}, 1000);
		} else {
			mainEntry();
		}

		function mainEntry() {
			getUserWalletAddress(function() {
				//console.log(userWalletAddress);


				let _ts = 100;
				if(isMobile)
					_ts = 1000;				


				setupUser(function(){setupRefs();});

				setTimeout(function() {allUserStats();}, _ts);

				setTimeout(function() {updateHEXBalance();}, _ts);
				

				


				//setTimeout(function() {startListeners()}, _ts);

			});
		}
		setupButtons();
	}


	function updateHEXBalance() {
		hexTokenContract.methods.balanceOf(userWalletAddress).call(function(err, results){



			if(new BigNumber(results).gt(0)){
				
				currentHEXbalance = results;
				
				$('#walletHex').html(   new BigNumber(results).div(TOKEN_DECIMALS).toFixed(2) + " HEX" );
				$('#buyWalletHex').html(   new BigNumber(results).div(TOKEN_DECIMALS).toFixed(2) + " HEX" );
				$('#buyWalletHex2').html(   new BigNumber(results).div(TOKEN_DECIMALS).toFixed(2) + " HEX" );



				if(results == "0"){
					setTimeout(function(){
						updateHEXBalance();
					},5000);

				} else {
					setTimeout(function(){getHEXApproved();},100);
				}

				
			}


		});
	}


	var BLOCK_TIME = 15; // 15 s
	var BLOCK_TIME_HR = BLOCK_TIME * 4 * 60;
	function startListeners(){
		let _goBack = BLOCK_TIME_HR * 4; // 48 hour
		//checkFreeRefQueue(1);



		web3Provider.eth.getBlockNumber().then(function(results){
			let _currentBlock = parseInt(results);
			let _startFrom = _currentBlock - _goBack;


			if(isMobile){

				ro_gameContract.getPastEvents("allEvents", {
					fromBlock: _goBack,
					toBlock: 'latest'
				}, function(_err, results){
					console.log("RO EVENTS:", results);
					let _tableInitCount = 0;
					for(let c=results.length-1; c>0;c--){


						addEventToTable(results[c], false);
						_tableInitCount++;
						if(_tableInitCount> 20)
							break;
					}
				});


			} else {
				hexRunContract.getPastEvents("allEvents", {
					filter: {},
					fromBlock: _startFrom,
					toBlock: 'latest'
				}).then(function(results){
					
					let _tableInitCount = 0;
					for(let c=results.length-1; c>0;c--){


						addEventToTable(results[c], false);
						_tableInitCount++;
						if(_tableInitCount> 20)
							break;
					}
				});
			}

		});




		if(isMobile){


			ro_gameContract.getPastEvents("getMoneyForLevelEvent", {
				filter: {"_user": userWalletAddress},
				fromBlock: 10148898,
				toBlock: 'latest'
			}, function(_err, _events){
				processUserMoneyEvents(_events);
			});

			ro_gameContract.getPastEvents("lostMoneyForLevelEvent", {
				filter: {"_user": userWalletAddress},
				fromBlock: 10148898,
				toBlock: 'latest'
			}, function(_err, _events){
				processUserLostMoneyEvents(_events);
			});

		} else {

			hexRunContract.events.allEvents({
				filter: {},
				fromBlock: 'latest',
			}).on('data', function(event){
				console.log("NEW EVENT:", event);
				addEventToTable(event, true)
			});

			hexRunContract.getPastEvents("getMoneyForLevelEvent", {
				filter: {"_user": userWalletAddress},
				fromBlock: 0,
				toBlock: 'latest'
			}, function(_err, _events){
				processUserMoneyEvents(_events);
			});

			hexRunContract.getPastEvents("lostMoneyForLevelEvent", {
				filter: {"_user": userWalletAddress},
				fromBlock: 0,
				toBlock: 'latest'
			}, function(_err, _events){
				processUserLostMoneyEvents(_events);
			});
		}

	}

	var eventsSeen = [];
	var eventRows = 0;
	var totalHEXRceived = 0;
	var totalHEXLost = 0;

	var moneyReceivedByLvls = [0,0,0,0,0,0,0,0,0,0];
	var moneyLostByLvls = [0,0,0,0,0,0,0,0,0,0];

	function processUserMoneyEvents(_events) {

		for(let c=0; c< _events.length; c++) {
			
			let _costOfEvent = 2000;
			for(let i=1; i< parseInt(_events[c].returnValues._level);i++)
				_costOfEvent = _costOfEvent * 2;

			totalHEXRceived += _costOfEvent;

			moneyReceivedByLvls[parseInt(_events[c].returnValues._level)-1]++;

		}

		console.log("PAYMENT LVLS:", totalHEXRceived, moneyReceivedByLvls);
		for(let c=0; c< 10; c++) {
			$('#dashboardLvl' + Number(c+1) + 'Received').html(moneyReceivedByLvls[c]);
		}
		$('#dashboardEarned').html(totalHEXRceived + " HEX");
		$('#dashboardEarned2').html(totalHEXRceived + " HEX");
	}
	function processUserLostMoneyEvents(_events) {
		for(let c=0; c< _events.length; c++) {
			
			let _costOfEvent = 2000;
			for(let i=1; i< parseInt(_events[c].returnValues._level);i++)
				_costOfEvent = _costOfEvent * 2;

			totalHEXLost += _costOfEvent;

			moneyLostByLvls[parseInt(_events[c].returnValues._level)-1]++;

		}

		console.log("LOST LVLS:", totalHEXLost, moneyLostByLvls);
		for(let c=0; c< 10; c++) {
			$('#dashboardLvl' + Number(c+1) + 'Missed').html(moneyLostByLvls[c]);
		}
	}

	function addEventToTable(_event, _toastEvent) {
		let _hasRow = false;
		if(eventsSeen.includes(_event.transactionHash + ":" + _event.event + ":" + _event.logIndex)) {
			return;
		}
		eventsSeen.push(_event.transactionHash + ":" + _event.event + ":" + _event.logIndex);


		let _logDate = new Date(parseInt(_event.returnValues._time)*1000).toISOString()

		let _costOfEvent = 2000;
		for(let c=1; c< parseInt(_event.returnValues._level);c++)
			_costOfEvent = _costOfEvent * 2;

		let _row = "<tr class='eventsRow'><td><time class='timeago' datetime='" + _logDate + "'>" + _logDate + '</time></td>';

		if(_event.event == "regLevelEvent"){
			_hasRow = true;
			_row += '<td>New Player! ' + _event.returnValues._user.substring(0,10) + '</td>';	
			if(_toastEvent){
				toastMessage('New Player! ' + _event.returnValues._user.substring(0,10), 'New Player!')
			}
		}

		if(_event.event == "buyLevelEvent"){
			_hasRow = true;
			_row += '<td>' + _event.returnValues._user.substring(0,10) + ' BOUGHT IN TO LVL: ' + _event.returnValues._level + '!</td>';	
			if(_toastEvent){
				toastMessage(_event.returnValues._user.substring(0,10) + ' BOUGHT IN TO LVL: ' + _event.returnValues._level + '!', 'User Upgrade!')
			}
		}
		if(_event.event == "lostMoneyForLevelEvent"){
			_hasRow = true;
			_row += '<td>' + _event.returnValues._user.substring(0,10) + ' HAS LOST OUT ON MONEY FROM LVL:' + _event.returnValues._level + '</td>';	

			if(_toastEvent)
				toastMessage(_event.returnValues._user.substring(0,10) + ' HAS LOST OUT ON MONEY FROM LVL:' + _event.returnValues._level + '!', 'User Missed Out!')
		}
		


		_row += '<td><img src="images/hex-icon-sm.png" class="hexIcon"/><span class="orange">' + _costOfEvent + ' HEX</span></td>';
		_row += '<td><a href="https://etherscan.io/tx/' + _event.transactionHash + '" target="_new">' + _event.transactionHash.substring(0,10) + '</a.</td></tr>';


		if(_hasRow){
			if(_toastEvent)
				$('#eventsTable tbody').prepend(_row);
			else
				$('#eventsTable tbody').append(_row);

			eventRows++;
			if(eventRows > 10) {
			   var $last = $('#eventsTable tbody').find('tr:last');
			    if($last.is(':first-child')){
			    }else {
			        $last.remove();
			    }
			}
			$("time.timeago").timeago();
		}

	}

	var activeLvls = [false, false, false, false, false, false, false, false, false, false, false];
	var lvlExpires =[0,0,0,0,0,0,0,0,0,0,0];
	var _noMoreActive = false;

	function findUserLevel(_lvl) {
		
		hexRunContract.methods.viewUserLevelExpired(userWalletAddress,_lvl).call(function(err,results){

			let _lvlActive = false;
			if(parseInt(results) > new Date().getTime()/1000) {
				userHighestUnexpired = _lvl;
				_lvlActive = true;
				activeLvls[_lvl] = true;
			}
			lvlExpires[_lvl] = parseInt(results);


			if(_noMoreActive) {

				

				$('#dashboardBuyLvl' + Number(_lvl)).removeClass('disabled');
				$('#dashboardBuyLvl' + Number(_lvl)).addClass('disabled');
			} else {
				//console.log('#dashboardBuyLvl' + Number(_lvl));

				$('#dashboardBuyLvl' + Number(_lvl)).removeClass('disabled');
			}

			if(_lvlActive == false && _noMoreActive == false) {
				_noMoreActive = true;
			}

			if(_lvl == 1){

				userLvls.lvl1 = parseInt(results);


				$('#dashboardLvl1Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl1Active').html("YES");
					$('#dashboardBuyLvl1').html("EXTEND LVL 1");
					$('#dashboardLvl1Stats').removeClass('hide');
				} else {
					$('#dashboardLvl1Active').html("NO");
					$('#dashboardLvl1Stats').removeClass('hide');
					$('#dashboardLvl1Stats').addClass('hide');
					$('#dashboardBuyLvl1').html("BUY LVL 1");
				}
			}
			if(_lvl == 2){
				userLvls.lvl2 = parseInt(results);

				$('#dashboardLvl2Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				
				if(_lvlActive){
					$('#dashboardLvl2Active').html("YES");
					$('#dashboardBuyLvl2').html("EXTEND LVL 2");
					$('#dashboardLvl2Stats').removeClass('hide');
				} else {
					$('#dashboardLvl2Active').html("NO");
					$('#dashboardLvl2Stats').removeClass('hide');
					$('#dashboardLvl2Stats').addClass('hide');
					$('#dashboardBuyLvl2').html("BUY LVL 2");
				}
			}

			if(_lvl == 3){
				userLvls.lvl3 = parseInt(results);

				$('#dashboardLvl3Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl3Active').html("YES");
					$('#dashboardBuyLvl3').html("EXTEND LVL 3");
					$('#dashboardLvl3Stats').removeClass('hide');
				} else {
					$('#dashboardLvl3Active').html("NO");
					$('#dashboardLvl3Stats').removeClass('hide');
					$('#dashboardLvl3Stats').addClass('hide');
					$('#dashboardBuyLvl3').html("BUY LVL 3");
				}

			}
			if(_lvl == 4){
				userLvls.lvl4 = parseInt(results);

				$('#dashboardLvl4Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl4Active').html("YES");
					$('#dashboardBuyLvl4').html("EXTEND LVL 4");
					$('#dashboardLvl4Stats').removeClass('hide');
				} else {
					$('#dashboardLvl4Active').html("NO");
					$('#dashboardLvl4Stats').removeClass('hide');
					$('#dashboardLvl4Stats').addClass('hide');
					$('#dashboardBuyLvl4').html("BUY LVL 4");
				}
			}
			if(_lvl == 5){
				userLvls.lvl5 = parseInt(results);

				$('#dashboardLvl5Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl5Active').html("YES");
					$('#dashboardBuyLvl5').html("EXTEND LVL 5");
					$('#dashboardLvl5Stats').removeClass('hide');
				} else {
					$('#dashboardLvl5Active').html("NO");
					$('#dashboardLvl5Stats').removeClass('hide');
					$('#dashboardLvl5Stats').addClass('hide');
					$('#dashboardBuyLvl5').html("BUY LVL 5");
				}
			}
			if(_lvl == 6){
				userLvls.lvl6 = parseInt(results);

				$('#dashboardLvl6Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl6Active').html("YES");
					$('#dashboardBuyLvl6').html("EXTEND LVL 6");
					$('#dashboardLvl6Stats').removeClass('hide');
				} else {
					$('#dashboardLvl6Active').html("NO");
					$('#dashboardLvl6Stats').removeClass('hide');
					$('#dashboardLvl6Stats').addClass('hide');
					$('#dashboardBuyLvl6').html("BUY LVL 6");
				}
			}
			if(_lvl == 7){
				userLvls.lvl7 = parseInt(results);

				$('#dashboardLvl7Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl7Active').html("YES");
					$('#dashboardBuyLvl7').html("EXTEND LVL 7");
					$('#dashboardLvl7Stats').removeClass('hide');
				} else {
					$('#dashboardLvl7Active').html("NO");
					$('#dashboardLvl7Stats').removeClass('hide');
					$('#dashboardLvl7Stats').addClass('hide');
					$('#dashboardBuyLvl7').html("BUY LVL 7");
				}
			}
			if(_lvl == 8){
				userLvls.lvl8 = parseInt(results);
				$('#dashboardLvl8Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl8Active').html("YES");
					$('#dashboardBuyLvl8').html("EXTEND LVL 8");
					$('#dashboardLvl8Stats').removeClass('hide');
				} else {
					$('#dashboardLvl8Active').html("NO");
					$('#dashboardLvl8Stats').removeClass('hide');
					$('#dashboardLvl8Stats').addClass('hide');
					$('#dashboardBuyLvl8').html("BUY LVL 8");
				}
			}
			if(_lvl == 9){
				userLvls.lvl9 = parseInt(results);

				$('#dashboardLvl9Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl9Active').html("YES");
					$('#dashboardBuyLvl9').html("EXTEND LVL 9");
					$('#dashboardLvl9Stats').removeClass('hide');
				} else {
					$('#dashboardLvl9Active').html("NO");
					$('#dashboardLvl9Stats').removeClass('hide');
					$('#dashboardLvl9Stats').addClass('hide');
					$('#dashboardBuyLvl9').html("BUY LVL 9");
				}
			}
			if(_lvl == 10){
				userLvls.lvl10 = parseInt(results);

				$('#dashboardLvl10Expires').html(jQuery.timeago(new Date(results*1000).toISOString()));
				if(_lvlActive){
					$('#dashboardLvl10Active').html("YES");
					$('#dashboardBuyLvl10').html("EXTEND LVL 10");
					$('#dashboardLvl10Stats').removeClass('hide');
				} else {
					$('#dashboardLvl10Active').html("NO");
					$('#dashboardLvl10Stats').removeClass('hide');
					$('#dashboardLvl10Stats').addClass('hide');
					$('#dashboardBuyLvl10').html("BUY LVL 10");
				}
			}

			if(parseInt(_lvl) < 11){
				findUserLevel(_lvl+1);
				
			}else{
				console.log("LVLS:", userLvls, userHighestUnexpired);
				

				if(userHighestUnexpired == 10){
					if(!buyNxtLvlBtnHidden){
						$('#buyNxtLvlBtn').addClass("hide");
						buyNxtLvlBtnHidden = true;
					}
				} else {
					if(buyNxtLvlBtnHidden){
						$('#buyNxtLvlBtn').removeClass("hide");
						buyNxtLvlBtnHidden = false;
					}

					buyNextLvlLvl = parseInt(userHighestUnexpired+1);
					buyNextLvlHex = 2000;
					for(let c=1; c< buyNextLvlLvl;c++)
						buyNextLvlHex = buyNextLvlHex * 2;


					$('#buyNxtLvlBtn').html("BUY LVL " + buyNextLvlLvl);	
					$('#buyHexApproveRequirements').html(buyNextLvlHex);
					$('#buyHexApprove').val(buyNextLvlHex);
					$('#buyPanelLvlTitle').html("Buy Level " + buyNextLvlLvl);
					$('#buyLvlCost').html(buyNextLvlHex + " HEX");
					$('#buyApproveTxt').html(buyNextLvlHex);
				}
				$('#currentLvl').html(userHighestUnexpired);
			}
		});	
	}

	function setupButtons() {
		var shareUrl = document.querySelector('.js-shareUrl');
		var copyShareUrl = copy(shareUrl);
		shareUrl.addEventListener('click', copyShareUrl, false);

		var shareUrl2 = document.querySelector('.js-shareUrl2');
		var copyShareUrl2 = copy(shareUrl2);
		shareUrl2.addEventListener('click', copyShareUrl2, false);


		var shareUrl3 = document.querySelector('.js-shareUrl3');
		var copyShareUrl3 = copy(shareUrl3);
		shareUrl3.addEventListener('click', copyShareUrl3, false);

		$('#viewContractBtn').click(function(){
			openContract();
		});
		$('#gameGudeBtn').click(function(){
			openGuide();
		})

		$('#dashboardBtn').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				$('#dashboardPanel').foundation('open');
			}			
		});

		$('#dashboardBtn2').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				$('#dashboardPanel').foundation('open');
			}			
		});

		$('#matrixBtn').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
			    var outerContent = $('#matrixOuter');
			    var innerContent = $('#matrixInner > div');
			    //console.log("CENTER:", outerContent, outerContent.width(), innerContent);
			    //console.log((innerContent.width() - outerContent.width()) / 2);
			    //outerContent.scrollLeft((innerContent.width() - outerContent.width()) / 2);
			    //outerContent.scrollLeft(100);
			    let _scrollAmount = (outerContent.width() - innerContent.width()) / 2;

			    $('#matrixOuter').scrollLeft(5000);
			    $("#matrixOuter").stop().animate({scrollLeft: '+=' + _scrollAmount}, 500);
			    //console.log($('#matrixOuter').scrollLeft);
			    // function buildMatrix(_startPoint, _depth, _prevPos, _startID) {
			    buildMatrix(userWalletAddress, 2, 0, 0);
				$('#dashboardPanel2').foundation('open');
			}			
		});

		$('#registerBtn').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {

				updateHEXBalance();

				$('#registrationPanel').foundation('open');
			}
		});

		$('#registrationApproveHexBtn').click(function(){

			if(!canPlay){
				notLoggedInMsg();
			} else {
				approveHex();	
			}
			
		});

		$('#regCompleteBtn').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				reg();
			}
		});

		$('#buyNxtLvlBtn').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				$('#buyLvlPanel').foundation('open');
			}
		});
		$('#buyApproveHexBtn').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				approveHexBuy();
			}
		});
		$('#buyCompleteBtn').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyLvl();
			}
		});

		$('#scanFreeRefs').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				$('#scanTitle').html("Searching:");
				checkFreeRefQueue(0);
				checkPlayerPerf(0);
				$('#refScanPanel').foundation('open');
			}
		})

		$('#dashboardBuyLvl1').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 2000;
				dashboardLvlBuy = 1;
				buyNextExpires = lvlExpires[1];
				$('#buyHexApproveRequirements2').html("2000");
				$('#buyHexApprove2').val(2000);
				$('#buyLvlCost2').html("2000");
				$('#buyApproveTxt2').html("2000");
				if(activeLvls[1] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl 1");
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl 1");
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl2').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 4000;
				dashboardLvlBuy = 2;
				buyNextExpires = lvlExpires[2];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[2] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl3').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 8000;
				dashboardLvlBuy = 3;
				buyNextExpires = lvlExpires[3];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[3] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl4').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 16000;
				dashboardLvlBuy = 4;
				buyNextExpires = lvlExpires[4];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[4] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl5').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 32000;
				dashboardLvlBuy = 5;
				buyNextExpires = lvlExpires[5];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[5] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl6').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 64000;
				dashboardLvlBuy = 6;
				buyNextExpires = lvlExpires[6];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[6] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl7').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 128000;
				dashboardLvlBuy = 7;
				buyNextExpires = lvlExpires[7];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[7] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl8').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 256000;
				dashboardLvlBuy = 8;
				buyNextExpires = lvlExpires[8];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[8] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl9').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 512000;
				dashboardLvlBuy = 9;
				buyNextExpires = lvlExpires[9];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[9] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});
		$('#dashboardBuyLvl10').click(function(){
			$('#dashboardPanel').foundation('close');
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyNextLvlHex2 = 1024000;
				dashboardLvlBuy = 10;
				buyNextExpires = lvlExpires[10];
				$('#buyHexApproveRequirements2').html(buyNextLvlHex2);
				$('#buyHexApprove2').val(buyNextLvlHex2);
				$('#buyLvlCost2').html(buyNextLvlHex2);
				$('#buyApproveTxt2').html(buyNextLvlHex2);
				if(activeLvls[10] == true){
					$('#buyPanelLvlTitle2').html("Extend Lvl " + dashboardLvlBuy);
				} else {
					$('#buyPanelLvlTitle2').html("Buy Lvl " + dashboardLvlBuy);
				}
				$('#buyLvlPanel2').foundation('open');

			}
		});

		$('#buyApproveHexBtn2').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				approveHexBuy2();
			}
		});
		$('#buyCompleteBtn2').click(function(){
			if(!canPlay){
				notLoggedInMsg();
			} else {
				buyLvlAt(dashboardLvlBuy);
			}
		})
	}


	var isApprovingHEXForReg = false;
	var isApprovingHEXForBuy = false;
	var isInReg = false;
	var isInBuy = false;
	var checkingForLevel = 1;
	var checkingForExpiry = 0;

	function reg() {
		//console.log("REG AMOUNT:", BigNumber(2000).times(TOKEN_DECIMALS).toFixed());
		// 1 2000.00000000
		//console.log("REG DETAILS:", referer, new BigNumber(2000).times(TOKEN_DECIMALS).toFixed());
		hexRunContract.methods.regUser(referer, new BigNumber(2000).times(TOKEN_DECIMALS).toFixed()).estimateGas({from: userWalletAddress}, function(_err,_gasAmount){
			if(_err){
				toastMessage("There was an error with your registration - please check you have the correct amount of HEX in your wallet and try again","HEXRun Registration Error",15000);	
				return;
			}
			toastMessage("HEXRun Registration sent - when the tx is complete it will show up here!","HEXRun Registration",15000);
			checkCounter = 0;
			isInReg = true;
			isInBuy = false;
			checkingForLevel = 1;
			checkingForExpiry = 0;
			setTimeout(function(){ checkUserLvls();}, 2500);
			//setTimeout(function(){ checkHexRegistration(results);}, 2500);

			hexRunContract.methods.regUser(referer,new BigNumber(2000).times(TOKEN_DECIMALS).toFixed()).send({from:userWalletAddress,
				gasPrice: gweiTowei(gasPrice),
			 	gas: _gasAmount}, function(err, results){
				if(err) {
					toastMessage("Your registration was cancelled - please try again", "HEXRun Registration");
					isInReg = false;
				} else {
					
					// show spinner now....
					$('#loadingDiv').removeClass('hide');
				}
			});


		});
	}

	function buyLvl() {
		hexRunContract.methods.buyLevel(buyNextLvlLvl, new BigNumber(buyNextLvlHex).times(TOKEN_DECIMALS).toFixed()).estimateGas({from: userWalletAddress}, function(_err,_gasAmount){


			if(_err){
				toastMessage("There was an error with your purchase - please check you have the correct amount of HEX in your wallet and try again","HEXRun Error",15000);	
				return;
			}

			toastMessage("HEXRun Level Purchase sent and will show up here shortly","HEXRun Level Upgrade");
			checkCounter = 0;
			//setTimeout(function(){ checkBuyLvlApproved(results);}, 2500);
			isInReg = false;
			isInBuy = true;
			checkingForLevel = buyNextLvlLvl;
			checkingForExpiry = 0;
			setTimeout(function(){ checkUserLvls();}, 2500);

			hexRunContract.methods.buyLevel(buyNextLvlLvl,new BigNumber(buyNextLvlHex).times(TOKEN_DECIMALS).toFixed()).send({from:userWalletAddress, 
					gasPrice: gweiTowei(gasPrice),
					gas: _gasAmount}, function(err, results){
				if(err) {
					toastMessage("Your Level Purchase was cancelled - please try again", "HEXRun Level Upgrade");
					isInBuy = false;
				} else {
					
					// show spinner now....
					
					$('#loadingDiv').removeClass('hide');

				}
			});
		});
	}

	function buyLvlAt(_lvl) {
		hexRunContract.methods.buyLevel(_lvl, new BigNumber(buyNextLvlHex2).times(TOKEN_DECIMALS).toFixed()).estimateGas({from: userWalletAddress}, function(_err,_gasAmount){

			if(_err){
				toastMessage("There was an error with your purchase - please check you have the correct amount of HEX in your wallet and try again","HEXRun Error",15000);	
				return;
			}

			toastMessage("HEXRun Level Purchase sent - when complete it will show up here","HEXRun Level Upgrade");
			checkCounter = 0;
			isInReg = false;
			isInBuy = true;
			checkingForLevel = _lvl;
			checkingForExpiry = buyNextExpires;

			console.log("CHECKING FOR:", checkingForLevel, checkingForExpiry );
			setTimeout(function(){ checkUserLvls();}, 2500);
			//setTimeout(function(){ checkBuyLvlApproved2(results);}, 2500);

			hexRunContract.methods.buyLevel(_lvl, new BigNumber(buyNextLvlHex2).times(TOKEN_DECIMALS).toFixed()).send({from:userWalletAddress, 
					gasPrice: gweiTowei(gasPrice),
					gas: _gasAmount}, function(err, results){
				if(err) {
					isInBuy = false;
					toastMessage("Your Level Purchase was cancelled - please try again", "HEXRun Level Upgrade");
				} else {
					
					// show spinner now....
					//console.log(results);
					$('#loadingDiv').removeClass('hide');

				}
			});
		});
	}



	function approveHex() {
		let _amount = ($('#registrationHexApprove').val() * TOKEN_DECIMALS).toFixed(0);
		let _amountBN = new BigNumber($('#registrationHexApprove').val()).times(TOKEN_DECIMALS).toFixed();
		console.log("_amount:", _amount, _amountBN);
		if(isNaN(_amount)){
			toastMessage("Invalid HEX approval amount", "HEX Approval");
			return;
		}

		hexTokenContract.methods.approve(hexRunContractAddress, _amountBN).estimateGas({from: userWalletAddress}, function(err,_gasAmount){

			toastMessage("HEX approval TX sent ~ when processed will update here to allow level Purchase!","HEX Approval",15000);
			checkCounter = 0;
			isApprovingHEXForReg = true;
			//setTimeout(function(){ checkHexApproved();}, 2500);
			setTimeout(function(){ getHEXApproved();}, 2500);

			hexTokenContract.methods.approve(hexRunContractAddress, _amountBN).send({from: userWalletAddress, 
				gasPrice: gweiTowei(gasPrice),
				gas: _gasAmount}, function(err, results){
				
				if(err) {
					toastMessage("Your approval was cancelled - please try again", "HEX Approval");
					isApprovingHEXForReg = false;

				} else {
					//console.log("APPROVE RES:", results); // 0xde87a0035eccf24aef66eba1a95501809c090a547a8f30613b901d09f84c142f
					
					// show spinner now....
					$('#loadingDiv').removeClass('hide');
					//setTimeout(function(){ checkHexApproved(results);}, 2500);

				}
			});
		});
	}
	function approveHexBuy() {
		let _amount = ($('#buyHexApprove').val() * TOKEN_DECIMALS).toFixed(0);
		let _amountBN = new BigNumber($('#buyHexApprove').val()).times(TOKEN_DECIMALS).toFixed();
		console.log("BUY APPROVE: _amount:", _amount, _amountBN);
		if(isNaN(_amount)){
			toastMessage("Invalid HEX approval amount", "HEX Approval");
			return;
		}

		hexTokenContract.methods.approve(hexRunContractAddress, _amountBN).estimateGas({from: userWalletAddress}, function(err,_gasAmount){

			toastMessage("HEX Approval sent and will show up here shortly","HEX Approval");
			checkCounter = 0;
			isApprovingHEXForBuy = true;
			setTimeout(function(){ getHEXApproved();}, 2500);
			//setTimeout(function(){ checkHexBuyApproved(results);}, 2500);

			hexTokenContract.methods.approve(hexRunContractAddress, _amountBN).send({from: userWalletAddress, 
				gasPrice: gweiTowei(gasPrice),
				gas: _gasAmount}, function(err, results){
				if(err) {
					toastMessage("Your approval was cancelled - please try again", "HEX Approval");
					isApprovingHEXForBuy = false;
				} else {
					
					// show spinner now....
					$('#loadingDiv').removeClass('hide');
				}
			});
		});	
	}


	function approveHexBuy2() {
		let _amount = ($('#buyHexApprove2').val() * TOKEN_DECIMALS).toFixed(0);
		let _amountBN = new BigNumber($('#buyHexApprove2').val()).times(TOKEN_DECIMALS).toFixed();
		console.log("BUY APPROVE2: _amount:", _amount, _amountBN);
		if(isNaN(_amount)){
			toastMessage("Invalid HEX approval amount", "HEX Approval");
			return;
		}

		toastMessage("HEX Approval sent and will show up here shortly","HEX Approval");
		checkCounter = 0;
		isApprovingHEXForBuy = true;
		setTimeout(function(){ updateHEXBalance();}, 2500);
		//setTimeout(function(){ checkHexBuyApproved(results);}, 2500);

		hexTokenContract.methods.approve(hexRunContractAddress, _amountBN).estimateGas({from: userWalletAddress}, function(err,_gasAmount){
			hexTokenContract.methods.approve(hexRunContractAddress, _amountBN).send({from: userWalletAddress, 
					gasPrice: gweiTowei(gasPrice), 
					gas: _gasAmount}, function(err, results){
				if(err) {
					toastMessage("Your approval was cancelled - please try again", "HEX Approval");
					isApprovingHEXForBuy = false;
				} else {
					
					// show spinner now....
					$('#loadingDiv').removeClass('hide');

				}
			});
		});	
	}

	
	///function checkHexApproved(tx) {
	function checkHexApproved() {
		if(checkCounter % 5 == 0) {
			toastMessage("We are still checking the blockchain for your transaction... please wait while it is processed.", "Processing Transaction");
		}
		checkCounter++;

		web3Provider.eth.getTransactionReceipt(tx, function(err, res){

			let _complete = false;
			if(res){
				if(res.status == true){
					_complete = true;
				}
			}
			if(_complete){
				$('#loadingDiv').addClass('hide');

				setTimeout(function(){ getHEXApproved()}, 2000);
				
				toastMessage("HEX Approval complete ~ next step = Registration!", "HEX Approval");
			} else {
				if(checkCounter < 1000)
					setTimeout(function(){ checkHexApproved(tx);}, 1500);

			}
		});
	}

	function checkHexBuyApproved(tx) {
		if(checkCounter % 5 == 0) {
			toastMessage("We are still checking the blockchain for your transaction... please wait while it is processed.", "Processing Transaction");
		}
		checkCounter++;

		web3Provider.eth.getTransactionReceipt(tx, function(err, res){
			if(err){
				console.log("ERROR WITH TX:", err);
				$('#loadingDiv').addClass('hide');
				toastMessage("There was an error processing your transaction ~ please check your wallet and try again!", "HEX Approval");
				return;
			}

			let _complete = false;
			if(res){
				if(res.status == true){
					_complete = true;
				} 
			}
			if(_complete){
				$('#loadingDiv').addClass('hide');

				setTimeout(function(){ getHEXApproved()}, 5000);

				toastMessage("HEX Approval complete ~ next step = Buy Lvl!", "HEX Approval");
			} else {
				if(checkCounter < 1000)
					setTimeout(function(){ checkHexBuyApproved(tx);}, 2500);

			}
		});
	}
	function checkBuyLvlApproved2(tx) {
		if(checkCounter % 5 == 0) {
			toastMessage("We are still checking the blockchain for your transaction... please wait while it is processed.", "Processing Transaction");
		}
		checkCounter++;

		web3Provider.eth.getTransactionReceipt(tx, function(err, res){
			if(err){
				console.log("ERROR WITH TX:", err);
				$('#loadingDiv').addClass('hide');
				toastMessage("There was an error processing your transaction ~ please check your wallet and try again!", "HEX Approval");
				return;
			}
			//console.log("BUY TX:", res);
			let _complete = false;
			if(res){
				if(res.status == true){
					_complete = true;
				}  else {
					$('#loadingDiv').addClass('hide');
					toastMessage("There was an error processing your transaction ~ please check your wallet and try again!", "HEX Approval");
					return;
				}
			}
			if(_complete){
				$('#loadingDiv').addClass('hide');

				$('#buyLvlPanel2').foundation('close');
				
				toastMessage("Level Purchase complete ~ welcome to your upgrade!", "HEXRun Level Upgrade");

				setTimeout(function(){ setupUser();}, 2500);
				setTimeout(function(){ getHEXApproved();}, 4000);

			} else {
				if(checkCounter < 1000)
					setTimeout(function(){ checkBuyLvlApproved2(tx);}, 2500);

			}
		});
	}

	function checkBuyLvlApproved(tx) {
		if(checkCounter % 5 == 0) {
			toastMessage("We are still checking the blockchain for your transaction... please wait while it is processed.", "Processing Transaction");
		}
		checkCounter++;

		web3Provider.eth.getTransactionReceipt(tx, function(err, res){
			if(err){
				console.log("ERROR WITH TX:", err);
				$('#loadingDiv').addClass('hide');
				toastMessage("There was an error processing your transaction ~ please check your wallet and try again!", "HEX Approval");
				return;
			}
			//console.log("BUY TX:", res);
			let _complete = false;
			if(res){
				if(res.status == true){
					_complete = true;
				}  else {
					$('#loadingDiv').addClass('hide');
					toastMessage("There was an error processing your transaction ~ please check your wallet and try again!", "HEX Approval");
					return;
				}
			}
			if(_complete){
				$('#loadingDiv').addClass('hide');

				$('#buyLvlPanel').foundation('close');
				
				toastMessage("Level Purchase complete ~ welcome to your upgrade!", "HEXRun Level Upgrade");

				setTimeout(function(){ setupUser();}, 2500);
				setTimeout(function(){ getHEXApproved();}, 6000);

			} else {
				if(checkCounter < 1000)
					setTimeout(function(){ checkBuyLvlApproved(tx);}, 2500);

			}
		});
	}

	function checkHEXApprovalLimits() {

		if(new BigNumber(currentHEXapproved).gte( new BigNumber(2000).times(TOKEN_DECIMALS))) {
			// permit registration
			if(!registrationBtnOpen){
				$('#regCompleteBtn').removeClass('disabled');
				$('#approveNotice').addClass('hide');
				registrationBtnOpen = true;
			}
		} else {
			if(registrationBtnOpen) {
				$('#regCompleteBtn').addClass('disabled');
				$('#approveNotice').removeClass('hide');
				registrationBtnOpen = false;	
			}
		}
	}

	function checkHEXBuyApprovalLimits() {
		console.log("buyNextLvlHex:", buyNextLvlHex, currentHEXapproved);
		if(new BigNumber(currentHEXapproved).gte( new BigNumber(buyNextLvlHex).times(TOKEN_DECIMALS))) {
			// permit buy lvl
			if(!buyBtnOpen){
				$('#buyCompleteBtn').removeClass('disabled');
				$('#buyApproveNotice').addClass('hide');
				buyBtnOpen = true;
			}
		} else {
			if(buyBtnOpen) {
				$('#buyCompleteBtn').addClass('disabled');
				$('#buyApproveNotice').removeClass('hide');
				buyBtnOpen = false;	
			}
		}
		console.log("checkHEXBuyApprovalLimits:", new BigNumber(currentHEXapproved).gte( new BigNumber(buyNextLvlHex).times(TOKEN_DECIMALS)));
	}

	function checkHEXBuyApprovalLimits2() {
		console.log("buyNextLvlHex2:", buyNextLvlHex2, currentHEXapproved);
		if(new BigNumber(currentHEXapproved).gte( new BigNumber(buyNextLvlHex2).times(TOKEN_DECIMALS))) {
			// permit buy lvl
			if(!buyBtnOpen2){
				$('#buyCompleteBtn2').removeClass('disabled');
				$('#buyApproveNotice2').addClass('hide');
				buyBtnOpen = true;
			}
		} else {
			if(buyBtnOpen2) {
				$('#buyCompleteBtn2').addClass('disabled');
				$('#buyApproveNotice2').removeClass('hide');
				buyBtnOpen = false;	
			}
		}
	}

	function checkHexRegistration(tx) {
		if(checkCounter % 5 == 0) {
			toastMessage("We are still checking the blockchain for your transaction... please wait while it is processed.", "Processing Transaction");
		}
		checkCounter++;

		web3Provider.eth.getTransactionReceipt(tx, function(err, res){

			let _complete = false;
			if(res){
				if(res.status == true){
					_complete = true;
				}
			}
			if(_complete){
				$('#loadingDiv').addClass('hide');
				$('#registrationPanel').foundation('close');
				
				toastMessage("Registration now complete ~ welcome to the game!", "HEXRun Registration");

				setTimeout(function(){setupUser();},5000);
				setTimeout(function(){ getHEXApproved()}, 7000);


			} else {
				if(checkCounter<1000)
					setTimeout(function(){ checkHexRegistration(tx);}, 2500);

			}
		});

	}


	function checkNetwork(_callback) {
		
	  web3Provider.eth.net.getNetworkType(function(err, res) {

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

	    //if(output==searchNetwork || output == "undefined") {

	      hexTokenContract = new web3Provider.eth.Contract(hexTokenAbi.abi, hexContractAddress);
	      hexRunContract = new web3Provider.eth.Contract(hexrunAbi.abi,hexRunContractAddress);

	      if(_callback)
	        _callback();

	   // } else {
	   //   console.log("NOT CONNECTED" + searchNetwork + ":" + output);
	      //deactivateGame();
	      //$('#notConnectedModel').foundation('open');
	   // }

	    
	  });
	}

	function getUserWalletAddress(_callback) {
	  web3Provider.eth.getCoinbase((err, res) => {
	    var output = "";

	    if (!err) {
	        output = res;
	        userWalletAddress = output;

	        setupReadOnlyWeb3();
	        
	        if(output) {
	          userWalletAddressShort = output.substring(0,10) + "...";
	          if(_callback) 
	            _callback();
	        }
	      else
	      {
	        //showError("Unable to open your Ethereum Wallet - are you logged in to your Wallet?<br/><br/>If this issue continues please contact support.");    
	        canPlay = false;
	        //deactivateGame();
	      }

	      //updateInnerHTML('accountAddr', '<a href="http://etherscan.io/address/' + output + '" target="_blank">' + outShort + '</a>');
	    } else {
	      output = "Error";
	      //showError("Unable to open your Ethereum Wallet - are you logged in to your Wallet?<br/><br/>If this issue continues please contact support.");
	      //deactivateGame();
	      canPlay = false;
	    }
	    
	  })
	}

	function hexRun_getUser(_address, _callback) {
		hexRunContract.methods.users(_address).call(function(err, results) {
			if(err){
				_callback(err, null);
			} else {
				_callback(null, results);
			}
		});
	}

	function allUserStats() {

		console.log("UPDATING USER COUNTS:");

		totalUsers = 0;
		hexRunContract.methods.currUserID().call(function(err, results){
			currUserID = parseInt(results);
			totalUsers = currUserID-1;
			$('#totalUsersDisp').html(totalUsers);

			hexRunContract.methods.viewLevelStats().call(function(err, results){
				console.log("STATS:", err, results);
				for(let c=0; c< results.length; c++){

					usersActiveInLvls[c] = parseInt(results[c]) -1;
					//totalUsers += usersActiveInLvls[c];

					$('#usersActiveLvl' + (Number(c)+Number(1)).toString() ).html(usersActiveInLvls[c]);

				}

				hexRunContract.methods.totalHex().call(function(err, results){
					if(!err){
						//results = 4000 * TOKEN_DECIMALS;
						$('#gameTotalHex').html(new BigNumber(results).div(TOKEN_DECIMALS).toFixed(2) + " HEX");

						let _ethBN = new BigNumber(results).div(TOKEN_DECIMALS).times(exchange_hex_eth);
						$('#totalETH').html(_ethBN.toFixed(3))
						// exchange_btc_eth == 1 btc = ETH
						//
						let _btcBN = _ethBN.div(new BigNumber(exchange_btc_eth));

						$('#totalBTC').html(_btcBN.toFixed(3))

						$('#totalBTCUSD').html( _btcBN.times(exchange_btc_usd).toFixed(2));
					}
				});

				setTimeout(function(){ allUserStats();}, 15000);

			});

		});
	}

	function setupRefs() {
		hexRunContract.methods.currUserID().call(function(err, results){
			currUserID = parseInt(results);


			if(isNaN(referer)) {

				// no _referer so need to select one for this user
				// start from id 2 and check onwards...
				//console.log("NEEED TO FIND REF!");
				requiresFreeRef = true;
				findFreeReferrer(160);
			} else {

				hexRunContract.methods.userList(referer).call(function(err, results){
					if(!err){
						if(results.toUpperCase() == userWalletAddress.toUpperCase()){
							console.log("Invalid referer - can't use your own account");
							toastMessage("Invalid referer - can't use your own account. Selecting free referer for you now...", "Referal Address", 10000);
							requiresFreeRef = true;

						} else {
							referrerAddress = results;

							if(isMobile){
								$('#refBy').html(referrerAddress.substring(0,10));
								$('#refBy2').html(referrerAddress.substring(0,10));
								$('#dashboardRef').html(referrerAddress.substring(0,10));
								$('#dashboardRef2').html(referrerAddress.substring(0,10));
							} else {
								$('#refBy').html(referrerAddress);
								$('#refBy2').html(referrerAddress);
								$('#dashboardRef').html(referrerAddress);
								$('#dashboardRef2').html(referrerAddress);
							}
						}

						if(requiresFreeRef){
							console.log("FINDING REF");
							requiresFreeRef = true;
							findFreeReferrer(0);
						}

					}

				});
			}

		});
	}

	function buildMatrix(_startPoint, _depth, _prevPos) {

		hexRunContract.methods.viewUserReferral(_startPoint).call(function(err, results){
			console.log("MATRIX:", _startPoint, results, _prevPos);
			// MATRIX: 0x418ea32f7eb0795aa83ceba00d6ddd055e6643a7  (TOP)
			// Array [ "0x5a1F1409739CB500b675c0300f46dfefE02a9e30", "0xB64B9f28eC7ACe6722d37ee039c17d22DD4f18F9" ]
 			// 0
 			// = need 2 loops of buildMatrixGetRef to get the user obj for this level

			let _maxDepth = 2;
			if(_depth == 3) {
				// level 2 & 7
				_maxDepth = 4;
			}
			if(_depth == 4) {
				// level 3 & 8
				_maxDepth = 8;
			}
			if(_depth == 5) {
				// level 4 & 9
				_maxDepth = 16;
			}
			if(_depth == 6) {
				// level 5 & 10
				_maxDepth = 32;
			}

			//buildMatrixGetRef(_results, _currentDepth, _pos, _maxDepth, _prevPos, _startID) {
			for(let _i=0; _i< results.length; _i++)
				buildMatrixGetRef(results, _depth, Number(_i), _maxDepth, Number(_prevPos+_i+1));


			// 0x5a1F1409739CB500b675c0300f46dfefE02a9e30 _i=0 _prevPos = 0
			// 0xB64B9f28eC7ACe6722d37ee039c17d22DD4f18F9 _i=1 _prevPos = 0 + _i


/*
			for(let c=0; c< results.length && c < _maxDpeth;c++){
				let _checkAddr = results[c];
				hexRunContract.methods.users(_checkAddr).call(function(err, results){
					console.log('#depthID_' + _depth + '_' + Number(c+1), results.id);

					$('#depthID_' + _depth + '_' + Number(c+1)).html('ID:' + results.id);
					let userHighestUnexpired = 0;

					//buildMatrixLvls(_checkAddr, 1);

					for(let _lvl = 1; _lvl< 11; _lvl++){
						hexRunContract.methods.viewUserLevelExpired(_checkAddr, _lvl).call(function(err, results){
							if(parseInt(results) > new Date().getTime()/1000) {
								userHighestUnexpired = _lvl;
								$('#depthLvl_' + _depth + '_' + Number(_lvl)).html('Lvl:' + userHighestUnexpired);
							}
						});						
					}

					//console.log("MATRIX2:", results);
					if(_depth< 7) {
						buildMatrix(_checkAddr, Number(_depth+1));
					}
				});
			}
*/

		});
	}

	function buildMatrixGetRef(_results, _currentDepth, _pos, _maxDepth, _prevPos) {
		let _checkAddr = _results[_pos];
		


		hexRunContract.methods.users(_checkAddr).call(function(err, results){
			console.log("BUILD MATRIX REX:", _checkAddr, _currentDepth, _pos, _maxDepth, _prevPos);
			console.log('#depthID_' + _currentDepth + '_' + Number(_prevPos) + "=", results.id, _pos);

			$('#depthID_' + _currentDepth + '_' + Number(_prevPos)).html('ID:' + results.id);

			// populate it's highest level

			//buildMatrixLvls(_checkAddr, _elementRef, _currentLvl);
			buildMatrixLvls(_checkAddr,  _currentDepth + '_' + Number(_prevPos), 1, 0);


			// now check for the next level below this
			if(Number(_currentDepth) < 6){
				//let _prevPos = 2;
				
				if(_currentDepth == 2) {
					if(_pos > 0)
						_prevPos = 2;
					else
						_prevPos = 0;
				}

				if(_currentDepth == 3) {
					// level 2 & 7
					//if(_pos > 0)
						_prevPos = Number((_prevPos * 2)-2);
					//else
					//	_prevPos = 0;

					
				}
				if(_currentDepth == 4) {
					// level 3 & 8
					//if(_pos > 0)
						_prevPos = Number((_prevPos * 2)-2);
					//else
					//	_prevPos = 0;
				}
				if(_currentDepth == 5) {
					// level 4 & 9
					//if(_pos > 0)
							_prevPos = Number((_prevPos * 2)-2);
					//	else
					//		_prevPos = 0;
				}
				if(_currentDepth == 6) {
					// level 5 & 10
					_prevPos = Number(_prevPos) * 16;
				}
				console.log("START NEXT BUILDMATRIX:", _checkAddr, Number(_currentDepth+1), Number(_prevPos));
				buildMatrix(_checkAddr, Number(_currentDepth+1), Number(_prevPos));
			}
			
			//let _userHighestUnexpired = 0;


/*
			if(Number(_pos+1) < _maxDepth && Number(_pos+1) < _results.length) {
				buildMatrixGetRef(_results, _currentDepth, Number(_pos+1), _maxDepth, Number(_prevPos+1));
			} else {
				console.log("END CHECK:", _results.length);
				// now loop through results again to drill down...
				 //function buildMatrix(_startPoint, _depth, _prevPos, _startID) {
				 if(Number(_startID+1) < _results.length)
				 	buildMatrix(_results[Number(_startID+1)], Number(_currentDepth+1), _prevPos, _startID);
				 else{
				 	console.log("DONE");
				 }

				//if(Number(_cycleNum) < _results.length)
				//	buildMatrix(_results[Number(_cycleNum)], Number(_currentDepth+1), _prevPos, Number(_cycleNum+1));
				//else {
					// this level complete
				//}
			}
*/

/*
			buildMatrixLvls(_checkAddr, _pos, 1, _currentDepth, 0, _prevPos, function() {
				if(Number(_pos+1) < _maxDepth && Number(_pos+1) < _results.length) {
					buildMatrixGetRef(_results, _currentDepth, Number(_pos+1), _maxDepth, Number(_prevPos+1));
				} else {
					//console.log("MATRIX2:", results);
					if(_currentDepth< 7) {
						// move down a level...
						let _prevPos = 2;
						if(_currentDepth == 3) {
							// level 2 & 7
							_prevPos = Number(_prevPos) * 2;
						}
						if(_currentDepth == 4) {
							// level 3 & 8
							_prevPos = Number(_prevPos) * 4;
						}
						if(_currentDepth == 5) {
							// level 4 & 9
							_prevPos = Number(_prevPos) * 8;
						}
						if(_currentDepth == 6) {
							// level 5 & 10
							_prevPos = Number(_prevPos) * 16;
						}
						buildMatrix(_results[0], Number(_currentDepth+1), _prevPos);
					}				
				}
			});
*/
			/*
			for(let _lvl = 1; _lvl< 11; _lvl++){
				hexRunContract.methods.viewUserLevelExpired(_checkAddr, _lvl).call(function(err, results){
					if(parseInt(results) > new Date().getTime()/1000) {
						userHighestUnexpired = _lvl;
						$('#depthLvl_' + _depth + '_' + Number(_lvl)).html('Lvl:' + userHighestUnexpired);
					}
				});						
			}
			*/


		});
	}

	//function buildMatrixLvls(_checkAddr, _pos, _lvl, _currentDepth, _userHighestUnexpired, _prevPos, _callback) {
	function buildMatrixLvls(_checkAddr, _elementRef, _currentLvl, _userHighestUnexpired) {

		hexRunContract.methods.viewUserLevelExpired(_checkAddr, _currentLvl).call(function(err, results){
//			if(_checkAddr == '0xB1701bC3D9C68E8F60DeA128e42544702fa63D5D')
//				console.log("LVLS:", _checkAddr, _elementRef, _currentLvl, _userHighestUnexpired);


			if(parseInt(results) > new Date().getTime()/1000) {
				_userHighestUnexpired = _currentLvl;
				$('#depthLvl_' + _elementRef).html('Lvl:' + _userHighestUnexpired);
				$('#depthPanel_' + _elementRef).removeClass('depthInactive');
			} else {
			}
			if(Number(_currentLvl+1) < 10) {
				buildMatrixLvls(_checkAddr, _elementRef, Number(_currentLvl+1),_userHighestUnexpired);
			}
		});	
	}

	
	function findFreeReferrer(c) {

		// find user address first...
		hexRunContract.methods.userList(c).call(function(err, results){
			// now check the lvl 0 expirey to see if it's a valid referrer...
			//toastMessage("FINDING:", c + ":" + results)
			let _addr = results;
			hexRunContract.methods.viewUserLevelExpired(_addr, 1).call(function(err, results){

				console.log("FINDING REF" , results,  c);
				
				if(results >= (new Date().getTime()/1000)){

					hexRunContract.methods.viewUserReferral(_addr).call(function(err, results){

						if(!err){
							if(results.length < 1){
								// use this ref
								console.log("FOUND VALID REF:", _addr);

								referer = c;
								referrerAddress = _addr;

								Cookies.set('id', referer, { expires: 60 });
								if(isMobile){
									$('#refBy').html(referrerAddress.substring(0,20));
									$('#refBy2').html(referrerAddress.substring(0,20));
								}else {
									$('#refBy').html(referrerAddress);
									$('#refBy2').html(referrerAddress);
								}
							} else {
								if(c+1 < currUserID) { // userStats[c].length) {
									findFreeReferrer(c+1);
								} else {
									defaultRef();
								}
							}
						} else {
							if(c+1 < currUserID) { // userStats[c].length) {
								findFreeReferrer(c+1);
							} else {
								defaultRef();
							}
						}
					});

					
				} else {
					if(c+1 < currUserID) { // userStats[c].length) {
						findFreeReferrer(c+1);
					} else {
						defaultRef();
					}
				}
			});
		});

	}




	function checkFreeRefQueue(c) {


		// find user address first...
		
		hexRunContract.methods.userList(c).call(function(err, results){
			// now check the lvl 0 expirey to see if it's a valid referrer...
			//toastMessage("FINDING:", c + ":" + results)
			//console.log("Scanning player: ", c, results);
			
			
			let _addr = results;

			hexRunContract.methods.viewUserLevelExpired(_addr, 1).call(function(err, results){

				//console.log("FINDING REF" , results,  c);
				$('#scanDetail').html("ID: " + c + " Addr:" + _addr);
				
				if(results >= (new Date().getTime()/1000)){

					ro_gameContract.methods.viewUserReferral(_addr).call(function(err, results){

						if(!err){
							if(results.length < 1){
								// use this ref
								console.log("SCAN FOUND VALID REF:", _addr);
								$('#scanTitle').html("Found:");
								referer = c;
								referrerAddress = _addr;

								//Cookies.set('id', referer, { expires: 60 });

							} else {
								if(c+1 < currUserID) { // userStats[c].length) {
									checkFreeRefQueue(c+1);
								} else {
									// done
								}
							}
						} else {
							if(c+1 < currUserID) { // userStats[c].length) {
								checkFreeRefQueue(c+1);
							} else {
								// done
							}
						}
					});

					
				} else {
					if(c+1 < currUserID) { // userStats[c].length) {
						checkFreeRefQueue(c+1);
					} else {
						// done
						// defaultRef();
					}
				}
			});

		});

	}





	var totalWithAtLeast1 = 0;
	var totalWithAtLeast2 = 0;
	function checkPlayerPerf(c) {


		// find user address first...
		
		hexRunContract.methods.userList(c).call(function(err, results){
			// now check the lvl 0 expirey to see if it's a valid referrer...
			//toastMessage("FINDING:", c + ":" + results)
			//console.log("Scanning player: ", c, results);
			
			
			let _addr = results;

			hexRunContract.methods.viewUserLevelExpired(_addr, 1).call(function(err, results){

				//console.log("FINDING REF" , results,  c);
				console.log("totalWithAtLeast1:", c, totalWithAtLeast1);
				console.log("totalWithAtLeast2:", c, totalWithAtLeast2);
				
				if(results >= (new Date().getTime()/1000)){

					ro_gameContract.methods.viewUserReferral(_addr).call(function(err, results){

						if(!err){
							if(results.length >= 1) {
								totalWithAtLeast1 ++;
							}
							if(results.length == 2){
								totalWithAtLeast2++;
							}

							if(c+1 < currUserID) { // userStats[c].length) {
								checkPlayerPerf(c+1);
							} else {
								// done
								console.log("totalWithAtLeast1:", totalWithAtLeast1);
								console.log("totalWithAtLeast2:", totalWithAtLeast2);
							}

						} else {
							if(c+1 < currUserID) { // userStats[c].length) {
								checkPlayerPerf(c+1);
							} else {
								// done
								console.log("totalWithAtLeast1:", totalWithAtLeast1);
								console.log("totalWithAtLeast2:", totalWithAtLeast2);
							}
						}
					});

					
				} else {
					if(c+1 < currUserID) { // userStats[c].length) {
						checkPlayerPerf(c+1);
					} else {
						// done
						// defaultRef();
						console.log("totalWithAtLeast1:", totalWithAtLeast1);
						console.log("totalWithAtLeast2:", totalWithAtLeast2);
					}
				}
			});

		});

	}


	function defaultRef() {
		referer = 1;
		hexRunContract.methods.userList(referer).call(function(err, results){
			referrerAddress = results;
			if(isMobile){
				$('#refBy').html(referrerAddress.substring(0,20));
				$('#refBy2').html(referrerAddress.substring(0,20));	
			} else {
				$('#refBy').html(referrerAddress);
				$('#refBy2').html(referrerAddress);	
			}
			
		});
	}


	function notLoggedInMsg() {
			showError("Unable to open your Ethereum Wallet, you need to have a Web3 wallet such as MetaMask installed and unlocked/logged in.<br/><br/>If this issue continues please contact support.");    
	}

	function showError(_msg) {
		$('#errorMsg').html(_msg);
		$('#errorPanel').foundation('open');
	}


	function toastMessage(_msg, _header, _timeout) {

		$.toast({
		    text: _msg, // Text that is to be shown in the toast
		    heading: _header|| 'HEXRun', // Optional heading to be shown on the toast
		    
		    showHideTransition: 'fade', // fade, slide or plain
		    allowToastClose: true, // Boolean value true or false
		    hideAfter: _timeout||3000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
		    stack: 5, // false if there should be only one toast at a time or a number representing the maximum number of toasts to be shown at a time
		    position: 'bottom-right', // bottom-left or bottom-right or bottom-center or top-left or top-right or top-center or mid-center or an object representing the left, right, top, bottom values
		    
		    bgColor: '#ff3cbe',  // Background color of the toast
		    textColor: '#eeeeee',  // Text color of the toast
		    textAlign: 'left',  // Text alignment i.e. left, right or center
		    loader: true,  // Whether to show loader or not. True by default
		    loaderBg: '#9EC600',  // Background color of the toast loader
		    beforeShow: function () {}, // will be triggered before the toast is shown
		    afterShown: function () {}, // will be triggered after the toat has been shown
		    beforeHide: function () {}, // will be triggered before the toast gets hidden
		    afterHidden: function () {}  // will be triggered after the toast has been hidden
		});

	}

    function copy(element) {
        return function() {
          	document.execCommand('copy', false, element.select());
          	toastMessage("Link copied to your clipboard", "Referral Link");
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
	};



});