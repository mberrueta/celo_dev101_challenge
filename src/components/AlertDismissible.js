import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import React, { Component, useState } from "react";
import PropTypes from "prop-types";

class AlertDismissible extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleDismiss = this.handleDismiss.bind(this);

    this.state = {
      show: this.props.show,
      title: this.props.title,
      message: this.props.message,
    };
  }

  handleDismiss() {
    this.setState({ show: false });
    this.props.handler();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.show !== prevState.show) {
      return {
        show: nextProps.show,
        title: nextProps.title,
        message: nextProps.message,
      }; // <- this is setState equivalent
    }
    return null;
  }

  render() {
    if (this.state.show) {
      return (
        <Alert>
          <h4>{this.state.title}</h4>
          <p>{this.state.message}</p>
          <p>
            <Button onClick={this.handleDismiss}>Ok</Button>
          </p>
        </Alert>
      );
    }

    return <div> </div>;
  }
}

AlertDismissible.propTypes = {
  show: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  handler: PropTypes.func,
};

export default AlertDismissible;
