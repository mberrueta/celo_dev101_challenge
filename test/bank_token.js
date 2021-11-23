const CUSDMock = artifacts.require("CUSDMock");
const MattCoin = artifacts.require("MattCoin");
const BankToken = artifacts.require("BankToken");

import { assert } from "chai";
import { BigNumber } from "@ethersproject/bignumber";

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
    let nowTimestamp;

    beforeEach(async () => {
      cUSDMockCoin = await CUSDMock.new();
      mattCoin = await MattCoin.new();
      bankToken = await BankToken.new(mattCoin.address, cUSDMockCoin.address);

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

      nowTimestamp = new Date().getTime();
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
        // console.log("===1====");
        let result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(100),
          "investor cUSD mock wallet balance is correct before staking"
        );

        // console.log("===2====", nowTimestamp);
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        // console.log("===3====", nowTimestamp);
        await bankToken.stakeTokens(tokens(30), nowTimestamp, true, 0, {
          from: investor,
        });

        // console.log("===4====");
        result = await cUSDMockCoin.balanceOf(investor);
        assert.equal(
          result,
          tokens(70),
          "investor cUSD mock wallet balance is correct after staking"
        );
      });

      it("prohibit send 0 coins", async () => {
        await bankToken.stakeTokens(0, nowTimestamp, true, 0, {
          from: investor,
        }).should.be.rejected;
      });

      it("prohibit second stake", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        await bankToken.stakeTokens(tokens(10), nowTimestamp, true, 0, {
          from: investor,
        });

        // second stake
        await bankToken.stakeTokens(tokens(10), nowTimestamp, true, 0, {
          from: investor,
        }).should.be.rejected;
      });

      it("prohibit send fixed period in flexible stake", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        await bankToken.stakeTokens(tokens(10), nowTimestamp, true, 10, {
          from: investor,
        }).should.be.rejected;
      });

      it("prohibit send 0 days period in locked stake", async () => {
        await cUSDMockCoin.approve(bankToken.address, tokens(30), {
          from: investor,
        });

        await bankToken.stakeTokens(tokens(10), nowTimestamp, false, 0, {
          from: investor,
        }).should.be.rejected;
      });
    });
  });
});
