import React from 'react';
import { v4 as uuid } from 'uuid';
import { findIndex, cloneDeep } from 'lodash';
import { FieldTypes } from 'generic-ui-core';
import Attachment from '../models/Attachment';
import FieldTooltip from '../fields/FieldTooltip';
import DocuConst from './DocuConst';

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

// fd: from layer; value: from cond;
const isCheckboxMatch = (fd, value) => {
  const falseValues = ['false', 'no', 'f', '0'];
  const trueValues = ['true', 'yes', 't', '1'];
  const normalizedValue = (value || 'false').trim().toLowerCase();

  const isFalseMatch =
    falseValues.includes(normalizedValue) && (fd.value || false) === false;
  const isTrueMatch =
    trueValues.includes(normalizedValue) && (fd.value || false) === true;

  return fd.type === FieldTypes.F_CHECKBOX && (isFalseMatch || isTrueMatch);
};

const isSelectMatch = (fd, value) =>
  fd.type === FieldTypes.F_SELECT &&
  (fd.value || '').trim() === (value || '').trim();

const isTextMatch = (fd, value) =>
  fd.type === FieldTypes.F_TEXT &&
  (fd.value || '').trim() === (value || '').trim();

// ConditionOperator = 1 (ANY), 9 (ALL), 0 (NONE)
const showProperties = (dataObj, layers) => {
  // always show because no restriction
  if (!dataObj?.cond_fields?.length) return [true, ''];

  // default operator is ANY(1)
  const matchOp = dataObj.cond_operator ?? 1;
  let matchCount = 0;

  for (let i = 0; i < dataObj.cond_fields.length; i += 1) {
    const { layer, field, value, label } = dataObj.cond_fields[i] || {};

    if (!field) return [true, ''];

    const fd = layers[layer]?.fields?.find(f => f.field === field) || {};

    if (
      isCheckboxMatch(fd, value) ||
      isSelectMatch(fd, value) ||
      isTextMatch(fd, value)
    ) {
      matchCount += 1;

      // if match ANY, return true immediately if any condition is met
      if (matchOp === 1) {
        return [true, label];
      }
    }
  }

  // if match NONE, return true only if no condition is met
  // if match ALL, return true only if all conditions are met
  if (matchOp === 0) return [matchCount === 0, ''];
  if (matchOp === 9) return [matchCount === dataObj.cond_fields.length, ''];

  return [false, ''];
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
  if (type.startsWith(FieldTypes.F_DRAG)) {
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

export const resetProperties = _props => {
  if (!_props || typeof _props === 'undefined') return _props;

  Object.keys(_props.layers).forEach(key => {
    const newLayer = _props.layers[key] || {};
    newLayer.ai = [];
    (newLayer.fields || []).forEach((f, idx) => {
      if (
        f &&
        [
          FieldTypes.F_DRAG_SAMPLE,
          FieldTypes.F_DRAG_ELEMENT,
          FieldTypes.F_UPLOAD,
        ].includes(f.type)
      ) {
        newLayer.fields[idx].value = null;
      }
      if (f && f.type === FieldTypes.F_TABLE) {
        newLayer.fields[idx].sub_values = [];
      }
    });
  });
  return _props;
};

const docFields = [
  DocuConst.DOC_SITE,
  'guides',
  'designer',
  'components',
  'fields',
].join('/');
const propDefault = {
  cols: {
    label: 'Column Width Division',
    // tooltip: [
    //   'Determine the portion of the row width allocated to this component.',
    //   "Specify how much of the row width this component occupies.",
    // ].join(' '),
    doc: [docFields, '#column-width-division'].join(''),
  },
  description: {
    label: 'Hover Info',
    doc: [docFields, '#hover-info'].join(''),
  },
  field: {
    label: 'Field Name',
    doc: [docFields, '#field-name'].join(''),
  },
  hasOwnRow: {
    label: 'Has its own line',
    doc: [docFields, '#has-its-own-line'].join(''),
  },
  label: { label: 'Display Name', doc: [docFields, '#display-name'].join('') },
  placeholder: {
    label: 'Placeholder',
    doc: [docFields, '/types', '/text', '#placeholder'].join(''),
  },
  type: {
    label: 'Type',
    doc: [docFields, '/types'].join(''),
  },
  // special cases
  canAdjust: {
    label: 'Can adjust?',
    doc: [docFields, '/types', '/formula-field', '#can-adjust'].join(''),
  },
  decimal: {
    label: 'Decimal',
    doc: [docFields, '/types', '/formula-field', '#decimal'].join(''),
  },
  formula: {
    label: 'Formula',
    doc: [docFields, '/types', '/formula-field', '#formula'].join(''),
  },
  options: {
    label: 'Options',
    doc: [docFields, '/types', '/select', '#options'].join(''),
  },
  readonly: {
    label: 'Readonly',
    doc: [docFields, '/types', '/text', '#read-only'].join(''),
  },
  required: {
    label: 'Required',
    doc: [docFields, '/types', '/text', '#required'].join(''),
  },
  supportedUnits: {
    label: 'Default unit',
    doc: [docFields, '/types', '/system-defined', '#supported-units'].join(''),
  },
  // designer
  designer: {
    label: 'LabIMotion Designer',
    doc: [DocuConst.DOC_SITE, 'guides', 'designer'].join('/'),
  },
  templateFeatures: {
    label: 'Template Features',
    doc: [DocuConst.DOC_SITE, 'guides', 'designer', 'template-features'].join(
      '/'
    ),
  },
};

const getFieldProps = name => {
  if (!propDefault[name]) return {};
  return {
    label: propDefault[name].label,
    fieldTooltip: (
      <FieldTooltip
        tooltip={propDefault[name].tooltip}
        link={propDefault[name].doc}
      />
    ),
  };
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
  getFieldProps,
};
