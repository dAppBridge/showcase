//var Migrations = artifacts.require("./Migrations.sol");
var PlanetCryptoCoin = artifacts.require("./PlanetCryptoCoin.sol");
//var PlanetCryptoUtils = artifacts.require("./PlanetCryptoUtils.sol");
var PlanetCryptoUtils = artifacts.require("./PlanetCryptoUtils.sol");
//var PlanetCryptoToken = artifacts.require("./PlanetCryptoToken.sol");
var PlanetCryptoToken = artifacts.require("./PlanetCryptoToken.sol");
var PlanetCryptoEmpireBonus = artifacts.require("./PlanetCryptoEmpireBonus.sol");

var fc333Win = artifacts.require("./fc333Win.sol");

module.exports = function(deployer) {
  	//deployer.deploy(Migrations);
	//deployer.deploy(PlanetCryptoUtils);
	//deployer.deploy(PlanetCryptoToken);
	
	//deployer.deploy(PlanetCryptoCoin);

//	deployer.deploy(PlanetCryptoToken);
	//deployer.deploy(PlanetCryptoEmpireBonus);

	deployer.deploy(fc333Win);
};
