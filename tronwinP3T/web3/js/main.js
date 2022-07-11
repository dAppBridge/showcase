//https://skalman.github.io/UglifyJS-online/
var isConnected = false;
var minPlayAmount = new BigNumber(0);
var userWalletAddress = "0x00";
var userWalletAddressShort = "0x00";
var userWalletBalance = 0;
var games = [];

function viewContract() {
  var win = window.open('https://etherscan.io/address/' + contractAddress, '_blank');
  if (win) {
      win.focus();
  } 
}

window.addEventListener('load', function() {

  // Check if Web3 has been injected by the browser:
  //updateInnerHTML('contractAddressHTML', '<a href="https://etherscan.io/address/' + contractAddress + '" target="_new">' + contractAddress + '</a>');

  if (typeof web3 !== 'undefined') {

    window.web3 = new Web3(web3.currentProvider); 
    isConnected = true;
    startApp();

  } else {
    console.log("No web3");
    if(isMainGame){
      isConnected = false;
      deactivateGame();
      $('#notConnectedModel').foundation('open');

   }
  }

});


function startApp() {
  if(isMainGame) {
    checkNetwork(populateGameStats);
  } else {
    checkNetwork(function() {
      if(!isDetail){

      } else {
        
      }
    });
  }
}

function checkNetwork(_callback) {
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

    var searchNetwork = "main";
    if(useTestnet == true){
      searchNetwork = "ropsten";
    }

    if(output==searchNetwork) {


      GameOfEthContract = new web3.eth.Contract(GameOfEthABI, contractAddress);



      if(_callback)
        _callback();

    } else {
      console.log("NOT CONNECTED" + searchNetwork + ":" + output);
      deactivateGame();
      $('#notConnectedModel').foundation('open');
    }

    
  })
}


function deactivateGame() {
  console.log("DeActiving Game...");

  $( "#investButton" ).prop( "disabled", true );
  $( "#investmentAmount" ).prop( "disabled", true );
  $( "#withdrawInvestmentButton" ).prop( "disabled", true );
  $( "#withdrawDividendsButton" ).prop( "disabled", true );
  $( "#reinvestButton" ).prop( "disabled", true );
  $( "#referralid_full" ).css( "cursor", "not-allowed")

}

