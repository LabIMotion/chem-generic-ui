import Api from '@utils/api';

const API_DS = 'generic_dataset';
const API_LA = 'layers';

export default class ApiManager extends Api {
  static execApi = (path, method = 'GET') => {
    return super.execApi(`${API_DS}/${path}`, method);
  };

  static execApiData = (data, path, method = 'POST') => {
    return super.execApiData(data, path, method);
  };

  static updateDSTemplate = (data, id) => {
    //
  };

  static listDSKlass = (params = {}) => {
    const api =
      params.is_active === undefined
        ? 'list_dataset_klass.json'
        : `list_dataset_klass.json?is_active=${params.is_active}`;
    return ApiManager.execApi(api);
  };

  static saveStdLayer = (params = {}) =>
    ApiManager.execApiData(params, `${API_LA}/save_standard_layer`);
}
