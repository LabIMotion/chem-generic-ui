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
import TermLink from '../../fields/TermLink';

const VocabForm = ({ init }) => {
  const { label: initLabel, field: initField, ontology: initOntology } = init;
  const {
    description = [''],
    short_form: shortForm = '',
    label: ontologyLabel = '',
  } = initOntology || {};
  const term =
    TermLink(initOntology, ontologyLabel) || '(No terminology linked yet)';

  return (
    <Row>
      <Col md={6}>
        <h4>
          <b>{initLabel}</b>
        </h4>
        <Form>
          <FormGroup className="text_generic_properties">
            <ControlLabel>Field Name</ControlLabel>
            <FormControl type="text" value={initField} readOnly />
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
          <FormGroup
            style={{
              border: '1px solid #ddd',
              padding: '10px',
              borderRadius: '5px',
            }}
          >
            <ControlLabel>Who can use this vocabulary?</ControlLabel>
            <Radio checked readOnly>
              <span className="gu-mr-1">{FIcons.faGlobe}</span>
              <b>Standard</b>
              <div>This can be used by any designer later in the template.</div>
            </Radio>
          </FormGroup>
        </Form>
      </Col>
      <Col md={6}>
        <h4 className="gu-ontology-text-link">{term}</h4>
        <Form>
          <FormGroup className="text_generic_properties">
            <ControlLabel>Term ID</ControlLabel>
            <FormControl type="text" value={shortForm} readOnly />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Description</ControlLabel>
            <FormControl
              componentClass="textarea"
              value={description.join('\n')}
              readOnly
              rows={6}
              style={{ resize: 'none' }}
            />
          </FormGroup>
          <div
            style={{
              fontSize: '12px',
              display: 'flex',
            }}
          >
            <span className="gu-mr-2">{FIcons.faCircleInfo}</span>
            <span>
              <b>Please note:</b>
              <p>
                When no terminology is linked, this field cannot be saved as a
                vocabulary for future use in the template.
              </p>
            </span>
          </div>
        </Form>
      </Col>
    </Row>
  );
};

VocabForm.propTypes = {
  init: PropTypes.shape({
    label: PropTypes.string,
    field: PropTypes.string,
    ontology: PropTypes.shape({
      description: PropTypes.arrayOf(PropTypes.string),
      short_form: PropTypes.string,
      label: PropTypes.string,
    }),
  }).isRequired,
};

export default VocabForm;
