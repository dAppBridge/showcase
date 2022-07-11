
let punks2Contract;



let lastUpdate=new Date().getTime();

let currentAddr = '';

// wallet details
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

const punks_contract_addr ="0xc02d332AbC7f9E755e2b1EB56f6aE21A7Da4B7AD"; 
// testnet = "0xEa542A2729985942E156d7a155f19d127FeBaD1c";


var isMobile = false;
var ro_web3Provider;
var ro_Conn;
var ro_punksContract;
const ro_CONNECTION_TO_USE = "https://polygon-rpc.com";

// Web3modal instance
var web3Modal

// Chosen wallet provider given by the dialog window
var provider;
var chainId;
let accounts;

let required_chainId = "0x89"; //137; //80001 for testnet

// Address of the selected account
let selectedAccount;
let controlLoopStarted = false;

window.addEventListener('DOMContentLoaded', event => {
    


    // check for a wallet already connected...
    init();
});



let referer = "";

function startScroller() {


    // Number of items viewable at one time 

    var scrollerItemsViewable = 6;

    if(isMobile)
        scrollerItemsViewable = 3;
    // Scroller speed in seconds
    var scrollerSpeed = 1;
    // Transition speed - must be <= scrollerSpeed
    var scrollerTransitionSpeed = 1;

    // Rebuild the element list to remove white space
    var scrollerItemsEl = '';
    $('.scrollerContainer > article').each(function(index) {
    //console.log( index + ": " + $( this ).text() );
        scrollerItemsEl += $(this).prop('outerHTML');
    });
    $('.scrollerContainer').html(scrollerItemsEl);

    // Wrap items in a box that is as wide as the all the elements combined.
    // This prevents the items from wrapping if wider than the scroller width
    $('.scrollerContainer > article').wrapAll('<div class="scrollerGroup" />');
    var scrollerCount = $('.scrollerContainer .scrollerGroup > article').length;
    var scrollerItemWidth = parseInt($('.scrollerContainer').css('width')) / scrollerItemsViewable;
    $('.scrollerContainer .scrollerGroup > article').css('width', scrollerItemWidth + 'px');
    $('.scrollerContainer .scrollerGroup').css('width',scrollerCount * scrollerItemWidth + 'px');
    $('.scrollerContainer .scrollerGroup > article').css('transition', 'margin ' + scrollerTransitionSpeed + 's');

    // Set Starting Values
    var scrollerLeftMargin = '-' + scrollerItemWidth + 'px';
    var scrollerFirstItem = true;

    scrollerAnimate(scrollerSpeed);

    function scrollerAnimate(speed) {
        
        setInterval(scrollerRotate, speed * 1000);
    }

    function scrollerRotate() {
        if(!scrollerStarted)
            return;

    if (scrollerFirstItem) {
        scrollerFirstItem = false;
    } else {
        $('.scrollerContainer .scrollerGroup').append($('.scrollerContainer .scrollerGroup article:first-child'));
    }
    $('.scrollerContainer .scrollerGroup > article').css('margin-left', '0');
    $('.scrollerContainer .scrollerGroup > article:first-child').css('margin-left', scrollerLeftMargin);
    }

}

