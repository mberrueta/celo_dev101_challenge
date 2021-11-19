# celo_dev101_challenge

## Local Development Chain with Protocol Contracts

[Local Celo development](https://docs.celo.org/developer-guide/development-chain) blockchain running exposed at `http://localhost:7545`

```sh
npm install --save-dev @terminal-fi/celo-devchain
npx celo-devchain --port 7545
```

## Setup

```sh
npm install @truffle/hdwallet-provider --save
truffle init

echo "
MNEMONIC='here you super secret alfajores keys'
ADDRESS=xxx
" >>  .env

echo "
.env" >> .gitignore # don't forge to exclude from u repo :)

export $(cat ./.env | sed 's/#.*//g' | xargs ) # to get all envs in the terminal

npx create-react-app app
```

In order to use the local blockchain edit the `truffle-config.js` to include

```js
module.exports = {
  networks: {
    local: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"
    },
    testnet: {
      provider: function() {
        return new HDWalletProvider(process.env.MNEMONIC, "https://alfajores-forno.celo-testnet.org")
      },
      network_id: 44787,
      gas: 20000000
    },
    // eventually
    //   mainnet: {
    //     provider: function() {
    //       return new HDWalletProvider(process.env.MNEMONIC, "https://forno.celo.org")
    //     },
    //     network_id: 42220,
    //     gas: 4000000
    //   }
    // }
}
```

## Deploying contracts

```sh
truffle compile
truffle migrate
truffle deploy --network local --reset # redeploy contracts with a new contract address
truffle deploy --network alfajores
```

[block explorer](https://explorer.celo.org/)

## Creating a contract

```sh
truffle create contract MattCoin
```