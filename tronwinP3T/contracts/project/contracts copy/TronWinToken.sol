pragma solidity^0.4.25;

/**
*
*
*  Telegram: https://t.me/TronWinApp
*  Email: support (at) tronwin.app
*
* PLAY NOW: https://tronwin.app/
*  
* --- TRON WIN VAULT ------------------------------------------------
*
* 
*/






// https://github.com/tronprotocol/tron-contracts/blob/master/contracts/utils/SafeMath.sol
/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {

    /**
     * @dev Multiplies two numbers, reverts on overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

    /**
     * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0); // Solidity only automatically asserts when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Adds two numbers, reverts on overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

    /**
     * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}


// https://github.com/tronprotocol/tron-contracts/blob/master/contracts/tokens/TRC20/ITRC20.sol
/**
 * @title TRC20 interface (compatible with ERC20 interface)
 * @dev see https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 */
interface ITRC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address who) external view returns (uint256);

    function allowance(address owner, address spender)
    external view returns (uint256);

    function transfer(address to, uint256 value) external returns (bool);

    function approve(address spender, uint256 value)
    external returns (bool);

    function transferFrom(address from, address to, uint256 value)
    external returns (bool);

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}







// https://github.com/tronprotocol/tron-contracts/blob/master/contracts/tokens/TRC20/TRC20.sol