function init() {
    getGasPrice();
	var isMobileCheck = window.matchMedia("only screen and (pointer:coarse)");
	if(isMobileCheck.matches){
		isMobile = true;
	}

    

    setupReadOnlyWeb3(setupProgressBar);

    if(document.querySelector("#connectWallet"))
        document.querySelector("#connectWallet").addEventListener("click", onConnect);

    if(document.querySelector("#walletConnect"))
    document.querySelector("#walletConnect").addEventListener("click", onConnect);
    
    if(document.querySelector("#mintPunks2"))    
        document.querySelector("#mintPunks2").addEventListener("click", mintPunks2);

    if(document.querySelector('#yourPunks2Btn'))    
        document.querySelector('#yourPunks2Btn').addEventListener("click",viewPunks);

    if(document.querySelector('#numberOfPunks')){
        document.querySelector('#numberOfPunks').addEventListener("change", refreshData);
        document.querySelector('#numberOfPunks').addEventListener("keyup", refreshData);
    }
    
    var _newReferer = getUrlParameter('ref')||"";
    if(_newReferer.length > 0) { // newly referred
        referer = _newReferer;

    } else { // existing user referred by someone
        let _cookieRef = Cookies.get('ref')||"";
        console.log("COOKIE REF:", _cookieRef);
        if(_cookieRef.length >0)
              referer = _cookieRef;
    }

    if(!referer){
        console.log("NO REF");
        referer = "";
    }
    if(referer == "undefined"){
        console.log("NO REF2");
        referer = "";
    }

    console.log("referer = ",referer);
    Cookies.set('ref', referer, { expires: 60 });


    startScroller();
    
    if(document.querySelector('#shareURL')){
        var shareUrl = document.querySelector('#shareURL');
        var copyShareUrl = copy(shareUrl);
        shareUrl.addEventListener('click', function(){copyShareUrl();toastMessage("Your REF URL has been copied to your clipboard ready for you to share!");}, false);
    }
  
    // Check that the web page is run in a secure context,
    // as otherwise MetaMask won't be available
    if(location.protocol !== 'https:') {
      // https://ethereum.stackexchange.com/a/62217/620
      const alert = document.querySelector("#alert-error-https");
      alert.style.display = "block";
      document.querySelector("#walletConnect").setAttribute("disabled", "disabled")
      return;
    }
  
    // Tell Web3modal what providers we have available.
    // Built-in web browser provider (only one can exist as a time)
    // like MetaMask, Brave or Opera is added automatically by Web3modal
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          // Mikko's test key - don't copy as your mileage may vary
          //infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
        }
      },
  
      fortmatic: {
        package: Fortmatic,
        options: {

        }
      }
    };
  
    web3Modal = new Web3Modal({
      cacheProvider: false, // optional
      providerOptions, // required
      disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });
  

    console.log("Web3Modal instance is", web3Modal);
    //checkConnection();
  }
  function getCurrentProvider() {
    if (!window.web3) return 'unknown';

    if (window.web3.currentProvider.isMetaMask)
        return 'metamask';

    if (window.web3.currentProvider.isTrust)
        return 'trust';

    if (window.web3.currentProvider.isGoWallet)
        return 'goWallet';

    if (window.web3.currentProvider.isAlphaWallet)
        return 'alphaWallet';

    if (window.web3.currentProvider.isStatus)
        return 'status';

    if (window.web3.currentProvider.isToshi)
        return 'coinbase';

    if (typeof window.__CIPHER__ !== 'undefined')
        return 'cipher';

    if (window.web3.currentProvider.constructor.name === 'EthereumProvider')
        return 'mist';

    if (window.web3.currentProvider.constructor.name === 'Web3FrameProvider')
        return 'parity';

    if (window.web3.currentProvider.host && window.web3.currentProvider.host.indexOf('infura') !== -1)
        return 'infura';

    if (window.web3.currentProvider.host && window.web3.currentProvider.host.indexOf('localhost') !== -1)
        return 'localhost';

    return 'unknown';
}

async function setupReadOnlyWeb3(_callback) {
    // READ ONLY CONNECTION...
    //console.log("READONLY SETUP", CONNECTION_TO_USE);
   // const ethersProvider = new ethers.providers.JsonRpcProvider(ro_CONNECTION_TO_USE, 137);


    console.log("RO CONN:", ro_CONNECTION_TO_USE);
    const ethersProvider = new ethers.providers.JsonRpcProvider(ro_CONNECTION_TO_USE);

    ro_web3Provider = ethersProvider; //new Web3.providers.HttpProvider(ro_CONNECTION_TO_USE);

    const ro_signer = ethersProvider.getSigner();
    
    ro_punksContract = new ethers.Contract(punks_contract_addr, punks2Abi.abi, ro_web3Provider);

    setupLatest();

    if(_callback)
      _callback();

    

    return;

}

