const TronWeb = require('tronweb')
const HttpProvider = TronWeb.providers.HttpProvider;
const BigNumber = require('bignumber.js');
const sleep = require('await-sleep');
const async = require("async");


const fullNode = new HttpProvider('https://api.trongrid.io'); // Full node http endpoint
const solidityNode = new HttpProvider('https://api.trongrid.io'); // Solidity node http endpoint
const eventServer = new HttpProvider('https://api.trongrid.io'); // Contract events http endpoint

/*
const fullNode = new HttpProvider('https://api.shasta.trongrid.io'); // Full node http endpoint
const solidityNode = new HttpProvider('https://api.shasta.trongrid.io'); // Solidity node http endpoint
const eventServer = new HttpProvider('https://api.shasta.trongrid.io'); // Contract events http endpoint

*/

const privateKey = '----';
const privateKey2 = '----';
const shastaKey = '----';
const privateKey3 = '----';

const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
);


const planetToken_abi = require("../project/build/contracts/PlanetCryptoToken.json").abi;
const planetToken_orig_abi = require("../project/build/contracts/PlanetCryptoToken_orig.json").abi;

const planetCoin_abi = require("../project/build/contracts/PlanetCryptoCoin.json").abi;
const planetUtil_abi = require("../project/build/contracts/PlanetCryptoUtils.json").abi;
const planetBonus_abi = require("../project/build/contracts/PlanetCryptoEmpireBonus.json").abi;

const initCoins = 100000;

//console.log(tronWeb.address.toHex("TNygrKq5juZ5Rvk8XLyZPCXLj7rNjqVG1T"));
//return;

//console.log(tronWeb.address.toHex("TCcvLXirUSDJ7d4FW3p3JkFu3dMehWF5Ps"));
//console.log(tronWeb.fromSun(6120750000)); // =  6120.75 TRX owed
//return;
async function runRefunds() {

	let contract4 = await tronWeb.contract(planetToken_abi, "TNygrKq5juZ5Rvk8XLyZPCXLj7rNjqVG1T");	

	await contract4.p_update_action(30, "TQtDtpGQuKhJPJxfcpoQtRdL8bNeEDxxE9", tronWeb.toSun(62),"").send(function(results){
			console.log("TQtDtpGQuKhJPJxfcpoQtRdL8bNeEDxxE9", results)
	});
	await contract4.receiveExtraTax(true).send({callValue: TronWeb.toSun(62)}).then(function(results){
	console.log("deposit tax:", results);
	});
}

//runRefunds();

async function mintTokens(_addr, _amnt) {
	let coins_minter = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");
	coins_minter.mint(_addr, _amnt).send().then(function(result){
		console.log("MINT RES:", result);
	});
}


// 800 sent 23 may
// TJpL9RZ2fbaqzaEcvr7Z1CoKHFVyYieh9Z
// due another 400
mintTokens("TJpL9RZ2fbaqzaEcvr7Z1CoKHFVyYieh9Z", 200);

//setupBonus();

return;
// 100.9108
// 100.8788
// 100.86
// 100.806



// crypto future
console.log(tronWeb.address.toHex("TTik4Ef8wsFwoAUDne8ea5RaKDvv8hWamt"));

let _val = 0;
_val += 2400000000;
_val += 100878125 ;
_val += 606150000;
_val += 101171875 ;

console.log(tronWeb.fromSun(_val));
return; // 3208.2 trx owed


//console.log(planetToken_abi);

/*
tronWeb.trx.getTransactionInfo("1c5f5c34f46048cc2e70863c135ef67e8c4c96560443879bff24c7d645d82477").then(function(results){
	console.log("TX:", results);
}).catch(function(err){
	console.log("Err:", err);
});
return;




*/




async function setupBonus() {

	
	let contract3 = await tronWeb.contract(planetToken_abi, "TNygrKq5juZ5Rvk8XLyZPCXLj7rNjqVG1T");		

//current_plot_price 21

//min_plot_price = 24
//current_plot_price = 21
await contract3.p_update_action(24,"410000000000000000000000000000000000000000", tronWeb.toSun(25),"").send().then(function(results){
		console.log(results);
	});
return;


	await contract3.p_update_action(22,"TGNJp4HDScV3t2qjArF1x9U5kFcUCFLNrH", 0,"").send().then(function(results){
		console.log(results);
	});


	

	let bonus = await tronWeb.contract(planetBonus_abi, "TGNJp4HDScV3t2qjArF1x9U5kFcUCFLNrH");// shasta

/*
await bonus.p_update_Owner("TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6").send().then(function(results){
	console.log("UPDATE OWNER:", results);
});
await bonus.p_update_devAccount("TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6").send().then(function(results){
	console.log("UPDATE OWNER:", results);
});
return;
*/

	await bonus.updatePack(0, 500, 5).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(1, 1000, 10).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(2, 2500, 25).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(3, 5000, 50).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(4, 10000, 100).send().then(function (results){
		console.log(results);
	});
	await bonus.p_update_planetCryptoTokenAddress("TNygrKq5juZ5Rvk8XLyZPCXLj7rNjqVG1T").send().then(function (results){
		console.log(results);
	});

	//THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky
	// shasta = THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky
	// mainnet = TEEEQGmbZoeHA24EVG91b6u9zsbWUfefPF
	await bonus.setP3TInterface("TEEEQGmbZoeHA24EVG91b6u9zsbWUfefPF").send().then(function(results){
		console.log(results);
	});


}

//tests();
testShasta();

async function testShasta() {

	
	let contract3 = await tronWeb.contract(planetToken_abi, "TCqF2AVtNrciZLBqhoithaqEuotDqT4Mit");		
	await contract3.p_update_action(22,"TPmfVLESzp4VifZ7UFopuxbu6r6tk2zxkH", 0,"").send().then(function(results){
		console.log(results);
	});
	

	let bonus = await tronWeb.contract(planetBonus_abi, "TPmfVLESzp4VifZ7UFopuxbu6r6tk2zxkH");// shasta

/*
console.log("START:");
await bonus.test().send({callValue: 100}).then(function(results){
console.log("RES:", results);
}).catch(function(err){
	console.log("ERR:", err);
});
return;
*/
	await bonus.updatePack(0, 500, 5).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(1, 1000, 10).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(2, 2500, 25).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(3, 5000, 50).send().then(function (results){
		console.log(results);
	});
	await bonus.updatePack(4, 10000, 100).send().then(function (results){
		console.log(results);
	});
	await bonus.p_update_planetCryptoTokenAddress("TCqF2AVtNrciZLBqhoithaqEuotDqT4Mit").send().then(function (results){
		console.log(results);
	});

	//THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky
	// shasta = THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky
	// mainnet = TEEEQGmbZoeHA24EVG91b6u9zsbWUfefPF
	await bonus.setP3TInterface("THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky").send().then(function(results){
	console.log(results);
	});

}

