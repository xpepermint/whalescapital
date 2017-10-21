pragma solidity ^0.4.13;

import "../../contracts/WhailInvestor.sol";

contract WhailInvestorMock is WhailInvestor {

  function mockDepositsHardCap(uint256 _val) external {
    depositsHardCap = _val;
  }

  function mockSeller(address _addr) external {
    seller = _addr;
  }

  function mockFeeRatio(uint8[2] _ratio) external {
    feeRatio = _ratio;
  }

}