const  queryBlocks = 2000;
const minBlock = 20346370;
let currentBlock = 0;
var inMint = false;
async function setupLatest() {
    queryLatestAPI();

}

let punksSet = 0;
var scrollerStarted = false;
var gasPrice = 750;
async function getGasPrice() {
    //
    const query = "https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=pendingpooltxgweidata";
    httpGetAsync(query,function(data) {
        console.log("RAW:", data);
        gasPrice = ((data.result.rapidgaspricegwei) * 1.2).toFixed(0);
        console.log("GAS PRICE:", gasPrice);
    });
}

async function queryLatestAPI() {
    console.log("START API");
    const query = "https://api.cryptopunks2.com/punks2/latest";
    httpGetAsync(query,function(data) {
        for(let i=0; i< data.latestMints.length; i++) {
           let _tokenID = parseInt(data.latestMints[i].tokenid);
           punksSet++;
           
           $('#article' + punksSet).attr('tokenid', _tokenID);

           if(document.querySelector("#article" + punksSet))
           document.querySelector("#article" + punksSet).addEventListener("click", viewPunk);

           $('#article' + punksSet).css("background", "#" + chars[_tokenID].background_color + " url('/punks2/img/image" + _tokenID + ".png') center 10px/50px no-repeat");
           $('#article' + punksSet).css("border", "solid 2px black"); 
           $('#article' + punksSet + 'caption').html("#" + _tokenID);
   
           if(!scrollerStarted && punksSet>4){
               scrollerStarted = true;
           }
           if(punksSet > 50) {
               break;
           }
        }
    });

}
function httpGetAsync(theUrl, callback)
{
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
       
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true);
    xmlHttp.send(null);
}



async function queryLatestMints(fromBlock) {
    let _endBlock = fromBlock;
    let _startBLock = fromBlock - queryBlocks;
    var filter = {
        address: punks_contract_addr,
        topics: ["0xf3cea5493d790af0133817606f7350a91d7f154ea52eaa79d179d4d231e50102"],
        fromBlock: _startBLock,
        toBlock: _endBlock
    };
    var _events = await ro_web3Provider.getLogs(filter);

    for(let i=0; i< _events.length; i++) {

        let _tokenID = parseInt(_events[i].topics[1],16);
        punksSet++;
        $('#article' + punksSet).attr('tokenid', _tokenID);
        $('#article' + punksSet).css("background", "#" + chars[_tokenID].background_color + " url('/punks2/img/image" + _tokenID + ".png') center 10px/50px no-repeat");
        $('#article' + punksSet + 'caption').html("#" + _tokenID);

        if(!scrollerStarted && punksSet>4){
            scrollerStarted = true;
        }
    }

    if(_startBLock > minBlock && punksSet < 31){
        if(inMint) {
            setTimeout(function(){queueQueryLastMints(_startBLock+1);}, 1500);
        } else {
            queryLatestMints(_startBLock-1);
        }
    }

}
function queueQueryLastMints(fromBlock) {
    if(inMint) {
        setTimeout(function(){queueQueryLastMints(fromBlock+1);}, 2000);
    } else {
        queryLatestMints(fromBlock-1);
    }

}

function viewPunk(e) {
    console.log("CLICK");
    let _id = $(this).attr("tokenid");
    
    if(_id == 0) 
        return;
    document.location.href="/punks2/?id=" + _id;
}