async function tests() {
	/*
	console.log(tronWeb.address.toHex("TNE3dZuxpsmJSb7ToLk2W615yRxwAXHsny")); // coins shasta = 41866fed3cbc7477bb8ca0c5499c26ee733e457d39
	//console.log("PRICE:", tronWeb.fromSun(1));
	return;
	*/

// founder 

/*
	await tronWeb.trx.getTransactionInfo("e2cf88e97f50fb77429ec2193f5eb3d05e0b9522bd2271109d98e1d1e8fa2509").then(function(results){
		console.log("RESULTS:", results);
	});
	return;
*/


/*
shashta
	let contractAddr = "TRi7TL6bn6zFTsnyjjXrFxesEoXktBAKUQ";


	let utils2 = await tronWeb.contract(planetUtil_abi, "THXUi5qHMGX87pczQy3J4veKfoFcY7CKuw");
	let contract2 = await tronWeb.contract(planetToken_abi, contractAddr);// shasta
	let coins2 = await tronWeb.contract(planetCoin_abi, "TPcmPD1pTSnk8NVDbCpW26im69PLMFfhrk");
*/

/*
mainnet
*/

//console.log(tronWeb.toSun(1));
//return;
	let contractAddr = "TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw";
	//contractAddr = "TCqF2AVtNrciZLBqhoithaqEuotDqT4Mit"; // shasta
	contractAddr = "TNygrKq5juZ5Rvk8XLyZPCXLj7rNjqVG1T"; // live NEW



	let coinsAddr = "TPcmPD1pTSnk8NVDbCpW26im69PLMFfhrk";
	coinsAddr = "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz"; // live

	let utils2 = await tronWeb.contract(planetUtil_abi, "TH7qWHoMYckge1HAxRd1BkbzCsJgfbFyBk");
	//let utils2 = await tronWeb.contract(planetUtil_abi, tronWeb.address.fromHex("4152e34d96cf0df3902583896c92d44023ba98a485")); // shasta
	
	let contract2 = await tronWeb.contract(planetToken_abi, contractAddr);	
	//let coins2 = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");
	let coins2 = await tronWeb.contract(planetCoin_abi, coinsAddr); // shasta


//console.log(tronWeb.address.toHex("TXuzyteaqBAo8vrNzAD1ECmBSzp9jYWWt8"));
//return;

// owed: 121c0068
//TSHFEtDJcVz7Q2HnfGEn9tywamezMZCGnG

/*
console.log(tronWeb.fromSun(parseInt("121c0068",16)));

await contract2.p_update_action(30, "TSHFEtDJcVz7Q2HnfGEn9tywamezMZCGnG", tronWeb.toSun(303),"").send(function(results){
		console.log("TSHFEtDJcVz7Q2HnfGEn9tywamezMZCGnG", results)
});
await contract2.receiveExtraTax(true).send({callValue: TronWeb.toSun(303)}).then(function(results){
console.log("deposit tax:", results);
});
return;

return;
*/
// inc players tax = 30
// TPggnExBXSmFnhX7zQwE1siCzo7AuGtt4j
/*
await contract2.p_update_action(30, "TQ2YjDbVerHzsT3LBBEkGA3fHcR23MN3XH", tronWeb.toSun(314),"").send(function(results){
		console.log("TQ2YjDbVerHzsT3LBBEkGA3fHcR23MN3XH", results)
});
return;
*/
/*
await contract2.p_update_action(30, "TEe9KmZx7cwppv2pqxAndaNZ44dsC3DtK8", tronWeb.toSun(628),"").send().then(function(results){
		console.log("TEe9KmZx7cwppv2pqxAndaNZ44dsC3DtK8", results)
});

await contract2.p_update_action(30, "TPggnExBXSmFnhX7zQwE1siCzo7AuGtt4j", tronWeb.toSun(5722),"").send().then(function(results){
	console.log("TPggnExBXSmFnhX7zQwE1siCzo7AuGtt4j", results)
});


//await contract2.p_update_action(30, "TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6", tronWeb.toSun(314),"").send(function(results){
//	console.log("", results)
//});

await contract2.p_update_action(30, "TRC1hwc1JaBL9kGp6wFYYCXUF4FVinpqbV", tronWeb.toSun(942),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TMyy96xGaViFPgEs237Bujxxz13CsdSr8p", tronWeb.toSun(314),"").send().then(function(results){
		console.log("", results)
});
//await contract2.p_update_action(30, "TSCUzCqcLjmB1no9L6CNE64kLLyzqXuMJb", tronWeb.toSun(1570),"").send().then(function(results){
//		console.log("", results)
//});
//await contract2.p_update_action(30, "TUYoUEDuGv9xfatSDFzg2ggZ6znjy2eQs9", tronWeb.toSun(3769),"").send().then(function(results){
await contract2.p_update_action(30, "TUYoUEDuGv9xfatSDFzg2ggZ6znjy2eQs9", tronWeb.toSun(2369),"").send().then(function(results){	
		console.log("", results)
});
await contract2.p_update_action(30, "TFY8nd9EJeQNEcavo7wZimBhGus3EYFPS3", tronWeb.toSun(628),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TWQZy2Le1FdGVJJN7FntSiAYrVu8bxYwA3", tronWeb.toSun(314),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TXJitG9Yt9yWnQzG7QDcqFA8wTHWT879hK", tronWeb.toSun(628),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TTik4Ef8wsFwoAUDne8ea5RaKDvv8hWamt", tronWeb.toSun(314),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TFRbDb7R57UaetQXEDjfJ91hGnty3M2CfN", tronWeb.toSun(628),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TQR1YthzAExcEmLbEgP8a71AxaxkFcNMUi", tronWeb.toSun(628),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TDrQgpBvQRqJAMMkkfxPaQeYA7sp4QyZ4f", tronWeb.toSun(314),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TQEfQMrqgEz3u6gnufDnXounsnXqPgUWbB", tronWeb.toSun(314),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TJpL9RZ2fbaqzaEcvr7Z1CoKHFVyYieh9Z", tronWeb.toSun(1070),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TTSCooqQ2oqstxjwAvE2vURnHjhy9jKCgF", tronWeb.toSun(314),"").send().then(function(results){
		console.log("", results)
});

//await contract2.p_update_action(30, "TX3Q32ST38KysfYT344bnfyQAwvowgFhKS", tronWeb.toSun(2198),"").send.then(function(results){
await contract2.p_update_action(30, "TX3Q32ST38KysfYT344bnfyQAwvowgFhKS", tronWeb.toSun(1198),"").send().then(function(results){
		console.log("", results)
});
//await contract2.p_update_action(30, "TRTCVJCxKboQMnvcp5GpSodz9wqszSnsnL", tronWeb.toSun(1570),"").send().then(function(results){
await contract2.p_update_action(30, "TRTCVJCxKboQMnvcp5GpSodz9wqszSnsnL", tronWeb.toSun(1070),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TCxd82wTXV9McykvT3JAYwBpjrAr11Wkh5", tronWeb.toSun(314),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TUGyDEGFpo3USA1MWqyDrojfMkp1ZJkJkY", tronWeb.toSun(1570),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TCcvLXirUSDJ7d4FW3p3JkFu3dMehWF5Ps", tronWeb.toSun(628),"").send().then(function(results){
		console.log("", results)
});
//await contract2.p_update_action(30, "TYDnvPqdFRRPMkSyrcu4RbD7Mzp23uTKuQ", tronWeb.toSun(1256),"").send().then(function(results){
await contract2.p_update_action(30, "TYDnvPqdFRRPMkSyrcu4RbD7Mzp23uTKuQ", tronWeb.toSun(756),"").send().then(function(results){
		console.log("", results)
});
await contract2.p_update_action(30, "TPyYJRMeh1VkLhUs3DvbeKmoFhLwd2j5CP", tronWeb.toSun(942),"").send().then(function(results){
		console.log("", results)
})
await contract2.p_update_action(30, "TKDBwygjKtJtcyhhd6j2iDfd9pCAEZxQoB", tronWeb.toSun(1512),"").send().then(function(results){;
//await contract2.p_update_action(30, "TKDBwygjKtJtcyhhd6j2iDfd9pCAEZxQoB", tronWeb.toSun(2512),"").send(function(results){
		console.log("", results)
});


await contract2.receiveExtraTax(true).send({callValue: TronWeb.toSun(23431)}).then(function(results){
console.log("deposit tax:", results);
});
return;
*/
//= 30,843


/*
//
await coins2.allowance("TAj6ZndpQVxqsMuhK55yFNudGCCSZNLrcy", contractAddr).call().then(function(results){
console.log(results.toNumber());
});
return;
*/

let orig = tronWeb.contract(planetToken_abi, "TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw");

/*
await contract2.p_update_action(0, "TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6",0,"").send();
await contract2.p_update_action(1, "TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6",0,"").send();
await contract2.p_update_action(2, "TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6",0,"").send();
return;
*/
//console.log(tronWeb.toSun(43115));
// 43115000000 SUN AVAIL

let _taxToDivide = new BigNumber(31410145568);

/*
await orig._taxToDivide().call().then(function(results){
	console.log(results.toNumber());
});
*/
/*
await orig.total_empire_score().call().then(function(results){
	console.log(results.toNumber());

});
await contract2.total_empire_score().call().then(function(results){
	console.log(results.toNumber());

});
return;
*/

let _tx = [];
let _currentPage = 0;
let _txAdded = [];
let _fingerPrint = "";
// https://api.trongrid.io/event/contract/TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw/action?since=0&size=50&page=1
const https = require('https');

var _totalOwed = new BigNumber(0);





let origContractAddr = "TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N";
let origContract = await tronWeb.contract(planetToken_orig_abi, origContractAddr);

return;
let alreadyDist = 600; // end of 9 may
	let totalTRX = new BigNumber(0);
populatePlayers();
	function populatePlayers() {


		//let _pricePerPlotSun = 100000000;
		origContract.getAllPlayerObjectLen().call().then(function(results){
			let _len = parseInt(results.toString());
			console.log("SIZE:", _len);


			let count = 0;
			async.whilst(
			    function() { return count < _len; },
			    function(callback) {
			    	console.log("Processing Player:", count);


					let _playerAddress = [];
					let _totalLand = [];
					let _totalEmpireScore = [];
					let _trxOutstanding = [];
					let _activated = [];



					origContract.all_playerObjects(count).call().then(function(results){


						_playerAddress.push(results.playerAddress);
						_totalLand.push(results.totalLand.toNumber());
						_totalEmpireScore.push(results.totalEmpireScore.toNumber());
						


						//_trxOutstanding.push(_sun.times(150).div(100).toNumber());

						//totalTRX = totalTRX.plus(_trxOutstanding[0]);


						if(results.totalLand.toNumber() > 0 && results.totalLand.toNumber() > alreadyDist) {
							console.log("PLAYER GETTING:", results.totalLand.toString(), tronWeb.address.fromHex(results.playerAddress));



							if(results.totalLand.toNumber() > 100) {
								coins2.mint(results.playerAddress, 100).send().then(function(result){
									console.log("MINT:", result);
									count++;
							        setTimeout(function() {
							            callback(null, count);
							        }, 100);
								});
							} else {
								coins2.mint(results.playerAddress, results.totalLand.toNumber()).send().then(function(result){
									console.log("MINT:", result);
									count++;
							        setTimeout(function() {
							            callback(null, count);
							        }, 100);
								});								
							}

						} else {
							count++;
					        setTimeout(function() {
					            callback(null, count);
					        }, 100);
						}


						





					});


			        
			    },
			    function (err, n) {
			        console.log("TOTAL TRX:", tronWeb.fromSun(totalTRX.toString()));
			    }
			);



		});
	}
return;



//console.log(tronWeb.address.toHex("TPggnExBXSmFnhX7zQwE1siCzo7AuGtt4j"));
//return;

/// ALL DONE
/*
// current_plot_price = 21
await orig.p_update_action(21,"410000000000000000000000000000000000000000", tronWeb.toSun(100),"").send().then(function(results){
	console.log(results);
}); 

//m_newPlot_devPercent = 10
await orig.p_update_action(10,"410000000000000000000000000000000000000000", 2000,"").send().then(function(results){
	console.log(results);
}); // = 100 in 10000 trx back?
return;
//m_newPlot_taxPercent = 11
await orig.p_update_action(11,"410000000000000000000000000000000000000000", 1,"").send().then(function(results){
	console.log(results);
});
//m_newPlot_bonusPercent = 25
await orig.p_update_action(25,"410000000000000000000000000000000000000000", 1,"").send().then(function(results){
	console.log(results);
});
//m_newPlot_bonusPotDayDistPercent = 27
await orig.p_update_action(27,"410000000000000000000000000000000000000000", 1,"").send().then(function(results){
	console.log(results);
});
//m_newPlot_bonusPotDayDistPercent = 29
await orig.p_update_action(29,"410000000000000000000000000000000000000000", 1,"").send().then(function(results){
	console.log(results);
});
return;


// temp util = TYX4N6jSdiLBk4yjc45n3JRcTbLLUwsGiT
/// needs its own util and coins instance to use!
await orig.p_update_action(9,"TYX4N6jSdiLBk4yjc45n3JRcTbLLUwsGiT", 0,"").send().then(function(results){
	console.log(results);
});

let utilsTmp = await tronWeb.contract(planetUtil_abi, "TYX4N6jSdiLBk4yjc45n3JRcTbLLUwsGiT");
await utilsTmp.p_update_planetCryptoTokenAddress("TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw").send().then(function(results){
	console.log("RESULTS:", results);
});


return

*/


var _totalTokens;

/*
await orig.updatePlayerEmpireScore("TRVkMHsWLxBddYszrwWa9o8h5es6Kn5wgr",10000,true).send().then(function(results){
    		console.log("RES:", results);
    	}).catch(function(err){
    		console.log("ERR:", err);
    	});
    	return;

*/


var _tokenID = 1;
var _tokens = [];
await orig.tokenIDCount().call().then(function(results){
	_totalTokens = parseInt(results.toString());
});

console.log(_totalTokens);

const fs = require('fs');

let filenameObj = {
	accounts: []
};

let tokensObj = {
	tokens: []
};
//console.log(tronWeb.address.toHex("TUYoUEDuGv9xfatSDFzg2ggZ6znjy2eQs9"));




//allowedExternalContracts
/*
await orig.p_update_action(22, "TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6", 0,"").send().then(function(results){
console.log(results);
});
return;
//
*/
/*
await orig.total_empire_score().call().then(function(results){
	console.log(results.toNumber());
});
return;
*/
/*
await orig.updatePlayerEmpireScore("TE6R9YzKfyo9UsoZfgoS7cbp7nwHEvj4ga",900,false).send().then(function(results){
    		console.log("RES:", results);
    	}).catch(function(err){
    		console.log("ERR:", err);
    	});
return;
*/
// read in tokens_bak.txt

fs.readFile("./tokens_bak.txt", function (err, data) {
	let filenameObj = JSON.parse(data);
    let c = 0;
    async.whilst(
      function() { return c < filenameObj.tokens.length-1; },
      function(async_callback) {

      	//console.log(filenameObj.tokens[c])
      	tokensObj.tokens.push(filenameObj.tokens[c]);
      	c++;
      	async_callback(null);
      }, 
      function(err) {
          if(err)
            console.log(err);
          else
            console.log("Done");

        processTxs();
    }); // END of async.whilst
});

return;


/*
async.whilst(
    function() { return _tokenID < _totalTokens+1; },
    function(callback) {

    	orig.p_update_action(99,"410000000000000000000000000000000000000000", _tokenID,"").send().then(function(results){
    		console.log("RES:", results);
	  		_tokenID++;
	        setTimeout(function() {
	            callback(null, _currentPage);
	        }, 15);
    	}).catch(function(err){

    		console.log("ERR:", err);
	  		_tokenID++;
	        setTimeout(function() {
	            callback(null, _currentPage);
	        }, 15);
    	});


    //	orig.getTokenEnhanced(_tokenID,false).call().then(function(results){
  //  		tokensObj['tokens'].push(results);
//	  		_tokenID++;
//	        setTimeout(function() {
//	            callback(null, _currentPage);
	        }, 15);
    //	}).catch(function(err){
  //  		console.log(err);
//	  		_tokenID++;
//	        setTimeout(function() {
//	            callback(null, _currentPage);
//	        }, 15);
//    	});


    },
    function (err, n) {
        console.log("TOTAL TOKENS:",_tokens.length);
//		fs.writeFile("./tokens.txt", JSON.stringify(tokensObj), function (err) {
//		  if (err) throw err;
//		  console.log('Replaced!');
//		});
        //processTxs();
    }
);
return;
*/

function processTxs(){




	async.whilst(
	    function() { return _currentPage < 20; },
	    function(callback) {
	    	console.log("Processing Page:", _currentPage);
	    	console.log("_Tx len:", _tx.length);


	    	let _start = _currentPage * 50;



			//https.get('https://api.trongrid.io/event/contract/TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw/action?since=0&size=100&page=' + _currentPage + '&previousLastEventFingerprint=' + _fingerPrint, (res) => {
					
			https.get('https://apilist.tronscan.org/api/contracts/transaction?sort=timestamp&count=true&limit=50&start=' + _start + '&contract=TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw', (res) => {
			  //console.log('statusCode:', res.statusCode);
			  //console.log('headers:', res.headers);
	  		  let rawData = '';
	  		  res.on('data', (chunk) => { rawData += chunk; });
			  res.on('end', () => {

			  		let logResults = JSON.parse(rawData);
			    	console.log(logResults.data.length);
			    	

					for(let c=0; c< logResults.data.length;c++){
						//console.log(logResults[c]);

						if(_txAdded.includes(logResults.data[c].txHash)){
						
						c//onsole.log("DUP:", logResults.data[c]);
						} else {
							_txAdded.push(logResults.data[c].txHash);
	/*
							tronWeb.trx.getTransactionInfo("ea5648516f68b90a6cbdee23e5ca17c416871fb3037fd887dcf14b90c729b5d0").then(function(results) {
								_tx.push(results);
								console.log(results);
							})
	*/
							_tx.push(logResults.data[c]);						
						}

					}


					_currentPage++;
			        setTimeout(function() {
			            callback(null, _currentPage);
			        }, 15);

			  });

			}).on('error', (e) => {
			  		console.error(e);
			  		_currentPage++;
			        setTimeout(function() {
			            callback(null, _currentPage);
			        }, 15);
			});



	        
	    },
	    function (err, n) {
	        console.log("TOTAL PAGE:",_currentPage);
	        console.log(_tx.length);

	        processPlayersResults();
	    }
	);
}

/*
{ block: 8990685,
       call_data: '427bb6fe',
       confirmed: true,
       ownAddress: 'TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6',
       ownAddressType: 'IntendedLeaveEmpty',
       parentHash: '',
       timestamp: 1557130713000,
       toAddress: 'TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw',
       toAddressType: 'IntendedLeaveEmpty',
       token: '',
       txFee: 0,
       txHash: '042ab5fac2a4509bc92b283d124f4d685a33e88132121c85490ccebe58e9e40c',
       value: 0 },

*/
/*
     { block: 8943638,
       call_data: 'dc00adef4f6465737361204f70657261205468656174726500000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000cbccc37eefe7eb408b26eafd4ab5e482ed6de98500000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000002c54eb20000000000000000000000000000000000000000000000000000000002c54eb20000000000000000000000000000000000000000000000000000000002c54f6600000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000001d512f80000000000000000000000000000000000000000000000000000000001d511f40000000000000000000000000000000000000000000000000000000001d512f8',
       confirmed: true,
       ownAddress: 'TTG1yYGu9ZuQuXXGXwgtfaWK4HmCvAUJ8F',
       ownAddressType: 'IntendedLeaveEmpty',
       parentHash: '',
       timestamp: 1556988168000,
       toAddress: 'TG6QdCzFar8GqHavj9oXFzX7BTrgTfVsBw',
       toAddressType: 'IntendedLeaveEmpty',
       token: '',
       txFee: 0,
       txHash: 'ea5648516f68b90a6cbdee23e5ca17c416871fb3037fd887dcf14b90c729b5d0',
       value: 306562500 },
       */



return;






function processPlayersResults() {


	let _taxToDivide = new BigNumber(31410145568);
	console.log("TRX TAX:", TronWeb.fromSun(31410145568));

	let _totalEmpireScore = 174275;
			//let _pricePerPlotSun = 100000000;

	let _newAdd = new BigNumber(0);

	fs.readFile("./trxowed.txt", function (err, data) {
		let filenameObj = JSON.parse(data);
		
	    let c = 0;
	    async.whilst(
	      function() { return c < filenameObj.accounts.length-1; },
	      function(async_callback) {

	      //	console.log(filenameObj.accounts[c])

	      	// check for any sold property...
	      	for(let i=1; i< tokensObj.tokens.length; i++) {
	      		if(tokensObj.tokens[i].previous_owners.length > 0){
	      			for(let i2=0; i2< tokensObj.tokens[i].previous_owners.length; i2++) {
	      				if(
	      						tronWeb.address.toHex(tokensObj.tokens[i].previous_owners[i2]) ==
	      						 tronWeb.address.toHex(filenameObj.accounts[c].address)
	      					) {
	      					console.log("PLAYER:", filenameObj.accounts[c].address);
							console.log("HAS LOST CARD:" + i, tronWeb.fromSun(parseInt(tokensObj.tokens[i].orig_value._hex.substring(2),16)));
							_newAdd = _newAdd.plus(parseInt(tokensObj.tokens[i].current_value._hex.substring(2),16));
							break;

	      				} else {
	      					//console.log(tronWeb.address.toHex(tokensObj.tokens[i].previous_owners[i2]), tronWeb.address.toHex(filenameObj.accounts[c].address));
	      				}
	      			}
	      		}
	      	}

	      	
	      	c++;
	      	async_callback(null);
	      }, 
	      function(err) {
	          if(err)
	            console.log(err);
	          else
	            console.log("Done", tronWeb.fromSun(_newAdd.toString()) + "TRX");

	        //////processTxs();
	    }); // END of async.whilst
	});

/*
	orig.getAllPlayerObjectLen().call().then(function(results){
		let _len = parseInt(results.toString());
		console.log("SIZE:", _len);


		let count = 0;
		async.whilst(
		    function() { return count < _len; },
		    function(callback) {
		    	//console.log("Processing Player:", count);


				orig.all_playerObjects(count).call().then(function(results){

	

					//if(tronWeb.address.fromHex(results.playerAddress).toUpperCase() == "TUYoUEDuGv9xfatSDFzg2ggZ6znjy2eQs9".toUpperCase()){
						console.log(results.totalEmpireScore.toNumber());
						console.log(results.taxMarkPoint.toNumber());	
						console.log(results.founderTaxMarkPoint.toNumber());

						/// share 
						let _percent = results.totalEmpireScore.mul(100).div(_totalEmpireScore);
						console.log("%", _percent.toString());
						console.log("TRX:", tronWeb.fromSun(_taxToDivide.times(_percent).div(100).toString()));


						let _playerWithdrawn = new BigNumber(0);

						let _playerOwed;


						// but how much have they already withdrawn....
						for(let i=0; i< _tx.length;i++){
							if(_tx[i].ownAddress.toUpperCase() == tronWeb.address.fromHex(results.playerAddress).toUpperCase()){
								//console.log("EVENT MATCH FOR PLAYER:", _tx[i]);
								//console.log(tronWeb.toAscii(_tx[i].call_data));
								async function getTX() {


									await tronWeb.trx.getTransactionInfo(_tx[i].txHash).then(function(txRes) {
										if(txRes.receipt){
											if(txRes.receipt.result == "SUCCESS"){
												if(txRes.internal_transactions){

													for(let innerI=0; innerI< txRes.internal_transactions.length; innerI++){
														if(
															tronWeb.address.fromHex(txRes.internal_transactions[innerI].transferTo_address).toUpperCase()
															== 
															tronWeb.address.fromHex(results.playerAddress).toUpperCase()
															) {
															//console.log("IS TRX TO PLAYER!", txRes);
															//console.log(txRes.internal_transactions[innerI].callValueInfo);
															_playerWithdrawn = _playerWithdrawn.plus(new BigNumber(txRes.internal_transactions[innerI].callValueInfo));

														}
													}
												}												
											}
										}


									});
								}
								getTX();
								
							}

							_playerOwed = new BigNumber(_taxToDivide).times(_percent).div(100).minus(_playerWithdrawn);
							


						}

						if(_playerOwed.toNumber() > 0){
							console.log("PLAYER:", tronWeb.address.fromHex(results.playerAddress));
							console.log("OWNED:", tronWeb.fromSun(_playerOwed) + "TRX");		

							filenameObj['accounts'].push({address: tronWeb.address.fromHex(results.playerAddress), trx: tronWeb.fromSun(_playerOwed)});						
						}

						_totalOwed = _totalOwed.plus(_playerOwed);

					//}
					


					count++;
			        setTimeout(function() {
			            callback(null, count);
			        }, 100);

				});


		        
		    },
		    function (err, n) {
		        console.log("TOTAL TRX:",count);
				console.log("TOTAL OWED:", tronWeb.fromSun(_totalOwed.toString()));		   
				fs.writeFile("./trxowed2.txt", JSON.stringify(filenameObj), function (err) {
				  if (err) throw err;
				  console.log('Replaced!');
				});
		    }
		);
	});
*/
}



return;

/*
// TUYoUEDuGv9xfatSDFzg2ggZ6znjy2eQs9

/*
await contract2.getAllPlayerObjectLen().call().then(function(results){
	console.log(results.toNumber());
});
return;
*/

/*
await contract2.getTokenEnhanced(1,false).call().then(function(res){
	console.log(res);
});
return;
*/

// 46 players to transfer
//console.log(tronWeb.address.fromHex("41432d5e791d100d6507e598dd4fe50bf52316dfd1"));
/*
await contract2.initPlayers(36,45).send().then(function(results){
	console.log("INIT:", results);
});
return;
*/

/*
// 211 tokens to transfer
let count=1;
//contract2.transferTokens(16,20).send().then(function(results){
async.whilst(
    function() { return count < 212; },
    
    function(callback) {
    	console.log("Processing card:", count);


		contract2.transferTokens(count, count).send().then(function(results){

			count++;
	        setTimeout(function() {
	            callback(null, count);
	        }, 100);

		}).catch(function(err){
			count++;
		    setTimeout(function() {
		        callback(null, count);
		    }, 100);
		});



        
    },
    function (err, n) {
        console.log("TOTAL COUNT:", count);
    }
);




return;
*/


/*
//price_update_amount = 6
await contract2.p_update_action(6,"410000000000000000000000000000000000000000",3125,"").send().then(function(results){
	console.log("price_update_amount", results,);
});
return;
*/
/*
await contract2._foundingPlayersTaxToDivide().call().then(function(results){
	console.log("_foundingPlayersTaxToDivide", results.toNumber());
});


await contract2.founderPlayersTotalSUNoutstandingActivated().call().then(function(results){
console.log(results.toNumber());
});

await contract2.getFounderPlayer("TQtDtpGQuKhJPJxfcpoQtRdL8bNeEDxxE9").call().then(function(results){
console.log(results, results.sunOutstanding.toNumber());
});
return;
*/
// 33415

/*
dev changes
                <!--orig = 48 -->
                <!-- new = 35 -->
*/
// remove founder split
/*
await contract2.tax_fund().call().then(function(results){
	console.log("tax_fund", tronWeb.fromSun(results.toNumber()));
});
return;
*/

/*
// m_resalePlot_devPercent = 12
await contract2.p_update_action(12,"410000000000000000000000000000000000000000",85,"").send().then(function(results){
	console.log("m_resalePlot_devPercent", results);
});
// m_resalePlot_ownerPercent = 14
await contract2.p_update_action(14,"410000000000000000000000000000000000000000",0,"").send().then(function(results){
	console.log("m_resalePlot_devPercent", results);
});
return;
*/


//current_plot_price = 21
/*
await contract2.p_update_action(21,"410000000000000000000000000000000000000000",75000000,"").send().then(function(results){
	console.log("m_newPlot_devPercent", results);
});
return;

// m_newPlot_devPercent
await contract2.p_update_action(10,"410000000000000000000000000000000000000000",35,"").send().then(function(results){
	console.log("m_newPlot_devPercent", results);
});
// m_newPlot_taxPercent = 11
await contract2.p_update_action(11,"410000000000000000000000000000000000000000",45,"").send().then(function(results){
	console.log("m_newPlot_taxPercent", results);
});
// m_newPlot_bonusPercent = 25
await contract2.p_update_action(25,"410000000000000000000000000000000000000000",15,"").send().then(function(results){
	console.log("m_newPlot_bonusPercent", results);
});
return;
*/
// setup founder players...

// getAllPlayerObjectLen().call
// step through all_playerObjects
//     struct player {
//        address playerAddress;
//        uint256 lastAccess;
//        uint256 totalEmpireScore;
//        uint256 totalLand;
// total invested: 980342 = 23k usd




/*


	let _tokens = [];
	let c=1;
	let count;
/*
	await origContract.tokenIDCount().call().then(function(results){
		_count = parseInt(results.toString());
		console.log(_count);

		let count = 1;
		async.whilst(
		    function() { return count < _count+1; },
		    function(callback) {
		    	console.log("Processing:", count);
				origContract.getTokenEnhanced(count, true).call().then(function(results){
						console.log(results, tronWeb.fromSun(results.current_value.toNumber()));
						_tokens.push(results);
						count++;
				        setTimeout(function() {
				            callback(null, count);
				        }, 100);
						//console.log(results);

					}).catch(function(err){
						console.log("Not exists", c, err);
						count++;
				        setTimeout(function() {
				            callback(null, count);
				        }, 100);
					});		
		        
		    },
		    function (err, n) {
				populatePlayers();        
		    }
		);

		


	});
	
*/
//169.8445




//console.log(tronWeb.address.toHex("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz"));
//return;




/*
await contract2.day_dayBonusEmpireScore(0,"TJGdsKawNvriRjjsFy8oYXnNfwmqG9w9ME").call().then(function(results){
	console.log(results.toNumber());
});
return;
*/
//THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky
// shasta = THWQhA6jcXqCeepZVrjbzqcVe7v9fM8uky
// mainnet = TEEEQGmbZoeHA24EVG91b6u9zsbWUfefPF
await contract2.setP3TInterface("TEEEQGmbZoeHA24EVG91b6u9zsbWUfefPF").send().then(function(results){
console.log(results);
});
//return;

/*
await contract2.incDay().send().then(function(results){
console.log(results);
});
return;
*/
/*
await contract2._foundingPlayersTaxToDivide().call().then(function(results){
	console.log(results.toNumber());
});
return;
*/
//TJokMVWFBVJeUhvk2uWM5wvKJjd5quaRPx




/*
let _playerAddress = [];
let _totalLand = [];
let _totalEmpireScore = [];
let _trxOutstanding = [];
let _activated = [];
_playerAddress.push("TJokMVWFBVJeUhvk2uWM5wvKJjd5quaRPx");
_totalLand.push(100);
_totalEmpireScore.push(100);
_trxOutstanding.push(tronWeb.toSun(200));
_activated.push(false);

await contract2.addFounderPlayers(_playerAddress, _totalLand, _totalEmpireScore, _trxOutstanding, _activated).send().then(function(results){
	console.log("RESULTS:", results);
});
*/
    //    return;


/*
	await contract2.distPreviousDaysBonus().send().then(function(results){
console.log("RESULTS:", results);
	});
	return;
	*/

//console.log(tronWeb.address.fromHex("415b0cd5cfffc9c29087b2fb02c050b273f57e90de"));
//return;
/*
await contract2.all_playerObjects(1).call().then(function(results){
	console.log("RESULTS:", results);
});
return;
*/
/*
await contract2.distPreviousDaysBonus().send().then(function(results){

	console.log("RESULTS:", results);
});
return;
*/
/*
await utils2.p_update_planetCryptoCoinAddress("TPcmPD1pTSnk8NVDbCpW26im69PLMFfhrk").send().then(function(results){
console.log("RESULTS:", results);
});
return;
*/
//return;
//await coins2.balanceOf(contractAddr).call().then(function(results){
//console.log("balanceOf:", results.toNumber());
//});



	await utils2.p_update_planetCryptoTokenAddress(contractAddr).send().then(function(results){
		console.log("RESULTS:", results);
	});


	await utils2.p_update_planetCryptoCoinAddress(coinsAddr).send().then(function(results){
		console.log("RES:", results);
	});
	//return;

	await coins2.mint(contractAddr, 1000000).send().then(function(result){
		console.log("MINT:", result);
	});



/*
	// aprove them
	await coins2.approve(contractAddr, 1000000).send().then(function(results){
		console.log("approve", results);	
	});
*/


	await contract2.p_update_action(18,"410000000000000000000000000000000000000000",1000000,"").send().then(function(results){
		console.log("avail:", results);
	});
	await contract2.p_update_action(19,"410000000000000000000000000000000000000000",0,"").send().then(function(results){
		console.log("alloc:", results);
	});


await contract2.tokens_rewards_available().call().then(function(results){
	console.log("tokens_rewards_available:", results.toNumber());
});

return;




	

	await contract2.total_empire_score().call().then(function(results){
		console.log("total_empire_score", results.toNumber());
	});

	await contract2._taxToDivide().call().then(function(results){
		console.log("_taxToDivide", results.toNumber());
	});

	await contract2.all_playerObjects(1).call().then(function(results){
		console.log("RESULTS:", results);
		console.log("RESULTS:", results.totalEmpireScore.toNumber());
	});
	return;

	let results2;

	// 199.6 TRX



/*
	// send amount in SUN
	results2 = await contract2.receiveExternalTax().send({callValue: 1}).then(function(result){
		console.log("result:", result);
	}).catch(function(err){
		console.log("err:", err);
	});
	return;
*/

	// current price at 5 march 15:00 = 224556250
	// aim for 174.5562
	// current price at 8 march 09:32 = 174962500 = 174.9625
	// aim for 154 = 154962500
	
//	console.log("PRICE:", tronWeb.fromSun(174556250));
//return;

	results2  = await contract2.p_update_action(21, "0000000000000000000000000000000000000000",154000000, "").send();
	//results2  = await contract2.current_plot_price().call();
	console.log("RESULTS:", results2.toString());

	return;

	//console.log("ADDR", tronWeb.address.toHex("TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N"));

	//console.log("INFLATION:", tronWeb.fromSun(25000));
	//return;



//	let coins2 = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");
//	let result2;
	/*
	coins2.mint("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz", 1000000).send().then(function(result){
		console.log("MINT:", result);
	});
	*/
	// send initCoins to the planettokens
	/*
	result2 = await coins2.transfer("TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG", initCoins).send();
	console.log("transfer", result2);

	// aprove them
	result2 = await coins2.approve("TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG", initCoins).send();
	console.log("approve", result2);


	await coins2.totalSupply().call().then(function(result){
		console.log("totalSupply:", new BigNumber(result).toString());
	});

	await coins2.balanceOf("TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG").call().then(function(result){
		console.log("TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG:", new BigNumber(result).toString());
	});

	await coins2.balanceOf("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz").call().then(function(result){
		console.log("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz:", new BigNumber(result).toString());
	});

	return;
	*/
	/*
	tronWeb.getEventByTransactionID(
			"a9c32906d8653fc0c7610baf2075b4e8bdb2f85c53c82d88258520ebeb66b74e").then(function(results){
				console.log("RESULTS:", results);
			}).catch(function(err){
				console.log("ERR:", err);
			});
return;
	*/
/*
	let contract = await tronWeb.contract(planetToken_abi, "TJ4MbVxdLeCBPcRFRx7RPK1hDhu2GHMoXp");// live
	contract.getToken(570, false).call().then(function(results){
		console.log("RESULTS:", results);
	});


	contract.tokenIDCount().call().then(function(results){
		console.log("tokenIDCount:", new BigNumber(results).toString());
	})
	return;
*/
/*
	let contract = await tronWeb.contract(planetToken_abi, "TJ4MbVxdLeCBPcRFRx7RPK1hDhu2GHMoXp");// live

	let hasError = false;
	let _name = "0x5468616d6573204261726765";
	let _lat = [51498750];
	let _lng = [-121240];
	//let _lng = [-131240];
	//let _amnt = 0//160150000; 
	//let _amnt = 168157500; // + 5% to allow for the
	//let _ref = "0x93e05fdf63dea1a238a4bfdd69e90329999290d3";
	//let _ref = "93e05fdf63dea1a238a4bfdd69e90329999290d3";
	//let _ref = "TPT7857oyMaPJjarQgspxw6PQgTnzCSidU";
	let _ref = "410000000000000000000000000000000000000000";
	//let _ref = "0x93e05fdf63dea1a238a4bfdd69e90329999290d3";
	//let _ref = "4193e05fdf63dea1a238a4bfdd69e90329999290d3";

	//let _ref = "41af6bd6361ba852b5b174e5c73f979f25b537d32c";
	//let _ref = "af6bd6361ba852b5b174e5c73f979f25b537d32c";

	//let _ref = "93e05fdf63dea1a238a4bfdd69e90329999290d3";
	//_ref = "0x" + _ref;
	//let _ref = "TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6";
	//_ref = tronWeb.address.toHex(_ref);
	console.log("REF:", _ref);
//a9c32906d8653fc0c7610baf2075b4e8bdb2f85c53c82d88258520ebeb66b74e
	contract.current_plot_price().call().then(function(_price){
		let _amnt = parseInt(new BigNumber(_price.toString()));
		console.log("Current price:", _amnt);
		async function doBuy() {
			let _result = await contract.buyLand(strToBytes32Array(_name), _lat, _lng, _ref).send({
						callValue: _amnt,
						shouldPollResponse: true
						}).catch(function(err){
							hasError = true;
							console.log("ERR:", err);

						});
			console.log("_result:", _result);
		}

		doBuy();
		


	});


	return;
*/
	/*
	tronWeb.getEventByTransactionID(
			"a9c32906d8653fc0c7610baf2075b4e8bdb2f85c53c82d88258520ebeb66b74e").then(function(results){
				console.log("RESULTS:", results);
			}).catch(function(err){
				console.log("ERR:", err);
			});
return;
	*/
	//0xa10645c5e4edb159d8a449d765f639ff69cad3a2
	// TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt
	let contract;

	contract = await tronWeb.contract(planetToken_abi, "TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N");// live
	let results;
	
	/*
	results = await contract.getAllPlayerObjectLen().call().then(function(results){
		console.log("getAllPlayerObjectLen:", results);
	}).catch(function(err){
		console.log("ERR:", err);
	})
	//return;

	results = await contract.all_playerObjects(1).call().then(function(results){
		console.log("RESULTS:", results);
	}).catch(function(err){
		console.log("ERR:", err);
	});
	console.log("RESULTS:", results);
	return;
*/
/*
	await contract.initPlayers(120,126).send().then(function(results){
		console.log("RESULTS:", results);
	}).catch(function(err){
		console.log("ERR:", err);
	});
	return
*/

/*
	await contract.initPlayers(86,86).send().then(function(results){
		console.log("RESULTS:", results);
	}).catch(function(err){
		console.log("ERR:", err);
	});
	return


	await contract.initPlayers(71,80).send().then(function(results){
		console.log("RESULTS:", results);
	}).catch(function(err){
		console.log("ERR:", err);
	});
	await contract.initPlayers(81,85).send().then(function(results){
		console.log("RESULTS:", results);
	}).catch(function(err){
		console.log("ERR:", err);
	});

	return;
*/
// 785 max
	async function getTokens(_token_id) {

		let _result = await contract.transferTokens(_token_id,_token_id).send({

		}).then(function(results){
			console.log("RESULTS:", results);
			if(_token_id<791)
				getTokens(_token_id+1); 
			else
				console.log("DONE with getTokens");
		}).catch(function(err){
			console.log("ERR:", err);
		});
	}
	//getTokens(523);
	getTokens(786);


	return;

	results = await contract.transferTokens(1,1).send().then(function(results){
		console.log("RESULTS:", results);
	}).catch(function(err){
		console.log("ERR:", err);
	});
	console.log("RESULTS:", results);

	return;



	let utils = await tronWeb.contract(planetUtil_abi, "TABB6aqEVf1VsLqzU8raurvZ7pC8fRgw9T"); // util2
	//let utils = await tronWeb.contract(planetUtil_abi, "TBfHFiTYAZzcLjXHLxbxvjDzNizBEF5B5v"); // shasta new
	//let utils = await tronWeb.contract(planetUtil_abi, "TSomr2KGQurCecjaVYUDHeLt1iWcheVexC"); // shasta old

	//validateLand(address _sender, int256[] plots_lat, int256[] plots_lng) public view returns(bool) {
	let _plots_lat = [38897720, 38897900, 38897900, 38897900, 38897720, 38897540, 38897540, 38897540, 38897540, 38897360];
	let _plots_lng = [-77037130, -77036900, -77036670, -77036440, -77036200, -77036200, -77036440, -77036900, -77037130, -77036670];
	let result = await utils.validateLand("TRxkSFyTcvmGERaToHoFbpJusBZPr8cys6", _plots_lat, _plots_lng).call().catch(function(err){console.log(err);});

	console.log("result:", result);

//console.log(utils);
return;
/*

	//let contract = await tronWeb.contract(planetToken_abi, "TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt");// live
	let contract = await tronWeb.contract(planetToken_abi, "TGJsqZfg7CX5A9thYG2g4b5dwMBgaFjBuQ"); //shasta

	result = await contract.getToken(62,false).call();
	//console.log("token:", result);
	for(let c=0; c < 1; c++) { // result.plots_lat.length; c++) {
		console.log("CHECKING:", parseInt(new BigNumber(result.plots_lat[c]).toString()),  parseInt(new BigNumber(result.plots_lng[c]).toString()))

		for(let c2=0; c2< _plots_lng.length; c2++){
			console.log("AGAINST:", parseInt(_plots_lat[c2]), parseInt(_plots_lng[c2]) )
			if(
				parseInt(new BigNumber(result.plots_lat[c]).toString()) == parseInt(_plots_lat[c2]) 
				&&
				parseInt(new BigNumber(result.plots_lng[c]).toString()) == parseInt(_plots_lng[c2]) 
				){
				console.log("MATCH");
			}
		}
		console.log("lat/lng:",  new BigNumber(result.plots_lat[c]).toString(), new BigNumber(result.plots_lng[c]).toString());
	}

*/
}

