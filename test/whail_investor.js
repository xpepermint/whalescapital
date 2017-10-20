const WhailInvestorMock = artifacts.require("./mocks/WhailInvestorMock.sol");

contract('WhailInvestor', (accounts) => {

  const [owner, seller, token, participant] = accounts;

  describe('#acceptDepositOf()', () => {

    it("accepts deposits", async () => {
      const amount = 1000;
      const contract = await WhailInvestorMock.new();

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

    it("limits total deposits amount (hard cap)", async () => {
      const amount = 1001;
      const contract = await WhailInvestorMock.new();

      await contract.mockDepositsHardCap(1000);

      let failed = false;
      try {
        web3.eth.sendTransaction({
          from: participant,
          to: contract.address,
          value: amount,
        });
      } catch (e) {
        failed = true;
      }

      let contractBalance = web3.eth.getBalance(contract.address);

      assert.equal(contractBalance, 0);
      assert.equal(failed, true);
    });

  });

});
