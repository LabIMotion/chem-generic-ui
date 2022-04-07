import React, { Component } from 'react';
import GenInterfaceSP from '../components/details/GenInterfaceSP';

class SimuSp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genericDS: {}
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    fetch('ds_details_sp.json', { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
      .then(response => response.json()).then((json) => {
        this.setState({ genericDS: json });
      })
      .catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  handleChange(newObj) {
    this.setState({ genericDS: newObj });
  }

  render() {
    const { genericDS } = this.state;
    return (
      <div>
        <h2>Customized for spec</h2>
        <div>
          <GenInterfaceSP
            generic={genericDS}
            fnChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
}

export default SimuSp;
