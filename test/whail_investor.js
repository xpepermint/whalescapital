const WhailInvestor = artifacts.require("../contracts/WhailInvestor.sol");

contract('WhailInvestor', (accounts) => {

  const [owner, seller, token, participant] = accounts;

  describe('#acceptDepositOf()', () => {

    it("accepts deposits", async () => {
      const amount = 1000;
      const contract = await WhailInvestor.new();

      web3.eth.sendTransaction({
        from: participant,
        to: contract.address,
        value: amount,
      });

      const contractBalance = web3.eth.getBalance(contract.address);
      const totalDepositsAmount = await contract.totalDepositsAmount.call();
      const participantDepositBalance = await contract.deposits.call(participant);

      assert.equal(contractBalance.toNumber(), amount);
      assert.equal(totalDepositsAmount.toNumber(), amount);
      assert.equal(participantDepositBalance.toNumber(), amount);
    });

  });

});
