import { sortBy } from 'lodash';
import { reUnit, getUnitSystem } from 'generic-ui-core';
import { orgLayerObject } from '../../components/tools/orten';

export const handleSaveSorting = _element => {
  const element = _element;
  const { unitsSystem } = getUnitSystem();

  Object.keys(element.properties_template.layers).forEach(key => {
    const layer = element.properties_template.layers[key];
    let sortedFields = layer?.fields || [];
    (sortedFields || []).forEach((f, idx) => {
      const fd = f;
      fd.position = idx + 1;
      if (fd.type === 'system-defined') {
        fd.option_layers = reUnit(unitsSystem, fd.option_layers);
      }
      fd.required = ['integer', 'text'].includes(fd.type) ? fd.required : false;
      fd.sub_fields = ['input-group', 'table'].includes(fd.type)
        ? fd.sub_fields
        : [];
      if (fd.type !== 'text-formula') {
        fd.text_sub_fields = [];
      }
      return fd;
    });
    sortedFields = sortBy(sortedFields, l => l.position);
    element.properties_template.layers[key].wf_position = 0;
    element.properties_template.layers[key].fields = sortedFields;
  });
  const sortedLayers = sortBy(element.properties_template.layers, ['position']);
  sortedLayers.map((e, ix) => {
    e.position = (ix + 1) * 10;
    return e;
  });

  element.properties_template.layers = orgLayerObject(sortedLayers);
  return element;
};

// TO-BE: replace layerDrop of GenInterface
export const layerDrop = (_generic, _source, _target) => {
  const [generic, source, target] = [_generic, _source, _target];
  console.log('layerDrop source=', source);
  console.log('layerDrop target=', target);
  if (source === target) return generic;
  const { layers } = generic.properties;

  const srcIdx = layers.findIndex(e => e.key === source);
  if (srcIdx !== -1) {
    const tarIdx = layers.findIndex(e => e.key === target);
    const [movedObject] = layers.splice(srcIdx, 1);
    layers.splice(tarIdx, 0, movedObject);

    // re-count wf_position
    layers
      .filter(e => e.position === movedObject.position)
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
