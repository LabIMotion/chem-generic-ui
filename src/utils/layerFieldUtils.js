import { FieldTypes } from 'generic-ui-core';
import { parseNumberInput } from '@utils/numberUtils';

export const findField = (layer, fieldName, fieldType) =>
  (layer?.fields || []).find(
    (f) => f.field === fieldName && f.type === fieldType,
  );

export const readFieldValue = (layer, fieldName, fieldType) =>
  findField(layer, fieldName, fieldType)?.value;

// Returns true if the field value was written, false if the field is missing
// or the value was rejected (e.g. out-of-range number).
export const writeFieldValue = (layer, fieldName, fieldType, value) => {
  const fieldObj = findField(layer, fieldName, fieldType);
  if (!fieldObj) return false;
  if (fieldType === FieldTypes.F_NUMBER) {
    const decimals = fieldObj.numeric?.decimals;
    const constraints = {
      min: fieldObj.numeric?.min,
      max: fieldObj.numeric?.max,
    };
    const parsed = parseNumberInput(value, decimals, constraints);
    if (parsed === null) return false;
    fieldObj.value = parsed;
    return true;
  }
  fieldObj.value = value;
  return true;
};
