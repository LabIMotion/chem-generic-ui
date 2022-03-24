/* eslint-disable no-restricted-globals */
import { findIndex, cloneDeep } from 'lodash';
import { genUnits, toBool, toNum } from './utils';
import organizeSubValues from './collate';

// current generic value, new klass value
const reinventGeneric = (generic, klass) => {
  if (!generic || !klass || !generic.properties || !klass.properties_release) {
    return [undefined, undefined];
  }
  const newProps = cloneDeep(klass.properties_release);
  newProps.klass = generic.properties.klass;
  newProps.klass_uuid = klass.uuid;
  Object.keys(newProps.layers).forEach((key) => {
    const newLayer = newProps.layers[key] || {};
    const curFields = (generic.properties.layers[key] && generic.properties.layers[key].fields)
      || [];
    (newLayer.fields || []).forEach((f, idx) => {
      const curIdx = findIndex(curFields, o => o.field === f.field);
      if (curIdx >= 0) {
        const curVal = generic.properties.layers[key].fields[curIdx].value;
        const curType = typeof curVal;
        if (['select', 'text', 'textarea', 'formula-field'].includes(newProps.layers[key].fields[idx].type)) {
          newProps.layers[key].fields[idx].value = curType !== 'undefined' ? curVal.toString() : '';
        }
        if (newProps.layers[key].fields[idx].type === 'integer') {
          newProps.layers[key].fields[idx].value = (curType === 'undefined' || curType === 'boolean' || isNaN(curVal)) ? 0 : parseInt(curVal, 10);
        }
        if (newProps.layers[key].fields[idx].type === 'checkbox') {
          newProps.layers[key].fields[idx].value = curType !== 'undefined' ? toBool(curVal) : false;
        }
        if ((newProps.layers[key].fields[idx].type === 'drag_sample' && generic.properties.layers[key].fields[curIdx].type === 'drag_sample')
        || (newProps.layers[key].fields[idx].type === 'drag_molecule' && generic.properties.layers[key].fields[curIdx].type === 'drag_molecule')) {
          if (typeof curVal !== 'undefined') newProps.layers[key].fields[idx].value = curVal;
        }
        if (newProps.layers[key].fields[idx].type === 'system-defined') {
          const units = genUnits(newProps.layers[key].fields[idx].option_layers);
          const vs = units.find(u => u.key === generic.properties.layers[key].fields[curIdx].value_system);
          newProps.layers[key].fields[idx].value_system = (vs && vs.key) || units[0].key;
          newProps.layers[key].fields[idx].value = toNum(curVal);
        }
        if (newProps.layers[key].fields[idx].type === 'input-group') {
          if (generic.properties.layers[key].fields[curIdx].type
            !== newProps.layers[key].fields[idx].type) {
            newProps.layers[key].fields[idx].value = undefined;
          } else {
            const nSubs = newProps.layers[key].fields[idx].sub_fields || [];
            const cSubs = generic.properties.layers[key].fields[curIdx].sub_fields || [];
            const exSubs = [];
            if (nSubs.length < 1) {
              newProps.layers[key].fields[idx].value = undefined;
            } else {
              nSubs.forEach((nSub) => {
                const hitSub = cSubs.find(c => c.id === nSub.id) || {};
                if (nSub.type === 'label') { exSubs.push(nSub); }
                if (nSub.type === 'text') {
                  if (hitSub.type === 'label') {
                    exSubs.push(nSub);
                  } else { exSubs.push({ ...nSub, value: (hitSub.value || '').toString() }); }
                }
                if (['number', 'system-defined'].includes(nSub.type)) {
                  const nvl = (typeof hitSub.value === 'undefined' || hitSub.value == null || hitSub.value.length === 0) ? '' : toNum(hitSub.value);
                  if (nSub.option_layers === hitSub.option_layers) {
                    exSubs.push({ ...nSub, value: nvl, value_system: hitSub.value_system });
                  } else {
                    exSubs.push({ ...nSub, value: nvl });
                  }
                }
              });
            }
            newProps.layers[key].fields[idx].sub_fields = exSubs;
          }
        }
        if (newProps.layers[key].fields[idx].type === 'upload') {
          if (generic.properties.layers[key].fields[curIdx].type
            === newProps.layers[key].fields[idx].type) {
            newProps.layers[key].fields[idx].value = generic.properties.layers[key].fields[curIdx].value;
          } else {
            newProps.layers[key].fields[idx].value = {};
          }
        }
        if (newProps.layers[key].fields[idx].type === 'table') {
          if (generic.properties.layers[key].fields[curIdx].type
            !== newProps.layers[key].fields[idx].type) {
            newProps.layers[key].fields[idx].sub_values = [];
          } else {
            newProps.layers[key].fields[idx].sub_values = organizeSubValues(
              newProps.layers[key].fields[idx],
              generic.properties.layers[key].fields[curIdx]
            );
          }
        }
      }
    });
  });
  return [generic.properties, newProps];
};

export default reinventGeneric;
