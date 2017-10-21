pragma solidity ^0.4.13;

import "../../contracts/WhailInvestor.sol";
import "../../node_modules/zeppelin-solidity/contracts/token/ERC20Basic.sol";

contract WhailInvestorMock is WhailInvestor {

  function mockDepositsHardCap(uint256 _val) external {
    depositsHardCap = _val;
  }

  function mockSeller(address _addr) external {
    seller = _addr;
  }

  function mockToken(address _addr) external {
    token = ERC20Basic(_addr);
  }

  function mockFeeRatio(uint8[2] _ratio) external {
    feeRatio = _ratio;
  }

}
