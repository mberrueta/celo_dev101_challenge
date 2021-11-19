const MattCoin = artifacts.require('MattCoin');

module.exports =  function (deployer) {
    // deploy mock coin
    deployer.deploy(MattCoin)
    // const daiToken = await MattCoin.deployed()
};
