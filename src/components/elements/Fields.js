/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Col, Form } from 'react-bootstrap';
import Select from 'react-select';
import { FieldTypes } from 'generic-ui-core';
import OntologySelect from './OntologySelect';
import { ButtonOntologySelect } from '../fields/ModalOntologySelect';
import { getFieldProps, frmSelSty } from '../tools/utils';
import LLabel from '../shared/LLabel';

const ColWidthOpts = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
];

export const renderBlank = () => (
  <Form.Group as={Col}>
    <LLabel>&nbsp;</LLabel>
  </Form.Group>
);

export const renderDatetimeRange = ({ fieldObject }) =>
  [FieldTypes.F_DATETIME_RANGE].includes(fieldObject.type) ? (
    <Form.Group className="gu-form-group">
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
    </Form.Group>
  ) : null;

export const renderDummyFieldGroup = ({ fieldObject }) =>
  [FieldTypes.F_DUMMY].includes(fieldObject.type) ? (
    <Form.Group as={Col}>
      <LLabel>
        <>({fieldObject.type})</>
      </LLabel>
      <Form.Control
        type="text"
        name={`f_${fieldObject.field}`}
        defaultValue={`${fieldObject.type},  an invisible entry (${fieldObject.field})`}
        disabled
      />
    </Form.Group>
  ) : null;

export const renderNameField = ({
  layer,
  fieldObject,
  field,
  fnChange,
  fnOntChange,
}) => (
  <Form.Group as={Col}>
    <LLabel>
      <>
        {getFieldProps(field).label}&nbsp;
        {getFieldProps(field).fieldTooltip}
      </>
    </LLabel>
    <div className="d-flex align-items-center">
      <Form.Control
        type="text"
        name={`f_${field}`}
        defaultValue={fieldObject[field]}
        disabled={field === 'field'}
        onChange={(event) =>
          fnChange(
            event,
            fieldObject[field],
            fieldObject.field,
            layer.key,
            field,
            'text'
          )
        }
        className="me-0"
      />
      <ButtonOntologySelect
        modalComponent={
          <OntologySelect
            fnSelected={fnOntChange}
            defaultValue={fieldObject?.ontology}
          />
        }
        customClass={fieldObject?.ontology ? 'gu-ontology-selected' : null}
      />
    </div>
  </Form.Group>
);