async function setup() {

	// setup new utils


	//m_refPercent

	//let coins2 = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");

	// send initCoins to the planettokens
	//result = await coins2.transfer("TUGyDEGFpo3USA1MWqyDrojfMkp1ZJkJkY", 7).send();
	//console.log("transfer", result);

	//return;

	//TUGyDEGFpo3USA1MWqyDrojfMkp1ZJkJkY

	//planetCryptoABI_tron.abi
	let contract = await tronWeb.contract(planetToken_abi, "TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt"); //live
	//let contract = await tronWeb.contract(planetToken_abi, "TM7xwW5F4HideRk61v5XFDE4SBe77TFQpA"); //shasta

	// update price update amount...
	//result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",250000,"").send();
	result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",25000,"").send();
	console.log("results:", result);
	return;

	// util address
	result  = await contract.p_update_action(9,"TSL3zUUYWrfp3VsTC3nbcVBCzqvgcV3urP",0,"").send(); // util 2 new
	console.log("Util Address", result);


	let utils = await tronWeb.contract(planetUtil_abi, "TSL3zUUYWrfp3VsTC3nbcVBCzqvgcV3urP"); // util2 new

	// set planettoken addr
	result = await utils.p_update_planetCryptoTokenAddress("TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt").send().catch(function(err){console.log(err);}); 
	console.log("p_update_planetCryptoTokenAddress", result);

	// set planetcoin addr
	result = await utils.p_update_planetCryptoCoinAddress("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz").send(); 
	console.log("p_update_planetCryptoTokenAddress", result);


	return;


	// update price update amount...
	//result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",250000,"").send();
	result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",25000,"").send();
	return;

	//let val = await contract.cardChangeNameCost().call();
	//console.log(val);
	//return;

	//let result = await contract.taxEarningsAvailable().call();
	//console.log(result);

	// coin address
	result  = await contract.p_update_action(8,"TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz",0,"").send();
	console.log("Coin Address",result);

	// util address
	result  = await contract.p_update_action(9,"TNMzAFEtt2WVTgTFEj5mmC2jV3z8HGhfWW",0,"").send();
	console.log("Util Address", result);

	// base URI
	//result  = await contract.p_update_action(5,"0000000000000000000000000000000000000000",0,"https://planetcrypto.app/tronToken/").send();
	//console.log("Base URI", result);
	//result = await contract.baseURI().call();
	//console.log(result);


	//tokens_rewards_available
	result  = await contract.p_update_action(18,"0000000000000000000000000000000000000000",initCoins,"").send();
	console.log("tokens_rewards_available", result);



	//let utils = await tronWeb.contract(planetUtil_abi, "TNMzAFEtt2WVTgTFEj5mmC2jV3z8HGhfWW");

	// set planettoken addr
	result = await utils.p_update_planetCryptoTokenAddress("TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt").send();
	console.log("p_update_planetCryptoTokenAddress", result);

	// set planetcoin addr
	result = await utils.p_update_planetCryptoCoinAddress("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz").send();
	console.log("p_update_planetCryptoTokenAddress", result);


	let coins = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");

	// send initCoins to the planettokens
	result = await coins.transfer("TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt", initCoins).send();
	console.log("transfer", result);

	// aprove them
	result = await coins.approve("TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt", initCoins).send();
	console.log("approve", result);

}


