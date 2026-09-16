import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import { FieldTypes, orgLayerObject } from 'generic-ui-core';
import { reformCondFields } from '@components/tools/orten';
import { findField, readFieldValue } from '@utils/layerFieldUtils';
import { getGroupByLayer } from '@utils/template/group-handler';
import { reconcileMetadataOnSave } from '@utils/template/prune-references';
import {
  BASE_KEY,
  KEY_RE,
  applyLayerFields,
  buildSlotEntry,
  ok,
  warn,
  err,
} from '@components/regComps/layerStackSchema';

const isGrouped = (metadata, key) => !!getGroupByLayer(metadata?.groups, key);

const readSlot = (metadata, encKey) => {
  if (!encKey) return [];
  const arr = metadata?.[encKey];
  return Array.isArray(arr) ? arr : [];
};

const indexSlotByKey = (slot) => {
  const out = {};
  slot.forEach((s) => {
    if (s && typeof s.key === 'string') out[s.key] = s;
  });
  return out;
};

const extract = (properties, metadata, encKey) => {
  const layers = properties?.layers || {};
  const base = layers[BASE_KEY];
  if (!base) return null;
  if (isGrouped(metadata, BASE_KEY)) return null;
  if (!findField(base, 'layer_name', FieldTypes.F_TEXT)) return null;

  const depoLayers = Object.values(layers).filter(
    (l) => l && typeof l.key === 'string' && KEY_RE.test(l.key),
  );
  const sorted = sortBy(depoLayers, ['position', 'wf_position']);
  const slotByKey = indexSlotByKey(readSlot(metadata, encKey));

  return sorted.reduce((acc, layer) => {
    if (!findField(layer, 'layer_name', FieldTypes.F_TEXT)) return acc;
    const nameVal = readFieldValue(layer, 'layer_name', FieldTypes.F_TEXT);
    const entry = {
      id: layer.key,
      name: typeof nameVal === 'string' ? nameVal : '',
    };
    const extras = slotByKey[layer.key] || {};
    Object.keys(extras).forEach((k) => {
      if (k === 'key') return;
      entry[k] = extras[k];
    });
    acc.push(entry);
    return acc;
  }, []);
};

const merge = (properties, updatedData, metadata, encKey) => {
  const list = Array.isArray(updatedData) ? updatedData : [];
  if (list.length === 0) {
    return { properties, metadata, notify: null };
  }

  const origBase = properties?.layers?.[BASE_KEY];
  if (!origBase) {
    return {
      properties,
      metadata,
      notify: err(`Base layer "${BASE_KEY}" is not defined; update skipped.`),
    };
  }
  if (!findField(origBase, 'layer_name', FieldTypes.F_TEXT)) {
    return {
      properties,
      metadata,
      notify: err('Base layer has no "layer_name" field; update skipped.'),
    };
  }
  if (isGrouped(metadata, BASE_KEY)) {
    return {
      properties,
      metadata,
      notify: err(
        `Base layer "${BASE_KEY}" must be ungrouped; update skipped.`,
      ),
    };
  }

  const baseEntries = list.filter((e) => e && e.id === BASE_KEY);
  if (baseEntries.length > 1) {
    return {
      properties,
      metadata,
      notify: err(
        'Updated data contains more than one base layer entry; rejected.',
      ),
    };
  }
  if (baseEntries.length === 0) {
    return {
      properties,
      metadata,
      notify: err('Updated data must include the base layer; update skipped.'),
    };
  }

  const updated = cloneDeep(properties);
  const updatedLayers = updated.layers;
  const basePosition = origBase.position;
  const baseOrigWfPos = origBase.wf_position || 0;

  const nonDepoBefore = [];
  const nonDepoAfter = [];
  Object.values(updatedLayers).forEach((lyr) => {
    if (!lyr || lyr.position !== basePosition) return;
    if (KEY_RE.test(lyr.key)) return;
    if ((lyr.wf_position || 0) < baseOrigWfPos) nonDepoBefore.push(lyr);
    else nonDepoAfter.push(lyr);
  });
  nonDepoBefore.sort((a, b) => (a.wf_position || 0) - (b.wf_position || 0));
  nonDepoAfter.sort((a, b) => (a.wf_position || 0) - (b.wf_position || 0));

  // Existing non-base depo layers, keyed for id-match semantics.
  const existingDepoByKey = {};
  let maxSuffix = 0;
  Object.keys(updatedLayers).forEach((k) => {
    if (!KEY_RE.test(k) || k === BASE_KEY) return;
    existingDepoByKey[k] = updatedLayers[k];
    const m = k.match(/^layer_deposition\.(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > maxSuffix) maxSuffix = n;
    }
  });

  // Wipe non-base depo layers; id-matched ones get re-added below with preserved keys.
  Object.keys(updatedLayers).forEach((k) => {
    if (KEY_RE.test(k) && k !== BASE_KEY) delete updatedLayers[k];
  });

  const depoBlock = [];
  const slotBlock = [];
  const skipped = [];
  const touchedKeys = new Set();
  list.forEach((entry) => {
    if (!entry) return;
    let layerKey;
    let layer;
    if (entry.id === BASE_KEY) {
      layer = cloneDeep(origBase);
      layerKey = BASE_KEY;
    } else if (typeof entry.id === 'string' && existingDepoByKey[entry.id]) {
      // Rule 3: id matches existing non-base layer → update in place.
      layer = cloneDeep(existingDepoByKey[entry.id]);
      layerKey = entry.id;
    } else {
      // Rule 2: unknown id (or missing id) → new layer; assign next suffix.
      maxSuffix += 1;
      layerKey = `${BASE_KEY}.${maxSuffix}`;
      layer = cloneDeep(origBase);
      layer.key = layerKey;
    }
    touchedKeys.add(layerKey);
    skipped.push(...applyLayerFields(layer, entry));
    if (layerKey !== BASE_KEY && !existingDepoByKey[layerKey]) {
      layer.fields = reformCondFields(layer, BASE_KEY);
    }
    depoBlock.push(layer);
    slotBlock.push(buildSlotEntry(layerKey, entry));
  });

  // Rule 4: any existing non-base layer NOT referenced in the consumer list is removed.
  // The wipe above already dropped them; depoBlock only re-adds touched ones.
  depoBlock.forEach((l) => {
    updatedLayers[l.key] = l;
  });

  const newGroupOrdered = [...nonDepoBefore, ...depoBlock, ...nonDepoAfter];
  newGroupOrdered.forEach((l, idx) => {
    l.wf_position = idx;
  });

  const allLayers = sortBy(Object.values(updatedLayers), [
    'position',
    'wf_position',
  ]);
  updated.layers = orgLayerObject(allLayers);

  const nextMetadata = { ...(metadata || {}) };
  if (encKey) {
    if (slotBlock.length > 0) {
      nextMetadata[encKey] = slotBlock;
    } else {
      delete nextMetadata[encKey];
    }
  }

  // Drop dangling refs (groups, restrict, cond_fields) for removed non-base layers.
  reconcileMetadataOnSave({ properties: updated, metadata: nextMetadata });

  const notify =
    skipped.length > 0
      ? warn(
          `Applied with ${skipped.length} field(s) skipped: ${skipped.join(', ')}.`,
        )
      : ok('Layer stack data updated.');

  return { properties: updated, metadata: nextMetadata, notify };
};

export default { extract, merge };
