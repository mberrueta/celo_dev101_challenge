
FROM node:16.13

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# RUN npm install --save-dev @terminal-fi/celo-devchain
RUN yarn add --dev @terminal-fi/celo-devchain
# RUN npm install
EXPOSE 8545

# CMD npx celo-devchain --port 8545
CMD yarn run celo-devchain --port 8545
