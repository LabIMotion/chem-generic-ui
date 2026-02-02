import sortBy from 'lodash/sortBy';
import { reUnit, FieldTypes, orgLayerObject } from 'generic-ui-core';

/**
 * Reorder positions sequentially for groups and layers
 * Assigns sequential positions (0, 1, 2, 3...) to groups and ungrouped layers
 * based on their current position order.
 * Grouped layers inherit their parent group's position.
 * Returns updated positions
 */
export const reorderPositions = (layersObj, metadata) => {
  const groups = metadata.groups || [];
  const allLayers = { ...layersObj };

  // Get layers that belong to groups
  const groupedLayersSet = new Set();
  groups.forEach((group) => {
    group.layers?.forEach((layerKey) => groupedLayersSet.add(layerKey));
  });

  // Get ungrouped layers
  const ungroupedLayers = Object.values(allLayers).filter(
    (layer) => !groupedLayersSet.has(layer.key),
  );

  // Create mixed array sorted by current position
  const items = [
    ...groups.map((group) => ({
      type: 'group',
      data: group,
      position: group.position || 0,
    })),
    ...ungroupedLayers.map((layer) => ({
      type: 'layer',
      data: layer,
      position: layer.position || 0,
    })),
  ];
  const sortedItems = sortBy(items, 'position');

  // Reassign sequential positions
  const updatedGroups = [...groups];
  const updatedLayers = { ...allLayers };

  sortedItems.forEach((item, index) => {
    if (item.type === 'group') {
      const groupIndex = updatedGroups.findIndex((g) => g.id === item.data.id);
      if (groupIndex !== -1) {
        updatedGroups[groupIndex] = {
          ...updatedGroups[groupIndex],
          position: index,
        };
        // Update grouped layers to have the same position as their group
        updatedGroups[groupIndex].layers?.forEach((layerKey) => {
          if (updatedLayers[layerKey]) {
            updatedLayers[layerKey] = {
              ...updatedLayers[layerKey],
              position: index,
            };
          }
        });
      }
    } else if (item.type === 'layer') {
      const layerKey = item.data.key;
      if (updatedLayers[layerKey]) {
        updatedLayers[layerKey] = {
          ...updatedLayers[layerKey],
          position: index,
        };
      }
    }
  });

  return {
    layers: updatedLayers,
    metadata:
      updatedGroups.length > 0 ? { ...metadata, groups: updatedGroups } : {},
  };
};

export const handleSaveSorting = (_element) => {
  const element = _element;
  Object.keys(element.properties_template.layers).forEach((key) => {
    const layer = element.properties_template.layers[key];
    let sortedFields = layer?.fields || [];
    (sortedFields || []).forEach((f, idx) => {
      const fd = f;
      fd.position = idx + 1;
      if (fd.type === FieldTypes.F_SYSTEM_DEFINED) {
        fd.option_layers = reUnit(fd.option_layers);
      }
      fd.required = [FieldTypes.F_INTEGER, FieldTypes.F_TEXT].includes(fd.type)
        ? fd.required
        : false;
      fd.sub_fields = [
        FieldTypes.F_INPUT_GROUP,
        FieldTypes.F_TABLE,
        FieldTypes.F_SELECT_MULTI,
        FieldTypes.F_DATETIME_RANGE,
      ].includes(fd.type)
        ? fd.sub_fields
        : [];
      if (fd.type !== FieldTypes.F_TEXT_FORMULA) {
        fd.text_sub_fields = [];
      }
      return fd;
    });
    sortedFields = sortBy(sortedFields, (l) => l.position);
    element.properties_template.layers[key].wf_position = 0;
    element.properties_template.layers[key].fields = sortedFields;
  });

  const reordered = reorderPositions(
    element.properties_template.layers,
    element.metadata,
  );
  element.metadata = reordered.metadata;
  element.properties_template.layers = reordered.layers;
  return element;
};

// TO-BE: replace layerDrop of GenInterface
export const layerDrop = (_generic, _source, _target) => {
  const [generic, source, target] = [_generic, _source, _target];
  if (source === target) return generic;
  const { layers } = generic.properties;

  const srcIdx = layers.findIndex((e) => e.key === source);
  if (srcIdx !== -1) {
    const tarIdx = layers.findIndex((e) => e.key === target);
    const [movedObject] = layers.splice(srcIdx, 1);
    layers.splice(tarIdx, 0, movedObject);

    // re-count wf_position
    layers
      .filter((e) => e.position === movedObject.position)
      .map((e, idx) => {
        const el = e;
        el.wf_position = idx;
        return el;
      });

    const sortedLayers = sortBy(layers, ['position', 'wf_position']);
    const orgLayers = orgLayerObject(sortedLayers);
    generic.properties.layers = orgLayers;
    generic.changed = true;
  }
  return generic;
};
