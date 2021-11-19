
FROM node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install --save-dev @terminal-fi/celo-devchain
# RUN npm install
EXPOSE 7545

CMD npx celo-devchain --port 7545