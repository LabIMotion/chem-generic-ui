import { showProperties } from 'generic-ui-core';

/**
 * Determines if a field is effectively visible.
 * A field is visible if:
 * 1. It satisfies its own visible conditions (restriction).
 * 2. AND all fields it depends on are also effectively visible.
 */
export const isFieldEffectivelyVisible = (
  field,
  layer,
  allLayers,
  checkedFields = new Set(),
  refElement = null,
) => {
  const fieldKey = `${layer.key}.${field.field}`;
  if (checkedFields.has(fieldKey)) return [false, field.label];
  checkedFields.add(fieldKey);

  const [show, label] = showProperties(field, allLayers, refElement);
  if (!show) return [false, label];

  if (field.cond_fields && field.cond_fields.length > 0) {
    for (const cond of field.cond_fields) {
      const depLayer = allLayers[cond.layer];
      if (depLayer) {
        const depField = (depLayer.fields || []).find(
          (f) => f.field === cond.field,
        );
        if (depField) {
          const [depVisible] = isFieldEffectivelyVisible(
            depField,
            depLayer,
            allLayers,
            checkedFields,
            refElement,
          );
          if (!depVisible) {
            return [false, label];
          }
        }
      }
    }
  }
  return [true, label];
};

/**
 * Check if an item (group or layer) is effectively visible.
 * Return [show, label] where show is a boolean(visible or not) and label is a string(alternative text).
 */
export const isItemEffectivelyVisible = (item, allLayers, refElement = null) => {
  let transformedRestriction = item;
  // Transform group restriction to expected format
  if (item.cond && !item.cond_fields) {
    transformedRestriction = {
      cond_fields: item.cond.map((c) => ({
        ...c,
        value: c.eq || c.value,
      })),
      cond_operator: item.op,
    };
  }

  const [show, label] = showProperties(transformedRestriction, allLayers, refElement);
  if (!show) return [false, label];

  // For groups/layers, also check if the fields they depend on are visible
  if (transformedRestriction.cond_fields) {
    for (const cond of transformedRestriction.cond_fields) {
      const depLayer = allLayers[cond.layer];
      if (depLayer) {
        const depField = (depLayer.fields || []).find(
          (f) => f.field === cond.field,
        );
        if (depField) {
          const [depVisible] = isFieldEffectivelyVisible(
            depField,
            depLayer,
            allLayers,
            new Set(),
            refElement,
          );
          if (!depVisible) {
            return [false, label];
          }
        }
      }
    }
  }
  return [true, label];
};
