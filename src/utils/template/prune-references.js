/**
 * Utility functions for pruning references and maintaining data consistency
 * when deleting template entities (select options, fields, layers, etc.)
 */

import { FieldTypes } from 'generic-ui-core';

/**
 * Helper function to remove field references to a deleted select option.
 * Removes the option_layers property from fields that reference the deleted select option.
 */
export const removeFieldReferencesToSelectOption = (
  element,
  deletedSelectKey,
) => {
  const affectedFields = [];
  const layers = element?.properties_template?.layers || {};

  Object.keys(layers).forEach((layerKey) => {
    const layer = layers[layerKey];
    const fields = layer?.fields || [];

    fields.forEach((field) => {
      // Check if field is a select type and references the deleted select option
      if (
        field.type === FieldTypes.F_SELECT &&
        field.option_layers === deletedSelectKey
      ) {
        // Remove the option_layers property
        delete field.option_layers;
        affectedFields.push([layerKey, field.field]);
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
