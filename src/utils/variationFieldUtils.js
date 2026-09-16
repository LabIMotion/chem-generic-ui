import { genUnits } from 'generic-ui-core';

// Field types whose value can be captured as a single variation cell.
export const VARIATION_FIELD_TYPES = new Set([
  'integer',
  'number',
  'select',
  'system-defined',
  'text',
  'date',
  'datetime',
  'select-multi',
]);

export const isVariationFieldType = (field) =>
  field &&
  typeof field.type === 'string' &&
  VARIATION_FIELD_TYPES.has(field.type);

const ENTRY_PREFIX = {
  layer: 'layer',
  field: 'field',
};

// Encodes a (layerKey, fieldKey) pair into a single addressable property key.
export const encodePropertyKey = (layerKey, fieldKey) =>
  `${ENTRY_PREFIX.layer}${layerKey}${ENTRY_PREFIX.field}${fieldKey}`;

export const decodePropertyKey = (key) => {
  if (typeof key !== 'string') return null;
  const match = key.match(/^layer([^]+?)field(.+)$/);
  if (!match) return null;
  return { layerKey: match[1], fieldKey: match[2] };
};

const selectOptionsForField = (field, selectOptionsPool) => {
  if (!field || !selectOptionsPool || !field.option_layers) return null;
  if (field.type !== 'select' && field.type !== 'select-multi') return null;
  const layer = selectOptionsPool[field.option_layers];
  const options = layer && Array.isArray(layer.options) ? layer.options : null;
  if (!options || options.length === 0) return null;
  return options
    .filter((o) => o && o.key !== undefined && o.key !== null && o.key !== '')
    .map((o) => ({ key: String(o.key), label: o.label || String(o.key) }));
};

const unitsForField = (field) => {
  if (!field) return null;
  if (field.type !== 'system-defined') return null;
  const quantity =
    field.option_layers ||
    field.generic_quantity ||
    (field.generic_sub_field && field.generic_sub_field.generic_quantity);
  if (!quantity) return null;
  const configs = genUnits(quantity) || [];
  if (!configs || configs.length < 1) return null;
  const units = configs.map((c) => c.key).filter(Boolean);
  if (units.length === 0) return null;
  return {
    quantity,
    units,
    configs,
    defaultUnit: field.value_system || units[0],
  };
};

// Variation-eligible field options for an element klass, keyed by encoded
// property key. Drives the property columns.
export const listLayerFieldOptions = (elementKlass) => {
  const release = elementKlass && elementKlass.properties_release;
  const layers = (release && release.layers) || {};
  const selectOptionsPool = (release && release.select_options) || {};
  const options = [];
  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    const layerLabel = layer.label || layerKey;
    (layer.fields || []).forEach((field) => {
      if (!field || !field.field) return;
      if (!isVariationFieldType(field)) return;
      const fieldLabel = field.label || field.field;
      options.push({
        key: encodePropertyKey(layerKey, field.field),
        layerKey,
        fieldKey: field.field,
        layerLabel,
        fieldLabel,
        label: `${layerLabel} › ${fieldLabel}`,
        fieldType: field.type,
        units: unitsForField(field),
        selectOptions: selectOptionsForField(field, selectOptionsPool),
      });
    });
  });
  return options;
};

// All layers defined on an element type, regardless of whether they contain
// variation-eligible fields.
export const listElementLayers = (elementKlass) => {
  const release = elementKlass && elementKlass.properties_release;
  const layers = (release && release.layers) || {};
  return Object.keys(layers).map((layerKey) => ({
    layerKey,
    layerLabel: layers[layerKey].label || layerKey,
  }));
};

// Variation-eligible field options for a segment klass.
export const listSegmentFieldOptions = (segmentKlass) => {
  const release = segmentKlass && segmentKlass.properties_release;
  const layers = (release && release.layers) || {};
  const selectOptionsPool = (release && release.select_options) || {};
  const options = [];
  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    const layerLabel = layer.label || layerKey;
    (layer.fields || []).forEach((field) => {
      if (!field || !field.field) return;
      if (!isVariationFieldType(field)) return;
      const fieldLabel = field.label || field.field;
      options.push({
        layerKey,
        fieldKey: field.field,
        layerLabel,
        fieldLabel,
        label: `${layerLabel} › ${fieldLabel}`,
        fieldType: field.type,
        units: unitsForField(field),
        selectOptions: selectOptionsForField(field, selectOptionsPool),
      });
    });
  });
  return options;
};
