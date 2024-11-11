import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import { validateFieldName } from './input-validation';
import { notifyFieldAdd, notifySuccess } from './designer-message';
import Response from '../response';

const resetPosition = _fields => {
  const updatedFields = _fields.map((f, idx) => {
    return { ...f, position: idx + 1 };
  });
  return updatedFields;
};

/**
 * Handles the field creation.
 * @param {string} _newFieldKey The name of the field.
 * @param {object} _element The element object.
 * @param {string} _layer The key of the layer within the element.
 * @returns {Response} The response object with extra layerKey.
 */
export const handleCreateField = (_newFieldKey, _element, _layer) => {
  const [newFieldKey, element, layer] = [_newFieldKey, _element, _layer];
  const verify = validateFieldName(newFieldKey, element);
  if (!verify.isSuccess) {
    return new Response(verify, element);
  }
  const fields = layer.fields || [];
  const dupFields = filter(fields, o => o.field === newFieldKey);
  if (dupFields && dupFields.length > 0) {
    return new Response(
      notifyFieldAdd(
        false,
        `Field [${newFieldKey}] is already in use, please choose a different field name.`
      ),
      element
    );
  }
  const newField = {
    type: 'text',
    field: newFieldKey,
    position: 100,
    label: newFieldKey,
    default: '',
  };
  fields.push(newField);
  element.properties_template.layers[layer.key].fields = fields;
  return new Response(
    notifyFieldAdd(true, `Field [${newFieldKey}] has been added successfully.`),
    element
  );
};

export const handleFieldMove = (_element, _layerKey, _field, _isUp) => {
  const [element, layerKey, field, isUp] = [_element, _layerKey, _field, _isUp];
  const layer = element?.properties_template?.layers[layerKey];
  const { fields } = layer;
  const idx = findIndex(fields, o => o.field === field);
  if (idx >= 0 && isUp) {
    const curObj = fields[idx];
    curObj.position -= 1;
    const preObj = fields[idx - 1];
    preObj.position += 1;
    fields[idx] = preObj;
    fields[idx - 1] = curObj;
  } else if (idx < fields.length - 1 && !isUp) {
    const curObj = fields[idx];
    curObj.position += 1;
    const nexObj = fields[idx + 1];
    nexObj.position -= 1;
    fields[idx] = nexObj;
    fields[idx + 1] = curObj;
  }
  element.properties_template.layers[layerKey].fields = fields;
  return new Response(notifySuccess(), element);
};

export const handlePositionChange = (_element, _layerKey, _target, _source) => {
  const [element, layerKey, target, source] = [
    _element,
    _layerKey,
    _target,
    _source,
  ];
  const layer = element?.properties_template?.layers[layerKey];
  if (layer) {
    const { fields } = layer;
    const sourceIdx = findIndex(fields, o => o.field === source.field);
    const targetIdx = findIndex(fields, o => o.field === target.field);
    if (sourceIdx < 0 || targetIdx < 0) {
      return new Response(notifySuccess(), element);
    }
    const removedElement = fields.splice(sourceIdx, 1)[0];
    fields.splice(targetIdx, 0, removedElement);
    element.properties_template.layers[layerKey].fields = resetPosition(fields);
    return new Response(notifySuccess(), element);
  }
  return new Response(notifySuccess(), element);
};

export const handleLayerPositionChange = (_element, _target, _source) => {
  const [element, target, source] = [_element, _target, _source];
  const layers = { ...element.properties_template.layers }; // Create a copy of layers

  const layerKeys = Object.keys(layers).sort(
    (a, b) => layers[a].position - layers[b].position
  );
  const sourceIdx = layerKeys.indexOf(source.key);
  const targetIdx = layerKeys.indexOf(target.key);
  if (sourceIdx < 0 || targetIdx < 0) {
    return new Response(notifySuccess(), element);
  }
  // Remove the source layer and insert it at the target position
  const removedLayerKey = layerKeys.splice(sourceIdx, 1)[0];
  layerKeys.splice(targetIdx, 0, removedLayerKey);

  // Create a new layers object with the updated order
  const newLayers = {};
  layerKeys.forEach((key, idx) => {
    newLayers[key] = layers[key];
    newLayers[key].position = (idx + 1) * 10;
  });

  element.properties_template.layers = newLayers;
  return new Response(notifySuccess(), element);
};
