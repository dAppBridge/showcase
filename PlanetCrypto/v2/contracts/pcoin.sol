pragma solidity ^0.4.24;

// 0x3d270d33576f8bcbfe6fcfdd5259e3151ad16383

import "./ERC20.sol";
import "./ERC20Detailed.sol";
import "./ERC20Mintable.sol";
import "./ERC20Burnable.sol";


/// @title A scalable implementation of all ERC20 NFT standards combined.
/// @author Dan Field
contract PlanetCryptoCoin is ERC20, ERC20Detailed, ERC20Mintable, ERC20Burnable {
    // EVENTS
    event debugEvent(
       string debugText,
       string debugValue);
       
    event debugInt(
        string debugText,
        int256 debugValue);
        
    event debugUInt(
        string debugText,
        uint256 debugValue);

    // CONTRACT MANAGERS
    address owner;

    // MODIFIERS
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    


    constructor() 
                        ERC20Burnable()
                        ERC20Mintable()
                        ERC20Detailed('PlanetCoin', 'PLT', 0)
                        ERC20()
                        public {
        
        owner = msg.sender;
        
        mint(owner, 1000000); 
    }




    // PRIVATE METHODS
    function p_updateOwner(address _owner) public onlyOwner {
        owner = _owner;
    }

}