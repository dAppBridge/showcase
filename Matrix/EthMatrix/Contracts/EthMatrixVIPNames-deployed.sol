/**
 *Submitted for verification at Etherscan.io on 2020-06-16
*/

/**
 * 
 * 
 /$$$$$$$$ /$$$$$$$$ /$$   /$$ /$$      /$$  /$$$$$$  /$$$$$$$$ /$$$$$$$  /$$$$$$ /$$   /$$
| $$_____/|__  $$__/| $$  | $$| $$$    /$$$ /$$__  $$|__  $$__/| $$__  $$|_  $$_/| $$  / $$
| $$         | $$   | $$  | $$| $$$$  /$$$$| $$  \ $$   | $$   | $$  \ $$  | $$  |  $$/ $$/
| $$$$$      | $$   | $$$$$$$$| $$ $$/$$ $$| $$$$$$$$   | $$   | $$$$$$$/  | $$   \  $$$$/ 
| $$__/      | $$   | $$__  $$| $$  $$$| $$| $$__  $$   | $$   | $$__  $$  | $$    >$$  $$ 
| $$         | $$   | $$  | $$| $$\  $ | $$| $$  | $$   | $$   | $$  \ $$  | $$   /$$/\  $$
| $$$$$$$$   | $$   | $$  | $$| $$ \/  | $$| $$  | $$   | $$   | $$  | $$ /$$$$$$| $$  \ $$
|________/   |__/   |__/  |__/|__/     |__/|__/  |__/   |__/   |__/  |__/|______/|__/  |__/
 * 
 * 
 *  https://ETHMatrix.network
 *  Multiply your Ethereum!
 * 
 *  
**/


pragma solidity >=0.4.23 <0.6.0;

contract EthMatrixVIPName {


	event NameBought (
	        address indexed player,
	        string      data,
	        uint256     timestamp
	        );


	address internal owner;

    uint256 public VANITY_PRICE    = 0.05 ether;

    mapping(bytes32 => address) public listVanityAddress; // key is vanity of address
    mapping(address => PlayerVanity) public playersVanity;


    struct PlayerVanity {
        string vanity;
        bool vanityStatus;
    }

    address[] public playersVanityAddressList;


    constructor(address ownerAddress) public {
        owner = ownerAddress;
    }



    

    function playersVanityAddressListLen() public view returns (uint) {
        return playersVanityAddressList.length;
    }

    function playersVanityByID(uint _id) public view returns (address _addr, string memory _vanity) {
        _addr = playersVanityAddressList[_id];
        _vanity = playersVanity[_addr].vanity;
    }





    /**
    * Action by vanity
    * Vanity referral links (Show vanity in cardholder box)
    */
    function buyVanity(string memory _vanity) public payable {
        
        /*------------------- validate --------------------------------*/
        require(msg.value >= VANITY_PRICE);
        require(vanityExists(_vanity) == false);
        /*--------------------- handle --------------------------------*/

        _vanity = _toUpper(_vanity);

        if(playersVanity[msg.sender].vanityStatus == false) {
            playersVanityAddressList.push(msg.sender);
        }


        playersVanity[msg.sender].vanity = _vanity;
        playersVanity[msg.sender].vanityStatus = true;
        // update list vanity address
        listVanityAddress[convertStringToBytes32(_vanity)] = msg.sender;
        /*--------------------- event --------------------------------*/

        address(uint160(owner)).transfer(msg.value);

        emit NameBought(msg.sender, _vanity, now);
    }




    function vanityExists(string memory _vanity) public view returns(bool) {
        _vanity = _toUpper(_vanity);
        if (listVanityAddress[convertStringToBytes32(_vanity)] != address(0)) {
          return true; 
        }
        return false;
    }
    function convertStringToBytes32(string memory key) private pure returns (bytes32 ret) {
        if (bytes(key).length > 32) {
          revert();
        }

        assembly {
          ret := mload(add(key, 32))
        }
    }
    function vanityToAddress(string memory _vanity) public view returns(address) {
      return listVanityAddress[convertStringToBytes32(_vanity)];
    }
    function addressToVanity(address _player) public view returns(string memory) {
      return playersVanity[_player].vanity;
    }
    
	function _toUpper(string memory str) internal pure returns (string memory)  {
		bytes memory bStr = bytes(str);
		bytes memory bLower = new bytes(bStr.length);
		for (uint i = 0; i < bStr.length; i++) {
			// Lowercase character...
			if (( uint8(bStr[i]) >= 97) && ( uint8(bStr[i]) <= 122)) {

				bLower[i] = bytes1(uint8(bStr[i]) - 32);
			} else {
				bLower[i] = bStr[i];
			}
		}
		return string(bLower);
	}

}