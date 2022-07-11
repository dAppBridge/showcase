/**
 *Submitted for verification at Etherscan.io on 2020-07-15
*/

/**
 * 
 * 
 * 
 * ██████╗░░██████╗░█████╗░███╗░░░███╗░█████╗░████████╗██████╗░██╗██╗░░██╗
 * ██╔══██╗██╔════╝██╔══██╗████╗░████║██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝
 * ██████╦╝╚█████╗░██║░░╚═╝██╔████╔██║███████║░░░██║░░░██████╔╝██║░╚███╔╝░
 * ██╔══██╗░╚═══██╗██║░░██╗██║╚██╔╝██║██╔══██║░░░██║░░░██╔══██╗██║░██╔██╗░
 * ██████╦╝██████╔╝╚█████╔╝██║░╚═╝░██║██║░░██║░░░██║░░░██║░░██║██║██╔╝╚██╗
 * ╚═════╝░╚═════╝░░╚════╝░╚═╝░░░░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░╚═╝╚═╝╚═╝░░╚═╝
 * 
 * 
 *  https://BSCMATRIX.com
 *  | Multiply your BNB!
 *  | Home of the $MATRIX token!
 *  | Earn lifetime dividends too!
 *  
**/


pragma solidity ^0.5.0;



interface IBEP20mintable {
  /**
   * @dev Returns the amount of tokens in existence.
   */
  function totalSupply() external view returns (uint256);

  /**
   * @dev Returns the token decimals.
   */
  function decimals() external view returns (uint8);

  /**
   * @dev Returns the token symbol.
   */
  function symbol() external view returns (string memory);

  /**
  * @dev Returns the token name.
  */
  function name() external view returns (string memory);

  /**
   * @dev Returns the bep token owner.
   */
  function getOwner() external view returns (address);

  /**
   * @dev Returns the amount of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256);

  /**
   * @dev Moves `amount` tokens from the caller's account to `recipient`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address recipient, uint256 amount) external returns (bool);

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address _owner, address spender) external view returns (uint256);

  /**
   * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   * Emits an {Approval} event.
   */
  function approve(address spender, uint256 amount) external returns (bool);

  /**
   * @dev Moves `amount` tokens from `sender` to `recipient` using the
   * allowance mechanism. `amount` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  
  
  function mintingFinished() external view returns(bool);
  function mint(address to, uint256 amount) external returns (bool);
  

  /**
   * @dev Emitted when `value` tokens are moved from one account (`from`) to
   * another (`to`).
   *
   * Note that `value` may be zero.
   */
  event Transfer(address indexed from, address indexed to, uint256 value);

  /**
   * @dev Emitted when the allowance of a `spender` for an `owner` is set by
   * a call to {approve}. `value` is the new allowance.
   */
  event Approval(address indexed owner, address indexed spender, uint256 value);
  
  
  // STAKING
  function createStakeFor(address _staker, uint256 _stake) external;
  function removeStakeFor(address _staker, uint256 _stake) external;
  function setAutoStake(address _staker, bool _enabled) external;
  function totalStakes() external view returns(uint256);
  function stakeOf(address _stakeholder) external view returns(uint256);
}

