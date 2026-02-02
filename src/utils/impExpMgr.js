import ApiExecutor from '@utils/apiExecutor';

class ImpExpManager {
  // a private static method
  static #execRaw = ApiExecutor.execRaw;

  static exportTable = (id, params) =>
    ImpExpManager.#execRaw(`exporter/table_xlsx/${id}`, 'GET', null, params);
}

export default ImpExpManager;
