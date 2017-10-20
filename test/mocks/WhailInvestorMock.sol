pragma solidity ^0.4.13;

import "../../contracts/WhailInvestor.sol";

contract WhailInvestorMock is WhailInvestor {

  function mockDepositsHardCap(uint256 _val) external {
    depositsHardCap = _val;
  }

}
