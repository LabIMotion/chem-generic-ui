import { notifyError, notifySuccess } from '@utils/template/designer-message';
import Response from '@utils/response';

/**
 * The response object for condition creation.
 * @param {*} _notify
 * @param {*} _element
 * @param {*} _additional
 * @returns {Response} The response object with extra information.
 */
const responseCondition = (_notify, _element, _additional = {}) => {
  const response = new Response(_notify, _element);
  response.additional = _additional;
  return response;
};

// return notify object and result
export const verifyConditionLayer = (_element, _layerKey) => {
  const [element, layerKey] = [_element, _layerKey];
  const layer = element?.properties_template?.layers[layerKey];
  if (layer?.wf) {
    return responseCondition(
      notifyError(
        'Layer Restriction cannot be set on the workflow layer.',
        `Layer [${_layerKey}]`
      ),
      element,
      { fieldObj: null, layerKey }
    );
  }
  return responseCondition(notifySuccess(), element, {
    fieldObj: null,
    layerKey,
  });
};

export const handleCondition = (_element, _layerKey, _field) => {
  const [element, field, layerKey] = [_element, _field, _layerKey];
  const layer = element?.properties_template?.layers[layerKey];
  if (!_field && layer?.wf) {
    return responseCondition(
      notifyError(
        'Layer Restriction cannot be set on the workflow layer.',
        `Layer [${_layerKey}]`
      ),
      element,
      { fieldObj: field, layerKey }
    );
  }
  return responseCondition(notifySuccess(), element, {
    fieldObj: field,
    layerKey,
  });
};

export const handleFieldSubChange = (
  _element,
  _layerKey,
  _field,
  _cb = () => {}
) => {
  const [element, layerKey, field, cb] = [_element, _layerKey, _field, _cb];
  const layer = element?.properties_template?.layers[layerKey];
  const { fields } = layer;
  if (layer != null) {
    const fieldObj = (fields || []).find(o => o.field === field.field);
    if (fieldObj && Object.keys(fieldObj || {}).length > 0) {
      const idx = (fields || []).findIndex(o => o.field === field.field);
      fields.splice(idx, 1, field);
      element.properties_template.layers[layerKey].fields = fields;
    }
  }
  return responseCondition(notifySuccess(), element, {
    fieldObj: field,
    layerKey,
  });
};

export const handleLayerConditionChange = (_element, _layerKey) => {
  const [element, layerKey] = [_element, _layerKey];
  return responseCondition(notifySuccess(), element, {
    fieldObj: null,
    layerKey,
  });
};
