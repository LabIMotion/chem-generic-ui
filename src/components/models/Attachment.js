import { v4 as uuid } from 'uuid';

export default class Attachment {
  constructor(args) {
    Object.assign(this, args);
    if (!this.id) { this.id = Attachment.buildID(); }
  }

  static buildID() { return uuid(); }

  static fromFile(file) {
    return new Attachment({
      file,
      name: file.name,
      filename: file.name,
      identifier: file.id,
      is_deleted: false,
    });
  }

  get isNew() {
    return this.is_new === true;
  }

  serialize() {
    return super.serialize({
      filename: this.filename,
      identifier: this.identifier,
      file: this.file,
      thumb: this.thumb,
      content_type: this.content_type,
      is_deleted: this.is_deleted,
      id: this.id,
      is_new: this.isNew || false
    });
  }
}
