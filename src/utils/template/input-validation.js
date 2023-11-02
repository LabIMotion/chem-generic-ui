import { isLayerInWF } from 'generic-ui-core';
import {
  notifyError,
  notifyFieldAdd,
  notifyLayerUpdate,
  notifySuccess,
} from './designer-message';

export const isValidKlass = klass => /\b[a-z]{3,5}\b/.test(klass);
export const isValidField = field => /^[a-zA-Z0-9_]*$/.test(field);

export const validateFieldName = _fieldKey => {
  if (_fieldKey === null || _fieldKey.trim().length === 0) {
    return notifyFieldAdd(false, 'please input field name first!');
  }
  if (!isValidField(_fieldKey)) {
    return notifyFieldAdd(
      false,
      'only can be alphanumeric (a-z, A-Z, 0-9 and underscores).'
    );
  }
  return notifyFieldAdd();
};

export const validateElementKlassInput = element => {
  if (element.name === '') {
    return notifyError('Please input Element.', `Element [${element.name}]`);
  }
  if (element.klass_prefix === '') {
    return notifyError('Please input Prefix.', `Element [${element.name}]`);
  }
  if (element.label === '') {
    return notifyError(
      'Please input Element Label.',
      `Element [${element.name}]`
    );
  }
  if (element.icon_name === '') {
    return notifyError('Please input Icon.', `Element [${element.name}]`);
  }
  return notifySuccess();
};

export const validateSegmentKlassInput = element => {
  if (element.label === '') {
    return notifyError(
      'Please input Segment Label.',
      `Segment [${element.label}]`
    );
  }
  if (element.klass_element === '') {
    return notifyError(
      'Please assign to an Element.',
      `Segment [${element.label}]`
    );
  }
  return notifySuccess();
};

export const validateLayerDeletion = (_element, _delKey) => {
  if (isLayerInWF(_element, _delKey)) {
    return notifyError(
      `This layer [${_delKey}] can not be removed because it is currently used in workflow.`,
      `Layer [${_delKey}]`
    );
  }
  return notifySuccess(
    [
      'Operation successfully.',
      "Remember to save once you've finished editing.",
    ].join(' ')
  );
};

export const validateLayerInput = (layer, act = 'new') => {
  if (layer.key === '') {
    return notifyError('Please input Name.', `Layer [${layer.key}]`);
  }
  if (act === 'new' && !/^[a-z][a-z_]+[a-z]$/g.test(layer.key)) {
    return notifyError(
      'This Name is invalid, please try a different one.',
      `Layer [${layer.key}]`
    );
  }
  if (parseInt(layer.cols || 1, 10) < 1) {
    return notifyError(
      'The minimum number of columns per row is 1. Please enter a different value.',
      `Layer [${layer.key}]`
    );
  }
  return notifySuccess();
};

export const validateLayerUpdate = (_element, _updates) => {
  const { key, wf } = _updates;
  if (isLayerInWF(_element, key)) {
    if (!wf) {
      return notifyLayerUpdate({ type: 'checkWorkflow', layerKey: key });
    }
  }
  const { layers } = _element.properties_template;
  if (wf && layers[key] && (layers[key].cond_fields || []).length > 0) {
    return notifyLayerUpdate({ type: 'checkRestriction', layerKey: key });
  }
  return notifyLayerUpdate();
};

export const validateSelectList = (_element, _name) => {
  const selectName = _name;
  if (selectName === '') {
    return notifyError('Please input Name.', `Select List [${selectName}]`);
  }
  if (!/^[a-z][a-z_]+[a-z]$/g.test(selectName)) {
    return notifyError(
      'This Name is invalid, please try a different one.',
      `Select List [${selectName}]`
    );
  }
  if (_element?.properties_template.select_options[`${selectName}`]) {
    return notifyError(
      'This name of Select List is already in use. Please choose another one.',
      `Select List [${selectName}]`
    );
  }

  return notifySuccess();
};

export const validateOptionAdd = (optionKey, selectOptions) => {
  if (optionKey == null || optionKey.trim().length === 0) {
    return notifyError('Please input option name first!', 'Add new option');
  }
  if (selectOptions.filter(x => x.key === optionKey).length > 1) {
    return notifyError(
      `This option key [${optionKey}] is already in use. Please choose a different option key.`,
      'Add new option'
    );
  }
  return notifySuccess();
};
