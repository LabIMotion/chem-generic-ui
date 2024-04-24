/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, Modal, OverlayTrigger } from 'react-bootstrap';
import { sortBy } from 'lodash';
import FIcons from '../icons/FIcons';

const block = (layer, fnAdd) => (
  <div className="generic_layer_column">
    <div>
      <div>
        <b>{layer.label}</b>
        <br />
        (
        {layer.key}
        )
      </div>
      <OverlayTrigger delayShow={1000} placement="top" overlay={<Tooltip id="_tooltip_layers">click to add layer</Tooltip>}>
        <Button bsStyle="primary" onClick={event => fnAdd(event, layer)}>
          {FIcons.faPlus}
        </Button>
      </OverlayTrigger>
    </div>
  </div>
);

const drawLayout = (layers, fnAdd) => {
  const layout = [];
  layers.forEach((layer) => { layout.push(<div key={layer.key}>{block(layer, fnAdd)}</div>); });
  return layout;
};

const LayerModal = (props) => {
  const {
    show, layers, fnClose, fnAdd
  } = props;
  if (!show) return null;
  const sortedLayers = sortBy(layers, ['position', 'wf_position']) || [];
  if (sortedLayers.length < 1) return null;
  const layout = drawLayout(sortedLayers, fnAdd);
  return (
    <Modal show={show} onHide={fnClose}>
      <Modal.Header closeButton><Modal.Title>Choose Layer</Modal.Title></Modal.Header>
      <Modal.Body>
        <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <div className="generic_grid">{layout}</div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

LayerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  layers: PropTypes.object.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnAdd: PropTypes.func.isRequired
};

export default LayerModal;
