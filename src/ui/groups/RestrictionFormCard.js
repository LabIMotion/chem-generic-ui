import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Form } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import { fieldLabelFor, layerLabelFor, getConditionDisplay } from '@utils/pureUtils';
import OperatorSelector from '@ui/groups/OperatorSelector';
import Constants from '@components/tools/Constants';
import { useDesignerContext } from '@components/designer/DesignerContext';

/**
 * Shared component for rendering restriction form UI
 */
function RestrictionFormCard({
  conditions,
  selectedLayer,
  selectedField,
  fieldValue,
  availableFields,
  selectedOp,
  availableLayers,
  selectOptions = {},
  filterCurrentLayer = false,
  currentEntityKey,
  onClose,
  onLayerChange,
  onFieldChange,
  onValueChange,
  onAddCondition,
  onRemoveCondition,
  onOpChange,
  selectedSource,
  onSourceChange,
}) {
  const { klasses = [], genericType } = useDesignerContext();
  // Filter layers if needed
  const layersToShow = filterCurrentLayer
    ? availableLayers.filter((layer) => layer.key !== currentEntityKey)
    : availableLayers;

  // Get selected field details and options for select fields
  const selectedFieldObj = availableFields.find(
    (field) => field.field === selectedField,
  );
  const isSelectField = selectedFieldObj?.type === 'select';
  const isCheckboxField = selectedFieldObj?.type === 'checkbox';
  const selectFieldOptions =
    isSelectField && selectedFieldObj?.option_layers
      ? selectOptions[selectedFieldObj.option_layers]?.options || []
      : [];

  // Render value input based on field type
  const renderValueInput = () => {
    if (isSelectField) {
      return (
        <Form.Select
          size="sm"
          value={fieldValue}
          onChange={onValueChange}
          style={{ flex: 1 }}
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
          onChange={onValueChange}
          style={{ flex: 1 }}
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
        onChange={onValueChange}
        style={{ flex: 1 }}
      />
    );
  };

  // Get helper text based on field type
  const getHelperText = () => {
    if (isSelectField) return 'Select from predefined options';
    if (isCheckboxField) return 'Select the expected checkbox state';
    return 'Enter the expected value (case-sensitive)';
  };

  return (
    <Card className="mb-3 border border-info">
      <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
        <small>Restriction Conditions</small>
        <Button variant="light" size="xsm" onClick={onClose}>
          Close
        </Button>
      </Card.Header>
      <Card.Body className="p-3">
        <OperatorSelector selectedOp={selectedOp} onOpChange={onOpChange} />
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
                  <small className="flex-grow-1">
                    <strong>{layerTitle}</strong> → {fieldTitle} = &quot;
                    {valueTitle}&quot;
                  </small>
                  <Button
                    variant="danger"
                    size="xsm"
                    onClick={() => onRemoveCondition(cond.id)}
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
          <small className="text-muted d-block mb-2">Add New Condition:</small>
          <Form.Group className="mb-2">
            <Form.Label className="small">Select Layer (appearance order)</Form.Label>
            <Form.Select
              size="sm"
              value={selectedLayer}
              onChange={onLayerChange}
            >
              {layersToShow &&
                layersToShow.map((layer) => (
                  <option key={layer.key} value={layer.key}>
                    {layer.label || layer.key} ({layer.key})
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <div className="row mb-2 align-items-start">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="small">Select Field</Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedField}
                  onChange={onFieldChange}
                  disabled={availableFields.length === 0}
                >
                  {/* <option value="">Select a field...</option> */}
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
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="small">Enter Value</Form.Label>
                <div className="d-flex gap-2 align-items-start">
                  {renderValueInput()}
                  <Button
                    variant="success"
                    size="sm"
                    onClick={onAddCondition}
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
                <Form.Text muted>{getHelperText()}</Form.Text>
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
                      value={selectedSource || ''}
                      onChange={onSourceChange}
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
                      onClick={() => onAddCondition(selectedSource)}
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
  );
}

RestrictionFormCard.propTypes = {
  conditions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      field: PropTypes.string,
      layer: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    }),
  ).isRequired,
  selectedLayer: PropTypes.string.isRequired,
  selectedField: PropTypes.string.isRequired,
  fieldValue: PropTypes.string.isRequired,
  availableFields: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      label: PropTypes.string,
      type: PropTypes.string,
    }),
  ).isRequired,
  selectedOp: PropTypes.number.isRequired,
  availableLayers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      fields: PropTypes.arrayOf(PropTypes.object),
    }),
  ).isRequired,
  selectOptions: PropTypes.object,
  filterCurrentLayer: PropTypes.bool,
  currentEntityKey: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onLayerChange: PropTypes.func.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  onValueChange: PropTypes.func.isRequired,
  onAddCondition: PropTypes.func.isRequired,
  onRemoveCondition: PropTypes.func.isRequired,
  onOpChange: PropTypes.func.isRequired,
  selectedSource: PropTypes.string,
  onSourceChange: PropTypes.func,
};

RestrictionFormCard.defaultProps = {
  filterCurrentLayer: false,
  currentEntityKey: null,
  selectOptions: {},
};

export default RestrictionFormCard;
