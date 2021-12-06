import "./App.css";

import { BankToken } from "./abis/BankToken.json";
import { IERC20 } from "./abis/IERC20.json";
import { MattCoin } from "./abis/MattCoin.json";
import Navbar from "./components/Navbar";

import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { BigNumber } from "bignumber.js";
import { ContractFactories } from "@celo/contractkit/lib/web3-contract-cache";
import { Button, Container, Row, Col } from "react-bootstrap";
import * as React from "react";
import AlertDismissible from "./components/AlertDismissible";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handler = this.handler.bind(this);
    this.state = {
      account: "0x0",
      celoToken: {},
      mattToken: {},
      bank: {},
      celoTokenBalance: "0",
      mattTokenBalance: "0",
      stakingBalance: "0",
      loading: true,
      showAlert: false,
      title: "",
      message: "",
    };
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  // Connect app to the blockchain
  async loadWeb3() {
    if (window.celo) {
      this.notification("Warning ⚠️", "please approve this Dapp to use");
      try {
        await window.celo.enable();
        // const web3 = new Web3("https://alfajores-forno.celo-testnet.org")
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        let accounts = await kit.web3.eth.getAccounts();
        console.info(accounts[0]);
        kit.defaultAccount = accounts[0];
        this.setState({ account: accounts[0] });
      } catch (error) {
        this.notification("Error ☠", error.toString());
      }
    } else {
      this.notification("Error ☠", "Install the Cello Wallet ⚠️");
    }
  }

  async loadBlockchainData() {
    this.setState({ loading: false });
  }

  notification = (title, msg) => {
    this.setState({ showAlert: true, title: title, message: msg });
  };

  handler() {
    this.setState({ showAlert: false });
  }

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
        <Container fluid>
          <Row>
            <Col>
              <header className="App-header">
                <Navbar account={this.state.account} />
              </header>
            </Col>
          </Row>
          <Row className="content">
            <Col>
              {content}
              <AlertDismissible
                show={this.state.showAlert}
                title={this.state.title}
                message={this.state.message}
                handler={this.handler}
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
