import { FieldTypes } from 'generic-ui-core';
import BaseFieldTypes from './BaseFieldTypes';

const ElementFieldTypes = [
  {
    value: FieldTypes.F_DRAG_MOLECULE,
    name: FieldTypes.F_DRAG_MOLECULE,
    label: 'Drag Molecule',
  },
  {
    value: FieldTypes.F_DRAG_SAMPLE,
    name: FieldTypes.F_DRAG_SAMPLE,
    label: 'Drag Sample',
  },
  {
    value: FieldTypes.F_DRAG_ELEMENT,
    name: FieldTypes.F_DRAG_ELEMENT,
    label: 'Drag Element',
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

const SegmentFieldTypes = [
  {
    value: FieldTypes.F_DRAG_SAMPLE,
    name: FieldTypes.F_DRAG_SAMPLE,
    label: 'Drag Sample',
  },
  {
    value: FieldTypes.F_DRAG_ELEMENT,
    name: FieldTypes.F_DRAG_ELEMENT,
    label: 'Drag Element',
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
  {
    value: FieldTypes.F_DRAG_MOLECULE,
    name: FieldTypes.F_DRAG_MOLECULE,
    label: 'Drag Molecule',
  },
  { value: FieldTypes.F_TABLE, name: FieldTypes.F_TABLE, label: 'Table' },
  { value: FieldTypes.F_UPLOAD, name: FieldTypes.F_UPLOAD, label: 'Upload' },
];

export const FieldBase = BaseFieldTypes;
export const ElementBase = BaseFieldTypes.concat(ElementFieldTypes);
export const SegmentBase = BaseFieldTypes.concat(SegmentFieldTypes);
