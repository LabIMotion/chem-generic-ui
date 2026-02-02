import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Row } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import LFormGroup from '@components/shared/LFormGroup';

const LayerForm = ({ init, layer, onChange }) => {
  const { label: initLabel, key: initKey } = init;
  const { description, label, key } = layer;
  return (
    <Row>
      <Col xs={6}>
        <h4>Current Setting</h4>
        <Form>
          <LFormGroup>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={initKey}
              placeholder="An identifier for the layer, must be unique in Standard Layers."
              disabled
              readOnly
            />
          </LFormGroup>
          <LFormGroup>
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type="text"
              value={initLabel}
              placeholder="Give a name to display on the UI. Empty is allow."
              disabled
              readOnly
            />
          </LFormGroup>
          <div style={{ fontSize: '12px', display: 'flex' }}>
            <span className="mr-1">{FIcons.faCircleInfo}</span>
            <span>
              <b>About &quot;Name&quot;</b>
              <p className="mb-1">
                1. The layer name is a unique identifier within{' '}
                <b>Standard Layers</b> and must be at least 3 characters long.
              </p>
              <p className="mb-1">
                2. It should consist only of lowercase letters and underscores,
                but underscores cannot be placed at the beginning or end.
              </p>
              <p className="mb-1">
                3. Special characters such as $, !, %, and others are not
                allowed.
              </p>
            </span>
          </div>
        </Form>
      </Col>
      <Col xs={6}>
        <h4>Please give the below information</h4>
        <Form>
          <LFormGroup>
            <Form.Label>Name</Form.Label>
            <Form.Control
              required
              type="text"
              value={key}
              placeholder="An identifier for the layer, must be unique in Standard Layers."
              onChange={(e) => onChange('key', e.target.value)}
            />
          </LFormGroup>
          <LFormGroup>
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type="text"
              value={label}
              placeholder="Give a name to display on the UI. Empty is allow."
              disabled
              readOnly
            />
          </LFormGroup>
          <LFormGroup>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              placeholder="Give a description to describe the usage/purpose."
              onChange={(e) => onChange('description', e.target.value)}
            />
          </LFormGroup>
          <LFormGroup>
            <Form.Label>Who can use this layer?</Form.Label>
            <Form.Check type="radio">
              <Form.Check.Input type="radio" checked readOnly />
              <Form.Check.Label>
                <span className="gu-mr-1">{FIcons.faGlobe}</span>
                <b>Standard</b>
                <div>
                  This can be used by any designer later in the template.
                </div>
              </Form.Check.Label>
            </Form.Check>
          </LFormGroup>
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
