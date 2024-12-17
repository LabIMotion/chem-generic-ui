import { FieldTypes } from 'generic-ui-core';

const BaseFieldTypes = [
  { value: FieldTypes.F_INTEGER, name: FieldTypes.F_INTEGER, label: 'Integer' },
  {
    value: FieldTypes.F_DATETIME,
    name: FieldTypes.F_DATETIME,
    label: 'Date-Time Picker',
  },
  {
    value: FieldTypes.F_DATETIME_RANGE,
    name: FieldTypes.F_DATETIME_RANGE,
    label: 'Datetime range',
  },
  { value: FieldTypes.F_TEXT, name: FieldTypes.F_TEXT, label: 'Text' },
  {
    value: FieldTypes.F_TEXTAREA,
    name: FieldTypes.F_TEXTAREA,
    label: 'Text area',
  },
  { value: FieldTypes.F_SELECT, name: FieldTypes.F_SELECT, label: 'Select' },
  { value: 'select-multi', name: 'select-multi', label: 'Select (Multiple)' },
  {
    value: FieldTypes.F_CHECKBOX,
    name: FieldTypes.F_CHECKBOX,
    label: 'Checkbox',
  },
  {
    value: FieldTypes.F_SYSTEM_DEFINED,
    name: FieldTypes.F_SYSTEM_DEFINED,
    label: 'System-Defined',
  },
  {
    value: FieldTypes.F_FORMULA_FIELD,
    name: FieldTypes.F_FORMULA_FIELD,
    label: 'Formula-Field',
  },
];

export default BaseFieldTypes;
