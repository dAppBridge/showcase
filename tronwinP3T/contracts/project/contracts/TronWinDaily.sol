pragma solidity^0.4.25;

/**
*
*
*  Telegram: https://t.me/TronWinApp
*  Discord: https://discord.gg/uJhnKcE
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
*   (C) Copyright 2019 TronWin - A FutureConcepts Production
*   
*   
*   Sub-license, white-label, solidity, Eth, Tron, Tomo development enquiries 
*   please contact support (at) tronwin.app
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

interface TronWinBank {
    function deposit(uint _amnt) external;
} 

contract TronWinDaily {
    
    using SafeMath for uint256;
    using Percent for Percent.percent;



    // Events
    // event_type
    // 0 = investment, 1 = reinvestment, 2 = vault won, 3 = external trx dist, 
    // 5 referral earned, 6 new round leader,
    
    // 10 = highest player vault prize won
    // 11 = random vault prize won
    event Action (
        uint16 indexed event_type,
        address indexed from,
        address to,
        uint256     amnt, 
        string      data,
        uint256     timestamp
        );




    address owner;
    address devAddress;

    mapping(address => bool) allowedContracts;

    modifier onlyAllowedContracts() {
        require(allowedContracts[msg.sender] == true);
        _;
    }


    struct Player {
        uint256 totalInvestment;
        uint256 totalReInvested;
        uint256 startTime;
        uint256 totalWithdrawn;
        uint256 totalDivsLocked;
        uint256 lastActivity;


        uint totalReturns; // Total balance = returns + referral returns + jackpots/bonus Prize 
        uint refReturns; // how much of the total is from referrals
    }
    mapping (address => Player) investmentPlayers;
    address[] public players;


    uint256 public totalInvestors;


    // jackpot clock runs for 1hr
    // resets every MIN_JACKPOT_INVESTMENT
    // at end of period:
    //  leader wins: 40% of pot
    //  highest investor wins 30%
    //  random investor wins 10%
    //  20% seeds next jackpot
    uint256 public MIN_JACKPOT_INVESTMENT = 500000000; //500 trx
    uint256 public roundDuration = (4 hours); 
    uint256 internal roundSeed = 0;

    Percent.percent private m_roundJackpotWinnerShare = Percent.percent(40,100);
    Percent.percent private m_roundJackpotHighestShare = Percent.percent(30,100);
    Percent.percent private m_roundJackpotRandomShare = Percent.percent(10,100);
    Percent.percent private m_roundJackpotSeedShare = Percent.percent(20,100);

    // settings
    uint256 public INVESTMENT_PRICE = 5000000; // 5 trx
    uint256 public minInvestment = INVESTMENT_PRICE;
    uint256 public maxInvestment = INVESTMENT_PRICE * 10000;
    


    uint256 public cashOutTWNRate_early     = 40000000; // 40 TRX::1 TWN (Of TRX invested)
    uint256 public cashOutTWNRate_afterROI  = 20000000; // 30 TRX::1 TWN
    uint256 public TWN_miningrate           = 440000000;
    bool public cashOutEnabled              = true;

    Percent.percent private m_investorsPercent = Percent.percent(65, 100); // dividend split
    Percent.percent private m_currentRoundJackpotPercent = Percent.percent(20, 100);
    
    Percent.percent private m_refPercent = Percent.percent(3, 100);    
    Percent.percent private m_devMarketingPercent = Percent.percent(5, 100); // dev + marketing
    Percent.percent private m_twnHoldersPercent = Percent.percent(6, 100);
    Percent.percent private m_bankHoldersPercent = Percent.percent(2, 100);






    uint m_maxFundUsage = 80; 

    uint public totalFundPaid;
    uint public totalFundUsed;
    uint public trx_invested;




    Percent.percent private m_dailyInterest = Percent.percent(333,1000);

    
    
    struct GameRound {
        uint totalInvested;        
        uint jackpot;

        uint softDeadline;
        uint price;
        address lastInvestor;
        uint highestInvested;
        address highestInvestor;
        bool finalized;
        mapping (address => uint) roundInvested;
        mapping (address => bool) playerHasMinForJackpot;
        uint startTime;
    }

    




    uint256 public trx_distributed;



    mapping(uint => address[]) playersInCurrentRound;
    mapping(uint => address[]) playersInCurrentRoundWithMinPlay;


    modifier validPlayer() {
        require(msg.sender == tx.origin);
        _;
    }



    function getRoundPlayersInRound(uint round) public view returns(address[] memory) {
        return playersInCurrentRound[round];
    }
    function getRoundPlayersRoundInvested(uint round, address player) public view returns(uint) {
        return rounds[round].roundInvested[player];
    }



    uint public latestRoundID;// the first round has an ID of 0
    GameRound[] rounds;



    bool public gamePaused = false;

    
    

    uint public totalJackpotsWon = 0;



    
    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier notOnPause() {
        require(gamePaused == false, "Game Paused");
        _;
    }
    

    
    TronWinVault tronwinVault_I = TronWinVault(0x82E5189D7FdC55947DFc42A9541a0B43DE615e5c);// mainnet
    //TronWinVault tronwinVault_I = TronWinVault(0xeF3e4CDF53b13355dDa6741a38c3945a23462eCa);// shasta
    TronWinBank tronwinBank_I = TronWinBank(0x1BE1B9cd9bB522A42529f42d9F8F6a6bf851bf91); // mainnet

    //TronWinDaily tronwinDaily_I = TronWinDaily(0xEE43bC4463a24558EBA05a6A88A65d220C3220A9); // shasta
    TronWinDaily tronwinDaily_I = TronWinDaily(0x8307aCB4F0526f149C108D090978e0fd81D42368); // shasta

    bool public upgradeComplete = false;

    constructor() public {

        owner = address(msg.sender);
        devAddress = owner;
        

        // populate players first..

        

        // then the round info..

        rounds.length++;
        
        latestRoundID = 0;

        rounds[0].lastInvestor = address(0);
        rounds[0].highestInvestor = address(0);
        rounds[0].highestInvested = 0;
        rounds[0].price = INVESTMENT_PRICE;

        rounds[0].softDeadline = now + roundDuration;

        rounds[0].jackpot = 0;

        rounds[0].startTime = now;
    }

    function upgrade_populatePlayers() public onlyOwner {
        require(upgradeComplete == false);
        uint _invested;
        uint _reinvested;
        uint _totalWithdrawn;
        uint _totalReturns;
        uint _refReturns;
        uint _divs;
        uint _divsLocked;

        for(uint c=0; c < tronwinDaily_I.totalInvestors(); c++) {
            address _player = tronwinDaily_I.players(c);
            (
                _invested,
                _reinvested,
                _totalWithdrawn,
                _totalReturns,
                _refReturns,
                _divs,
                _divsLocked
            ) = tronwinDaily_I.investorInfo(_player);

            investmentPlayers[_player] = Player(
                _invested,
                _reinvested,
                now,
                _totalWithdrawn,
                _divsLocked + _divs, 
                now,
                _totalReturns,
                _refReturns
                );

            players.push(_player);

            totalInvestors++;
        }
    }

    function upgrade_baseStats() public onlyOwner {
        require(upgradeComplete == false);
        totalFundPaid = tronwinDaily_I.totalFundPaid();
        totalFundUsed = tronwinDaily_I.totalFundUsed();
        trx_invested =tronwinDaily_I.trx_invested();
        trx_distributed = tronwinDaily_I.trx_distributed();
        totalJackpotsWon = tronwinDaily_I.totalJackpotsWon();
    }

    function update_rounds() public onlyOwner {
        require(upgradeComplete == false);
        address _leader;
        address _highestInvestor;
        uint[5] memory _data;
        /*
        uint _highestInvested; // 0
        uint _jackpot; // 1
        uint _totalInvested; //2
        
        uint _startTime;// 3
        uint _softDeadline; //4
        */
        bool _finalized;

        for(uint c=0; c <= tronwinDaily_I.latestRoundID(); c++){
            //(_leader, _highestInvestor, _highestInvested, _jackpot,
            //_totalInvested, _finalized, _startTime, _softDeadline) = tronwinDaily_I.roundInfoInGame(c);


            (_leader, _highestInvestor, _data[0], _data[1],
            _data[2], _finalized, _data[3], _data[4]) = tronwinDaily_I.roundInfoInGame(c);

            if(c ==0) {

            } else {
                rounds.length++;
            }

            latestRoundID = c;

            rounds[latestRoundID].totalInvested = _data[2];
            rounds[latestRoundID].jackpot = _data[1];

            rounds[latestRoundID].softDeadline = _data[4];
            rounds[latestRoundID].price = INVESTMENT_PRICE;
            rounds[latestRoundID].lastInvestor = _leader;
            rounds[latestRoundID].highestInvested = _data[0];
            rounds[latestRoundID].highestInvestor = _highestInvestor;
            rounds[latestRoundID].finalized = _finalized;
            //mapping (address => uint) roundInvested;
            //mapping (address => bool) playerHasMinForJackpot;
            rounds[latestRoundID].startTime = _data[3];

        }
    }


    function update_roundsMinPlay1(uint _r, address _addr, uint _i) public onlyOwner {
        require(upgradeComplete == false);

        rounds[_r].playerHasMinForJackpot[_addr] = true;

        rounds[_r].roundInvested[_addr] = _i;

        playersInCurrentRound[_r].push(_addr);
    }
    function update_roundsMinPlay0(uint _r, address _addr, uint _i) public onlyOwner {
        require(upgradeComplete == false);

        rounds[_r].roundInvested[_addr] = _i;

        playersInCurrentRound[_r].push(_addr);
    }

    function update_complete() public onlyOwner {
        upgradeComplete = true;
    }


    function() external {   
    }
    function pay() public payable {
    }






    function investorInfo(address investor) external view
    returns(uint invested, uint reinvested, uint totalWithdrawn, uint totalReturns, uint refReturns, uint divs, uint divsLocked) 
    {
        invested = investmentPlayers[investor].totalInvestment;
        reinvested = investmentPlayers[investor].totalReInvested;
        totalWithdrawn = investmentPlayers[investor].totalWithdrawn;
        totalReturns = investmentPlayers[investor].totalReturns;
        refReturns = investmentPlayers[investor].refReturns;

        divs = getDividends(investor);
        divsLocked = investmentPlayers[investor].totalDivsLocked;
    }


    function roundInfoInGame(uint roundID) external view 
        returns(
            address leader, 
            address highestInvestor,
            uint highestInvested,
            uint jackpot,  
            uint totalInvested,
            bool finalized,
            uint startTime,

            uint softDeadline
        )
    {   


        
        leader = rounds[roundID].lastInvestor;
        highestInvestor = rounds[roundID].highestInvestor;
        highestInvested = rounds[roundID].highestInvested;


        totalInvested = rounds[roundID].totalInvested;

        jackpot = rounds[roundID].jackpot;
        
        finalized = rounds[roundID].finalized;

        startTime = rounds[roundID].startTime;

        softDeadline = rounds[roundID].softDeadline;

    } 



        
    function roundKeyPrice(uint roundID) external view returns(uint) {
        return rounds[roundID].price;
    }
    





    function playerReturns(address investor) public view validPlayer 
    returns (uint totalReturns, uint refReturns) 
    {
        totalReturns = investmentPlayers[investor].totalReturns;
        refReturns = investmentPlayers[investor].refReturns;
    }

    function withdrawReturns() public validPlayer {

        if(totalFundUsed > 0) {
            uint _vaultFund = tronwinVault_I.getGameFund();
            require( totalFundUsed * 100 / _vaultFund <= m_maxFundUsage, "Daily using too much of the fund at the moment!");
        }
        transferPlayerDivs(msg.sender);

        // add in any locked divs...
        investmentPlayers[msg.sender].totalReturns += investmentPlayers[msg.sender].totalDivsLocked;
        

        require(investmentPlayers[msg.sender].totalReturns > 0, "Nothing to withdraw!");

        uint256 _totalReturns = investmentPlayers[msg.sender].totalReturns; // includes referral bonus

        investmentPlayers[msg.sender].totalReturns = 0;
        investmentPlayers[msg.sender].refReturns = 0;
        investmentPlayers[msg.sender].totalDivsLocked = 0;
        investmentPlayers[msg.sender].totalWithdrawn = investmentPlayers[msg.sender].totalWithdrawn.add(_totalReturns);
        tronwinVault_I.gamingFundPayment(msg.sender, _totalReturns);

        totalFundUsed += _totalReturns;

    }



    // ROI Progress / cash out methods
    function totalTRXInvested() public view returns (uint) {
        return investmentPlayers[msg.sender].totalInvestment - investmentPlayers[msg.sender].totalReInvested;
    }

    function totalDivsEarned() public view returns (uint) {
        return investmentPlayers[msg.sender].totalWithdrawn + getDividends(msg.sender);
    }

    function cashoutToTWN() public validPlayer {
        require(investmentPlayers[msg.sender].totalInvestment > 0);
        require(cashOutEnabled == true);

        // need to reinvest any divs first...
        transferPlayerDivs(msg.sender);

        // total TRX invested = totalInvestment - totalReInvested
        uint totalTRXinvested = investmentPlayers[msg.sender].totalInvestment - investmentPlayers[msg.sender].totalReInvested;


        if(totalDivsEarned() >= totalTRXinvested) {
            // has ROI!
            tronwinVault_I.processPlayerPlay(msg.sender, 
                investmentPlayers[msg.sender].totalInvestment  / cashOutTWNRate_afterROI * TWN_miningrate);

        } else {
            //
            tronwinVault_I.processPlayerPlay(msg.sender, 
                investmentPlayers[msg.sender].totalInvestment  / cashOutTWNRate_early * TWN_miningrate);
        }

        investmentPlayers[msg.sender].totalInvestment = 0;
        investmentPlayers[msg.sender].lastActivity = now;
    }

    function cashoutToTWNView() public view returns(uint) {
        // total TRX invested = totalInvestment - totalReInvested
        uint totalTRXinvested = investmentPlayers[msg.sender].totalInvestment - investmentPlayers[msg.sender].totalReInvested;

        if(totalDivsEarned() >= totalTRXinvested) {
            // has ROI!
            return (investmentPlayers[msg.sender].totalInvestment  / cashOutTWNRate_afterROI * TWN_miningrate) / TWN_miningrate;

        } else {
            //
            return (investmentPlayers[msg.sender].totalInvestment  / cashOutTWNRate_early * TWN_miningrate) / TWN_miningrate;
        }
    }


    function transferPlayerDivs(address _player) internal {
        uint256 _divs = getDividends(_player);
        if(_divs == 0)
            return;

        investmentPlayers[_player].lastActivity = now;
        investmentPlayers[_player].totalDivsLocked = investmentPlayers[_player].totalDivsLocked.add(_divs);
    }



    
    function finalizeLastRound() public {
        GameRound storage rnd = rounds[latestRoundID];
        _finalizeRound(rnd);
    }


    function finalizeAndRestart(address _referer) public payable validPlayer {
        finalizeLastRound();
        startNewRound(_referer);
    }
    
    
    function startNewRound(address _referer) public payable validPlayer {
        
        require(rounds[latestRoundID].finalized, "Previous round not finalized");
        require(rounds[latestRoundID].softDeadline < now, "Previous round still running");
        


        uint _rID = rounds.length++; // first round is 0
        GameRound storage rnd = rounds[_rID];
        latestRoundID = _rID;

        rnd.lastInvestor = address(0);
        rnd.highestInvestor = address(0);
        rnd.highestInvested = 0;
        rnd.price = INVESTMENT_PRICE;
        rnd.startTime = now;
        rnd.softDeadline = now + roundDuration;

        

        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {
        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }


        rnd.jackpot = roundSeed;
        roundSeed = 0;
        // need to reinvest any divs first...
        transferPlayerDivs(msg.sender);
        _purchase(rnd, msg.value, _referer, true);
        emit Action(0, msg.sender, address(0), msg.value, "", now);

    }



    function reinvestFull() public validPlayer  {        
        GameRound storage rnd = rounds[latestRoundID];
        

        // need to reinvest any divs first...
        transferPlayerDivs(msg.sender);

        // add in any lockedDivs
        investmentPlayers[msg.sender].totalReturns += investmentPlayers[msg.sender].totalDivsLocked;

        uint value = investmentPlayers[msg.sender].totalReturns;

        require(value > 0, "Can't spend what you don't have");

        investmentPlayers[msg.sender].totalReturns = 0;
        investmentPlayers[msg.sender].refReturns = 0;
        investmentPlayers[msg.sender].totalDivsLocked = 0;
        investmentPlayers[msg.sender].totalWithdrawn = investmentPlayers[msg.sender].totalWithdrawn.add(value);

        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {
        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }
        
        _purchase(rnd, value, address(0), false);
        emit Action(1, msg.sender, address(0), value, "", now);
    }

    function reinvestReturns(uint value, address ref) public validPlayer  {        
        GameRound storage rnd = rounds[latestRoundID];
        

        // need to reinvest any divs first...
        transferPlayerDivs(msg.sender);


        require(
                investmentPlayers[msg.sender].totalReturns.add(investmentPlayers[msg.sender].totalDivsLocked) >= value, 
                "Can't spend what you don't have");


        // spend locked divs first...
        if(value > investmentPlayers[msg.sender].totalDivsLocked) {

        
            investmentPlayers[msg.sender].totalReturns = investmentPlayers[msg.sender].totalReturns.sub(value.sub(investmentPlayers[msg.sender].totalDivsLocked));
            investmentPlayers[msg.sender].refReturns = min(investmentPlayers[msg.sender].refReturns, investmentPlayers[msg.sender].totalReturns);

            investmentPlayers[msg.sender].totalDivsLocked = 0;

        } else {

            investmentPlayers[msg.sender].totalDivsLocked = investmentPlayers[msg.sender].totalDivsLocked.sub(value);
        
        }



        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {

        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }

        
        _purchase(rnd, value, ref, false);
        emit Action(1, msg.sender, address(0), value, "", now);
    }

    function invest(address _referer) public payable notOnPause validPlayer {
        require(msg.value >= minInvestment);
        if(rounds.length > 0) {
            GameRound storage rnd = rounds[latestRoundID];   


            if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {

            } else {
                playersInCurrentRound[latestRoundID].push(msg.sender);
            }

            // need to reinvest any divs first...
            transferPlayerDivs(msg.sender);

            _purchase(rnd, msg.value, _referer, true);
            emit Action(0, msg.sender, address(0), msg.value, "", now);

        } else {
            revert("Not yet started");
        }
        
    }

    function _purchase(GameRound storage rnd, uint value, address referer, bool isNewInvestment) internal  {
        require(now >= rnd.startTime, "Round not started!");
        require(rnd.softDeadline >= now, "After deadline!");
        require(value >= rnd.price, "Not enough TRX!");


        if(isNewInvestment){
            rnd.totalInvested += value;
            trx_invested += value;
        }


        if(investmentPlayers[msg.sender].startTime == 0) {
            // first investment
            totalInvestors++;
            investmentPlayers[msg.sender].startTime = now;
            players.push(msg.sender);
        }

        
        investmentPlayers[msg.sender].totalInvestment += value;
        
        if(!isNewInvestment)
            investmentPlayers[msg.sender].totalReInvested += value;


        investmentPlayers[msg.sender].lastActivity = now;
        
        if(value >= MIN_JACKPOT_INVESTMENT) {

            // mark as met current min amount for jackpot play

            if(rounds[latestRoundID].playerHasMinForJackpot[msg.sender] == true) {
            } else {
                playersInCurrentRoundWithMinPlay[latestRoundID].push(msg.sender);
                rounds[latestRoundID].playerHasMinForJackpot[msg.sender] = true;
            }


            if(rnd.lastInvestor == msg.sender) {
            } else {
                emit Action(6,msg.sender,address(0),value,"",now);
            }


            rnd.softDeadline = now + roundDuration;
            rnd.lastInvestor = msg.sender;


            if(value > rnd.highestInvested) {
                rnd.highestInvested = value;
                rnd.highestInvestor = msg.sender;
            }

        }

        rnd.roundInvested[msg.sender] = rnd.roundInvested[msg.sender].add(value);

        _splitRevenue(rnd, value, referer, isNewInvestment);

        // Mine TWN tokens...
        tronwinVault_I.processPlayerPlay(msg.sender,value);
    }



    function _splitRevenue(GameRound storage rnd, uint value, address ref, bool _isNewInvestment) internal {
        uint _extraTWN = 0;
        uint _referralEarning =  m_refPercent.mul(value);
        //uint _tokenEligible = m_twnHoldersPercent.mul(value);

        if(ref != address(0x0) && ref != msg.sender) {
            
            investmentPlayers[ref].totalReturns += _referralEarning;
            investmentPlayers[ref].refReturns += _referralEarning;
            

            emit Action (5, msg.sender, ref, _referralEarning, "", now);

        } else {
            // no referrer - goes to TWN holders!
            _extraTWN = _referralEarning;
        }


        if(_isNewInvestment == true){
            // transfer the funds to the vault...
            tronwinVault_I.receiveExternalGameFundAsToken.value(value)(m_twnHoldersPercent.mul(value) + _extraTWN); 

        } else {
            // mark TWN eligibale
            tronwinVault_I.applyFundsAsTokenEligible(m_twnHoldersPercent.mul(value) + _extraTWN); 
        }

        // dev payment
        tronwinVault_I.gamingFundPayment(devAddress, m_devMarketingPercent.mul(value));

        // mark bank divs
        tronwinBank_I.deposit(m_bankHoldersPercent.mul(value));


        //uint dev_value = value.sub(_tokenEligible);
        //uint roundReturns = m_investorsPercent.mul(value); // how much to pay in dividends to players
        //dev_value = dev_value.sub(roundReturns);
        //dev_value = dev_value.sub(_referralEarning);
        
        totalFundPaid += m_investorsPercent.mul(value);

        rnd.jackpot = rnd.jackpot.add(m_currentRoundJackpotPercent.mul(value));
    }

    // receive div boost from external contracts (e.g. BANK sales)
    function receiveExternalDivs(uint amnt) external onlyAllowedContracts {
        totalFundPaid += amnt;
    }


    function getDividends(address _address) public view returns (uint256) {

        uint256 minsSinceInvestment = now.sub(investmentPlayers[_address].lastActivity).div(1 minutes);

        // 3.33% of their total investment = how much players earn each day
        uint256 percent = m_dailyInterest.mul(investmentPlayers[_address].totalInvestment); 

        // show it in minutes since last investment...
        uint256 balance = percent.mul(minsSinceInvestment).div(14400);

        //return balance;
        return balance;
    }


    function getTotalDivs() public view returns (uint256) {
        uint _totalDivs;
        for(uint c=0; c< totalInvestors; c++) {
            _totalDivs = _totalDivs.add(investmentPlayers[players[c]].totalWithdrawn);
            _totalDivs = _totalDivs.add(investmentPlayers[players[c]].totalDivsLocked);
            _totalDivs = _totalDivs.add(getDividends(players[c]));
        }
        return _totalDivs;
    }



    // jackpot clock runs for 1hr
    // resets every MIN_JACKPOT_INVESTMENT
    // at end of period:
    //  leader wins: 40% of pot
    //  highest investor wins 30%
    //  random investor wins 20%
    //  10% seeds next jackpot

    function _finalizeRound(GameRound storage rnd) internal {
        require(!rnd.finalized, "Already finalized!");
        require(rnd.softDeadline < now, "Round still running!");


        // find vault winner

        if(rnd.jackpot > 0){

            if(rnd.lastInvestor == address(0)) {

                // house win takes 5%
                // rest goes to div pot!
                tronwinVault_I.gamingFundPayment(devAddress,m_devMarketingPercent.mul(rnd.jackpot));
                totalFundPaid += rnd.jackpot.sub(m_devMarketingPercent.mul(rnd.jackpot));

            } else {


                // last investor takes 40%
                investmentPlayers[rnd.lastInvestor].totalReturns += 
                    m_roundJackpotWinnerShare.mul(rnd.jackpot);

                emit Action(2, rnd.lastInvestor, address(0), 
                    rnd.jackpot
                    ,"", now);

                // highest investor takes 30%...
                investmentPlayers[rnd.highestInvestor].totalReturns += 
                                    m_roundJackpotHighestShare.mul(rnd.jackpot);


                emit Action(10, rnd.highestInvestor, address(0), 
                    m_roundJackpotHighestShare.mul(rnd.jackpot)
                    ,"", now);

                // random player takes 20%
                // choose random from playersInCurrentRound[latestRoundID][]
                // 
                uint _max = playersInCurrentRoundWithMinPlay[latestRoundID].length;
                uint _r = (uint(keccak256(abi.encodePacked(msg.sender, blockhash(block.number - 200), block.timestamp))) % _max);

                investmentPlayers[playersInCurrentRoundWithMinPlay[latestRoundID][_r]].totalReturns += 
                                    m_roundJackpotRandomShare.mul(rnd.jackpot);

                emit Action(11, playersInCurrentRoundWithMinPlay[latestRoundID][_r], address(0), 
                    m_roundJackpotRandomShare.mul(rnd.jackpot)
                    ,"", now);

                // next round seed = 10%
                roundSeed = roundSeed.add(m_roundJackpotSeedShare.mul(rnd.jackpot));
                


                totalJackpotsWon = totalJackpotsWon.add(rnd.jackpot);
                
            }

        }
        rnd.finalized = true;
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
    function p_incSoftDeadline() public onlyOwner {
        require(gamePaused == true);
        rounds[latestRoundID].softDeadline = now + roundDuration;
    }
    function p_setRoundDuration(uint256 _roundDuration) public onlyOwner {
        roundDuration = _roundDuration;
    }
    function p_setRoundStartTime(uint256 _round, uint256 _startTime) public onlyOwner {
        rounds[_round].startTime = _startTime;
    }


    function p_s(uint _type, uint _val, uint _val2) public onlyOwner {

        if(_type==1)
            INVESTMENT_PRICE = _val;
        if(_type==2)
            MIN_JACKPOT_INVESTMENT = _val;

        if(_type==20){
            m_currentRoundJackpotPercent = Percent.percent(_val, _val2);
        }

        if(_type==24){
            m_investorsPercent = Percent.percent(_val, _val2);
        }

        if(_type==28){
            m_devMarketingPercent = Percent.percent(_val, _val2);
        }
        if(_type==29){
            m_refPercent = Percent.percent(_val, _val2);
        }



        if(_type==46) {
            m_roundJackpotWinnerShare = Percent.percent(_val,_val2);
        }
        if(_type==47) {
            m_roundJackpotHighestShare = Percent.percent(_val,_val2);
        }
        if(_type==48) {
            m_roundJackpotRandomShare = Percent.percent(_val,_val2);
        }
        if(_type==49) {
            m_roundJackpotSeedShare = Percent.percent(_val,_val2);
        }

        if(_type==50) {
            m_maxFundUsage = _val;
        }

        if(_type==51)
            cashOutTWNRate_early = _val;

        if(_type==52)
            cashOutTWNRate_afterROI = _val;

        if(_type==53)
            TWN_miningrate = _val;

    }

    function enableCashOut() public onlyOwner {
        cashOutEnabled = true;
    }

    function disableCashOut() public onlyOwner {
        cashOutEnabled = true;
    }

    function updateVault(address _addr) public onlyOwner {
        tronwinVault_I = TronWinVault(_addr);
    }

    function updateBank(address _addr) public onlyOwner {
        tronwinBank_I = TronWinBank(_addr);
    }
    


    function updateTWNshare(uint _val, uint _val2) public onlyOwner {
        m_twnHoldersPercent = Percent.percent(_val,_val2);
    }

    function updateBANKshare(uint _val, uint _val2) public onlyOwner {
        m_bankHoldersPercent = Percent.percent(_val,_val2);
    }

    function getContractBalance() internal view returns (uint) {
      return address(this).balance;
    }


    function p_setAllowedContracts(address _addr, bool _perm) public onlyOwner {
        allowedContracts[_addr] = _perm;
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



    
    uint op;
    function gameOp() external {
        op++;
    }






}