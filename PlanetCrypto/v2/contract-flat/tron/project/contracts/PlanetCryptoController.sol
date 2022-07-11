pragma solidity ^0.5.0;
//pragma solidity ^0.4.23;



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

}


contract PlanetCryptoController {
    
    using Percent for Percent.percent;
    using SafeMath for uint256;
    
    // EVENTS

    event action(
        address indexed player,
        uint      event_type,   
        // 0 = referral, 1 = coin minded, 2 = land purchased, 3 = tax dist, 4 = bonus dist, 5 = card bought
        // 6 = card name change, 7 = card image change, 8 = set playerFlag
        uint      amnt, // for bought this is the orig value
        address   to,
        uint      token_id,
        bytes32   data,
        int256    center_lat,
        int256    center_lng,
        uint      size,
        uint      bought_at, // for bought this is the new value
        uint      empire_score,
        uint      timestamp
    );


    event onBuyVanity(address player, string vanity, uint256 amount);
        


    // CONTRACT MANAGERS
    address payable owner;
    address payable devBankAddress; // where marketing funds are sent
    address tokenBankAddress; 

    // MODIFIERS
    modifier onlyOwner() {
      require(msg.sender == owner);
      _;
    }

    modifier dontAllowOtherContractAction() {
      require(tx.origin == msg.sender);
      _;
    }

    modifier onlyAllowedContracts() {
      require(allowedExternalContracts[msg.sender] == true);
      _;
    }
    

    
    struct player {
        address playerAddress;
        uint256 lastAccess;
        uint256 totalEmpireScore;
        uint256 totalLand;
        uint256 additionalEmpireScore;
        uint256 fundsOwed;
        bytes32 flagDetail;
        bool    flagSet;
        string  vanity;
        bool    vanityStatus;
    }
    
    


    // INTERFACES
    //address planetCryptoCoinAddress = 0xf423b9866bC909657574B1fEde2Dc7878367DBD8; // mainnet
    //address planetCryptoCoinAddress = 0x7f65245597bF659d92A3755EdA5a8269903C3A3a; // ropsten
    //PlanetCryptoCoin_I internal planetCryptoCoin_interface;
    

    //address planetCryptoUtilsAddress = 0x3A076f5597C74a0D0feA0B058c1BAfeAc037e64D; // ropsten
    //PlanetCryptoUtils_I internal planetCryptoUtils_interface;
    
    //address planetCryptoTokenAddress = 0x00;
    //PlanetCryptoToken_I internal planetCryptoToken_interface;
    



    

    uint256 public playerFlagCost = 1000000000000000; // 0.001 ETH

    uint256 public VANITY_PRICE    = 10000000000000000; // 0.01 ETH


    
    uint256 public tax_fund = 0;
    uint256 public tax_distributed = 0;


    // GAME STATS
    uint256 public totalEmpireScore;
    uint256 public totalLand;
    
    //uint256 public total_invested = 0;
    uint256 public total_earned = 0;
    uint256 public tax_carried_forward = 0;
    uint256 private _taxToDivide;
    
    uint256 public total_empire_score; 
    player[] public all_playerObjects;
    
    mapping(address => uint256) internal playerAddressToPlayerObjectID;
  

    mapping(bytes32 => address) public listVanityAddress; // key is vanity of address

    
    
    mapping(address => bool) public allowedExternalContracts;
    

    



    // Master contract...
    // holders players main stats:
    // empire score
    // daily activity
    // receives from PlanetCryptoToken (And other future contracts..)
    // + ETH for daily pot
    // + Empire score changes for players
    // This contract solely holds token info and changes
    

    constructor() public {
        owner = msg.sender;
        tokenBankAddress = owner;
        devBankAddress = owner;
        all_playerObjects.push(player(address(0),
        0,
        0,
        0,
        0,
        0,
        0x00,
        false,
        "",
        false));
        
    }


    function receiveExtraTax(bool inc) public payable {
      if(inc == true) {
        tax_fund = tax_fund.add(msg.value);
      }
    }



    function taxEarningsAvailable() public view returns(uint256) {

        return all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].fundsOwed;
        //return calcNewTaxEarnings() + all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].fundsOwed;
        //playersFundsOwed[msg.sender];
    }



    function withdrawTaxEarning()  public {


        uint256 taxEarnings = all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].fundsOwed; 
        //playersFundsOwed[msg.sender];


       // uint _newTax;
    //    (_newTax) = calcNewTaxEarnings();

      //  if(_newTax > 0) {
    //      taxEarnings = taxEarnings + _newTax;
     //     //playersFundsOwed[msg.sender] = playersFundsOwed[msg.sender].add(_newTax);
     //     all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].fundsOwed = all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].fundsOwed.add(_newTax);
     //     tax_fund = tax_fund.add(_newTax); // New correction
