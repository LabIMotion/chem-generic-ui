/**
 * Utility functions for pruning references and maintaining data consistency
 * when deleting template entities (select options, fields, layers, etc.)
 */

import { v4 as uuid } from 'uuid';
import { FieldTypes } from 'generic-ui-core';

/**
 * Ensure every table sub_field (column) carries a unique `id`.
 *
 * Table cells live in `sub_values` keyed by the sub_field `id`, and
 * Reload/remodel maps stored user data to the template by that same id. Two
 * columns sharing an id therefore collide: one column's cell overwrites the
 * other's (e.g. a formula column blanks a system-defined column's unit on
 * add-row). Legacy or imported templates can carry such duplicates.
 *
 * Keeps the FIRST occurrence of each id and re-mints a fresh id for every later
 * duplicate. Designer/template side ONLY — never call this on user runtime,
 * where the id must stay stable for version mapping. Returns a NEW array (input
 * is not mutated); non-array input and already-unique input are returned as-is.
 */
export const dedupeSubFieldIds = (subFields) => {
  if (!Array.isArray(subFields)) return subFields;
  const seen = new Set();
  return subFields.map((sf) => {
    const id = sf?.id;
    if (id && seen.has(id)) {
      return { ...sf, id: uuid() };
    }
    if (id) seen.add(id);
    return sf;
  });
};

// Extract encoded slot keys from metadata.registries entries of shape "ns:enc".
const encKeysFromRegistries = (metadata) => {
  const regs = metadata?.registries;
  if (!Array.isArray(regs)) return [];
  return regs
    .map((r) =>
      typeof r === 'string' && r.includes(':') ? r.split(':')[1] : null,
    )
    .filter((k) => typeof k === 'string' && k.length > 0);
};

/**
 * Remove entries keyed by `deletedLayerKey` from every registry slot on metadata.
 * Mutates `metadata` in place. Safe if metadata or any slot is missing.
 */
export const removeLayerFromRegistrySlots = (metadata, deletedLayerKey) => {
  if (!metadata) return;
  encKeysFromRegistries(metadata).forEach((encKey) => {
    const slot = metadata[encKey];
    if (!Array.isArray(slot)) return;
    const next = slot.filter((e) => e?.key !== deletedLayerKey);
    if (next.length > 0) metadata[encKey] = next;
    else delete metadata[encKey];
  });
};

/**
 * Keep only registry slot entries whose `.key` is in `surviveSet`.
 * Mutates `metadata` in place. Used after reload to drop orphan consumer data.
 */
export const filterRegistrySlotsByLayerKeys = (metadata, surviveSet) => {
  if (!metadata) return;
  encKeysFromRegistries(metadata).forEach((encKey) => {
    const slot = metadata[encKey];
    if (!Array.isArray(slot)) return;
    const next = slot.filter((e) => e && surviveSet.has(e.key));
    if (next.length > 0) metadata[encKey] = next;
    else delete metadata[encKey];
  });
};

/**
 * Defensive reconciliation pass for end-user generic documents.
 * Drops metadata references to layer keys that no longer exist in
 * `generic.properties.layers`. Covers:
 *   - metadata.groups[].layers[]      (unknown keys stripped; empty groups dropped)
 *   - metadata.restrict[*].cond[]     (conds to unknown layers stripped; empty entries dropped)
 *   - metadata[encKey] registry slots (entries with unknown .key stripped)
 *   - layer.cond_fields[]             (conds to unknown layers stripped)
 *   - layer.fields[].cond_fields[]    (conds to unknown layers stripped)
 * Mutates `generic` in place. Safe to call on save, after add/remove, or on load.
 */
