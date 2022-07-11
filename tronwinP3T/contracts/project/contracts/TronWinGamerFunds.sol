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
    function gamingFundPayment(address _to, uint _amnt) external;
    function receiveExternalGameFundAsToken(uint256 amountTokenEligible) external payable;
    function getGameFund() external view returns (uint256);
    function get24hrTokenFund() external view returns (uint256);
    function maxShockDrop() external view returns (uint256);
    function applyFundsAsTokenEligible(uint _amnt) external;
    function processPlayerPlay(address _player, uint _amnt) external;
}

interface TronWinDaily {
    function receiveExternalDivs(uint amnt) external;
}

interface TronWinBank {
    function deposit(uint _amnt) external;
} 


contract TronWinGamerFunds {

          
    event ReferralEarned(
            address player,
            address referredBy,
            uint256 amnt
        );



    address public owner;
    address public gameController;
    address public marketing;



    mapping(address => uint256) public  gamerFunds;
    mapping(address => uint256) public  gamerFundsInPlay;




    uint public min_deposit = 5000000;
    uint public min_withdraw = 5000000;

    modifier onlyGameController() {
      require(msg.sender == gameController);
      _;
    }




    TronWinVault tronwinVault_I = TronWinVault(0x82E5189D7FdC55947DFc42A9541a0B43DE615e5c);
    TronWinDaily tronwinDaily_I = TronWinDaily(0x8307aCB4F0526f149C108D090978e0fd81D42368);
    TronWinBank tronwinBank_I = TronWinBank(0x1BE1B9cd9bB522A42529f42d9F8F6a6bf851bf91);


    constructor() public {

        owner = address(msg.sender);
        gameController = owner;
        marketing = owner;
    }



    function() payable external {   
    }

    function updateMinDep(uint _amnt) public {
        require(msg.sender == gameController);
        min_deposit = _amnt;
    }
    function updateMinW(uint _amnt) public {
        require(msg.sender == gameController);
        min_withdraw = _amnt;
    }


    function updatetronWinVault(address _addr) public onlyGameController {
        tronwinVault_I = TronWinVault(_addr);
    }
    function updateDaily(address _addr) public onlyGameController {
        tronwinDaily_I = TronWinDaily(_addr);
    }
    function updateBank(address _addr) public onlyGameController {
        tronwinBank_I = TronWinBank(_addr);
    }


    function gamerFundsAvail(address _player) public view returns(uint) {
        return gamerFunds[_player] - gamerFundsInPlay[_player];
    }

    function deposit() public payable {
      require(msg.value >= min_deposit, "Not enough!");
      gamerFunds[msg.sender] += msg.value;
    }


    function withdraw(uint _amnt) public {
      require(_amnt >= min_withdraw, "Not enough!");
      require(gamerFunds[msg.sender] - gamerFundsInPlay[msg.sender] >= _amnt);
      if(address(this).balance <= _amnt)
        tronwinVault_I.gamingFundPayment(address(this), _amnt);

      gamerFunds[msg.sender] = gamerFunds[msg.sender] - _amnt;
      msg.sender.transfer(_amnt);
    }



    function lockFunds(uint _amnt, address _player) public  {
        require(msg.sender == gameController);
        require(gamerFunds[_player] - gamerFundsInPlay[_player] >= _amnt);


        if(address(this).balance <= _amnt)
            tronwinVault_I.gamingFundPayment(address(this), _amnt);
            
        gamerFundsInPlay[_player] += _amnt;
    }

    function unlockFunds(uint _amnt, address _player) public {
        require(msg.sender == gameController);

        gamerFundsInPlay[_player] -= _amnt;
    }



    event gameResult(
        address     player,
        uint        game_id,
        uint        winAmnt,
        string     results
    );



    // _w1 = Any win minus initial stake and minus fees - this is their prize
    // _w2 = total of any win including initial stake
    // _uint1 = energy cost == goes to marketing
    // _uint2 = 80% of pay in = game fund + twn + bank (90%)
    // _uint3 = TWN share
    // _uint4 = BANK share
    //
    function endGame(uint _unlockAmnt, address _player, uint _w1, uint _w2, uint _uint1, uint _uint2, uint _uint3, uint _uint4, uint _gameID, string _results) public {
        require(msg.sender == gameController);

        gamerFundsInPlay[_player] -= _unlockAmnt;
        if(_w2 == 0)
            gamerFunds[_player] -= _unlockAmnt; // player has lost their stake
        else{
            if(_w1 > 0)
                gamerFunds[_player] += _w1;
        }

        

        marketing.transfer(_uint1);
        tronwinVault_I.receiveExternalGameFundAsToken.value(_uint2)(_uint3);
        

        // award TWN
        tronwinVault_I.processPlayerPlay(_player, _unlockAmnt);

        // award 333
        if(_uint3 > 0)
            tronwinDaily_I.receiveExternalDivs(_uint3);

        // award bank
        if(_uint4 > 0)
            tronwinBank_I.deposit(_uint4);


        emit gameResult(_player, _gameID, _w2, _results);


    }




}
