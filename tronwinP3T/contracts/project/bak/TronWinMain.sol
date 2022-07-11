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



interface P3TInterface {
 function buy(address _referredBy) external payable returns (uint256);
 function exit() external;
}


contract TronWinMain {
    
    using SafeMath for uint256;
    using Percent for Percent.percent;



    // Events
    // event_type
    // 0 = investment, 1 = reinvestment, 2 = vault won, 3 = external trx dist, 
    // 4 = vanityname purchased, 5 referral earned, 6 new round leader,
    // 7 = new silver bankers card bought, 8 == new gold bankers card bought, 9 == new platinum bankers card bought
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


//    address p3tValidator = 0xa6f5dd961b78ce115d5bd4ec317738de87f126d8; // TRC1hwc1JaBL9kGp6wFYYCXUF4FVinpqbV;
    address p3tValidator = 0x93e05fdf63dea1a238a4bfdd69e90329999290d3; // DEBUG
    address p3tMarketing = 0xa6f5dd961b78ce115d5bd4ec317738de87f126d8;

    // 333 variables
    uint256 public gameFund; // div pool + gaming fund
    mapping(address => bool) allowedGamingContracts; // allowed access to the gaming fund
    mapping(address => bool) allowedGamingContractsP3TValidated; // also approved by the external P3T validator


    // allows the addition of future games to feed into the div pool
    // - these games need access to the gameFund
    // - only tronwin dapps contracts given permission
    // - ensures the 3.33% divs pot is maintained and grows!
    function gamingFundPayment(address _to, uint _amnt) external {
        require(allowedGamingContracts[msg.sender] == true);
        require(allowedGamingContractsP3TValidated[msg.sender] == true);

        _to.transfer(_amnt);
        gameFund = gameFund.sub(_amnt);
    }
    function receiveExternalGameFund() external payable {
        gameFund = gameFund.add(msg.value);
    }
    function getGameFund() public view returns (uint256) {
        return gameFund;
    }




    struct Player {
        uint256 totalInvestment;
        uint256 startTime;
        uint256 totalWithdrawn;
        uint256 totalDivsLocked;
        uint256 lastActivity;
    }
    mapping (address => Player) investmentPlayers;
    address[] public players;


    uint256 totalInvestors;



    uint256 public MIN_JACKPOT_INVESTMENT = 10000 trx;




    // settings

    uint256 public roundDuration = (24 hours); 


    uint256 public STARTING_KEY_PRICE = 5 trx;
    
    uint256 public minInvestment = STARTING_KEY_PRICE;
    uint256 public maxInvestment = STARTING_KEY_PRICE * 10000;
    
    
/*
85% gameFund
3% vault
3% Ref
2% bankers cards
--- 0.25% = silver
--- 0.5% = gold
--- 1.25% = platinum
---
5% Dev Fund
2% P3T
*/






    Percent.percent private m_investorsPercent = Percent.percent(85, 100); // dividend split
    Percent.percent private m_currentRoundJackpotPercent = Percent.percent(3, 100);

    Percent.percent private m_bankersSilverPercent = Percent.percent(25, 10000); // correct
    Percent.percent private m_bankersGoldPercent = Percent.percent(5, 1000); // correct
    Percent.percent private m_bankersPlatinumPercent = Percent.percent(125, 10000); // correct

    
    Percent.percent private m_refPercent = Percent.percent(3, 100);    
    Percent.percent private m_devMarketingPercent = Percent.percent(5, 100); // dev + marketing
    Percent.percent private m_p3tHoldersPercent = Percent.percent(2, 100);


    Percent.percent private m_dailyInterest = Percent.percent(333,1000);



    Percent.percent private m_bankersResaleMultipler = Percent.percent(200,100);
    Percent.percent private m_bankersResaleOwnerShare = Percent.percent(55,100);


    
    
    struct GameRound {
        uint totalInvested;        
        uint jackpot;

        uint softDeadline;
        uint price;
        address lastInvestor;
        bool finalized;
        mapping (address => uint) roundInvested;
        uint startTime;
    }

    
    struct Vault {
        uint totalReturns; // Total balance = returns + referral returns + jackpots/bonus Prize 
        uint refReturns; // how much of the total is from referrals
        uint totalInvested; // NEW
    }


    uint256 public VANITY_PRICE    = 100 trx; 
    mapping(bytes32 => address) public listVanityAddress; // key is vanity of address
    mapping(address => PlayerVanity) public playersVanity;
    struct PlayerVanity {
        string vanity;
        bool vanityStatus;
    }



    uint public bankersSilverPrice = 100 trx;
    uint public bankersGoldPrice = 100 trx;
    uint public bankersPlatinumPrice = 100 trx;
    uint public bankersSilverStartTime;
    uint public bankersGoldStartTime;
    uint public bankersPlatinumStartTime;
    address public bankersSilverOwner;
    address public bankersGoldOwner;
    address public bankersPlatinumOwner;

    uint public bankersSilverCardHalfLife = 1 days;
    uint public bankersGoldCardHalfLife = 3 days;
    uint public bankersPlatinumCardHalfLife = 5 days;



    address[] public playersVanityAddressList;
    function playersVanityAddressListLen() public view returns (uint) {
        return playersVanityAddressList.length;
    }
    function playersVanityByID(uint _id) public view returns (address _addr, string _vanity) {
        _addr = playersVanityAddressList[_id];
        _vanity = playersVanity[_addr].vanity;
    }




    uint256 public trx_distributed;
    uint256 public trx_invested;



    mapping(uint => address[]) playersInCurrentRound;


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

    mapping (address => Vault) vaults;


    uint public latestRoundID;// the first round has an ID of 0
    GameRound[] rounds;




    bool public gamePaused = true;
    bool public limitedReferralsMode = true; 


    mapping(address => bool) private m_referrals; // we only pay out on the first set of referrals
    
    
    // Game vars

    
    

    
    // Main stats:
    uint public totalJackpotsWon = 0;

    

    uint public totalEarningsGenerated = 0;
    uint public totalDistributedReturns = 0;

    uint public totalBankersProfit = 0;

    
    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    modifier notOnPause() {
        require(gamePaused == false, "Game Paused");
        _;
    }
    




    P3TInterface public P3TToken;

    constructor() public {

        owner = address(msg.sender);
        devAddress = owner;


        
        rounds.length++;
        
        latestRoundID = 0;

        rounds[0].lastInvestor = address(0);
        rounds[0].price = STARTING_KEY_PRICE;

        rounds[0].softDeadline = now + roundDuration;

        rounds[0].jackpot = 0;

        rounds[0].startTime = now;
        
        bankersSilverStartTime = now;
        bankersGoldStartTime = now;
        bankersPlatinumStartTime = now;
        
    }


    function() payable public {   
    }
    function pay() public payable {
    }






    function investorInfo(address investor) external view
    returns(uint invested, uint totalWithdrawn, uint totalReturns, uint refReturns, uint divs, uint divsLocked) 
    {
        invested = investmentPlayers[investor].totalInvestment;
        totalWithdrawn = investmentPlayers[investor].totalWithdrawn;
        totalReturns = vaults[investor].totalReturns;
        refReturns = vaults[investor].refReturns;
        divs = getDividends(investor);
        divsLocked = investmentPlayers[investor].totalDivsLocked;
    }




    function roundInfoInGame(uint roundID) external view 
        returns(
            address leader, 
            uint jackpot,  
            uint totalInvested,
            bool finalized,
            uint startTime,
            string leader_vanity,
            uint softDeadline
        )
    {   


        
        leader = rounds[roundID].lastInvestor;
        leader_vanity = playersVanity[leader].vanity;

        totalInvested = rounds[roundID].totalInvested;

        jackpot = rounds[roundID].jackpot;
        
        finalized = rounds[roundID].finalized;

        startTime = rounds[roundID].startTime;

        softDeadline = rounds[roundID].softDeadline;

    } 


    function getBankersSilverPrice() public view returns (uint) {
        uint _bankersSilverPrice;
        if(bankersSilverStartTime + bankersSilverCardHalfLife > now)
            return bankersSilverPrice;

        uint _silverDivider = (now - bankersSilverStartTime) / bankersSilverCardHalfLife;
        uint c;
        if(_silverDivider > 0){
            _bankersSilverPrice = bankersSilverPrice;
            for(c=0; c< _silverDivider;c++){
                _bankersSilverPrice = _bankersSilverPrice /2;
                if(_bankersSilverPrice < 100 trx) {
                    _bankersSilverPrice = 100 trx;
                    break;
                }
            }
        } else {
            _bankersSilverPrice = bankersSilverPrice;
        }
        return _bankersSilverPrice;
    }
    function getBankersGoldPrice() public view returns (uint) {
        uint _bankersGoldPrice;
        if(bankersGoldStartTime + bankersGoldCardHalfLife > now)
            return bankersGoldPrice;

        uint _goldDivider = (now - bankersGoldStartTime) / bankersGoldCardHalfLife;
        uint c;
        if(_goldDivider > 0){
            _bankersGoldPrice = bankersGoldPrice;
            for(c=0; c< _goldDivider;c++){
                _bankersGoldPrice = _bankersGoldPrice /2;
                if(_bankersGoldPrice < 100 trx) {
                    _bankersGoldPrice = 100 trx;
                    break;
                }
            }
        } else {
            _bankersGoldPrice = _bankersGoldPrice;
        }
        return _bankersGoldPrice;
    }
    function getBankersPlatinumPrice() public view returns (uint) {
        uint _bankersPlatinumPrice;
        if(bankersPlatinumStartTime + bankersPlatinumCardHalfLife > now)
            return bankersPlatinumPrice;

        uint _platinumDivider = (now - bankersPlatinumStartTime) / bankersPlatinumCardHalfLife;
        uint c;
        if(_platinumDivider > 0){
            _bankersPlatinumPrice = bankersPlatinumPrice;
            for(c=0; c< _platinumDivider;c++){
                _bankersPlatinumPrice = _bankersPlatinumPrice /2;
                if(_bankersPlatinumPrice < 100 trx) {
                    _bankersPlatinumPrice = 100 trx;
                    break;
                }
            }
        } else {
            _bankersPlatinumPrice = _bankersPlatinumPrice;
        }
        return _bankersPlatinumPrice;
    }

    function bankerCardsInfo() external view returns (
            uint _bankersSilverPrice,
            uint _bankersGoldPrice,
            uint _bankersPlatinumPrice,
            uint _bankersSilverStartTime,
            uint _bankersGoldStartTime,
            uint _bankersPlatinumStartTime,
            address _bankersSilverOwner,
            address _bankersGoldOwner,
            address _bankersPlatinumOwner,
            uint _bankersSilverCardHalfLife,
            uint _bankersGoldCardHalfLife,
            uint _bankersPlatinumCardHalfLife
        )
    {

        _bankersSilverPrice = getBankersSilverPrice();
        

        _bankersGoldPrice = getBankersGoldPrice();
        _bankersPlatinumPrice = getBankersPlatinumPrice();

        _bankersSilverStartTime = bankersSilverStartTime;
        _bankersGoldStartTime = bankersGoldStartTime;
        _bankersPlatinumStartTime = bankersPlatinumStartTime;
        _bankersSilverOwner = bankersSilverOwner;
        _bankersGoldOwner = bankersGoldOwner;
        _bankersPlatinumOwner = bankersPlatinumOwner;
        _bankersSilverCardHalfLife = bankersSilverCardHalfLife;
        _bankersGoldCardHalfLife = bankersGoldCardHalfLife;
        _bankersPlatinumCardHalfLife = bankersPlatinumCardHalfLife;
    }

        
    function roundKeyPrice(uint roundID) external view returns(uint) {
        return rounds[roundID].price;
    }
    







    function playerReturns(address investor) public view validPlayer 
    returns (uint totalReturns, uint refReturns) 
    {
        totalReturns = vaults[investor].totalReturns;
        refReturns = vaults[investor].refReturns;
    }

    function withdrawReturns() public validPlayer {
        transferPlayerDivs(msg.sender);

        // add in any locked divs...
        vaults[msg.sender].totalReturns = vaults[msg.sender].totalReturns.add(investmentPlayers[msg.sender].totalDivsLocked);
        

        require(vaults[msg.sender].totalReturns > 0, "Nothing to withdraw!");

        uint256 _totalReturns = vaults[msg.sender].totalReturns; // includes referral bonus

        vaults[msg.sender].totalReturns = 0;
        vaults[msg.sender].refReturns = 0;
        investmentPlayers[msg.sender].totalDivsLocked = 0;
        investmentPlayers[msg.sender].totalWithdrawn = investmentPlayers[msg.sender].totalWithdrawn.add(_totalReturns);
        msg.sender.transfer(_totalReturns);
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
        rnd.price = STARTING_KEY_PRICE;
        rnd.startTime = now;
        rnd.softDeadline = now + roundDuration;

        

        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {
        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }


        rnd.jackpot = 0;
        // need to reinvest any divs first...
        transferPlayerDivs(msg.sender);
        _purchase(rnd, msg.value, _referer, true);
        emit Action(0, msg.sender, address(0), msg.value, "", now);

    }

    function buyBankersCard(uint _cardType) public validPlayer payable {
        address _prevOwner;
        uint _prevOwnersShare;
        if(_cardType == 0) {
            // silver


            require(msg.value >=  getBankersSilverPrice(), "Not enough TRX!");
            

            _prevOwner = bankersSilverOwner;
            if(_prevOwner == address(0)){
            } else {
                _prevOwnersShare = m_bankersResaleOwnerShare.mul(msg.value);
                _prevOwner.transfer(_prevOwnersShare);

                totalBankersProfit = totalBankersProfit.add(_prevOwnersShare);
            }
            gameFund = gameFund.add(msg.value.sub(_prevOwnersShare));



            if(bankersSilverStartTime + bankersSilverCardHalfLife < now) {
                // halflife it...
                bankersSilverPrice = getBankersSilverPrice();
            }

            bankersSilverOwner = msg.sender;
            bankersSilverPrice = m_bankersResaleMultipler.mul(bankersSilverPrice);
            bankersSilverStartTime = now;

            emit Action (
                7,
                _prevOwner,
                msg.sender,
                msg.value, 
                "",
                now
                );
            return;
        }

        if(_cardType == 1) {
            // gold

            require(msg.value >= getBankersGoldPrice(), "Not enough TRX!");
            
            _prevOwner = bankersGoldOwner;
            if(_prevOwner == address(0)){
            } else {
                _prevOwnersShare = m_bankersResaleOwnerShare.mul(msg.value);
                _prevOwner.transfer(_prevOwnersShare);

                totalBankersProfit = totalBankersProfit.add(_prevOwnersShare);

            }
            gameFund = gameFund.add(msg.value.sub(_prevOwnersShare));


            if(bankersGoldStartTime + bankersGoldCardHalfLife < now) {
                // halflife it...
                bankersGoldPrice = getBankersGoldPrice();
            }

            bankersGoldOwner = msg.sender;
            bankersGoldPrice = m_bankersResaleMultipler.mul(bankersGoldPrice);
            bankersGoldStartTime = now;

            emit Action (
                8,
                _prevOwner,
                msg.sender,
                msg.value, 
                "",
                now
                );
            return;
        }

        if(_cardType == 2) {
            // platinum

            require(msg.value >= getBankersPlatinumPrice(), "Not enough TRX!");
            
            _prevOwner = bankersPlatinumOwner;
            if(_prevOwner == address(0)){
            } else {
                _prevOwnersShare = m_bankersResaleOwnerShare.mul(msg.value);
                _prevOwner.transfer(_prevOwnersShare);

                totalBankersProfit = totalBankersProfit.add(_prevOwnersShare);
            }
            gameFund = gameFund.add(msg.value.sub(_prevOwnersShare));


            if(bankersPlatinumStartTime + bankersPlatinumCardHalfLife < now) {
                // halflife it...
                bankersPlatinumPrice = getBankersPlatinumPrice();
            }


            bankersPlatinumOwner = msg.sender;
            bankersPlatinumPrice = m_bankersResaleMultipler.mul(bankersPlatinumPrice);
            bankersPlatinumStartTime = now;

            emit Action (
                9,
                _prevOwner,
                msg.sender,
                msg.value, 
                "",
                now
                );
            return;
        }

    }

    function reinvestFull() public validPlayer  {        
        GameRound storage rnd = rounds[latestRoundID];
        

        // need to reinvest any divs first...
        transferPlayerDivs(msg.sender);

        // add in any lockedDivs
        vaults[msg.sender].totalReturns = vaults[msg.sender].totalReturns.add(investmentPlayers[msg.sender].totalDivsLocked);

        uint value = vaults[msg.sender].totalReturns;

        require(value > 0, "Can't spend what you don't have");

        vaults[msg.sender].totalReturns = 0;
        vaults[msg.sender].refReturns = 0;
        investmentPlayers[msg.sender].totalDivsLocked = 0;
        investmentPlayers[msg.sender].totalWithdrawn = investmentPlayers[msg.sender].totalWithdrawn.add(value);

        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {
        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }
        
        _purchase(rnd, value, address(0), true);
        emit Action(1, msg.sender, address(0), value, "", now);
    }

    function reinvestReturns(uint value, address ref) public validPlayer  {        
        GameRound storage rnd = rounds[latestRoundID];
        

        // need to reinvest any divs first...
        transferPlayerDivs(msg.sender);


        require(
                vaults[msg.sender].totalReturns.add(investmentPlayers[msg.sender].totalDivsLocked) >= value, 
                "Can't spend what you don't have");


        // spend locked divs first...
        if(value > investmentPlayers[msg.sender].totalDivsLocked) {

            

            vaults[msg.sender].totalReturns = vaults[msg.sender].totalReturns.sub(value.sub(investmentPlayers[msg.sender].totalDivsLocked));
            vaults[msg.sender].refReturns = min(vaults[msg.sender].refReturns, vaults[msg.sender].totalReturns);

            investmentPlayers[msg.sender].totalDivsLocked = 0;

        } else {

            investmentPlayers[msg.sender].totalDivsLocked = investmentPlayers[msg.sender].totalDivsLocked.sub(value);
        
        }




        if(rounds[latestRoundID].roundInvested[msg.sender] > 0) {

        } else {
            playersInCurrentRound[latestRoundID].push(msg.sender);
        }

        
        _purchase(rnd, value, ref, true);
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

    function _purchase(GameRound storage rnd, uint value, address referer, bool _hasFunds) internal  {
        require(now >= rnd.startTime, "Round not started!");
        require(rnd.softDeadline >= now, "After deadline!");
        require(value >= rnd.price, "Not enough TRX!");

        if(_hasFunds == true){


            rnd.totalInvested = rnd.totalInvested.add(value);
            trx_invested = trx_invested.add(value);


            if(investmentPlayers[msg.sender].startTime ==0) {
                // first investment
                totalInvestors++;
                investmentPlayers[msg.sender].startTime = now;
                players.push(msg.sender);
            } else {
            }
            investmentPlayers[msg.sender].totalInvestment = investmentPlayers[msg.sender].totalInvestment.add(value);
            investmentPlayers[msg.sender].lastActivity = investmentPlayers[msg.sender].lastActivity = now;
            
        }
        
        if(value + rnd.roundInvested[msg.sender] >= MIN_JACKPOT_INVESTMENT) {

            if(rnd.lastInvestor == msg.sender) {
            } else {
                emit Action(6,msg.sender,address(0),value,"",now);
            }


            rnd.softDeadline = now + roundDuration;
            rnd.lastInvestor = msg.sender;



        }
        rnd.roundInvested[msg.sender] = rnd.roundInvested[msg.sender].add(value);


        if(_hasFunds == true){
            _splitRevenue(rnd, value, referer);

        }
        
    }



    function _splitRevenue(GameRound storage rnd, uint value, address ref) internal {

        uint _trxToP3t = sendProfitToP3T(m_p3tHoldersPercent.mul(value));

        uint dev_value = value.sub(_trxToP3t);

        uint roundReturns = m_investorsPercent.mul(value); // how much to pay in dividends to round players
        dev_value = dev_value.sub(roundReturns);

        uint _referralEarning =  m_refPercent.mul(value);
        dev_value = dev_value.sub(_referralEarning);

        if(ref != address(0x0)) {
            
            if(
                (!m_referrals[msg.sender] && limitedReferralsMode == true)
                ||
                limitedReferralsMode == false
                ) {

                vaults[ref].totalReturns = vaults[ref].totalReturns.add(_referralEarning);
                vaults[ref].refReturns = vaults[ref].refReturns.add(_referralEarning);
                
                m_referrals[msg.sender] = true;

                emit Action (5, msg.sender, ref, _referralEarning, "", now);

            } else {

                p3tMarketing.transfer(_referralEarning);

            }

        } else {
            p3tMarketing.transfer(_referralEarning);

        }

        

        uint bankersSilverOwnerShare;
        uint bankersGoldOwnerShare;
        uint bankersPlatinumOwnerShare;

        if(bankersSilverOwner != address(0)) {
            bankersSilverOwnerShare = m_bankersSilverPercent.mul(value);
            dev_value = dev_value.sub(bankersSilverOwnerShare);

            investmentPlayers[bankersSilverOwner].totalDivsLocked = investmentPlayers[bankersSilverOwner].totalDivsLocked.add(bankersSilverOwnerShare);
            totalBankersProfit = totalBankersProfit.add(bankersSilverOwnerShare);
        }

        if(bankersGoldOwner != address(0)) {
            bankersGoldOwnerShare = m_bankersGoldPercent.mul(value);
            dev_value = dev_value.sub(bankersGoldOwnerShare);

            investmentPlayers[bankersGoldOwner].totalDivsLocked = investmentPlayers[bankersGoldOwner].totalDivsLocked.add(bankersGoldOwnerShare);

            totalBankersProfit = totalBankersProfit.add(bankersGoldOwnerShare);
        }

        if(bankersPlatinumOwner != address(0)) {
            bankersPlatinumOwnerShare = m_bankersPlatinumPercent.mul(value);
            dev_value = dev_value.sub(bankersPlatinumOwnerShare);

            investmentPlayers[bankersPlatinumOwner].totalDivsLocked = investmentPlayers[bankersPlatinumOwner].totalDivsLocked.add(bankersPlatinumOwnerShare);

            totalBankersProfit = totalBankersProfit.add(bankersPlatinumOwnerShare);
        }



        
        gameFund = gameFund.add(roundReturns);

        rnd.jackpot = rnd.jackpot.add(m_currentRoundJackpotPercent.mul(value));

        dev_value = dev_value.sub(m_currentRoundJackpotPercent.mul(value));

        devAddress.transfer(dev_value);

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





    
    function _finalizeRound(GameRound storage rnd) internal {
        require(!rnd.finalized, "Already finalized!");
        require(rnd.softDeadline < now, "Round still running!");


        // find vault winner

        if(rnd.jackpot > 0){

            if(rnd.lastInvestor == address(0)) {
                // house win takes 5%
                // rest goes to div pot!
                devAddress.transfer(m_devMarketingPercent.mul(rnd.jackpot));
                gameFund = gameFund.add(rnd.jackpot.sub(m_devMarketingPercent.mul(rnd.jackpot)));
            } else {
                // use last investor as the winner...
                vaults[rnd.lastInvestor].totalReturns = vaults[rnd.lastInvestor].totalReturns.add(rnd.jackpot);


                emit Action(2, rnd.lastInvestor, address(0), 
                    rnd.jackpot
                    ,"", now);

                totalJackpotsWon = totalJackpotsWon.add(rnd.jackpot);
                
            }

            totalEarningsGenerated = totalEarningsGenerated.add(rnd.jackpot);





        }
        rnd.finalized = true;
    }




    /**
    * Action by vanity
    * Vanity referral links (Show vanity in cardholder box)
    */
    function buyVanity(string _vanity) public payable validPlayer {
        /*--------------------- validate --------------------------------*/
        require(msg.value >= VANITY_PRICE);
        require(isVanityExisted(_vanity) == false);
        /*--------------------- handle --------------------------------*/

        if(playersVanity[msg.sender].vanityStatus == false) {
            playersVanityAddressList.push(msg.sender);
        }


        playersVanity[msg.sender].vanity = _vanity;
        playersVanity[msg.sender].vanityStatus = true;
        // update list vanity address
        listVanityAddress[convertStringToBytes32(_vanity)] = msg.sender;
        /*--------------------- event --------------------------------*/

        devAddress.transfer(msg.value);


        emit Action(4, msg.sender, address(0), msg.value, _vanity, now);
    }




    function isVanityExisted(string _vanity) public view returns(bool) {
        if (listVanityAddress[convertStringToBytes32(_vanity)] != address(0)) {
          return true; 
        }
        return false;
    }
    function convertStringToBytes32(string key) private pure returns (bytes32 ret) {
        if (bytes(key).length > 32) {
          revert();
        }

        assembly {
          ret := mload(add(key, 32))
        }
    }
    function vanityToAddress(string _vanity) public view returns(address) {
      return listVanityAddress[convertStringToBytes32(_vanity)];
    }
    function addressToVanity(address _player) public view returns(string) {
      return playersVanity[_player].vanity;
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

    function p_setLimitedReferralsMode(bool _limitedReferralsMode) public onlyOwner {
        limitedReferralsMode = _limitedReferralsMode;
    }





    function p_settings(uint _type, uint _val, uint _val2) public onlyOwner {

        if(_type==1)
            STARTING_KEY_PRICE = _val;
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
        if(_type==30){
            VANITY_PRICE = _val;
        }
        if(_type==31){
            bankersSilverPrice = _val;
        }
        if(_type==32){
            bankersGoldPrice = _val;
        }
        if(_type==33) {
            bankersPlatinumPrice = _val;
        }
        if(_type==34) {
            bankersSilverStartTime = _val;
        }
        if(_type==35) {
            bankersGoldStartTime = _val;
        }
        if(_type==36) {
            bankersPlatinumStartTime = _val;
        }
        if(_type==37) {
            bankersPlatinumStartTime = _val;
        }
        if(_type==38) {
            bankersSilverCardHalfLife = _val;
        }
        if(_type==39) {
            bankersGoldCardHalfLife = _val;
        }
        if(_type==40) {
            bankersPlatinumCardHalfLife = _val;
        }
        if(_type==41) {
            m_bankersResaleMultipler = Percent.percent(_val,_val2);
        }
        if(_type==42) {
            m_bankersResaleOwnerShare = Percent.percent(_val,_val2);
        }
        if(_type==43) {
            m_bankersSilverPercent = Percent.percent(_val, _val2);
        }
        if(_type==44) {
            m_bankersGoldPercent = Percent.percent(_val, _val2);
        }
        if(_type==45) {
            m_bankersPlatinumPercent = Percent.percent(_val, _val2);
        }
    }

    function updateAllowedContracts(address _addr, bool _perm) public onlyOwner {
        allowedGamingContracts[_addr] = _perm;
    }

    function validateAllowedContracts(address _addr, bool _perm) public {
        require(msg.sender == p3tValidator);
        allowedGamingContractsP3TValidated[_addr] = _perm;
    }

    function updateP3TValidator(address _newP3TValidator) public {
        require(msg.sender == p3tValidator);
        p3tValidator = _newP3TValidator;
    }
    function updateP3TMarketing(address _newP3TMarketing) public {
        require(msg.sender == p3tMarketing);
        p3tMarketing = _newP3TMarketing;
    }

    function updateP3Tshare(uint _val) public onlyOwner {
        m_p3tHoldersPercent = Percent.percent(_val,100);
    }



    function getContractBalance() internal view returns (uint) {
      return address(this).balance;
    }

/**
    *  Action set P3T interface
*/

    function setP3TInterface(address _p3tcontract) public onlyOwner {
        P3TToken = P3TInterface(_p3tcontract);  
    }
 
    function sendProfitToP3T(uint256 _profit) private returns(uint256 _trxToP3t) {
        uint256 balanceBeforeSend = getContractBalance();
        buyP3T(calTrxSendToP3T(_profit));
        uint256 balanceAfterSend = getContractBalance();
        _trxToP3t = balanceBeforeSend - balanceAfterSend;
    }
    
    function calTrxSendToP3T(uint256 _trx) private pure returns(uint256 _value) {
        _value = SafeMath.div(SafeMath.mul(_trx, 100), 13);
    }

    function buyP3T(uint256 _value) private {
      P3TToken.buy.value(_value)(owner);
      exitP3T();
    }
 
    function exitP3T() private {
        P3TToken.exit();
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