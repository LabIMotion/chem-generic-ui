import React, { Component } from 'react';
import ds from './_ds_details_sp.json';
import GenInterfaceSP from '../components/details/GenInterfaceSP';

class SimuSp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genericDS: ds,
    };
    this.handleChange = this.handleChange.bind(this);
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
          <GenInterfaceSP generic={genericDS} fnChange={this.handleChange} />
        </div>
      </div>
    );
  }
}

export default SimuSp;