export const renderTextFieldGroup = ({
  layer,
  fieldObject,
  field,
  fnChange,
  xs,
}) =>
  [FieldTypes.F_DUMMY].includes(fieldObject.type) ? null : (
    <Form.Group as={Col} xs={xs}>
      <LLabel>
        <>
          {getFieldProps(field).label}&nbsp;
          {getFieldProps(field).fieldTooltip}
        </>
      </LLabel>
      <Form.Control
        type="text"
        name={`f_${field}`}
        defaultValue={fieldObject[field]}
        disabled={field === 'field'}
        onChange={(event) =>
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
    </Form.Group>
  );

export const renderCheck = ({
  layer,
  fieldObject,
  fnChange,
  field,
  note,
  disabled = false,
  isLabel = false,
  xs,
}) => {
  const label = (
    <>
      {getFieldProps(field).label}&nbsp;
      {getFieldProps(field).fieldTooltip}
    </>
  );
  return (
    <Form.Group as={Col} xs={xs}>
      {isLabel ? <LLabel>{label}</LLabel> : <LLabel>&nbsp;</LLabel>}
      <Form.Check type="checkbox" id={`frmChk_${layer.key}_f_${field}`}>
        <Form.Check.Input
          className="mt-2"
          type="checkbox"
          checked={!!fieldObject[field]}
          disabled={disabled}
          onChange={(event) =>
            fnChange(
              event,
              fieldObject[field] || false,
              fieldObject.field,
              layer.key,
              field,
              'checkbox'
            )
          }
        />
        {isLabel ? null : (
          <Form.Check.Label>
            <b>{label}</b>
          </Form.Check.Label>
        )}
      </Form.Check>
      {note && <Form.Text className="text-muted">{note}</Form.Text>}
    </Form.Group>
  );
};

export const renderColWidth = ({ layer, fieldObject, field, fnChange }) => (
  <Form.Group as={Col}>
    <LLabel>
      <>
        {getFieldProps(field).label}&nbsp;
        {getFieldProps(field).fieldTooltip}
      </>
    </LLabel>
    <div style={{ display: 'flex' }}>
      <span style={{ width: '100%' }}>
        <Select
          styles={frmSelSty}
          name={field}
          multi={false}
          options={ColWidthOpts}
          value={ColWidthOpts.find(
            (o) => o.value === (fieldObject[field] || layer.cols)
          )}
          onChange={(event) =>
            fnChange(
              event,
              fieldObject[field],
              fieldObject.field,
              layer.key,
              'cols',
              'select'
            )
          }
        />
      </span>
    </div>
  </Form.Group>
);

export const renderAdjust = ({ layer, fieldObject, fnChange, xs }) =>
  [FieldTypes.F_FORMULA_FIELD].includes(fieldObject.type)
    ? renderCheck({
        layer,
        fieldObject,
        fnChange,
        field: 'canAdjust',
        disabled: false,
        xs,
      })
    : null;

export const renderOwnRow = ({ layer, fieldObject, fnChange }) =>
  [
    FieldTypes.F_DUMMY,
    FieldTypes.F_TABLE,
    // FieldTypes.F_DATETIME_RANGE,
  ].includes(fieldObject.type)
    ? null
    : renderCheck({
        layer,
        fieldObject,
        fnChange,
        field: 'hasOwnRow',
        disabled: FieldTypes.F_DATETIME_RANGE === fieldObject.type,
      });

export const renderRequired = ({ layer, fieldObject, fnChange, xs }) =>
  [FieldTypes.F_INTEGER, FieldTypes.F_TEXT].includes(fieldObject.type)
    ? renderCheck({
        layer,
        fieldObject,
        fnChange,
        field: 'required',
        disabled: false,
        xs,
      })
    : null;

export const renderReadonly = ({ layer, fieldObject, fnChange }) =>
  [FieldTypes.F_TEXT].includes(fieldObject.type)
    ? renderCheck({
        layer,
        fieldObject,
        fnChange,
        field: 'readonly',
        note: "In 'Read-Only' mode, it shows plain text with an available placeholder.",
      })
    : null;

export const renderTypeField = ({
  layer,
  fieldObject,
  fnChange,
  typeOpts,
  xs,
}) =>
  [FieldTypes.F_DUMMY].includes(fieldObject.type) ? null : (
    <Form.Group as={Col} xs={xs}>
      <LLabel>
        <>
          {getFieldProps('type').label}&nbsp;
          {getFieldProps('type').fieldTooltip}
        </>
      </LLabel>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ width: '100%' }}>
          <Select
            styles={frmSelSty}
            name={fieldObject.field}
            multi={false}
            options={typeOpts}
            value={typeOpts?.find((o) => o.value === fieldObject.type)}
            onChange={(event) =>
              fnChange(
                event,
                fieldObject.type,
                fieldObject.field,
                layer.key,
                'type',
                'select'
              )
            }
          />
        </span>
      </div>
    </Form.Group>
  );

export const renderNumberField = ({
  layer,
  fieldObject,
  field,
  fnChange,
  xs,
}) => (
  <Form.Group as={Col} xs={xs}>
    <LLabel>
      <>
        {getFieldProps(field).label}&nbsp;
        {getFieldProps(field).fieldTooltip}
      </>
    </LLabel>
    <Form.Control
      type="number"
      name={`frmDec_${layer.key}_f_${fieldObject.field}`}
      value={fieldObject.decimal}
      onChange={(event) =>
        fnChange(
          event,
          fieldObject.label,
          fieldObject.field,
          layer.key,
          field,
          'text'
        )
      }
      min={1}
    />
  </Form.Group>
);
