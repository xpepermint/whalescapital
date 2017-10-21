const WhailInvestorMock = artifacts.require('./mocks/WhailInvestorMock.sol');
const TokenMock = artifacts.require('./mocks/TokenMock.sol');

contract('WhailInvestor', (accounts) => {

  const [owner, seller, participant0, participant1] = accounts;

  describe('#()', () => {

    describe('deposits', () => {

      it('accepts deposits', async () => {
        const depositAmount = 1000;
        const contract = await WhailInvestorMock.new();

        web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount });

        const contractBalance = web3.eth.getBalance(contract.address);
        const totalDepositsAmount = await contract.totalDepositsAmount.call();
        const participantDeposit = await contract.deposits.call(participant0);

        assert.equal(contractBalance.toNumber(), depositAmount);
        assert.equal(totalDepositsAmount.toNumber(), depositAmount);
        assert.equal(participantDeposit.toNumber(), depositAmount);
      });

      it('limits deposits with hard cap', async () => {
        const depositAmount = 1001;
        const contract = await WhailInvestorMock.new();
        await contract.mockDepositsHardCap(1000);

        let failed = false;
        try {
          web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount });
        } catch (e) {
          failed = true;
        }

        const contractBalance = web3.eth.getBalance(contract.address);

        assert.equal(contractBalance, 0);
        assert.equal(failed, true);
      });

    });

    describe('withdrawals', () => {

      it('withdraws deposits', async () => {
        const depositAmount = 1000;
        const contract = await WhailInvestorMock.new();

        web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount });

        const participantInitialBalance = web3.eth.getBalance(participant0);
        await contract.cancel(); // enable deposits

        web3.eth.sendTransaction({ from: participant0, to: contract.address, value: 0 });

        const contractBalance = web3.eth.getBalance(contract.address);
        const totalDepositsAmount = await contract.totalDepositsAmount.call();
        const participantDeposit = await contract.deposits.call(participant0);
        const participantNewBalance = web3.eth.getBalance(participant0);

        assert.equal(contractBalance.toNumber(), 0);
        assert.equal(totalDepositsAmount.toNumber(), 0);
        assert.equal(participantDeposit.toNumber(), 0);
        assert.equal(participantInitialBalance.toNumber() > participantNewBalance.toNumber(), true);
      });

      it('fails on deposit', async () => {
        const depositAmount = 1000;
        const contract = await WhailInvestorMock.new();

        web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount });

        await contract.cancel(); // enable deposits

        let failed = false;
        try {
          web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount });
        } catch (e) {
          failed = true;
        }

        const contractBalance = web3.eth.getBalance(contract.address);
        const totalDepositsAmount = await contract.totalDepositsAmount.call();
        const participantDeposit = await contract.deposits.call(participant0);
        const participantNewBalance = web3.eth.getBalance(participant0);

        assert.equal(contractBalance.toNumber(), depositAmount);
        assert.equal(totalDepositsAmount.toNumber(), depositAmount);
        assert.equal(participantDeposit.toNumber(), depositAmount);
        assert.equal(failed, true);
      });

      it('fails when no balance to withdraw', async () => {
        const depositAmount = 1000;
        const contract = await WhailInvestorMock.new();

        await contract.cancel(); // enable deposits

        let failed = false;
        try {
          web3.eth.sendTransaction({ from: participant0, to: contract.address, value: 0 });
        } catch (e) {
          failed = true;
        }

        assert.equal(failed, true);
      });

    });
  });

  describe('claims', () => {

    it('transfers tokens', async () => {
      const initialTokenBalance = 1000000;
      const depositAmount0 = 50;
      const depositAmount1 = 150;
      const contract = await WhailInvestorMock.new();

      let token = await TokenMock.new(contract.address, initialTokenBalance);
      await contract.mockToken(token.address);
      
      web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount0 });
      web3.eth.sendTransaction({ from: participant1, to: contract.address, value: depositAmount1 });
      await contract.invest();
      web3.eth.sendTransaction({ from: participant0, to: contract.address, value: 0 });
      
      const totalDepositsAmount = depositAmount0 + depositAmount1;
      const newTokenBalance = await token.balanceOf(contract.address);
      const participant0TokenBalance = await token.balanceOf(participant0);
      
      assert.equal(participant0TokenBalance.toNumber(), initialTokenBalance * depositAmount0 / totalDepositsAmount);
      assert.equal(newTokenBalance.toNumber(), initialTokenBalance - participant0TokenBalance);
    });

    it('fails on deposit', async () => {
      const initialTokenBalance = 1000000;
      const depositAmount = 1000;
      const contract = await WhailInvestorMock.new();

      let token = await TokenMock.new(contract.address, initialTokenBalance);
      await contract.mockToken(token.address);

      web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount });
      await contract.invest();

      let failed = false;
      try {
        web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount });
      } catch (e) {
        failed = true;
      }

      const participant0Deposit = await contract.deposits.call(participant0);
      const newTokenBalance = await token.balanceOf(contract.address);
      
      assert.equal(participant0Deposit.toNumber(), depositAmount);
      assert.equal(newTokenBalance.toNumber(), initialTokenBalance);
      assert.equal(failed, true);
    });

  });
    
  describe('#cancel()', () => {

    it('sets stage', async () => {
      const contract = await WhailInvestorMock.new();
      await contract.cancel({ from: owner });

      const stage = await contract.stage.call();

      assert.equal(stage.toNumber(), 1);
    });

    it('restricts access to owner only', async () => {
      const contract = await WhailInvestorMock.new();

      let failed = false;
      try {
        await contract.cancel({ from: participant0 }); // should be owner
      } catch (e) {
        failed = true;
      }

      assert.equal(failed, true);
    });

  });

  describe('#invest()', () => {

    it('transfers funds to seller', async () => {
      const depositAmount0 = 1000;
      const depositAmount1 = 2000;
      const contract = await WhailInvestorMock.new();

      web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount0 });
      web3.eth.sendTransaction({ from: participant1, to: contract.address, value: depositAmount1 });
      
      const sellerInitialBalance = web3.eth.getBalance(seller);

      await contract.mockSeller(seller);
      await contract.invest();

      const contractBalance = web3.eth.getBalance(contract.address);
      const totalDepositsAmount = depositAmount0 + depositAmount1;
      const sellerNewBalance = web3.eth.getBalance(seller);
      
      assert.equal(contractBalance.toNumber(), 0);
      assert.equal(sellerNewBalance.toNumber(), sellerInitialBalance.toNumber() + totalDepositsAmount);
    });

    it('keeps fee amount', async () => {
      const depositAmount0 = 1000;
      const depositAmount1 = 2000;
      const feePercent = 5;
      const contract = await WhailInvestorMock.new();

      web3.eth.sendTransaction({ from: participant0, to: contract.address, value: depositAmount0 });
      web3.eth.sendTransaction({ from: participant1, to: contract.address, value: depositAmount1 });
      
      const sellerInitialBalance = web3.eth.getBalance(seller);

      await contract.mockSeller(seller);
      await contract.mockFeeRatio([feePercent, 100]); // 5%
      await contract.invest();

      const contractBalance = web3.eth.getBalance(contract.address);
      const totalDepositsAmount = depositAmount0 + depositAmount1;
      const sellerNewBalance = web3.eth.getBalance(seller);
      
      assert.equal(contractBalance.toNumber(), totalDepositsAmount * feePercent / 100);
      assert.equal(sellerNewBalance.toNumber(), sellerInitialBalance.toNumber() + totalDepositsAmount * (100 - feePercent) / 100);
    });

  });
    
});