contract BSCMATRIX {
    
    struct User {
        uint id;
        address referrer;
        uint partnersCount;
        
        mapping(uint8 => bool) activeX3Levels;
        mapping(uint8 => bool) activeX6Levels;
        
        mapping(uint8 => X3) x3Matrix;
        mapping(uint8 => X6) x6Matrix;
        
        mapping(uint8 => uint) x3MatrixEarnings;
        mapping(uint8 => uint) x6MatrixEarnings;


        uint divsClaimed; 
    }
    
    struct X3 {
        address currentReferrer;
        address[] referrals;
        bool blocked;
        uint reinvestCount;
    }
    
    struct X6 {
        address currentReferrer;
        address[] firstLevelReferrals;
        address[] secondLevelReferrals;
        bool blocked;
        uint reinvestCount;

        address closedPart;
    }

    uint8 public constant LAST_LEVEL = 12;
    uint8 public DIV_PERCENT = 200; // == 2.00%
    uint16 internal constant DIV_DIVISOR = 10000;

    mapping(address => User) public users;
    mapping(uint => address) public idToAddress;

    bool public gameOpen = true; // DEV
    

    uint public totalDivs;
    
    struct stakeItem {
        uint256 period;
        uint256 amount;
    }
    
    mapping(uint => uint) public divPools;
    mapping(address => mapping(uint => bool)) public divsClaimed;
    //mapping(address => mapping(uint => uint)) public playerStakesByPeriod; // player->period->amount
    mapping(address => mapping(uint => stakeItem)) public playerStakesByPeriods;

    mapping(uint => uint) public totalStakedByPeriod;
    
    uint public divPoolDuration = 2 minutes; //1 weeks; // DEV TESTING
    uint public currentDivPoolId = 0;
    uint public currentDivPoolStartTs = now;
    

    uint public lastUserId = 2;
    address public owner;
    address internal admin;
    
    mapping(uint8 => uint) public levelPrice;
    mapping(uint8 => uint8) public matrixRewards;

    
    IBEP20mintable public MATRIXtoken = IBEP20mintable(0x51F8A5ECaAE69EE06C6ce168633f7D5F076cA561);
    
    event Registration(address indexed user, address indexed referrer, uint indexed userId, uint referrerId);
    event Reinvest(address indexed user, address indexed currentReferrer, address indexed caller, uint8 matrix, uint8 level);
    event Upgrade(address indexed user, address indexed referrer, uint8 matrix, uint8 level);
    event NewUserPlace(address indexed user, address indexed referrer, uint8 matrix, uint8 level, uint8 place);
    event MissedFundsReceive(address indexed receiver, address indexed from, uint8 matrix, uint8 level);
    event SentExtraFundsDividends(address indexed from, address indexed receiver, uint8 matrix, uint8 level);
    
    
    
    modifier checkDivPeriod() {
        if(currentDivPoolStartTs + divPoolDuration < now) {
            currentDivPoolId++;
            currentDivPoolStartTs = now;
        }
        _;
    }
    
    constructor(address ownerAddress) public {
        admin = msg.sender;
                        
        levelPrice[1] = 0.025 ether; //25000000000000000 == 0.025 BNB
        matrixRewards[1] = 1; // 1 MATRIX token reward for level 1 MATRIX, doubling each level
        for (uint8 i = 2; i <= LAST_LEVEL; i++) {
            levelPrice[i] = levelPrice[i-1] * 2;
            matrixRewards[i] = matrixRewards[i-1] * 2;
        }
        
        owner = ownerAddress;
        
        User memory user = User({
            id: 1,
            referrer: address(0),
            partnersCount: uint(0),
            divsClaimed: 0
        });
        
        users[ownerAddress] = user;
        idToAddress[1] = ownerAddress;
        
        for (uint8 i = 1; i <= LAST_LEVEL; i++) {
            users[ownerAddress].activeX3Levels[i] = true;
            users[ownerAddress].activeX6Levels[i] = true;
        }

    }
    
    function updateGameOpen(bool _gameOpen) public {
        require(msg.sender == admin, "Only Admin");
        gameOpen = _gameOpen;
    }
    
    function() external payable {
        if(msg.data.length == 0) {
            return registration(msg.sender, owner, false);
        }
        
        registration(msg.sender, bytesToAddress(msg.data), false);
    }

    function registrationExt(address referrerAddress, bool _enableAutoStake) external payable {
        require(gameOpen == true, "Game not yet open!");
        registration(msg.sender, referrerAddress,_enableAutoStake);
    }
    
    function buyNewLevel(uint8 matrix, uint8 level) checkDivPeriod external payable {
        require(gameOpen == true, "Game not yet open!");
        require(isUserExists(msg.sender), "user is not exists. Register first.");
        require(matrix == 1 || matrix == 2, "invalid matrix");
        require(msg.value == levelPrice[level], "invalid price");
        require(level > 1 && level <= LAST_LEVEL, "invalid level");

        if(viewDivs(msg.sender) > 0){
            sendDivs(msg.sender);
        } else {
        }

        divPools[currentDivPoolId] += (msg.value * DIV_PERCENT / DIV_DIVISOR);
        totalDivs += (msg.value * DIV_PERCENT / DIV_DIVISOR);

        mineMATRIX(level);

        if (matrix == 1) {
            require(!users[msg.sender].activeX3Levels[level], "level already activated");

            if (users[msg.sender].x3Matrix[level-1].blocked) {
                users[msg.sender].x3Matrix[level-1].blocked = false;
            }
    
            address freeX3Referrer = findFreeX3Referrer(msg.sender, level);

            if(freeX3Referrer == owner){
                if(viewDivs(owner) > 0)
                    sendDivs(owner);
            }

            users[msg.sender].x3Matrix[level].currentReferrer = freeX3Referrer;
            users[msg.sender].activeX3Levels[level] = true;
            updateX3Referrer(msg.sender, freeX3Referrer, level);
            
            emit Upgrade(msg.sender, freeX3Referrer, 1, level);

        } else {
            require(!users[msg.sender].activeX6Levels[level], "level already activated"); 

            if (users[msg.sender].x6Matrix[level-1].blocked) {
                users[msg.sender].x6Matrix[level-1].blocked = false;
            }

            address freeX6Referrer = findFreeX6Referrer(msg.sender, level);

            if(freeX6Referrer == owner){
                if(viewDivs(owner) > 0)
                    sendDivs(owner);
            } 
            users[msg.sender].activeX6Levels[level] = true;
            updateX6Referrer(msg.sender, freeX6Referrer, level);
            
            emit Upgrade(msg.sender, freeX6Referrer, 2, level);
        }
    }    
    
    //50000000000000000
    function registration(address userAddress, address referrerAddress, bool _enableAutoStake) checkDivPeriod private {
        require(msg.value == 0.05 ether, "registration cost 0.05 BNB");
        require(!isUserExists(userAddress), "user exists");
        require(isUserExists(referrerAddress), "referrer not exists");

        uint32 size;
        assembly {
            size := extcodesize(userAddress)
        }
        require(size == 0, "cannot be a contract");

        User memory user = User({
            id: lastUserId,
            referrer: referrerAddress,
            partnersCount: 0,
            divsClaimed: 0
        });
        
        MATRIXtoken.setAutoStake(msg.sender, _enableAutoStake);
        
        users[userAddress] = user;
        idToAddress[lastUserId] = userAddress;
        
        users[userAddress].referrer = referrerAddress;
        
        users[userAddress].activeX3Levels[1] = true; 
        users[userAddress].activeX6Levels[1] = true;
    

        divPools[currentDivPoolId] += (msg.value * DIV_PERCENT / DIV_DIVISOR);
        totalDivs += (msg.value * DIV_PERCENT / DIV_DIVISOR);
        
        // For REGISTRATION we call the mine tokens for level 2
        // even though the player is actually at level 1... this
        // is due to the fact that REGISTRATIONs buy into both 
        // MATRIX systems (x3 and x6).  Cheaper on GAS to call 
        // this way rather than call minMATRIX(1) twice.
        mineMATRIX(2); 
  
        lastUserId++;
        
        users[referrerAddress].partnersCount++;

        address freeX3Referrer = findFreeX3Referrer(userAddress, 1);
        address freeX6Ref = findFreeX6Referrer(userAddress, 1);

        users[userAddress].x3Matrix[1].currentReferrer = freeX3Referrer;
        updateX3Referrer(userAddress, freeX3Referrer, 1);

        updateX6Referrer(userAddress, freeX6Ref, 1);
        emit Registration(userAddress, referrerAddress, users[userAddress].id, users[referrerAddress].id);
    }
    
    
    

    //mapping(address => mapping(uint => stakeItem)) public playerStakesByPeriods;
    function stake(uint256 _stake) checkDivPeriod public {
        
        // checkpoint divs first
        claimDivs();
        
        MATRIXtoken.createStakeFor(msg.sender, _stake);
        playerStakesByPeriods[msg.sender][currentDivPoolId].period = currentDivPoolId;
        playerStakesByPeriods[msg.sender][currentDivPoolId].amount = MATRIXtoken.stakeOf(msg.sender);
        //playerStakesByWeek[msg.sender][currentDivPoolId] = MATRIXtoken.stakeOf(msg.sender);
        totalStakedByPeriod[currentDivPoolId] = MATRIXtoken.totalStakes();
    }
    function unstake(uint256 _stake) checkDivPeriod public {
        MATRIXtoken.removeStakeFor(msg.sender, _stake);
        //playerStakesByWeek[msg.sender][currentDivPoolId] = MATRIXtoken.stakeOf(msg.sender);
        playerStakesByPeriods[msg.sender][currentDivPoolId].period = currentDivPoolId;
        playerStakesByPeriods[msg.sender][currentDivPoolId].amount = MATRIXtoken.stakeOf(msg.sender);
        totalStakedByPeriod[currentDivPoolId] = MATRIXtoken.totalStakes();
    }
    
    function mineMATRIX(uint8 _level) internal {

        MATRIXtoken.mint(msg.sender, matrixRewards[_level] * 1e18);
        
        playerStakesByPeriods[msg.sender][currentDivPoolId].period = currentDivPoolId;
        playerStakesByPeriods[msg.sender][currentDivPoolId].amount = MATRIXtoken.stakeOf(msg.sender);
        
        totalStakedByPeriod[currentDivPoolId] = MATRIXtoken.totalStakes();
    }

    function viewDivsPercent(address _player) public view returns(uint) {
        uint totalStaked = MATRIXtoken.totalStakes();
        uint playerStaked = MATRIXtoken.stakeOf(_player);
        if(totalStaked == 0 || playerStaked ==0) return 0;
        return  playerStaked * 10000  / totalStaked;
    }


    function viewDivs(address _player) public view returns(uint) {
        if(currentDivPoolId == 0)
            return 0;
            
        uint divsAvailable = 0;
        uint baseStake = playerStakesByPeriods[_player][0].amount;
        
        for(uint i=0; i < currentDivPoolId; i++) {
            
            if(playerStakesByPeriods[_player][i].period > 0 && i > 0) {
                // player changed stake in this period...
                baseStake = playerStakesByPeriods[_player][i].amount;
            }
            
            if( totalStakedByPeriod[i] > 0 && baseStake > 0 && divsClaimed[_player][i] == false) {
                divsAvailable += 
                        divPools[i]
                            * baseStake / totalStakedByPeriod[i];
            }
        }
        return divsAvailable;

    }
    function viewDivsAvailableByPeriod(address _player, uint _period) public view returns (uint) {
        // find the last stake prior to this period...
        if(divsClaimed[_player][_period] == true)
            return 0;
            
        uint divsAvailable = 0;
        uint baseStake = playerStakesByPeriods[_player][0].amount;

        for(uint i=1; i <= _period ; i++) {
            if(playerStakesByPeriods[_player][i].period > 0) {
                // player changed their stake in this period (could be to 0)...
                baseStake = playerStakesByPeriods[_player][i].amount;
            }
        }

        if(baseStake > 0)
        divsAvailable = 
                divPools[_period]
                    * baseStake / totalStakedByPeriod[_period];
                    
        return divsAvailable;
    }

    function claimDivs() checkDivPeriod public returns(bool) {
        uint _divAmount = viewDivs(msg.sender);
        if(_divAmount > 0)
            sendDivs(msg.sender);
    }

    function sendDivs(address _user) internal returns(bool) {
        uint _divAmount = viewDivs(_user);
        //divPot -= _divAmount;
        
        uint baseStake = playerStakesByPeriods[_user][0].amount;
        
        for(uint i=0; i < currentDivPoolId; i++) {
                if(playerStakesByPeriods[_user][i].period > 0 && i > 0) {
                    // player changed stake in this period (which could be to 0)...
                    baseStake = playerStakesByPeriods[_user][i].amount;
                }
            
                if(totalStakedByPeriod[i] > 0 && baseStake > 0 && divsClaimed[_user][i] == false) {
                    divsClaimed[_user][i] = true;
                }
        }
        
        users[_user].divsClaimed += _divAmount;
        
        return address(uint160(_user)).send(_divAmount);    
    }





    function updateX3Referrer(address userAddress, address referrerAddress, uint8 level) private {
        users[referrerAddress].x3Matrix[level].referrals.push(userAddress);

        if (users[referrerAddress].x3Matrix[level].referrals.length < 3) {
            emit NewUserPlace(userAddress, referrerAddress, 1, level, uint8(users[referrerAddress].x3Matrix[level].referrals.length));
            return sendPartnerFunds(referrerAddress, userAddress, 1, level);
        }
        
        emit NewUserPlace(userAddress, referrerAddress, 1, level, 3);
        users[referrerAddress].x3Matrix[level].referrals = new address[](0);
        if (!users[referrerAddress].activeX3Levels[level+1] && level != LAST_LEVEL) {
            users[referrerAddress].x3Matrix[level].blocked = true;
        }

        // Short-circuits to save Energy
        if (referrerAddress != owner) {
            address freeReferrerAddress = findFreeX3Referrer(referrerAddress, level);
            if (users[referrerAddress].x3Matrix[level].currentReferrer != freeReferrerAddress) {
                users[referrerAddress].x3Matrix[level].currentReferrer = freeReferrerAddress;
            }
            
            users[referrerAddress].x3Matrix[level].reinvestCount++;
            emit Reinvest(referrerAddress, freeReferrerAddress, userAddress, 1, level);
            updateX3Referrer(referrerAddress, freeReferrerAddress, level);
        } else {
            sendPartnerFunds(owner, userAddress, 1, level);
            users[owner].x3Matrix[level].reinvestCount++;
            emit Reinvest(owner, address(0), userAddress, 1, level);
        }
    }


    function updateX6Referrer(address userAddress, address referrerAddress, uint8 level) private {

        require(users[referrerAddress].activeX6Levels[level], "500. Referrer level is inactive");

        if (users[referrerAddress].x6Matrix[level].firstLevelReferrals.length < 2) { 
            users[referrerAddress].x6Matrix[level].firstLevelReferrals.push(userAddress); 
            emit NewUserPlace(userAddress, referrerAddress, 2, level, uint8(users[referrerAddress].x6Matrix[level].firstLevelReferrals.length));
            
            users[userAddress].x6Matrix[level].currentReferrer = referrerAddress; 

            // Short-circuits to save Energy
            if (referrerAddress == owner) {
                return sendPartnerFunds(referrerAddress, userAddress, 2, level);
            }
            
            address ref = users[referrerAddress].x6Matrix[level].currentReferrer;        
            users[ref].x6Matrix[level].secondLevelReferrals.push(userAddress);  
            
            uint len = users[ref].x6Matrix[level].firstLevelReferrals.length; 
            
            if ((len == 2) && 
                (users[ref].x6Matrix[level].firstLevelReferrals[0] == referrerAddress) &&
                (users[ref].x6Matrix[level].firstLevelReferrals[1] == referrerAddress)) {
                if (users[referrerAddress].x6Matrix[level].firstLevelReferrals.length == 1) {
                    emit NewUserPlace(userAddress, ref, 2, level, 5);
                } else {
                    emit NewUserPlace(userAddress, ref, 2, level, 6);
                }
            }  else if ((len == 1 || len == 2) &&
                    users[ref].x6Matrix[level].firstLevelReferrals[0] == referrerAddress) {
                if (users[referrerAddress].x6Matrix[level].firstLevelReferrals.length == 1) {
                    emit NewUserPlace(userAddress, ref, 2, level, 3);
                } else {
                    emit NewUserPlace(userAddress, ref, 2, level, 4);
                }
            } else if (len == 2 && users[ref].x6Matrix[level].firstLevelReferrals[1] == referrerAddress) {
                if (users[referrerAddress].x6Matrix[level].firstLevelReferrals.length == 1) {
                    emit NewUserPlace(userAddress, ref, 2, level, 5);
                } else {
                    emit NewUserPlace(userAddress, ref, 2, level, 6); 
                }
            }
            
            return updateX6ReferrerSecondLevel(userAddress, ref, level);
        }
        
        users[referrerAddress].x6Matrix[level].secondLevelReferrals.push(userAddress);

        if (users[referrerAddress].x6Matrix[level].closedPart != address(0)) {
            if ((users[referrerAddress].x6Matrix[level].firstLevelReferrals[0] == 
                users[referrerAddress].x6Matrix[level].firstLevelReferrals[1]) &&
                (users[referrerAddress].x6Matrix[level].firstLevelReferrals[0] ==
                users[referrerAddress].x6Matrix[level].closedPart)) {

                updateX6(userAddress, referrerAddress, level, true);
                return updateX6ReferrerSecondLevel(userAddress, referrerAddress, level);
            } else if (users[referrerAddress].x6Matrix[level].firstLevelReferrals[0] == 
                users[referrerAddress].x6Matrix[level].closedPart) {
                updateX6(userAddress, referrerAddress, level, true);
                return updateX6ReferrerSecondLevel(userAddress, referrerAddress, level);
            } else {
                updateX6(userAddress, referrerAddress, level, false);
                return updateX6ReferrerSecondLevel(userAddress, referrerAddress, level);
            }
        }

        if (users[referrerAddress].x6Matrix[level].firstLevelReferrals[1] == userAddress) {
            updateX6(userAddress, referrerAddress, level, false);
            return updateX6ReferrerSecondLevel(userAddress, referrerAddress, level);
        } else if (users[referrerAddress].x6Matrix[level].firstLevelReferrals[0] == userAddress) {
            updateX6(userAddress, referrerAddress, level, true);
            return updateX6ReferrerSecondLevel(userAddress, referrerAddress, level);
        }
        
        if (users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[0]].x6Matrix[level].firstLevelReferrals.length <= 
            users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[1]].x6Matrix[level].firstLevelReferrals.length) {
            updateX6(userAddress, referrerAddress, level, false);
        } else {
            updateX6(userAddress, referrerAddress, level, true);
        }
        
        updateX6ReferrerSecondLevel(userAddress, referrerAddress, level);
    }

    function updateX6(address userAddress, address referrerAddress, uint8 level, bool x2) private {
        if (!x2) {
            users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[0]].x6Matrix[level].firstLevelReferrals.push(userAddress);
            emit NewUserPlace(userAddress, users[referrerAddress].x6Matrix[level].firstLevelReferrals[0], 2, level, uint8(users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[0]].x6Matrix[level].firstLevelReferrals.length));
            emit NewUserPlace(userAddress, referrerAddress, 2, level, 2 + uint8(users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[0]].x6Matrix[level].firstLevelReferrals.length));
            
            users[userAddress].x6Matrix[level].currentReferrer = users[referrerAddress].x6Matrix[level].firstLevelReferrals[0];
        } else {
            users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[1]].x6Matrix[level].firstLevelReferrals.push(userAddress);
            emit NewUserPlace(userAddress, users[referrerAddress].x6Matrix[level].firstLevelReferrals[1], 2, level, uint8(users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[1]].x6Matrix[level].firstLevelReferrals.length));
            emit NewUserPlace(userAddress, referrerAddress, 2, level, 4 + uint8(users[users[referrerAddress].x6Matrix[level].firstLevelReferrals[1]].x6Matrix[level].firstLevelReferrals.length));
            
            users[userAddress].x6Matrix[level].currentReferrer = users[referrerAddress].x6Matrix[level].firstLevelReferrals[1];
        }
    }
    
    function updateX6ReferrerSecondLevel(address userAddress, address referrerAddress, uint8 level) private {
        if (users[referrerAddress].x6Matrix[level].secondLevelReferrals.length < 4) {
            
            return sendPartnerFunds(referrerAddress, userAddress, 2, level);
        }
        
        address[] memory x6 = users[users[referrerAddress].x6Matrix[level].currentReferrer].x6Matrix[level].firstLevelReferrals;
        
        if (x6.length == 2) {
            if (x6[0] == referrerAddress ||
                x6[1] == referrerAddress) {
                users[users[referrerAddress].x6Matrix[level].currentReferrer].x6Matrix[level].closedPart = referrerAddress;
            } else if (x6.length == 1) {
                if (x6[0] == referrerAddress) {
                    users[users[referrerAddress].x6Matrix[level].currentReferrer].x6Matrix[level].closedPart = referrerAddress;
                }
            }
        }
        
        users[referrerAddress].x6Matrix[level].firstLevelReferrals = new address[](0);
        users[referrerAddress].x6Matrix[level].secondLevelReferrals = new address[](0);
        users[referrerAddress].x6Matrix[level].closedPart = address(0);

        if (!users[referrerAddress].activeX6Levels[level+1] && level != LAST_LEVEL) {
            users[referrerAddress].x6Matrix[level].blocked = true;
        }

        users[referrerAddress].x6Matrix[level].reinvestCount++;
        
        // Short-circuits to save Energy
        if (referrerAddress != owner) {
            address freeReferrerAddress = findFreeX6Referrer(referrerAddress, level);

            emit Reinvest(referrerAddress, freeReferrerAddress, userAddress, 2, level);
            updateX6Referrer(referrerAddress, freeReferrerAddress, level);
        } else {
            emit Reinvest(owner, address(0), userAddress, 2, level);
            sendPartnerFunds(owner, userAddress, 2, level);
        }
    }
    
    function findFreeX3Referrer(address userAddress, uint8 level) public view returns(address) {
        while (true) {
            if (users[users[userAddress].referrer].activeX3Levels[level]) {
                return users[userAddress].referrer;
            }
            
            userAddress = users[userAddress].referrer;
        }
    }
    
    function findFreeX6Referrer(address userAddress, uint8 level) public view returns(address) {
        while (true) {
            if (users[users[userAddress].referrer].activeX6Levels[level]) {
                return users[userAddress].referrer;
            }
            
            userAddress = users[userAddress].referrer;
        }
    }


    

    function usersActiveLevelsAll(address userAddress) public view returns(bool[13] memory x3LevelsActive, bool[13] memory x6LevelsActive) {
        for(uint8 c=1; c< 13; c++){
            x3LevelsActive[c] = users[userAddress].activeX3Levels[c];
            x6LevelsActive[c] = users[userAddress].activeX6Levels[c];
        }
    }
    
    function usersHighestLevels(address userAddress) public view returns(uint8 x3HighestLevel, uint8 x6HighestLevel) {
        for(uint8 c=1; c< 13; c++){
            if(users[userAddress].activeX3Levels[c])
                x3HighestLevel = c;
                
            if(users[userAddress].activeX6Levels[c])
                x6HighestLevel = c;
        }     
    }
    function usersActiveX3Levels(address userAddress, uint8 level) public view returns(bool) {
        return users[userAddress].activeX3Levels[level];
    }
    function usersActiveX6Levels(address userAddress, uint8 level) public view returns(bool) {
        return users[userAddress].activeX6Levels[level];
    }

    function userEarnings(address userAddress, uint8 level) public view returns(uint x3MatrixEarnings, uint x6MatrixEarnings) {
        x3MatrixEarnings = users[userAddress].x3MatrixEarnings[level];
        x6MatrixEarnings = users[userAddress].x6MatrixEarnings[level];
    }

    function userEarningsAll(address userAddress) public view returns(uint[13] memory x3MatrixEarnings, uint[13] memory x6MatrixEarnings){
    
        for(uint8 c=1; c< 13; c++){
            x3MatrixEarnings[c] = users[userAddress].x3MatrixEarnings[c];
            x6MatrixEarnings[c] = users[userAddress].x6MatrixEarnings[c];
        }
    }

    function usersX3Matrix(address userAddress, uint8 level) public view returns(address, address[] memory, bool) {
        return (users[userAddress].x3Matrix[level].currentReferrer,
                users[userAddress].x3Matrix[level].referrals,
                users[userAddress].x3Matrix[level].blocked);
    }


    function usersX6Matrix(address userAddress, uint8 level) public view returns(address, address[] memory, address[] memory, bool, address) {
        return (users[userAddress].x6Matrix[level].currentReferrer,
                users[userAddress].x6Matrix[level].firstLevelReferrals,
                users[userAddress].x6Matrix[level].secondLevelReferrals,
                users[userAddress].x6Matrix[level].blocked,
                users[userAddress].x6Matrix[level].closedPart);
    }



    
    function isUserExists(address user) public view returns (bool) {
        return (users[user].id != 0);
    }

    function findFundsReceiver(address userAddress, address _from, uint8 matrix, uint8 level) private returns(address, bool) {
        address receiver = userAddress;
        bool isExtraDividends;
        if (matrix == 1) {
            while (true) {
                if (users[receiver].x3Matrix[level].blocked) {
                    emit MissedFundsReceive(receiver, _from, 1, level);
                    isExtraDividends = true;
                    receiver = users[receiver].x3Matrix[level].currentReferrer;
                } else {
                    return (receiver, isExtraDividends);
                }
            }
        } else {
            while (true) {
                if (users[receiver].x6Matrix[level].blocked) {
                    emit MissedFundsReceive(receiver, _from, 2, level);
                    isExtraDividends = true;
                    receiver = users[receiver].x6Matrix[level].currentReferrer;
                } else {
                    return (receiver, isExtraDividends);
                }
            }
        }
    }

    // Sends BNB earnings direct to parent (P2P)
    function sendPartnerFunds(address userAddress, address _from, uint8 matrix, uint8 level) private {

        (address receiver, bool isExtraDividends) = findFundsReceiver(userAddress, _from, matrix, level);


        address(uint160(receiver)).transfer(
            levelPrice[level] - (levelPrice[level] * DIV_PERCENT / DIV_DIVISOR)
        );

        
        if(matrix == 1)
            users[receiver].x3MatrixEarnings[level] += levelPrice[level] - (levelPrice[level] * DIV_PERCENT / DIV_DIVISOR);
        else
            users[receiver].x6MatrixEarnings[level] += levelPrice[level] - (levelPrice[level] * DIV_PERCENT / DIV_DIVISOR);

        
        if (isExtraDividends) {
            emit SentExtraFundsDividends(_from, receiver, matrix, level);
        }
    }
    
    function checkcheckDivPeriod() checkDivPeriod public {
        return;
    }
    
    
    // helper method for UI stats
    function divStats(address _player) public view returns (
        uint256 _currentDivPoolId,
        uint256 _currentDivPoolStartTs,
        uint256 _divPoolDuration,
        uint256 _divPoolSize,
        uint256 _playerPercent,
        uint256 _playerDivs,
        uint256 _lastUserId,
        uint256 _totalDivs) {
            
            _currentDivPoolId = currentDivPoolId;
            _currentDivPoolStartTs = currentDivPoolStartTs;
            _divPoolDuration = divPoolDuration;
            _divPoolSize = divPools[currentDivPoolId];
            _playerPercent = viewDivsPercent(_player);
            _playerDivs = viewDivs(_player);
            _lastUserId = lastUserId;
            _totalDivs = totalDivs;
            
    }

    function setMATRIXtoken(address _tokenAddr) public {
        require(msg.sender == admin, "Only Admin");
        MATRIXtoken = IBEP20mintable(_tokenAddr);
    }
    
    function bytesToAddress(bytes memory bys) private pure returns (address addr) {
        assembly {
            addr := mload(add(bys, 20))
        }
    }
}