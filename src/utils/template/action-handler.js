import findIndex from 'lodash/findIndex';
import sortBy from 'lodash/sortBy';
import { FieldTypes, genUnits, reUnit } from 'generic-ui-core';
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
import mergeExt from '../ext-utils';

const ext = mergeExt();

/**
 * The response object for condition creation.
 * @param {*} _notify
 * @param {*} _element
 * @param {*} _additional
 * @returns {Response} The response object with extra information.
 */
export const responseExt = (_notify, _element, _additional = {}) => {
  const response = new Response(_notify, _element);
  response.additional = _additional;
  return response;
};

/**
 * The response object for layer creation.
 * @param {*} _notify
 * @param {*} _element
 * @param {*} _layerKey
 * @returns {Response} The response object with extra layerKey.
 */
const responseCreateLayer = (_notify, _element, _layerKey) => {
  const response = new Response(_notify, _element);
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
  if (!layer.position) {
    layer.position =
      sortedLayers.length < 1
        ? 100
        : parseInt(
            (sortedLayers.slice(-1)[0] || { position: 100 }).position,
            10
          ) + 10;
  }
  layer.timeRecord = '';
  element.properties_template.layers[`${layer.key}`] = layer;
  return responseCreateLayer(
    notifySuccess(
      [
        'The new layer has been added.',
        "Remember to save once you've finished editing.",
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
    'The layer has been updated.',
    "Remember to save once you've finished editing.",
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

  if (delStr === FieldTypes.DEL_SELECT) {
    delete element.properties_template.select_options[delKey];
    selectOptions = Object.keys(element.properties_template.select_options).map(
      key => {
        return { value: key, name: key, label: key };
      }
    );
  }
  if (delStr === FieldTypes.DEL_OPTION) {
    const { options } = element.properties_template.select_options[delRoot];
    if (options && options.length > 0) {
      const idx = options.findIndex(o => o.key === delKey);
      if (idx !== -1) {
        options.splice(idx, 1);
      }
    }
  }
  if (delStr === FieldTypes.DEL_LAYER) {
    const verify = validateLayerDeletion(element, delKey);
    if (!verify.isSuccess) {
      const response = new Response(verify, element);
      response.selectOptions = [];
      return response;
    }
    delete element.properties_template.layers[delKey];
  }
  if (delStr === FieldTypes.DEL_FIELD) {
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
    return responseExt(verify, element, { selectOptions });
  }
  return responseExt(verify, element, { selectOptions: options });
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
  }
  return responseExt(verify, element);
};

export const handleOptionInput = (_element, _optionKey, _selectKey, _input) => {
  const [element, optionKey, selectKey, input] = [
    _element,
    _optionKey,
    _selectKey,
    _input,
  ];
  const options =
    element?.properties_template?.select_options[selectKey]?.options || [];
  const idx = findIndex(options, o => o.key === optionKey);
  const op = {};
  op.key = optionKey;
  op.label = input;
  options.splice(idx, 1, op);
  return new Response(notifySuccess(), element);
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
  if (
    [FieldTypes.F_SELECT, FieldTypes.F_SYSTEM_DEFINED, 'select-multi'].includes(
      type
    )
  ) {
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
  if (!fieldObj || Object.keys(fieldObj).length === 0)
    return { notify: notifyError('Field is undefined'), element };

  switch (fieldCheck) {
    case 'required':
    case 'readonly':
    case 'hasOwnRow':
    case 'canAdjust':
      fieldObj[`${fieldCheck}`] = !orig;
      break;
    case 'ontology':
      if (value) fieldObj[`${fieldCheck}`] = value;
      else delete fieldObj[`${fieldCheck}`];
      break;
    case 'option_layers':
      fieldObj[`${fieldCheck}`] = value;
      if (type === FieldTypes.F_SYSTEM_DEFINED) {
        const defaultSI = reUnit(value, ext);
        fieldObj[`${fieldCheck}`] = defaultSI;
        const defaultUnit = genUnits(defaultSI, ext)[0]?.key;
        fieldObj.value_system = defaultUnit;
      }
      break;
    case 'type': // change selected type
      fieldObj[`${fieldCheck}`] = value;
      // give default unit if select system-defined
      if (value === FieldTypes.F_SYSTEM_DEFINED) {
        const defaultSI = reUnit('', ext);
        fieldObj.option_layers = defaultSI;
        fieldObj.value_system = genUnits(defaultSI, ext)[0]?.key;
      } else {
        fieldObj.option_layers = undefined;
        fieldObj.value_system = undefined;
        fieldObj.sub_fields = undefined;
      }
      break;
    case 'value_system':
      if (value) fieldObj[`${fieldCheck}`] = value;
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
    if (!properties.klass.endsWith(`${_genericType}Klass`)) {
      return new Response(
        notifyError(
          [
            'The template upload has failed.',
            'You are attempting to update a template',
            `from [${properties.klass}] to [${_genericType}Klass]`,
          ].join(' ')
        ),
        properties
      );
    }
    return new Response(notifySuccess(), properties);
  } catch (err) {
    return new Response(notifyError(`Error Format:${err}`), properties);
  }
};

/**
 * Handles the klass upload action.
 * @param {Event} _event
 * @param {string} _genericType
 * @returns Returns a Response object.
 */
export const handleKlassUploading = (_event, _genericType) => {
  const reader = _event.target;
  const pt = reader.result;
  let data = {};

  try {
    data = JSON.parse(pt);
    if (!data.properties_template.klass.endsWith(`${_genericType}Klass`)) {
      return new Response(
        notifyError(
          [
            'The template upload has failed.',
            `You are attempting to upload a ${_genericType}`,
            `from [${data.properties_template.klass}] to [${_genericType}Klass]`,
          ].join(' ')
        ),
        data
      );
    }
    return new Response(notifySuccess(), data);
  } catch (err) {
    return new Response(notifyError(`Error Format: ${err}`), data);
  }
};
