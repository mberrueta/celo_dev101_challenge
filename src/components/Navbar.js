import logo from "../logo.svg";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <Container fluid>
          <Row>
            <Col>
              <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
                <img
                  src={logo}
                  width="30"
                  height="30"
                  className="d-inline-block align-top"
                  alt=""
                />
                &nbsp; Matt Bank. Farming coins
              </a>
            </Col>
            <Col>
              <ul className="navbar-nav px-3">
                <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                  <small className="text-secondary">
                    <small id="account">{this.props.account}</small>
                  </small>
                </li>
              </ul>
            </Col>
          </Row>
        </Container>
      </nav>
    );
  }
}
Navbar.propTypes = {
  account: PropTypes.string,
};

export default Navbar;
