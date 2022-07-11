//var Migrations = artifacts.require("./Migrations.sol");
var TronWinVault = artifacts.require("TronWinVault.sol");


module.exports = function(deployer) {
  //deployer.deploy(Migrations);
  deployer.deploy(TronWinVault);
};