let bar;
function setupProgressBar() {
    if($('#progressBar').length){
       // console.log($('#progressBar'));
        bar = new ProgressBar.Line('#progressBar', {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: '#8247e5',
        trailColor: '#222',
        trailWidth: 1,
        svgStyle: {marginTop: '40px', width: '100%', height: '100%', borderRadius: '0px'},
        text: {
          style: {
            // Text color.
            // Default: same as stroke color (options.color)
            fontWeight: 'bolder',
            color: '#000',
            position: 'absolute',
            right: '35%',
            top: '0px',
            padding: 0,
            margin: 0,
            transform: null
          },
          autoStyleContainer: false
        },
        from: {color: '#FFEA82'},
        to: {color: '#c889cc'},
        step: (state, bar) => {
          bar.setText('PHASE MINTING PROGRESS: ' + Math.round(bar.value() * 100) + ' %');
        }
        });
    }
    updateProgressBar();
}
function startCountDown(_tokensRemaining) {
    function animateValue(id, start, end, duration) {
        if (start === end) return;
        var range = end - start;
        var current = start;
        var increment = end > start? 1 : -20;

        var stepTime = Math.abs(Math.floor(duration / range));
        var obj = document.getElementById(id);
        var timer = setInterval(function() {
            if(current-end < 50)
                increment = -1;

            current += increment;
            obj.innerHTML = current;
            if (current == end) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    function animateValueUp(id, start, end, duration) {
        if (start === end) return;
        var range = end - start;
        var current = start;
        var increment = end > start ? 25 : 1;

        var stepTime = Math.abs(Math.floor(duration / range));
        var obj = document.getElementById(id);
        var timer = setInterval(function() {
            if(end-current < 50)
                increment = 1;

            current += increment;
            obj.innerHTML = current;
            if (current == end) {
                clearInterval(timer);
            }
        }, stepTime);
    }
    
    if(document.getElementById('remainingPunks'))
    animateValue("remainingPunks", 2500, _tokensRemaining, 5);

    
    
    if(document.getElementById('punksMintedCounter'))
    animateValueUp("punksMintedCounter", 100, parseInt(tokens_minted) + parseInt(marketing_minted), 1);
}

var progress_val = 0;
var progress_end = 0;
function startFullProgress() {

    if(!document.querySelector("#percent1"))
        return;

    var interval = setInterval(function () {
        progress_val++;


        $('#pb1').progressbar({
            value: progress_val,
            change: function () {
                $('#mintingCount').html(progress_val + '%');
                $('#percent1').css('display', 'block');

                if (progress_val >= 76) {
                    //90 and above
                    $("#percent1 + div").css({ 'background': 'red' });
                  } else if (progress_val >= 51 && progress_val < 75) {
                    $("#percent1 + div").css({ 'background': 'orange' });
                  } else if (progress_val >= 26 && progress_val < 50) {
                    $("#percent1 + div").css({ 'background': 'yellowgreen' });
                  } else {
                      $("#percent1 + div").css({ 'background': 'lightgreen' });

                  }

            },
            complete: function () {}
        });
        if (progress_val == progress_end) {
            clearInterval(interval);
        }
    }, 50);
}

var countDownStart = false;
var tokens_minted = 0;
var marketing_minted = 0;
function updateProgressBar() {

    getMarketingMints();
    async function getMarketingMints() {
        let _res = await ro_punksContract.currentMarketingMints();
        let _err;
        {
            marketing_minted = _res.toString();
        }
        getTokensRemaining();
    }
    
    async function getTokensRemaining() {
        //ro_punksContract.mintsRemaining().call(function(_err, _res){
        let _res = await ro_punksContract.mintsRemaining();
        let _err;
        {



            tokens_minted = 10000 - _res.toString();
            console.log("DEBUG:", tokens_minted); // 3815

            if(tokens_minted <= 2500) {

                if(!countDownStart){
                    countDownStart = true;
                    startCountDown(2500 - (tokens_minted));
                }
                $('#stageID').html("1");
            } else {
                if(tokens_minted <= 5000){
                    //progress_end = ((1 - ((_res.toString()-2500)/2500)) * 100).toFixed(0);
                    progress_end = ((tokens_minted-2500)/2500 * 100).toFixed(0);
                    //console.log("PROGRESS END:", progress_end, _res.toString());
                    startFullProgress();
                    
                    $('#stageID').html("2");
                    if(!countDownStart){
                        countDownStart = true;
                        startCountDown(5000 - (tokens_minted));
                    }
                } else {
                    if(tokens_minted<= 7500) {

                        progress_end = ((tokens_minted-5000)/2500 * 100).toFixed(0);
                        startFullProgress();

                        $('#stageID').html("3");
                        if(!countDownStart){
                            countDownStart = true;
                            startCountDown(7500 - (tokens_minted));
                        }
                    } else {
                        progress_end = ((tokens_minted-7500)/2500 * 100).toFixed(0);
                        startFullProgress();

                        $('#stageID').html("4");
                        if(!countDownStart){
                            countDownStart = true;
                            startCountDown(10000 - (tokens_minted));
                        }
                    }
                }
            }

            return;

            let _marketingRes = await ro_punksContract.currentMarketingMints();
            
            _res = _res.sub(_marketingRes);

            let percent_progress;

            tokens_minted = 10000 - _res.toString();
            
            if(tokens_minted <= 2500) {
                percent_progress = (tokens_minted / 2500);
                if(!countDownStart){
                    countDownStart = true;
                    startCountDown(2500 - (tokens_minted));
                }
                $('#stageID').html("1");
            } else {
                if(tokens_minted <= 5000){
                    percent_progress = (tokens_minted-2500) / 5000;
                    $('#stageID').html("2");
                    if(!countDownStart){
                        countDownStart = true;
                        startCountDown(5000 - (tokens_minted));
                    }
                } else {
                    if(tokens_minted<= 7500) {
                        percent_progress = (tokens_minted-5000) / 2500;
                        $('#stageID').html("3");
                        if(!countDownStart){
                            countDownStart = true;
                            startCountDown(7500 - (tokens_minted));
                        }
                    } else {
                        percent_progress = (tokens_minted-7500) / 2500;
                        $('#stageID').html("4");
                        if(!countDownStart){
                            countDownStart = true;
                            startCountDown(10000 - (tokens_minted));
                        }
                    }
                }
            }
            
          

            let display_percent = percent_progress;

            if (display_percent > 0.99)
                display_percent = 0.99;

            if(display_percent < 0.01)
                display_percent = 0.01;

            console.log("DISPLAY %:", display_percent);
              
            if(document.getElementById('progressBar')){
                bar.animate(display_percent);  // Number from 0.0 to 1.0
                setTimeout(function(){ updateProgressBar();}, 30000);
            }
            
        };

    }
}

function verifiedContract() {
    window.open("htps://polygonscan.com/address/" + punks_contract_addr, '_blank').focus();
}
function viewPunks() {
//    window.open('https://opensea.io/' + selectedAccount, '_blank').focus();
    document.location.href="/punks2/owned.html?owner=" + selectedAccount;
}
function viewCollection() {
    window.open('https://opensea.io/collection/cryptopunks2-v2', '_blan').focus();
}

async function checkConnection() {
    const providerOptions = {
        // see https://github.com/Web3Modal/web3modal#provider-options
      };
    
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
        providerOptions
      });
    
      try{
      provider = await web3Modal.connect();
      } catch(e){

      }
    
      //chainId = provider.chainId;
      if(provider){
        const ethersProvider = new ethers.providers.Web3Provider(provider);
        chainId = ethersProvider.chainId;
        fetchAccountData();
      }

}
function checkAccount() {
    
    console.log("selectedAccount:",selectedAccount);
    if(selectedAccount){
        if(!isMobile){
        if(chainId != required_chainId ) {
            // show ETH or BSC options if connected to one of those chains...
            
            alert("You are not connected to the correct chain! Please switch your wallet to: Polygon Mainnet" );
            selectedAccount = null;
            return;
        }
        }


        $('#shareURL').val("https://CryptoPunks2.com/?ref=" + selectedAccount);

        $('#connectedAddress').html(selectedAccount);
        $('#connectedAddressShort').html(selectedAccount.substring(0,8));

        $("#connected").removeClass("hide");
        $("#prepare").addClass("hide");
        $("#connected2").removeClass("hide");
        $("#prepare2").addClass("hide");


        // setup contracts...
        //let web3 = new Web3(provider);
        const web3 = new ethers.providers.Web3Provider(provider);
        const signer = web3.getSigner();
        //const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner()

        //punks2Contract = new web3.eth.Contract(punks2Abi.abi, punks_contract_addr);
        punks2Contract = new ethers.Contract(punks_contract_addr, punks2Abi.abi, signer);

        punks2Contract.connect(signer);



        if(!controlLoopStarted) {
            controlLoopStarted = true;
            setTimeout(function(){
                controlLoop();
            },1000);



        }

    } else {
        $('#shareURL').val("Connect Wallet to Reveal");
        $('#connectedAddress').html("");
        $('#connectedAddressShort').html("");
    
    
        $("#connected").removeClass('hide').addClass("hide");
        $("#connected2").removeClass('hide').addClass("hide");
        $("#prepare").removeClass("hide");
        $("#prepare2").removeClass("hide");
    
    }
}
function controlLoop() {

    if(!inMint) {
        refreshData();    
    }

    setTimeout(function(){
        controlLoop()
    },15000);

    
}

async function refreshData() {
    // get current price...
    
    let _res = await ro_punksContract.calcMintPrice(1)
    {
        $('#currentPrice').html(_res / 1e18);
        let _numPunks = $('#numberOfPunks').val();
        $('#mintCost').html((_res * _numPunks) / 1e18);

        $('#pbucksAirdropAmount').html(numberWithCommas(1000000 * _numPunks));

    }

    _res = await ro_punksContract.balanceOf(selectedAccount)
    {
            $('#punks2Balance').html(_res.toString());
    };

}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function mintPunks2() {
    inMint = true;
    if(isMobile) {
        setTimeout(function(){ doMint()}, 1000);
    } else {
        doMint();
    }
}
async function doMint() {


    
    let _numPunks = $('#numberOfPunks').val();
    if(_numPunks > 500) {
        inMint = false;
        alert("Max 500 PUNKS2 per Mint Transaction!");
        return;
    }

    let _mintPrice = await ro_punksContract.calcMintPrice(_numPunks);

    if(!isAddress(referer)) {
        referer = "0x0000000000000000000000000000000000000000";
    }
    let mintMatic = (_mintPrice/1e18).toString();
    console.log(mintMatic);

    //                

    toastMessage("Sending transaction for your wallet to approve", "Minting transaction");

    let _gas;
    try{
        _gas = await punks2Contract.estimateGas.mint(_numPunks, referer, {
        from: selectedAccount,
        value: 
        ethers.utils.parseEther(mintMatic.toLocaleString('fullwide', {useGrouping:false}))
    });
    } catch(e) {
        inMint = false;
        toastMessage("A problem with your transaction occured - please check you have the required MATIC and try again", "CryptoPunks2");
        return;
    }

    _gas = (_gas *1.5).toFixed(0);
    
    console.log("GAS:", _gas);
    console.log("GAS PRICE:", gasPrice);
    try{

        let _res = await punks2Contract.mint(_numPunks, referer, {
            from: selectedAccount,
            value: 
            ethers.utils.parseEther(mintMatic.toLocaleString('fullwide', {useGrouping:false})),
            //,
            gasLimit: _gas,
            gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei')

        });

        {
            
            inMint = false;
            toastMessage("You now own new Crypto Punks 2!", "Minting Complete");

        }
    } catch(e) {
        inMint = false;
        //if(isMobile)
        //    toastMessage("A problem with your transaction occured - please check you have the required MATIC and try again: " + e , "CryptoPunks2");
        //else
            toastMessage("A problem with your transaction occured - please check you have the required MATIC and try again" , "CryptoPunks2");

    }

    fbq('track', 'InitiateCheckout', {
        value: 20 * _numPunks,
        currency: 'USD',
        });
    console.log("Event sent");

}



// wallet connect function

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
 async function fetchAccountData() {

    // this is where the magic happens
    //const ethersProvider = new ethers.providers.Web3Provider(provider);
    chainId = provider.chainId;
    selectedAccount = accounts[0]; // provider.selectedAddress;
    checkAccount();
    return;
    
    // Get a Web3 instance for the wallet

    const web3 = new Web3(provider);
  
    console.log("Web3 instance is", web3);
  
    // Get connected chain id from Ethereum node
    chainId = await web3.eth.getChainId();
    console.log("CHAIN ID:", chainId);
    // Load chain information over an HTTP API
    const chainData = evmChains.getChain(chainId);

    console.log("NET NAME:", chainData.name);

    // Get list of accounts of the connected wallet
    //const accounts = await web3.eth.getAccounts();
  
    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];
  
    //document.querySelector("#selected-account").textContent = selectedAccount;

    checkAccount();

  }
  
  
  
  /**
   * Fetch account data for UI when
   * - User switches accounts in wallet
   * - User switches networks in wallet
   * - User connects wallet initially
   */

  async function refreshAccountData() {
  
    // If any current data is displayed when
    // the user is switching acounts in the wallet
    // immediate hide this data


    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    //document.querySelector("#walletConnect").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    //document.querySelector("#walletConnect").removeAttribute("disabled")
  }
  
  
  /**
   * Connect wallet button pressed.
   */
  
  async function onConnect() {
  
    if (window.ethereum) {
        try {
          accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          //setAccounts(accounts);

        } catch (error) {
          if (error.code === 4001) {
            // User rejected request
          }
      
          console.log("DENIED:", error);

          return;
        }
    }
    provider = window.ethereum;
    fetchAccountData();
return;

    console.log("Opening a dialog", web3Modal);
    try {
      provider = await web3Modal.connect();
      await provider.enable();
      alert("ONCONNECT2", provider);
      console.log("PROV ON CONN:", provider);
    } catch(e) {
      console.log("Could not get a wallet connection", e);
      return;
    }
  
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        alert("ONCONNECT3");
      fetchAccountData();
    });
  
    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
        alert("ONCONNECT4");
      fetchAccountData();
    });
  
    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
        alert("ONCONNECT5");
      fetchAccountData();
    });
  
    await refreshAccountData();
  }
  
  /**
   * Disconnect wallet button pressed.
   */
  async function onDisconnect() {
  
    console.log("Killing the wallet connection", provider);
  
    // TODO: Which providers have close method?
    if(provider.close) {
      await provider.close();
  
      // If the cached provider is not cleared,
      // WalletConnect will default to the existing session
      // and does not allow to re-scan the QR code with a new wallet.
      // Depending on your use case you may want or want not his behavir.
      await web3Modal.clearCachedProvider();
      provider = null;
    }
  
    selectedAccount = null;
  
    checkAccount();
  }


  // UTILS


