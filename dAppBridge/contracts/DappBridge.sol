pragma solidity ^0.4.23;

//0.018300 ETH
//11.12 USD

/*
How can we improve on our proof to show that the data from
    dAppbridge<-->[https]
Has not been tampered with and is the original data?

Aim is to show the content delviered is the content received from [https]


1. Store [key: {https cert, page hash, page html - encrypt with a key?}] on IPFS?

= Users can then look this up offline for proof?  
= Passing the full hash allows in contract validattion?
- Page HTML visible publically, but so are the requests
- How can we do the same but for encrypted requests (When we add them)?

2. TLSNotary type service...

- We request the HTTPS page
--- We hash the response, including SSL cipher etc to allow us to decrypt the body later
--- We encrypt the hash with our pub key
--- Return this hash as the output

- Store crypt on [key: IPFS]

Steps above need to be completed on a trusted and audited 3rd party server?

3. Use trusted Proxy Notary service

- This service is a simple Node request handler that runs on a veriviable host
- Takes an input request, makes the request to the remote server
- When response received - hashes full response including SSL certs
- Stores:
key: {
    body:
    cert:
    time:
} = encrypted with public key, stored on ipfs
- Replies with response body + key
- Key can then be used to verify the content received is the content returned from source

E.g.

1. Client Request: https://api.coindesk.com/v1/bpi/currentprice.json
2. Request is Receied by [dAppBridge Service]
3. [dAppBridge Service] calls [NotaryProxy] with:
{
    request_key: "0x000",
    request_url: "https://api.coindesk.com/v1/bpi/currentprice.json",
    request_params: "",
    request_process: {
        type: "json_extract",
        value: "a.b.c.d"
    } // method to use body processing
}
4. [NotaryProxy] makes request to https://api.coindesk.com/v1/bpi/currentprice.json
5. Upon page complete apply any [request_process] (response.body = [proccesed_body]) & creates:
[response] = {
    request_key: "0x000",
    request_url: "https://api.coindesk.com/v1/bpi/currentprice.json",
    request_params: "",
    full_body_hash: SHA3(response.body),
    full_body_enc: dAppBridgePubKey.encrypt(response.body)
    response_body_hash: SHA3([proccesed_body])
    response_body_enc: dAppBridgePubKey.encrypt(proccesed_body)
    certs_enc: dAppBridgePubKey.encrypt(response.certs)
}
6. Store [response] on ipfs (request_key = [response])
7. Return:
{
    request_key: "0x000",
    request_url: "https://api.coindesk.com/v1/bpi/currentprice.json",
    request_params: "",
    response_hash: SHA3([response_body_enc]),
    response_plain_txt: [response_body_enc]
}

8. [dAppBridge Service] returns [request_key],[response_plain_txt] to client

If client wishes to verify the [result] has not been tampered with:

1. They can verify the content they received by calling verify on the [NotaryProxy] service
{
    request_key: "0x000",
    response_plain_txt: [result]
    ||
    response_hash: SHA3([result])
}



END

*/

library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
 
  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }
 
  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }
 
  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}



