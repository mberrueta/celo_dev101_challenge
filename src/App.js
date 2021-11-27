import "./App.css";

import { BankToken } from "./abis/BankToken.json";
import { IERC20 } from "./abis/IERC20.json";
import { MattCoin } from "./abis/MattCoin.json";
import Navbar from "./components/Navbar";

import { newKitFromWeb3 } from "@celo/contractkit";
import { Web3 } from "web3";
import { BigNumber } from "bignumber.js";
import { ContractFactories } from "@celo/contractkit/lib/web3-contract-cache";
import { Button, Container, Row, Col } from "react-bootstrap";
import * as React from "react";
import AlertDismissible from "./components/AlertDismissible";

class App extends React.Component {
  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  // Connect app to the blockchain
  async loadWeb3() {
    if (window.celo) {
      this.notification("⚠️ please approve this Dapp to use");
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        kit.defaultAccount = accounts[0];
      } catch (error) {
        console.error(error);
        this.notification("☠ ", error);
      }
    } else {
      this.notification("☠ Install the Cello Wallet ⚠️");
    }
  }

  async loadBlockchainData() {
    this.setState({ loading: false });
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
      showAlert: false,
    };
  }

  notification = (msg) => {
    this.setState({ showAlert: true });
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
              <AlertDismissible show={this.state.showAlert} />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
