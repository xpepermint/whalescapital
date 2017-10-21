pragma solidity ^0.4.13;

/**
 * Smart contract allows fror investing into ICOs.
 */
contract WhailInvestor {

  /**
   * Available contract stages.
   */
  enum Stages { Opened, Canceled, Invested }

  /**
   * Current contract stage.
   */
  Stages public stage = Stages.Opened;

  /**
   * Received ETH amounts per address.
   */
  mapping (address => uint256) public deposits;

  /**
   * Total ETH amount ever received.
   */
  uint256 public totalDepositsAmount = 0;

  /**
   * Maximum received deposits (0 = unlimited).
   */
  uint256 public depositsHardCap = 0;

  /**
   * Current contract stage.
   */
  address public owner;

  /**
   * Seller's address.
   */
  address public seller;

  /**
   * Ratio defining a fee amount that stays on the contract. Because floats are
   * not provided by the Solidity, we define ratio as an array holding numerator
   * and denominator (numerator / denominator = ratio).
   */
  uint8[2] public feeRatio = [0, 1]; // e.g. [5, 100] = 5%

  /**
   * Contract constructor.
   */
  function WhailInvestor() {
    owner = msg.sender;
  }

  /**
   * Modifier which requires an owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
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
   * Sends funds to seller.
   */
  function invest() external
    onlyOwner()
  {
    stage = Stages.Invested;

    uint256 feeAmount = totalDepositsAmount * feeRatio[0] / feeRatio[1];
    uint256 amount = totalDepositsAmount - feeAmount;
    
    seller.transfer(amount);
  }

  /**
   * Handles deposits from ethereum wallets.
   */
  function acceptDeposit() internal {
    require(msg.value > 0);
    require(totalDepositsAmount + msg.value <= depositsHardCap || depositsHardCap == 0);

    totalDepositsAmount += msg.value;
    deposits[msg.sender] += msg.value;
  }

  /**
   * Makes a refund for the provided address.
   */
  function withdrawDeposit() internal {
    require(msg.value == 0);
    require(deposits[msg.sender] > 0);

    uint256 amount = deposits[msg.sender];

    totalDepositsAmount -= amount;
    deposits[msg.sender] -= amount;

    msg.sender.transfer(amount);
  }

  /**
   * Transfers tokens to participant.
   */
  function claimTokens() internal {
    // TODO
  }

  /**
   * Accepts deposits, withdraws deposits or transfers tokens.
   */
  function() payable {
    if (stage == Stages.Opened) {
      acceptDeposit();
    } else if (stage == Stages.Canceled) {
      withdrawDeposit();
    } else if (stage == Stages.Invested) {
      claimTokens();
    } else {
      revert();
    }
  }

}
