import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Modal, Card, Button, Form } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import { FieldTypes } from 'generic-ui-core';
import FIcons from '@components/icons/FIcons';
import OperatorSelector from '@ui/groups/OperatorSelector';
import Constants from '@components/tools/Constants';
import { fieldLabelFor, layerLabelFor, toBool, getConditionDisplay } from '@utils/pureUtils';
import { useDesignerContext } from '@components/designer/DesignerContext';

const ALLOWED_FIELD_TYPES = ['checkbox', 'text', 'select'];

/**
 * FieldRestrictionModal - Modal for managing field restrictions
 * Uses the same clean UI pattern as the layer restriction inline form
 */
function FieldRestrictionModal({
  showModal,
  field,
  layer,
  sortedLayers,
  onUpdate,
  onClose,
  groupedLayerKeys,
  sameGroupLayerKeys,
  selectOptions = {},
}) {
  const [conditions, setConditions] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [displayAsValue, setDisplayAsValue] = useState('');
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedOp, setSelectedOp] = useState(1);
  const [availableLayers, setAvailableLayers] = useState([]);
  const [initialConditions, setInitialConditions] = useState([]);
  const [initialOp, setInitialOp] = useState(1);
  const { klasses = [], genericType } = useDesignerContext();
  const [selectedSource, setSelectedSource] = useState('');

  // Filter available layers based on grouping
  useEffect(() => {
    if (!sortedLayers) {
      setAvailableLayers([]);
      return;
    }

    let filtered;
    if (sameGroupLayerKeys && sameGroupLayerKeys.length > 0) {
      // For grouped layers: only show layers in the same group
      filtered = sortedLayers.filter((l) => sameGroupLayerKeys.includes(l.key));
    } else {
      // For ungrouped layers: only show ungrouped layers
      const groupedSet = new Set(groupedLayerKeys || []);
      filtered = sortedLayers.filter((l) => !groupedSet.has(l.key));
    }

    setAvailableLayers(filtered);
  }, [sortedLayers, groupedLayerKeys, sameGroupLayerKeys]);

  // Load existing restrictions when component mounts or field changes
  useEffect(() => {
    if (!showModal) return;

    if (field?.cond_fields) {
      setConditions(field.cond_fields);
      setSelectedOp(field.cond_operator ?? 1);
      setInitialConditions(field.cond_fields);
      setInitialOp(field.cond_operator ?? 1);
    } else {
      setConditions([]);
      setSelectedOp(1);
      setInitialConditions([]);
      setInitialOp(1);
    }

    // Initialize with first available layer
    if (availableLayers && availableLayers.length > 0) {
      const firstLayer = availableLayers[0];
      setSelectedLayer(firstLayer.key);
      updateAvailableFields(firstLayer);
    }
  }, [showModal, field, availableLayers]);

  const updateAvailableFields = (selectedLayer) => {
    if (!selectedLayer || !selectedLayer.fields) {
      setAvailableFields([]);
      return;
    }

    let filteredFields = selectedLayer.fields.filter((f) =>
      ALLOWED_FIELD_TYPES.includes(f.type),
    );

    // If the selected layer is the same as the current field's layer,
    // exclude the current field itself
    if (selectedLayer.key === layer.key) {
      filteredFields = filteredFields.filter((f) => f.field !== field.field);
    }

    setAvailableFields(filteredFields);

    if (filteredFields.length > 0) {
      setSelectedField(filteredFields[0].field);
    } else {
      setSelectedField('');
    }
  };

  const handleLayerChange = (e) => {
    const layerKey = e.target.value;
    setSelectedLayer(layerKey);
    const layer = availableLayers.find((l) => l.key === layerKey);
    if (layer) {
      updateAvailableFields(layer);
    }
    setFieldValue('');
  };

  const handleAddCondition = () => {
    if (!selectedLayer || !selectedField) {
      return;
    }

    // Get the field type to determine if we need to convert the value
    const selectedLayerObj = availableLayers.find(
      (l) => l.key === selectedLayer,
    );
    const selectedFieldObj = selectedLayerObj?.fields?.find(
      (f) => f.field === selectedField,
    );
    const isCheckbox = selectedFieldObj?.type === FieldTypes.F_CHECKBOX;

    // Convert to boolean for checkbox fields using toBool utility
    let conditionValue = fieldValue.trim();
    if (isCheckbox) {
      conditionValue = toBool(fieldValue);
    }

    const newCondition = {
      id: `${uuidv4()}-fc`,
      field: selectedField,
      layer: selectedLayer,
      value: conditionValue,
      label: displayAsValue.trim(), // For "Display as" feature with Match One
    };

    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
    setFieldValue('');
    setDisplayAsValue('');
  };

  const handleAddSourceCondition = () => {
    if (!selectedSource) return;

    const newCondition = {
      id: `${uuidv4()}-fc`,
      field: 'TYPE',
      layer: 'SRC-EL',
      value: selectedSource,
    };

    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
  };

  const handleRemoveCondition = (conditionId) => {
    const updatedConditions = conditions.filter((c) => c.id !== conditionId);
    setConditions(updatedConditions);
  };

  const handleOpChange = (newOp) => {
    setSelectedOp(newOp);
  };

  const handleSave = () => {
    if (onUpdate) {
      if (conditions.length === 0) {
        // Remove restriction properties
        const updatedField = { ...field };
        delete updatedField.cond_fields;
        delete updatedField.cond_operator;
        onUpdate(updatedField);
      } else {
        onUpdate({
          ...field,
          cond_fields: conditions,
          cond_operator: selectedOp,
        });
      }
    }
    onClose();
  };

  const handleCancel = () => {
    // Restore initial state
    setConditions(initialConditions);
    setSelectedOp(initialOp);
    onClose();
  };

  if (!showModal) {
    return null;
  }

  return (
    <Modal
      centered
      backdrop="static"
      dialogClassName="gu_modal-68w"
      show={showModal}
      onHide={handleCancel}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Field Restriction Setting [ {field.label} ] in [ {layer.label} ]
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Card className="border-0">
          <Card.Body className="p-0">
            <OperatorSelector
              selectedOp={selectedOp}
              onOpChange={handleOpChange}
            />
            {conditions.length > 0 && (
              <div className="mb-3">
                <small className="text-muted d-block mb-2">
                  Existing Conditions:
                </small>
                {conditions.map((cond) => {
                  const { layerTitle, fieldTitle, valueTitle } =
                    getConditionDisplay(cond, availableLayers, klasses);
                  return (
                    <div
                      key={cond.id}
                      className="d-flex align-items-center gap-2 mb-2 p-2 border rounded bg-white"
                    >
                      <div className="flex-grow-1">
                        <small>
                          <strong>{layerTitle}</strong> → {fieldTitle} =
                          &quot;{valueTitle}&quot;
                          {cond.label && (
                            <span className="text-muted">
                              {' '}
                              [Display as: <em>{cond.label}</em>]
                            </span>
                          )}
                        </small>
                      </div>
                      <Button
                        variant="danger"
                        size="xsm"
                        onClick={() => handleRemoveCondition(cond.id)}
                        title="Remove condition"
                      >
                        {FIcons.faTrashCan}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-top pt-3">
              <small className="text-muted d-block mb-2">
                Add New Condition:
              </small>
              <Form.Group className="mb-2">
                <Form.Label className="small">Select Layer (appearance order)</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedLayer}
                  onChange={handleLayerChange}
                >
                  {availableLayers &&
                    availableLayers.map((layer) => (
                      <option key={layer.key} value={layer.key}>
                        {layer.label || layer.key} ({layer.key})
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <div className="row mb-3 align-items-start">
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="small">Select Field</Form.Label>
                    <Form.Select
                      size="sm"
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      disabled={availableFields.length === 0}
                    >
                      {availableFields.map((field) => (
                        <option key={field.field} value={field.field}>
                          {field.label || field.field} ({field.field}, type: {field.type})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text muted>
                      Eligible fields (checkbox, text, select)
                    </Form.Text>
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="small">Enter Value</Form.Label>
                    {(() => {
                      // Get selected field details and options for select fields
                      const selectedLayerObj = availableLayers.find(
                        (l) => l.key === selectedLayer,
                      );
                      const selectedFieldObj = selectedLayerObj?.fields?.find(
                        (f) => f.field === selectedField,
                      );
                      const isSelectField = selectedFieldObj?.type === 'select';
                      const isCheckboxField =
                        selectedFieldObj?.type === FieldTypes.F_CHECKBOX;
                      const selectFieldOptions =
                        isSelectField && selectedFieldObj?.option_layers
                          ? selectOptions[selectedFieldObj.option_layers]
                              ?.options || []
                          : [];

                      // Render based on field type
                      if (isSelectField) {
                        return (
                          <Form.Select
                            size="sm"
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                          >
                            <option value="">Select a value...</option>
                            {selectFieldOptions.map((option) => (
                              <option key={option.key} value={option.key}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                        );
                      }

                      if (isCheckboxField) {
                        return (
                          <Form.Select
                            size="sm"
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                          >
                            <option value="false">Unchecked (false)</option>
                            <option value="true">Checked (true)</option>
                          </Form.Select>
                        );
                      }

                      return (
                        <Form.Control
                          type="text"
                          size="sm"
                          placeholder="Enter expected value"
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                        />
                      );
                    })()}
                    <Form.Text muted>
                      {(() => {
                        const selectedLayerObj = availableLayers.find(
                          (l) => l.key === selectedLayer,
                        );
                        const selectedFieldObj = selectedLayerObj?.fields?.find(
                          (f) => f.field === selectedField,
                        );
                        if (selectedFieldObj?.type === 'select') {
                          return 'Select from predefined options';
                        }
                        if (selectedFieldObj?.type === FieldTypes.F_CHECKBOX) {
                          return 'Select the expected checkbox state';
                        }
                        return 'Enter the expected value (case-sensitive)';
                      })()}
                    </Form.Text>
                  </Form.Group>
                </div>

                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label className="small">
                      Display as (optional)
                      {selectedOp !== 1 && (
                        <span className="text-muted"> - Match One only</span>
                      )}
                    </Form.Label>
                    <div className="d-flex gap-2 align-items-start">
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Alternative name"
                        value={displayAsValue}
                        onChange={(e) => setDisplayAsValue(e.target.value)}
                        disabled={selectedOp !== 1}
                        style={{ flex: 1 }}
                      />
                      <Button
                        variant="success"
                        size="sm"
                        onClick={handleAddCondition}
                        disabled={
                          !selectedLayer ||
                          !selectedField ||
                          availableFields.length === 0
                        }
                        style={{ flexShrink: 0 }}
                        title="Add condition"
                      >
                        {FIcons.faPlus}
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </div>

              {genericType === Constants.GENERIC_TYPES.DATASET && (
                <div className="row align-items-start">
                  <div className="col-md-12">
                    <Form.Group className="border-top pt-3">
                      <Form.Label className="small">Reference Source</Form.Label>
                      <div className="d-flex gap-2 align-items-start">
                        <Form.Select
                          size="sm"
                          value={selectedSource}
                          onChange={(e) => setSelectedSource(e.target.value)}
                          disabled={klasses.length === 0}
                          style={{ flex: 1 }}
                        >
                          <option value="">Select a source...</option>
                          {klasses.map((klass) => (
                            <option key={klass.name} value={klass.name}>
                              {klass.label || klass.name} ({klass.name})
                            </option>
                          ))}
                        </Form.Select>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleAddSourceCondition}
                          disabled={!selectedSource || klasses.length === 0}
                          style={{ flexShrink: 0 }}
                          title="Add condition"
                        >
                          {FIcons.faPlus}
                        </Button>
                      </div>
                      <Form.Text muted>Eligible reference sources</Form.Text>
                    </Form.Group>
                  </div>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
      <Modal.Footer className="justify-content-start">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

FieldRestrictionModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  field: PropTypes.shape({
    label: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    cond_fields: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        field: PropTypes.string,
        layer: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        label: PropTypes.string,
      }),
    ),
    cond_operator: PropTypes.number,
  }).isRequired,
  layer: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string,
  }).isRequired,
  sortedLayers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      fields: PropTypes.array,
    }),
  ).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  groupedLayerKeys: PropTypes.arrayOf(PropTypes.string),
  sameGroupLayerKeys: PropTypes.arrayOf(PropTypes.string),
  selectOptions: PropTypes.object,
};

FieldRestrictionModal.defaultProps = {
  groupedLayerKeys: [],
  sameGroupLayerKeys: null,
  selectOptions: {},
};

export default FieldRestrictionModal;
