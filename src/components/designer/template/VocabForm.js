import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Row } from 'react-bootstrap';
import { UnsVocBase } from '@components/elements/BaseFields';
import FIcons from '@components/icons/FIcons';
import TermLink from '@components/fields/TermLink';

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
          <Form.Group className="props_text">
            <Form.Label>Field Name</Form.Label>
            <Form.Control type="text" value={initField} readOnly disabled />
          </Form.Group>
          <Form.Group className="props_text">
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type="text"
              value={initLabel}
              placeholder="Give a name to display on the UI. Empty is allow."
              readOnly
              disabled
            />
          </Form.Group>
          <Form.Group className="p-3 mt-3">
            <Form.Label>Who can use this vocabulary?</Form.Label>
            <Form.Check type="radio">
              <Form.Check.Input type="radio" checked readOnly />
              <Form.Check.Label>
                <span className="gu-mr-1">{FIcons.faGlobe}</span>
                <b>LabIMotion Generic Module</b>
                <div>
                  This vocabulary can be used by any designer within templates.
                  Designers can reuse fields, with references automatically
                  inheriting values from the original fields.
                </div>
              </Form.Check.Label>
            </Form.Check>
          </Form.Group>
        </Form>
      </Col>
      <Col md={6}>
        <h4 className="gu-ontology-text-link">{term}</h4>
        <Form>
          <Form.Group className="props_text">
            <Form.Label>Term ID</Form.Label>
            <Form.Control type="text" value={shortForm} readOnly disabled />
          </Form.Group>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={description.join('\n')}
              readOnly
              disabled
              rows={6}
              style={{ resize: 'none' }}
            />
          </Form.Group>
          <div className="pt-3 mt-3">
            <span className="me-2">{FIcons.faCircleInfo}</span>
            <span>
              <b>Please note:</b>
              <p className="mb-0">
                1. When no terminology is linked, this field cannot be saved as
                a LabIMotion Vocabulary (Lab-Vocab) for future use in the
                template.
              </p>
              <p className="mb-0">
                2. The following field types are not supported:
              </p>
              <ul>
                {UnsVocBase.map((field) => (
                  <li key={field.value}>{field.label}</li>
                ))}
              </ul>
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
