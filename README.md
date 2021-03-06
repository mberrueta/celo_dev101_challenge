# celo_dev101_challenge

## Local Development Chain with Protocol Contracts

[Local Celo development](https://docs.celo.org/developer-guide/development-chain) blockchain running exposed at `http://localhost:8545`

```sh
# doesn't work for me
# npm install --save-dev @terminal-fi/celo-devchain
# npx celo-devchain --port 8545

yarn add --dev @terminal-fi/celo-devchain
yarn run celo-devchain --port 8545

# OR with docker
docker build -t celo_blockchain .
docker rm celo_blockchain
docker run --name celo_blockchain -p 8545:8545 celo_blockchain
docker stop celo_blockchain

# Client
npm install -g @celo/celocli
celocli config:set --node=http://localhost:8545
celocli node:accounts

# Add to the .env
# first address FROM=
celocli node:accounts | head -n 3 | tail -n 1 | tr -d "'|,| " | pbcopy
# > 0x5409ED021D9299bf6814279A6A1411A7e866A631
# second address TO=
celocli node:accounts | head -n 4 | tail -n 1 | tr -d "'|,| " | pbcopy
# > 0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb

```

Sadly the errors doesn't prompt very well, so instead I started with [Ganache](https://www.trufflesuite.com/ganache)

## Setup

```sh
npm install @truffle/hdwallet-provider --save
truffle **init**

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
      port: 8545,
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

## Test

```sh
# --stacktrace????(will produce trace for transactions)
# --stacktrace-extra (will turn on compile traces)
truffle test
truffle console # JS dev environment
```

## Deploy contracts

### Alfajores net

Import contracts to [remix](https://remix.ethereum.org/#optimize=false&runs=200&evmVersion=null&version=soljson-v0.8.7+commit.e28d00a7.js)

deploy `IER20.sol`, `MattCoin.sol` (copy contract address), sett in `BankToken.sol` the mattCoin address, the celo alfajores address (`0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1`)

Deployed:

- IER20.sol: 0xe5a769BEe2AD606d2De4cc64fadDB4c17E9874c0
- MattCoin.sol: 0xbAAF3d3C03f05E048c8082b570C7af89E4B11519
- BankToken.sol: 0xdf1AF8D765853C9a29094A4D3204B9a02e0597A0

## Run

```sh
npm run start
```

## Docs

[Style Guide](https://docs.soliditylang.org/en/v0.5.3/style-guide.html)
