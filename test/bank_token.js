const CUSDMock = artifacts.require("CUSDMock");
const MattCoin = artifacts.require("MattCoin");
const BankToken = artifacts.require("BankToken");

import { assert } from "chai";

require("chai").use(require("chai-as-promised")).should();

function tokens(n) {
  return web3.utils.toWei(n.toString(), "ether");
}

// Before each contract() function is run,
//    your contracts are redeployed to the running Ethereum client
//    so the tests within it run with a clean contract state.
//    And provides a list of accounts made available by your Ethereum client
// accounts = [owner, investor] :)
contract("BankToken", ([owner, investor]) => {
  context("when is deployed", async () => {
    describe(".name", async () => {
      it("contract is accesible", async () => {
        let cm = await CUSDMock.deployed();
        let mc = await MattCoin.deployed();
        let bt = await BankToken.deployed();

        let name = await bt.name();
        assert.equal(
          name,
          "stake Bank Token",
          "bank token in not properly deployed"
        );
        let cuAddress = await bt.cUSD();
        assert.equal(
          cuAddress,
          cm.address,
          "bank token doesn't have cUSD mock coin address"
        );

        let mcAddress = await bt.mattCoin();
        assert.equal(
          mcAddress,
          mc.address,
          "bank token doesn't have matt coin address"
        );
      });
    });
  });

  context("when is created", async () => {
    let cUSDMockCoin;
    let mattCoin;
    let bankToken;

    beforeEach(async () => {
      cUSDMockCoin = await CUSDMock.new();
      mattCoin = await MattCoin.new();
      bankToken = await BankToken.new(
        mattCoin.address,
        cUSDMockCoin.address,
        true
      );

      // console.log("owner", owner);
      // console.log("investor", investor);
      // console.log("mattCoin.address", mattCoin.address);
      // console.log("cUSDMockCoin.address", cUSDMockCoin.address);
      // console.log("bankToken.address", bankToken.address);

      // give some coins to investor
      // await cUSDMockCoin.approve(investor, tokens(100), { from: owner });
      await cUSDMockCoin.transfer(investor, tokens(100), { from: owner });

      // Transfer all MattCoins to Bank
      await mattCoin.transfer(bankToken.address, tokens(10000));
    });

    context(".constructor", async () => {
      it(".set default values", async () => {
        let name = await bankToken.name();
        assert.equal(
          name,
          "stake Bank Token",
          "bank token in not properly deployed"
        );
      });
    });

    context(".stakeTokens", async () => {
      it("stake 100 flexible coins successfully", async () => {
        let result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(100),
          "investor cUSD mock wallet balance is correct before staking"
        );

        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        await bankToken.stakeTokens(tokens(30), true, 0, { from: investor });

        result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(70),
          "investor cUSD mock wallet balance is correct after staking"
        );
      });

      it("prohibit send 0 coins", async () => {
        await bankToken.stakeTokens(0, true, 0, { from: investor }).should.be
          .rejected;
      });

      it("prohibit second stake", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        await bankToken.stakeTokens(tokens(10), true, 0, { from: investor });

        // second stake
        await bankToken.stakeTokens(tokens(10), true, 0, { from: investor })
          .should.be.rejected;
      });

      it("prohibit send fixed period in flexible stake", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        await bankToken.stakeTokens(tokens(10), true, 10, { from: investor })
          .should.be.rejected;
      });

      it("prohibit send 0 days period in locked stake", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        await bankToken.stakeTokens(tokens(10), false, 0, { from: investor })
          .should.be.rejected;
      });
    });

    context(".unStakeTokens", async () => {
      it("unstake 1 flexible coins successfully", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), true, 0, { from: investor });
        await bankToken.increaseTimestampMinutes(1);
        await bankToken.unStakeTokens({ from: investor });

        let result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(100),
          "investor cUSD mock wallet balance is correct after unstake"
        );

        result = await mattCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(1),
          "investor mattCoin wallet balance is correct after unstake"
        );
      });

      it("unstake 5m (x2) locked coins successfully", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), false, 5, { from: investor });

        await bankToken.increaseTimestampMinutes(5);

        await bankToken.unStakeTokens({ from: investor });

        let result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(100),
          "investor cUSD mock wallet balance is correct after unstake"
        );

        result = await mattCoin.balanceOf(investor);
        // 5m * 2
        assert.equal(
          result,
          tokens(10),
          "investor mattCoin wallet balance is correct after unstake"
        );
      });

      it("unstake 60m (x3) locked coins successfully", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), false, 60, { from: investor });

        await bankToken.increaseTimestampMinutes(60);

        await bankToken.unStakeTokens({ from: investor });

        let result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(100),
          "investor cUSD mock wallet balance is correct after unstake"
        );

        result = await mattCoin.balanceOf(investor);
        // 60m * 3
        assert.equal(
          result,
          tokens(180),
          "investor mattCoin wallet balance is correct after unstake"
        );
      });

      it("unstake 150m (x4) locked coins successfully", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), false, 150, { from: investor });

        await bankToken.increaseTimestampMinutes(150);

        await bankToken.unStakeTokens({ from: investor });

        let result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(100),
          "investor cUSD mock wallet balance is correct after unstake"
        );

        result = await mattCoin.balanceOf(investor);
        // 150m * 4
        assert.equal(
          result,
          tokens(600),
          "investor mattCoin wallet balance is correct after unstake"
        );
      });

      it("reject unstake until period ends", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), false, 150, { from: investor });

        await bankToken.increaseTimestampMinutes(100);

        await bankToken.unStakeTokens({ from: investor }).should.be.rejected;
      });

      it("reject unstake if it's not staking", async () => {
        await bankToken.unStakeTokens({ from: investor }).should.be.rejected;
      });
    });

    context(".pendingReward", async () => {
      it("has 1 flexible coins", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), true, 0, { from: investor });
        await bankToken.increaseTimestampMinutes(1);
        let result = await bankToken.pendingReward({ from: investor });
        assert.equal(result, tokens(1), "pending isn't correct");
      });

      it("has 5m (x2) locked coins", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), false, 5, { from: investor });
        await bankToken.increaseTimestampMinutes(5);
        let result = await bankToken.pendingReward({ from: investor });
        assert.equal(result, tokens(10), "pending isn't correct");
      });

      it("has 60m (x3) locked coins", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), false, 60, { from: investor });
        await bankToken.increaseTimestampMinutes(60);
        let result = await bankToken.pendingReward({ from: investor });
        assert.equal(result, tokens(180), "pending isn't correct");
      });

      it("has 120m (x4) locked coins", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });
        await bankToken.stakeTokens(tokens(30), false, 120, { from: investor });
        await bankToken.increaseTimestampMinutes(120);
        let result = await bankToken.pendingReward({ from: investor });
        assert.equal(result, tokens(480), "pending isn't correct");
      });
    });
  });
});
