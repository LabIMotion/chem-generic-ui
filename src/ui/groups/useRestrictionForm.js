import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FieldTypes } from 'generic-ui-core';
import { toBool } from '@utils/pureUtils';

const ALLOWED_FIELD_TYPES = ['checkbox', 'text', 'select'];

/**
 * A hook for managing restriction form state and logic
 */
function useRestrictionForm({
  entityKey,
  restriction,
  availableLayers,
  onUpdateRestriction,
  idSuffix = 'lc',
  filterCurrentLayer = false,
}) {
  const [showRestrictionForm, setShowRestrictionForm] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [availableFields, setAvailableFields] = useState([]);
  const [selectedOp, setSelectedOp] = useState(1);
  const [selectedSource, setSelectedSource] = useState('');

  // Load existing restrictions when restriction changes
  useEffect(() => {
    if (restriction && restriction.cond) {
      setConditions(restriction.cond);
      setSelectedOp(restriction.op ?? 1);
    }
  }, [restriction]);

  const updateAvailableFields = (layer) => {
    if (!layer || !layer.fields) {
      setAvailableFields([]);
      return;
    }

    const filteredFields = layer.fields.filter((field) =>
      ALLOWED_FIELD_TYPES.includes(field.type),
    );
    setAvailableFields(filteredFields);

    if (filteredFields.length > 0) {
      setSelectedField(filteredFields[0].field);
    } else {
      setSelectedField('');
    }
  };

  const handleRestrictionClick = () => {
    setShowRestrictionForm(!showRestrictionForm);
    if (!showRestrictionForm && availableLayers && availableLayers.length > 0) {
      // Filter out the current layer if needed
      const filteredLayers = filterCurrentLayer
        ? availableLayers.filter((l) => l.key !== entityKey)
        : availableLayers;

      if (filteredLayers.length > 0) {
        const firstLayer = filteredLayers[0];
        setSelectedLayer(firstLayer.key);
        updateAvailableFields(firstLayer);
      }
    }
  };

  const handleLayerChange = (e) => {
    const layerKeyValue = e.target.value;
    setSelectedLayer(layerKeyValue);
    const layer = availableLayers.find((l) => l.key === layerKeyValue);
    if (layer) {
      updateAvailableFields(layer);
    }
    setFieldValue('');
  };

  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
    setFieldValue('');
  };

  const handleSourceChange = (e) => {
    setSelectedSource(e.target.value);
  };

  const handleAddCondition = (source) => {
    let newCondition;

    if (source && typeof source === 'string') {
      newCondition = {
        id: `${uuidv4()}-${idSuffix}`,
        field: 'TYPE',
        layer: 'SRC-EL',
        value: source,
      };
    } else {
      if (!selectedLayer || !selectedField) {
        return;
      }

      const layer = availableLayers.find((l) => l.key === selectedLayer);
      const field = layer?.fields?.find((f) => f.field === selectedField);
      const isCheckbox = field?.type === FieldTypes.F_CHECKBOX;

      let conditionValue = fieldValue.trim();
      if (isCheckbox) {
        conditionValue = toBool(conditionValue);
      }
      newCondition = {
        id: `${uuidv4()}-${idSuffix}`,
        field: selectedField,
        layer: selectedLayer,
        value: conditionValue,
      };
    }

    const updatedConditions = [...conditions, newCondition];
    setConditions(updatedConditions);
    setFieldValue('');

    if (onUpdateRestriction) {
      onUpdateRestriction(entityKey, {
        op: selectedOp,
        cond: updatedConditions,
      });
    }
  };

  const handleRemoveCondition = (conditionId) => {
    const updatedConditions = conditions.filter((c) => c.id !== conditionId);
    setConditions(updatedConditions);

    if (onUpdateRestriction) {
      if (updatedConditions.length === 0) {
        onUpdateRestriction(entityKey, null);
      } else {
        onUpdateRestriction(entityKey, {
          op: selectedOp,
          cond: updatedConditions,
        });
      }
    }
  };

  const handleOpChange = (newOp) => {
    setSelectedOp(newOp);

    if (onUpdateRestriction && conditions.length > 0) {
      onUpdateRestriction(entityKey, {
        op: newOp,
        cond: conditions,
      });
    }
  };

  return {
    showRestrictionForm,
    setShowRestrictionForm,
    conditions,
    selectedLayer,
    selectedField,
    fieldValue,
    setFieldValue,
    availableFields,
    selectedOp,
    handleRestrictionClick,
    handleLayerChange,
    handleFieldChange,
    handleSourceChange,
    handleAddCondition,
    handleRemoveCondition,
    handleOpChange,
    selectedSource,
    setSelectedSource,
  };
}

export default useRestrictionForm;
