import findIndex from 'lodash/findIndex';
import { FieldTypes, genUnits, reUnit } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import { mc2res, mc2text } from '@components/tools/format-utils';
import { GenericDummy } from '@components/tools/utils';
import {
  notifyDummyAdd,
  notifyError,
  notifySuccess,
} from '@utils/template/designer-message';
import {
  validateElementKlassInput,
  validateSegmentKlassInput,
  validateOptionAdd,
  validateLayerDeletion,
  validateLayerInput,
  validateLayerUpdate,
  validateSelectList,
} from '@utils/template/input-validation';
import {
  mergeOptions,
  updateUnsupports,
} from '@utils/template/remodel-handler';
import {
  removeFieldReferencesToSelectOption,
  removeRestrictionsReferencingFields,
  removeRestrictionsReferencingOptionValue,
  removeRestrictionsReferencingLayer,
  removeLayerFromGroups,
} from '@utils/template/prune-references';
import { updateLabelFieldsOnRemoval } from '@utils/template/label-handler';
import {
  validateProperties,
  formatValidationErrors,
} from '@utils/template/schema-validation';
import { reorderPositions } from '@utils/template/sorting-handler';
import Response from '@utils/response';

/**
 * The response object for condition creation.
 */
export const responseExt = (_notify, _element, _additional = {}) => {
  const response = new Response(_notify, _element);
  response.additional = _additional;
  return response;
};

/**
 * The response object for layer creation.
 */
const responseCreateLayer = (_notify, _element, _layerKey) => {
  const response = new Response(_notify, _element);
  response.layerKey = _layerKey;
  return response;
};

/**
 * Handles the layer creation.
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
        `Layer [${layer.key}]`,
      ),
      element,
      layer.key,
    );
  }

  // Use provided position or set to -1 to ensure new layer sorts first
  // reorderPositions will then assign sequential positions starting from 0
  if (layer.position === undefined || layer.position === null) {
    layer.position = -1;
  }

  layer.timeRecord = '';
  element.properties_template.layers[`${layer.key}`] = layer;

  // Reorder all positions after adding the new layer
  const reordered = reorderPositions(
    element.properties_template.layers,
    element.metadata || {},
  );
  element.properties_template.layers = reordered.layers;
  if (reordered.metadata && Object.keys(reordered.metadata).length > 0) {
    element.metadata = reordered.metadata;
  }

  return responseCreateLayer(
    notifySuccess(
      [
        'The new layer has been added.',
        "Remember to save once you've finished editing.",
      ].join(' '),
      `Layer [${layer.key}]`,
    ),
    element,
    layer.key,
  );
};

export const handleAddStandardLayer = (_layer, _element, _genericType) => {
  const [element, origLayer, genericType] = [_element, _layer, _genericType];
  const verify = validateLayerInput(origLayer);
  if (!verify.isSuccess)
    return responseCreateLayer(verify, element, origLayer.key);
  const layer = updateUnsupports(origLayer, genericType);
  // move "select_options" to another constant
  const selectOptions = layer.select_options || {};
  delete layer.select_options;
  // check if the layer is already exist
  const layerKey = layer.key;
  if (element?.properties_template?.layers[layerKey]) {
    return responseCreateLayer(
      notifyError(
        'This Layer is already exist. Please choose another one.',
        `Layer [${layer.key}]`,
      ),
      element,
      layer.key,
    );
  }
  // set default value
  layer.position = 1;
  layer.timeRecord = '';
  element.properties_template.layers[`${layer.key}`] = layer;
  // Handle select_options in the properties_template
  if (!element.properties_template?.select_options) {
    element.properties_template.select_options = selectOptions;
  } else {
    // Merge selectOptions with existing select_options
    element.properties_template.select_options = mergeOptions(
      selectOptions,
      element.properties_template.select_options,
    );
  }
  // Check if "select_options" is empty, if so, delete it
  if (
    Object.keys(element.properties_template?.select_options || {}).length === 0
  ) {
    delete element.properties_template.select_options;
  }
  return responseCreateLayer(
    notifySuccess(
      [
        'A Standard Layer has been added into the template.',
        "Remember to save once you've finished editing.",
      ].join(' '),
      `Layer [${layer.key}]`,
    ),
    element,
    layer.key,
  );
};

/**
 * Handles the layer creation.
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
      'For a Workflow layer, the Field Restrict Setting is only applicable on its own layer.',
    );
    (layer.fields || []).map((f) => {
      const newF = f;
      if (newF.cond_fields && newF.cond_fields.length > 0) {
        newF.cond_fields = f.cond_fields.filter((o) => o.layer === layer.key);
        if (newF.cond_fields.length < 1) delete newF.cond_fields;
      }
      return newF;
    });
  }

  // Preserve the existing position, don't recalculate
  layer.position =
    layer.position !== undefined && layer.position !== null
      ? parseInt(layer.position, 10)
      : 0;

  element.properties_template.layers[`${layer.key}`] = layer;
  return new Response(notifySuccess(msg.join(' ')), element);
};

/**
 * Handles the deletion of Field or Layer or Select or Select option.
 */