export const reconcileMetadataOnSave = (generic) => {
  if (!generic) return generic;
  const layers = generic?.properties?.layers || {};
  const metadata = generic?.metadata;
  const surviving = new Set(Object.keys(layers));

  filterRegistrySlotsByLayerKeys(metadata, surviving);
  if (!metadata) return generic;

  if (Array.isArray(metadata.groups)) {
    const emptyGroupIds = [];
    const nextGroups = [];
    metadata.groups.forEach((g) => {
      if (!g || !Array.isArray(g.layers)) {
        nextGroups.push(g);
        return;
      }
      const kept = g.layers.filter((k) => surviving.has(k));
      if (kept.length > 0) {
        g.layers = kept;
        nextGroups.push(g);
      } else {
        emptyGroupIds.push(g.id);
      }
    });
    if (nextGroups.length > 0) {
      metadata.groups = nextGroups;
    } else {
      delete metadata.groups;
    }
    if (emptyGroupIds.length > 0 && metadata.restrict) {
      emptyGroupIds.forEach((id) => delete metadata.restrict[id]);
    }
  }

  if (metadata.restrict && typeof metadata.restrict === 'object') {
    Object.keys(metadata.restrict).forEach((rk) => {
      const r = metadata.restrict[rk];
      if (r && Array.isArray(r.cond)) {
        r.cond = r.cond.filter((c) => surviving.has(c?.layer));
        if (r.cond.length === 0) delete metadata.restrict[rk];
      }
    });
    if (Object.keys(metadata.restrict).length === 0) {
      delete metadata.restrict;
    }
  }
  if (!metadata.groups) delete metadata.restrict;

  Object.values(layers).forEach((layerItem) => {
    const layer = layerItem;
    if (Array.isArray(layer?.cond_fields)) {
      layer.cond_fields = layer.cond_fields.filter((c) =>
        surviving.has(c?.layer),
      );
      if (layer.cond_fields.length === 0) {
        delete layer.cond_fields;
        delete layer.cond_operator;
      }
    }
    if (Array.isArray(layer?.fields)) {
      layer.fields.forEach((f) => {
        if (Array.isArray(f?.cond_fields)) {
          f.cond_fields = f.cond_fields.filter((c) => surviving.has(c?.layer));
          if (f.cond_fields.length === 0) {
            delete f.cond_fields;
            delete f.cond_operator;
          }
        }
      });
    }
  });

  return generic;
};

/**
 * Helper function to remove field references to a deleted select option.
 * Removes the option_layers property from fields that reference the deleted select option.
 * Also cleans up table sub_fields and sub_values that reference the deleted select option.
 */
export const removeFieldReferencesToSelectOption = (
  element,
  deletedSelectKey,
) => {
  const affectedFields = [];
  const layers = element?.properties_template?.layers || {};

  // Find the first remaining valid select option key to use as replacement
  const remainingKeys = Object.keys(
    element?.properties_template?.select_options || {},
  ).filter((k) => k !== deletedSelectKey);
  const replacementKey = remainingKeys[0] ?? undefined;

  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    const fields = layer?.fields || [];

    fields.forEach((field) => {
      // Check if top-level select/select-multi references the deleted option
      if (
        (field.type === FieldTypes.F_SELECT ||
          field.type === FieldTypes.F_SELECT_MULTI) &&
        field.option_layers === deletedSelectKey
      ) {
        if (replacementKey) {
          field.option_layers = replacementKey;
        } else {
          delete field.option_layers;
        }
        affectedFields.push([layerKey, field.field]);
      }

      // Check sub_fields of table fields for references to the deleted select option
      if (
        field.type === FieldTypes.F_TABLE &&
        Array.isArray(field.sub_fields)
      ) {
        field.sub_fields.forEach((subField) => {
          if (
            (subField.type === FieldTypes.F_SELECT ||
              subField.type === FieldTypes.F_SELECT_MULTI) &&
            subField.option_layers === deletedSelectKey
          ) {
            if (replacementKey) {
              subField.option_layers = replacementKey;
            } else {
              delete subField.option_layers;
            }
            // Clear stale sub_values for this sub_field column
            if (Array.isArray(field.sub_values)) {
              field.sub_values.forEach((row) => {
                if (subField.id in row) {
                  if (subField.type === FieldTypes.F_SELECT_MULTI) {
                    row[subField.id] = { value: [] };
                  } else {
                    row[subField.id] = { value: '' };
                  }
                }
              });
            }
          }
        });
      }
    });
  });

  return affectedFields;
};

/**
 * Helper function to remove restrictions that reference specific fields.
 */
