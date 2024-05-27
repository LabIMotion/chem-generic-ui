import { sortBy } from 'lodash';
import Layer from '../layers/Layer';
import { orgLayerObject } from '../tools/orten';

export const addLayer = (_generic, _source, _key) => {
  const [generic, source, key] = [_generic, _source, _key];
  const { layers } = generic.properties;
  const sortedLayers = sortBy(layers, ['position', 'wf_position']);
  const srcIdx = sortedLayers.findIndex(e => e.key === source.key);
  if (srcIdx !== -1) {
    const layer = new Layer({ sys: key });
    layer.addField({
      type: 'sys-reaction',
      field: 'reaction',
      hasOwnRow: true,
    });

    // add layer next to source layer
    sortedLayers.splice(srcIdx + 1, 0, layer);

    // re-count layer position
    sortedLayers.map((e, idx) => {
      const el = e;
      el.position = (idx + 1) * 10;
      return el;
    });

    const orgLayers = orgLayerObject(sortedLayers);
    generic.properties.layers = orgLayers;
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
