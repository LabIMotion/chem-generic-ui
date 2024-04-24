import Field from '../models/Field';

export default class Layer {
  constructor(args) {
    this.ai = [];
    this.color = 'none';
    this.cols = 1;
    this.label = '';
    this.position = 0;
    this.style = 'panel_generic_heading';
    this.wf = false;
    this.wf_position = 0;

    Object.assign(this, args);
    if (!this.key) {
      this.key = args.sys ? `${args.sys}-${Layer.buildID()}` : Layer.buildID();
    }
    this.fields = [];
  }

  static buildID() {
    return Date.now().toString();
  }

  addField(args) {
    const field = new Field(args);
    this.fields.push(field);
  }
}