contract DappBridge {

    using SafeMath for uint256;

    address public owner;
    uint256 public min_reward; // Test others can't set!!
    uint256 public min_random_reward; // Test others can't set!!
    uint256 internal our_gas_cost__withData = 0; // our gas used for callback method
    uint256 internal our_gas_cost__noData = 0; // our gas used for callback method
    uint256 internal our_gas_cost__proof = 0;
    uint256 public min_gas = 0; // gas needs to be enough to cover callback_gas too????

    

    constructor() public payable {
        owner = msg.sender;
    }

    function () public payable {
    }

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    modifier minRewardMatched() {
        require(msg.value >= min_reward);
        _;
    }

    modifier minRandomRewardMatched() {
        require(msg.value >= min_random_reward);
        _;
    }


    // external
    function getOwner() external view returns(address){
        return owner;
    }

    function getContractBalance() external view returns(uint){
        address myAddress = this;
        return myAddress.balance;
    }

    function getMinReward(string requestType) external view returns(uint256){
        if(compareStrings(requestType,"setTimeoutURL") || compareStrings(requestType,"callURL") ){
            uint256 _min = min_reward.add(getDappBridgeGasCost(true));
            return _min;
            //return min_reward + getDappBridgeGasCost(true);
        } else {
            uint256 _min2 = min_reward.add(getDappBridgeGasCost(false));
            return _min2;
            //return min_random_reward  + getDappBridgeGasCost(false);
        }
    }

    function getMinGas() external view returns(uint256){
        return min_gas;
    }
   

    event setTimeout_event(
        //TimeoutItem timeoutEvent
        address sender,
        uint256 reward, 
        string callback_method,
        string external_url,
        string external_params,
        uint32 timeout,
        uint client_created_ts,
        string json_extract_element,
        bytes32 key
    );

    /*
   struct TimeoutItem {
        address sender;
        uint256 reward; 
        string callback_method;
        string external_url;
        string external_params;
        uint32 timeout;
        uint client_created_ts;
        string json_extract_element;
    }
    */
    /*
    // Not yet possible in public ABI encoders...
    function generateKey(TimeoutItem _timeoutItem) returns(bytes32){
        return sha256(_timeoutItem.sender, _timeoutItem.reward, _timeoutItem.callback_method, 
            _timeoutItem.external_url, _timeoutItem.external_params, _timeoutItem.timeout, _timeoutItem.client_created_ts);
    }
    */
    
    function setTimeout(string callback_method, uint32 timeout) external minRewardMatched payable returns(bytes32) {
        require(timeout >= 0);
        uint _client_created_ts = now;
        //TimeoutItem memory _timeoutItem = TimeoutItem(msg.sender, msg.value, callback_method, "", "", timeout, _client_created_ts, "");
        /*        
        bytes32 request_key = sha256(_timeoutItem.sender, _timeoutItem.reward, _timeoutItem.callback_method, 
            _timeoutItem.external_url, _timeoutItem.external_params, _timeoutItem.timeout, _timeoutItem.client_created_ts);
        */  

        bytes32 _key = timeoutEventKey(msg.sender, msg.value, callback_method, "",
            "", timeout, _client_created_ts, "");

        //emit setTimeout_event
        emitTimeoutEvent(msg.sender, msg.value, callback_method, "",
            "", timeout, _client_created_ts, "", _key);
        
        return _key;
    } // $0.02??


    function setURLTimeout(string callback_method, uint32 timeout, string external_url, 
            string external_params, string json_extract_element) external minRewardMatched payable returns(bytes32) {
        require(timeout >= 0);
        uint _client_created_ts = now;
        
        bytes32 _key = timeoutEventKey(msg.sender, msg.value, callback_method, external_url,
            external_params, timeout, _client_created_ts, json_extract_element);
            
        emitTimeoutEvent(
            msg.sender, msg.value, callback_method, external_url,
            external_params, timeout, _client_created_ts, json_extract_element, _key
            );
        /*
        emit setTimeout_event(msg.sender, msg.value, callback_method, external_url,
            external_params, timeout_, _client_created_ts, json_extract_element);
        */

        return _key;
    } // $0.03??
    
    function emitTimeoutEvent(address sender, uint256 reward, 
        string callback_method, string external_url, string external_params, 
        uint32 timeout, uint client_created_ts, string json_extract_element, bytes32 key) internal {
            emit setTimeout_event(sender, reward, callback_method, external_url,
            external_params, timeout, client_created_ts, json_extract_element, key);
        }

    function callURL(string callback_method, string external_url, string external_params,
            string json_extract_element) external minRewardMatched payable returns(bytes32) {
        uint256 _client_created_ts = now;
        //TimeoutItem memory _timeoutItem = TimeoutItem(msg.sender, msg.value, callback_method, external_url, external_params, 0, _client_created_ts, json_extract_element);
        /*        
        bytes32 request_key = sha256(_timeoutItem.sender, _timeoutItem.reward, _timeoutItem.callback_method, 
            _timeoutItem.external_url, _timeoutItem.external_params, _timeoutItem.timeout, _timeoutItem.client_created_ts);
         */  
        //bytes32 request_key = sha256(msg.sender, msg.value, callback_method, external_url, external_params, "0", _client_created_ts);
        //emit setTimeout_event(_timeoutItem);  
        //emit setTimeout_event

        bytes32 _key = timeoutEventKey(msg.sender, msg.value, callback_method, external_url,
            external_params, 0, _client_created_ts, json_extract_element);

        emitTimeoutEvent(msg.sender, msg.value, callback_method, external_url,
            external_params, 0, _client_created_ts, json_extract_element, _key);
            
        return _key;
    } // $0.02??

    // New feature:
    // string process_with
    // = will process the returned data with a set of predefined helper functions:
    //      DateTimeToTimeStamp("TZ") = converts the string format date into a unix timestamp using the supplied timezone
    //      ...

    function timeoutEventKey(address _sender, uint256 _reward, string _callback_method, string _external_url,
        string _external_params, uint32 _timeout, uint _client_created_ts, string _json_extract_element) internal pure returns(bytes32) {
        bytes32 request_key = sha256(_sender, _reward, _callback_method, _external_url, _external_params, 
            _timeout, _client_created_ts, _json_extract_element);
        return request_key;
    }

    event setRandomTriger_event(
        address sender, 
        uint256 reward, 
        string callback_method, 
        string random_type,
        int32 param1,
        int32 param2,
        uint32 timeout,
        uint client_created_ts,
        bytes32 key
    );
/*
    event setRandomTriger_event(
        RandomEvent randomEvent
    );
*/
    
    struct RandomEvent {
        address sender; 
        uint256 reward;
        string callback_method;
        string random_type;
        int32 param1;
        int32 param2;
        uint32 timeout;
        uint client_created_ts;
    }

    function randomNumber(string callback_method, int32 min_val, int32 max_val, uint32 timeout) external minRandomRewardMatched payable returns(bytes32) {
        require(timeout >= 0);
        require(min_val < max_val);

        uint _client_created_ts = now;
        RandomEvent memory _randomItem = RandomEvent(msg.sender, msg.value, callback_method, "int", min_val, max_val, timeout, _client_created_ts);
        
        //bytes32 request_key = sha256(msg.sender, msg.value, callback_method, "int", min_val, max_val, timeout, _client_created_ts);
        
        bytes32 _key = randomEventKey(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type,
            _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);
        
        //emit setRandomTriger_event(msg.sender, msg.value, callback_method, "int", min_val, max_val, timeout, _client_created_ts);
        emit setRandomTriger_event(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type,
            _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts, _key);

        return _key;
    } 

   
    function randomString(string callback_method, uint8 number_of_bytes, uint32 timeout) external minRandomRewardMatched payable returns(bytes32) {
        require(number_of_bytes > 0);
        require(number_of_bytes < 1025);

        uint _client_created_ts = now;
        RandomEvent memory _randomItem = RandomEvent(msg.sender, msg.value, callback_method, "str", number_of_bytes, int32(0), timeout, _client_created_ts);

        bytes32 _key = randomEventKey(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type,
            _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);

        emit setRandomTriger_event(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type,
            _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts, _key);


        return _key;
    }


    function randomEventKey(address _sender, uint256 _reward, string _callback_method, string _random_type,
        int32 _param1, int32 _param2, uint32 _timeout, uint _client_created_ts) internal pure returns(bytes32) {
        bytes32 request_key = sha256(_sender, _reward, _callback_method, _random_type, 
        _param1, _param2, _timeout, _client_created_ts);
        return request_key;
    }

   

    // internal function
    function compareStrings (string a, string b) internal pure returns (bool){
        return keccak256(a) == keccak256(b);
    }

    function getDappBridgeGasCost(bool hasData) internal view returns(uint256){
        if(hasData == true){
            return our_gas_cost__withData;
        } else {
            return our_gas_cost__noData;
        }
    }


    // private functions


    // 


    // private setup functions

    function private_setOurGasCost(uint256 new_our_gas_cost__withData, uint256 new_gas_cost__noData, uint256 new_our_gas_cost__proof) external onlyOwner {
        require(new_our_gas_cost__withData > 0);
        require(new_gas_cost__noData > 0);
        require(new_our_gas_cost__proof > 0);
        our_gas_cost__withData = new_our_gas_cost__withData;
        our_gas_cost__noData = new_gas_cost__noData;
        our_gas_cost__proof = new_our_gas_cost__proof;
    }

    function private_setMinReward(uint256 new_min_reward) external onlyOwner {
        require(new_min_reward > 0);
        min_reward = new_min_reward;
    }

    function private_setMinRandomReward(uint256 new_min_random_reward) external onlyOwner {
        require(new_min_random_reward > 0);
        min_random_reward = new_min_random_reward;
    }

    function private_setMinGas(uint256 new_min_gas) external onlyOwner {
        require(new_min_gas > 0);
        min_gas = new_min_gas;
    }

    // min rewards = Price of service (E.g $0.04)
    //
    // min gas costs = Cost the user needs to make to submit their request (100,000 wei)
    //
    // our gas costs = Costs we need to send the data back... (our_gas_cost__withData || our_gas_cost__noData)
    //
    // our_gas_cost__proof = NOT CURRENTLY USED
    //
    // 70000000000000 = $0.04 min_reward (callURL, setURLTimeout, )
    // 51000000000000 = $0.03 min_random_reward (randomNumber, randomString, setTimeout)
    // 200000 = min gas
    // 200000 = our costs with data
    // 100000 = our costs no data
    // Standard setup:
    // 70000000000000,51000000000000,200000,200000,100000,100000
    //
    function private_init(uint256 new_min_reward, uint256 new_min_random_reward, uint256 new_min_gas, 
        uint256 new_our_gas_cost__withData, uint256 new_our_gas_cost__noData, uint256 new_our_gas_cost__proof) external onlyOwner {
        require(new_min_reward > 0);
        require(new_min_random_reward > 0);
        require(new_min_gas > 0);
        require(new_our_gas_cost__withData > 0);
        require(new_our_gas_cost__noData > 0);
        require(new_our_gas_cost__proof > 0);
        min_reward = new_min_reward; // The price of making a request (Our fee)
        min_random_reward = new_min_random_reward; // The price of making a request (Our fee)
        min_gas = new_min_gas; // min gas they user has to use when making their request to our request
        our_gas_cost__withData = new_our_gas_cost__withData; // the gas we use to make the callback to the users method from here
        our_gas_cost__noData = new_our_gas_cost__noData;
        our_gas_cost__proof = new_our_gas_cost__proof;
    }

    
    function private_kill() public onlyOwner {
        if(msg.sender == owner) selfdestruct(owner);
    }


    function private_withdrawAll(address send_to) external onlyOwner returns(bool) {
        address myAddress = this;
        return send_to.send(myAddress.balance);
    }

    function private_withdraw(uint256 amount, address send_to) external onlyOwner returns(bool) {
        address myAddress = this;
        require(amount <= myAddress.balance);
        require(amount >0);
        return send_to.send(amount);
    }

    // end private functions



}