export const handleDelete = (delStr, delKey, delRoot, _element) => {
  const element = _element;
  let selectOptions = [];

  if (delStr === FieldTypes.DEL_SELECT) {
    delete element.properties_template.select_options[delKey];
    selectOptions = Object.keys(element.properties_template.select_options).map(
      (key) => ({ value: key, name: key, label: key }),
    );

    // Step 1: Remove field references to the deleted select option
    const affectedFields = removeFieldReferencesToSelectOption(element, delKey);

    // Step 2: Remove restrictions that reference the affected fields
    removeRestrictionsReferencingFields(element, affectedFields);
  }
  if (delStr === FieldTypes.DEL_OPTION) {
    const { options } = element.properties_template.select_options[delRoot];
    if (options && options.length > 0) {
      const idx = options.findIndex((o) => o.key === delKey);
      if (idx !== -1) {
        options.splice(idx, 1);
      }
    }

    // Remove restrictions that reference this specific option value
    removeRestrictionsReferencingOptionValue(element, delRoot, delKey);
  }
  if (delStr === FieldTypes.DEL_LAYER) {
    const verify = validateLayerDeletion(element, delKey);
    if (!verify.isSuccess) {
      const response = new Response(verify, element);
      response.selectOptions = [];
      return response;
    }
    delete element.properties_template.layers[delKey];

    // Step 1: Remove restrictions that reference the deleted layer
    removeRestrictionsReferencingLayer(element, delKey);

    // Step 2: Remove the layer from groups
    removeLayerFromGroups(element, delKey);
  }
  if (delStr === FieldTypes.DEL_FIELD) {
    const layer = element.properties_template.layers[delRoot];
    const { fields } = layer;
    const idx = fields.findIndex((o) => o.field === delKey);
    if (idx !== -1) {
      fields.splice(idx, 1);
    }

    // Remove the field from label_fields if it exists
    if (layer.label_fields && Array.isArray(layer.label_fields)) {
      layer.label_fields = updateLabelFieldsOnRemoval(
        layer.label_fields,
        delKey,
      );
    }

    // Remove restrictions that reference the deleted field
    removeRestrictionsReferencingFields(element, [[delRoot, delKey]]);
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
  let idx = fields.findIndex((o) => o.field === field);
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
    const selectOptions = Object.keys(options).map((key) => ({
      value: key,
      name: key,
      label: key,
    }));
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
  const idx = findIndex(options, (o) => o.key === optionKey);
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
  _type,
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
    [
      FieldTypes.F_SELECT,
      FieldTypes.F_SYSTEM_DEFINED,
      FieldTypes.F_SELECT_MULTI,
    ].includes(type)
  ) {
    ({ value } = event);
  } else if (type?.startsWith(FieldTypes.F_DRAG)) {
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

  const fieldObj = fields.find((e) => e.field === field);
  if (!fieldObj || Object.keys(fieldObj || {}).length === 0)
    return { notify: notifyError('Field is undefined'), element };

  switch (fieldCheck) {
    case 'required':
    case 'hasOwnRow':
    case 'canAdjust':
      fieldObj[`${fieldCheck}`] = !orig;
      break;
    case 'readonly': {
      fieldObj[`${fieldCheck}`] = !orig;
      if (type === FieldTypes.F_TEXT && fieldObj[`${fieldCheck}`] === true) {
        if (layer?.label_fields?.length > 0) {
          layer.label_fields = updateLabelFieldsOnRemoval(
            layer.label_fields,
            field,
          );
        }
      }
      break;
    }
    case 'ontology':
      if (value) fieldObj[`${fieldCheck}`] = value;
      else delete fieldObj[`${fieldCheck}`];
      break;
    case 'option_layers':
      fieldObj[`${fieldCheck}`] = value;
      if (type === FieldTypes.F_SYSTEM_DEFINED) {
        const defaultSI = reUnit(value);
        fieldObj[`${fieldCheck}`] = defaultSI;
        const defaultUnit = genUnits(defaultSI)[0]?.key;
        fieldObj.value_system = defaultUnit;
      }
      break;
    case 'type': {
      // change selected type
      fieldObj[`${fieldCheck}`] = value;
      // give default unit if select system-defined
      if (value === FieldTypes.F_SYSTEM_DEFINED) {
        const defaultSI = reUnit('');
        fieldObj.option_layers = defaultSI;
        fieldObj.value_system = genUnits(defaultSI)[0]?.key;
      } else {
        fieldObj.option_layers = undefined;
        fieldObj.value_system = undefined;
        fieldObj.sub_fields = undefined;
      }
      // Clean up when field type changes (type change may invalidate conditions)
      if (layer?.label_fields?.length > 0) {
        layer.label_fields = updateLabelFieldsOnRemoval(
          layer.label_fields,
          field,
        );
      }
      removeRestrictionsReferencingFields(element, [[layerKey, field]]);
      break;
    }
    case 'value_system':
      if (value) fieldObj[`${fieldCheck}`] = value;
      break;
    default:
      fieldObj[`${fieldCheck}`] = value;
      break;
  }
  const idx = findIndex(fields, (o) => o.field === field);
  fields.splice(idx, 1, fieldObj);
  element.properties_template.layers[layerKey].fields = fields;
  return new Response(notifySuccess(), element);
};

/**
 * Handles the template upload action.
 */
export const handleTemplateUploading = (_event, _genericType) => {
  const reader = _event.target;
  const pt = reader.result;
  let properties = {};

  try {
    properties = JSON.parse(pt);
    if (!properties.klass.endsWith(`${_genericType}Klass`)) {
      return new Response(
        mc2res(
          'set00',
          [
            'You are attempting to update a template',
            `from [${properties.klass}] to [${_genericType}Klass]`,
          ].join(' '),
        ),
        properties,
      );
    }

    // Validate properties against schema
    const validation = validateProperties(properties);
    if (!validation.valid) {
      // Log validation errors for debugging
      // const errorMessage = formatValidationErrors(validation.errors);
      // console.error('Template validation errors:', errorMessage);
      return new Response(mc2res('set01', mc2text('si00')), properties);
    }

    return new Response(notifySuccess(), properties);
  } catch (err) {
    // console.error('Template parsing error:', err);
    return new Response(mc2res('set02', mc2text('si00')), properties);
  }
};

/**
 * Handles the klass upload action.
 */
export const handleKlassUploading = (_event, _genericType) => {
  const requestKlass = `${_genericType}Klass`;
  const reader = _event.target;
  const pt = reader.result;
  let data = {};

  try {
    data = JSON.parse(pt);
    const klass = data?.properties_template?.klass;
    if (
      !klass ||
      typeof klass !== 'string' ||
      klass.length === 0 ||
      !klass.endsWith(requestKlass)
    ) {
      return new Response(
        notifyError(
          [
            'The template upload has failed.',
            `You are attempting to upload a ${_genericType}`,
            `from [${klass}] to [${requestKlass}]`,
          ].join(' '),
        ),
        data,
      );
    }

    const inputs = {
      label: data?.label?.trim(),
      desc: data?.desc?.trim(),
      name: data?.name?.trim(),
      klass_prefix: data?.klass_prefix?.trim(),
      icon_name: data?.icon_name?.trim(),
      klass_element: data?.element_klass?.id,
    };

    const verify =
      Constants.GENERIC_TYPES.SEGMENT === requestKlass
        ? validateSegmentKlassInput(inputs)
        : validateElementKlassInput(inputs);
    // console.log('verify=', verify, ', requestKlass=', requestKlass);
    return new Response(verify, data);
  } catch (err) {
    return new Response(notifyError(`Error Format: ${err}`), data);
  }
};
