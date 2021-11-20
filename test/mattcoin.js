const MattCoin = artifacts.require("MattCoin");

// Before each contract() function is run,
//    your contracts are redeployed to the running Ethereum client
//    so the tests within it run with a clean contract state.
//    And provides a list of accounts made available by your Ethereum client
// accounts = [owner, investor_a, investor_b] :)
contract("MattCoin", ([owner, investor_a, investor_b]) => {
  describe(".deployed", async () => {
    context("when is created", async () => {
      it("has default values", async () => {
        MattCoin.new()
          .then((mc) => mc.name)
          .then((name) => assert.equal(name, "Matt Token"))
          .then((mc) => mc.symbol)
          .then((symbol) => assert.equal(symbol, "MATT"))
          .then((mc) => mc.totalSupply)
          .then((totalSupply) =>
            assert.equal(totalSupply, 1000000000000000000000000)
          );
      });
    });

    context("when is deployed", async () => {
      it("put 10000 MattCoin in the first account", async () => {
        MattCoin.deployed()
          .then((mc) => mc.balanceOf(investor_a))
          .then((b) => {
            assert.equal(
              b.valueOf(),
              10000,
              "10000 wasn't in the first account"
            );
          });
      });

      it("doesn't give coins to 2nd account", async () => {
        MattCoin.deployed()
          .then((mc) => mc.balanceOf(investor_b))
          .then((b) => {
            assert.equal(
              b.valueOf(),
              0,
              "second account is not empty"
            );
          });
      });
    });
  });
});