/**
 * @title Standard TRC20 token (compatible with ERC20 token)
 *
 * @dev Implementation of the basic standard token.
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md
 * Originally based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract TRC20 is ITRC20 {
    using SafeMath for uint256;


    // freezing tokens...
    mapping(address => uint) public tokensFrozen;



    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowed;

    uint256 private _totalSupply;

    /**
     * @dev Total number of tokens in existence
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Gets the balance of the specified address.
     * @param owner The address to query the balance of.
     * @return An uint256 representing the amount owned by the passed address.
     */
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }


    function balanceOfFrozen(address owner) public view returns (uint256) {
        return tokensFrozen[owner];
    }


    /**
     * @dev Function to check the amount of tokens that an owner allowed to a spender.
     * @param owner address The address which owns the funds.
     * @param spender address The address which will spend the funds.
     * @return A uint256 specifying the amount of tokens still available for the spender.
     */
    function allowance(
        address owner,
        address spender
    )
    public
    view
    returns (uint256)
    {
        if(tokensFrozen[owner] > _allowed[owner][spender]) 
            return 0;
        else
            return _allowed[owner][spender].sub(tokensFrozen[owner]);
    }

    /**
     * @dev Transfer token for a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) public returns (bool) {
        require(spender != address(0));

        _allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    )
    public
    returns (bool)
    {
        _allowed[from][msg.sender] = _allowed[from][msg.sender].sub(value);
        _transfer(from, to, value);
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param spender The address which will spend the funds.
     * @param addedValue The amount of tokens to increase the allowance by.
     */
    function increaseAllowance(
        address spender,
        uint256 addedValue
    )
    public
    returns (bool)
    {
        require(spender != address(0));

        _allowed[msg.sender][spender] = (
        _allowed[msg.sender][spender].add(addedValue));
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * approve should be called when allowed_[_spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * @param spender The address which will spend the funds.
     * @param subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseAllowance(
        address spender,
        uint256 subtractedValue
    )
    public
    returns (bool)
    {
        require(spender != address(0));

        _allowed[msg.sender][spender] = (
        _allowed[msg.sender][spender].sub(subtractedValue));
        emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
        return true;
    }

    /**
     * @dev Transfer token for a specified addresses
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0));

        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

    /**
     * @dev Internal function that mints an amount of the token and assigns it to
     * an account. This encapsulates the modification of balances such that the
     * proper events are emitted.
     * @param account The account that will receive the created tokens.
     * @param value The amount that will be created.
     */
    function _mint(address account, uint256 value) internal {
        require(account != address(0));

        _totalSupply = _totalSupply.add(value);
        _balances[account] = _balances[account].add(value);
        emit Transfer(address(0), account, value);
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account.
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burn(address account, uint256 value) internal {
        require(account != address(0));

        _totalSupply = _totalSupply.sub(value);
        _balances[account] = _balances[account].sub(value);
        emit Transfer(account, address(0), value);
    }

    /**
     * @dev Internal function that burns an amount of the token of a given
     * account, deducting from the sender's allowance for said account. Uses the
     * internal burn function.
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burnFrom(address account, uint256 value) internal {
        // Should https://github.com/OpenZeppelin/zeppelin-solidity/issues/707 be accepted,
        // this function needs to emit an event with the updated approval.
        _allowed[account][msg.sender] = _allowed[account][msg.sender].sub(
            value);
        _burn(account, value);
    }
}


contract TWN is TRC20 {
    uint constant _10m = 10000000000000;
    uint constant _1m = 1000000000000;


    // game settings
    uint256 public MIN_FREEZE = 1000000;
    
    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _cap;

    uint256 public tokensInPlay;
    uint public difficultyRelease = 1;
    uint public difficultyGroup = 1;

    uint public totalFrozen;


    address public owner;
    address public tokenBanker; // which contract manages the tokens on behalf of TronWin


    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyTokenBanker() {
        require(msg.sender == tokenBanker);
        _;
    }

    constructor () public {
        owner = msg.sender;
        tokenBanker = owner;
        _name = "TWN";
        _symbol = "TWN";
        _decimals = 6;
        _cap = 150000000000000;
        _mint(msg.sender,_cap);
        release_group_price[1][1] = 440000000;
        
        playersWithFrozenTokensAddresses.push(address(0));
    }

    function adjustDifficulty(uint _release, uint _group, uint _price) public onlyOwner {
        release_group_price[_release][_group] = _price;
    }

    /**
     * @return the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @return the symbol of the token.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @return the number of decimals of the token.
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }









    // mining difficulty price
    mapping(uint => mapping(uint => uint)) release_group_price;
    // [1][1] == 440
    // [1][2] == 441
    // [1][3] == 442
    // etc

    function getCurrentMiningDifficulty() public view returns(uint) {
        return release_group_price[difficultyRelease][difficultyGroup];
    }



    
    function debug_testDificulty(uint256 tokens) public view returns(uint _difficultyRelease, uint _difficultyGroup, uint _price) {
        _difficultyRelease = uint(  tokens / _10m) + 1; // working
        if(_difficultyRelease > 1){
            _difficultyGroup = tokens.sub(_difficultyRelease.sub(1).mul(_10m)).div(_1m) + 1; // correct
        } else
            _difficultyGroup = tokens.div(_1m) + 1; // correct

        _price = release_group_price[_difficultyRelease][_difficultyGroup];
    }


    // calculate new TWin tokens due to the player...
    // This contract is the owner of all unassigned tokens
    // e.g. spent 1 trx (1000000) =
    // 1000000 / 440000000 = 2272 TWin = 0.002272 TWin

    // player [to] mines [value] tokens...
    // tokenBanker has to own the tokens first
    function initTransfer(address to, uint256 valueSpent) external onlyTokenBanker() returns (bool) {
        uint value = valueSpent.mul(1000000).div(getCurrentMiningDifficulty());

        tokensInPlay = tokensInPlay.add(value);
        
        difficultyRelease = uint(  tokensInPlay / _10m) + 1; // working
        if(difficultyRelease > 1){
            difficultyGroup = tokensInPlay.sub(difficultyRelease.sub(1).mul(_10m)).div(_1m) + 1; // correct
        } else
            difficultyGroup = tokensInPlay.div(_1m) + 1; // correct
            
        _transfer(msg.sender, to,value);
        return true;
    }
    function debug_processPlayerPlay(uint _amnt) public view returns (uint _tokens) {
        uint _currentMiningDifficulty = getCurrentMiningDifficulty();
        _tokens = _amnt.mul(1000000).div(_currentMiningDifficulty);

    } 




    struct tokensToUnfreeze {
        address     playerAddress;
        uint256     amnt;
        uint256     startTS;
    }
    tokensToUnfreeze[]  pendingUnfreezes;

    mapping(address => uint) pendingUnfreezeByAddress;

    
    address[] playersWithFrozenTokensAddresses;
    mapping(address => uint) public playersWithFrozenTokens;
    
    function playersWithFrozenTokensLen() public view returns(uint) {
        return playersWithFrozenTokensAddresses.length;
    }
    function tokensFrozenByplayersWithFrozenTokensAddressesPos(uint256 _c) public view returns(uint _amnt, address _player) {
        _player = playersWithFrozenTokensAddresses[_c];
        _amnt = tokensFrozen[_player];
    }

    function freeze(uint _amnt) public {
        require(_amnt >= MIN_FREEZE);

        uint _balance = balanceOf(msg.sender);
        require(_balance > _amnt.add(tokensFrozen[msg.sender]), "Not enough tokens!");

        tokensFrozen[msg.sender] = tokensFrozen[msg.sender].add(_amnt);

        totalFrozen = totalFrozen.add(_amnt);

        if(playersWithFrozenTokens[msg.sender] == 0){
            playersWithFrozenTokensAddresses.push(msg.sender);
            playersWithFrozenTokens[msg.sender] = playersWithFrozenTokensAddresses.length-1;
        }
    }

    function unfreeze(uint _amnt) public {

        require(tokensFrozen[msg.sender] >= _amnt, "Not enough tokens frozen!");
        require(pendingUnfreezeByAddress[msg.sender].add(_amnt) <= tokensFrozen[msg.sender], "Not enough tokens frozen!");

        pendingUnfreezes.push(tokensToUnfreeze(msg.sender, _amnt, now));
        pendingUnfreezeByAddress[msg.sender] = pendingUnfreezeByAddress[msg.sender].add(_amnt);
    }



    function pendingUnfreezesLen() public view returns (uint) {
        return pendingUnfreezes.length;
    }
    function getPendingUnfreezesAtPos(uint _pos) public view onlyOwner() returns(address _player, uint _amnt, uint _startTS)  {
        _player = pendingUnfreezes[_pos].playerAddress;
        _amnt = pendingUnfreezes[_pos].amnt;
        _startTS = pendingUnfreezes[_pos].startTS;
    }
    function pendingUnfreezesAtPos(uint _pos) public onlyOwner() returns(address _player, uint _amnt, uint _startTS)  {
        _player = pendingUnfreezes[_pos].playerAddress;
        _amnt = pendingUnfreezes[_pos].amnt;
        

        if(_amnt > totalFrozen)
            totalFrozen = 0;
        else 
            totalFrozen = totalFrozen.sub(_amnt);

        if(_amnt > tokensFrozen[_player])
            tokensFrozen[_player] = 0;
        else
            tokensFrozen[_player] = tokensFrozen[_player].sub(_amnt); // free up the tokens

        if(_amnt > pendingUnfreezeByAddress[_player])
            pendingUnfreezeByAddress[_player] = 0;
        else 
            pendingUnfreezeByAddress[_player] = pendingUnfreezeByAddress[_player].sub(_amnt);

        _startTS = pendingUnfreezes[_pos].startTS;
        // find it and delete...
        bool haveFound = false;
        uint c;
        for(c = 0; c < pendingUnfreezes.length; c++) {
            if(pendingUnfreezes[c].playerAddress == _player && haveFound == false) {
                delete pendingUnfreezes[c];
                haveFound = true;
            } 

            if(haveFound && c+1 < pendingUnfreezes.length) {
                pendingUnfreezes[c] = pendingUnfreezes[c+1];
            }
        
        }
        pendingUnfreezes.length--;


        if(tokensFrozen[_player] == 0){
            // clean up
            for(c=0; c< playersWithFrozenTokensAddresses.length; c++) {
                if(playersWithFrozenTokensAddresses[c] == _player) {
                    haveFound = true;
                    delete playersWithFrozenTokensAddresses[c];   
                         
                } 

                if(haveFound && c+1 < playersWithFrozenTokensAddresses.length) {
                    playersWithFrozenTokensAddresses[c] = playersWithFrozenTokensAddresses[c+1];
                }
                
            }
            playersWithFrozenTokensAddresses.length --;
            delete playersWithFrozenTokens[_player];
            delete tokensFrozen[_player];
        }
    }


    // allow burning

    /**
     * @dev Burns a specific amount of tokens.
     * @param value The amount of token to be burned.
     */
    function burn(uint256 value) public {
        require(value <= balanceOf(msg.sender).sub(tokensFrozen[msg.sender]), "Too many tokens frozen to complete burn!");
        _burn(msg.sender, value);
    }

    /**
     * @dev Burns a specific amount of tokens from the target address and decrements allowance
     * @param from address The address which you want to send tokens from
     * @param value uint256 The amount of token to be burned
     */
    function burnFrom(address from, uint256 value) public {
        require(value <= balanceOf(from).sub(tokensFrozen[from]), "Too many tokens frozen to complete burn!");
        _burnFrom(from, value);
    }


    /// token freezing overrides...

    function transfer(address to, uint256 value) public returns (bool) {
        require(value <= balanceOf(msg.sender).sub(tokensFrozen[msg.sender]), "Too many tokens frozen to complete transfer!");
        super.transfer(to, value);
    }

    function approve(address spender, uint256 value) public returns (bool) {
        require(value <= balanceOf(spender).sub(tokensFrozen[spender]), "Too many tokens frozen to complete this approval!");
        super.approve(spender, value);
    }

    function increaseAllowance(address spender, uint256 addedValue)   public returns (bool)
    {
        require(addedValue.add(allowance(msg.sender,spender)) <= balanceOf(msg.sender).sub(tokensFrozen[msg.sender]), "Too many tokens frozen to complete this approval!");
        super.increaseAllowance(spender, addedValue);
    }
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(value <= balanceOf(from).sub(tokensFrozen[from]), "Too many tokens frozen to complete transfer!");
        super.transferFrom(from, to, value);
    }


    function updateTokenBanker(address _addr) public onlyOwner {
        tokenBanker = _addr;
    }


}