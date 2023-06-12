import React, { Component } from 'react';
import GenericDSDetails from '../components/details/GenDSDetails';
import ds from './_ds_details.json';
import dsKlass from './_ds_klass.json';

class SimuDS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genericDS: ds,
      klass: dsKlass,
    };
    this.handleChange = this.handleChange.bind(this);
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
