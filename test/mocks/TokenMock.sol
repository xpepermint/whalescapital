pragma solidity ^0.4.13;

import "../../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol";

contract TokenMock is StandardToken {

  function TokenMock(address initialAccount, uint256 initialBalance) {
    balances[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

}
