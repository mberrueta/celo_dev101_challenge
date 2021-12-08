import "./App.css";

import BankToken from "./abis/BankToken.json";
import IERC20 from "./abis/IERC20.json";
import MattCoin from "./abis/MattCoin.json";
import Navbar from "./components/Navbar";

import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import { ContractFactories } from "@celo/contractkit/lib/web3-contract-cache";

import BigNumber from "bignumber.js";

import {
  Table,
  Form,
  Spinner,
  Container,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import * as React from "react";
import { Formik } from "formik";

import AlertDismissible from "./components/AlertDismissible";

let kit;
const ERC20_DECIMALS = 18;

const BANK_TOKEN_ADDRESS = "0xdf1AF8D765853C9a29094A4D3204B9a02e0597A0";
const CELO_ADDRESS = "0xe5a769BEe2AD606d2De4cc64fadDB4c17E9874c0";
const MATT_COIN_ADDRESS = "0xbAAF3d3C03f05E048c8082b570C7af89E4B11519";

let mattCoinContract;
let celoContract;
let bankContract;
let mattCoinContractMethods;
let celoContractMethods;
let bankContractMethods;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handler = this.handler.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      account: "0x0",
      celoTokenBalance: "0",
      cUSDTokenBalance: "0",
      mattCoinBalance: "0",
      stakingBalance: "0",
      pendingBalance: "0",
      loading: true,
      showAlert: false,
      title: "",
      message: "",
      fixed: false,
      tokensToStake: 0,
      locked: 0
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });
    await this.loadWeb3();
    await this.getBalance();
    this.setState({ loading: false });
  }

  // Connect app to the blockchain
  async loadWeb3() {
    if (window.celo) {
      this.notification(
        "Warning ⚠️",
        "please approve this Dapp with the `CeloExtensionWallet`."
      );
      try {
        await window.celo.enable();
        // const web3 = new Web3("https://alfajores-forno.celo-testnet.org")
        const web3 = new Web3(window.celo);
        kit = newKitFromWeb3(web3);
        mattCoinContract = new kit.web3.eth.Contract(
          MattCoin,
          MATT_COIN_ADDRESS
        );
        celoContract = new kit.web3.eth.Contract(IERC20, CELO_ADDRESS);
        bankContract = new kit.web3.eth.Contract(BankToken, BANK_TOKEN_ADDRESS);
        mattCoinContractMethods = await mattCoinContract.methods;
        bankContractMethods = await bankContract.methods;

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

  async getBalance() {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    const celoBalance = totalBalance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2);

    let mattCoinBalance = await mattCoinContractMethods
      .balanceOf(this.state.account)
      .call({ from: this.state.account });
    mattCoinBalance = new BigNumber(mattCoinBalance)
      .shiftedBy(-ERC20_DECIMALS)
      .toFixed(2);

    let pendingBalance = await bankContractMethods
      .pendingReward()
      .call({ from: this.state.account });
    pendingBalance = new BigNumber(pendingBalance)
      .shiftedBy(-ERC20_DECIMALS)
      .toFixed(2);

    // TODO: Add method to contract
    //  let stakingBalance = await bankContractMethods.pendingReward().call({ from: this.state.account });
    //   stakingBalance = new BigNumber(stakingBalance)
    //     .shiftedBy(-ERC20_DECIMALS)
    //     .toFixed(2);
    let stakingBalance = 0;

    //TODO: fix current wrong number
    // pendingBalance = 0

    this.setState({
      celoTokenBalance: celoBalance,
      cUSDTokenBalance: cUSDBalance,
      mattCoinBalance: mattCoinBalance,
      pendingBalance: pendingBalance,
      stakingBalance: stakingBalance,
    });
  }

  stakeTokens = (amount, flexible, minutes) => {
    this.setState({ loading: true });

    mattCoinContractMethods
      .approve(BANK_TOKEN_ADDRESS, amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        bankContractMethods
          .stakeTokens(amount, flexible, minutes)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  unstakeTokens = () => {
    this.setState({ loading: true });

    bankContractMethods
      .unStakeTokens()
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  notification = (title, msg) => {
    this.setState({ showAlert: true, title: title, message: msg });
  };

  handler() {
    this.setState({ showAlert: false });
  }

  handleSubmit(evt) {
    // this.setState({});
    console.log(this.state.tokensToStake, this.state.fixed, this.state.locked)
  }

  render() {
    let content;
    if (this.state.loading) {
      content = (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      );
    } else {
      content = (
        <Container fluid>
          <Row>
            <Col>
              <Table striped bordered hover variant="dark">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th className="text-end">Coins</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Celo Balance</td>
                    <td className="text-end">{this.state.celoTokenBalance}</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>cUSD Balance</td>
                    <td className="text-end">{this.state.cUSDTokenBalance}</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>mattCoin Balance</td>
                    <td className="text-end">{this.state.mattCoinBalance}</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>Current Staking</td>
                    <td className="text-end">{this.state.stakingBalance}</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>Pending Rewards</td>
                    <td className="text-end">{this.state.pendingBalance}</td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
          <Row>
            <Col>
              {" "}
              <Form onSubmit={this.handleSubmit}>
                <Form.Group className="mb-3" as={Col} md="4" controlId="tokens">
                  <Form.Label>Tokens To stake</Form.Label>

                  <Form.Control
                    type="number"
                    name="tokens"
                    className="mb-3"
                    value={this.state.tokensToStake}
                    onChange={e => this.setState({ tokensToStake: e.target.value })}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="Fixed">
                  <Form.Label>
                    Flexible or Fixed days. With flexible you can unstake at any
                    time
                  </Form.Label>
                  <Form.Check
                    type="switch"
                    id="custom-switch"
                    label="Fixed"
                    checked={this.state.fixed}
                    onChange={e => this.setState({ fixed: e.target.checked })}
                  />
                </Form.Group>

                <fieldset>
                  <Form.Group
                    as={Row}
                    className="mb-3"
                    style={
                      this.state.fixed ? {} : { display: "none" }
                    }
                  >
                    <Form.Label as="legend" column sm={2}>
                      Radios
                    </Form.Label>
                    <Col sm={10}>
                      <Form.Check
                        type="radio"
                        label="5m (x2 coins per min)"
                        name="formHorizontalRadios"
                        id="formHorizontalRadios1"
                        onChange={e => this.setState({ locked: e.target.checked ? 5 : 0 })}
                      />
                      <Form.Check
                        type="radio"
                        label="60m (x3 coins per min)"
                        name="formHorizontalRadios"
                        id="formHorizontalRadios2"
                        onChange={e => this.setState({ locked: e.target.checked ? 60 : 0 })}
                      />
                      <Form.Check
                        type="radio"
                        label="120m (x4 coins per min)"
                        name="formHorizontalRadios"
                        id="formHorizontalRadios3"
                        onChange={e => this.setState({ locked: e.target.checked ? 120 : 0 })}
                      />
                    </Col>
                  </Form.Group>
                </fieldset>

                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      );
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
          <Row>
            <Col>
              <AlertDismissible
                show={this.state.showAlert}
                title={this.state.title}
                message={this.state.message}
                handler={this.handler}
              />
            </Col>
          </Row>
          <Row>{content}</Row>
        </Container>
      </div>
    );
  }
}

export default App;
