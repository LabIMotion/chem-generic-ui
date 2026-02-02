import Api from '@utils/api';
import Response from '@utils/response';
import { mc2res } from '@components/tools/format-utils';

const API_LA = 'layers';

class LayerManager {
  // a private static method
  static #exec = async (endpoint, method = 'GET', params = null) => {
    const fullEndpoint = `${API_LA}/${endpoint}`;
    const res = params
      ? await Api.execApiData(params, fullEndpoint)
      : await Api.execApi(fullEndpoint, method);
    // return mc2res(res.mc, res.msg || '');
    // { mc: 'aaa', msg: 'xxx', data: JSON Object or array}
    return new Response(mc2res(res.mc, res.msg || ''), { data: res.data });
  };

  static saveStandardLayer = (params = {}) =>
    LayerManager.#exec('save_standard_layer', 'POST', params);

  static deleteStandardLayer = (layerId) =>
    LayerManager.#exec(`delete_standard_layer/${layerId}`, 'DELETE');

  static getStandardLayer = (layerId) =>
    LayerManager.#exec(`get_standard_layer/${layerId}`);

  static getAllLayers = () => LayerManager.#exec('get_all_layers');
}

export default LayerManager;
