import { convertUnits } from 'generic-ui-core';

/**
 * `convertUnits` rounds to a number of *decimal places*, which is
 * magnitude-dependent: its default of 5 turns 1 ug -> g into 0, and even a
 * generous 12 turns 0.3 pmol -> mol and 0.07 eV -> J into 0. Ask it for
 * effectively no rounding instead (100 is the ceiling `toFixed` accepts).
 */
const CONVERT_DECIMALS = 100;

/**
 * Significant digits kept from the raw conversion. Rounding by significant
 * digits rather than decimal places is magnitude-independent, so small results
 * survive while IEEE-754 noise is still removed (0.07 u -> nkat stays 1.1669
 * rather than 1.1669000000000003). 14 rather than 15 because 15 leaves some of
 * that noise in place.
 */
const SIGNIFICANT_DIGITS = 14;

/**
 * Converts a value between two units of the same measurable quantity.
 *
 * Delegates to `convertUnits` (chem-units) rather than applying the `nm`
 * multipliers directly: quantities such as `temperature` carry no `nm` at all
 * and need offset conversion, which a ratio cannot express.
 *
 * Wraps `convertUnits` because a bare call is unsafe for field values:
 * - it returns `null` for '' / null / undefined / non-numeric input, while the
 *   empty value used throughout the field layer is '' (see `coerceFieldValue`)
 * - it rounds by decimal place, so any precision low enough to suppress
 *   floating-point noise also zeroes small results (see `CONVERT_DECIMALS`)
 *
 * The original value is returned whenever the conversion cannot be performed,
 * so a populated cell is never emptied by a failed lookup.
 *
 * @param {string|number} value - the value to convert
 * @param {string} fromUnit - unit key the value is currently expressed in
 * @param {string} toUnit - unit key to convert to
 * @param {string} quantity - measurable quantity, e.g. 'mass', 'temperature'
 * @returns {string|number} the converted value, or `value` when unconvertible
 */
export const convertMeasurementValue = (value, fromUnit, toUnit, quantity) => {
  if (value === '' || value === null || value === undefined) return value;
  if (fromUnit === toUnit || !fromUnit || !toUnit) return value;
  if (Number.isNaN(Number(value))) return value;
  const converted = convertUnits(
    quantity,
    value,
    fromUnit,
    toUnit,
    CONVERT_DECIMALS,
  );
  if (converted === null) return value;
  return Number(converted.toPrecision(SIGNIFICANT_DIGITS));
};
