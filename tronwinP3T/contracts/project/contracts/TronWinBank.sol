pragma solidity^0.4.25;

/**
*
*
*  Telegram: https://t.me/TronWinApp
*  Email: support (at) tronwin.app
*
* PLAY NOW: https://tronwin.app/
*  
*
* --- COPYRIGHT ----------------------------------------------------------------
* 
*   This source code is provided for verification and audit purposes only and 
*   no license of re-use is granted.
*   
*   (C) Copyright 2019 TomoWin - A FutureConcepts Production
*   
*   
*   Sub-license, white-label, solidity, Eth, Tron, Tomo development enquiries 
*   please contact support (at) tomowin.app
*   
*   
* PLAY NOW: https://tronwin.app/
* 
*/



library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

library Percent {

  struct percent {
    uint num;
    uint den;
  }
  function mul(percent storage p, uint a) internal view returns (uint) {
    if (a == 0) {
      return 0;
    }
    return a*p.num/p.den;
  }

  function div(percent storage p, uint a) internal view returns (uint) {
    return a/p.num*p.den;
  }

  function sub(percent storage p, uint a) internal view returns (uint) {
    uint b = mul(p, a);
    if (b >= a) return 0;
    return a - b;
  }

  function add(percent storage p, uint a) internal view returns (uint) {
    return a + mul(p, a);
  }
}




interface TronWinVault {
    function gamingFundPayment(address _to, uint _amnt) external;
    function receiveExternalGameFundAsToken(uint256 amountTokenEligible) external payable;
    function getGameFund() external view returns (uint256);
    function get24hrTokenFund() external view returns (uint256);
    function maxShockDrop() external view returns (uint256);
    function tokenFundPayment(uint _tokenDay, address _to, uint _amnt) external;
    function processPlayerPlay(address _player, uint _amnt) external;
    function applyFundsAsTokenEligible(uint _amnt) external;

}

interface TronWinDaily {
    function receiveExternalDivs(uint amnt) external;
}

