/**
 * Diff calculation utilities using jsondiffpatch
 * Handles flattening nested JSON into grid-compatible rows
 */

import { create } from 'jsondiffpatch';
import { formatValue } from '@ui/diff/valueTransforms.js';

// Initialize jsondiffpatch with array handling
const jsondiffpatch = create({
  objectHash: (obj) => obj?.key || JSON.stringify(obj), // Match array items by "key"
  arrays: { detectMove: true },
});

/**
 * Determine if a change should be treated as a container
 * @param {string} change - Change type ('added', 'removed', 'modified')
 * @param {boolean} oldIsPrimitive - Whether old value is primitive
 * @param {boolean} newIsPrimitive - Whether new value is primitive
 * @param {string} parentKey - Parent property key
 * @param {string} key - Current property key
 * @param {any} oldVal - Old value
 * @param {any} newVal - New value
 * @returns {boolean} Whether this should be treated as a container
 */
const shouldTreatAsContainer = (change, oldIsPrimitive, newIsPrimitive, parentKey, key, oldVal, newVal) => {
  // Only apply container logic to added/removed non-primitive items
  if ((change !== 'added' && change !== 'removed') || (oldIsPrimitive && newIsPrimitive)) {
    return false;
  }

  // Treat all non-primitive values (objects and arrays) as containers
  return !oldIsPrimitive || !newIsPrimitive;
};

/**
 * Determine change type for a property
 * @param {any} oldVal - Old value
 * @param {any} newVal - New value
 * @param {any} keyDelta - jsondiffpatch delta for this key
 * @param {boolean} oldIsPrimitive - Whether old value is primitive
 * @param {boolean} newIsPrimitive - Whether new value is primitive
 * @param {string} parentKey - Parent property key
 * @param {string} key - Current property key
 * @returns {string} Change type: 'same', 'added', 'removed', or 'modified'
 */
const determineChangeType = (oldVal, newVal, keyDelta, oldIsPrimitive, newIsPrimitive, parentKey, key) => {
  let change = 'same';

  if (keyDelta !== undefined) {
    // There is a delta, so there are changes
    if (oldVal === undefined) {
      change = 'added';
    } else if (newVal === undefined) {
      change = 'removed';
    } else {
      change = 'modified';
    }
  } else if (oldVal !== newVal) {
    // No delta but primitive values are different (for primitive types)
    if (oldIsPrimitive && newIsPrimitive) {
      // Both are primitives and different
      if (oldVal === undefined) {
        change = 'added';
      } else if (newVal === undefined) {
        change = 'removed';
      } else {
        change = 'modified';
      }
    }
    // For objects/arrays, if no delta exists, they are considered the same
  }

  // Special handling for container objects/arrays: treat them as containers, not as added/removed items
  if (shouldTreatAsContainer(change, oldIsPrimitive, newIsPrimitive, parentKey, key, oldVal, newVal)) {
    change = 'modified';
  }

  return change;
};

/**
 * Flatten nested JSON into flat rows with indentation using jsondiffpatch
 * @param {Object} oldObj - Old JSON object
 * @param {Object} newObj - New JSON object
 * @param {string} parentKey - Parent key path
 * @param {number} level - Current nesting level
 * @returns {Array} Flat array of row data for the grid
 */
export const buildFlatData = (oldObj, newObj, parentKey = '', level = 0) => {
  const rows = [];
  const delta = jsondiffpatch.diff(oldObj || {}, newObj || {});

  // Preserve order: use newObj keys first (which should be ordered), then add any oldObj keys not in newObj
  const newObjKeys = Object.keys(newObj || {});
  const oldObjKeys = Object.keys(oldObj || {});
  const remainingOldKeys = oldObjKeys.filter(key => !newObjKeys.includes(key));
  const allKeys = [...newObjKeys, ...remainingOldKeys];

  allKeys.forEach((k) => {
    const oldVal = oldObj?.[k];
    const newVal = newObj?.[k];
    const fullKey = parentKey ? `${parentKey}.${k}` : k;
    const keyDelta = delta?.[k];

    // Check if both values are primitive (non-object)
    const oldIsPrimitive = oldVal === null || oldVal === undefined || typeof oldVal !== 'object';
    const newIsPrimitive = newVal === null || newVal === undefined || typeof newVal !== 'object';

    // Determine change type
    const change = determineChangeType(oldVal, newVal, keyDelta, oldIsPrimitive, newIsPrimitive, parentKey, k);

    // Create row data
    const row = {
      id: fullKey,
      key: k,
      parentKey: parentKey,
      fullKey: fullKey,
      level: level,
      oldValue: formatValue(oldVal, oldIsPrimitive, k, parentKey),
      newValue: formatValue(newVal, newIsPrimitive, k, parentKey),
      change,
      isParent: !oldIsPrimitive || !newIsPrimitive,
      // Store raw values for inline diff
      rawOldValue: oldVal,
      rawNewValue: newVal,
    };

    rows.push(row);

    // Handle nested object or array - only add children if values are objects
    if (!oldIsPrimitive || !newIsPrimitive) {
      if (Array.isArray(oldVal) || Array.isArray(newVal)) {
        // Handle arrays
        const maxLength = Math.max(
          Array.isArray(oldVal) ? oldVal.length : 0,
          Array.isArray(newVal) ? newVal.length : 0,
        );

        for (let i = 0; i < maxLength; i++) {
          const oldItem = Array.isArray(oldVal) ? oldVal[i] : undefined;
          const newItem = Array.isArray(newVal) ? newVal[i] : undefined;
          rows.push(
            ...buildFlatData(
              { [i]: oldItem },
              { [i]: newItem },
              fullKey,
              level + 1,
            ),
          );
        }
      } else {
        // Handle objects
        rows.push(
          ...buildFlatData(oldVal || {}, newVal || {}, fullKey, level + 1),
        );
      }
    }
  });

  return rows;
};