async function setup2() {

	// setup new utils


	let contract = await tronWeb.contract(planetToken_abi, "TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N"); //new contract


	result  = await contract.p_update_action(9,"TSL3zUUYWrfp3VsTC3nbcVBCzqvgcV3urP",0,"").send(); // util 2 new
	console.log("Util Address", result);

	result  = await contract.p_update_action(8,"TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz",0,"").send(); // coins
	console.log("COINs Address", result);

	return;

	// coins available
	result  = await contract.p_update_action(18,"0000000000000000000000000000000000000000",initCoins,"").send();
	console.log("tokens_rewards_available", result);


	let utils2 = await tronWeb.contract(planetUtil_abi, "TSL3zUUYWrfp3VsTC3nbcVBCzqvgcV3urP"); // util2 new

	// set planettoken addr
	result = await utils2.p_update_planetCryptoTokenAddress("TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N").send().catch(function(err){console.log(err);}); 
	console.log("p_update_planetCryptoTokenAddress", result);


	let coins3 = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");

	// send initCoins to the planettokens
	//result = await coins3.transfer("TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N", initCoins).send();
	//console.log("transfer", result);

	// aprove them
	result = await coins3.approve("TYrmaWBTbBLdk4F3a2b3ry1myGqimKEw6N", initCoins).send();
	console.log("approve", result);

	return;



	//return;

	//TUGyDEGFpo3USA1MWqyDrojfMkp1ZJkJkY

	//planetCryptoABI_tron.abi
	//let contract = await tronWeb.contract(planetToken_abi, "TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG"); //new contract
	//let contract = await tronWeb.contract(planetToken_abi, "TM7xwW5F4HideRk61v5XFDE4SBe77TFQpA"); //shasta

	// change m_newPlot_devPercent == option 10, set to 60%
	result  = await contract.p_update_action(10,"0000000000000000000000000000000000000000",60,"").send(); //12500
	console.log("result:", result);

	// change m_newPlot_taxPercent == option 11, set to 40%
	result  = await contract.p_update_action(10,"0000000000000000000000000000000000000000",40,"").send(); //12500
	console.log("result2:", result);
	return;




	// update price update amount...
	//result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",250000,"").send();
	result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",6250,"").send(); //12500
	console.log("result:", result);
	return;




	// coins address
	result  = await contract.p_update_action(8,"TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz",0,"").send(); // util 2 new
	console.log("Util Address", result);

	return;



	// util address
	result  = await contract.p_update_action(9,"TSL3zUUYWrfp3VsTC3nbcVBCzqvgcV3urP",0,"").send(); // util 2 new
	console.log("Util Address", result);

	// coins address
	result  = await contract.p_update_action(8,"TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz",0,"").send(); // util 2 new
	console.log("Util Address", result);

	// token rewards avail
	result  = await contract.p_update_action(18,"0000000000000000000000000000000000000000",initCoins,"").send();
	console.log("tokens_rewards_available", result);




	let utils = await tronWeb.contract(planetUtil_abi, "TSL3zUUYWrfp3VsTC3nbcVBCzqvgcV3urP"); // util2 new

	// set planettoken addr
	result = await utils.p_update_planetCryptoTokenAddress("TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG").send().catch(function(err){console.log(err);}); 
	console.log("p_update_planetCryptoTokenAddress", result);

	// set planetcoin addr
	result = await utils.p_update_planetCryptoCoinAddress("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz").send(); 
	console.log("p_update_planetCryptoTokenAddress", result);


	let coins2 = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");

	// send initCoins to the planettokens
	result = await coins2.transfer("TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG", initCoins).send();
	console.log("transfer", result);

	// aprove them
	result = await coins2.approve("TPTCVbwSxmNS1nDbcbaz18v9mMk2DejGtG", initCoins).send();
	console.log("approve", result);


	return;



	// update price update amount...
	//result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",250000,"").send();
	result  = await contract.p_update_action(6,"0000000000000000000000000000000000000000",25000,"").send();
	return;

	//let val = await contract.cardChangeNameCost().call();
	//console.log(val);
	//return;

	//let result = await contract.taxEarningsAvailable().call();
	//console.log(result);

	// coin address
	result  = await contract.p_update_action(8,"TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz",0,"").send();
	console.log("Coin Address",result);

	// util address
	result  = await contract.p_update_action(9,"TNMzAFEtt2WVTgTFEj5mmC2jV3z8HGhfWW",0,"").send();
	console.log("Util Address", result);

	// base URI
	//result  = await contract.p_update_action(5,"0000000000000000000000000000000000000000",0,"https://planetcrypto.app/tronToken/").send();
	//console.log("Base URI", result);
	//result = await contract.baseURI().call();
	//console.log(result);


	//tokens_rewards_available
	result  = await contract.p_update_action(18,"0000000000000000000000000000000000000000",initCoins,"").send();
	console.log("tokens_rewards_available", result);



	//let utils = await tronWeb.contract(planetUtil_abi, "TNMzAFEtt2WVTgTFEj5mmC2jV3z8HGhfWW");

	// set planettoken addr
	result = await utils.p_update_planetCryptoTokenAddress("TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt").send();
	console.log("p_update_planetCryptoTokenAddress", result);

	// set planetcoin addr
	result = await utils.p_update_planetCryptoCoinAddress("TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz").send();
	console.log("p_update_planetCryptoTokenAddress", result);


	let coins = await tronWeb.contract(planetCoin_abi, "TYE6g4YAT2dBYgPEkUQ8vRAHJePU3pBWXz");

	// send initCoins to the planettokens
	result = await coins.transfer("TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt", initCoins).send();
	console.log("transfer", result);

	// aprove them
	result = await coins.approve("TQedJmWPJzrJfGTvfiKdNY7ZW5C8xsYgAt", initCoins).send();
	console.log("approve", result);

}

//setup();
//setup2();







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