export const removeRestrictionsReferencingFields = (
  element,
  affectedFields,
) => {
  if (!affectedFields || affectedFields.length === 0) return;

  const layers = element?.properties_template?.layers || {};
  const metadata = element?.metadata || {};

  // Create a set of affected field identifiers for quick lookup
  const affectedFieldSet = new Set(
    affectedFields.map(([layerKey, fieldKey]) => `${layerKey}.${fieldKey}`),
  );

  // 1. Clean up layer-level
  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    if (layer.cond_fields && Array.isArray(layer.cond_fields)) {
      layer.cond_fields = layer.cond_fields.filter((cond) => {
        const condIdentifier = `${cond.layer}.${cond.field}`;
        return !affectedFieldSet.has(condIdentifier);
      });

      // Remove empty cond_fields array
      if (layer.cond_fields.length === 0) {
        delete layer.cond_fields;
        delete layer.cond_operator;
      }
    }

    // Clean up field-level cond_fields (restrictions on individual fields)
    if (layer.fields && Array.isArray(layer.fields)) {
      layer.fields.forEach((field) => {
        if (field.cond_fields && Array.isArray(field.cond_fields)) {
          field.cond_fields = field.cond_fields.filter((cond) => {
            const condIdentifier = `${cond.layer}.${cond.field}`;
            return !affectedFieldSet.has(condIdentifier);
          });

          // Remove empty cond_fields array
          if (field.cond_fields.length === 0) {
            delete field.cond_fields;
            delete field.cond_operator;
          }
        }
      });
    }
  });

  // 2. Clean up other restrictions
  const restrict = metadata?.restrict || {};
  Object.keys(restrict).forEach((restrictKey) => {
    const restriction = restrict[restrictKey];
    if (restriction.cond && Array.isArray(restriction.cond)) {
      restriction.cond = restriction.cond.filter((cond) => {
        const condIdentifier = `${cond.layer}.${cond.field}`;
        return !affectedFieldSet.has(condIdentifier);
      });

      // Remove empty restriction objects
      if (restriction.cond.length === 0) {
        delete restrict[restrictKey];
      }
    }
  });

  // Clean up empty restrict object
  if (Object.keys(restrict).length === 0) {
    delete metadata.restrict;
  }
};

/**
 * Helper function to remove restrictions that reference a specific option value.
 * When an option is deleted from a select option list, remove restrictions that use that value.
 */
export const removeRestrictionsReferencingOptionValue = (
  element,
  selectOptionKey,
  deletedOptionValue,
) => {
  const layers = element?.properties_template?.layers || {};
  const metadata = element?.metadata || {};

  // Find all fields that use this select option
  const fieldsUsingSelectOption = [];
  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    const fields = layer?.fields || [];

    fields.forEach((field) => {
      if (
        field.type === FieldTypes.F_SELECT &&
        field.option_layers === selectOptionKey
      ) {
        fieldsUsingSelectOption.push([layerKey, field.field]);
      }
    });
  });

  if (fieldsUsingSelectOption.length === 0) return;

  // Create a set of affected field identifiers for quick lookup
  const affectedFieldSet = new Set(
    fieldsUsingSelectOption.map(
      ([layerKey, fieldKey]) => `${layerKey}.${fieldKey}`,
    ),
  );

  // 1. Clean up layer-level
  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    if (layer.cond_fields && Array.isArray(layer.cond_fields)) {
      layer.cond_fields = layer.cond_fields.filter((cond) => {
        const condIdentifier = `${cond.layer}.${cond.field}`;
        // Only remove if this field uses the select option AND has the deleted value
        return !(
          affectedFieldSet.has(condIdentifier) &&
          cond.value === deletedOptionValue
        );
      });

      // Remove empty cond_fields array
      if (layer.cond_fields.length === 0) {
        delete layer.cond_fields;
        delete layer.cond_operator;
      }
    }
  });

  // 2. Clean up other restrictions
  const restrict = metadata?.restrict || {};
  Object.keys(restrict).forEach((restrictKey) => {
    const restriction = restrict[restrictKey];
    if (restriction.cond && Array.isArray(restriction.cond)) {
      restriction.cond = restriction.cond.filter((cond) => {
        const condIdentifier = `${cond.layer}.${cond.field}`;
        // Only remove if this field uses the select option AND has the deleted value
        return !(
          affectedFieldSet.has(condIdentifier) &&
          cond.value === deletedOptionValue
        );
      });

      // Remove empty restriction objects
      if (restriction.cond.length === 0) {
        delete restrict[restrictKey];
      }
    }
  });

  // Clean up empty restrict object
  if (Object.keys(restrict).length === 0) {
    delete metadata.restrict;
  }
};

/**
 * Helper function to remove restrictions that reference a deleted layer.
 */
