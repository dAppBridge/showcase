pragma solidity^0.4.25;

/**
*
*
*  Telegram: https://t.me/TronWinApp
*  Email: support (at) tronwin.app
*
* PLAY NOW: https://tronwin.app/
*  
* --- TRON WIN GAMER FUNDS -----------------------------------------------------
*
*
*
*
* *
*
* --- COPYRIGHT ----------------------------------------------------------------
* 
*   This source code is provided for verification and audit purposes only and 
*   no license of re-use is granted.
*   
*   (C) Copyright 2019 TronWin - A FutureConcepts Production
*   
*   
*   Sub-license, white-label, solidity, Eth, Tron, Tomo development enquiries 
*   please contact support (at) tronwin.app
*   
*   
* PLAY NOW: https://tronwin.app/
* 
*/







interface TronWinVault {
    function gamingFundPayment(address _to, uint _amnt, bool isTokenFundsEligible) external;
    function receiveExternalGameFund(bool isTokenFundsEligible) external payable;
    function getGameFund() external view returns (uint256);
    function get24hrTokenFund() external view returns (uint256);
    function maxShockDrop() external view returns (uint256);
    function applyFundsAsTokenEligible(uint _amnt) external;
    function processPlayerPlay(address _player, uint _amnt) external;
}



contract TronWinSeedSale {

    address public owner;
    address public marketing;


    uint public min_buy = 50000000;
    uint public max_buy = 100000000000;
    uint public seed_sold;
    bool public enabled = true;




    uint public seed_price = 15000000; // 15 TRX

    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }



   TronWinVault tronwinVault_I = TronWinVault(0x2EF179D76dB21e2c7ec3590A964F5e91906a45f3);

    constructor() public {

        owner = address(msg.sender);
        marketing = owner;
    }



    function() payable external {   
        buy();
    }


    function buy() public payable {
        require(enabled == true, "Seed sale not active");
        require(msg.value >= min_buy, "Amount too low!");
        require(msg.value <= max_buy, "Amount too high!");

        // call processPlayerPlay(address _player, uint _amnt) external onlyValidatedGames {
        // where _amnt is calculated to dist the correct amount of tokens!
        // where seed_price should be 440
        // 
        // msg.value * (440000000/seed_price)
        //
        tronwinVault_I.processPlayerPlay(msg.sender, msg.value * (440000000/seed_price));

        //
        // dist funds...
        //
        // 25% to game fund (TWN enabled)
        // 75% to marketing...
        //
        marketing.transfer(msg.value * 75 / 100);
        tronwinVault_I.receiveExternalGameFund.value(msg.value * 25 / 100)(true);

        seed_sold += msg.value / seed_price * 1000000;
    }



}
