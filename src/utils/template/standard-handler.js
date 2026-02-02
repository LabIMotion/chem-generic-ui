import { notifyDummyAdd, notifyError, notifySuccess } from '@utils/template/designer-message';
import Response from '@utils/response';
import { validateLayerInput } from '@utils/template/standard-validation';

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
 * @param {object} _layer The layer object.
 * @returns {Response} The response object with extra layerKey.
 */
export const handleCreateLayer = (_layer) => {
  const [layer] = [_layer];
  const verify = validateLayerInput(layer);
  if (!verify.isSuccess) return responseCreateLayer(verify, layer, layer.key);
  // if frontend validation is successful, then call the backend
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
