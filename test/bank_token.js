const CUSDMock = artifacts.require("CUSDMock");
const MattCoin = artifacts.require("MattCoin");
const BankToken = artifacts.require("BankToken");

import { assert } from "chai";

require("chai").use(require("chai-as-promised")).should();

// Before each contract() function is run,
//    your contracts are redeployed to the running Ethereum client
//    so the tests within it run with a clean contract state.
//    And provides a list of accounts made available by your Ethereum client
// accounts = [owner, investor_a, investor_b] :)
contract("BankToken", ([owner, investor_a, investor_b]) => {
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
      bankToken = await BankToken.new(mattCoin.address, cUSDMockCoin.address);
    });

    it("has default values", async () => {
      let name = await bankToken.name();
      assert.equal(
        name,
        "stake Bank Token",
        "bank token in not properly deployed"
      );
    });
  });
});
