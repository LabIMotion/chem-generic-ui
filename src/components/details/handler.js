import sortBy from 'lodash/sortBy';
import { orgLayerObject, FieldTypes } from 'generic-ui-core';
import Layer from '@components/layers/Layer';
import { reorderPositions } from '@utils/template/sorting-handler';

export const addLayer = (_generic, _source, _key) => {
  const [generic, source, key] = [_generic, _source, _key];
  const { metadata = {} } = generic;
  const { layers } = generic.properties;
  const sortedLayers = sortBy(layers, ['position', 'wf_position']);
  const srcIdx = sortedLayers.findIndex(e => e.key === source.key);
  if (srcIdx !== -1) {
    const layer = new Layer({ sys: key });
    layer.addField({
      type: FieldTypes.F_SYS_REACTION,
      field: 'reaction',
      hasOwnRow: true,
    });

    // add layer next to source layer
    sortedLayers.splice(srcIdx + 1, 0, layer);

    // add layer to group if source layer is in a group, and layer's position is updated as group's position
    const group = metadata.groups?.find((g) => g.layers?.includes(source.key));
    if (group) {
      group.layers.splice(group.layers.indexOf(source.key) + 1, 0, layer.key);
      layer.position = group.position + 0.5; // Position after the group
    } else {
      layer.position = source.position + 0.5; // Position after the source layer
    }

    // Reorder positions considering groups and layers
    const layersObj = orgLayerObject(sortedLayers);
    const reordered = reorderPositions(layersObj, metadata);
    generic.properties.layers = reordered.layers;
    generic.metadata = reordered.metadata;
    generic.changed = true;
  }
};

export const layerDropReaction = (_generic, _field, _layerKey) => {
  const [generic, field, layerKey] = [_generic, _field, _layerKey];
  const dropLayer = generic.properties.layers[layerKey];
  if (dropLayer?.fields?.length > 0) {
    generic.properties.layers[layerKey].fields[0] = field;
    generic.changed = true;
  }
};

export const isFirstLayer = (layers, layerKey) => {
  if (!layers || typeof layers !== 'object' || !layerKey) {
    return false;
  }

  const sortedLayers = sortBy(Object.values(layers), [
    'position',
    'wf_position',
  ]);
  return sortedLayers.length > 0 && sortedLayers[0].key === layerKey;
};
