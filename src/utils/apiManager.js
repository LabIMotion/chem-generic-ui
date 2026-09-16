import Api from '@utils/api';
import { ROUTES } from '@utils/apiCfg';
import { EPS } from '@utils/eps';

class ApiManager {
  static #exec = async (route, endpoint, params = {}, method = 'GET') => {
    const fullEndpoint = `${route}/${endpoint}`;
    const data = method === 'GET' ? null : params;
    const queryParams = method === 'GET' ? params : {};

    return data
      ? await Api.execApiData(data, fullEndpoint, method)
      : await Api.execApi(fullEndpoint, method, queryParams);
  };

  static getDSKlasses = (params = {}) =>
    ApiManager.#exec(ROUTES.GENERIC_DATASET, EPS.GET.DS_KLASSES, params);

  static getUsers = (params = {}) =>
    ApiManager.#exec(ROUTES.USER, EPS.GET.USERS, params);

  static getUser = (id) => ApiManager.#exec(ROUTES.USER, id);
}

export default ApiManager;
