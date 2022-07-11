
/*

CONTRACT DEPLOYED FOR VALIDATION 2020-05-27

ETHMATRIX.NETWORK

WEBSITE URL: https://EthMatrix.network/

*/
pragma solidity 0.5.11;



contract ethmatrix {
    
    
    bool public gameOpen = false;
    
    address public ownerWallet;


    struct UserStruct {
        bool isExist;
        uint id;
        uint referrerID;
        address[] referral;
        mapping(uint => uint) levelExpired;
    }

    uint REFERRER_1_LEVEL_LIMIT = 2;
    uint PERIOD_LENGTH = 30 days;
    uint LAST_LEVEL = 10;

    mapping(uint => uint) public LEVEL_PRICE;

    mapping (address => UserStruct) public users;
    mapping (uint => address) public userList;
    address[] public userAddrList;
    uint public currUserID = 0;
    uint public totalHex = 0;



    event regLevelEvent(address indexed _user, address indexed _referrer, uint _time);
    event buyLevelEvent(address indexed _user, uint _level, uint _time);
    event prolongateLevelEvent(address indexed _user, uint _level, uint _time);
    event getMoneyForLevelEvent(address indexed _user, address indexed _referral, uint _level, uint _time);
    event lostMoneyForLevelEvent(address indexed _user, address indexed _referral, uint _level, uint _time);
    event newVanityName(address indexed _user, string _name, uint _time);

    constructor() public {

        ownerWallet = 0x418EA32f7EB0795aa83ceBA00D6DDD055e6643A7;

        LEVEL_PRICE[1] = 0.025 ether;
        for (uint8 i = 2; i <= LAST_LEVEL; i++) {
            LEVEL_PRICE[i] = LEVEL_PRICE[i-1] * 2;
        }

        UserStruct memory userStruct;
        currUserID++;

        userStruct = UserStruct({
            isExist: true,
            id: currUserID,
            referrerID: 0,
            referral: new address[](0)
        });
        users[ownerWallet] = userStruct;
        userList[currUserID] = ownerWallet;

        for(uint i = 1; i <= LAST_LEVEL; i++) {
            users[ownerWallet].levelExpired[i] = 55555555555;
        }
    }



    function regUser(uint _referrerID) public payable {
        require(gameOpen == true, 'Game not yet open!');
        require(!users[msg.sender].isExist, 'User exist');
        require(_referrerID > 0 && _referrerID <= currUserID, 'Incorrect referrer Id');
        require(msg.value == LEVEL_PRICE[1], 'Incorrect amount of ETH sent');
        if(users[userList[_referrerID]].referral.length >= REFERRER_1_LEVEL_LIMIT) _referrerID = users[findFreeReferrer(userList[_referrerID])].id;
        
        
        UserStruct memory userStruct;
        currUserID++;

        userStruct = UserStruct({
            isExist: true,
            id: currUserID,
            referrerID: _referrerID,
            referral: new address[](0)
        });

        users[msg.sender] = userStruct;
        userList[currUserID] = msg.sender;
        userAddrList.push(msg.sender);

        users[msg.sender].levelExpired[1] = now + PERIOD_LENGTH;

        users[userList[_referrerID]].referral.push(msg.sender);

        payForLevel(1, msg.sender);

        emit regLevelEvent(msg.sender, userList[_referrerID], now);
        
    }



    function buyLevel(uint _level) public payable {
        require(gameOpen == true, 'Game not yet open!');
        require(users[msg.sender].isExist, 'User not exist'); 
        require(_level > 0 && _level <= 10, 'Incorrect level');


        if(_level == 1) {
            require(msg.value == LEVEL_PRICE[1], 'Incorrect Value');
            users[msg.sender].levelExpired[1] += PERIOD_LENGTH;
        }
        else {
            require(msg.value == LEVEL_PRICE[_level], 'Incorrect Value');

            for(uint l =_level - 1; l > 0; l--) require(users[msg.sender].levelExpired[l] >= now, 'Buy the previous level first');

            if(users[msg.sender].levelExpired[_level] == 0) users[msg.sender].levelExpired[_level] = now + PERIOD_LENGTH;
            else users[msg.sender].levelExpired[_level] += PERIOD_LENGTH;
        }

        payForLevel(_level, msg.sender);

        emit buyLevelEvent(msg.sender, _level, now);
    }




    function payForLevel(uint _level, address _user) internal {
        address referer;
        address referer1;
        address referer2;
        address referer3;
        address referer4;

        if(_level == 1 || _level == 6) {
            referer = userList[users[_user].referrerID];
        }
        else if(_level == 2 || _level == 7) {
            referer1 = userList[users[_user].referrerID];
            referer = userList[users[referer1].referrerID];
        }
        else if(_level == 3 || _level == 8) {
            referer1 = userList[users[_user].referrerID]; 
            referer2 = userList[users[referer1].referrerID];
            referer = userList[users[referer2].referrerID];
        }
        else if(_level == 4 || _level == 9) {
            referer1 = userList[users[_user].referrerID];
            referer2 = userList[users[referer1].referrerID];
            referer3 = userList[users[referer2].referrerID];
            referer = userList[users[referer3].referrerID];
        }
        else if(_level == 5 || _level == 10) {
            referer1 = userList[users[_user].referrerID];
            referer2 = userList[users[referer1].referrerID];
            referer3 = userList[users[referer2].referrerID];
            referer4 = userList[users[referer3].referrerID];
            referer = userList[users[referer4].referrerID];
        }

        if(!users[referer].isExist) referer = userList[1];

        bool sent = false;
        if(users[referer].levelExpired[_level] >= now) {

            sent = address(uint160(referer)).send(LEVEL_PRICE[_level]);

            totalHex += LEVEL_PRICE[_level];

            if (sent) {
                emit getMoneyForLevelEvent(referer, msg.sender, _level, now);
            }
        }
        if(!sent) {
            emit lostMoneyForLevelEvent(referer, msg.sender, _level, now);

            payForLevel(_level, referer);
        }
    }

    function findFreeReferrer(address _user) public view returns(address) {
        if(users[_user].referral.length < REFERRER_1_LEVEL_LIMIT) return _user;

        address[] memory referrals = new address[](126);
        referrals[0] = users[_user].referral[0];
        referrals[1] = users[_user].referral[1];

        address freeReferrer;
        bool noFreeReferrer = true;

        for(uint i = 0; i < 126; i++) {
            if(users[referrals[i]].referral.length == REFERRER_1_LEVEL_LIMIT) {
                if(i < 62) {
                    referrals[(i+1)*2] = users[referrals[i]].referral[0];
                    referrals[(i+1)*2+1] = users[referrals[i]].referral[1];
                }
            }
            else {
                noFreeReferrer = false;
                freeReferrer = referrals[i];
                break;
            }
        }

        
        if(noFreeReferrer == true){
            // nothing found - default
            freeReferrer = userList[1];
        }

        return freeReferrer;
    }

    
    function viewLevelStats() public view returns(uint[10]  memory lvlUserCount) {
        for(uint c=1; c <= currUserID; c++) {    
            if(userList[c] != address(0)){
                for(uint lvl=1; lvl < 11; lvl ++) {
                    if(users[userList[c]].levelExpired[lvl] > now) {
                        lvlUserCount[lvl-1] += 1;
                    }
                }
            }
        }
    }

    function viewUserReferral(address _user) public view returns(address[] memory) {
        return users[_user].referral;
    }

    function viewUserLevelExpired(address _user, uint _level) public view returns(uint) {
        return users[_user].levelExpired[_level];
    }
    

    function bytesToAddress(bytes memory bys) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 20))
        }
    }


    function updateOpenState(bool _isOpen) public {
        require(msg.sender == ownerWallet);
        gameOpen = _isOpen;
    }

    // VANITY NAME VARS
    uint256 public VANITY_PRICE = 0.025 ether;

    mapping(bytes32 => address) public listVanityAddress; // key is vanity of address
    mapping(address => PlayerVanity) public playersVanity;
    struct PlayerVanity {
        string vanity;
        bool vanityStatus;
    }
    address[] public playersVanityAddressList;
    function playersVanityAddressListLen() public view returns (uint) {
        return playersVanityAddressList.length;
    }
    function playersVanityByID(uint _id) public view returns (address _addr, string memory _vanity) {
        _addr = playersVanityAddressList[_id];
        _vanity = playersVanity[_addr].vanity;
    }
    // VANITY NAME VARS


    /**
    * Action by vanity
    * Vanity referral links (Show vanity in cardholder box)
    */
    function buyVanity(string memory _vanity) public payable returns (bool) {

        /*--------------------- validate --------------------------------*/
        require(msg.value >= VANITY_PRICE);
        require(isVanityExisted(_vanity) == false);
        /*--------------------- handle --------------------------------*/

        if(playersVanity[msg.sender].vanityStatus == false) {
            playersVanityAddressList.push(msg.sender);
        }

        bool sent = address(uint160(ownerWallet)).send(msg.value);

        playersVanity[msg.sender].vanity = _vanity;
        playersVanity[msg.sender].vanityStatus = true;
        // update list vanity address
        listVanityAddress[convertStringToBytes32(_vanity)] = msg.sender;
        /*--------------------- event --------------------------------*/

        emit newVanityName(msg.sender, _vanity, now);
        
        return sent;
    }

    function isVanityExisted(string memory _vanity) public view returns(bool) {
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

}