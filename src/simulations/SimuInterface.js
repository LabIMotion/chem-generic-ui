import React, { Component } from 'react';
// use for dnd function, cannot exist with others at the same time
// import { DragDropContext } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import GenInterface from '../components/details/GenInterface';
import sg from './_sg_details.json';

class SimuInterface extends Component {
  constructor(props) {
    super(props);
    this.state = { generic: sg };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(newObj) {
    this.setState({ generic: newObj });
  }

  render() {
    const { generic } = this.state;
    // console.log('SimuInterface.render', generic);
    const layersLayout = (
      <GenInterface
        generic={generic}
        fnChange={this.handleChange}
        extLayers={[]}
        genId={0}
        isPreview={false}
        isActiveWF
      />
    );
    return (
      <div>
        <h2>Interface (SegmentDetails)</h2>
        <div>{layersLayout}</div>
      </div>
    );
  }
}

// export default DragDropContext(HTML5Backend)(SimuInterface);
export default SimuInterface;
