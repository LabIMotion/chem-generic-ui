import cloneDeep from 'lodash/cloneDeep';
const { name, version } = require('@root/package.json');

export default class Response {
  constructor(_notify, _element) {
    this.notify = _notify;
    // Avoid mutating the input object.
    // If _element is an object, we copy it and merge the pkg info.
    if (_element && typeof _element === 'object' && !Array.isArray(_element)) {
      this.element = cloneDeep(_element);
      this.element.pkg = Object.assign({}, this.element.pkg, { name, version });
    } else {
      this.element = _element;
    }
  }
}