contract TronWinBank {
    
    using SafeMath for uint256;
    using Percent for Percent.percent;



    // Events
    // event_type
    // 0 = investment, 1 = reinvestment, 3 = sell

    event Action (
        uint16 indexed event_type,
        address indexed player,
        address to,
        uint256     amnt,
        uint256     amnt2,
        uint256     timestamp
        );

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);



    address owner;
    address devAddress;

    address jackpotAddress;


    

    // settings
    uint tokenPriceIncremental = 100;
    uint public tokenPrice = 500000;
    uint tokenBase = 1e6;


    uint256 public minInvestment = 500000;
    uint256 public maxInvestment = minInvestment * 10000;
    
    mapping (address => uint256) public referralIncome;
    
    
    mapping(address => bool) allowedContracts;
    
    modifier onlyAllowedContracts() {
        require(allowedContracts[msg.sender] == true);
        _;
    }


    uint256 public MIN_JACKPOT_INVESTMENT = 500000000; //500 trx
    uint256 public roundDuration = (24 hours); 
    uint256 internal roundSeed = 0;
    uint256 internal roundSeedDivs = 0;

    struct GameRound {
        uint totalInvested;        

        uint softDeadline;
        address lastInvestor;
        uint highestInvested;
        address highestInvestor;
        bool finalized;
        mapping (address => uint) roundInvested;
        mapping (address => bool) playerHasMinForJackpot;
        uint startTime;
    }
    uint public latestRoundID;// the first round has an ID of 0
    GameRound[] rounds;
    uint public totalJackpotsWon = 0;
    mapping(uint => address[]) playersInCurrentRoundWithMinPlay;
    mapping(uint => address[]) playersInCurrentRound;


    // jackpot is BANK
    // winners receive the BANK + any accumulated divs
    Percent.percent private m_roundJackpotWinnerShare = Percent.percent(40,100);
    Percent.percent private m_roundJackpotHighestShare = Percent.percent(30,100); 
    Percent.percent private m_roundJackpotRandomShare = Percent.percent(10,100);
    Percent.percent private m_roundJackpotSeedShare = Percent.percent(20,100);


    // entry fee split

    Percent.percent private m_entry_tokenPercent = Percent.percent(90, 100);
    Percent.percent private m_entry_devPercent = Percent.percent(2, 100);
    Percent.percent private m_entry_divPercent = Percent.percent(5, 100);
    Percent.percent private m_entry_refPercent = Percent.percent(1, 100);
    Percent.percent private m_entry_jackpotPercent = Percent.percent(2, 100);
    uint m_entry_sumCommission = 10;

    // exist fee split
    Percent.percent private m_exit_playerPercent = Percent.percent(90, 100);
    Percent.percent private m_exit_devPercent = Percent.percent(2, 100);
    Percent.percent private m_exit_divPercent = Percent.percent(2, 100);
    Percent.percent private m_exit_vaultTWNPercent = Percent.percent(25, 1000); // 2.5
    Percent.percent private m_exit_333Percent = Percent.percent(25, 1000); // 2.5
    
    Percent.percent private m_exit_jackpotPercent = Percent.percent(1, 100);

    // transfer fee
    Percent.percent private m_transfer_divPercent = Percent.percent(1, 100);
    


    bool public gamePaused = false;


    // game stats
    // total players
    address[] public players;

    // total invested = total tokens

    // total dividends paid
    uint public totalDividends;

    
    

    
    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier notOnPause() {
        require(gamePaused == false, "Game Paused");
        _;
    }
    
    modifier validPlayer() {
        require(msg.sender == tx.origin);
        _;
    }


    modifier checkRoundEnd() {
        if(rounds[latestRoundID].softDeadline < now) {
            finalizeAndRestart();
        }
        _;
    }


    TronWinVault tronwinVault_I = TronWinVault(0x82E5189D7FdC55947DFc42A9541a0B43DE615e5c); 
    TronWinDaily tronwinDaily_I = TronWinDaily(0x8307aCB4F0526f149C108D090978e0fd81D42368);

    constructor() public {

        owner = address(msg.sender);
        devAddress = owner;
        jackpotAddress = 0x99beB0d71C4B30621eF8c156B7e10C9FA47523dD;

        rounds.length++;
        latestRoundID = 0;
        rounds[0].lastInvestor = address(0);
        rounds[0].highestInvestor = address(0);
        rounds[0].highestInvested = 0;
        rounds[0].softDeadline = now + roundDuration;
        rounds[0].startTime = now;

    }


    function roundInfoInGame(uint roundID) external view 
        returns(
            address leader, 
            address highestInvestor,
            uint highestInvested,
            uint totalInvested,
            bool finalized,
            uint startTime,
            uint softDeadline,
            uint jackpotBank,
            uint jackpotDivs,
            uint _buyPrice,
            uint _sellPrice
        )
    {   
        leader = rounds[roundID].lastInvestor;
        highestInvestor = rounds[roundID].highestInvestor;
        highestInvested = rounds[roundID].highestInvested;

        totalInvested = rounds[roundID].totalInvested;
        finalized = rounds[roundID].finalized;
        startTime = rounds[roundID].startTime;
        softDeadline = rounds[roundID].softDeadline;
        jackpotBank = balanceOf[jackpotAddress];
        jackpotDivs = dividendsOwing(jackpotAddress) + trxDividends[jackpotAddress];
        _buyPrice = buyPrice();
        _sellPrice = sellPrice();
    } 

    function jackpotInfo() public view returns(uint bankHolding, uint divs) {
        bankHolding = balanceOf[jackpotAddress];
        divs = dividendsOwing(jackpotAddress) + trxDividends[jackpotAddress];
    }

    function playerInfo(address _player) public view returns(uint bankHolding, uint divs, uint refs) {
        bankHolding = balanceOf[_player];
        divs = dividendsOwing(_player) + trxDividends[_player];
        refs = referralIncome[_player];
    }

    function buyBANK(address _referer) public payable validPlayer notOnPause checkRoundEnd  {
        require(msg.value >= minInvestment);
        require(msg.value >= tokenPrice);

        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {

        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }

        doBuy(msg.sender, msg.value, _referer);
        
        emit Action(0, msg.sender, address(0), msg.value, 0,now);
        
    }

    function sellBANK(uint amount) public validPlayer notOnPause checkRoundEnd {

        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {

        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }

        doSell(msg.sender, amount);

        emit Action(3, msg.sender, address(0), amount, 0, now);
    }



    function reinvest() public validPlayer notOnPause  checkRoundEnd {

        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {

        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }

        update(msg.sender);

        uint amount = trxDividends[msg.sender] + referralIncome[msg.sender];

        
        require(amount >= minInvestment, "Investment too low!");

        trxDividends[msg.sender] = 0;
        referralIncome[msg.sender] = 0;

        ////doBuy(msg.sender, amount, address(0));

        uint tokenAmount = (m_entry_tokenPercent.mul(amount) * 1e6 / tokenPrice);

        
        totalSupply += tokenAmount + m_entry_jackpotPercent.mul(amount);
        totalDividendPoints += (m_entry_divPercent.mul(amount) * pointsMultiplier / totalSupply);

        
        // buy jackpot account tokens...
        balanceOf[jackpotAddress] += m_entry_jackpotPercent.mul(amount) * 1e6 / tokenPrice;

        totalDividends += m_entry_divPercent.mul(amount);
                

        balanceOf[msg.sender] += tokenAmount;
        emit Transfer(address(0), msg.sender, tokenAmount);

        uint devAmount = m_entry_devPercent.mul(amount) + m_entry_refPercent.mul(amount);

        tronwinVault_I.processPlayerPlay(msg.sender, amount); // mine TWN tokens...
        tronwinVault_I.gamingFundPayment(devAddress, devAmount);

        if(amount >= MIN_JACKPOT_INVESTMENT) {
            // mark as met current min amount for jackpot play
            if(rounds[latestRoundID].playerHasMinForJackpot[msg.sender] == true) {
            } else {
                playersInCurrentRoundWithMinPlay[latestRoundID].push(msg.sender);
                rounds[latestRoundID].playerHasMinForJackpot[msg.sender] = true;
            }

            if(rounds[latestRoundID].lastInvestor == msg.sender) {
            } else {
                rounds[latestRoundID].lastInvestor = msg.sender;
                emit Action(6,msg.sender,address(0),amount, 0,now);
            }

            rounds[latestRoundID].softDeadline = now + roundDuration;
            

            if(amount > rounds[latestRoundID].highestInvested) {
                rounds[latestRoundID].highestInvested = amount;
                rounds[latestRoundID].highestInvestor = msg.sender;
            }

        }
        rounds[latestRoundID].roundInvested[msg.sender] += amount;
        rounds[latestRoundID].totalInvested += amount;

        adjustTokenPrice(tokenAmount,true);


        /////










        
        emit Action(1, msg.sender, address(0), amount, 0, now);
    }


    function withdraw() public checkRoundEnd {
        update(msg.sender);
        uint256 amount = trxDividends[msg.sender] + referralIncome[msg.sender];
        trxDividends[msg.sender] = 0;
        referralIncome[msg.sender] = 0;

        tronwinVault_I.gamingFundPayment(msg.sender, amount);
    }


    // receive funds for external games...
    function deposit(uint _amnt) external onlyAllowedContracts {
        totalDividendPoints += (_amnt * pointsMultiplier / totalSupply);
        totalDividends += _amnt;
    }





    function finalizeAndRestart() public {
        finalizeLastRound();
        startNewRound();
    }
    
    
    function startNewRound() internal {
        require(rounds[latestRoundID].finalized, "Previous round not finalized");
        require(rounds[latestRoundID].softDeadline < now, "Previous round still running");

        uint _rID = rounds.length++; 
        GameRound storage rnd = rounds[_rID];
        latestRoundID = _rID;

        rnd.lastInvestor = address(0);
        rnd.highestInvestor = address(0);
        rnd.highestInvested = 0;
        rnd.startTime = now;
        rnd.softDeadline = now + roundDuration;

        roundSeed = 0;
        roundSeedDivs = 0;
    }

    function finalizeLastRound() internal {
        GameRound storage rnd = rounds[latestRoundID];
        require(!rnd.finalized, "Already finalized!");
        require(rnd.softDeadline < now, "Round still running!");


        // find vault winner

        if(balanceOf[jackpotAddress] > 0){

            if(rnd.lastInvestor == address(0)) {

                // rolls over to next round...


            } else {

                uint _tokens = balanceOf[jackpotAddress];
                uint _divs = dividendsOwing(jackpotAddress) + trxDividends[jackpotAddress];


                // last investor takes 40%
                if(_divs > 0)
                    trxDividends[rnd.lastInvestor] += m_roundJackpotWinnerShare.mul(_divs);

                balanceOf[rnd.lastInvestor] += m_roundJackpotWinnerShare.mul(_tokens);

                emit Action(2, rnd.lastInvestor, address(0), 
                    m_roundJackpotWinnerShare.mul(_divs),
                    m_roundJackpotWinnerShare.mul(_tokens),
                    now);


                // highest investor takes 30%...
                if(_divs > 0)
                    trxDividends[rnd.highestInvestor] += m_roundJackpotHighestShare.mul(_divs);

                balanceOf[rnd.highestInvestor] += m_roundJackpotHighestShare.mul(_tokens);

                emit Action(10, rnd.highestInvestor, address(0), 
                    m_roundJackpotHighestShare.mul(_divs),
                    m_roundJackpotHighestShare.mul(_tokens),
                    now);


                // random player takes 20%
                // choose random from playersInCurrentRound[latestRoundID][]
                // 
                uint _max = playersInCurrentRoundWithMinPlay[latestRoundID].length;
                uint _r = (uint(keccak256(abi.encodePacked(msg.sender, blockhash(block.number - 200), block.timestamp))) % _max);


                if(_divs > 0)
                    trxDividends[playersInCurrentRoundWithMinPlay[latestRoundID][_r]] += m_roundJackpotRandomShare.mul(_divs);

                balanceOf[playersInCurrentRoundWithMinPlay[latestRoundID][_r]] += m_roundJackpotRandomShare.mul(_tokens);

                emit Action(10, playersInCurrentRoundWithMinPlay[latestRoundID][_r], address(0), 
                    m_roundJackpotRandomShare.mul(_divs),
                    m_roundJackpotRandomShare.mul(_tokens),
                    now);

                // next round seed = 10%
                balanceOf[jackpotAddress] = m_roundJackpotSeedShare.mul(_tokens);

                totalJackpotsWon += _tokens;
                
            }

        }
        rnd.finalized = true;
    }





