
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
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;
let chainId;

let required_chainId = 137; //80001 for testnet

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
	var isMobileCheck = window.matchMedia("only screen and (pointer:coarse)");
	if(isMobileCheck.matches){
		isMobile = true;
	}

    startScroller();

    setupReadOnlyWeb3(setupProgressBar);

    for(let i=1; i< 31; i++)
        document.querySelector("#article" + i).addEventListener("click", viewPunk);

    document.querySelector("#connectWallet").addEventListener("click", onConnect);
    
    document.querySelector("#mintPunks2").addEventListener("click", mintPunks2);
    document.querySelector('#yourPunks2Btn').addEventListener("click",viewPunks);
    //document.querySelector('#viewCollection').addEventListener('click', viewCollection);
    var _newReferer = getUrlParameter('ref')||"";
    if(_newReferer.length > 0) { // newly referred
        referer = _newReferer;
    } else { // existing user referred by someone
        let _cookieRef = Cookies.get('ref')||"";
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

    
    
    var shareUrl = document.querySelector('#shareURL');
    var copyShareUrl = copy(shareUrl);

    shareUrl.addEventListener('click', function(){copyShareUrl();toastMessage("Your REF URL has been copied to your clipboard ready for you to share!");}, false);
    
  
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
          infuraId: "8043bb2cf99347b1bfadfb233c5325c0",
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
    checkConnection();
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
    ro_web3Provider = new Web3.providers.HttpProvider(ro_CONNECTION_TO_USE);


    ro_Conn = await  new Web3(ro_web3Provider);
    ro_punksContract = new ro_Conn.eth.Contract(punks2Abi.abi, punks_contract_addr);

    if(_callback)
      _callback();

    setupLatest();

    return;

}

const  queryBlocks = 5000;
const minBlock = 20346370;
let currentBlock = 0;
var inMint = false;
async function setupLatest() {
    ro_Conn.eth.getBlockNumber(function(_err,_res){
        console.log("BLOCK:", _res);
        currentBlock = Number(_res);
        queryLatestMints(currentBlock);
      });
}

let punksSet = 0;
async function queryLatestMints(fromBlock) {
    let _endBlock = fromBlock;
    let _startBLock = fromBlock - queryBlocks;
    ro_punksContract.getPastEvents("Mint", {"fromBlock": _startBLock, "toBlock": _endBlock}, function(_err, _res){
        for(let i=0; i < _res.length ; i++) {
          let _tokenID = _res[i].returnValues[0];
          let _idx = i+1;
          punksSet++;
          $('#article' + punksSet).attr('tokenid', _tokenID);

          $('#article' + punksSet).css("background", "#" + chars[_tokenID].background_color + " url('/punks2/img/image" + _tokenID + ".png') center 10px/50px no-repeat");
          $('#article' + punksSet + 'caption').html("#" + _tokenID);
          //console.log('#article' + punksSet, "url('/punks2/img/image" + _tokenID + ".png') center center no-repeat");
          //console.log("NEW MINT:", _tokenID);
        }
        if(_startBLock > minBlock && punksSet < 31){
            if(inMint) {
                setTimeout(function(){queueQueryLastMints(_startBLock+1);}, 2000);
            } else {
                queryLatestMints(_startBLock-1);
            }
        }
    });

}
function queueQueryLastMints(fromBlock) {
    if(inMint) {
        setTimeout(function(){queueQueryLastMints(fromBlock+1);}, 2000);
    } else {
        queryLatestMints(fromBlock-1);
    }

}

function viewPunk(e) {
    let _id = $(this).attr("tokenid");
    if(_id == 0) 
        return;
    document.location.href="/punks2/?id=" + _id;
}

