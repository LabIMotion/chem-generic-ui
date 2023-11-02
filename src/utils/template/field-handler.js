import { filter, findIndex } from 'lodash';
import { validateFieldName } from './input-validation';
import { notifyFieldAdd, notifySuccess } from './designer-message';
import Response from '../response';

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
