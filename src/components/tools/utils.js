/* eslint-disable no-param-reassign */
/* eslint-disable object-curly-newline */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
// import PropTypes from 'prop-types';
// import { Button, OverlayTrigger, Tooltip, Popover, ControlLabel } from 'react-bootstrap';
// import uuid from 'uuid';
import { v4 as uuid } from 'uuid';
import { findIndex, findKey, cloneDeep } from 'lodash';
// import NotificationActions from '../../components/actions/NotificationActions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SystemUnits from '../../data/SystemUnits';
import Attachment from '../models/Attachment';

// move from GenericElCommon.js
const uploadFiles = (properties, event, field, layer) => {
  const files = [];
  const fieldObj = properties.layers[`${layer}`].fields.find(e => e.field === field) || {};
  const value = fieldObj.value || {};
  switch (event.action) {
    case 'l': {
      const valIdx = findIndex((value.files || []), o => o.uid === event.uid);
      const label = event && event.val && event.val.target && event.val.target.value;
      if (value.files[valIdx] && label) value.files[valIdx].label = label;
      break;
    }
    case 'f': {
      (event.val || []).forEach((file) => {
        const uid = uuid();
        if (typeof value.files === 'undefined' || value.files === null) value.files = [];
        value.files.push({ uid, filename: file.name });
        files.push({ uid, filename: file.name, file: Attachment.fromFile(file) });
      });
      break;
    }
    case 'd': {
      const valIdx = findIndex((value.files || []), o => o.uid === event.uid);
      if (valIdx >= 0 && value.files && value.files.length > 0) value.files.splice(valIdx, 1);
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
        const fd = ((layers[layer] || {}).fields || []).find(f => f.field === field) || {};
        if (fd.type === 'checkbox' && ((['false', 'no', 'f', '0'].includes((value || '').trim().toLowerCase()) && (typeof (fd && fd.value) === 'undefined' || fd.value === false)) ||
        (['true', 'yes', 't', '1'].includes((value || '').trim().toLowerCase()) && (typeof (fd && fd.value) !== 'undefined' && fd.value === true)))) {
          showField = true;
          break;
        } else if (['text', 'select'].includes(fd && fd.type) && (typeof (fd && fd.value) !== 'undefined' && ((fd && fd.value) || '').trim() === (value || '').trim())) {
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
    this.type = 'dummy';
    this.field = uuid();
    this.position = 100;
    this.label = '';
    this.default = '';
    this.required = false;
  }
}

const inputEventVal = (event, type) => {
  if (type === 'select') {
    return event ? event.value : null;
  } else if (type.startsWith('drag')) {
    return event;
  } else if (type === 'checkbox') {
    return event.target.checked;
  } else if (type === 'formula-field') {
    if (event.target) {
      return event.target.value;
    }
    return event;
  }
  return event.target && event.target.value;
};

const absOlsTermId = val => (val || '').split('|')[0].trim();
const absOlsTermLabel = val => val.replace(absOlsTermId(val), '').replace('|', '').trim();
const toNum = (val) => {
  const parse = Number((val || ''));
  return Number.isNaN(parse) ? 0 : parse;
};

const genUnitSup = (val) => {
  if (typeof val === 'undefined' || val === null) return '';
  const vals = val.match(/<\s*(\w+\b)(?:(?!<\s*\/\s*\1\b)[\s\S])*<\s*\/\s*\1\s*>|[^<]+/g);
  const reV = vals.map((v) => {
    const supVal = v.match(/<sup[^>]*>([^<]+)<\/sup>/);
    if (supVal) return <sup key={uuid()}>{supVal[1]}</sup>;
    const subVal = v.match(/<sub[^>]*>([^<]+)<\/sub>/);
    if (subVal) return <sub key={uuid()}>{subVal[1]}</sub>;
    return v;
  });
  return <span>{reV}</span>;
};

const toBool = (val) => {
  const valLower = String(val).toLowerCase();
  return !(!valLower || valLower === 'false' || valLower === '0');
};

const genUnitsSystem = () => (SystemUnits.SYSTEM_UNITS || {}).fields || [];

const genUnits = field => (genUnitsSystem().find(u => u.field === field) || {}).units || [];

const genUnit = (field, key) => {
  const units = genUnits(field);
  return units.find(u => u.key === key) || {};
};

const reUnit = (unitsSystem, optionLayers) => {
  const uniFileds = (unitsSystem.fields || []);
  const uniObj = uniFileds.find(fiel => fiel.field === optionLayers);
  const defaultUnit = ((uniObj && uniObj.field) || '');
  const preUnit = uniFileds.length > 0 ? uniFileds[0].field : '';
  return defaultUnit === '' ? preUnit : defaultUnit;
};

const convertTemp = (key, val) => {
  switch (key) {
    case 'F':
      return ((parseFloat(val) * 1.8) + 32).toFixed(2);
    case 'K':
      return (((parseFloat(val) + 459.67) * 5) / 9).toFixed(2);
    case 'C':
      return (parseFloat(val) - 273.15).toFixed(2);
    default:
      return val;
  }
};

const unitConvToBase = (field = {}) => {
  const units = genUnits(field.option_layers);
  if (units.length <= 1) {
    return field.value;
  }
  const idx = findIndex(units, u => u.key === field.value_system);
  if (idx <= 0) return field.value;
  return ((field.value * units[0].nm) / ((units[idx] && units[idx].nm) || 1) || 0);
};

const unitConversion = (field, key, val) => {
  if (typeof val === 'undefined' || val == null || val === 0 || val === '') {
    return val;
  }
  if (field === 'temperature') {
    return convertTemp(key, val);
  }
  const units = genUnits(field);
  if (units.length <= 1) {
    return val;
  }
  const idx = findIndex(units, u => u.key === key);
  if (idx === -1) {
    return val;
  }
  const pIdx = idx === 0 ? (units.length) : idx;
  const pre = (units[pIdx - 1] && units[pIdx - 1].nm) || 1;
  const curr = (units[idx] && units[idx].nm) || 1;
  return parseFloat((parseFloat(val) * (curr / pre)).toFixed(5));
};

// const notification = props =>
//   (
//     NotificationActions.add({
//       title: props.title,
//       message: props.msg,
//       level: props.lvl,
//       position: 'tc',
//       dismissible: 'button',
//       autoDismiss: props.autoDismiss || 5,
//       uid: props.uid || uuid.v4()
//     })
//   );

// const validateLayerInput = (layer, act = 'new') => {
//   if (layer.key === '') {
//     notification({ title: `Layer [${layer.key}]`, lvl: 'error', msg: 'Please input Name.' });
//     return false;
//   }
//   if (act === 'new' && !(/^[a-z][a-z_]+[a-z]$/g.test(layer.key))) {
//     notification({ title: `Layer [${layer.key}]`, lvl: 'error', msg: 'This Name is invalid, please try a different one.' });
//     return false;
//   }
//   if (parseInt((layer.cols || 1), 10) < 1) {
//     notification({ title: `Layer [${layer.key}]`, lvl: 'error', msg: 'The minimun of Column per Row is 1, please input a different one.' });
//     return false;
//   }
//   return true;
// };

// const validateSelectList = (selectName, element) => {
//   if (selectName === '') {
//     notification({ title: `Select List [${selectName}]`, lvl: 'error', msg: 'Please input Name.' });
//     return false;
//   }
//   if (!(/^[a-z][a-z_]+[a-z]$/g.test(selectName))) {
//     notification({ title: `Select List [${selectName}]`, lvl: 'error', msg: 'This Name is invalid, please try a different one.' });
//     return false;
//   }
//   if (element.properties_template.select_options[`${selectName}`]) {
//     notification({ title: `Select List [${selectName}]`, lvl: 'error', msg: 'This name of Select List is already taken. Please choose another one.' });
//     return false;
//   }
//   return true;
// };

const clsInputGroup = (el) => {
  if (!el) return el;
  const genericEl = el;
  const { layers } = genericEl.properties_template;
  const keys = Object.keys(layers);
  keys.forEach((key) => {
    const layer = layers[key];
    layer.fields.filter(e => e.type === 'input-group')
      .forEach((e) => {
        e.sub_fields.forEach((s) => {
          const ff = s;
          if (ff.type === 'text') { ff.value = ''; }
        });
      });
  });
  return genericEl;
};

const molOptions = [{ label: 'InChiKey', value: 'inchikey' }, { label: 'SMILES', value: 'smiles' }, { label: 'IUPAC', value: 'iupac' }, { label: 'Mass', value: 'molecular_weight' }];
const samOptions = [{ label: 'Name', value: 'name' }, { label: 'Ext. Label', value: 'external_label' }, { label: 'Mass', value: 'molecular_weight' }];

const findCurrentNode = (_srcKey, _layerVals) => {
  const result = [];
  const fs = _layerVals.filter(o => o.wf && o.wf_info && o.wf_info.source_layer === _srcKey);
  if (fs.length > 1) {
    fs.forEach((o) => {
      findCurrentNode(o, _layerVals);
    });
  } else if (fs.length === 1) {
    return findCurrentNode(fs[0].key, _layerVals);
  }
  return [_srcKey];
};

const decorateNode = (_elements, _layers) => {
  if (!_elements || _elements.length < 1) return _elements;
  const m = {
    background: '#D6D5E6',
    color: '#333',
    // border: '1px solid #222138',
    // width: 180,
  };
  const elements = _elements;
  elements.map((e) => {
    if (['input', 'output'].includes(e.type) || e.animated) return e;
    const lk = e.data.lKey;
    const fk = findKey(_layers, o => o.wf && (o.key === lk || o.key.startsWith(`${lk}.`)));
    if (fk) {
      e.style = m;
      return e;
    }
    return e;
  });
  return elements;
};

const conFlowEls = (props) => {
  const { properties, properties_release } = props;
  const { flow, layers } = properties_release;
  const deep = cloneDeep(flow);
  const els = (deep && deep.elements) || [];
  els.map((d) => {
    if (['default'].includes(d.type) && d.data) {
      const { lKey } = d.data;
      const fk = findKey((properties.layers || {}), o => o.wf && (o.key === lKey || o.key.startsWith(`${lKey}.`)));
      const chk = fk ? (<div style={{ position: 'absolute', top: '0px', right: '2px', color: 'green', zIndex: '100' }}><FontAwesomeIcon icon="far fa-check-circle" /></div>) : null;
      const layer = layers[lKey] || {};
      const ll = (
        <div>
          {chk}
          <div style={{ borderWidth: '0px 0px 1px 0px', borderColor: 'black', borderStyle: 'solid' }}><b>{layer.label}</b></div>
          <div>({layer.key})</div>
        </div>
      );
      d.data = { label: ll, lKey: layer.key };
    }
    return d;
  });
  return els;
};

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

const flowDefault = [
  {
    id: '1', type: 'input', data: { label: 'Start' }, position: { x: 250, y: 15 }
  },
  {
    id: '2', type: 'output', data: { label: 'End' }, position: { x: 250, y: 255 }
  }
];

const isLayerInWF = (_element, _layerKey) => {
  const { flow } = _element.properties_template;
  const finds = ((flow || {}).elements || []).filter(e => e.type === 'default' && (e.data || {}).lKey === _layerKey);
  return (finds.length > 0);
};

// const validateLayerDeletion = (_element, _delKey) => {
//   if (isLayerInWF(_element, _delKey)) {
//     notification({ title: `Layer [${_delKey}]`, lvl: 'warning', msg: `This layer [${_delKey}] can not be removed because it is currently used in workflow.` });
//     return false;
//   }
//   return true;
// };

// const validateLayerUpdation = (_element, _updates) => {
//   const { key, wf } = _updates;
//   if (isLayerInWF(_element, key)) {
//     if (!wf) {
//       notification({ title: `Layer [${key}]`, lvl: 'warning', msg: `Can not change the attribute 'used in Workflow?' because this layer [${key}] is currently used in workflow.` });
//       return false;
//     }
//   }
//   const { layers } = _element.properties_template;
//   if (wf && layers[key] && (layers[key].cond_fields || []).length > 0) {
//     notification({ title: `Layer [${key}]`, lvl: 'warning', msg: 'Can not use in Workflow because the Layer Restriction has been set.' });
//     return false;
//   }
//   return true;
// };

const swapAryEls = (_ary, idx1, idx2) => {
  const ary = _ary;
  const temp = ary[idx1];
  ary[idx1] = ary[idx2];
  ary[idx2] = temp;
  return ary;
};

// re-fetch workflow and set to state of store, should be out-of this project
// const renderFlowModal = (generic, isToggle) => {
//   const segmentKlasses = (UserStore.getState() && UserStore.getState().segmentKlasses) || [];
//   let shortLabel = generic.short_label;
//   if (!shortLabel) {
//     shortLabel = segmentKlasses.filter(s => s.id === generic.segment_klass_id);
//     shortLabel = shortLabel.length > 0 ? shortLabel[0].label : '';
//   }
//   const params = {
//     properties_release: cloneDeep(generic.properties_release) || {},
//     properties: cloneDeep(generic.properties) || {},
//     shortLabel,
//     toggle: isToggle
//   };
//   UIActions.rerenderGenericWorkflow(params);
// };

const downloadFile = (file) => {
  const { contents, name } = file;
  const link = document.createElement('a');
  link.download = name;
  link.href = contents;
  const event = new window.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  link.dispatchEvent(event);
};

export {
  GenericDummy,
  // validateLayerInput,
  // validateSelectList,
  // notification,
  genUnitsSystem, genUnits, genUnit,
  unitConvToBase, unitConversion, toBool, toNum, genUnitSup, absOlsTermId, absOlsTermLabel, reUnit,
  clsInputGroup, inputEventVal, molOptions, samOptions, conFlowEls, storeFlow, flowDefault,
  // validateLayerUpdation,
  // validateLayerDeletion,
  swapAryEls, decorateNode, showProperties, downloadFile, uploadFiles
};
