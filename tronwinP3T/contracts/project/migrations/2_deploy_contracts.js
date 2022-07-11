var TronWinVault = artifacts.require("TronWinVault");
var TronWin = artifacts.require("TronWinMain");
var TronWinDice = artifacts.require("TronWinDice");
//var TronWinDiceRoller = artifacts.require("TronWinDiceRoller");
var TronWinToken = artifacts.require("TronWinToken");

module.exports = function(deployer) {

	//deployer.deploy(TronWinVault);
	//deployer.deploy(TronWin);
	//deployer.deploy(TronWinDice);
	deployer.deploy(TronWinToken);
	//deployer.deploy(TronWinDiceRoller);
};
