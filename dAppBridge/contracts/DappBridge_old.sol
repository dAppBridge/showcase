pragma solidity ^0.4.23;

interface Client_Contract_I {
    function receiveProof(string requestkey, string proof) external;
    function receiveProofInt(string requestkey, int proof) external;
}

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
        string json_extract_element
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
    
    function setTimeout(string callback_method, uint32 timeout) external minRewardMatched payable {
        require(timeout >= 0);
        uint _client_created_ts = now;
        //TimeoutItem memory _timeoutItem = TimeoutItem(msg.sender, msg.value, callback_method, "", "", timeout, _client_created_ts, "");
        /*        
        bytes32 request_key = sha256(_timeoutItem.sender, _timeoutItem.reward, _timeoutItem.callback_method, 
            _timeoutItem.external_url, _timeoutItem.external_params, _timeoutItem.timeout, _timeoutItem.client_created_ts);
        */  
        //emit setTimeout_event
        emitTimeoutEvent(msg.sender, msg.value, callback_method, "",
            "", timeout, _client_created_ts, "");
        
        //return request_key;
    } // $0.02??


    function setURLTimeout(string callback_method, uint32 timeout_, string external_url, 
            string external_params, string json_extract_element) external minRewardMatched payable {
        require(timeout_ >= 0);
        uint _client_created_ts = now;
        emitTimeoutEvent(
            msg.sender, msg.value, callback_method, external_url,
            external_params, timeout_, _client_created_ts, json_extract_element
            );
        /*
        emit setTimeout_event(msg.sender, msg.value, callback_method, external_url,
            external_params, timeout_, _client_created_ts, json_extract_element);
        */
    } // $0.03??
    
    function emitTimeoutEvent(address sender, uint256 reward, 
        string callback_method, string external_url, string external_params, 
        uint32 timeout, uint client_created_ts, string json_extract_element) internal {
            emit setTimeout_event(sender, reward, callback_method, external_url,
            external_params, timeout, client_created_ts, json_extract_element);
        }

    function callURL(string callback_method, string external_url, string external_params,
            string json_extract_element) external minRewardMatched payable {
        uint256 _client_created_ts = now;
        //TimeoutItem memory _timeoutItem = TimeoutItem(msg.sender, msg.value, callback_method, external_url, external_params, 0, _client_created_ts, json_extract_element);
        /*        
        bytes32 request_key = sha256(_timeoutItem.sender, _timeoutItem.reward, _timeoutItem.callback_method, 
            _timeoutItem.external_url, _timeoutItem.external_params, _timeoutItem.timeout, _timeoutItem.client_created_ts);
         */  
        //bytes32 request_key = sha256(msg.sender, msg.value, callback_method, external_url, external_params, "0", _client_created_ts);
        //emit setTimeout_event(_timeoutItem);  
        //emit setTimeout_event
        emitTimeoutEvent(msg.sender, msg.value, callback_method, external_url,
            external_params, 0, _client_created_ts, json_extract_element);
        //return request_key;
    } // $0.02??



    event setRandomTriger_event(
        address sender, 
        uint256 reward, 
        string callback_method, 
        string random_type,
        int32 param1,
        int32 param2,
        uint32 timeout,
        uint client_created_ts
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

    function randomNumber(string callback_method, int32 min_val, int32 max_val, uint32 timeout) external minRandomRewardMatched payable {
        require(timeout >= 0);
        require(min_val < max_val);
        uint _client_created_ts = now;
        RandomEvent memory _randomItem = RandomEvent(msg.sender, msg.value, callback_method, "int", min_val, max_val, timeout, _client_created_ts);
        
        //bytes32 request_key = sha256(msg.sender, msg.value, callback_method, "int", min_val, max_val, timeout, _client_created_ts);
        /*
        bytes32 request_key = sha256(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type, 
        _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);
        */
        //emit setRandomTriger_event(msg.sender, msg.value, callback_method, "int", min_val, max_val, timeout, _client_created_ts);
        emit setRandomTriger_event(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type,
            _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);
        //return request_key;
    } // $0.02? 

   
    function randomString(string callback_method, uint8 number_of_bytes, uint32 timeout) external minRandomRewardMatched payable {
        require(number_of_bytes > 0);
        require(number_of_bytes < 1025);
        uint _client_created_ts = now;
        RandomEvent memory _randomItem = RandomEvent(msg.sender, msg.value, callback_method, "str", number_of_bytes, int32(0), timeout, _client_created_ts);
        /*        
        bytes32 request_key = sha256(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type, 
        _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);
        */
        //bytes32 request_key = sha256(msg.sender, msg.value, callback_method, "str", number_of_bytes,int32(0), timeout, _client_created_ts);
        //emit setRandomTriger_event(_randomItem);
        emit setRandomTriger_event(_randomItem.sender, _randomItem.reward, _randomItem.callback_method, _randomItem.random_type,
            _randomItem.param1, _randomItem.param2, _randomItem.timeout, _randomItem.client_created_ts);
        //return request_key;
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


    // proof callback
    // Test with:
    // key: "123"
    // addr: 0x5dCD53Df7bdeA688C7840e0Aa1aC17a28FfebC21
    // proof: web3 soiditysha3 of "test" = "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658"
    // "123",0x5dCD53Df7bdeA688C7840e0Aa1aC17a28FfebC21,"0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658"
    // cost: 37919
    // cost: 187874 <- May be cheaper to use the call direct method (kaccak256 encoded)
    // Trying direct =  (Note we are setting gas here so need anotehr test with method with gas set too)
    // Result = 37919 but no logs = didn't run??
    // run through interface cost: 189495 (With logs)
    function private_receiveCallbackProof(string request_key, address return_to, string proof) public onlyOwner returns(bool) {
        address callBackAddr = return_to;
        Client_Contract_I client_contract = Client_Contract_I(callBackAddr);
        //client_contract.receiveProof.gas(our_gas_cost__proof)(request_key, proof);
        client_contract.receiveProof(request_key, proof);
        //return callBackAddr.call.gas(our_gas_cost__proof)(bytes4(keccak256("receiveProof(string,string)")), request_key, proof);
    }
    function private_receiveProofInt(string request_key, address return_to, int256 proof) public onlyOwner {
        address callBackAddr = return_to;
        Client_Contract_I client_contract = Client_Contract_I(callBackAddr);
        client_contract.receiveProofInt(request_key, proof);
    }



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
    // 100000 = min gas
    // 100000 = our costs no data
    // 200000 = our costs with data
    // Standard setup:
    // 70000000000000,51000000000000,100000,200000,100000,100000
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