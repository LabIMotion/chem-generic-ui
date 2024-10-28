import Api from './api';
import Response from './response';
import { mc2res } from '../components/tools/format-utils';
import Constants from '../components/tools/Constants';

const API_DISP = {
  [Constants.GENERIC_TYPES.ELEMENT]: 'generic_elements',
  [Constants.GENERIC_TYPES.SEGMENT]: 'segments',
  [Constants.GENERIC_TYPES.DATASET]: 'generic_dataset',
};

class ExternalManager {
  // a private static method
  static #exec = async (endpoint, method = 'GET', data = null, params = {}) => {
    const fullEndpoint = endpoint;
    const res = data
      ? await Api.execApiDataDepr(data, fullEndpoint)
      : await Api.execApiDepr(fullEndpoint, method, params);

    // TODO: refactor to use mc2res, need to change the backend
    // return new Response(mc2res(res.mc, res.msg || ''), { data: res.data });

    // this is a temporary solution to return the raw response
    // until the backend is refactored to use mc2res
    if (res.error) {
      return new Response(mc2res('se00', res.error || ''), { data: res });
    }
    return new Response(mc2res('ss00', res.msg || ''), { data: res });
  };

  static deleteVersion = (data) =>
    ExternalManager.#exec(
      `${API_DISP[Constants.GENERIC_TYPES.ELEMENT]}/delete_revision`,
      'POST',
      data
    );

  static getVersions = (disp, params) =>
    ExternalManager.#exec(
      `${API_DISP[Constants.GENERIC_TYPES.ELEMENT]}/${disp}_revisions.json`,
      'GET',
      null,
      params
    );

  static saveTemplate = (disp, data = {}) =>
    ExternalManager.#exec(`${API_DISP[disp]}/create_repo_klass`, 'POST', data);

  static getAllTemplates = (disp) =>
    ExternalManager.#exec(`${API_DISP[disp]}/fetch_repo`);
}

export default ExternalManager;
