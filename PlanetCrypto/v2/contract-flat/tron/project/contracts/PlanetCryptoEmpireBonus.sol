pragma solidity ^0.4.23;


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


interface PlanetCryptoToken_I {

    function current_plot_price() external returns (uint256); 
    function updatePlayerEmpireScore(address _playerAddress, uint256 _val, bool _isInc) external;
    function receiveExternalTax() external payable;
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

contract PlanetCryptoEmpireBonus {
    
    
    using Percent for Percent.percent;
    using SafeMath for uint256;

    // EVENTS

    event action(
        address indexed player,
        uint      event_type,   
        // 0 = referral, 1 = coin minded, 2 = land purchased, 3 = tax dist, 4 = bonus dist, 5 = card bought
        // 6 = card name change, 7 = card image change, 8 = set playerFlag, 9 = buy bonus boost
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
    
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    
    address owner;
    address devAccount;
    

    modifier validPlayer() {
        require(msg.sender == tx.origin);
        _;
    }
    
    //address planetCryptoTokenAddress = 0xb398DF39dF0669d27C6FCDafB710E59256B923eB; // shasta
    address planetCryptoTokenAddress = 0x8eb0e1f9a58fe63ba21301ba4a7618125c2209eb; // mainnet
    PlanetCryptoToken_I internal planetCryptoToken_interface;


    P3TInterface public P3TToken;
    
    constructor()  public {
        owner = msg.sender;
        devAccount = owner;
        initPlanetCryptoTokenInterface();
    }


    Percent.percent private m_plotPricePackMultiplier = Percent.percent(125,100);
    Percent.percent private m_newPlot_taxPercent = Percent.percent(55,100);
    Percent.percent private m_p3tHoldersPercent = Percent.percent(2,100); 
    Percent.percent private m_refPercent = Percent.percent(5,100);
    

    struct PlayerBonusCard {
        uint    pack_id;
        uint    purchase_time;
        uint    price;
        address owner;
        uint    empire_score;
    }

    PlayerBonusCard[] public  playerBonusCards;

    function playerBonusCardsLen() view returns (uint) {
        return playerBonusCards.length;
    }


    struct BonusPack {
        uint empire_score;
        uint worthPlots;    // e.g. If this award 1000 Empire Score then it's worth 10 plots
    }

    mapping(uint => BonusPack) bonusPacks;

    function getBonusPackPrice(uint _pack_id) public view returns (uint) {
        return bonusPackPrice(_pack_id);
    }

    function bonusPackPrice(uint _pack_id) internal returns (uint) {
        uint256 _current_plot_price = planetCryptoToken_interface.current_plot_price();
        return m_plotPricePackMultiplier.mul(_current_plot_price.mul(bonusPacks[_pack_id].worthPlots));
    }




    function buyBonusPack(uint _pack_id, address _referrer) public payable validPlayer {

        // validate trx sent
        require(msg.value >= bonusPackPrice(msg.value));

        // send ref payment
        uint256 _referralAmnt = processReferer(_referrer);

        uint256 _runningTotal = msg.value.sub(_referralAmnt);

        uint _empireScore = bonusPacks[_pack_id].empire_score;
        // update the players Empire Score
        planetCryptoToken_interface.updatePlayerEmpireScore(msg.sender, _empireScore, true);

        playerBonusCards.push(PlayerBonusCard(
                    _pack_id,
                    now,
                    msg.value,
                    msg.sender,
                    _empireScore
                )
            );


        uint _trxToP3t = sendProfitToP3T(m_p3tHoldersPercent.mul(_runningTotal));

        // calculate player div % and send to game contract... 
        planetCryptoToken_interface.receiveExternalTax.value(m_newPlot_taxPercent.mul(_runningTotal))();

        // send the dev payement
        uint256 devFee = _runningTotal - _trxToP3t - m_newPlot_taxPercent.mul(_runningTotal);
        devAccount.transfer(devFee);

            emit action(msg.sender, 9, msg.value,  
                  address(0), _pack_id, 0x00,0,0,0,0, _empireScore, now);

    }


    function() payable public {
       
        
    }


    function processReferer(address _referrer) internal returns(uint256) {
        uint256 _referrerAmnt = 0;
        if(_referrer != msg.sender && _referrer != address(0)) {
            _referrerAmnt = m_refPercent.mul(msg.value);


            // send direct...
            _referrer.transfer(_referrerAmnt);

            emit action(_referrer, 0, _referrerAmnt,  
                  address(0), 0, 0x00,0,0,0,0,0,now);

        }

        return _referrerAmnt;
    }


    function updatePack(uint _pack_id, uint _empire_score, uint _worthPlots) public onlyOwner {
        bonusPacks[_pack_id].empire_score = _empire_score;
        bonusPacks[_pack_id].worthPlots = _worthPlots;
    }

    function updatePlotPricePackMultiplier(uint _val) public onlyOwner {
        m_plotPricePackMultiplier = Percent.percent(_val,100);
    }
    function updateP3Tshare(uint _val) public onlyOwner {
        m_p3tHoldersPercent = Percent.percent(_val,100);
    }
    

    function initPlanetCryptoTokenInterface() internal {
        if(address(planetCryptoTokenAddress) != address(0)){ 
            planetCryptoToken_interface = PlanetCryptoToken_I(planetCryptoTokenAddress);
        }
    }
    
    function p_update_Owner(address _owner) onlyOwner public {
        owner = _owner;
    }
    
    function p_update_devAccount(address _devAccount) onlyOwner public {
        devAccount = _devAccount;
    }

    function p_update_planetCryptoTokenAddress(address _planetCryptoTokenAddress) onlyOwner public {
        planetCryptoTokenAddress = _planetCryptoTokenAddress;
        initPlanetCryptoTokenInterface();
    }

    function p_update_taxPercent(uint _val) public onlyOwner {
        m_newPlot_taxPercent = Percent.percent(_val,100);
    }
    function p_update_refPercent(uint _val) public onlyOwner {
        m_refPercent = Percent.percent(_val,100);
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

}