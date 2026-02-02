import Api from '@utils/api';
import Response from '@utils/response';
import { mc2res } from '@components/tools/format-utils';

const API_VOC = 'vocab';

class VocabManager {
  // a private static method
  static #exec = async (endpoint, method = 'GET', params = null) => {
    const fullEndpoint = `${API_VOC}/${endpoint}`;
    const res = params
      ? await Api.execApiData(params, fullEndpoint)
      : await Api.execApi(fullEndpoint, method);
    // return mc2res(res.mc, res.msg || '');
    // { mc: 'aaa', msg: 'xxx', data: JSON Object or array}
    return new Response(mc2res(res.mc, res.msg || ''), { data: res.data });
  };

  static saveVocabulary = (params = {}) =>
    VocabManager.#exec('save_vocabulary', 'POST', params);

  static deleteVocabulary = (vocabularyId) =>
    VocabManager.#exec(`delete_vocabulary/${vocabularyId}`, 'DELETE');

  static getVocabulary = (vocabularyId) =>
    VocabManager.#exec(`get_vocabulary/${vocabularyId}`);

  static getAllVocabularies = () => VocabManager.#exec('get_all_vocabularies');
}

export default VocabManager;
