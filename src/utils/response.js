const { name, version } = require('../../package.json');

export default class Response {
  constructor(_notify, _element) {
    const [notify, element] = [_notify, _element];
    element.pkg = { name, version };
    Object.assign(this, { notify, element });
  }
}
