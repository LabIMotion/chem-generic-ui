import React from 'react';
import { v4 as uuid } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import { FieldTypes, getUnitSystem } from 'generic-ui-core';
import Attachment from '@components/models/Attachment';
import Constants from '@components/tools/Constants';
import FieldTooltip from '@components/fields/FieldTooltip';
import DocuConst from '@components/tools/DocuConst';

const KlzIcon = (klz, klzSty) => <span className={klz} style={klzSty} />;

// move from GenericElCommon.js > UploadInputChange
const uploadFiles = (properties, event, field, layer) => {
  const files = [];
  const fieldObj =
    properties.layers[`${layer}`].fields.find((e) => e.field === field) || {};
  const value = fieldObj.value || {};
  switch (event.action) {
    case 'l': {
      const valIdx = findIndex(value.files || [], (o) => o.uid === event.uid);
      const label =
        event && event.val && event.val.target && event.val.target.value;
      if (value.files[valIdx] && label) value.files[valIdx].label = label;
      break;
    }
    case 'f': {
      (event.val || []).forEach((file) => {
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
      const valIdx = findIndex(value.files || [], (o) => o.uid === event.uid);
      if (valIdx >= 0 && value.files && value.files.length > 0)
        value.files.splice(valIdx, 1);
      return [value, files, event.uid];
    }
    default:
      console.log(event);
  }
  return [value, files];
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

// TODO: Remove this function, maybe not needed
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

const genUnitSup = (val) => {
  if (typeof val === 'undefined' || val === null || val === '') return '';
  const vals = val.match(
    /<\s*(\w+\b)(?:(?!<\s*\/\s*\1\b)[\s\S])*<\s*\/\s*\1\s*>|[^<]+/g,
  );
  const reV = vals.map((v) => {
    const supVal = v.match(/<sup[^>]*>([^<]+)<\/sup>/);
    if (supVal) return <sup key={uuid()}>{supVal[1]}</sup>;
    const subVal = v.match(/<sub[^>]*>([^<]+)<\/sub>/);
    if (subVal) return <sub key={uuid()}>{subVal[1]}</sub>;
    return v;
  });
  return <span>{reV}</span>;
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

const storeFlow = (props) => {
  const { elements } = props;
  const els = cloneDeep(elements);
  els.map((d) => {
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

const buildDocPath = (segments, hash = '') => {
  const path = [DocuConst.DOC_SITE, ...segments].join('/');
  return hash ? `${path}#${hash}` : path;
};

const docDesignerBase = ['designer', 'components'];
const docFields = buildDocPath([...docDesignerBase, 'fields']);

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
  si: {
    label: 'Measured Parameter',
    doc: [docFields, '/types', '/system-defined', '#system-units'].join(''),
  },
  supportedUnits: {
    label: 'Set Default Unit',
    doc: [docFields, '/types', '/system-defined', '#supported-units'].join(''),
  },
  // designer
  designer: {
    label: 'LabIMotion Designer',
    doc: [DocuConst.DOC_SITE, 'designer'].join('/'),
  },
  restrictionSetting: {
    label: 'Restriction Setting',
    doc: [docFields, 'layers', 'restriction-setting'].join(''),
  },
  templateFeatures: {
    label: 'Template Features',
    doc: [DocuConst.DOC_SITE, 'designer', 'template-features'].join('/'),
  },
};

const getFieldProps = (name) => {
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

const frmSelSty = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({ ...base, zIndex: 9999 }),
  control: (base) => ({
    ...base,
    minHeight: '31px',
    height: '31px',
    border: '1px solid #ced4da',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#80bdff',
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 8px',
    height: '29px',
  }),
  singleValue: (base) => ({
    ...base,
    marginTop: '0',
    lineHeight: '29px',
  }),
  multiValue: (base) => ({
    ...base,
    lineHeight: 'normal',
  }),
  input: (base) => ({
    ...base,
    margin: '0',
    padding: '0',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: '29px',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: '4px',
  }),
};

const storeOptions = (options) => {
  // First check if options is an array
  if (!Array.isArray(options)) {
    return [];
  }

  // Empty array is valid
  if (options.length === 0) {
    return [];
  }

  // Check if all elements are objects with a 'value' property
  if (
    !options.every(
      (item) => item && typeof item === 'object' && 'value' in item,
    )
  ) {
    return [];
  }

  // Filter out objects with falsy values and remove duplicates
  return Array.from(
    new Map(
      options.filter((item) => item.value).map((item) => [item.value, item]),
    ).values(),
  ).map((item) => ({ value: item.value }));
};

const transformValues = (options) => {
  if (!Array.isArray(options)) {
    return [];
  }
  return options
    .map((item) => item.value)
    .filter((value) => value !== null && typeof value !== 'object')
    .map(String);
};

const getAssociationStatus = (id, taggable) => {
  if (taggable.element?.id === id) {
    return false;
  }
  return !!(taggable.reaction_id || taggable.wellplate_id || taggable.element);
};

const permitTargets = Object.values(Constants.PERMIT_TARGET);
const srcElement = Constants.PERMIT_TARGET.ELEMENT;
const srcElements = [
  Constants.PERMIT_TARGET.SAMPLE,
  Constants.PERMIT_TARGET.MOLECULE,
];
const exceptElements = srcElements.concat([Constants.PERMIT_TARGET.GRID]);

// source could be one of sample, molecule, element
// when element, return all permit targets except sample and molecule and grid
const searchTargets = (source) => {
  if (srcElements.includes(source[0])) {
    return source;
  }
  return permitTargets.filter((t) => !exceptElements.includes(t));
};

const userData = (user) => {
  const userObj = user || {};
  const id = userObj.id;
  if (!id) return { id: '', name: '', email: '' };

  const name = `${userObj?.first_name} ${userObj?.last_name}` || '';
  const email = userObj?.email || '';
  return { id, name, email };
}

const defaultVSystem = (si) => {
  const sis = getUnitSystem();
  const fSi = sis.filter((e) => e.field === si)[0];
  if (!fSi || Object.keys(fSi).length === 0) return null; // return if SI is not found

  return fSi?.units[0];
};

// true → {}, { a: 1 }, any plain object
// false → "hello", "", "2", 2, 3.14, null, []
const isObject = (value) => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export {
  defaultVSystem,
  isObject,
  searchTargets,
  frmSelSty,
  GenericDummy,
  genUnitSup,
  inputEventVal,
  molOptions,
  samOptions,
  storeFlow,
  uploadFiles,
  KlzIcon,
  fieldCls,
  getAssociationStatus,
  getFieldProps,
  permitTargets,
  srcElement,
  srcElements,
  storeOptions,
  transformValues,
  userData,
};
