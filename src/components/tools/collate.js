import cloneDeep from 'lodash/cloneDeep';
import { unitConversion, FieldTypes } from 'generic-ui-core';
import GenericSubField from '@components/models/GenericSubField';

const collateValues = (currentFields, previousFields, previousValues) => {
  const result = [];
  let newSub = new GenericSubField();
  currentFields.map(e => Object.assign(newSub, { [e.id]: '' }));
  const currentValuKeys = Object.keys(newSub);
  const previousValueKeys = Object.keys(previousValues[0]);
  const notInCurrent = previousValueKeys.filter(e => !currentValuKeys.includes(e));
  const currObj = {};
  currentFields.map(c => {
    if (c.type === FieldTypes.F_TEXT) return Object.assign(currObj, { [c.id]: '' });
    return Object.assign(currObj, { [c.id]: { value: '', value_system: c.value_system } });
  });
  previousValues.forEach(e => {
    newSub = new GenericSubField();
    Object.assign(newSub, currObj, e);
    notInCurrent.forEach(c => delete newSub[c]);
    previousValueKeys.forEach(preKey => {
      if (newSub[preKey] === undefined || preKey === 'id') return;
      const curr = currentFields.find(f => f.id === preKey);
      const prev = previousFields.find(f => f.id === preKey);
      if (curr.type === FieldTypes.F_DRAG_MOLECULE) {
        if ([FieldTypes.F_TEXT, FieldTypes.F_SYSTEM_DEFINED, FieldTypes.F_DRAG_SAMPLE].includes(prev.type)) {
          newSub[preKey] = { value: undefined };
        }
      }
      if (curr.type === FieldTypes.F_TEXT) {
        if (prev.type === FieldTypes.F_SYSTEM_DEFINED) {
          newSub[preKey] = newSub[preKey].value;
        }
        if ([FieldTypes.F_DRAG_MOLECULE, FieldTypes.F_DRAG_SAMPLE].includes(prev.type)) {
          newSub[preKey] = '';
        }
      }
      if (curr.type === FieldTypes.F_SYSTEM_DEFINED) {
        if (prev.type === FieldTypes.F_SYSTEM_DEFINED && (curr.option_layers !== prev.option_layers)) {
          newSub[preKey].value_system = curr.value_system;
        }
        if ([FieldTypes.F_TEXT, FieldTypes.F_DRAG_MOLECULE, FieldTypes.F_DRAG_SAMPLE].includes(prev.type)) {
          newSub[preKey] = { value: '', value_system: curr.value_system };
        }
        newSub[preKey].value = unitConversion(curr.option_layers, newSub[preKey].value_system, newSub[preKey].value);
      }
    });
    result.push(newSub);
  });
  return result;
};

const organizeSubValues = (cur, pre) => {
  const currentFields = cloneDeep(cur.sub_fields || []);
  const previousFields = cloneDeep(pre.sub_fields || []);
  const previousValues = cloneDeep(pre.sub_values || []);
  if (currentFields.length < 1
    || previousFields.length < 1 || previousValues.length < 1) {
    return [];
  }
  return collateValues(currentFields, previousFields, previousValues);
};

export default organizeSubValues;
