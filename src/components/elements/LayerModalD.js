/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Modal, Panel } from 'react-bootstrap';
import Draggable from 'react-draggable';

const block = () => {
  return (
    <div className="generic_layer_column">
      <div>
        <div><b>general information</b><br />(general)</div>
        <Button bsStyle="primary" onClick={() => {}}><i className="fa fa-plus" aria-hidden="true" /></Button>
      </div>
    </div>
  );
};

export default class LayerModalD extends React.Component {
  render() {
    const { show, layers } = this.props;
    if (!show) return null;
    return (
      <Draggable handle=".layer_header" bounds="body">
        <div style={{ zIndex: 10, position: 'absolute', top: '20%', left: '16%' }}>
            <Panel bsStyle="info" className="generic_layer_modal">
              <Panel.Heading className="layer_header">Choose Layer</Panel.Heading>
              <Panel.Body>
                <div style={{ width: '33vw' }}>
                  <div className="generic_grid">
                    <div>
                      <div className="generic_layer_column">
                        <div>
                          <div><b>general information</b><br />(general)</div>
                          <Button bsStyle="primary" onClick={() => {}}><i className="fa fa-plus" aria-hidden="true" /></Button>
                        </div>
                      </div>
                      <div className="generic_layer_column" style={{}}>
                        <b>Sample description</b><br />(sample_description)
                      </div>
                    </div>
                  </div>
                </div>
            </Panel.Body>
            </Panel>
        </div>
			</Draggable>
    );
  }
}

LayerModalD.propTypes = {
  show: PropTypes.bool.isRequired,
};

// LayerModal.defaultProps = { showModal: false };
