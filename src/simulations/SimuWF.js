import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import el from './_el_sem_v.json';
import FlowViewerModal from '../components/flow/FlowViewerModal';

class SimuWF extends Component {
  constructor(props) {
    super(props);
    this.state = { show: false, data: el };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(show) {
    this.setState({ show });
  }

  render() {
    const { show, data } = this.state;
    return (
      <div>
        <h2>Flow Viewer</h2>
        <div>
          <Button onClick={() => this.handleChange(true)}>click</Button>
          <FlowViewerModal
            show={show}
            data={data}
            fnHide={() => this.handleChange(false)}
          />
        </div>
      </div>
    );
  }
}

export default SimuWF;