function encryptRef() {
    var k = CryptoJS.enc.Hex.parse('FvT7qKMVmCCEzrS33ST8UkHE8spZcSrhc2r7eEstC4r2k7m4Gu8HF4UrZALQPLUx');
    var e = CryptoJS.AES.encrypt(selectedAccount, k, { mode: CryptoJS.mode.ECB });
    return e.toString();
}
function decryptRef(_ref){

    if (_ref.substring(0, 2) == "00") {
        _ref = _ref.substring(2);
        var k = CryptoJS.enc.Hex.parse('FvT7qKMVmCCEzrS33ST8UkHE8spZcSrhc2r7eEstC4r2k7m4Gu8HF4UrZALQPLUx');
        return CryptoJS.AES.decrypt(_ref.toString(), k, { mode: CryptoJS.mode.ECB }).toString(CryptoJS.enc.Utf8);
    } else {
        return _ref;
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
function isAddress(address) {
    return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}

function toastMessage(_msg, _header, _timeout) {
    $.toast({
        text: _msg, // Text that is to be shown in the toast
        heading: _header|| 'Miner Networks', // Optional heading to be shown on the toast
        showHideTransition: 'fade', // fade, slide or plain
        allowToastClose: true, // Boolean value true or false
        hideAfter: _timeout||6000, // false to make it sticky or number representing the miliseconds as time after which toast needs to be hidden
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
    }
}

