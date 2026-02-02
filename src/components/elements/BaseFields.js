import { FieldTypes } from 'generic-ui-core';
import BaseFieldTypes from '@components/elements/BaseFieldTypes';

const ElementFieldTypes = [
  {
    value: FieldTypes.F_DRAG_MOLECULE,
    name: FieldTypes.F_DRAG_MOLECULE,
    label: 'Link Molecule',
  },
  {
    value: FieldTypes.F_DRAG_SAMPLE,
    name: FieldTypes.F_DRAG_SAMPLE,
    label: 'Link Sample',
  },
  {
    value: FieldTypes.F_INPUT_GROUP,
    name: FieldTypes.F_INPUT_GROUP,
    label: 'Input Group',
  },
  {
    value: FieldTypes.F_TEXT_FORMULA,
    name: FieldTypes.F_TEXT_FORMULA,
    label: 'Text-Formula',
  },
  { value: FieldTypes.F_TABLE, name: FieldTypes.F_TABLE, label: 'Table' },
  { value: FieldTypes.F_UPLOAD, name: FieldTypes.F_UPLOAD, label: 'Upload' },
];

const SegmentFieldTypes = ElementFieldTypes;

const UnsVocTypes = [
  {
    value: FieldTypes.F_DUMMY,
    name: FieldTypes.F_DUMMY,
    label: 'Dummy',
  },
  {
    value: FieldTypes.F_FORMULA_FIELD,
    name: FieldTypes.F_FORMULA_FIELD,
    label: 'Formula-Field',
  },
  {
    value: FieldTypes.F_TABLE,
    name: FieldTypes.F_TABLE,
    label: 'Table',
  },
  {
    value: FieldTypes.F_TEXT_FORMULA,
    name: FieldTypes.F_TEXT_FORMULA,
    label: 'Text-Formula',
  },
];

export const FieldBase = BaseFieldTypes;
export const ElementBase = BaseFieldTypes.concat(ElementFieldTypes);
export const SegmentBase = BaseFieldTypes.concat(SegmentFieldTypes);
export const UnsVocBase = UnsVocTypes;
