import React, { Component } from 'react';
// import { DragDropContext } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import sg from './_sg_details.json';
import sgKlass from './_sg_klass.json';
import SegmentDetails from '../components/details/GenSgDetails';

class SimuSG extends Component {
  constructor(props) {
    super(props);
    this.state = {
      segment: sg,
      klass: sgKlass,
    };
    this.handleChange = this.handleChange.bind(this);
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
