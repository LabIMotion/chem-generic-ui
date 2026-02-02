import { isFieldEffectivelyVisible } from '@utils/template/visibility-handler';

/**
 * Removes any fields that don't exist in the layer or are not valid types
 * Valid types: select fields (always), text fields (only if not readonly)
 */
export const validateLabelFields = (labelFields, layerFields) => {
  if (!Array.isArray(labelFields) || !Array.isArray(layerFields)) {
    return [];
  }

  const validFieldNames = layerFields
    .filter((field) => {
      if (field.type === 'select') {
        return true;
      }
      if (field.type === 'text') {
        return field.readonly !== true;
      }
      return false;
    })
    .map((field) => field.field);

  return labelFields.filter((fieldName) => validFieldNames.includes(fieldName));
};

/**
 * Updates when a field is removed from the layer
 */
export const updateLabelFieldsOnRemoval = (labelFields, removedFieldName) => {
  if (!Array.isArray(labelFields)) {
    return [];
  }
  return labelFields.filter((fieldName) => fieldName !== removedFieldName);
};

/**
 * Gets available fields for dynamic label (select fields and non-readonly text fields)
 */
export const getAvailableFieldsForLabel = (layerFields) => {
  if (!Array.isArray(layerFields)) {
    return [];
  }
  return layerFields.filter((field) => {
    if (field.type === 'select') {
      return true;
    }
    if (field.type === 'text') {
      return field.readonly !== true;
    }
    return false;
  });
};

/**
 * Computes the layer dynamic display name
 */
export const computeDynamicDisplayName = (
  baseLabel,
  labelFields,
  layer,
  allLayers = null,
  fieldValues = {},
  refElement = null,
) => {
  if (!baseLabel) {
    return '';
  }

  if (!Array.isArray(labelFields) || labelFields.length === 0) {
    return baseLabel;
  }

  const layerFields = layer?.fields || [];
  const validatedFields = validateLabelFields(labelFields, layerFields);

  if (validatedFields.length === 0) {
    return baseLabel;
  }

  const fieldParts = validatedFields
    .map((fieldName) => {
      const field = layerFields.find((f) => f.field === fieldName);
      if (!field) return null;

      // Check visibility if allLayers is provided
      if (allLayers) {
        const [isVisible] = isFieldEffectivelyVisible(
          field,
          layer,
          allLayers,
          new Set(),
          refElement,
        );
        if (!isVisible) return null;
      }

      // Try to get value
      if (fieldValues[fieldName]) {
        return fieldValues[fieldName];
      }

      // Otherwise, try to get value from definition
      return field.value || field.default || '';
    })
    .filter((val) => val && val.toString().trim() !== ''); // Skip empty values

  if (fieldParts.length === 0) {
    return baseLabel;
  }

  return `${baseLabel} - ${fieldParts.join(' - ')}`;
};

