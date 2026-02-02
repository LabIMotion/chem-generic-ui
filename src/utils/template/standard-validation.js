import { isLayerInWF } from 'generic-ui-core';
import { notifyError, notifySuccess } from '@utils/template/designer-message';

export const isValidKlass = klass => /\b[a-z]{3,5}\b/.test(klass);
export const isValidField = field => /^[a-zA-Z0-9_]*$/.test(field);

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

/**
 * Validate inputs for the standard layer
 * Duplicate layer key validation is done in the backend
 * Updation can only be performed by the creator validation is done in the backend
 * Do we need to track the version of the layer? No.
 * Can the layer be updated? 'Yes' for the creator.
 * If the layer can be updated, which fields can be updated? All fields.
 * @param {*} layer
 * @param {*} act
 * @returns {Object} notifySuccess or notifyError
 */
export const validateLayerInput = layer => {
  if (layer.key === '') {
    return notifyError('Please input Name.', `Layer [${layer.key}]`);
  }
  if (!/^[a-z][a-z_]+[a-z]$/g.test(layer.key)) {
    return notifyError(
      'This Name is invalid, please try a different one.',
      `Layer [${layer.key}]`
    );
  }
  return notifySuccess();
};
