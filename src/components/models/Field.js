import GenericSubField from './GenericSubField';

export default class Field extends GenericSubField {
  constructor(args) {
    super({
      default: '',
      field: '',
      label: '',
      position: 0,
      required: false,
      sub_fields: [],
      text_sub_fields: [],
      // type: '',
      ...args,
    });
  }
}
