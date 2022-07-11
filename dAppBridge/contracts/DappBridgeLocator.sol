pragma solidity ^0.4.23;

// allows us to move DappBridge and then update the address for users automatically...
// 0.002487 ETH
// 1.5 USD
//
contract DappBridgeLocator {

        
    address public owner;
    address public dAppBridgeLocation;

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    constructor() public payable {
        owner = msg.sender;
    }

    function currentLocation() external view returns(address) {
        return dAppBridgeLocation;
    }

    // private functions
    function private_setdAppBridgeLocation(address new_location) external onlyOwner {
        dAppBridgeLocation = new_location;
    }
    // end private functions

}