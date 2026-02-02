/**
 * JSON preprocessing utilities for diff comparison
 * Handles property removal, renaming, and structure transformation
 */

import sortBy from 'lodash/sortBy';
import {
  PROPS_TO_REMOVE,
  PROPS_TO_RENAME,
  LAYER_PROPS_TO_REMOVE,
  REQUIRED_PROPS
} from '@ui/diff/diffConstants.js';

/**
 * Keep only required properties for each field type
 * @param {Object} field - Field object to filter
 * @returns {Object} Filtered field object
 */
export const keepRequiredFieldProperties = (field) => {
  if (!field || typeof field !== 'object' || !field.type) {
    return field;
  }

  // Get pre-computed required properties for this field type
  const requiredProps = REQUIRED_PROPS[field.type] || [];

  // Create new object with only required properties
  const filteredField = {};
  requiredProps.forEach(prop => {
    if (prop in field) {
      // Special handling for ontology object - only keep 'iri' property
      if (prop === 'ontology' && field[prop] && typeof field[prop] === 'object') {
        filteredField[prop] = { iri: field[prop].iri };
      } else {
        filteredField[prop] = field[prop];
      }
    }
  });

  return filteredField;
};

/**
 * Process table type fields with sub_fields preprocessing
 * @param {Object} field - Table field to process
 * @param {Array} layerOrder - Layer ordering for consistency
 * @returns {Object} Processed field
 */
export const processTableField = (field, layerOrder = null) => {
  if (!field || typeof field !== 'object') {
    return field;
  }

  const fieldCopy = { ...field };

  // Process sub_fields array if it exists
  if (fieldCopy.sub_fields && Array.isArray(fieldCopy.sub_fields)) {
    fieldCopy.sub_fields = fieldCopy.sub_fields.map(subField => {
      if (subField && typeof subField === 'object') {
        // Apply property filtering to sub-field
        let processedSubField = keepRequiredFieldProperties(subField);

        return preprocessJson(processedSubField, layerOrder);
      }
      return preprocessJson(subField, layerOrder);
    });
  }

  return preprocessJson(fieldCopy, layerOrder);
};

/**
 * Main JSON preprocessing function
 * Removes specified properties and renames others throughout the structure
 * @param {Object|Array} json - JSON to preprocess
 * @param {Array} layerOrder - Optional layer ordering for consistency
 * @returns {Object|Array} Preprocessed JSON
 */
export const preprocessJson = (json, layerOrder = null) => {
  if (!json || typeof json !== 'object') return json;

  // Handle arrays
  if (Array.isArray(json)) {
    return json.map((item) => preprocessJson(item, layerOrder));
  }

  // Sort layers by position if layers exist, or use provided layer order
  if (json.layers && typeof json.layers === 'object' && !Array.isArray(json.layers)) {
    if (layerOrder && layerOrder.length > 0) {
      // Use provided layer order (from newJson)
      const orderedLayers = {};

      // First, add layers in the provided order
      layerOrder.forEach(layerKey => {
        if (json.layers[layerKey]) {
          orderedLayers[layerKey] = json.layers[layerKey];
        }
      });

      // Then add any remaining layers that weren't in the provided order
      Object.keys(json.layers).forEach(layerKey => {
        if (!(layerKey in orderedLayers)) {
          orderedLayers[layerKey] = json.layers[layerKey];
        }
      });

      json = { ...json, layers: orderedLayers };
    } else {
      // Default: sort by position
      const sortedEntries = sortBy(Object.entries(json.layers), '[1].position');
      json = { ...json, layers: Object.fromEntries(sortedEntries) };
    }
  }

  const cleaned = {};

  for (const [key, value] of Object.entries(json)) {
    // Skip properties that should be removed (only at first level)
    if (PROPS_TO_REMOVE.includes(key)) {
      continue;
    }

    // Determine the new key name (rename if needed)
    const newKey = PROPS_TO_RENAME[key] || key;

    if (key === 'select_options' && value && typeof value === 'object' && !Array.isArray(value)) {
      // Transform select_options structure
      cleaned[newKey] = transformSelectOptions(value, layerOrder);
    } else if (key === 'layers' && value && typeof value === 'object' && !Array.isArray(value)) {
      // Transform layers structure
      cleaned[newKey] = transformLayers(value, layerOrder);
    } else {
      // Recursively process nested objects/arrays and rename properties
      cleaned[newKey] = preprocessJson(value, layerOrder);
    }
  }

  return cleaned;
};

/**
 * Transform select_options structure
 * @param {Object} selectOptions - Select options to transform
 * @param {Array} layerOrder - Layer ordering
 * @returns {Object} Transformed select options
 */
const transformSelectOptions = (selectOptions, layerOrder) => {
  const transformedSelectOptions = {};

  for (const [optionKey, optionValue] of Object.entries(selectOptions)) {
    if (optionValue && typeof optionValue === 'object' && optionValue.options && Array.isArray(optionValue.options)) {
      // Extract the options array directly and recursively process it
      transformedSelectOptions[optionKey] = preprocessJson(optionValue.options, layerOrder);
    } else {
      // Keep as-is but recursively process if it's an object/array
      transformedSelectOptions[optionKey] = preprocessJson(optionValue, layerOrder);
    }
  }

  return transformedSelectOptions;
};

/**
 * Transform layers structure
 * @param {Object} layers - Layers to transform
 * @param {Array} layerOrder - Layer ordering
 * @returns {Object} Transformed layers
 */
const transformLayers = (layers, layerOrder) => {
  const transformedLayers = {};

  for (const [layerKey, layerValue] of Object.entries(layers)) {
    if (layerValue && typeof layerValue === 'object' && !Array.isArray(layerValue)) {
      // Remove specified properties from layer object and recursively process
      const layerCopy = { ...layerValue };
      LAYER_PROPS_TO_REMOVE.forEach((prop) => {
        if (prop in layerCopy) delete layerCopy[prop];
      });

      // Process fields array if it exists
      if (layerCopy.fields && Array.isArray(layerCopy.fields)) {
        layerCopy.fields = layerCopy.fields.map(field => {
          if (field && typeof field === 'object' && field.type) {
            // Step 1: Keep only required properties based on field type
            let processedField = keepRequiredFieldProperties(field);

            // Step 2: Apply table-specific processing if type is 'table'
            if (['input-group', 'table'].includes(field.type)) {
              return processTableField(processedField, layerOrder);
            }

            return preprocessJson(processedField, layerOrder);
          }
          return preprocessJson(field, layerOrder);
        });
      }

      transformedLayers[layerKey] = preprocessJson(layerCopy, layerOrder);
    } else {
      // Keep as-is but recursively process if it's an object/array
      transformedLayers[layerKey] = preprocessJson(layerValue, layerOrder);
    }
  }

  return transformedLayers;
};
