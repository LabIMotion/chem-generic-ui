import { findIndex, sortBy } from 'lodash';
import { GenericDummy } from '../../components/tools/utils';
import { notifyDummyAdd, notifyError, notifySuccess } from './designer-message';
import {
  validateOptionAdd,
  validateLayerDeletion,
  validateLayerInput,
  validateLayerUpdate,
  validateSelectList,
} from './input-validation';
import Response from '../response';

/**
 * The response object for layer creation.
 * @param {*} _notify
 * @param {*} _element
 * @param {*} _layerKey
 * @returns {Response} The response object with extra layerKey.
 */
const responseCreateLayer = (_notify, _element, _layerKey) => {
  const response = new Response(_notify, _element, _layerKey);
  response.layerKey = _layerKey;
  return response;
};

/**
 * Handles the layer creation.
 * @param {string} _layer The key of the layer within the element.
 * @param {object} _element The element object.
 * @returns {Response} The response object with extra layerKey.
 */
export const handleCreateLayer = (_layer, _element) => {
  const [element, layer] = [_element, _layer];
  const verify = validateLayerInput(layer);
  if (!verify.isSuccess) return responseCreateLayer(verify, element, layer.key);
  if (
    element &&
    element.properties_template &&
    element.properties_template.layers[`${layer.key}`]
  ) {
    return responseCreateLayer(
      notifyError(
        'This Layer is already taken. Please choose another one.',
        `Layer [${layer.key}]`
      ),
      element,
      layer.key
    );
  }
  const sortedLayers = sortBy(element.properties_template.layers, ['position']);
  layer.position =
    !layer.position && sortedLayers.length < 1
      ? 100
      : parseInt(
          (sortedLayers.slice(-1)[0] || { position: 100 }).position,
          10
        ) + 10;
  element.properties_template.layers[`${layer.key}`] = layer;
  return responseCreateLayer(
    notifySuccess(
      [
        'This new layer is kept in the Template workspace temporarily.',
        'Please remember to press Save when you finish the editing.',
      ].join(' '),
      `Layer [${layer.key}]`
    ),
    element,
    layer.key
  );
};

/**
 * Handles the layer creation.
 * @param {string} _layer The key of the layer within the element.
 * @param {object} _element The element object.
 * @returns Returns a Response object.
 */
export const handleUpdateLayer = (_element, _layerKey, _updates) => {
  const [element, layerKey, updates] = [_element, _layerKey, _updates];

  let verify = validateLayerInput(updates, 'upd');
  if (!verify.isSuccess) {
    return new Response(verify, element);
  }
  verify = validateLayerUpdate(element, updates);
  if (!verify.isSuccess) return new Response(verify, element);

  let layer = element?.properties_template?.layers[layerKey];
  const msg = [
    'The updates of this layer is kept in the workspace temporarily.',
    'Please remember to press Save when you finish the editing.',
  ];

  layer = { ...layer, ...updates };

  // reset cond_fields of fields if the layer enable workflow
  // note: the workflow of segment and dataset is not supported yet
  if (layer.wf) {
    msg.push(
      'For a Workflow layer, the Field Restrict Setting is only applicable on its own layer.'
    );
    (layer.fields || []).map(f => {
      const newF = f;
      if (newF.cond_fields && newF.cond_fields.length > 0) {
        newF.cond_fields = f.cond_fields.filter(o => o.layer === layer.key);
        if (newF.cond_fields.length < 1) delete newF.cond_fields;
      }
      return newF;
    });
  }

  const sortedLayers = sortBy(element.properties_template.layers, ['position']);
  layer.position = layer.position
    ? parseInt(layer.position, 10)
    : parseInt(sortedLayers.slice(-1)[0].position, 10) + 10;
  element.properties_template.layers[`${layer.key}`] = layer;
  return new Response(verify, element);
};

/**
 * Handles the deletion of Field or Layer or Select or Select option.
 * @param {*} delStr
 * @param {*} delKey
 * @param {*} delRoot
 * @param {*} _element
 * @returns Returns a Response object with extra selectOptions.
 */
export const handleDelete = (delStr, delKey, delRoot, _element) => {
  const element = _element;
  let selectOptions = [];

  if (delStr === 'Select') {
    delete element.properties_template.select_options[delKey];
    selectOptions = Object.keys(element.properties_template.select_options).map(
      key => {
        return { value: key, name: key, label: key };
      }
    );
  }
  if (delStr === 'Option') {
    const { options } = element.properties_template.select_options[delRoot];
    if (options && options.length > 0) {
      const idx = options.findIndex(o => o.key === delKey);
      if (idx !== -1) {
        options.splice(idx, 1);
      }
    }
  }
  if (delStr === 'Layer') {
    const verify = validateLayerDeletion(element, delKey);
    if (!verify.isSuccess) {
      const response = new Response(verify, element);
      response.selectOptions = [];
      return response;
    }
    delete element.properties_template.layers[delKey];
  }
  if (delStr === 'Field') {
    const { fields } = element.properties_template.layers[delRoot];
    const idx = fields.findIndex(o => o.field === delKey);
    if (idx !== -1) {
      fields.splice(idx, 1);
    }
  }
  const response = new Response(notifySuccess(), element);
  response.selectOptions = selectOptions;
  return response;
};

