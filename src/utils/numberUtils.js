import { bignumber, round, smaller, larger, number } from 'mathjs';
import numeral from 'numeral';

/**
 * Resolves a raw decimals config value to a valid non-negative integer.
 * Empty / undefined / null / negative all resolve to 0.
 * @param {number|string|null|undefined} decimals
 * @returns {number}
 */
export const resolveDecimals = (decimals) => {
  const d = parseInt(decimals, 10);
  return isNaN(d) || d < 0 ? 0 : d;
};

/**
 * Normalizes a string input to use '.' as decimal separator.
 * Rejects inputs with multiple separators or ambiguous mixed separators.
 * @param {string|number} val
 * @returns {string}
 */
export const normalizeDecimalSeparator = (val) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const commaCount = (str.match(/,/g) || []).length;
  const dotCount = (str.match(/\./g) || []).length;
  if (commaCount > 1 || dotCount > 1 || (commaCount > 0 && dotCount > 0)) {
    return '';
  }
  return str.replace(',', '.');
};

/**
 * Parses a value to a mathjs BigNumber, normalizing comma separators first.
 * Returns null if the value cannot be parsed or is not finite.
 * @param {string|number} val
 * @returns {BigNumber|null}
 */
export const parseDecimal = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const normalized = normalizeDecimalSeparator(val);
  if (normalized === '') return null;
  try {
    const bn = bignumber(normalized);
    return isFinite(number(bn)) ? bn : null;
  } catch {
    return null;
  }
};

/**
 * Applies precision (max decimal places) to a BigNumber value via rounding.
 * Empty / undefined / negative decimals resolve to 0.
 * @param {BigNumber} bn
 * @param {number|string|undefined} decimals
 * @returns {BigNumber}
 */
const applyPrecision = (bn, decimals) => round(bn, resolveDecimals(decimals));

/**
 * Converts a raw user input to a numeric value, applying precision rounding
 * and optional min/max clamping. Returns null for invalid or empty input.
 * decimals defaults to 0 when not provided (integer-only).
 * @param {string|number} val
 * @param {number|string|undefined} decimals - max decimal places; defaults to 0
 * @param {{ min?: number|string, max?: number|string }} [constraints]
 * @returns {number|null}
 */
export const parseNumberInput = (val, decimals, constraints = {}) => {
  const parsed = parseDecimal(val);
  if (parsed === null) return null;
  let result = applyPrecision(parsed, decimals);
  const { min, max } = constraints;
  if (max !== undefined && max !== null && max !== '') {
    const maxBn = parseDecimal(max);
    if (maxBn !== null && larger(result, maxBn))
      result = applyPrecision(maxBn, decimals);
  }
  if (min !== undefined && min !== null && min !== '') {
    const minBn = parseDecimal(min);
    if (minBn !== null && smaller(result, minBn))
      result = applyPrecision(minBn, decimals);
  }
  return number(result);
};

/**
 * Builds a numeral.js format string from a decimals config value.
 * Empty / undefined / negative decimals resolve to 0 → integer format '0'.
 * @param {number|string|undefined} decimals
 * @returns {string}
 */
export const buildNumeralFormat = (decimals) => {
  const d = resolveDecimals(decimals);
  if (d === 0) return '0';
  return `0.${'0'.repeat(d)}`;
};

/**
 * Formats a numeric value for display using numeral.js.
 * @param {number|string|null|undefined} value
 * @param {number|string|undefined} decimals
 * @returns {string}
 */
export const formatNumberDisplay = (value, decimals) => {
  if (value === null || value === undefined || value === '') return '';
  const fmt = buildNumeralFormat(decimals);
  return numeral(value).format(fmt);
};

/**
 * Validates a number value against the given constraints using mathjs BigNumber.
 * @param {number|string} value
 * @param {object} constraints - { decimals, min, max }
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateNumberValue = (value, constraints = {}) => {
  const { decimals, min, max } = constraints;
  const errors = [];

  if (value === null || value === undefined || value === '') {
    return { valid: true, errors };
  }

  const parsed = parseDecimal(value);
  if (parsed === null) {
    errors.push('Invalid numeric format.');
    return { valid: false, errors };
  }

  // decimals always validated; empty/undefined defaults to 0 (integer-only)
  const d = resolveDecimals(decimals);
  const rounded = applyPrecision(parsed, d);
  if (!parsed.equals(rounded)) {
    errors.push(`Value exceeds maximum ${d} decimal place(s).`);
  }

  // min/max: empty/undefined means no constraint (infinite)
  if (min !== undefined && min !== null && min !== '') {
    const minBn = parseDecimal(min);
    if (minBn !== null && smaller(parsed, minBn)) {
      errors.push(`Value must be at least ${min}.`);
    }
  }

  if (max !== undefined && max !== null && max !== '') {
    const maxBn = parseDecimal(max);
    if (maxBn !== null && larger(parsed, maxBn)) {
      errors.push(`Value must be at most ${max}.`);
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Returns false if both min and max are set and min > max (invalid range).
 */
export const isMinMaxValid = (min, max) => {
  const hasMin = min !== undefined && min !== null && min !== '';
  const hasMax = max !== undefined && max !== null && max !== '';
  if (!hasMin || !hasMax) return true;
  const minBn = parseDecimal(min);
  const maxBn = parseDecimal(max);
  if (minBn === null || maxBn === null) return true;
  return !larger(minBn, maxBn);
};

/**
 * Checks whether a number field value satisfies required + constraint validation.
 * Used in isValidated.
 * @param {number|string} value
 * @param {object} fieldConfig - { decimals, min, max }
 * @returns {boolean}
 */
export const isNumberFieldValid = (value, fieldConfig = {}) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return false;
  }
  const { valid } = validateNumberValue(value, fieldConfig);
  return valid;
};
