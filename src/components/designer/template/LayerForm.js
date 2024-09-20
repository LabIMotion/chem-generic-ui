import React from 'react';
import PropTypes from 'prop-types';
import { ControlLabel, Form, FormControl, FormGroup } from 'react-bootstrap';

const LayerForm = ({ init, layer, onChange }) => {
  const { label: initLabel, key: initKey } = init;
  const { description, label, key } = layer;
  return (
    <>
      <div
        className="alert-info"
        style={{ borderRadius: '5px', padding: '0px 10px 0px 0px' }}
      >
        <b>Current Setting</b>
      </div>
      <Form>
        <FormGroup className="text_generic_properties">
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            value={initKey}
            placeholder="An identifier for the layer, must be unique in Standard Layers."
            readOnly
          />
        </FormGroup>
        <FormGroup className="text_generic_properties">
          <ControlLabel>Display Name</ControlLabel>
          <FormControl
            type="text"
            value={initLabel}
            placeholder="Give a name to display on the UI. Empty is allow."
            readOnly
          />
        </FormGroup>
      </Form>
      <div
        className="alert-info"
        style={{ borderRadius: '5px', padding: '0px 10px 0px 0px' }}
      >
        <b>Please give the below information</b>
      </div>
      <Form>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            required
            type="text"
            value={key}
            placeholder="An identifier for the layer, must be unique in Standard Layers."
            onChange={(e) => onChange('key', e.target.value)}
          />
          <div className="help">
            An identifier for the layer, must be unique in{' '}
            <b>Standard Layers</b>
            <br />
            Layer name is unique in <b>Standard Layers</b>, at least 3
            characters
            <br />
            Layer name must contain only lowercase letters and underscores,
            underscores can not be the first/last one character
            <br />
            Layer name should not contain special characters like $, !, %, etc.
          </div>
        </FormGroup>
        <FormGroup className="text_generic_properties">
          <ControlLabel>Display Name</ControlLabel>
          <FormControl
            type="text"
            value={label}
            placeholder="Give a name to display on the UI. Empty is allow."
            readOnly
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={description}
            placeholder="Give a description to describe the usage/purpose."
            onChange={(e) => onChange('description', e.target.value)}
          />
        </FormGroup>
      </Form>
    </>
  );
};

LayerForm.propTypes = {
  init: PropTypes.shape({
    label: PropTypes.string,
    key: PropTypes.string,
  }).isRequired,
  layer: PropTypes.shape({
    description: PropTypes.string,
    label: PropTypes.string,
    key: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LayerForm;