/*
// TOKEN functions
*/

    uint public totalDividendPoints;
    

    uint pointsMultiplier = 10e18;


    mapping(address => uint) public lastDividendPoints;
    mapping(address => uint) public trxDividends;

    function getRoundPlayersInRound(uint round) public view returns(address[] memory) {
        return playersInCurrentRound[round];
    }
    function getRoundPlayersRoundInvested(uint round, address player) public view returns(uint) {
        return rounds[round].roundInvested[player];
    }

    function viewDividends() public view returns(uint){
        return dividendsOwing(msg.sender) + trxDividends[msg.sender];
    }

    function dividendsOwing(address account) internal view returns(uint) {
        uint newDividendPoints = totalDividendPoints - lastDividendPoints[account];
        return (balanceOf[account] * newDividendPoints) / pointsMultiplier;
    }

    function update(address account) internal {
        uint owing = dividendsOwing(account);
        if(owing > 0) {

            trxDividends[account] += owing;
            lastDividendPoints[account] = totalDividendPoints;
        }
    }

    function doBuy(address account, uint amount, address _referer) internal {
        uint tokenAmount = (m_entry_tokenPercent.mul(amount) * 1e6 / tokenPrice);

        if(lastDividendPoints[account] == 0) {
            lastDividendPoints[account] = totalDividendPoints;
            players.push(account);
        } else {
            update(account);
        }

        if(totalSupply > 0) {
            totalSupply += tokenAmount + m_entry_jackpotPercent.mul(amount); //m_entry_tokenPercent.mul(amount);
            totalDividendPoints += (m_entry_divPercent.mul(amount) * pointsMultiplier / totalSupply);


        } else {
            totalDividendPoints += (m_entry_divPercent.mul(amount) * pointsMultiplier) / m_entry_tokenPercent.mul(amount);
            totalSupply = tokenAmount + m_entry_jackpotPercent.mul(amount); //m_entry_tokenPercent.mul(amount);
        }
        
        // buy jackpot account tokens...
        balanceOf[jackpotAddress] += m_entry_jackpotPercent.mul(amount) * 1e6 / tokenPrice;

        totalDividends += m_entry_divPercent.mul(amount);
        
        uint _referralEarning = 0;
        
        if(_referer != address(0x0) && _referer != account) {
            
            _referralEarning = m_entry_refPercent.mul(amount);

            referralIncome[_referer] += _referralEarning;

            emit Action (4, msg.sender, _referer, _referralEarning, 0, now);

        }
        

        balanceOf[account] += tokenAmount;
        emit Transfer(address(0), msg.sender, tokenAmount);

        uint devAmount;
        if(_referralEarning > 0)
            devAmount = m_entry_devPercent.mul(amount);
        else
            devAmount = m_entry_devPercent.mul(amount) + m_entry_refPercent.mul(amount);


        tronwinVault_I.receiveExternalGameFundAsToken.value(amount)(0); // only on a sale is TWN token holders paid divs
        tronwinVault_I.processPlayerPlay(account, amount); // mine TWN tokens...
        tronwinVault_I.gamingFundPayment(devAddress, devAmount);


        if(amount >= MIN_JACKPOT_INVESTMENT) {
            // mark as met current min amount for jackpot play
            if(rounds[latestRoundID].playerHasMinForJackpot[account] == true) {
            } else {
                playersInCurrentRoundWithMinPlay[latestRoundID].push(account);
                rounds[latestRoundID].playerHasMinForJackpot[account] = true;
            }

            if(rounds[latestRoundID].lastInvestor == account) {
            } else {
                rounds[latestRoundID].lastInvestor = account;
                emit Action(6,account,address(0),amount, 0,now);
            }

            rounds[latestRoundID].softDeadline = now + roundDuration;
            

            if(amount > rounds[latestRoundID].highestInvested) {
                rounds[latestRoundID].highestInvested = amount;
                rounds[latestRoundID].highestInvestor = account;
            }

        }
        rounds[latestRoundID].roundInvested[account] += amount;
        rounds[latestRoundID].totalInvested += amount;

        adjustTokenPrice(tokenAmount,true);
    }


    // amount here is token number NOT trx
    function doSell(address account, uint amount) internal {
        require(balanceOf[account] >= amount, "Not enough BANK!");
        if(lastDividendPoints[account] == 0) {
            lastDividendPoints[account] = totalDividendPoints;
            players.push(account);
        } else {
            update(account);
        }

        uint salePrice = amount * tokenPrice / 1e6;

        totalDividendPoints += (m_exit_divPercent.mul(salePrice) * pointsMultiplier / totalSupply);
        totalDividends += m_exit_divPercent.mul(salePrice);

        // jackpot buy (At buy price)
        balanceOf[jackpotAddress] += m_exit_jackpotPercent.mul(amount) * 1e6 / tokenPrice;

        // dev
        tronwinVault_I.gamingFundPayment(devAddress, m_exit_devPercent.mul(salePrice));

        // allocate the player their sale amount..
        trxDividends[account] += m_exit_playerPercent.mul(salePrice);
        
        // apply the vault/twn divs...
        tronwinVault_I.applyFundsAsTokenEligible(m_exit_vaultTWNPercent.mul(salePrice));

        // apply the 333 divs
        tronwinDaily_I.receiveExternalDivs(m_exit_333Percent.mul(salePrice));

        balanceOf[account] -= amount;
        totalSupply -= (amount - m_exit_jackpotPercent.mul(amount));
        emit Transfer(account, address(0), amount);

        adjustTokenPrice(amount,false);

    }
    

    string public name = "TWN_BANK";
    string public symbol = "BNK";
    uint8 public decimals = 6;

    uint256 public totalSupply = 0;
    

    mapping(address => uint256) public balanceOf;
    
    mapping(address => uint256) public dividendBalanceOf;

    

    mapping(address => uint256) public dividendCreditedTo;

 
    mapping(address => mapping(address => uint256)) public allowance;

    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value);

        if(lastDividendPoints[msg.sender] == 0) {
            lastDividendPoints[msg.sender] = totalDividendPoints;
            players.push(msg.sender);
        } else {
            update(msg.sender);        // <-- added to simple ERC20 contract
        }

        if(lastDividendPoints[to] == 0) {
            lastDividendPoints[to] = totalDividendPoints;
            players.push(to);
        } else {
            update(to);          // <-- added to simple ERC20 contract
        }

        // distribute m_transfer_divPercent
        uint transferFee = m_transfer_divPercent.mul(value);
        uint transferFeeTRX = transferFee * tokenPrice / 1e6;

        balanceOf[msg.sender] -= value;
        value -= transferFee; // minus the transfer fee (In tokens)
        totalDividendPoints += transferFeeTRX;
        totalDividends += transferFeeTRX;
        // end of transfer fee

        balanceOf[to] += value;

        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value)
        public
        returns (bool success)
    {
        require(value <= balanceOf[from]);
        require(value <= allowance[from][msg.sender]);


        if(lastDividendPoints[from] == 0) {
            lastDividendPoints[from] = totalDividendPoints;
            players.push(from);
        } else {
            update(from);        // <-- added to simple ERC20 contract
        }

        if(lastDividendPoints[to] == 0) {
            lastDividendPoints[to] = totalDividendPoints;
            players.push(to);
        } else {
            update(to);          // <-- added to simple ERC20 contract
        }
        

        // distribute m_transfer_divPercent
        uint transferFee = m_transfer_divPercent.mul(value);
        uint transferFeeTRX = transferFee * tokenPrice / 1e6;

        balanceOf[msg.sender] -= value;
        value -= transferFee; // minue the transfer fee (In tokens)
        totalDividendPoints += transferFeeTRX;
        totalDividends += transferFeeTRX;
        // end of transfer fee

        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }




    function approve(address spender, uint256 value)
        public
        returns (bool success)
    {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }




    function adjustTokenPrice(uint tokenChange, bool isBuy) internal {
        if(isBuy)
            tokenPrice += (tokenChange  * tokenPriceIncremental / tokenBase);
        else
            if(tokenPrice - (tokenChange * tokenPriceIncremental / tokenBase) < tokenBase)
                tokenPrice = tokenBase;
            else
                tokenPrice -= (tokenChange * tokenPriceIncremental / tokenBase);
    }


    function sellPrice() public view returns (uint256) {
        return m_exit_playerPercent.mul(tokenPrice);
    }

    function buyPrice() public view returns (uint256) {
        return (tokenPrice * 100) / (100-m_entry_sumCommission) + 1;
    }



