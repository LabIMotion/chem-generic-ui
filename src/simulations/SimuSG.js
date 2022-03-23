import React, { Component } from 'react';
// import { DragDropContext } from 'react-dnd';
// import HTML5Backend from 'react-dnd-html5-backend';
import SegmentDetails from '../components/details/GenSgDetails';

class SimuSG extends Component {
  constructor(props) {
    super(props);
    this.state = {
      segment: {}, klass: {}
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    fetch('sg_details.json', { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
      .then(response => response.json()).then(json => {
        console.log(json);
        fetch('sg_klass.json', { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } })
          .then(response => response.json()).then(kjson => {
            this.setState({ segment: json, klass: kjson });
          })
          .catch(errorMessage => {
            console.log(errorMessage);
          });
      })
      .catch(errorMessage => {
        console.log(errorMessage);
      });
  }

  handleChange(newObj) {
    this.setState({ segment: newObj });
  }

  render() {
    const { segment, klass } = this.state;
    return (
      <div>
        <h2>SegmentDetails</h2>
        <div>
          <SegmentDetails
            uiCtrl
            segment={segment}
            klass={klass}
            onChange={this.handleChange}
          />
        </div>
      </div>
    );
  }
}

// export default DragDropContext(HTML5Backend)(SimuSG);
export default SimuSG;
