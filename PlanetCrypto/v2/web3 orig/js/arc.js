

//console.log("document1", document.documentElement.innerHTML.replace(/\s/g,''));
//console.log("document1", md5(document.documentElement.innerHTML.replace(/\s/g,'')));

//427bd3166d7a3070c1c82e02f8227e50



//console.log("document2", document.documentElement.innerHTML.replace(/\s/g,''));

//console.log("document2 md5", md5('<html>' + document.documentElement.innerHTML.replace(/\s/g,'') + '</html>'));


// then submit high score with result of hashIt()
// server can validate hashIt() but user cant because token part changes each page load
// but user can request the hashIt() js and then hash the main page and send false hs...
// they can use curl to set the referer too...


// user has to login with wallet which is a signed hashIt call
// --- can be faked too

// aim to to guarantee the HS submitted at the end is from a validated source code
// load full js into one file
// record all game actions
// log to ipfs
// upload HS + ipfs hash
// risks:
// js could be hacked to slow game down



// page js loaded and is different each load...
// BUT: player loads in browser and has a valid hash to use when calling send HS!?!?
// How can we prevent them using that with curl etc???
// need to tie up the POST with a request


// hashIt() has to be tied into the main page request


// submit credit purchase, receive tx

//document.writeln('<script src="http://127.0.0.1:81/requireJS"></script>');


var _walletAddr = '0x000000';
var _highScore = 0;
var _gid = 1;

$.post({
  type: "POST",
  url: "http://127.0.0.1:81/processHighScore",
  data: {auth: hashIt(), walletAddr: _walletAddr, hs: _highScore, gid: _gid},
  success: function(result){ console.log("result", result);}
});


//console.log("document2",md5(document.documentElement.innerHTML + token()));


/*
var _auth = "";

$.ajax({
  url: "http://127.0.0.1:81/requestAuth/0x0000000",
  success: function(d){
	//console.log("response",d);
	var _json = JSON.parse(d);
	//document.writeln('<script type="text/javascript">');
	//document.write('var _auth="');
	//document.write(_json.authToken);
	//document.writeln('";'); // this changes the md5 hash and would be different for each request
	//document.writeln('<\/script>');

	_auth = _json.authToken;

	console.log("document2", document.documentElement.innerHTML);

	//console.log("document2",md5(document.documentElement.innerHTML));
	console.log("document2",md5(document.documentElement.innerHTML + _auth));


	
  }
});
*/




// request a new auth code from our API at game start or page serve
// we will be able to calculate the new hash server side
// someone trying to fake/inject js wont have access to the _auth value and the new hash
// - so wont be able to pass the auth test when sending through a high score




//139717333886dbca7dd7f24bce7eade2