/*
// end of token functions
*/






    function() external {   
    }
    function pay() public payable {
    }







    
    // Owner only functions    
    function p_setNewOwners(uint16 _type, address _addr) public onlyOwner {
        if(_type==0){
            owner = _addr;
        }
        if(_type==1){
            devAddress = _addr;    
        }
    }





    function p_setMinInvestment(uint _minInvestment) public onlyOwner {
        minInvestment = _minInvestment;
    }
    function p_setMaxInvestment(uint _maxInvestment) public onlyOwner {
        maxInvestment = _maxInvestment;
    }
    function p_setGamePaused(bool _gamePaused) public onlyOwner {
        gamePaused = _gamePaused;
    }



    function p_setAllowedContracts(address _addr, bool _perm) public onlyOwner {
        allowedContracts[_addr] = _perm;
    }



    function p_1(uint _type, uint _val, uint _val2) public onlyOwner {


        if(_type==1)
            m_entry_tokenPercent = Percent.percent(_val, _val2);
        if(_type==2)
            m_entry_devPercent = Percent.percent(_val, _val2);
        if(_type==3)
            m_entry_divPercent = Percent.percent(_val, _val2);
        if(_type==4)
            m_entry_refPercent = Percent.percent(_val, _val2);
        if(_type==5)
            m_entry_jackpotPercent = Percent.percent(_val, _val2);
        if(_type==6)
            m_entry_sumCommission = _val;



        if(_type==10){
            m_exit_playerPercent = Percent.percent(_val, _val2);
        }

        if(_type==11){
            m_exit_devPercent = Percent.percent(_val, _val2);
        }

        if(_type==12){
            m_exit_divPercent = Percent.percent(_val, _val2);
        }
        if(_type==13)
            m_exit_vaultTWNPercent = Percent.percent(_val, _val2);

        if(_type==14)
            m_exit_333Percent = Percent.percent(_val, _val2);


        if(_type==20)
            MIN_JACKPOT_INVESTMENT = _val;
        if(_type==21)
            roundDuration = _val;


        if(_type==22)
            tokenPriceIncremental = _val;

    }

    function updateVault(address _addr) public onlyOwner {
        tronwinVault_I = TronWinVault(_addr);
    }

    function updateDaily(address _addr) public onlyOwner {
        tronwinDaily_I = TronWinDaily(_addr);
    }


    function getContractBalance() internal view returns (uint) {
      return address(this).balance;
    }



    // Util functions
    function min(uint x, uint y) internal pure returns (uint z) {
        return x <= y ? x : y;
    }

    function percent(uint numerator, uint denominator, uint precision) internal pure returns(uint quotient) {
         // caution, check safe-to-multiply here
        uint _numerator  = numerator * 10 ** (precision+1);
        // with rounding of last digit
        uint _quotient =  ((_numerator / denominator) + 5) / 10;
        return ( _quotient);
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;

        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }


    
    uint op;
    function gameOp() external {
        op++;
    }






}