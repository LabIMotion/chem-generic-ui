import { getUnitSystem } from 'generic-ui-core';
import extFields from '../components/temp/extFields.json';

function mergeExtFields() {
  try {
    const unitSystem = getUnitSystem();
    const array1 = Array.isArray(unitSystem) ? unitSystem : [];
    const array2 = Array.isArray(extFields) ? extFields : [];

    if (array1.length === 0 && array2.length === 0) {
      return [];
    }

    const mergedArray = Object.values(
      [...array1, ...array2].reduce((acc, obj) => {
        if (obj && typeof obj === 'object' && obj.field) {
          acc[obj.field] = { ...acc[obj.field], ...obj };
        }
        return acc;
      }, {})
    );

    // Sort the merged array by the 'field' property
    const sortedArray = mergedArray.sort((a, b) => {
      // Handle edge cases where field might be missing
      if (!a.field) return 1;
      if (!b.field) return -1;
      // Case-insensitive string comparison
      return a.field.toString().localeCompare(b.field.toString());
    });

    return sortedArray;
  } catch (error) {
    console.error('Error merging extension fields:', error);
    return [];
  }
}

function exterFields() {
  try {
    const fields = mergeExtFields();
    return { fields };
  } catch (error) {
    return { fields: [] };
  }
}

export default function mergeExt(isExternal = true) {
  const fields = exterFields();
  if (!isExternal) {
    return fields;
  }
  return { externalUnits: fields };
}
