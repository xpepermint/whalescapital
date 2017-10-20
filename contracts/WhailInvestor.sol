pragma solidity ^0.4.13;

contract WhailInvestor {

  /**
   * Contract stages.
   */
  enum Stages {
    AcceptingDeposits
  }

  /**
   * Current contract stage.
   */
  Stages public stage = Stages.AcceptingDeposits;

  /**
   * Depesit amounts per address.
   */
  mapping (address => uint256) public deposits;

  /**
   * Total amount ever received.
   */
  uint256 public totalDepositsAmount = 0;

  /**
   * Maximum allowed total deposits amount.
   */
  uint256 public depositsHardCap = 1000;

  /**
   * Handles a deposit from ethereum wallets.
   */
  function acceptDepositOf(address _from, uint _amount) internal {
    require(_amount > 0);
    require(totalDepositsAmount + _amount <= depositsHardCap);

    totalDepositsAmount += _amount;
    deposits[_from] += _amount;
  }

  /**
   * Accepts deposits, withdraws deposits or transfer tokens.
   */
  function() payable {
    if (stage == Stages.AcceptingDeposits) {
      acceptDepositOf(msg.sender, msg.value);
    }
  }

}
