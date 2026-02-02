import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import { FieldTypes } from 'generic-ui-core';
import { validateFieldName } from '@utils/template/input-validation';
import { mergeOptions } from '@utils/template/remodel-handler';
import { notifyFieldAdd, notifySuccess } from '@utils/template/designer-message';
import Response from '@utils/response';

const resetPosition = (_fields) => {
  const updatedFields = _fields.map((f, idx) => {
    return { ...f, position: idx + 1 };
  });
  return updatedFields;
};

export const handleAddVocabulary = (_element, _layer, _selected) => {
  const [element, layer, selected] = [_element, _layer, _selected];

  const fields = layer.fields || [];
  // const ontology = {
  //   id: `ncit:class:http://purl.obolibrary.org/obo/${selected.term_id}`,
  //   iri: `http://purl.obolibrary.org/obo/${selected.term_id}`,
  //   type: 'class',
  //   label: selected.name,
  //   ontology_name: 'ncit',
  //   ontology_prefix: 'NCIT',
  //   obo_id: selected.term_id,
  //   short_form: selected.term_id,
  //   description: [selected.name],
  // };
  const dupFields = filter(fields, (o) => o.field === selected.name);
  if (dupFields && dupFields.length > 0) {
    return new Response(
      notifyFieldAdd(
        false,
        `Field (${selected.name}) ${selected.label} is already exist.`
      ),
      element
    );
  }
  // move "select_options" to another constant
  const selectOptions = selected.properties?.select_options || {};
  // delete selected.select_options; // TODO: need to delete later
  const newField = {
    is_voc: true,
    identifier: selected.identifier,
    type: selected.field_type,
    ontology: selected.ontology,
    field: selected.name,
    position: 100,
    label: selected.label,
    default: '',
  };
  if (selected.opid) newField.opid = selected.opid;
  if (selected.source) newField.source = selected.source;
  if (selected.source_id) newField.source_id = selected.source_id;
  if (selected.layer_id) newField.layer_id = selected.layer_id;
  if (selected.field_id) newField.field_id = selected.field_id;
  if (selected.properties?.option_layers)
    newField.option_layers = selected.properties?.option_layers;
  fields.push(newField);
  element.properties_template.layers[layer.key].fields = fields;
  // Handle select_options in the properties_template
  if (!element.properties_template?.select_options) {
    element.properties_template.select_options = selectOptions;
  } else {
    // Merge selectOptions with existing select_options
    element.properties_template.select_options = mergeOptions(
      selectOptions,
      element.properties_template.select_options
    );
  }
  // Check if "select_options" is empty, if so, delete it
  if (
    Object.keys(element.properties_template?.select_options || {}).length === 0
  ) {
    delete element.properties_template.select_options;
  }
  return new Response(
    notifyFieldAdd(
      true,
      `New field (from Lab-Voc) has been added successfully.`
    ),
    element
  );
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
  const dupFields = filter(fields, (o) => o.field === newFieldKey);
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
    type: FieldTypes.F_TEXT,
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
  const idx = findIndex(fields, (o) => o.field === field);
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
    const sourceIdx = findIndex(fields, (o) => o.field === source.field);
    const targetIdx = findIndex(fields, (o) => o.field === target.field);
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
