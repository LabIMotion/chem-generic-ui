import { sortBy } from 'lodash';
import { reUnit, FieldTypes } from 'generic-ui-core';
import { orgLayerObject } from '../../components/tools/orten';

export const handleSaveSorting = _element => {
  const element = _element;
  Object.keys(element.properties_template.layers).forEach(key => {
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
      fd.sub_fields = [FieldTypes.F_INPUT_GROUP, FieldTypes.F_TABLE].includes(
        fd.type
      )
        ? fd.sub_fields
        : [];
      if (fd.type !== FieldTypes.F_TEXT_FORMULA) {
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
