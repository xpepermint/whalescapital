const WhailInvestorMock = artifacts.require("./mocks/WhailInvestorMock.sol");

contract('WhailInvestor', (accounts) => {

  const [owner, seller, token, participant] = accounts;

  describe('deposits', () => {

    it("accepts deposits", async () => {
      const depositAmount = 1000;
      const contract = await WhailInvestorMock.new();

      web3.eth.sendTransaction({
        from: participant,
        to: contract.address,
        value: depositAmount,
      });

      const contractBalance = web3.eth.getBalance(contract.address);
      const totalDepositsAmount = await contract.totalDepositsAmount.call();
      const participantDepositBalance = await contract.deposits.call(participant);

      assert.equal(contractBalance.toNumber(), depositAmount);
      assert.equal(totalDepositsAmount.toNumber(), depositAmount);
      assert.equal(participantDepositBalance.toNumber(), depositAmount);
    });

    it("limits total deposits amount with hard cap", async () => {
      const depositAmount = 1001;
      const contract = await WhailInvestorMock.new();
      await contract.mockDepositsHardCap(1000);

      let failed = false;
      try {
        web3.eth.sendTransaction({
          from: participant,
          to: contract.address,
          value: depositAmount,
        });
      } catch (e) {
        failed = true;
      }

      const contractBalance = web3.eth.getBalance(contract.address);

      assert.equal(contractBalance, 0);
      assert.equal(failed, true);
    });

  });

  describe('withdrawals', () => {

    it("withdraws deposits", async () => {
      const depositAmount = 1000;
      const contract = await WhailInvestorMock.new();

      web3.eth.sendTransaction({
        from: participant,
        to: contract.address,
        value: depositAmount,
      });

      const participantInitialBalance = web3.eth.getBalance(participant);
      await contract.cancel(); // enable deposits

      web3.eth.sendTransaction({
        from: participant,
        to: contract.address,
        value: 0,
      });

      const contractBalance = web3.eth.getBalance(contract.address);
      const totalDepositsAmount = await contract.totalDepositsAmount.call();
      const participantDepositBalance = await contract.deposits.call(participant);
      const participantNewBalance = web3.eth.getBalance(participant);

      assert.equal(contractBalance.toNumber(), 0);
      assert.equal(totalDepositsAmount.toNumber(), 0);
      assert.equal(participantDepositBalance.toNumber(), 0);
      assert.equal(participantInitialBalance.toNumber() > participantNewBalance.toNumber(), true);
    });

    it("fails on deposit", async () => {
      const depositAmount = 1000;
      const contract = await WhailInvestorMock.new();

      web3.eth.sendTransaction({
        from: participant,
        to: contract.address,
        value: depositAmount,
      });

      await contract.cancel(); // enable deposits

      let failed = false;
      try {
        web3.eth.sendTransaction({
          from: participant,
          to: contract.address,
          value: depositAmount, // should not have value to succeed
        });
      } catch (e) {
        failed = true;
      }

      const contractBalance = web3.eth.getBalance(contract.address);
      const totalDepositsAmount = await contract.totalDepositsAmount.call();
      const participantDepositBalance = await contract.deposits.call(participant);
      const participantNewBalance = web3.eth.getBalance(participant);

      assert.equal(contractBalance.toNumber(), depositAmount);
      assert.equal(totalDepositsAmount.toNumber(), depositAmount);
      assert.equal(participantDepositBalance.toNumber(), depositAmount);
      assert.equal(failed, true);
    });

    it("fails when no balance to withdraw", async () => {
      const depositAmount = 1000;
      const contract = await WhailInvestorMock.new();

      await contract.cancel(); // enable deposits

      let failed = false;
      try {
        web3.eth.sendTransaction({
          from: participant,
          to: contract.address,
          value: 0, // should not have value to succeed
        });
      } catch (e) {
        failed = true;
      }

      assert.equal(failed, true);
    });

  });

});