// return notify object and result
export const handleCondition = (_element, _layerKey, _field) => {
  const [element, field, layerKey] = [_element, _field, _layerKey];
  const layer = element?.properties_template?.layers[layerKey];
  if (!_field && layer?.wf) {
    return {
      notify: notifyError(
        'Layer Restriction cannot be set on workflow layer.',
        `Layer [${_layerKey}]`
      ),
      fieldObj: _field,
      layerKey,
    };
  }
  return { notify: notifySuccess(), fieldObj: field, layerKey };
};

export const handleAddDummy = (_element, _layerKey, _field) => {
  const [element, layerKey, field] = [_element, _layerKey, _field];
  const layer = element?.properties_template?.layers[layerKey];
  let { fields } = layer || {};
  fields = fields || [];
  let idx = fields.findIndex(o => o.field === field);
  if (idx === -1 && fields.length > 0) idx = fields.length - 1;
  fields.splice(idx + 1, 0, new GenericDummy());
  element.properties_template.layers[layerKey].fields = fields;
  return new Response(notifyDummyAdd(), element);
};

// return notify and the updated element and selects
export const handleAddSelect = (_element, _name, _options) => {
  const [element, name, options] = [_element, _name, _options];
  const verify = validateSelectList(element, name);
  if (verify.isSuccess) {
    element.properties_template.select_options = options;
    const selectOptions = Object.keys(options).map(key => {
      return {
        value: key,
        name: key,
        label: key,
      };
    });
    return { notify: verify, element, selectOptions };
  }
  return { notify: verify, element, selectOptions: options };
};

// return notify and the updated element
export const handleAddOption = (_element, _key, _optionKey, _selectOptions) => {
  const [element, key, optionKey, selectOptions] = [
    _element,
    _key,
    _optionKey,
    _selectOptions,
  ];
  const verify = validateOptionAdd(optionKey, selectOptions);
  if (verify.isSuccess) {
    element.properties_template.select_options[key].options = selectOptions;
    return { notify: verify, element };
  }
  return { notify: verify };
};

export const handleFieldInputChange = (
  _element,
  _event,
  _orig,
  _field,
  _layerKey,
  _fieldCheck,
  _type
) => {
  const [element, event, orig, field, layerKey, fieldCheck, type] = [
    _element,
    _event,
    _orig,
    _field,
    _layerKey,
    _fieldCheck,
    _type,
  ];

  let value = '';
  if (type === 'select' || type === 'system-defined') {
    ({ value } = event);
  } else if (type?.startsWith('drag')) {
    value = event;
  } else {
    ({ value } = event.target);
  }
  const layer = element?.properties_template?.layers[layerKey];
  if (typeof layer === 'undefined' || layer == null)
    return { notify: notifyError('Layer is undefined'), element };

  const { fields } = layer;
  if (fields == null || fields.length === 0)
    return { notify: notifyError('Layer has no fields'), element };

  const fieldObj = fields.find(e => e.field === field);
  if (Object.keys(fieldObj).length === 0)
    return { notify: notifyError('Field is undefined'), element };

  switch (fieldCheck) {
    case 'required':
    case 'hasOwnRow':
    case 'canAdjust':
      fieldObj[`${fieldCheck}`] = !orig;
      break;
    default:
      fieldObj[`${fieldCheck}`] = value;
      break;
  }
  const idx = findIndex(fields, o => o.field === field);
  fields.splice(idx, 1, fieldObj);
  element.properties_template.layers[layerKey].fields = fields;
  return new Response(notifySuccess(), element);
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

export const handleFieldSubChange = (_element, _layerKey, _field, _cb) => {
  const [element, layerKey, field, cb] = [_element, _layerKey, _field, _cb];
  const layer = element?.properties_template?.layers[layerKey];
  const { fields } = layer;
  if (layer != null) {
    const fieldObj = (fields || []).find(o => o.field === field);
    if (Object.keys(fieldObj).length > 0) {
      const idx = (fields || []).findIndex(o => o.field === field);
      fields.splice(idx, 1, field);
      element.properties_template.layers[layerKey].fields = fields;
      return { notify: notifySuccess(), element };
    }
  }
  return new Response(notifySuccess(), element);
};

/**
 * Handles the template upload action.
 * @param {Event} _event
 * @param {string} _genericType
 * @returns Returns a Response object.
 */
export const handleTemplateUploading = (_event, _genericType) => {
  const reader = _event.target;
  const pt = reader.result;
  let properties = {};

  try {
    properties = JSON.parse(pt);
  } catch (err) {
    return { notify: notifyError(`Error Format:${err}`), properties };
  }

  if (properties.klass !== `${_genericType}Klass`) {
    return {
      notify: notifyError(
        `Error, you're trying to update a template from [${properties.klass}]`
      ),
      properties,
    };
  }
  return new Response(notifySuccess(), properties);
};
