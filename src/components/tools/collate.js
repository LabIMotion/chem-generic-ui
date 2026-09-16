import cloneDeep from 'lodash/cloneDeep';
import { FieldTypes } from 'generic-ui-core';
import GenericSubField from '@components/models/GenericSubField';
import { ontologyTermKey } from '@utils/pureUtils';

const collateValues = (
  currentFields,
  previousFields,
  previousValues,
  selectOptions = {},
) => {
  const result = [];
  let newSub = new GenericSubField();
  currentFields.map((e) => Object.assign(newSub, { [e.id]: '' }));
  const currentValuKeys = Object.keys(newSub);
  const previousValueKeys = Object.keys(previousValues[0]);
  const notInCurrent = previousValueKeys.filter(
    (e) => !currentValuKeys.includes(e),
  );
  const currObj = {};
  currentFields.map((c) => {
    if (c.type === FieldTypes.F_TEXT)
      return Object.assign(currObj, { [c.id]: '' });
    if (c.type === FieldTypes.F_SELECT_MULTI)
      return Object.assign(currObj, { [c.id]: { value: [] } });
    return Object.assign(currObj, {
      [c.id]: { value: '', value_system: c.value_system },
    });
  });
  previousValues.forEach((e) => {
    newSub = new GenericSubField();
    Object.assign(newSub, currObj, e);
    notInCurrent.forEach((c) => delete newSub[c]);
    previousValueKeys.forEach((preKey) => {
      if (newSub[preKey] === undefined || preKey === 'id') return;
      const curr = currentFields.find((f) => f.id === preKey);
      const prev = previousFields.find((f) => f.id === preKey);
      if (curr.type === FieldTypes.F_DRAG_MOLECULE) {
        if (
          [
            FieldTypes.F_TEXT,
            FieldTypes.F_SYSTEM_DEFINED,
            FieldTypes.F_DRAG_SAMPLE,
          ].includes(prev.type)
        ) {
          newSub[preKey] = { value: undefined };
        }
      }
      if (curr.type === FieldTypes.F_TEXT) {
        if (prev.type === FieldTypes.F_SYSTEM_DEFINED) {
          newSub[preKey] = newSub[preKey].value;
        }
        if (
          [FieldTypes.F_DRAG_MOLECULE, FieldTypes.F_DRAG_SAMPLE].includes(
            prev.type,
          )
        ) {
          newSub[preKey] = '';
        }
      }
      if (curr.type === FieldTypes.F_SYSTEM_DEFINED) {
        // within the same quantity a row keeps its own value and unit as
        // entered; a magnitude carried into another quantity is meaningless
        const quantityChanged =
          prev.type === FieldTypes.F_SYSTEM_DEFINED &&
          curr.option_layers !== prev.option_layers;
        if (
          quantityChanged ||
          [
            FieldTypes.F_TEXT,
            FieldTypes.F_DRAG_MOLECULE,
            FieldTypes.F_DRAG_SAMPLE,
          ].includes(prev.type)
        ) {
          newSub[preKey] = { value: '', value_system: curr.value_system };
        }
      }
      if (curr.type === FieldTypes.F_SELECT) {
        if (
          prev.type !== FieldTypes.F_SELECT ||
          curr.option_layers !== prev.option_layers
        ) {
          newSub[preKey] = { value: '' };
        } else {
          // Same source — check if the stored value still exists in the current options
          const validKeys = new Set(
            (selectOptions[curr.option_layers]?.options || []).map(
              (o) => o.key,
            ),
          );
          if (!validKeys.has(newSub[preKey]?.value)) {
            newSub[preKey] = { value: '' };
          }
        }
      }
      if (curr.type === FieldTypes.F_ONTOLOGY_SELECT) {
        const currKey = ontologyTermKey(curr.ontology_term);
        const prevKey = ontologyTermKey(prev.ontology_term);
        if (prev.type !== FieldTypes.F_ONTOLOGY_SELECT || currKey !== prevKey) {
          // Column scope changed: the cell belongs to a different ontology tree.
          newSub[preKey] = { value: '' };
        }
      }
      if (curr.type === FieldTypes.F_SELECT_MULTI) {
        if (
          prev.type !== FieldTypes.F_SELECT_MULTI ||
          curr.option_layers !== prev.option_layers
        ) {
          newSub[preKey] = { value: [] };
        } else {
          // Same source — filter out values that no longer exist in the current options
          const validKeys = new Set(
            (selectOptions[curr.option_layers]?.options || []).map(
              (o) => o.key,
            ),
          );
          const filtered = (newSub[preKey]?.value || []).filter((v) =>
            validKeys.has(v),
          );
          newSub[preKey] = { value: filtered };
        }
      }
    });
    result.push(newSub);
  });
  return result;
};

const organizeSubValues = (cur, pre, selectOptions = {}) => {
  const currentFields = cloneDeep(cur.sub_fields || []);
  const previousFields = cloneDeep(pre.sub_fields || []);
  const previousValues = cloneDeep(pre.sub_values || []);
  if (
    currentFields.length < 1 ||
    previousFields.length < 1 ||
    previousValues.length < 1
  ) {
    return [];
  }
  return collateValues(
    currentFields,
    previousFields,
    previousValues,
    selectOptions,
  );
};

export default organizeSubValues;
