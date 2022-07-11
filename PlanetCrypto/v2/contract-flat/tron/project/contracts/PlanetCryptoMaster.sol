pragma solidity ^0.5.0;

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

contract PlanetCryptoTokenEth is ERC721Full_custom{
    
    using Percent for Percent.percent;

    modifier allowContract() {
        require(allowedContracts[msg.sender] == true);
        _;
    }

    // Master contract...
    // holders players main stats:
    // empire score
    // daily activity
    // receives from PlanetCryptoToken (And other future contracts..)
    // + ETH for daily pot
    // + Empire score changes for players
    // This contract solely holds token info and changes
    address payable owner;
    
    mapping(address => bool) public allowedContracts;
    
    struct Player {
        uint empire_score;
        uint totalLand;
        uint startTime;
        uint lastAction;
        
        bytes32 flagDetail;
        bool    flagSet;
        
        string vanity;
        bool vanityStatus;
    }
    
    mapping(address => Player) public players;
    
    
    
    struct dayBonus {
      uint      empireScoreTotals;
      bool      processed;
      uint      bonus;
      mapping(address=>uint)  player_empireScore;
      address[] activePlayers;
      uint      startTS;
    }

    uint32 public currentDay;
    uint   private dayBonusLength = (24 hours); 

    mapping(uint32 => dayBonus) public day_dayBonuses;

    function day_dayBonusEmpireScore(uint32 _day, address _address) public view returns(uint) {
      return day_dayBonuses[_day].player_empireScore[_address];
    }
    function day_dayBonusActivePlayers(uint32 _day) public view returns(address[] memory) {
      return day_dayBonuses[_day].activePlayers;
    }
    function dayBonusAvail(uint32 _day) public view returns(uint) {
      return m_newPlot_bonusPotDayDistPercent.mul(day_dayBonuses[_day].bonus);
    }
    
    
    
    
    
    constructor () {
        owner = msg.sender;
    }
    
    function receiveExternalDailyBonus() external payable {
        
    }
    
    function receivePlayerEmpireScoreChange(address _player, uint _score_change, bool _is_inc) public allowContract {
        if(players[_player].startTime == 0){
            players[_player.startTime = now;
        }
        players[_player.lastAction] = now
        if(_is_inc)
            players[_player].empire_score = players[_player].add(_score_change);
        else
            players[_player].empire_score = players[_player].sub_score_change);
    }
    
    
    
    /* daily bonus routines */
/*
    struct dayBonus {
      uint      empireScoreTotals;
      bool      processed;
      uint      bonus;
      mapping(address=>uint)  player_empireScore;
    }
    mapping(uint => dayBonus) public day_dayBonus;
*/
    function updatePlayersDailyEmpirePos(address _player, uint _score, bool _inc) internal {
      if(_inc == true) {
        if(day_dayBonuses[currentDay].player_empireScore[_player] == 0) {
          //day_activePlayers[currentDay].push(_player);
          day_dayBonuses[currentDay].activePlayers.push(_player);
        }

        day_dayBonuses[currentDay].player_empireScore[_player] = day_dayBonuses[currentDay].player_empireScore[_player] + _score;

        day_dayBonuses[currentDay].empireScoreTotals = day_dayBonuses[currentDay].empireScoreTotals + _score;
      } else {
        if(_score > day_dayBonuses[currentDay].empireScoreTotals)
          day_dayBonuses[currentDay].empireScoreTotals;

        if(day_dayBonuses[currentDay].player_empireScore[_player] == 0) {

          return;
        }
        if(_score > day_dayBonuses[currentDay].player_empireScore[_player]) {
          day_dayBonuses[currentDay].player_empireScore[_player] = 0;
        } else {
          
          day_dayBonuses[currentDay].empireScoreTotals = day_dayBonuses[currentDay].empireScoreTotals - _score;
          day_dayBonuses[currentDay].player_empireScore[_player] = day_dayBonuses[currentDay].player_empireScore[_player] - _score;
        }
      }

    }


    modifier checkCurrentDay() {
      if(day_dayBonuses[currentDay].startTS + dayBonusLength < now) // day has passed
        finaliseDay();
      _;
    }



    function finaliseDay() public {
      require(day_dayBonuses[currentDay].startTS + dayBonusLength < now, "Day Not Yet Ended!");
      currentDay++;
      day_dayBonuses[currentDay].startTS = now;
      distPreviousDaysBonus();
    }
    
    

    function distPreviousDaysBonus() public {
      require(currentDay > 0);
      require(day_dayBonuses[currentDay-1].processed == false);
      require(day_dayBonuses[currentDay-1].startTS + dayBonusLength < now, "Day Not Yet Ended!");
      
      uint _playersPercent;
      uint _playerShare;

      uint _todaysAward = m_newPlot_bonusPotDayDistPercent.mul(day_dayBonuses[currentDay-1].bonus);
      
      for(uint16 c=0; c< day_dayBonuses[currentDay-1].activePlayers.length; c++) {



        _playersPercent = (
                          day_dayBonuses[currentDay-1].player_empireScore[ day_dayBonuses[currentDay-1].activePlayers[c] ]*10000000
                          /
                          day_dayBonuses[currentDay-1].empireScoreTotals*10000000
                          )  / 10000000;

        _playerShare = _todaysAward * _playersPercent / 10000000;


        // transfer the _playerShare as it's a daily bonus...
        //playersFundsOwed[day_dayBonuses[currentDay-1].activePlayers[c]] = 
        //      playersFundsOwed[day_dayBonuses[currentDay-1].activePlayers[c]].add(_playerShare);

        all_playerObjects[playerAddressToPlayerObjectID[day_dayBonuses[currentDay-1].activePlayers[c]]].fundsOwed = 
            all_playerObjects[playerAddressToPlayerObjectID[day_dayBonuses[currentDay-1].activePlayers[c]]].fundsOwed.add(_playerShare);
            
        tax_fund = tax_fund.add(_playerShare); // New correction
        tax_distributed = tax_distributed.add(_playerShare);
        

        //emit bonusDistributed(_playerShare, day_dayBonuses[currentDay-1].activePlayers[c], now);
        emit action(
              day_dayBonuses[currentDay-1].activePlayers[c],
              4,
              _playerShare,
              address(0), 0, 0x00,0,0,0,0,0,now
            );

      }

      day_dayBonuses[currentDay-1].bonus = day_dayBonuses[currentDay-1].bonus.sub(_todaysAward);
      // seed current days bonus...
      day_dayBonuses[currentDay].bonus = day_dayBonuses[currentDay].bonus + day_dayBonuses[currentDay-1].bonus;
      day_dayBonuses[currentDay-1].processed = true;

      
    }
    
    

    /**
    * Action by vanity
    * Vanity referral links (Show vanity in cardholder box)
    */
    function buyVanity(string memory _vanity) public payable dontAllowOtherContractAction {
        /*--------------------- validate --------------------------------*/
        require(msg.value >= VANITY_PRICE);
        require(isVanityExisted(_vanity) == false);
        /*--------------------- handle --------------------------------*/
        playersVanity[msg.sender].vanity = _vanity;
        playersVanity[msg.sender].vanityStatus = true;
        // update list vanity address
        listVanityAddress[convertStringToBytes32(_vanity)] = msg.sender;
        /*--------------------- event --------------------------------*/
        emit onBuyVanity(msg.sender, _vanity, msg.value);
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


    function getPlayerFlag(address _player) public view returns (bytes32 flagDetail,
      bool    flagSet) {
      flagDetail = playerFlags[_player].flagDetail;
      flagSet = playerFlags[_player].flagSet;
    }

    function updatePlayerFlag(bytes32 _newFlag) public payable {
      if(playerFlags[msg.sender].flagSet) {
        // allow changes once set
      } else {
        require(msg.value >= playerFlagCost);
        playerFlags[msg.sender].flagSet = true;
      }
      playerFlags[msg.sender].flagDetail = _newFlag;


      emit action(
          msg.sender,
          8,
          msg.value,
          address(0),
          0,
          _newFlag,0,0,0,0,0,now);

      calcPlayerDivs(m_updates_taxPercent.mul(msg.value));
      devBankAddress.transfer(m_updates_devPercent.mul(msg.value));

      
    }
    
    
    
}