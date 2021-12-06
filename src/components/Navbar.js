import logo from "../logo.svg";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Container, Row, Col } from "react-bootstrap";

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark ">
        <Container fluid>
          <Row>
            <Col xs={8} className="d-flex align-items-start">
              <a className="navbar-brand " href="#">
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
            <Col xs={4} className=" align-items-end  text-end fs-5">
              {this.props.account}
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
