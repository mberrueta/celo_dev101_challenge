const MattCoin = artifacts.require("MattCoin");

module.exports = async function (deployer, network, accounts) {
  // deploy mock coin
  await deployer.deploy(MattCoin);
  const mattCoin = await MattCoin.deployed();
  await mattCoin.transfer(accounts[0], "10");
};
