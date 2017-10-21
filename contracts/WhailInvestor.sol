pragma solidity ^0.4.13;

contract WhailInvestor {

  /**
   * Contract stages.
   */
  enum Stages {
    Opened,
    Closed,
    Canceled
  }

  /**
   * Current contract stage.
   */
  Stages public stage = Stages.Opened;

  /**
   * Current contract stage.
   */
  address owner;

  /**
   * Depesit amounts per address.
   */
  mapping (address => uint256) public deposits;

  /**
   * Total amount ever received.
   */
  uint256 public totalDepositsAmount = 0;

  /**
   * Maximum allowed total deposits amount (0 = unlimited).
   */
  uint256 public depositsHardCap = 0;

  /**
   * Contract constructor.
   */
  function WhailInvestor()
  {
    owner = msg.sender;
  }

  /**
   * Modifier to allow only owner's action.
   */
  modifier onlyOwner()
  {
    require(
      msg.sender == owner
    );
    _;
  }

  /**
   * Stops accepting deposits.
   */
  function close() external
    onlyOwner()
  {
    stage = Stages.Closed;
  }

  /**
   * Stops accepting deposits and enables withdrawals.
   */
  function cancel() external
    onlyOwner()
  {
    stage = Stages.Canceled;
  }

  /**
   * Handles a deposit from ethereum wallets.
   */
  function acceptDeposit() internal
  {
    require(
      msg.value > 0
    );
    require(
      totalDepositsAmount + msg.value <= depositsHardCap
      || depositsHardCap == 0
    );

    totalDepositsAmount += msg.value;
    deposits[msg.sender] += msg.value;
  }

  /**
   * Makes a refund for the provided address.
   */
  function withdrawDeposit() internal
  {
    require(
      msg.value == 0
    );
    require(
      deposits[msg.sender] > 0
    );

    uint256 amount = deposits[msg.sender];

    totalDepositsAmount -= amount;
    deposits[msg.sender] -= amount;

    msg.sender.transfer(amount);
  }

  /**
   * Accepts deposits, withdraws deposits or transfers tokens.
   */
  function() payable
  {
    if (stage == Stages.Opened)
    {
      acceptDeposit();
    }
    else if (stage == Stages.Canceled)
    {
      withdrawDeposit();
    }
  }

}
