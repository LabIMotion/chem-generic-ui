import React from 'react';
import PropTypes from 'prop-types';
import {
  Radio,
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Row,
} from 'react-bootstrap';
import FIcons from '../../icons/FIcons';

const LayerForm = ({ init, layer, onChange }) => {
  const { label: initLabel, key: initKey } = init;
  const { description, label, key } = layer;
  return (
    <Row>
      <Col md={6}>
        <h4>Current Setting</h4>
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
          <div style={{ fontSize: '12px', display: 'flex' }}>
            <span className="gu-mr-1">{FIcons.faCircleInfo}</span>
            <span>
              <b>Name:</b>
              <p className="gu-mb-1">
                1. The layer name is a unique identifier within{' '}
                <b>Standard Layers</b> and must contain at least 3 characters.
              </p>
              <p className="gu-mb-1">
                2. It should consist only of lowercase letters and underscores,
                with underscores not allowed at the beginning or end.
              </p>
              <p className="gu-mb-1">
                3. Special characters such as $, !, %, etc., are not allowed.
              </p>
            </span>
          </div>
        </Form>
      </Col>
      <Col md={6}>
        <h4>Please give the below information</h4>
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
              rows={3}
              value={description}
              placeholder="Give a description to describe the usage/purpose."
              onChange={(e) => onChange('description', e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Who can use this layer?</ControlLabel>
            <Radio checked readOnly>
              <span className="gu-mr-1">{FIcons.faGlobe}</span>
              <b>Standard</b>
              <div>This can be used by any designer later in the template.</div>
            </Radio>
          </FormGroup>
        </Form>
      </Col>
    </Row>
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
