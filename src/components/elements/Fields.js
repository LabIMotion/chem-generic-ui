/* eslint-disable react/forbid-prop-types */
import React from 'react';
import {
  Checkbox,
  Col,
  ControlLabel,
  FormControl,
  FormGroup,
} from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import OntologySelect from './OntologySelect';
import { ButtonOntologySelect } from '../fields/ModalOntologySelect';

export const renderDatetimeRange = ({ fieldObject }) =>
  [FieldTypes.F_DATETIME_RANGE].includes(fieldObject.type) ? (
    <FormGroup className="gu-form-group">
      <Col sm={3}>
        <span className="gu-form-group-label">&nbsp;</span>
      </Col>
      <Col sm={9}>
        <div style={{ fontSize: '10px' }}>
          <b>Datetime Range: </b>
          This type is utilized to record the <b>Start</b> time and <b>Stop</b>{' '}
          time. The <b>Duration</b> is calculated automatically.
          <br />
          Please note that for layout reasons, it will be in a separate row and
          divided into 4 columns.
        </div>
      </Col>
    </FormGroup>
  ) : null;

export const renderDummyFieldGroup = ({ layer, fieldObject }) =>
  [FieldTypes.F_DUMMY].includes(fieldObject.type) ? (
    <FormGroup className="gu-form-group">
      <Col componentClass={ControlLabel} sm={3}>
        <span className="gu-form-group-label">{`(${fieldObject.type})`}</span>
      </Col>
      <Col sm={9}>
        <FormControl
          type="text"
          name={`f_${fieldObject.field}`}
          defaultValue={`${fieldObject.type},  an invisible entry (${fieldObject.field})`}
          disabled
        />
      </Col>
    </FormGroup>
  ) : null;

export const renderNameField = ({
  layer,
  fieldObject,
  label,
  field,
  fnChange,
  fnOntChange,
}) => (
  <FormGroup className="gu-form-group">
    <Col sm={3}>
      <span className="gu-form-group-label">{label}</span>
    </Col>
    <Col sm={9} style={{ display: 'inline-flex' }}>
      <FormControl
        type="text"
        name={`f_${field}`}
        defaultValue={fieldObject[field]}
        disabled={field === 'field'}
        onChange={event =>
          fnChange(
            event,
            fieldObject[field],
            fieldObject.field,
            layer.key,
            field,
            'text'
          )
        }
      />
      <ButtonOntologySelect
        modalComponent={<OntologySelect fnSelected={fnOntChange} defaultValue={fieldObject?.ontology} />}
        customClass={fieldObject?.ontology ? 'gu-ontology-selected' : null}
      />
    </Col>
  </FormGroup>
);

export const renderTextFieldGroup = ({
  layer,
  fieldObject,
  label,
  field,
  fnChange,
}) =>
  [FieldTypes.F_DUMMY].includes(fieldObject.type) ? null : (
    <FormGroup className="gu-form-group">
      <Col sm={3}>
        <span className="gu-form-group-label">{label}</span>
      </Col>
      <Col sm={9}>
        <FormControl
          type="text"
          name={`f_${field}`}
          defaultValue={fieldObject[field]}
          disabled={field === 'field'}
          onChange={event =>
            fnChange(
              event,
              fieldObject[field],
              fieldObject.field,
              layer.key,
              field,
              'text'
            )
          }
        />
      </Col>
    </FormGroup>
  );

export const renderCheck = ({
  layer,
  fieldObject,
  fnChange,
  label,
  field,
  note,
}) => (
  <FormGroup className="gu-form-group">
    <Col sm={3}>
      <span className="gu-form-group-label">{label}</span>
    </Col>
    <Col sm={9}>
      <Checkbox
        name={`frmChk_${layer.key}_f_${field}`}
        checked={!!fieldObject[field]}
        onChange={event =>
          fnChange(
            event,
            fieldObject[field] || false,
            fieldObject.field,
            layer.key,
            field,
            'checkbox'
          )
        }
      >
        {note}
      </Checkbox>
    </Col>
  </FormGroup>
);

export const renderOwnRow = ({ layer, fieldObject, fnChange }) =>
  [
    FieldTypes.F_DUMMY,
    FieldTypes.F_TABLE,
    FieldTypes.F_DATETIME_RANGE,
  ].includes(fieldObject.type)
    ? null
    : renderCheck({
        layer,
        fieldObject,
        fnChange,
        label: 'Has its own line',
        field: 'hasOwnRow',
      });

export const renderRequired = ({ layer, fieldObject, fnChange }) =>
  [FieldTypes.F_INTEGER, FieldTypes.F_TEXT].includes(fieldObject.type)
    ? renderCheck({
        layer,
        fieldObject,
        fnChange,
        label: 'Required',
        field: 'required',
      })
    : null;

export const renderReadonly = ({ layer, fieldObject, fnChange }) =>
  [FieldTypes.F_TEXT].includes(fieldObject.type)
    ? renderCheck({
        layer,
        fieldObject,
        fnChange,
        label: 'Readonly',
        field: 'readonly',
        note: "When in 'Read-Only' mode, it displays as plain text with a placeholder if available.",
      })
    : null;
