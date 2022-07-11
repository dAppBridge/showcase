//https://raw.githubusercontent.com/p3tron/p3tron.github.io/master/dailyroi.sol
pragma solidity ^0.4.0;


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



contract fc333Win {

    using SafeMath for uint256;
    using Percent for Percent.percent;


    // 
    // event_type = 0 = Invest, 1, reinvest, 2 = Withdraw, 3 = Bounty Paid
    event action(uint16 indexed event_type, address indexed from, address indexed to, uint256 amnt, uint256 timestamp);



    //uint256 private _1_DAY = (1 days);
    uint256 private _1_DAY = (1 minutes);


    Percent.percent private m_dailyInterest = Percent.percent(333,1000);
    Percent.percent private m_prizePercent = Percent.percent(10,100);
    Percent.percent private m_devPercent = Percent.percent(5,100);
    Percent.percent private m_refPercent = Percent.percent(5,100);
    Percent.percent private m_jackpotPercent = Percent.percent(70,100); // 30% seeds the next prize

    uint256 public  initialDaysUntilSpins = 2; // let initial investment sit for 5 days to unlock the spins
    uint256 public  noWithdrawDaysSpins   = 2; // no withdraws for 5 days to unlock the spins

    uint256 public  daysUntilOpenWithdraw = 5;
    Percent.percent private openWithdrawLimitPercent = Percent.percent(25,100);  

    uint256 public  minInvestment = 10 trx;
    uint256 public  maxInvestment = 100000 trx;

    address public  owner;
    address public  devAddress;




    mapping(address => uint256) investments;
    mapping(address => uint256) initialInvestment;
    mapping(address => uint256) lastAction;
    mapping(address => uint256) withdrawals;
    mapping(address => uint256) referrer;
    mapping(address => uint256) withdrawalTimes;
    mapping(address => uint256) lastInvestorSpin;

    uint256 public stakingRequirement = 10 trx;


    uint256 private currentJackpot;

    function getJackpot() public view returns(uint256) {
      return m_jackpotPercent.mul(currentJackpot);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
        devAddress = owner;
    }

    function () public payable {        
    }


    // game play actions

    uint256 public totalInvestments;
    uint256 public totalInvestors;
    uint256 public reinvestments;
    uint256 public fundsWithdrawn;
    uint256 public prizesWon;
    uint256 public prizeTotalWon;


    function gameStats() public view returns(
        uint256 _totalInvestments,
        uint256 _totalInvestors,
        uint256 _reinvestments,
        uint256 _fundsWithdrawn,
        uint256 _prizesWon,
        uint256 _prizeTotalWon,
        uint256 _currentPrize) {
      _totalInvestments = totalInvestments;
      _totalInvestors = totalInvestors;
      _reinvestments = reinvestments;
      _fundsWithdrawn = fundsWithdrawn;
      _prizesWon = prizesWon;
      _prizeTotalWon =prizeTotalWon;
      _currentPrize = getJackpot();
    }


    function invest(address _ref) public payable {
      require(msg.value >= minInvestment, "Min Investment Required");
      require(msg.value <= maxInvestment, "Over Max Investment");


      if(_ref != address(0) && _ref != msg.sender && investments[_ref] >= stakingRequirement){
        referrer[_ref] = referrer[_ref].add(m_refPercent.mul(msg.value));
      }

      if(investments[msg.sender] > 0){
        reinvest();
      } else {
        initialInvestment[msg.sender] = now;
        totalInvestors = totalInvestors + 1;
      }

      investments[msg.sender] = investments[msg.sender].add(msg.value);
      totalInvestments = totalInvestments.add(msg.value);
      lastAction[msg.sender] = block.timestamp;

      devAddress.transfer(m_devPercent.mul(msg.value));
      currentJackpot = currentJackpot.add(m_prizePercent.mul(msg.value));

      // event_type = 0 = Invest, 1, reinvest, 2 = Withdraw, 3 = Bounty Paid
      emit action(0, msg.sender, address(0), msg.value, now);
    }

    function reinvest() public {
      require(lastAction[msg.sender] > 0);

      // get any bounty/ref bonus...
      uint256 refBalance = getResetRefBalance(msg.sender);

      uint256 balance = getBalance(msg.sender).add(refBalance);
        
      if (balance > 0){
        // event_type = 0 = Invest, 1, reinvest, 2 = Withdraw, 3 = Bounty Paid
        emit action(1, msg.sender, address(0), balance, now);

        reinvestments = reinvestments + 1;

        uint256 _dev = m_devPercent.mul(balance);
        devAddress.transfer(_dev);

        uint256 _prize = m_prizePercent.mul(balance);
        currentJackpot = currentJackpot.add(_prize);

        balance = balance.sub(_dev);
        balance = balance.sub(_prize);

        investments[msg.sender] = investments[msg.sender].add(balance);
        lastAction[msg.sender] = now;


      }
      
    }

    function withdraw() public returns (bool){
      require(lastAction[msg.sender] > 0);

      uint refBalance = getResetRefBalance(msg.sender);

      uint256 balance = getBalance(msg.sender).add(refBalance);
      if (address(this).balance > balance){
        if (balance > 0){
          withdrawals[msg.sender] = withdrawals[msg.sender].add(balance);
          fundsWithdrawn = fundsWithdrawn.add(balance);
          withdrawalTimes[msg.sender] = now;
          msg.sender.transfer(balance);
          // event_type = 0 = Invest, 1, reinvest, 2 = Withdraw, 3 = Bounty Paid
          emit action(2, msg.sender, address(0), balance, now);
        }

        lastAction[msg.sender] = now; // reset when interest is calculated from


        return true;

      } else {

        return false;
      }
    }





    function spinWheel(uint _guess) public {
      require(daysSinceInitialInvestment(msg.sender) >= initialDaysUntilSpins, "Your investment must sit for initial days first!");
      require(daysSinceLastWithDraw(msg.sender) >= noWithdrawDaysSpins, "You must not withdraw for at least daysSinceLastWithDraw to unlock this feature!");

      uint256 _spins = spinsAvailable(msg.sender);

      require(_spins > 0, "No spins available!");

      // generate random number from randos...

      // if win transfer funds to player

    }

    function daysSinceInitialInvestment(address _Investor) view returns(uint256) {
      if(initialInvestment[msg.sender] == 0)
        return 0;
      return now.sub(initialInvestment[msg.sender]).div(_1_DAY);
    }
    function daysSinceLastAction(address _Investor) view returns(uint256) {
      if(lastAction[msg.sender] ==0)
        return;
      return now.sub(lastAction[msg.sender]).div(_1_DAY);
    }
    function daysSinceLastWithDraw(address _Investor) view returns(uint256) {
      if(withdrawalTimes[msg.sender] == 0)
        return daysSinceInitialInvestment(_Investor);
      return now.sub(withdrawalTimes[msg.sender]).div(_1_DAY);
    }
    function daysSinceLastSpin(address _Investor) view returns(uint256) {
      if(lastInvestorSpin[msg.sender] == 0)
        return daysSinceInitialInvestment(_Investor);
      return now.sub(lastInvestorSpin[msg.sender]).div(_1_DAY);
    }


    function spinsAvailable(address _Investor) view returns(uint256) {
      if(daysSinceInitialInvestment(_Investor) < initialDaysUntilSpins)
        return 0;

      if(daysSinceLastWithDraw(_Investor) < noWithdrawDaysSpins)
        return 0;

      uint256 _balance = getBalance(msg.sender);
      if(_balance ==0)
        return 0;

      uint256 _spins = 1 * _balance.div(1 trx); // 100 trx;
      if(_spins < 1)
        _spins = 1;

      uint256 _lastInvestorSpin;





      return _spins.mul(daysSinceLastSpin(msg.sender) - (noWithdrawDaysSpins-1));
    }


    function getBalance(address _address) view public returns (uint256) {
        uint256 minutesCount = now.sub(lastAction[_address]).div(1 minutes); // how many minutes they've last investment
        uint256 percent = m_dailyInterest.mul(investments[_address]); // 3.33% of their total investment - this is their daily interest
        uint256 difference = percent.mul(minutesCount).div(1440); // total interest since last investment
        ////uint256 balance = different.sub(withdrawals[_address]); // subtract any withdrawals they've made

        //return balance;
        return difference;
    }




    function investorDividends(address _Investor) public view returns(uint256) {
      uint refBalance = getResetRefBalance(msg.sender);
      uint256 balance = getBalance(msg.sender).add(refBalance);
      return balance;
    }

    function getResetRefBalance(address _Investor) internal returns(uint256) {
      uint256 refBalance = checkReferral(msg.sender);
      if(refBalance >= minInvestment) {
        referrer[msg.sender] = 0;
      }
      return refBalance;
    }



    /**
    * @dev Gets balance of the sender address.
    * @return An uint256 representing the amount owned by the msg.sender.
    */
    function checkBalance() public view returns (uint256) {
        return getBalance(msg.sender);
    }

    /**
    * @dev Gets withdrawals of the specified address.
    * @param _investor The address to query the the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function checkWithdrawals(address _investor) public view returns (uint256) {
        return withdrawals[_investor];
    }

    /**
    * @dev Gets investments of the specified address.
    * @param _investor The address to query the the balance of.
    * @return An uint256 representing the amount owned by the passed address.
    */
    function checkInvestments(address _investor) public view returns (uint256) {
        return investments[_investor];
    }

    /**
    * @dev Gets referrer balance of the specified address.
    * @param _hunter The address of the referrer
    * @return An uint256 representing the referral earnings.
    */
    function checkReferral(address _hunter) public view returns (uint256) {
        return referrer[_hunter];
    }


    function p_updateOwner(address _owner) public onlyOwner {
        owner = _owner;
    }
    function p_updateDevAddress(address _devAddress) public onlyOwner {
        devAddress = _devAddress;
    }
}