export const removeRestrictionsReferencingLayer = (
  element,
  deletedLayerKey,
) => {
  const layers = element?.properties_template?.layers || {};
  const metadata = element?.metadata || {};

  // 1. Clean up layer-level cond_fields
  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    if (layer.cond_fields && Array.isArray(layer.cond_fields)) {
      layer.cond_fields = layer.cond_fields.filter(
        (cond) => cond.layer !== deletedLayerKey,
      );

      // Remove empty cond_fields array
      if (layer.cond_fields.length === 0) {
        delete layer.cond_fields;
        delete layer.cond_operator;
      }
    }
  });

  // 2. Clean up other restrictions
  const restrict = metadata?.restrict || {};
  Object.keys(restrict).forEach((restrictKey) => {
    const restriction = restrict[restrictKey];
    if (restriction.cond && Array.isArray(restriction.cond)) {
      restriction.cond = restriction.cond.filter(
        (cond) => cond.layer !== deletedLayerKey,
      );

      // Remove empty restriction objects
      if (restriction.cond.length === 0) {
        delete restrict[restrictKey];
      }
    }
  });

  // Clean up empty restrict object
  if (Object.keys(restrict).length === 0) {
    delete metadata.restrict;
  }
};

/**
 * Helper function to remove a layer from groups.
 */
export const removeLayerFromGroups = (element, deletedLayerKey) => {
  const metadata = element?.metadata || {};
  const groups = metadata?.groups || [];
  const restrict = metadata?.restrict || {};

  // Track group IDs that become empty
  const emptyGroupIds = [];

  groups.forEach((group) => {
    if (group.layers && Array.isArray(group.layers)) {
      const index = group.layers.indexOf(deletedLayerKey);
      if (index !== -1) {
        group.layers.splice(index, 1);
      }

      // Track if group is now empty
      if (group.layers.length === 0) {
        emptyGroupIds.push(group.id);
      }
    }
  });

  // Remove empty groups
  metadata.groups = groups.filter(
    (group) => group.layers && group.layers.length > 0,
  );

  // Remove restrictions for empty groups
  emptyGroupIds.forEach((groupId) => {
    if (restrict[groupId]) {
      delete restrict[groupId];
    }
  });

  // Clean up empty properties
  if (metadata.groups.length === 0) {
    delete metadata.groups;
    delete metadata.restrict;
  }
};

/**
 * Helper function to remove stored field values that reference a deleted option.
 * Covers top-level F_SELECT, F_SELECT_MULTI fields, and table sub_values.
 */
export const removeFieldValuesReferencingDeletedOption = (
  element,
  selectOptionKey,
  deletedOptionValue,
) => {
  const layers = element?.properties_template?.layers || {};

  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    const fields = layer?.fields || [];

    fields.forEach((field) => {
      // Top-level F_SELECT: clear value if it matches the deleted option
      if (
        field.type === FieldTypes.F_SELECT &&
        field.option_layers === selectOptionKey &&
        field.value === deletedOptionValue
      ) {
        field.value = '';
      }

      // Top-level F_SELECT_MULTI: filter out the deleted option from stored sub_fields
      if (
        field.type === FieldTypes.F_SELECT_MULTI &&
        field.option_layers === selectOptionKey &&
        Array.isArray(field.sub_fields)
      ) {
        field.sub_fields = field.sub_fields.filter(
          (sf) => sf.value !== deletedOptionValue,
        );
      }

      // Table sub_values: clean sub-columns that reference the deleted option
      if (
        field.type === FieldTypes.F_TABLE &&
        Array.isArray(field.sub_fields)
      ) {
        field.sub_fields.forEach((subField) => {
          if (subField.option_layers !== selectOptionKey) return;

          if (Array.isArray(field.sub_values)) {
            field.sub_values.forEach((row) => {
              if (!(subField.id in row)) return;

              // F_SELECT sub-column: clear if value matches deleted option
              if (
                subField.type === FieldTypes.F_SELECT &&
                row[subField.id]?.value === deletedOptionValue
              ) {
                row[subField.id] = { value: '' };
              }

              // F_SELECT_MULTI sub-column: filter out the deleted option
              if (
                subField.type === FieldTypes.F_SELECT_MULTI &&
                Array.isArray(row[subField.id]?.value)
              ) {
                row[subField.id].value = row[subField.id].value.filter(
                  (v) => v !== deletedOptionValue,
                );
              }
            });
          }
        });
      }
    });
  });
};