function populateGameStats(){

    getUserWalletAddress(function(){
      canPlay = true;
      updateInnerHTML('referralid', userWalletAddress);
      updateInnerHTML('yourAddress', userWalletAddressShort);

      // get stats...
      getGameStats();


      getUserWalletBalance(function(){


      });


    });
    

    setTimeout(function(){ populateGameStats() }, GAME_UPDATE_SPEED);
}
var currentProfitDay = 0;
function getGameStats() {
  GameOfEthContract.methods.currentProfitDay().call(function(err, results){
    if(err) {
      showError("Unable to access the Game Of Eth smart contract - please try again later.");
      deactivateGame();
    } else {
      currentProfitDay = parseInt(results);
      updateInnerHTML('tradingDay', currentProfitDay + 1); // we start at 0 within the contract

      GameOfEthContract.methods.profitDays(currentProfitDay).call(function(err, results){
        if(err) {
          showError("Unable to access the Game Of Eth smart contract - please try again later.");
          deactivateGame();
        } else {
          console.log(results);
          updateInnerHTML('profitToday', web3.utils.fromWei(results.dailyProfit, 'ether').substring(0,8) );
          updateInnerHTML('investmentsTodayAmount', web3.utils.fromWei(results.dailyInvestments, 'ether').substring(0,8) ); // in wei
          
        };
      });

      //investmentsToday
      GameOfEthContract.methods.dailyInvestments().call(function(err, results){
        if(err){

        } else {
          console.log("investmentsToday:" +  results);
          updateInnerHTML('investmentsToday', results);
        }
      });

      //allTimeInvestmentsNum
      GameOfEthContract.methods.totalInvestments().call(function(err, results) {
        if(err){

        } else {
          console.log("totalInvestments:" + results);
          updateInnerHTML('allTimeInvestmentsNum', results );
        }
      });

      //allTimeInvestmentsEth
      GameOfEthContract.methods.totalInvestmentFund().call(function(err, results){
        if(err){

        } else {
          console.log("totalInvestmentFund:" +  results);
          updateInnerHTML('allTimeInvestmentsEth',web3.utils.fromWei(results, 'ether').substring(0,8) );
        }
      });

      //allTimeProfit      
      GameOfEthContract.methods.totalProfits().call(function(err, results){
        if(err){

        } else {
          console.log("allTimeProfit:" +  results);
          updateInnerHTML('allTimeProfit',web3.utils.fromWei(results, 'ether').substring(0,8) );
        }
      });

      //yourTotalInvestments (investor_getMediumInfo)
      //yourTotalInvestmentsAmount
      GameOfEthContract.methods.investor_getMediumInfo(userWalletAddress).call(function(err, results){
        if(err){

        } else {
          console.log("investor_getMediumInfo:" + results[2]);
          updateInnerHTML('yourTotalInvestments', results[2]);
          updateInnerHTML('yourTotalInvestmentsAmount', web3.utils.fromWei(results[0], 'ether').substring(0,8) );
          updateInnerHTML('currentInvestment', web3.utils.fromWei(results[0], 'ether').substring(0,8) );
          // and minus 20% into currentInvestmentSettlement
          let currentInvestmentSettlementVal = new BigNumber(results[0]).times(0.8);
          console.log(currentInvestmentSettlementVal);
          updateInnerHTML('currentInvestmentSettlement', web3.utils.fromWei(currentInvestmentSettlementVal.toString(), 'ether').substring(0,8) );

        }
      });

      //yourDividendsAvailable
      //yourDividendsToday
      GameOfEthContract.methods.showDividendsAvailable().call({from: userWalletAddress}, function(err, results){
        if(err){
          console.log(err);
        } else {
          let _total_value = new BigNumber(results.total_value);
          let _total_refBonus = new BigNumber(results.total_refBonus);

          console.log("Divends avail:" + _total_value.toString() + ":" + _total_refBonus.toString());

          updateInnerHTML('yourDividendsAvailable', web3.utils.fromWei(_total_value.plus(_total_refBonus).toString(), 'ether').substring(0,8) ); 
          updateInnerHTML('currentDividends1', web3.utils.fromWei(_total_value.plus(_total_refBonus).toString(), 'ether').substring(0,8) ); 
          updateInnerHTML('currentDividends2', web3.utils.fromWei(_total_value.plus(_total_refBonus).toString(), 'ether').substring(0,8) ); 


          GameOfEthContract.methods.showLiveDividends().call({from: userWalletAddress}, function(err, live_results){
            if(err){

            } else {

              let _live_total_value = new BigNumber(live_results.total_value);
              let _live_totalrefBonus = new BigNumber(live_results.total_refBonus);

              let _divsToday = _live_total_value.plus(_live_totalrefBonus);
              console.log("divsToday:" + _divsToday.toString());
              console.log("live_results:" + live_results);

              _divsToday = _divsToday.minus(_total_value.plus(_total_refBonus));

              if(_divsToday.gt(0)) {
                updateInnerHTML('yourDividendsToday', web3.utils.fromWei(_divsToday.toString(), 'ether').substring(0,8) );               
              } else {
                updateInnerHTML('yourDividendsToday', "0" );               
              }
            }
          });

        }
      });

    }
  });
}



