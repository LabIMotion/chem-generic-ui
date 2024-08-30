/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
} from 'react-bootstrap';
import LayerSaveModal from '../../elements/LayerSaveModal';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';
import ApiManager from '../../../utils/apiManager';

const InputForm = ({ layer }) => {
  const { description, label, key } = layer;
  return (
    <>
      <div>Current Setting</div>
      <Form>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl type="text" value={key} placeholder="Name" disabled />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Display Name</ControlLabel>
          <FormControl
            disabled
            type="text"
            value={label}
            placeholder="Display Name"
          />
        </FormGroup>
      </Form>
      <div>Please give the below information</div>
      <Form>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl required type="text" value={key} placeholder="Name" />
          <div className="help">
            An identifier for the layer, must be unique in the Standard Layers
            <br />
            Layer name is unique in the template, at least 3 characters
            <br />
            Layer name must contain only lowercase letters and underscores,
            underscores can not be the first/last one character
            <br />
            Layer name should not contain special characters like $, !, %, etc.
          </div>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Display Name</ControlLabel>
          <FormControl
            disabled
            required
            type="text"
            value={label}
            placeholder="Display Name"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={description}
            placeholder="Description"
          />
        </FormGroup>
      </Form>
    </>
  );
};

const a = (
  <Button
    key="delete"
    bsStyle="danger"
    onClick={() => {
      ApiManager.listDSKlass();
    }}
  >
    Delete
  </Button>
);

const b = (layer) => {
  console.log('layer', layer);
  return (
    <Button
      key="success"
      bsStyle="success"
      onClick={() => {
        ApiManager.saveStdLayer(layer);
      }}
    >
      Save
    </Button>
  );
};

const LayerSaveBtn = (props) => {
  const { field, fnUpdateSub, layer, sortedLayers } = props;
  const [show, setShow] = useState(false);

  return (
    <>
      <LTooltip idf="add_std_layer">
        <Button bsSize="sm" onClick={() => setShow(true)}>
          {FIcons.faFloppyDisk}
        </Button>
      </LTooltip>
      <LayerSaveModal
        acts={[a, b(layer)]}
        title="Layer Standards"
        showProps={{ show, setShow }}
        // layer={layer}
      >
        <InputForm layer={layer} />
      </LayerSaveModal>
    </>
  );
};

// LayerSaveBtn.propTypes = {
//   field: PropTypes.object.isRequired,
//   fnUpdateSub: PropTypes.func.isRequired,
//   layer: PropTypes.object.isRequired,
//   sortedLayers: PropTypes.array.isRequired,
// };

export default LayerSaveBtn;
