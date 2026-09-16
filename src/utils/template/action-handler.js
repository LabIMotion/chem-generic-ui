import findIndex from 'lodash/findIndex';
import { FieldTypes, genUnits, reUnit } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import { mc2res, mc2text } from '@components/tools/format-utils';
import { GenericDummy } from '@components/tools/utils';
import {
  notifyDummyAdd,
  notifyError,
  notifySuccess,
  notifyWarning,
} from '@utils/template/designer-message';
import {
  validateNumberValue,
  isMinMaxValid,
  parseDecimal,
  parseNumberInput,
} from '@utils/numberUtils';
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
  removeLayerFromRegistrySlots,
  removeFieldValuesReferencingDeletedOption,
} from '@utils/template/prune-references';
import { updateLabelFieldsOnRemoval } from '@utils/template/label-handler';
import {
  validateProperties,
  formatValidationErrors,
} from '@utils/template/schema-validation';
import { reorderPositions } from '@utils/template/sorting-handler';
import { ontologyTermKey } from '@utils/pureUtils';
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

    // Remove stored field values that reference the deleted option
    removeFieldValuesReferencingDeletedOption(element, delRoot, delKey);
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

    // Step 3: Drop extras for this layer from every registry slot
    removeLayerFromRegistrySlots(element?.metadata, delKey);
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
    case 'ontology_term': {
      const prevKey = ontologyTermKey(fieldObj.ontology_term);
      const newKey = ontologyTermKey(value);
      fieldObj.ontology_term = value;
      // Scope changed: the pre-filled value belongs to the old ontology tree.
      if (prevKey !== newKey) delete fieldObj.value;
      break;
    }
    case 'option_layers': {
      const prevOptionLayers = fieldObj[`${fieldCheck}`];
      // When source changes for select fields, clear the previously selected value
      if (
        [FieldTypes.F_SELECT, FieldTypes.F_SELECT_MULTI].includes(type) &&
        prevOptionLayers !== value
      ) {
        if (type === FieldTypes.F_SELECT_MULTI) {
          fieldObj.sub_fields = []; // multi-select uses sub_fields and sub_values
          fieldObj.sub_values = [];
        } else {
          delete fieldObj.value;
        }
      }
      fieldObj[`${fieldCheck}`] = value;
      if (type === FieldTypes.F_SYSTEM_DEFINED) {
        const defaultSI = reUnit(value);
        fieldObj[`${fieldCheck}`] = defaultSI;
        const defaultUnit = genUnits(defaultSI)[0]?.key;
        fieldObj.value_system = defaultUnit;
        // pin the designer default as the formula base unit
        fieldObj.value_system_base = defaultUnit;
        // quantity changed -> the stored default value is meaningless under the
        // new unit; clear it (mirrors the F_SELECT branch above)
        if (prevOptionLayers !== defaultSI) delete fieldObj.value;
      }
      break;
    }
    case 'type': {
      const prevType = fieldObj[`${fieldCheck}`];
      // change selected type
      fieldObj[`${fieldCheck}`] = value;
      // give default unit if select system-defined
      if (value === FieldTypes.F_SYSTEM_DEFINED) {
        const defaultSI = reUnit('');
        fieldObj.option_layers = defaultSI;
        fieldObj.value_system = genUnits(defaultSI)[0]?.key;
        // pin the designer default as the formula base unit
        fieldObj.value_system_base = fieldObj.value_system;
      } else {
        fieldObj.option_layers = undefined;
        fieldObj.value_system = undefined;
        fieldObj.value_system_base = undefined;
        fieldObj.sub_fields = undefined;
        fieldObj.sub_values = undefined;
      }
      // Clean up type-specific props when switching away from a type
      let valueCleared = false;
      if (
        [FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(prevType) &&
        ![FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(value)
      ) {
        delete fieldObj.numeric;
        if (
          fieldObj.value !== undefined &&
          fieldObj.value !== null &&
          fieldObj.value !== ''
        ) {
          delete fieldObj.value;
          valueCleared = true;
        }
      }
      if (
        prevType === FieldTypes.F_FORMULA_FIELD &&
        value !== FieldTypes.F_FORMULA_FIELD
      ) {
        delete fieldObj.formula;
        delete fieldObj.decimal;
      }
      if (
        [FieldTypes.F_TEXT, FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(
          prevType,
        ) &&
        ![
          FieldTypes.F_TEXT,
          FieldTypes.F_NUMBER,
          FieldTypes.F_INTEGER,
        ].includes(value)
      ) {
        delete fieldObj.placeholder;
        delete fieldObj.required;
        delete fieldObj.readonly;
      }
      // Snapshot before cleanup
      const labelFieldsBefore = (layer?.label_fields || []).length;
      const countRestrictionEntries = (el) => {
        let count = 0;
        Object.values(el?.metadata?.restrict || {}).forEach((r) => {
          count += (r.cond || []).length;
        });
        Object.values(el?.properties_template?.layers || {}).forEach((l) => {
          count += (l.cond_fields || []).length;
          (l.fields || []).forEach((f) => {
            count += (f.cond_fields || []).length;
          });
        });
        return count;
      };
      const restrictionCountBefore = countRestrictionEntries(element);

      // Clean up when field type changes (type change may invalidate conditions)
      if (layer?.label_fields?.length > 0) {
        layer.label_fields = updateLabelFieldsOnRemoval(
          layer.label_fields,
          field,
        );
      }
      removeRestrictionsReferencingFields(element, [[layerKey, field]]);

      const displayNameCleared =
        (layer?.label_fields || []).length < labelFieldsBefore;
      const restrictionsCleared =
        countRestrictionEntries(element) < restrictionCountBefore;

      const idx = findIndex(fields, (o) => o.field === field);
      fields.splice(idx, 1, fieldObj);
      element.properties_template.layers[layerKey].fields = fields;

      const cleared = [
        valueCleared && 'default value',
        displayNameCleared && 'display name reference',
        restrictionsCleared && 'restrictions',
      ].filter(Boolean);

      if (cleared.length > 0) {
        const fieldLabel = fieldObj.label || field;
        const itemList =
          cleared.length === 1
            ? cleared[0]
            : `${cleared.slice(0, -1).join(', ')} and ${cleared[cleared.length - 1]}`;
        return new Response(
          notifyWarning(
            `Field "${fieldLabel}" type changed: ${itemList} were cleared.`,
            'Warning',
          ),
          element,
        );
      }
      // Initialize numeric config when switching TO number type
      if (
        [FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(value) &&
        !fieldObj.numeric
      ) {
        fieldObj.numeric = { decimals: 0, min: '', max: '' };
      }
      break;
    }
    case 'value_system':
      if (value) {
        fieldObj[`${fieldCheck}`] = value;
        // designer cycling the unit re-pins the formula base unit
        fieldObj.value_system_base = value;
      }
      break;
    case 'decimals':
    case 'min':
    case 'max': {
      if (!fieldObj.numeric)
        fieldObj.numeric = { decimals: 0, min: '', max: '' };
      const carryMsgs = [];
      if (fieldCheck === 'decimals') {
        // Validate: must be a non-negative integer; empty = reset to default 0 silently
        const rawStr = String(value ?? '');
        if (rawStr === '') {
          fieldObj.numeric.decimals = 0;
        } else if (!/^\d+$/.test(rawStr)) {
          const parsed = parseInt(rawStr, 10);
          fieldObj.numeric.decimals = isNaN(parsed) || parsed < 0 ? 0 : parsed;
          const idx2 = findIndex(fields, (o) => o.field === field);
          fields.splice(idx2, 1, fieldObj);
          element.properties_template.layers[layerKey].fields = fields;
          return new Response(
            notifyWarning(
              `Invalid decimals for "${fieldObj.label || field}" — must be a non-negative integer. Reset to ${fieldObj.numeric.decimals}.`,
              'Warning',
            ),
            element,
          );
        } else {
          fieldObj.numeric.decimals = parseInt(rawStr, 10);
        }
        // Re-round existing min/max to the new precision
        if (
          [FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(fieldObj.type)
        ) {
          const newDec = fieldObj.numeric.decimals;
          const rounded = [];
          ['min', 'max'].forEach((k) => {
            const v = fieldObj.numeric[k];
            if (v === '' || v == null) return;
            const r = parseNumberInput(v, newDec);
            if (r !== null && String(r) !== String(v)) {
              fieldObj.numeric[k] = r;
              rounded.push(`${k} → ${r}`);
            }
          });
          const parts = [];
          if (rounded.length) {
            // If rounding produced a min>max conflict, clear max so the field stays usable
            if (!isMinMaxValid(fieldObj.numeric.min, fieldObj.numeric.max)) {
              fieldObj.numeric.max = '';
            }
            parts.push(
              `Constraints updated for "${fieldObj.label || field}" to match decimals precision (${newDec}): ${rounded.join(', ')}.`,
            );
          }
          // Re-apply the default value through parseNumberInput so it rounds
          // (and clamps) to the new precision/constraints. Only clear when the
          // value cannot be parsed at all.
          if (
            fieldObj.value !== undefined &&
            fieldObj.value !== null &&
            fieldObj.value !== ''
          ) {
            const parsed = parseNumberInput(
              fieldObj.value,
              fieldObj.numeric.decimals,
              {
                min: fieldObj.numeric.min,
                max: fieldObj.numeric.max,
              },
            );
            if (parsed === null) {
              fieldObj.value = '';
              parts.push(
                `Default value cleared for "${fieldObj.label || field}" — it could not be parsed.`,
              );
            } else if (String(parsed) !== String(fieldObj.value)) {
              fieldObj.value = parsed;
              parts.push(
                `Default value rounded to ${parsed} for "${fieldObj.label || field}" to match decimals precision (${fieldObj.numeric.decimals}).`,
              );
            }
          }
          if (parts.length) {
            const idx2 = findIndex(fields, (o) => o.field === field);
            fields.splice(idx2, 1, fieldObj);
            element.properties_template.layers[layerKey].fields = fields;
            return new Response(
              notifyWarning(parts.join(' '), 'Warning'),
              element,
            );
          }
        }
      } else {
        // Reject non-numeric input: reset to empty and warn
        if (
          [FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(fieldObj.type) &&
          value !== '' &&
          value !== null &&
          value !== undefined &&
          parseDecimal(value) === null
        ) {
          fieldObj.numeric[fieldCheck] = '';
          const idx2 = findIndex(fields, (o) => o.field === field);
          fields.splice(idx2, 1, fieldObj);
          element.properties_template.layers[layerKey].fields = fields;
          return new Response(
            notifyWarning(
              `${fieldCheck === 'min' ? 'Min' : 'Max'} must be numeric for "${fieldObj.label || field}" — reset to empty.`,
              'Warning',
            ),
            element,
          );
        }
        fieldObj.numeric[fieldCheck] = value;
        // Normalize min/max to the current decimals precision (if decimals is set).
        // Accumulate the warning instead of returning so the subsequent default-
        // value check can still run against the rounded constraints.
        if (
          [FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(fieldObj.type) &&
          value !== '' &&
          value !== null &&
          value !== undefined
        ) {
          const currentDecimals = fieldObj.numeric.decimals;
          const rounded = parseNumberInput(value, currentDecimals);
          if (rounded !== null && String(rounded) !== String(value)) {
            fieldObj.numeric[fieldCheck] = rounded;
            carryMsgs.push(
              `${fieldCheck === 'min' ? 'Min' : 'Max'} rounded to ${rounded} for "${fieldObj.label || field}" to match decimals precision (${currentDecimals}).`,
            );
          }
        }
        // Guard: min must not exceed max (and vice versa)
        if (
          [FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(fieldObj.type)
        ) {
          const { min: curMin, max: curMax } = fieldObj.numeric;
          if (!isMinMaxValid(curMin, curMax)) {
            fieldObj.numeric[fieldCheck] = '';
            const idx2 = findIndex(fields, (o) => o.field === field);
            fields.splice(idx2, 1, fieldObj);
            element.properties_template.layers[layerKey].fields = fields;
            return new Response(
              notifyWarning(
                `Invalid constraint for "${fieldObj.label || field}" — min cannot be greater than max.`,
                'Warning',
              ),
              element,
            );
          }
        }
      }
      // If there's a preview/default value set, check it against the updated constraints
      if (
        [FieldTypes.F_NUMBER, FieldTypes.F_INTEGER].includes(fieldObj.type) &&
        fieldObj.value !== undefined &&
        fieldObj.value !== null &&
        fieldObj.value !== ''
      ) {
        const newConstraints = {
          decimals: fieldObj.numeric.decimals,
          min: fieldObj.numeric.min,
          max: fieldObj.numeric.max,
        };
        const { valid } = validateNumberValue(fieldObj.value, newConstraints);
        if (!valid) {
          fieldObj.value = '';
          const idx2 = findIndex(fields, (o) => o.field === field);
          fields.splice(idx2, 1, fieldObj);
          element.properties_template.layers[layerKey].fields = fields;
          const parts = carryMsgs.concat([
            `Default value cleared for "${fieldObj.label || field}" — it falls outside the updated constraints.`,
          ]);
          return new Response(
            notifyWarning(parts.join(' '), 'Warning'),
            element,
          );
        }
      }
      if (carryMsgs.length > 0) {
        const idx2 = findIndex(fields, (o) => o.field === field);
        fields.splice(idx2, 1, fieldObj);
        element.properties_template.layers[layerKey].fields = fields;
        return new Response(
          notifyWarning(carryMsgs.join(' '), 'Warning'),
          element,
        );
      }
      break;
    }
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

    // Handle unsupported field types before validation
    Object.keys(properties.layers || {}).forEach((key) => {
      properties.layers[key] = updateUnsupports(
        properties.layers[key],
        _genericType,
      );
    });

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

    if (verify.isSuccess) {
      // Handle unsupported field types
      Object.keys(data?.properties_template?.layers || {}).forEach((key) => {
        data.properties_template.layers[key] = updateUnsupports(
          data.properties_template.layers[key],
          _genericType,
        );
      });
    }

    // console.log('verify=', verify, ', requestKlass=', requestKlass);
    return new Response(verify, data);
  } catch (err) {
    return new Response(notifyError(`Error Format: ${err}`), data);
  }
};
