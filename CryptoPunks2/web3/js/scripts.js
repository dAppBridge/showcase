/*!
* Start Bootstrap - Freelancer v7.0.4 (https://startbootstrap.com/theme/freelancer)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-freelancer/blob/master/LICENSE)
*/
//
// Scripts
// 

const attributes = ["Zombie","Alien","Ghost","Black Lipstick","Red Lipstick","Smile","Teeth Smile","Purple Lipstick","Nose Ring","Asian Eyes","Sun Glasses","Yellow Glasses","Round Eyes","Square shades","Left Earring","Right Earring","Two Earrings","Brown Beard","Mustache-Beard","Mustache","Regular Beard","Muttonchops","Mutttonchops Black","Red Mahwak", "Pink Spikes", "Purple Hair", "Green Mahawk", "Red Fuzz", "Bubble Hair", "Emo Hair", "Thin Hair", "Bald", "Blonde Hair", "Messy Hair", "Pony Tails", "Tinfoil hat","Cig","Facemask","Chinmask","Space Helmet"];

var ro_web3Provider;
var ro_Conn;
var ro_punksContract;
const ro_CONNECTION_TO_USE = "https://polygon-rpc.com";
const punks_contract_addr ="0xc02d332AbC7f9E755e2b1EB56f6aE21A7Da4B7AD"; 



const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;

// Web3modal instance
let web3Modal

// Chosen wallet provider given by the dialog window
let provider;


// Address of the selected account
let selectedAccount;



window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 72,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    init();
    document.querySelector("#walletConnect").addEventListener("click", onConnect);
});


let referer = "";
let id = "";
let origId = 0;
function viewPunk() {
  console.log(id);
  window.open('https://opensea.io/assets/matic/0xc02d332abc7f9e755e2b1eb56f6ae21a7da4b7ad/' + origId, '_blank').focus();
}
function viewCollection() {
  window.open('https://opensea.io/collection/cryptopunks2-v2', '_blank').focus();
}
function viewOnOpenSea() {
  window.open('https://opensea.io/assets/matic/0xc02d332abc7f9e755e2b1eb56f6ae21a7da4b7ad/' + origId, '_blank').focus();
}
function viewOnLootex() {
  window.open('https://lootex.io/assets/0xc02d332abc7f9e755e2b1eb56f6ae21a7da4b7ad/' + origId, '_blank').focus();
}

let _startScore = 0;
function scrollRarity(_score) {
  $('#rarityScore').html(_startScore);
  _startScore++;
  if(_startScore<=_score) {
    setTimeout(function(){ scrollRarity(_score);},50);
  }
}

