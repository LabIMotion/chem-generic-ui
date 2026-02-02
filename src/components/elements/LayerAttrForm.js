/* eslint-disable react/forbid-prop-types */
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Badge,
  Button,
  Collapse,
  Form,
  InputGroup,
  ListGroup,
} from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import FieldBadge from '@components/fields/FieldBadge';
import LFormGroup from '@components/shared/LFormGroup';

const colorOptions = [
  { value: 'none', label: 'None', bg: 'white', text: 'dark' },
  { value: 'warning', label: 'Amber', bg: 'warning', text: 'white' },
  {
    value: 'primary',
    label: 'Blue (Ocean Blue)',
    bg: 'primary',
    text: 'white',
  },
  { value: 'info', label: 'Blue (Sky Blue)', bg: 'info', text: 'white' },
  { value: 'danger', label: 'Crimson', bg: 'danger', text: 'white' },
  { value: 'success', label: 'Fresh Green', bg: 'success', text: 'white' },
  { value: 'default', label: 'Grey', bg: 'secondary', text: 'dark' },
];

const LayerAttrForm = forwardRef(({ layer, isAttrOnWF, isCreateMode }, ref) => {
  const attLayerKey = useRef();
  const attLabel = useRef();
  const attCols = useRef();
  // const attPosition = useRef();
  const attColor = useRef();
  const attStyle = useRef();
  const attWf = useRef();
  const [selectedColor, setSelectedColor] = useState(layer.color || 'none');
  const [showDynamicLabel, setShowDynamicLabel] = useState(false);
  const [labelFields, setLabelFields] = useState(layer.label_fields || []);
  const [, setDisplayLabel] = useState(layer.label || '');

  // Get valid fields for dynamic label (select types or text types)
  const VALID_FIELD_TYPES = [FieldTypes.F_SELECT, FieldTypes.F_TEXT];
  const getValidFields = () => {
    if (!layer.fields) return [];
    return layer.fields.filter((field) =>
      VALID_FIELD_TYPES.includes(field.type),
    );
  };

  const validFields = getValidFields();

  // Get available fields (not yet in labelFields)
  const getAvailableFields = () =>
    validFields.filter((field) => !labelFields.includes(field.field));

  // Add field to labelFields
  const handleAddField = (fieldName) => {
    setLabelFields([...labelFields, fieldName]);
  };

  // Remove field from labelFields
  const handleRemoveField = (fieldName) => {
    setLabelFields(labelFields.filter((f) => f !== fieldName));
  };

  // Move field up in labelFields
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newFields = [...labelFields];
    [newFields[index - 1], newFields[index]] = [
      newFields[index],
      newFields[index - 1],
    ];
    setLabelFields(newFields);
  };

  // Move field down in labelFields
  const handleMoveDown = (index) => {
    if (index === labelFields.length - 1) return;
    const newFields = [...labelFields];
    [newFields[index], newFields[index + 1]] = [
      newFields[index + 1],
      newFields[index],
    ];
    setLabelFields(newFields);
  };

  useImperativeHandle(ref, () => ({
    attLayerKey: attLayerKey.current,
    attLabel: attLabel.current,
    attCols: attCols.current,
    // attPosition: attPosition.current,
    attColor: attColor.current,
    attStyle: attStyle.current,
    attWf: attWf.current,
    labelFields,
  }));

  return (
    <Form className="row input-form">
      <LFormGroup controlId="formControlLayerKey">
        <InputGroup>
          <InputGroup.Text>Name</InputGroup.Text>
          <Form.Control
            type="text"
            defaultValue={layer.key}
            ref={attLayerKey}
            readOnly={!!layer.key}
            className={layer.key ? 'bg-light text-muted' : ''}
          />
        </InputGroup>
        <div className="help">
          Layer name is unique in the template, at least 3 characters
          <br />
          Layer name must contain only lowercase letters and underscores,
          underscores can not be the first/last one character
          <br />
          Layer name should not contain special characters like $, !, %, etc.
        </div>
      </LFormGroup>
      <LFormGroup controlId="formControlLayerLabel">
        <InputGroup>
          <InputGroup.Text>Display name</InputGroup.Text>
          <Form.Control
            type="text"
            defaultValue={layer.label}
            ref={attLabel}
            onChange={(e) => setDisplayLabel(e.target.value)}
          />
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formControlLayerCols">
        <InputGroup>
          <InputGroup.Text>Columns per row</InputGroup.Text>
          <Form.Select defaultValue={layer.cols || 1} ref={attCols}>
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      </LFormGroup>
      {/* <LFormGroup controlId="formControlLayerPosition">
        <InputGroup>
          <InputGroup.Text>Sequential position</InputGroup.Text>
          <Form.Control
            type="number"
            defaultValue={layer.position}
            ref={attPosition}
            min={1}
          />
        </InputGroup>
      </LFormGroup> */}
      <LFormGroup controlId="formControlLayerColor">
        <InputGroup>
          <InputGroup.Text>Header color</InputGroup.Text>
          <Form.Select
            defaultValue={layer.color}
            ref={attColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
          <InputGroup.Text className="bg-white">
            <Badge
              bg={
                colorOptions.find((opt) => opt.value === selectedColor)?.bg ||
                'light'
              }
              text={
                colorOptions.find((opt) => opt.value === selectedColor)?.text ||
                'dark'
              }
              className={selectedColor === 'default' ? 'lu-bg-light' : ''}
            >
              {colorOptions.find((opt) => opt.value === selectedColor)?.label ||
                'None'}
            </Badge>
          </InputGroup.Text>
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formCtlHeaderStyle">
        <InputGroup>
          <InputGroup.Text>Text Style</InputGroup.Text>
          <Form.Select defaultValue={layer.style} ref={attStyle}>
            <option value="panel_generic_heading">bold</option>
            <option value="panel_generic_heading_bu">bold + underline</option>
            <option value="panel_generic_heading_bui">
              bold + underline + italic
            </option>
          </Form.Select>
        </InputGroup>
      </LFormGroup>
      <LFormGroup controlId="formCtlWF" hidden={!isAttrOnWF}>
        <InputGroup>
          <InputGroup.Text>Used in Workflow?</InputGroup.Text>
          <Form.Select defaultValue={layer?.wf} ref={attWf}>
            <option value={false}>No</option>
            <option value>Yes</option>
          </Form.Select>
        </InputGroup>
      </LFormGroup>

      {/* Dynamic Display Name Configuration */}
      {!isCreateMode && (
        <LFormGroup controlId="formCtlDynamicLabel">
          <Button
            variant="link"
            onClick={() => setShowDynamicLabel(!showDynamicLabel)}
            aria-controls="dynamic-label-collapse"
            aria-expanded={showDynamicLabel}
            className="text-decoration-none p-0 mb-2"
          >
            {showDynamicLabel ? '▼' : '▶'} Advanced Display Name Setting
            {labelFields.length > 0 && (
              <Badge bg="info" className="ms-2">
                {labelFields.length} field{labelFields.length > 1 ? 's' : ''}{' '}
                selected
              </Badge>
            )}
          </Button>
          <Collapse in={showDynamicLabel}>
            <div id="dynamic-label-collapse">
              <div className="border rounded p-3 bg-light">
                <p className="text-muted small mb-3">
                  Select fields to include in the layer display name. Only
                  select and text field types are supported. The display name
                  will be:{' '}
                  <strong>Display Name - Field1 Value - Field2 Value</strong>
                </p>

                {/* Selected Fields */}
                {labelFields.length > 0 && (
                  <div className="mb-3">
                    <strong className="d-block mb-2">
                      Selected Fields (in order):
                    </strong>
                    <ListGroup>
                      {labelFields.map((fieldName, index) => {
                        const field = validFields.find(
                          (f) => f.field === fieldName,
                        );
                        if (!field) return null;
                        return (
                          <ListGroup.Item
                            key={fieldName}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <span>
                              <strong>{field.label || ''}</strong>
                              <FieldBadge fieldObj={field} prop="field" />
                              {/* <Badge bg="secondary" className="ms-2">
                              {field.type}
                            </Badge> */}
                            </span>
                            <div>
                              <Button
                                size="xsm"
                                variant="outline-secondary"
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className="me-1"
                                title="Move up"
                              >
                                ↑
                              </Button>
                              <Button
                                size="xsm"
                                variant="outline-secondary"
                                onClick={() => handleMoveDown(index)}
                                disabled={index === labelFields.length - 1}
                                className="me-1"
                                title="Move down"
                              >
                                ↓
                              </Button>
                              <Button
                                size="xsm"
                                variant="outline-danger"
                                onClick={() => handleRemoveField(fieldName)}
                                title="Remove"
                              >
                                ×
                              </Button>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </div>
                )}

                {/* Available Fields */}
                {getAvailableFields().length > 0 && (
                  <div className="mb-3">
                    <strong className="d-block mb-2">Available Fields:</strong>
                    <ListGroup>
                      {getAvailableFields().map((field) => (
                        <ListGroup.Item
                          key={field.field}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <span>
                            <strong>{field.label || field.field}</strong>
                            <FieldBadge fieldObj={field} prop="field" />
                          </span>
                          <Button
                            size="xsm"
                            variant="outline-primary"
                            onClick={() => handleAddField(field.field)}
                          >
                            Select
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}

                {validFields.length === 0 && (
                  <div className="alert alert-info mb-0">
                    No text or select fields available in this layer.
                  </div>
                )}
              </div>
            </div>
          </Collapse>
        </LFormGroup>
      )}
    </Form>
  );
});

LayerAttrForm.propTypes = {
  layer: PropTypes.object.isRequired,
  isAttrOnWF: PropTypes.bool.isRequired,
  isCreateMode: PropTypes.bool,
};

LayerAttrForm.defaultProps = {
  isCreateMode: false,
};

LayerAttrForm.displayName = 'LayerAttrForm';

export default LayerAttrForm;
