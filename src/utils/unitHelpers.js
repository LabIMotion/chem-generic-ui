import Ajv from 'ajv';
import { unitConversion } from 'generic-ui-core';
import sysUnitSch from '@/schemas/json/system-unit.json';

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(sysUnitSch);

/**
 * Validates a generic object against the system unit schema
 */
export const validateInput = (input) => {
  if (!input) return false;
  return validate(input);
};

/**
 * Gets validation errors from the last validation
 */
export const getValidationErrors = () => validate.errors;

/**
 * Converts values from one unit system to another
 */
export const convertValues = (measurableQuantity, newUnit, values) => {
  return (values || []).map((v) =>
    v === '' || v === undefined
      ? ''
      : unitConversion(measurableQuantity, newUnit, v)
  );
};
