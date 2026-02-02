import ApiExecutor from '@utils/apiExecutor';
import Constants from '@components/tools/Constants';

const API_DISP = {
  [Constants.GENERIC_TYPES.ELEMENT]: 'generic_elements',
  [Constants.GENERIC_TYPES.SEGMENT]: 'segments',
  [Constants.GENERIC_TYPES.DATASET]: 'generic_dataset',
};

class ExternalManager {
  // a private static method
  static #exec = ApiExecutor.exec;
  static #execRaw = ApiExecutor.execRaw;

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

  static exportAsFile = (params) =>
    ExternalManager.#execRaw(
      `${API_DISP[Constants.GENERIC_TYPES.ELEMENT]}/export.json`,
      'GET',
      null,
      params
    );
}

export default ExternalManager;
