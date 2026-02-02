import ApiExecutor from '@utils/apiExecutor';

class ExtAppManager {
  // a private static method
  static #exec = ApiExecutor.exec;

  static userProfile = () =>
    ExtAppManager.#exec('profiles.json');
}

export default ExtAppManager;