function init() {

    id = getUrlParameter("id")||"";
    origId = Number(id);

    $(document).prop('title', 'Crypto Punks 2 ~ Punks #' + id);
    document.querySelector('#viewOnOpenSea').addEventListener("click", viewOnOpenSea);
    document.querySelector('#viewOnLootex').addEventListener("click", viewOnLootex);
    
    addthis_share.url = "https://CryptoPunks2.com/punks2/?id=" + id;
    addthis_share.title = "Crypto Punks2 #" + id;
    addthis_share.media = "https://CryptoPunks2.com/punks2/img/image" + id + ".png";

    $('#punks2Img').attr("src", "/punks2/img/image" + id + ".png");
    
    $('#dispalyID').html(id);

    setupReadOnlyWeb3(getPunkDetails);

    let query = "https://api.cryptopunks2.com/punks2/" + id;

    httpGetAsync(query,function(data) {
      console.log("API RESPONSE:", data);
      let attributesHTML = "";
      let totalMints = parseInt(data.totalMints);
      let bgColor;
      let gender;
      let rarityScore;
      $('#level').html("LEVEL " + data.attributes[0].value);
      for(let i=1; i< data.attributes.length; i++) {
        console.log("ATTR:", data.attributes[i].value);
        if(data.attributes[i].trait_type == "Rarity Score") {
          rarityScore = data.attributes[i].value;
          scrollRarity(rarityScore);
          continue;
        }
        if(data.attributes[i].trait_type == "type") {
          gender = data.attributes[i].value;
          continue;
        }

        if(data.attributes[i].value.indexOf("Background") > 0) {
          bgColor = data.attributes[i].value;
          continue;
        }
        let attr_id = data.attributes[i].attribute_id;
        let attr_usage = 0;
        for(let c=0; c< data.attributeCounters.length; c++){
          
          if(data.attributeCounters[c].attribute_id == attr_id) {
            attr_usage = parseInt(data.attributeCounters[c].total_usage);
            break;
          }
        }

        let rarityLabel = "";
        if(attr_usage > 0) {
          rarityLabel =  "<br/><span class=\"rarityLabel\">(" + ((attr_usage/totalMints)*100).toFixed(2) + "% have this attribute!)</span>";
        }
        attributesHTML += "<div class=\"attributeBadge\">" + data.attributes[i].value + " " + rarityLabel + "</div>";
      }

      let attributesCountRarityLabel  = "<br/><span class=\"rarityLabel\">(" + ((data.attributeCountUsage/totalMints)*100).toFixed(2) + "% have this count!)</span>";
      attributesHTML += "<div class=\"attributeBadgeClean\">Attribute Count: " + data.attributeCounters.length + " " + attributesCountRarityLabel + "</div>";

      let genderRarityLabel  = "<br/><span class=\"rarityLabel\">(" + ((data.genderUsage/totalMints)*100).toFixed(0) + "% have this attribute!)</span>";
      attributesHTML += "<div class=\"attributeBadgeOther\">" + gender + " " + genderRarityLabel + "</div>";

      


      let bgType;
      if(data.background_color == "b7d3ef") {
        // standard bg
        $('#punks2Img').addClass("standardBackground");
        $('#bgType').addClass('hide');
        bgType = "Standard Background";
      } 
      if(data.background_color == "f7df6d") {
        // gold bg
        $('#punks2Img').addClass("goldBackground");
        $('#bgType').html("GOLD BACKGROUND!");
        $('#bgType').addClass("goldBackground");
        bgType = "Gold Background";
      } 
      if(data.background_color == "d9d9d9") {
        // silver bg
        $('#punks2Img').addClass("silverBackground");
        $('#bgType').html("SILVER BACKGROUND!");
        $('#bgType').addClass("silverBackground");
        bgType = "Silver Background";

      } 
      let bgRarityLabel  = "<br/><span class=\"rarityLabel\">(" + ((data.bgUsage/totalMints)*100).toFixed(2) + "% have this attribute!)</span>";
      attributesHTML += "<div class=\"attributeBadgeOther\">" + bgType + " " + bgRarityLabel + "</div>";

      $('#attributes').html(attributesHTML);

    });

    
return;

    // now query owner + traits...
    if(id >0 && id < 10001) {
      let output =   {
          "description": "The next generation of Punks!", 
          "external_url": "https://cryptopunks2.com/punks2/?id=" + id, 
          "image": "https://cryptopunks2.com/punks2/img/image" + id + ".png", 
          "name": "Crypto Punks2 #" + id,
          "background_color": chars[id].background_color,
          "attributes": [] 
      };
      
      

      id--;
      let attributesHTML = "<div class=\"attributeBadge\">" + chars[id].gender + "</div>";


      let bgType;
      if(chars[id+1].background_color == "b7d3ef") {
        // standard bg
        $('#punks2Img').addClass("standardBackground");
        $('#bgType').addClass('hide');
        bgType = "Standard Background";
      } 
      if(chars[id+1].background_color == "f7df6d") {
        // gold bg
        $('#punks2Img').addClass("goldBackground");
        $('#bgType').html("GOLD BACKGROUND!");
        $('#bgType').addClass("goldBackground");
        bgType = "Gold Background";
      } 
      if(chars[id+1].background_color == "d9d9d9") {
        // silver bg
        $('#punks2Img').addClass("silverBackground");
        $('#bgType').html("SILVER BACKGROUND!");
        $('#bgType').addClass("silverBackground");
        bgType = "Silver Background";

      } 


      if(chars[id].attributes){
          for(let c=0; c< chars[id].attributes.length; c++) {
            attributesHTML += "<div class=\"attributeBadge\">" + attributes[chars[id].attributes[c]] + "</div>";
          }
      }
      attributesHTML += "<div class=\"attributeBadge\">" + bgType + "</div>";

      console.log(attributesHTML);
      $('#attributes').html(attributesHTML);
      
    }

    

    

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
    

    console.log("Initializing example");
    console.log("WalletConnectProvider is", WalletConnectProvider);
    console.log("Fortmatic is", Fortmatic);
    console.log("window.web3 is", window.web3, "window.ethereum is", window.ethereum);
  
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

  
async function setupReadOnlyWeb3(_callback) {
    // READ ONLY CONNECTION...
    //console.log("READONLY SETUP", CONNECTION_TO_USE);
    ro_web3Provider = new Web3.providers.HttpProvider(ro_CONNECTION_TO_USE);


    ro_Conn = await  new Web3(ro_web3Provider);
    ro_punksContract = new ro_Conn.eth.Contract(punks2Abi.abi, punks_contract_addr);

    if(_callback)
      _callback();

    return;

}

async function getPunkDetails() {
  console.log("origId:",origId);
  ro_punksContract.methods.ownerOf(origId).call(function(_err, _res) {
    console.log("OWNER:", _res, _err);


    $('#ownershipAddress').html(_res.substring(0,6) + "..." + _res.substring(_res.length-4));
    $('#ownershipAddress').attr('href', './owned.html?owner=' + _res);
  });
}
/**
 * Kick in the UI action after Web3modal dialog has chosen a provider
 */
async function fetchAccountData() {

    // Get a Web3 instance for the wallet
    const web3 = new Web3(provider);
  
    console.log("Web3 instance is", web3);
  
    // Get connected chain id from Ethereum node
    const chainId = await web3.eth.getChainId();
    // Load chain information over an HTTP API
    const chainData = evmChains.getChain(chainId);
    //document.querySelector("#network-name").textContent = chainData.name;
    console.log("NET NAME:", chainData.name);

    // Get list of accounts of the connected wallet
    const accounts = await web3.eth.getAccounts();
  
    // MetaMask does not give you all accounts, only the selected account
    console.log("Got accounts", accounts);
    selectedAccount = accounts[0];
  
    //document.querySelector("#selected-account").textContent = selectedAccount;
    $('#shareURL').val("https://CryptoPunks2.com/?ref=" + selectedAccount);
    console.log("SELECTED ACC:", selectedAccount);

    // Get a handl
    //const template = document.querySelector("#template-balance");
    //const accountContainer = document.querySelector("#accounts");
  
    // Purge UI elements any previously loaded accounts
    //accountContainer.innerHTML = '';
  
    // Go through all accounts and get their ETH balance
  /*
    const rowResolvers = accounts.map(async (address) => {
      const balance = await web3.eth.getBalance(address);
      // ethBalance is a BigNumber instance
      // https://github.com/indutny/bn.js/
      const ethBalance = web3.utils.fromWei(balance, "ether");
      const humanFriendlyBalance = parseFloat(ethBalance).toFixed(4);
      // Fill in the templated row and put in the document
      const clone = template.content.cloneNode(true);
      clone.querySelector(".address").textContent = address;
      clone.querySelector(".balance").textContent = humanFriendlyBalance;
      accountContainer.appendChild(clone);
    });
  */

    // Because rendering account does its own RPC commucation
    // with Ethereum node, we do not want to display any results
    // until data for all accounts is loaded
   // await Promise.all(rowResolvers);
  
    // Display fully loaded UI for wallet data
    document.querySelector("#prepare").style.display = "none";
    document.querySelector("#connected").style.display = "block";
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
    document.querySelector("#connected").style.display = "none";
    document.querySelector("#prepare").style.display = "block";
  
    // Disable button while UI is loading.
    // fetchAccountData() will take a while as it communicates
    // with Ethereum node via JSON-RPC and loads chain data
    // over an API call.
    document.querySelector("#walletConnect").setAttribute("disabled", "disabled")
    await fetchAccountData(provider);
    document.querySelector("#walletConnect").removeAttribute("disabled")
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
  
    // Set the UI back to the initial state
    document.querySelector("#prepare").style.display = "block";
    document.querySelector("#connected").style.display = "none";
  }


  /** 
   * Util functions
   */
   function copy(element) {
    return function() {
          document.execCommand('copy', false, element.select());
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
function isAddress(address) {
    return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}

function toastMessage(_msg, _header, _timeout) {
    $.toast({
        text: _msg, // Text that is to be shown in the toast
        heading: _header|| 'CRYPTO PUNKS 2', // Optional heading to be shown on the toast
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
