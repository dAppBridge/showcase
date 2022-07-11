/**
 *Submitted for verification at polygonscan.com on 2021-10-18
*/

pragma solidity 0.7.6;


interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}

interface ERC721TokenReceiver {
    function onERC721Received(address _operator, address _from, uint256 _tokenId, bytes calldata _data) external returns(bytes4);
}

library SafeMath {

    /**
    * @dev Multiplies two numbers, throws on overflow.
    */
    function mul(uint256 a, uint256 b) internal pure returns (uint256 c) {
        if (a == 0) {
            return 0;
        }
        c = a * b;
        require(c / a == b);
        return c;
    }

    /**
    * @dev Integer division of two numbers, truncating the quotient.
    */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        // uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return a / b;
    }

    /**
    * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
    */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        return a - b;
    }

    /**
    * @dev Adds two numbers, throws on overflow.
    */
    function add(uint256 a, uint256 b) internal pure returns (uint256 c) {
        c = a + b;
        require(c >= a);
        return c;
    }
}

contract Punks2 is IERC721 {

    using SafeMath for uint256;

    event Mint(uint indexed index, address indexed minter);
    event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress);
    event PunkBidEntered(uint indexed punkIndex, uint value, address indexed fromAddress);
    event PunkBidWithdrawn(uint indexed punkIndex, uint value, address indexed fromAddress);
    event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress);
    event PunkNoLongerForSale(uint indexed punkIndex);

    /**
     * Event emitted when the public sale begins.
     */
    event SaleBegins();

    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    uint public constant TOKEN_LIMIT = 10000;

    mapping(bytes4 => bool) internal supportedInterfaces;

    mapping (uint256 => address) internal idToOwner;

    mapping (uint256 => address) internal idToApproval;

    mapping (address => mapping (address => bool)) internal ownerToOperators;

    mapping(address => uint256[]) internal ownerToIds;

    mapping(uint256 => uint256) internal idToOwnerIndex;

    string internal nftName = "CryptoPunks2";
    string internal nftSymbol = "PUNKS2";

    // You can use this hash to verify the image file containing all the punks
    string public imageHash;

    uint internal numTokens = 0;
    uint internal numSales = 0;

    address payable internal deployer;
    address payable internal marketer;
    address payable internal developer;
    bool public publicSale = false;
    //uint private mintPrice = 10 ether;
    uint [100] private mintPrice; // in brackets of 1000
    uint public saleStartTime;
    uint public maxMarketingMints = 250; // 2.5%
    uint public currentMarketingMints = 0;
    uint public marketFee = 500; // 5%

    //// Random index assignment
    uint internal nonce = 0;
    uint[TOKEN_LIMIT] internal indices;

    //// Market
    bool public marketPaused;
    bool public contractSealed;
    mapping (address => uint256) public ethBalance;
    mapping (bytes32 => bool) public cancelledOffers;

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer.");
        _;
    }

    bool private reentrancyLock = false;

    /* Prevent a contract function from being reentrant-called. */
    modifier reentrancyGuard {
        if (reentrancyLock) {
            revert();
        }
        reentrancyLock = true;
        _;
        reentrancyLock = false;
    }

    modifier canOperate(uint256 _tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(tokenOwner == msg.sender || ownerToOperators[tokenOwner][msg.sender], "Cannot operate.");
        _;
    }

    modifier canTransfer(uint256 _tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(
            tokenOwner == msg.sender
            || idToApproval[_tokenId] == msg.sender
            || ownerToOperators[tokenOwner][msg.sender], "Cannot transfer."
        );
        _;
    }

    modifier validNFToken(uint256 _tokenId) {
        require(idToOwner[_tokenId] != address(0), "Invalid token.");
        _;
    }

    constructor(address payable _marketer, address payable _developer, string memory _imageHash) {
        supportedInterfaces[0x01ffc9a7] = true; // ERC165
        supportedInterfaces[0x80ac58cd] = true; // ERC721
        supportedInterfaces[0x780e9d63] = true; // ERC721 Enumerable
        supportedInterfaces[0x5b5e139f] = true; // ERC721 Metadata
        deployer = msg.sender;
        marketer = _marketer;
        developer = _developer;
        imageHash = _imageHash;
        for(uint c = 0; c<25; c++) {
            mintPrice[c] = 10 ether;
        }
        for(uint c = 25; c<50; c++) {
            mintPrice[c] = 20 ether;
        }
        for(uint c = 50; c<75; c++) {
            mintPrice[c] = 40 ether;
        }
        for(uint c = 75; c<100; c++) {
            mintPrice[c] = 80 ether;
        }
    }

    function startSale() external onlyDeployer {
        require(!publicSale);
        saleStartTime = block.timestamp;
        publicSale = true;
        emit SaleBegins();
    }

    function pauseMarket(bool _paused) external onlyDeployer {
        require(!contractSealed, "Contract sealed.");
        marketPaused = _paused;
    }

    function sealContract() external onlyDeployer {
        contractSealed = true;
    }

    //////////////////////////
    //// ERC 721 and 165  ////
    //////////////////////////

    function isContract(address _addr) internal view returns (bool addressCheck) {
        uint256 size;
        assembly { size := extcodesize(_addr) } // solhint-disable-line
        addressCheck = size > 0;
    }

    function supportsInterface(bytes4 _interfaceID) external view override returns (bool) {
        return supportedInterfaces[_interfaceID];
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata _data) external override {
        _safeTransferFrom(_from, _to, _tokenId, _data);
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external override {
        _safeTransferFrom(_from, _to, _tokenId, "");
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) external override canTransfer(_tokenId) validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(tokenOwner == _from, "Wrong from address.");
        require(_to != address(0), "Cannot send to 0x0.");
        _transfer(_to, _tokenId);
    }

    function approve(address _approved, uint256 _tokenId) external override canOperate(_tokenId) validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(_approved != tokenOwner);
        idToApproval[_tokenId] = _approved;
        emit Approval(tokenOwner, _approved, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved) external override {
        ownerToOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function balanceOf(address _owner) external view override returns (uint256) {
        require(_owner != address(0));
        return _getOwnerNFTCount(_owner);
    }

    function ownerOf(uint256 _tokenId) public view override returns (address _owner) {
        require(idToOwner[_tokenId] != address(0));
        _owner = idToOwner[_tokenId];
    }

    function getApproved(uint256 _tokenId) external view override validNFToken(_tokenId) returns (address) {
        return idToApproval[_tokenId];
    }

    function isApprovedForAll(address _owner, address _operator) external override view returns (bool) {
        return ownerToOperators[_owner][_operator];
    }

    function _transfer(address _to, uint256 _tokenId) internal {
        address from = idToOwner[_tokenId];
        _clearApproval(_tokenId);

        _removeNFToken(from, _tokenId);
        _addNFToken(_to, _tokenId);

        emit Transfer(from, _to, _tokenId);
    }

    function randomIndex() internal returns (uint) {
        uint totalSize = TOKEN_LIMIT - numTokens;
        uint index = uint(keccak256(abi.encodePacked(nonce, msg.sender, block.difficulty, block.timestamp))) % totalSize;
        uint value = 0;
        if (indices[index] != 0) {
            value = indices[index];
        } else {
            value = index;
        }

        // Move last value to selected position
        if (indices[totalSize - 1] == 0) {
            // Array position not initialized, so use position
            indices[index] = totalSize - 1;
        } else {
            // Array position holds a value so use that
            indices[index] = indices[totalSize - 1];
        }
        nonce++;
        // Don't allow a zero index, start counting at 1
        return value.add(1);
    }

    function mintsRemaining() external view returns (uint) {
        return TOKEN_LIMIT.sub(numSales);
    }
    


    /**
     * Public sale minting.
     */
    function mint(uint256 numberOfNfts, address ref) external payable reentrancyGuard {
        require(publicSale, "Sale not started.");
        require(!marketPaused);
        require(numberOfNfts > 0, "numberOfNfts cannot be 0");
        require(numberOfNfts <= 500, "You can not buy more than 500 NFTs at once");
        require(totalSupply().add(numberOfNfts) <= TOKEN_LIMIT-maxMarketingMints, "Exceeds TOKEN_LIMIT");
       require(calcMintPrice(numberOfNfts) == msg.value, "not enough MATIC sent!");
        
        uint bal = msg.value;
        
        if(ref != msg.sender && ref != address(0)) {
            payable(address(ref)).transfer(bal.mul(1000).div(10000)); // 10% ref payment
            bal = bal.sub(bal.mul(1000).div(10000));
        }
        marketer.transfer(bal.div(2));
        developer.transfer(bal.div(2));
        
        for (uint i = 0; i < numberOfNfts; i++) {
            numSales++;
            _mint(msg.sender);
        }
        
    }
    
    function calcMintPrice(uint numberOfNfts) public view returns (uint) {
        require(numberOfNfts > 0, "numberOfNfts cannot be 0");
        require(numberOfNfts <= 500, "You can not buy more than 500 NFTs at once");
        require(totalSupply().add(numberOfNfts) <= TOKEN_LIMIT-maxMarketingMints, "Exceeds TOKEN_LIMIT");
        
        uint _cost;
        uint currentNumsales = numSales;
        for(uint c = 1; c<=(numberOfNfts); c++ ){
            _cost = _cost.add(mintPrice[(currentNumsales+c)/100]);
            currentNumsales++;
        }
        return _cost;

    }

    function marketingClaim(uint256 numberOfNfts, address to) external reentrancyGuard onlyDeployer {
        require(currentMarketingMints + numberOfNfts < maxMarketingMints);
        require(totalSupply().add(numberOfNfts) <= TOKEN_LIMIT);
        for(uint i = 0; i < numberOfNfts; i++) {
            currentMarketingMints++;
            _mint(to);
        }
    }

    function _mint(address _to) internal returns (uint) {
        require(_to != address(0), "Cannot mint to 0x0.");
        require(numTokens < TOKEN_LIMIT, "Token limit reached.");
        uint id = randomIndex();

        numTokens = numTokens + 1;
        _addNFToken(_to, id);

        emit Mint(id, _to);
        emit Transfer(address(0), _to, id);
        return id;
    }

    function _addNFToken(address _to, uint256 _tokenId) internal {
        require(idToOwner[_tokenId] == address(0), "Cannot add, already owned.");
        idToOwner[_tokenId] = _to;

        ownerToIds[_to].push(_tokenId);
        idToOwnerIndex[_tokenId] = ownerToIds[_to].length.sub(1);
    }

    function _removeNFToken(address _from, uint256 _tokenId) internal {
        require(idToOwner[_tokenId] == _from, "Incorrect owner.");
        delete idToOwner[_tokenId];

        uint256 tokenToRemoveIndex = idToOwnerIndex[_tokenId];
        uint256 lastTokenIndex = ownerToIds[_from].length.sub(1);

        if (lastTokenIndex != tokenToRemoveIndex) {
            uint256 lastToken = ownerToIds[_from][lastTokenIndex];
            ownerToIds[_from][tokenToRemoveIndex] = lastToken;
            idToOwnerIndex[lastToken] = tokenToRemoveIndex;
        }

        ownerToIds[_from].pop();
    }

    function _getOwnerNFTCount(address _owner) internal view returns (uint256) {
        return ownerToIds[_owner].length;
    }

    function _safeTransferFrom(address _from,  address _to,  uint256 _tokenId,  bytes memory _data) private canTransfer(_tokenId) validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(tokenOwner == _from, "Incorrect owner.");
        require(_to != address(0));

        _transfer(_to, _tokenId);

        if (isContract(_to)) {
            bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
            require(retval == MAGIC_ON_ERC721_RECEIVED);
        }
    }
    
    function _safeTransfer(address _from,  address _to,  uint256 _tokenId,  bytes memory _data) private validNFToken(_tokenId) {
        address tokenOwner = idToOwner[_tokenId];
        require(tokenOwner == _from, "Incorrect owner.");
        require(_to != address(0));

        _transfer(_to, _tokenId);

        if (isContract(_to)) {
            bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
            require(retval == MAGIC_ON_ERC721_RECEIVED);
        }
    }

    function _clearApproval(uint256 _tokenId) private {
        if (idToApproval[_tokenId] != address(0)) {
            delete idToApproval[_tokenId];
        }
    }

    //// Enumerable

    function totalSupply() public view returns (uint256) {
        return numTokens;
    }

    function tokenByIndex(uint256 index) public pure returns (uint256) {
        require(index >= 0 && index < TOKEN_LIMIT);
        return index + 1;
    }

    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256) {
        require(_index < ownerToIds[_owner].length);
        return ownerToIds[_owner][_index];
    }

    //// Metadata

    /**
      * @dev Converts a `uint256` to its ASCII `string` representation.
      */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        uint256 index = digits - 1;
        temp = value;
        while (temp != 0) {
            buffer[index--] = bytes1(uint8(48 + temp % 10));
            temp /= 10;
        }
        return string(buffer);
    }

    /**
      * @dev Returns a descriptive name for a collection of NFTokens.
      * @return _name Representing name.
      */
    function name() external view returns (string memory _name) {
        _name = nftName;
    }

    /**
     * @dev Returns an abbreviated name for NFTokens.
     * @return _symbol Representing symbol.
     */
    function symbol() external view returns (string memory _symbol) {
        _symbol = nftSymbol;
    }

    /**
     * @dev A distinct URI (RFC 3986) for a given NFT.
     * @param _tokenId Id for which we want uri.
     * @return _tokenId URI of _tokenId.
     */
    function tokenURI(uint256 _tokenId) external view validNFToken(_tokenId) returns (string memory) {
        return string(abi.encodePacked("https://api.CryptoPunks2.com/punks2/", toString(_tokenId)));
    }

    //// MARKET
    
    struct Offer {
        bool isForSale;
        uint punkIndex;
        address seller;
        uint minValue;          // in ether
        address onlySellTo;     // specify to sell only to a specific person
    }

    struct Bid {
        bool hasBid;
        uint punkIndex;
        address bidder;
        uint value;
    }
    
    // A record of punks that are offered for sale at a specific minimum value, and perhaps to a specific person
    mapping (uint => Offer) public punksOfferedForSale;
    
    // A record of the highest punk bid
    mapping (uint => Bid) public punkBids;

    mapping (address => uint) public pendingWithdrawals;
    
    modifier onlyTokenOwner (uint256 _tokenId) {
        require(_tokenId < 10000, "punk number is wrong");
        require(ownerOf(_tokenId) == msg.sender, "Incorrect owner.");
        _;
    }
    
    function punkNoLongerForSale(uint punkIndex) public reentrancyGuard onlyTokenOwner(punkIndex) {
        _punkNoLongerForSale(punkIndex);
    }
    
    function _punkNoLongerForSale(uint punkIndex) private {
        punksOfferedForSale[punkIndex] = Offer(false, punkIndex, msg.sender, 0, address(0));
        emit PunkNoLongerForSale(punkIndex);
    }

    function offerPunkForSale(uint punkIndex, uint minSalePriceInWei) public reentrancyGuard onlyTokenOwner(punkIndex){
        require(marketPaused == false, 'Market Paused');
        punksOfferedForSale[punkIndex] = Offer(true, punkIndex, msg.sender, minSalePriceInWei, address(0));
        emit PunkOffered(punkIndex, minSalePriceInWei, address(0));
    }

    function offerPunkForSaleToAddress(uint punkIndex, uint minSalePriceInWei, address toAddress) public reentrancyGuard onlyTokenOwner(punkIndex){
        require(marketPaused == false, 'Market Paused');
        punksOfferedForSale[punkIndex] = Offer(true, punkIndex, msg.sender, minSalePriceInWei, toAddress);
        emit PunkOffered(punkIndex, minSalePriceInWei, toAddress);
    }

    function buyPunk(uint punkIndex) public payable reentrancyGuard{
        require(marketPaused == false, 'Market Paused');
        require(punkIndex < 10000, "punk number is wrong");
        Offer memory offer = punksOfferedForSale[punkIndex];
        require(offer.isForSale, "punk not actually for sale");
        require(offer.onlySellTo == address(0) || offer.onlySellTo == msg.sender, "punk not supposed to be sold to this user");
        require(msg.value >= offer.minValue, "Didn't send enough amount");
        require(ownerOf(punkIndex) == offer.seller, "Seller no longer owner of punk");

        address seller = offer.seller;
        
        _safeTransfer(seller, msg.sender, punkIndex, "");
        _punkNoLongerForSale(punkIndex);
        
        uint marketingFee = msg.value.mul(marketFee).div(10000);
        
        pendingWithdrawals[seller] += msg.value.sub(marketingFee);
        pendingWithdrawals[marketer] += marketingFee;
        
        emit PunkBought(punkIndex, msg.value, seller, msg.sender);

        // Check for the case where there is a bid from the new owner and refund it.
        // Any other bid can stay in place.
        Bid memory bid = punkBids[punkIndex];
        if (bid.bidder == msg.sender) {
            // Kill bid and refund value
            pendingWithdrawals[msg.sender] += bid.value;
            punkBids[punkIndex] = Bid(false, punkIndex, address(0), 0);
        }
    }

    function withdraw() public reentrancyGuard{
        uint amount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }

    function enterBidForPunk(uint punkIndex) public payable reentrancyGuard{
        require(marketPaused == false, 'Market Paused');
        require(punkIndex < 10000, "punk number is wrong");
        require(ownerOf(punkIndex) !=  msg.sender, 'you can not bid on your punk');
        require(msg.value > 0, 'bid can not be zero');
        Bid memory existing = punkBids[punkIndex];
        require(msg.value > existing.value, "you can not bid lower than last bid");
        if (existing.value > 0) {
            // Refund the failing bid
            pendingWithdrawals[existing.bidder] += existing.value;
        }
        punkBids[punkIndex] = Bid(true, punkIndex, msg.sender, msg.value);
        emit PunkBidEntered(punkIndex, msg.value, msg.sender);
    }

    function acceptBidForPunk(uint punkIndex, uint minPrice) public reentrancyGuard  onlyTokenOwner(punkIndex){
        require(marketPaused == false, 'Market Paused');
        address seller = msg.sender;
        Bid memory bid = punkBids[punkIndex];
        require(bid.value > 0, 'there is not any bid');
        require(bid.value >= minPrice, 'bid is lower than min price');
        
        _punkNoLongerForSale(punkIndex);
        _safeTransfer(seller, bid.bidder, punkIndex, "");
        
        uint amount = bid.value;
        punkBids[punkIndex] = Bid(false, punkIndex, address(0), 0);
        pendingWithdrawals[seller] += amount;
        emit PunkBought(punkIndex, bid.value, seller, bid.bidder);
    }

    function withdrawBidForPunk(uint punkIndex) public reentrancyGuard{
        require(punkIndex < 10000, "punk number is wrong");
        require(ownerOf(punkIndex) != msg.sender, "wrong action");
        require(punkBids[punkIndex].bidder == msg.sender, "Only bidder can withdraw");
        Bid memory bid = punkBids[punkIndex];
        emit PunkBidWithdrawn(punkIndex, bid.value, msg.sender);
        uint amount = bid.value;
        punkBids[punkIndex] = Bid(false, punkIndex, address(0), 0);
        // Refund the bid money
        msg.sender.transfer(amount);
    }


}