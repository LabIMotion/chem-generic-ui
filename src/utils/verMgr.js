import ApiExecutor from '@utils/apiExecutor';

const API_EL = 'generic_elements';
const API_SG = 'segments';
const API_DS = 'generic_dataset';

const API_KS = 'generic_klass';

class VerManager {
  static #exec = async (apiPrefix, endpoint, method = 'GET', params = null) => {
    const fullEndpoint = `${apiPrefix}/${endpoint}`;
    const data = method === 'GET' ? null : params;
    const queryParams = method === 'GET' ? params || {} : {};

    return ApiExecutor.exec(fullEndpoint, method, data, queryParams);
  };

  static klassRevisions = (params = {}) =>
    VerManager.#exec(API_EL, 'klass_revisions.json', 'GET', params);

  static revisions = ({ type, id } = {}) =>
    VerManager.#exec(API_EL, `${type}_revisions.json`, 'GET', { id });

  static deleteKlassRevision = (data) =>
    VerManager.#exec(API_EL, 'delete_klass_revision', 'POST', data);

  static deleteRevision = (data) =>
    VerManager.#exec(API_EL, 'delete_revision', 'POST', data);

  static listELKlass = (params = {}) =>
    VerManager.#exec(API_EL, 'list_element_klass.json', 'GET', params);

  static listSGKlass = (params = {}) =>
    VerManager.#exec(API_SG, 'list_segment_klass.json', 'GET', params);

  static listDSKlass = (params = {}) =>
    VerManager.#exec(API_DS, 'list_klass.json', 'GET', params);

  static deActivateKlass = (params = {}) =>
    VerManager.#exec(API_KS, 'de_activate', 'POST', params);

  static fetchKlass = (params = {}) =>
    VerManager.#exec(API_KS, 'fetch', 'GET', params);

  static updateTemplate = (params = {}) =>
    VerManager.#exec(API_EL, 'update_template', 'POST', params);

  static listELby = (params = {}) =>
    VerManager.#exec(API_EL, 'search_by_like', 'GET', params);

  static listBasicELby = (params = {}) =>
    VerManager.#exec(API_EL, 'search_basic_by_like', 'GET', params);

  static dispatchListELby = (params = {}) => {
    const { name, short_label, selected_klass, limit } = params;

    if (selected_klass.klass.is_generic) {
      return VerManager.listELby({
        name,
        short_label,
        klass_id: selected_klass.klass.id,
        limit,
      });
    } else {
      return VerManager.listBasicELby({
        name,
        short_label,
        klass_name: selected_klass.klass.name,
        limit,
      });
    }
  };
}

export default VerManager;