function getUserWalletAddress(_callback) {
  web3.eth.getCoinbase((err, res) => {
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
        showError("Unable to open your Ethereum Wallet - are you logged in to your Wallet?<br/><br/>If this issue continues please contact support.");    
        canPlay = false;
        deactivateGame();
      }

      //updateInnerHTML('accountAddr', '<a href="http://etherscan.io/address/' + output + '" target="_blank">' + outShort + '</a>');
    } else {
      output = "Error";
      showError("Unable to open your Ethereum Wallet - are you logged in to your Wallet?<br/><br/>If this issue continues please contact support.");
      deactivateGame();
      canPlay = false;
    }
    
  })
}
function getUserWalletBalance(_callback) {
  web3.eth.getCoinbase((err, res) => {
    var output = "";
    if (!err) {
        output = res;
      web3.eth.getBalance(output, (err2, res2) => {
        if (!err2) {
          // web3.eth.getBalance(res[i]) returns an instanceof BigNumber
          
          ////output = web3.utils.fromWei(res2, 'ether').substring(0,8) + " Ether";
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

  })
}
function cancelGame(barId) {
  if(!canPlay) {
    showNotConnectedMsg();
    return;
  }
  let _msg = 'This will fully cancel your participation within this game and withdraw <b>' + document.getElementById('yourEth_inGame_' + barId).innerHTML;
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
  GameOfEthContract.methods.reinvestDividends().estimateGas(
      {from: userWalletAddress}, 
        function(error, gasAmount){
          if(error) {
            showError("Error accessing game contract - or you may not have any dividends available today, - please try again.  If this issue persists try reloading this page.");
          } else {

            $.toast({
                heading: 'Sending Transaction',
                text: 'Check your Ethereum Wallet to complete the transaction',
                showHideTransition: 'slide',
                icon: 'info'
            })

            GameOfEthContract.methods.reinvestDividends().send(
                {
                  from: userWalletAddress,
                  gas: gasAmount,
                  gasPrice: useGasPrice
                }, function( err, results) {
                  if(err) {
                    $.toast({
                        heading: 'Reinvestment Cancelled',
                        text: 'Your withdawal was cancelled - please try again!',
                        showHideTransition: 'slide',
                        icon: 'info'
                    })

                  } else {
                    let _msg = "<h4>Transaction Complete!</h4>"
                    _msg += '<p style="font-size: 10pt;"><b>Your Reinvestment is complete!</b></p>';
                    _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and your balance  will update shortly.</p>';
                    _msg += '<p style="font-size: 8pt;"><i>Please Note: Your ETH will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
                    _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
                    _msg += '<p style="font-size: 10pt;">Share Bank of Eth now:</p>';
                    _msg += '<div class="addthis_inline_share_toolbox"></div>';
                    _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you gain!</b></p>';
                    showError("Sucess!", _msg);
                    addthis.layers.refresh();
                  }
                }
              );

          }
      });
}
function withdrawDividends() {
  if(!canPlay){
    showNotConnectedMsg();
    return;
  }
  GameOfEthContract.methods.withdrawDividends().estimateGas(
      {from: userWalletAddress}, 
        function(error, gasAmount){
          if(error) {
            showError("Error accessing game contract - or you may not have any dividends available today, - please try again.  If this issue persists try reloading this page.");
          } else {

            $.toast({
                heading: 'Sending Transaction',
                text: 'Check your Ethereum Wallet to complete the transaction',
                showHideTransition: 'slide',
                icon: 'info'
            })

            GameOfEthContract.methods.withdrawDividends().send(
                {
                  from: userWalletAddress,
                  gas: gasAmount,
                  gasPrice: useGasPrice
                }, function( err, results) {
                  if(err) {
                    $.toast({
                        heading: 'Withdrawal Cancelled',
                        text: 'Your withdawal was cancelled - please try again!',
                        showHideTransition: 'slide',
                        icon: 'info'
                    })

                  } else {
                    let _msg = "<h4>Transaction Complete!</h4>"
                    _msg += '<p style="font-size: 10pt;"><b>Your Withdrawal is complete!</b></p>';
                    _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and your balance  will update shortly.</p>';
                    _msg += '<p style="font-size: 8pt;"><i>Please Note: Your ETH will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
                    _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
                    _msg += '<p style="font-size: 10pt;">Share Bank of Eth now:</p>';
                    _msg += '<div class="addthis_inline_share_toolbox"></div>';
                    _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you gain!</b></p>';
                    showError("Sucess!", _msg);
                    addthis.layers.refresh();
                  }
                }
              );

          }
      });

}

function withdrawInvestment() {
  if(!canPlay){
    showNotConnectedMsg();
    return;
  }
  GameOfEthContract.methods.withdrawInvestment().estimateGas(
      {from: userWalletAddress}, 
        function(error, gasAmount){
          if(error) {
            showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
          } else {

            $.toast({
                heading: 'Sending Transaction',
                text: 'Check your Ethereum Wallet to complete the transaction',
                showHideTransition: 'slide',
                icon: 'info'
            })

            GameOfEthContract.methods.withdrawInvestment().send(
                {
                  from: userWalletAddress,
                  gas: gasAmount,
                  gasPrice: useGasPrice
                }, function( err, results) {
                  if(err) {
                    $.toast({
                        heading: 'Withdrawal Cancelled',
                        text: 'Your withdawal was cancelled - please try again!',
                        showHideTransition: 'slide',
                        icon: 'info'
                    })

                  } else {
                    let _msg = "<h4>Transaction Complete!</h4>"
                    _msg += '<p style="font-size: 10pt;"><b>Your Withdrawal is complete!</b></p>';
                    _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and your balance  will update shortly.</p>';
                    _msg += '<p style="font-size: 8pt;"><i>Please Note: Your ETH will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
                    _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
                    _msg += '<p style="font-size: 10pt;">Share Bank of Eth now:</p>';
                    _msg += '<div class="addthis_inline_share_toolbox"></div>';
                    _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you gain!</b></p>';
                    showError("Sucess!", _msg);
                    addthis.layers.refresh();
                  }
                }
              );

          }
      });

}
function playGame() {
  if(!canPlay) {
    showNotConnectedMsg();
    return;
  }
  // check minium ETH amount...
  GameOfEthContract.methods.minInvestment().call(function(err, results){
    if(err) {
      showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
    } else {

      let playAmount = new BigNumber(web3.utils.toWei(document.getElementById('investmentAmount').value, "ether"));
      // update the minPlayAmount
      minPlayAmount = new BigNumber(results);

      if(playAmount.isLessThan(minPlayAmount)) {
        showError("The minium ETH required for this game is: " + web3.utils.fromWei(results, 'ether').substring(0,8) + "<br/><br/>Please update your investment and try again.");
      } else {
        // check max amount for this game.....
        GameOfEthContract.methods.maxInvestment().call(function(err, results){
          if(err){
            showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
          } else {
            let maxPlayAmount = new BigNumber(results);
            if(playAmount.isGreaterThan(maxPlayAmount)) {
              showError("Wooh! Too much Eth!<br/><br/>The max investment amount per play is: " + web3.utils.fromWei(results, 'ether').substring(0,8) + "<br/><br/> Please update your investment amount and try again.");
            } else {
              // invest

              if(!web3.utils.isAddress(_referer)){
                console.log("Invalid Referer");
                _referer = web3.utils.toChecksumAddress("0x0000000000000000000000000000000000000000");
                console.log("New Referer:" + _referer);
              }

              console.log(playAmount.toString());

              GameOfEthContract.methods.invest(_referer).estimateGas(
                {from: userWalletAddress, value: playAmount.toString()}, 
                  function(error, gasAmount){
                    if(error) {
                      showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
                    } else {
                      submitInvestment(gasAmount, playAmount);
                    }
                  }
                );
            }
          }
        });
          

      }
    }
  });

}

function submitInvestment(gasAmount, playAmount) {


  $.toast({
      heading: 'Sending Transaction',
      text: 'Check your Ethereum Wallet to complete the transaction',
      showHideTransition: 'slide',
      icon: 'info'
  })

  GameOfEthContract.methods.invest(_referer).send(
      {
        from: userWalletAddress,
        gas: gasAmount,
        gasPrice: useGasPrice,
        value: playAmount.toString()
      }, function( err, results) {
        if(err) {
          $.toast({
              heading: 'Investment Cancelled',
              text: 'Your investment was cancelled and no ETH was spent this time - please try again!',
              showHideTransition: 'slide',
              icon: 'info'
          })
          //showError("Unable to access game contract - please try again.  If this issue persists try reloading this page.");
        } else {
          let _msg = "<h4>Congratulations!</h4>"
          _msg += '<p style="font-size: 10pt;"><b>Your Investment is complete!</b></p>';
          _msg += '<p style="font-size: 10pt;">It will be mined by the Blockchain and the Bank Of Eth balance  will update shortly.</p>';
          _msg += '<p style="font-size: 8pt;"><i>Please Note: Your investment will not appear instantly - it depends how busy the Ethereum network is. Please monitor with Etherscan.</i></p>';
          _msg += '<p style="font-size: 10pt;"><a href="https://etherscan.io/tx/' + results + '" target="_new">View Transaction on Etherscan</a></p>';
          _msg += '<p style="font-size: 10pt;">Share Bank of Eth now:</p>';
          _msg += '<div class="addthis_inline_share_toolbox"></div>';
          _msg += '<p style="font-size: 10pt;"><b>The more players we have - the more profits you gain!</b></p>';
          showError("Sucess!", _msg);
          addthis.layers.refresh();
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
    showError("Game Of Eth", "It looks like your not connected to the Mainnet or logged into your Wallet at the moment.<br/><br/>For iOS we recommend: <a href=\"https://wallet.coinbase.com/\">Coinbase Wallet</a> - please go to the dapps section and browse to our site when using.<br/><br/>Refresh this page when you are logged into your wallet.");
  } else {
    if(isAndroid){
      showError("Game Of Eth", "It looks like your not connected to the Mainnet or logged into your Wallet at the moment.<br/><br/>For iOS we recommend: <a href=\"https://wallet.coinbase.com/\">Coinbase Wallet</a> - please go to the dapps section and browse to our site when using.<br/><br/>Refresh this page when you are logged into your wallet.");
    } else {
      showError('Game Of Eth', 'It looks like your not connected to the Mainnet or Logged into your Wallet at the moment.<br/><br/>Please connect to <a href="https://metamask.io/" target="_new">Metamask</a> and select the Mainnet and ensure you are logged in to continue.<br/><br/>Refresh this page when you are logged into your wallet.');    
    }
  }
}


function showError(error, errorTitle) {
    if(errorTitle) {
      updateInnerHTML('errorHeader', errorTitle);
    } else {
      updateInnerHTML('errorHeader', 'Error with your Ethereum Wallet');
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

