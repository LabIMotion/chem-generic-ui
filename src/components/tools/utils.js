import React from 'react';
import { v4 as uuid } from 'uuid';
import { findIndex, cloneDeep } from 'lodash';
import { FieldTypes } from 'generic-ui-core';
import Attachment from '../models/Attachment';

const KlzIcon = (klz, klzSty) => <span className={klz} style={klzSty} />;

// key: always uppercase, value: depends on the fn
const createEnum = (arr, fn = 'toString') =>
  Object.freeze(
    arr.reduce((acc, cur) => {
      acc[cur.toUpperCase()] = cur[fn]();
      return acc;
    }, {})
  );

// move from GenericElCommon.js > UploadInputChange
const uploadFiles = (properties, event, field, layer) => {
  const files = [];
  const fieldObj =
    properties.layers[`${layer}`].fields.find(e => e.field === field) || {};
  const value = fieldObj.value || {};
  switch (event.action) {
    case 'l': {
      const valIdx = findIndex(value.files || [], o => o.uid === event.uid);
      const label =
        event && event.val && event.val.target && event.val.target.value;
      if (value.files[valIdx] && label) value.files[valIdx].label = label;
      break;
    }
    case 'f': {
      (event.val || []).forEach(file => {
        const uid = uuid();
        if (typeof value.files === 'undefined' || value.files === null)
          value.files = [];
        value.files.push({ uid, filename: file.name });
        files.push({
          uid,
          filename: file.name,
          file: Attachment.fromFile(file),
        });
      });
      break;
    }
    case 'd': {
      const valIdx = findIndex(value.files || [], o => o.uid === event.uid);
      if (valIdx >= 0 && value.files && value.files.length > 0)
        value.files.splice(valIdx, 1);
      return [value, files, event.uid];
    }
    default:
      console.log(event);
  }
  return [value, files];
};

// move from GenPropertiesLayer.js
const showProperties = (fObj, layers) => {
  let showField = true;
  if (fObj && fObj.cond_fields && fObj.cond_fields.length > 0) {
    showField = false;
    for (let i = 0; i < fObj.cond_fields.length; i += 1) {
      const cond = fObj.cond_fields[i] || {};
      const { layer, field, value } = cond;
      if (field && field !== '') {
        const fd =
          ((layers[layer] || {}).fields || []).find(f => f.field === field) ||
          {};
        if (
          fd.type === 'checkbox' &&
          ((['false', 'no', 'f', '0'].includes(
            (value || '').trim().toLowerCase()
          ) &&
            (typeof (fd && fd.value) === 'undefined' || fd.value === false)) ||
            (['true', 'yes', 't', '1'].includes(
              (value || '').trim().toLowerCase()
            ) &&
              typeof (fd && fd.value) !== 'undefined' &&
              fd.value === true))
        ) {
          showField = true;
          break;
        } else if (
          ['text', 'select'].includes(fd && fd.type) &&
          typeof (fd && fd.value) !== 'undefined' &&
          ((fd && fd.value) || '').trim() === (value || '').trim()
        ) {
          showField = true;
          break;
        }
      }
    }
  }
  return showField;
};

class GenericDummy {
  constructor() {
    this.type = FieldTypes.F_DUMMY;
    this.field = uuid();
    this.position = 100;
    this.label = '';
    this.default = '';
    this.required = false;
  }
}

const inputEventVal = (event, type) => {
  if (type === FieldTypes.F_SELECT) {
    return event ? event.value : null;
  }
  if (type.startsWith('drag')) {
    return event;
  }
  if (type === FieldTypes.F_CHECKBOX) {
    return event.target.checked;
  }
  if (type === FieldTypes.F_FORMULA_FIELD) {
    if (event.target) {
      return event.target.value;
    }
    return event;
  }
  return event.target && event.target.value;
};

const absOlsTermId = val => (val || '').split('|')[0].trim() || '';
const absOlsTermLabel = val =>
  val?.replace(absOlsTermId(val), '')?.replace('|', '').trim();
const toNum = val => {
  const parse = Number(val || '');
  return Number.isNaN(parse) ? 0 : parse;
};

const toNullOrInt = val => {
  if (val) {
    const parse = Number(val);
    return Number.isNaN(parse) ? null : parseInt(val, 10);
  }
  return null;
};

const genUnitSup = val => {
  if (typeof val === 'undefined' || val === null) return '';
  const vals = val.match(
    /<\s*(\w+\b)(?:(?!<\s*\/\s*\1\b)[\s\S])*<\s*\/\s*\1\s*>|[^<]+/g
  );
  const reV = vals.map(v => {
    const supVal = v.match(/<sup[^>]*>([^<]+)<\/sup>/);
    if (supVal) return <sup key={uuid()}>{supVal[1]}</sup>;
    const subVal = v.match(/<sub[^>]*>([^<]+)<\/sub>/);
    if (subVal) return <sub key={uuid()}>{subVal[1]}</sub>;
    return v;
  });
  return <span>{reV}</span>;
};

const toBool = val => {
  const valLower = String(val).toLowerCase();
  return !(!valLower || valLower === 'false' || valLower === '0');
};

const clsInputGroup = el => {
  if (!el) return el;
  const genericEl = el;
  const { layers } = genericEl.properties_template;
  const keys = Object.keys(layers);
  keys.forEach(key => {
    const layer = layers[key];
    layer.fields
      .filter(e => e.type === FieldTypes.F_INPUT_GROUP)
      .forEach(e => {
        e.sub_fields.forEach(s => {
          const ff = s;
          if (ff.type === FieldTypes.F_TEXT) {
            ff.value = '';
          }
        });
      });
  });
  return genericEl;
};

const molOptions = [
  { label: 'InChiKey', value: 'inchikey' },
  { label: 'SMILES', value: 'smiles' },
  { label: 'IUPAC', value: 'iupac' },
  { label: 'Mass', value: 'molecular_weight' },
];
const samOptions = [
  { label: 'Name', value: 'name' },
  { label: 'Ext. Label', value: 'external_label' },
  { label: 'Mass', value: 'molecular_weight' },
];

const storeFlow = props => {
  const { elements } = props;
  const els = cloneDeep(elements);
  els.map(d => {
    if (['default'].includes(d.type) && d.data) {
      delete d.data.label;
      delete d.data.layer;
    }
    return d;
  });
  return els;
};

const fieldCls = (isSpCall = false) => {
  const clsFrm = isSpCall ? 'gu_sp_form' : 'gu_sp_form_none';
  const clsCol = isSpCall ? 'gu_sp_column' : 'gu_sp_column_none';
  return [clsFrm, clsCol];
};

export const resetProperties = (_props) => {
  if (!_props || typeof _props === 'undefined') return _props;

  Object.keys(_props.layers).forEach((key) => {
    const _newLayer = _props.layers[key] || {};
    _newLayer.ai = [];
    (_newLayer.fields || []).forEach((f, idx) => {
      if (f && (f.type === 'drag_sample' || f.type === 'drag_element' || f.type === 'upload')) {
        _newLayer.fields[idx].value = null;
      }
      if (f && (f.type === 'table')) {
        _newLayer.fields[idx].sub_values = [];
      }
    });
  });
  return _props;
};


export {
  createEnum,
  GenericDummy,
  toBool,
  toNum,
  genUnitSup,
  absOlsTermId,
  absOlsTermLabel,
  clsInputGroup,
  inputEventVal,
  molOptions,
  samOptions,
  storeFlow,
  showProperties,
  uploadFiles,
  KlzIcon,
  fieldCls,
  toNullOrInt,
};