//
//          tax_distributed = tax_distributed.add(_newTax);          
//          all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].taxMarkPoint = _taxToDivide;
//        }



        //playersFundsOwed[msg.sender] = 0;
        all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].fundsOwed = 0;
        if(taxEarnings > tax_fund) // safety
          tax_fund = 0;
        else
          tax_fund = tax_fund.sub(taxEarnings);
        
        msg.sender.transfer(taxEarnings);

    }



// not needed as fundsOwed is updatdd in real time now
/*
    function calcNewTaxEarnings() internal view returns (uint _tax) {
      uint _playersPercent;

      _playersPercent 
          = (all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].totalEmpireScore*10000000 / total_empire_score * 10000000) / 10000000;

      _tax = (_taxToDivide - all_playerObjects[playerAddressToPlayerObjectID[msg.sender]].taxMarkPoint)* _playersPercent / 10000000;

    }
*/

    function playerReceiveFunds(address _player) external payable {
        if(playerAddressToPlayerObjectID[_player] == 0) {
            player memory _playerObj;
            _playerObj.playerAddress = _player;
            _playerObj.lastAccess = now;
            _playerObj.fundsOwed = msg.value;
            all_playerObjects.push(_playerObj);
            playerAddressToPlayerObjectID[_player] = all_playerObjects.length-1;
        } else {
            all_playerObjects[playerAddressToPlayerObjectID[_player]].fundsOwed
                 = all_playerObjects[playerAddressToPlayerObjectID[_player]].fundsOwed.add(msg.value);
            all_playerObjects[playerAddressToPlayerObjectID[_player]].lastAccess = now;
        }
    }

    

    // allows tax to be credited to players accounts from extension contracts to the game
    function receiveExternalTax() external payable {
        tax_fund = tax_fund.add(msg.value);
        calcPlayerDivs(msg.value);
    }
    
    /*
        address playerAddress;
        uint256 lastAccess;
        uint256 totalEmpireScore;
        uint256 totalLand;
        uint256 additionalEmpireScore;
        uint256 fundsOwed;
        bytes32 flagDetail;
        bool    flagSet;
        string  vanity;
        bool    vanityStatus;
    */
    
    // TODO: daily chart positions!
    
    function updateStats(address _player,
        uint256 _empire_score_change,
        bool _isEmpireScoreInc,
        uint256 _land_size_change,
        bool _isLandSizeInc) external onlyAllowedContracts {
            
            
        if(_isEmpireScoreInc)
            totalEmpireScore = totalEmpireScore.add(_empire_score_change);
        else {
            if(totalEmpireScore < _empire_score_change)
                totalEmpireScore = 0;
            else
                totalEmpireScore = totalEmpireScore.sub(_empire_score_change);
        }
        
        if(_isLandSizeInc)
            totalLand = totalLand.add(_land_size_change);
        else{
            if(totalLand < _land_size_change)
                totalLand = 0;
            else
                totalLand = totalLand.sub(_land_size_change);
        }
            
            
        if(playerAddressToPlayerObjectID[_player] == 0) {
          // new player
            player memory _playerObj;
            _playerObj.playerAddress = _player;
            _playerObj.lastAccess = now;
            if(_isEmpireScoreInc)
                _playerObj.totalEmpireScore = _empire_score_change;
            if(_isLandSizeInc)
                _playerObj.totalLand = _land_size_change;
            
            all_playerObjects.push(_playerObj);
            playerAddressToPlayerObjectID[_player] = all_playerObjects.length-1;
            
        } else {
            
            all_playerObjects[playerAddressToPlayerObjectID[_player]].lastAccess = now;
            if(_isEmpireScoreInc == false) {
                if(all_playerObjects[playerAddressToPlayerObjectID[_player]].totalEmpireScore < _empire_score_change)
                    all_playerObjects[playerAddressToPlayerObjectID[_player]].totalEmpireScore = 0;
                else
                    all_playerObjects[playerAddressToPlayerObjectID[_player]].totalEmpireScore = all_playerObjects[playerAddressToPlayerObjectID[_player]].totalEmpireScore.sub(_empire_score_change);
            } else {
                all_playerObjects[playerAddressToPlayerObjectID[_player]].totalEmpireScore = all_playerObjects[playerAddressToPlayerObjectID[_player]].totalEmpireScore.add(_empire_score_change);
            }                    
        
            if(_isLandSizeInc == false) {
                if(all_playerObjects[playerAddressToPlayerObjectID[_player]].totalLand < _land_size_change)
                    all_playerObjects[playerAddressToPlayerObjectID[_player]].totalLand = 0;
                else
                    all_playerObjects[playerAddressToPlayerObjectID[_player]].totalLand = all_playerObjects[playerAddressToPlayerObjectID[_player]].totalLand.sub(_land_size_change);
            } else {
    
                all_playerObjects[playerAddressToPlayerObjectID[_player]].totalLand = all_playerObjects[playerAddressToPlayerObjectID[_player]].totalLand.add(_land_size_change);
            }
            
        }
    }
    
    
    function calcPlayerDivs(uint256 _value) internal {

        total_earned = total_earned.add(_value); // includes daily bonus amount

        // instantly dist to all players in the game...
        
        if(tax_distributed > 0) {
            uint256 _playersPercent;
            uint256 _playersShare;
            uint256 c;
            _value = _value.add(tax_carried_forward);
            for(c=0; c<all_playerObjects.length;c++) {
                if( all_playerObjects[c].totalEmpireScore > 0) {
                    _playersPercent = percent(totalEmpireScore, all_playerObjects[c].totalEmpireScore, 6);
                    _playersShare = _value * _playersPercent / 1000000;
                    if(_playersShare > 0) {
                        all_playerObjects[c].fundsOwed = all_playerObjects[c].fundsOwed.add(_playersShare);                    
                    }
                }

            }
            tax_distributed = tax_distributed.add(_value);
            tax_fund = tax_fund.add(_value);

            tax_carried_forward = 0;
            
            emit action(
              address(0),
              3,
              _value,
              address(0), 0, 0x00,0,0,all_playerObjects.length-1,0,0,now);


        } else {
            // first land purchase - no divs this time, carried forward
            tax_carried_forward = tax_carried_forward + _value;
            _taxToDivide = _taxToDivide + tax_carried_forward;
        }
    }

    function percent(uint numerator, uint denominator, uint precision) internal pure returns(uint quotient) {
         // caution, check safe-to-multiply here
        uint _numerator  = numerator * 10 ** (precision+1);
        // with rounding of last digit
        uint _quotient =  ((_numerator / denominator) + 5) / 10;
        return ( _quotient);
    }

    


    


    function getAllPlayerObjectLen() public view returns(uint256){
        return all_playerObjects.length;
    }
    


    function updatePlayerEmpireScore(address _playerAddress, uint256 _val, bool _isInc) external onlyAllowedContracts {

        if(_isInc == true){
          all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].totalEmpireScore
            = all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].totalEmpireScore + (_val);

          all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].additionalEmpireScore
            = all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].additionalEmpireScore + (_val);



          total_empire_score = total_empire_score + (_val);

            // TODO
          //updatePlayersDailyEmpirePos(_playerAddress, _val, true);


        } else {
          all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].totalEmpireScore
            = all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].totalEmpireScore - (_val);

          all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].additionalEmpireScore
            = all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].additionalEmpireScore - (_val);

          if(all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].additionalEmpireScore < 0)
            all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].additionalEmpireScore = 0;

          if(all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].totalEmpireScore < 0)
            all_playerObjects[playerAddressToPlayerObjectID[_playerAddress]].totalEmpireScore = 0;

          total_empire_score = total_empire_score - (_val);
          // TODO
          //updatePlayersDailyEmpirePos(_playerAddress, _val, false);
        }
    }
    








    function() payable external {
    }



}