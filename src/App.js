import "./App.css";

import { BankToken } from "./abis/BankToken.json";
import { IERC20 } from "./abis/IERC20.json";
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
import AlertDismissible from "./components/AlertDismissible";

let kit;
const ERC20_DECIMALS = 18;

const BANK_TOKEN_ADDRESS = "0xdf1AF8D765853C9a29094A4D3204B9a02e0597A0";
const CELO_ADDRESS = "0xe5a769BEe2AD606d2De4cc64fadDB4c17E9874c0";
const MATT_COIN_ADDRESS = "0xbAAF3d3C03f05E048c8082b570C7af89E4B11519";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handler = this.handler.bind(this);
    this.state = {
      account: "0x0",
      celoToken: {},
      mattCoin: {},
      bank: {},
      celoTokenBalance: "0",
      cUSDTokenBalance: "0",
      mattCoinBalance: "0",
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
    await this.getBalance();
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
    this.setState({
      celoTokenBalance: celoBalance,
      cUSDTokenBalance: cUSDBalance,
    });
  }

  async loadBlockchainData() {
    const web3 = new Web3(window.celo);
    let kit = newKitFromWeb3(web3);
    // Check the Celo network ID
    const networkId = await web3.eth.net.getId();
    console.log(networkId);

    // c// console.log(methods);

    const contract = new kit.web3.eth.Contract(MattCoin, MATT_COIN_ADDRESS);

    const methods = await contract.methods;
    console.log(methods);

    let mattCoinBalance = await methods.balanceOf(this.state.account).call();
    mattCoinBalance = new BigNumber(mattCoinBalance)
      .shiftedBy(-ERC20_DECIMALS)
      .toFixed(2);
    this.setState({ mattCoinBalance: mattCoinBalance });
    // Get the contract associated with the current network
    // const deployedNetwork = MattCoin.networks[networkId]

    // Create a new contract instance with the HelloWorld contract info
    // let instance = new kit.web3.eth.Contract(
    //   MattCoin.abi,
    //     deployedNetwork && deployedNetwork.address
    // )

    // getName(instance)
    // setName(instance, "hello world!")

    // // load MattCoin
    // const mattCoinData = MattCoin.networks[networkId];
    // console.log(mattCoinData);
    // if (mattCoinData) {
    //   const mattCoin = new web3.eth.Contract(
    //     MattCoin.abi,
    //     mattCoinData.address
    //   );
    //   this.setState({ mattCoin });
    //   let mattCoinBalance = await mattCoin.methods
    //     .balanceOf(this.state.account)
    //     .call();
    //   console.log({ matt_balance: mattCoinBalance });
    //   this.setState({ mattCoinBalance: mattCoinBalance.toString() });
    // } else {
    //   window.alert("MattCoin Contract not deployed in current network");
    // }

    // // load dappToken
    // const dappTokenData = DappToken.networks[networkId];
    // console.log("dapp", dappTokenData);
    // if (dappTokenData) {
    //   const dappToken = new web3.eth.Contract(
    //     DappToken.abi,
    //     dappTokenData.address
    //   );
    //   this.setState({ dappToken });
    //   let dappTokenBalance = await dappToken.methods
    //     .balanceOf(this.state.account)
    //     .call();
    //   console.log({ dapp_balance: dappTokenBalance });
    //   this.setState({ dappTokenBalance: dappTokenBalance.toString() });
    // } else {
    //   window.alert("DappToken Contract not deployed in current network");
    // }

    // // load tokenFarm
    // const tokenFarmData = TokenFarm.networks[networkId];
    // console.log("token farm", tokenFarmData);
    // if (tokenFarmData) {
    //   const tokenFarm = new web3.eth.Contract(
    //     TokenFarm.abi,
    //     tokenFarmData.address
    //   );
    //   this.setState({ tokenFarm });
    //   let stakingBalance = await tokenFarm.methods
    //     .stakingBalance(this.state.account)
    //     .call();
    //   console.log({ token_farm: stakingBalance });
    //   this.setState({ stakingBalance: stakingBalance.toString() });
    // } else {
    //   window.alert("TokenFarm Contract not deployed in current network");
    // }

    this.setState({ loading: false });
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.daiToken.methods
      .approve(this.state.tokenFarm._address, amount)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.state.tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            this.setState({ loading: false });
          });
      });
  };

  unstakeTokens = (amount) => {
    this.setState({ loading: true });
    this.state.tokenFarm.methods
      .unstakeTokens()
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
                    <td className="text-end" >{this.state.celoTokenBalance}</td>
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
                </tbody>
              </Table>
            </Col>
          </Row>
          <Row>
            <Col>
              {" "}
              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" />
                  <Form.Text className="text-muted">
                    Well never share your email with anyone else.
                  </Form.Text>
                </Form.Group>

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
