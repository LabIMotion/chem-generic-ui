import { FieldTypes } from 'generic-ui-core';
import { isFieldEffectivelyVisible } from '@utils/template/visibility-handler';

/**
 * Checks if a value is effectively filled (not empty string, null, or undefined).
 */
const hasValue = (v) => v !== '' && v !== null && v !== undefined;

/**
 * Type-specific handlers for determining if a field is filled.
 */
const FILL_HANDLERS = {
  // Always filled types
  [FieldTypes.F_CHECKBOX]: () => true,
  [FieldTypes.F_TEXT_FORMULA]: () => true,

  // Simple value types
  [FieldTypes.F_TEXT]: (f) => f.readonly === true || hasValue(f.value),

  // Container types
  [FieldTypes.F_TABLE]: (f) =>
    Array.isArray(f.sub_values) &&
    f.sub_values.length > 0 &&
    typeof f.sub_values[0] === 'object' &&
    f.sub_values[0] !== null,

  [FieldTypes.F_DATETIME_RANGE]: ({ sub_fields: sf }) =>
    Array.isArray(sf) &&
    sf.length >= 4 &&
    hasValue(sf[0]?.value) &&
    hasValue(sf[1]?.value) &&
    hasValue(sf[3]?.value),

  [FieldTypes.F_INPUT_GROUP]: ({ sub_fields: sf }) =>
    Array.isArray(sf) &&
    sf.length > 0 &&
    sf.every((sub) => sub.type === FieldTypes.F_LABEL || hasValue(sub.value)),

  [FieldTypes.F_SELECT_MULTI]: ({ sub_fields: sf }) =>
    Array.isArray(sf) && sf.some((sub) => hasValue(sub.value)),

  // Nested property types (drag & upload)
  [FieldTypes.F_DRAG_ELEMENT]: ({ value: v }) =>
    v && typeof v === 'object' && hasValue(v.el_id),
  [FieldTypes.F_DRAG_MOLECULE]: ({ value: v }) =>
    v && typeof v === 'object' && hasValue(v.el_id),
  [FieldTypes.F_DRAG_SAMPLE]: ({ value: v }) =>
    v && typeof v === 'object' && hasValue(v.el_id),

  [FieldTypes.F_UPLOAD]: ({ value: v }) =>
    v && typeof v === 'object' && Array.isArray(v.files) && v.files.length > 0,
};

/**
 * Determines if a field is considered "filled" based on its type and configuration.
 */
const isFieldFilled = (field) => {
  const handler = FILL_HANDLERS[field.type];
  if (handler) return handler(field);

  // Default fallback for generic fields
  return hasValue(field.value);
};

/**
 * Calculates the completion percentage of a layer based on its visible fields.
 * completion = (fields with values) / (total visible fields)
 */
export const calculateLayerCompletion = (
  layer,
  allLayers,
  refElement = null,
) => {
  const fields = layer.fields || [];
  if (fields.length === 0) return 100;

  // 1. Identify all fields that are actually visible
  const visibleFields = fields.filter((field) => {
    const [isVisible] = isFieldEffectivelyVisible(
      field,
      layer,
      allLayers,
      new Set(),
      refElement,
    );
    return isVisible;
  });

  const visibleCount = visibleFields.length;
  if (visibleCount === 0) return 100;

  // 2. Count how many of the visible fields are filled
  const filledCount = visibleFields.filter(isFieldFilled).length;

  return Math.round((filledCount / visibleCount) * 100);
};

/**
 * Calculates the completion percentage of a group based on its layers.
 */
export const calculateGroupCompletion = (
  groupLayers,
  allLayers,
  refElement = null,
) => {
  if (groupLayers.length === 0) return 0;

  const totalCompletion = groupLayers.reduce((acc, layer) => {
    return acc + calculateLayerCompletion(layer, allLayers, refElement);
  }, 0);

  return Math.round(totalCompletion / groupLayers.length);
};
