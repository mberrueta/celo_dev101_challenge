const MattCoin = artifacts.require("MattCoin");

import { assert } from "chai";

require("chai")
  .use(require("chai-as-promised"))
  .should();

// Before each contract() function is run,
//    your contracts are redeployed to the running Ethereum client
//    so the tests within it run with a clean contract state.
//    And provides a list of accounts made available by your Ethereum client
// accounts = [owner, investor_a, investor_b] :)
contract("MattCoin", ([owner, investor_a, investor_b]) => {
  context("when is deployed", async () => {
    describe(".balanceOf", async () => {
      it("put 10000 MattCoin in the first account", async () => {
        let mc = await MattCoin.deployed();
        let balance = await mc.balanceOf(investor_a);
        assert.equal(balance, 10, "10 wasn't in the first account");
      });

      it("doesn't give coins to 2nd account", async () => {
        let mc = await MattCoin.deployed();
        let balance = await mc.balanceOf(investor_b);
        assert.equal(balance, 0, "second account is not empty");
      });
    });
  });

  context("when is created", async () => {
    let mattCoin;

    beforeEach(async () => {
      mattCoin = await MattCoin.new();
    });

    it("has default values", async () => {
      let _name = await mattCoin.name();
      assert.equal(_name, "Matt Token");
      let symbol = await mattCoin.symbol();
      assert.equal(symbol, "MATT");
      let totalSupply = await mattCoin.totalSupply();
      assert.equal(totalSupply, 1000000000000000000000000);
    });

    describe(".transfer", async () => {
      it("send 10 coins to B", async () => {
        await mattCoin.transfer(investor_b, 10);
        let balance = await mattCoin.balanceOf(investor_b);
        assert.equal(balance, 10, "second account doesn't have 10 coins");
      });

      // it("reject send coins to A", async () => {
      //   await mattCoin.transfer(owner, 10);
      //   let balance = await mattCoin.balanceOf(investor_a);
      //   assert.equal(balance, 10, "second account doesn't have 10 coins");
      // });
    });

  });
});
