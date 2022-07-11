pragma solidity^0.5.4;




interface TronWinDice {
    function roll(uint _rollAmnt, bool _isUnder) public payable returns (uint _result, uint _win_amnt);
}




contract TronWinDiceRoller {
    

    // shasta 414a21b83de6020e6c60891da8c5c7ea05fb7b293c
    TronWinDice tronWinDice_I;


    constructor() public {

        tronWinDice_I = TronWinDice(0x4a21b83de6020e6c60891da8c5c7ea05fb7b293c);
    }


    function roll(uint _rollAmnt, bool _isUnder) public payable returns (uint _result, uint _win_amnt) {
        (_result, _win_amnt) = tronWinDice_I.roll(_rollAmnt, _isUnder);
    }


}