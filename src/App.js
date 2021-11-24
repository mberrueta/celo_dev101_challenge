import "./App.css";
import logo from "./logo.svg";

import { BankToken } from "./abis/BankToken.json";
import { IERC20 } from "./abis/IERC20.json";
import { MattCoin } from "./abis/MattCoin.json";
import React, { Component } from "react";

import { newKitFromWeb3 } from "@celo/contractkit";
import { Web3 } from "web3";
import { BigNumber } from "bignumber.js";
import { ContractFactories } from "@celo/contractkit/lib/web3-contract-cache";

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  // Connect app to the blockchain
  async loadWeb3() {
    if (window.celo) {
      // this.notification("⚠️ please approve this Dapp to use");
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        kit.defaultAccount = accounts[0];
      } catch (error) {
        console.error(error);
        // this.notification("☠ ", error);
      }
    } else {
      this.notification("☠ Install the Cello Wallet ⚠️");
    }
  }

  async loadBlockchainData() {
    // this.setState({ loading: false });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      celoToken: {},
      mattToken: {},
      bank: {},
      celoTokenBalance: "0",
      mattTokenBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  notification = (msg) => {
    window.alert(msg);
  };

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <p od="loader" className="loading">
          {" "}
          loading{" "}
        </p>
      );
    } else {
      <p od="loader" className="loading">
        {" "}
        done{" "}
      </p>;
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="content mr-auto ml-auto">{content}</div>
        </header>
      </div>
    );
  }
}

export default App;