let bar;
function setupProgressBar() {
    if($('#progressBar').length){
        console.log($('#progressBar'));
        bar = new ProgressBar.Line('#progressBar', {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: '#883ca3',
        trailColor: '#222',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        text: {
          style: {
            // Text color.
            // Default: same as stroke color (options.color)
            fontWeight: 'bolder',
            color: '#000',
            position: 'absolute',
            right: '0',
            top: '-12px',
            padding: 0,
            margin: 0,
            transform: null
          },
          autoStyleContainer: false
        },
        from: {color: '#FFEA82'},
        to: {color: '#c889cc'},
        step: (state, bar) => {
          bar.setText(Math.round(bar.value() * 100) + ' %');
        }
        });
    }
    updateProgressBar();
}
function updateProgressBar() {
    let tokens_minted = 0;

    getTokensRemaining();
    function getTokensRemaining() {
        ro_punksContract.methods.mintsRemaining().call(function(_err, _res){
            

            let percent_progress;

            tokens_minted = 10000 - _res;

            if(tokens_minted <= 2500) {
                percent_progress = (tokens_minted / 2500);
                $('#stageID').html("1");
            } else {
                if(tokens_minted <= 5000){
                    percent_progress = (tokens_minted-2500) / 2500;
                    $('#stageID').html("2");
                } else {
                    if(tokens_minted<= 7500) {
                        percent_progress = (tokens_minted-5000) / 2500;
                        $('#stageID').html("3");
                    } else {
                        percent_progress = (tokens_minted-7500) / 2500;
                        $('#stageID').html("4");
                    }
                }
            }
            
            console.log("TOKENS REMAINING:", _res, tokens_minted);
            
            console.log("% PROGRESS=", percent_progress);    
            

          

            let display_percent = percent_progress;

            if (display_percent > 0.99)
                display_percent = 0.99;

            if(display_percent < 0.01)
                display_percent = 0.01;

            console.log("DISPLAY %:", display_percent);
              
            bar.animate(display_percent);  // Number from 0.0 to 1.0

            setTimeout(function(){ updateProgressBar();}, 5000);
            
        });

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

function checkConnection() {
    window.web3.currentProvider.enable();
    provider = window.web3.currentProvider;
    fetchAccountData();
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
        fetchAccountData();
      });
    
      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        fetchAccountData();
      });
    
      // Subscribe to networkId change
      provider.on("networkChanged", (networkId) => {
        fetchAccountData();
      });
    console.log("window.web3.currentProvider:", getCurrentProvider(),window.web3.currentProvider);
    const checkConnection = async () => {

        // Check if browser is running Metamask
        let web3;
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            //console.log("ETH:", web3);

        } else if (window.web3) {
            web3 = new Web3(window.web3.currentProvider);
        };

        // Check if User is already connected by retrieving the accounts
        web3.eth.getAccounts()
            .then(async (addr) => {
                // Set User account into state
                console.log("ADDR:", addr);
                selectedAccount = addr[0];
                checkAccount();
            });
    };
    checkConnection();
}
function checkAccount() {
    console.log("selectedAccount:",selectedAccount);
    if(selectedAccount){
        if(chainId != required_chainId) {
            alert("You are not connected to the correct chain! Please switch your wallet to: Polygon Mainnet");
            selectedAccount = null;
            return;
        }
        $('#shareURL').val("https://CryptoPunks2.com/?ref=" + selectedAccount);

        $('#connectedAddress').html(selectedAccount);
        $('#connectedAddressShort').html(selectedAccount.substring(0,8));
        console.log("SELECTED ACC:", selectedAccount);

        $("#connected").removeClass("hide");
        $("#prepare").addClass("hide");
        $("#connected2").removeClass("hide");
        $("#prepare2").addClass("hide");


        // setup contracts...
        let web3 = new Web3(provider);
        punks2Contract = new web3.eth.Contract(punks2Abi.abi, punks_contract_addr);
        
        console.log("punks2 contract:",punks2Contract);


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
    },5000);

    
}

function refreshData() {
    // get current price...
    
    ro_punksContract.methods.calcMintPrice(1).call(function(_err, _res){
        $('#currentPrice').html(_res / 1e18);
        let _numPunks = $('#numberOfPunks').val();
        $('#mintCost').html((_res * _numPunks) / 1e18);

        ro_punksContract.methods.balanceOf(selectedAccount).call(function(_err, _res){

            $('#punks2Balance').html(_res);
        });



    });


}


async function mintPunks2() {
    inMint = true;
    if(isMobile) {
        setTimeout(function(){ doMint()}, 1000);
    } else {
        doMint();
    }
}
function doMint() {

    
    let _numPunks = $('#numberOfPunks').val();
    if(_numPunks > 500) {
        inMint = false;
        alert("Max 500 PUNKS2 per Mint Transaction!");
        return;
    }

    ro_punksContract.methods.calcMintPrice(_numPunks).call(function(_err, _res){


        //$('#mintCost').html((_res) / 1e18);

        if(!isAddress(referer)) {
            referer = "0x0000000000000000000000000000000000000000";
        }
        let mintMatic = (_res);

        if(isMobile)
            toastMessage("Sending the transaction to your wallet.." , "Minting Transaction");    

        try{
            punks2Contract.methods.mint(_numPunks, referer).send({from: selectedAccount, value: mintMatic.toLocaleString('fullwide', {useGrouping:false}) }, function(_err, _res){
                
                inMint = false;
                if(!_err) {
                    toastMessage("You now own a new Crypto Punks 2!", "Minting Complete");
                } else {
                    toastMessage("A problem with your transaction occured - please check you have the required MATIC and try again", "CryptoPunks2");
                }
            });
        } catch(e) {
            if(isMobile)
                toastMessage("Error sending transaction: " + e, "Error");            
        }
    });

}



// wallet connect function

/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
 async function fetchAccountData() {

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
    const accounts = await web3.eth.getAccounts();
  
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
  
    console.log("Opening a dialog", web3Modal);
    try {
      provider = await web3Modal.connect();
    } catch(e) {
      console.log("Could not get a wallet connection", e);
      return;
    }
  
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts) => {
      fetchAccountData();
    });
  
    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      fetchAccountData();
    });
  
    // Subscribe to networkId change
    provider.on("networkChanged", (networkId) => {
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

