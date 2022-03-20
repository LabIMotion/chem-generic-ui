import React, { Component } from 'react';
import GenericDSDetails from '../components/details/GenDSDetails';

class SimuDS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genericDS: {}, klass: {}
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    fetch('ds_details.json', { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
      .then(response => response.json()).then((json) => {
        fetch('ds_klass.json', { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
          .then(response => response.json()).then((kjson) => {
            this.setState({ genericDS: json, klass: kjson });
          })
          .catch((errorMessage) => {
            console.log(errorMessage);
          });
      })
      .catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  handleChange(newObj) {
    this.setState({ genericDS: newObj });
  }

  render() {
    const { genericDS, klass } = this.state;
    return (
      <div>
        <h2>GenericDSDetails</h2>
        <div>
          <GenericDSDetails
            uiCtrl
            genericDS={genericDS}
            klass={klass}
            kind="1H NMR"
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
}

export default SimuDS;
