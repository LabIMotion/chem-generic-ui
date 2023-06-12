import React, { Component } from 'react';
// use for dnd function, cannot exist with others at the same time
// import { DragDropContext } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
import GenInterface from '../components/details/GenInterface';

class SimuSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { generic: {} };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    fetch('search_pro.json', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        this.setState({ generic: json });
      })
      .catch(errorMessage => {
        console.log(errorMessage);
      });
  }

  handleChange(newObj) {
    this.setState({ generic: newObj });
  }

  render() {
    const { generic } = this.state;
    const layersLayout = (
      <GenInterface
        generic={generic}
        fnChange={this.handleChange}
        extLayers={[]}
        genId={0}
        isPreview={false}
        isSearch
        isActiveWF
      />
    );
    return (
      <div>
        <h2>Interface - SegmentDetails</h2>
        <div>{layersLayout}</div>
      </div>
    );
  }
}

// export default DragDropContext(HTML5Backend)(SimuInterface);
export default SimuSearch;
