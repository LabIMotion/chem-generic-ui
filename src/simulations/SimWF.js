import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import FlowViewerModal from '../components/flow/FlowViewerModal';

class SimuWF extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      data: { properties_release: {}, properties: {}, shortLabel: 'short label' }
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    fetch('sg_details.json', { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
      .then(response => response.json()).then((json) => {
        console.log(json);
        this.setState({
          data: { properties_release: json.properties_release, properties: json.properties }
        });
      })
      .catch((errorMessage) => {
        console.log(errorMessage);
      });
  }

  handleChange(show) {
    this.setState({ show });
  }

  render() {
    const { show, data } = this.state;
    return (
      <div>
        <h2>Flow view</h2>
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
