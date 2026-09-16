import { FieldTypes } from 'generic-ui-core';
import { writeFieldValue } from '@utils/layerFieldUtils';
import {
  notifyError,
  notifySuccess,
  notifyWarning,
} from '@utils/template/designer-message';

export const BASE_KEY = 'layer_deposition';
export const KEY_RE = /^layer_deposition(\.\d+)?$/;
export const TITLE = 'Layer stack';

export const ok = (msg) => notifySuccess(msg, TITLE);
export const warn = (msg) => notifyWarning(msg, TITLE);
export const err = (msg) => notifyError(msg, TITLE);

// Predefined fields are written back onto the layer; everything else goes
// into the registry slot on metadata.
const PREDEFINED = new Set(['id', 'name']);

// Writes `layer_name` from entry onto the layer. Returns list of
// "layerKey:fieldName" strings for fields that could not be written.
export const applyLayerFields = (layer, entry) => {
  const skipped = [];
  if (typeof entry.name === 'string' && entry.name !== '') {
    if (!writeFieldValue(layer, 'layer_name', FieldTypes.F_TEXT, entry.name)) {
      skipped.push(`${layer.key}:layer_name`);
    }
  }
  return skipped;
};

// Builds a registry slot entry from the non-predefined fields of a consumer
// entry. The layer key is attached as `.key` so slot entries survive reorder.
export const buildSlotEntry = (layerKey, entry) => {
  const slot = { key: layerKey };
  Object.keys(entry || {}).forEach((k) => {
    if (PREDEFINED.has(k)) return;
    slot[k] = entry[k];
  });
  return slot;
};
