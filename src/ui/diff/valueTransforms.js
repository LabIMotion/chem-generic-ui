/**
 * Utilities for transforming values to user-friendly display formats
 */

import { TYPE_TRANSFORMS, HEADER_COLOR_TRANSFORMS, HEADER_TEXT_STYLE_TRANSFORMS } from '@ui/diff/diffConstants.js';

/**
 * Transformations for display
 * @param {any} value - The value to transform
 * @param {string} key - The property key
 * @param {string} fullKey - The full property path
 * @returns {any} Transformed value for display
 */
export const transformValueForDisplay = (value, key, fullKey) => {
  if (key === 'type' && typeof value === 'string') {
    return TYPE_TRANSFORMS[value] || value;
  }

  if (key === 'header_color' && typeof value === 'string') {
    return HEADER_COLOR_TRANSFORMS[value] || value;
  }

  if (key === 'text_style' && typeof value === 'string') {
    return HEADER_TEXT_STYLE_TRANSFORMS[value] || value;
  }

  if (key === 'workflow' && typeof value === 'boolean') {
    return value ? 'enabled' : 'disabled';
  }

  if (['has_its_own_row', 'required'].includes(key) && typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  // Add more transformations here as needed based on renamed properties
  // Note: Use the renamed property names (after propsToRename transformation)

  return value;
};

/**
 * Format values for display in the grid
 * @param {any} val - Value to format
 * @param {boolean} isPrimitive - Whether the value is primitive
 * @param {string} key - Property key
 * @param {string} parentKey - Parent property key
 * @returns {string} Formatted value
 */
export const formatValue = (val, isPrimitive, key, parentKey) => {
  if (!isPrimitive) return '';
  if (val === null) return 'null';
  if (val === undefined) return '';

  // Special handling for layer objects - don't show the object content as a value
  if (parentKey === 'layers' && typeof val === 'object' && val !== null) {
    return '';
  }

  // Apply the same transformations as transformValueForDisplay
  const transformedValue = transformValueForDisplay(val, key, parentKey);

  if (typeof transformedValue === 'string') return transformedValue;
  return String(transformedValue);
};
