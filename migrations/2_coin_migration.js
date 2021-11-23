const CUSDMock = artifacts.require("CUSDMock");
const MattCoin = artifacts.require("MattCoin");
const BankToken = artifacts.require("BankToken");

module.exports = async function (deployer, network, accounts) {
  // deploy mock coin & give some coins to 1 account
  await deployer.deploy(CUSDMock);
  const cUSDM = await CUSDMock.deployed();
  await cUSDM.transfer(accounts[1], web3.utils.toWei("100", "ether"));

  // deploy matt coin
  await deployer.deploy(MattCoin);
  const mattCoin = await MattCoin.deployed();

  // cUSD (Alfajores testnet) = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
  // cUSD (Celo mainnet) =      "0x765DE816845861e75A25fCA122bb6898B8B1282a"
  await deployer.deploy(BankToken, mattCoin.address, cUSDM.address);
  const bankToken = await BankToken.deployed();

  await mattCoin.transfer(
    bankToken.address,
    web3.utils.toWei("100000", "ether")
  );
};
