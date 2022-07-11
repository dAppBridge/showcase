pragma solidity ^0.4.16;

import "github.com/dAppBridge/dAppBridge-Client/dAppBridge-Client_Kovan.sol?a=2";

contract DappBridgeTester is clientOfdAppBridge {
    address public owner;
    int256 public random_number;
    string public random_string; 
    string public callback_data;
    uint32 public timeout_calls;
    


    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }
    
    constructor() payable public {
      owner = msg.sender;
      random_number = 0;
      timeout_calls = 0;
    }
    

    function kill() public {
      if(msg.sender == owner) selfdestruct(owner);
    }

    function withdrawAll() public onlyOwner {
        address myAddress = this;
        owner.transfer(myAddress.balance);
    
    }
    function withdraw(uint amount) public onlyOwner returns(bool) {
        address myAddress = this;
        require(amount < myAddress.balance);
        owner.transfer(amount);
        return true;
    }

    function getContractBalance() public constant returns(uint){
        address myAddress = this;
        return myAddress.balance;
    }

   event responseEvent(
       bool test 
    );
    
    event responseString(
        string result
    );
    
    function callbackPlain() external payable only_dAppBridge {
        timeout_calls ++;
        setTimeout("callbackPlain", 120);
    }

    // Callback signature is (bytes32,string)
    function callback(string callbackData) external payable only_dAppBridge {
        random_string = callbackData;
        emit responseString(
            callbackData
        );
    }
    
    function callbackInt(int callbackData) external payable only_dAppBridge {
        random_number = callbackData;        
    }


    
    function setNewGas(uint256 new_gas) public onlyOwner {
        setGas(new_gas);
    }
    function newCallbackGas(uint256 new_callback_gas) public onlyOwner {
        setCallbackGas(new_callback_gas);
    }

    //function randomNumber(string callback_method, int32 min_val, int32 max_val, uint32 timeout) external payable;
    function testRandomNumber(string callback_method, int32 min_val, int32 max_val, uint32 timeout)  public {
        randomNumber(callback_method,min_val, max_val, timeout);
    }
    
    //function randomString(string callback_method, uint8 number_of_bytes, uint32 timeout)
    function testRandomString(string callback_method, uint8 number_of_bytes, uint32 timeout) public {
        randomString(callback_method, number_of_bytes, timeout);
    }

    //setTimeout(string callback_method, uint32 timeout)
    function testTimeout(string callback_method, uint32 timeout) public {

        setTimeout(callback_method, timeout);
    }
    
    //setURLTimeout(string callback_method, uint32 timeout, string external_url, string external_params)
    function testURLTimeout(string callback_method, uint32 timeout, string external_url, string params) public {
        setURLTimeout(callback_method, timeout, external_url, params);
    }
    
    //callURL(string callback_method, string external_url, string external_params)
    function testcallURL(string callback_method, string external_url, string params) public {

        callURL(callback_method, external_url, params);
    }

    function testcallURL(string callback_method, string external_url, string params, string json_extract_element) public {

        callURL(callback_method, external_url, params, json_extract_element);
    }


}