/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-eval */
/* eslint-disable no-restricted-globals */

import React from 'react';
import {
  Button, Checkbox, FormGroup, FormControl,
  InputGroup, ListGroup, ListGroupItem, OverlayTrigger, Radio, Tooltip
} from 'react-bootstrap';
import Select from 'react-select';
import Dropzone from 'react-dropzone';
import { v4 as uuid } from 'uuid';
import { filter } from 'lodash';
import FieldLabel from './FieldLabel';
import {
  downloadFile, genUnit, genUnitSup, unitConvToBase
} from '../tools/utils';
import GenericElDropTarget from '../dnd/GenericElDropTarget';
import TableRecord from '../table/TableRecord';

const GenPropertiesCalculate = opt => {
  const fields = (opt.layer && opt.layer.fields) || [];
  let showVal = 0;
  let showTxt = null;
  let newFormula = opt.formula;

  const calFields = filter(fields, o => (o.type === 'integer' || o.type === 'system-defined'));
  const regF = /[a-zA-Z0-9]+/gm;
  // eslint-disable-next-line max-len
  const varFields = (opt.formula && opt.formula.match(regF)) ? opt.formula.match(regF).sort((a, b) => b.length - a.length) : [];

  varFields.forEach(fi => {
    if (!isNaN(fi)) return;

    const tmpField = calFields.find(e => e.field === fi);
    if (typeof tmpField === 'undefined' || tmpField == null) {
      newFormula = newFormula.replace(fi, 0);
    } else {
      newFormula = (tmpField.type === 'system-defined') ? newFormula.replace(fi, parseFloat(unitConvToBase(tmpField) || 0)) : newFormula.replace(fi, parseFloat(tmpField.value || 0));
    }
  });

  if (opt.type === 'formula-field') {
    try {
      showVal = eval(newFormula);
      showTxt = !isNaN(showVal) ? parseFloat(showVal.toFixed(5)) : 0;
    } catch (e) {
      if (e instanceof SyntaxError) {
        showTxt = e.message;
      }
    }
  }

  const fieldHeader = opt.label === '' ? null : (<FieldLabel label={opt.label} desc={opt.description} />);
  return (
    <FormGroup>
      {fieldHeader}
      <InputGroup>
        <FormControl
          type="text"
          value={showTxt}
          onChange={opt.onChange}
          className="readonly"
          readOnly="readonly"
          required={false}
          placeholder={opt.placeholder}
          min={0}
        />
        <InputGroup.Button>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="update_calculation_field">adjust</Tooltip>}
          >
            <Button active className="clipboardBtn" onClick={() => opt.onChange(showTxt)}>
              <i className="fa fa-arrow-right" aria-hidden="true" />
            </Button>
          </OverlayTrigger>
        </InputGroup.Button>
        <FormControl
          type="text"
          value={opt.value}
          onChange={opt.onChange}
          required={false}
          placeholder={opt.placeholder}
          min={0}
        />
      </InputGroup>
    </FormGroup>
  );
};

const GenPropertiesCheckbox = opt => (
  <FormGroup>
    <Checkbox
      name={opt.field}
      checked={opt.value}
      onChange={opt.onChange}
      disabled={opt.readOnly}
    >
      <FormControl.Static>{opt.label}</FormControl.Static>
    </Checkbox>
  </FormGroup>
);

const GenPropertiesDrop = opt => {
  const className = opt.isRequired ? 'drop_generic_properties field_required' : 'drop_generic_properties';

  let createOpt = null;
  if (opt.value.is_new === true) {
    createOpt = (
      <div className="sample_radios">
        <OverlayTrigger placement="top" overlay={<Tooltip id={uuid()}>associate with this sample</Tooltip>}>
          <Radio name={`dropS_${opt.value.el_id}`} disabled={opt.value.isAssoc === true} checked={opt.value.cr_opt === 0} onChange={() => opt.onChange({ ...opt.value, cr_opt: 0 })} inline>Current</Radio>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id={uuid()}>split from the sample first and then associate with it</Tooltip>}>
          <Radio name={`dropS_${opt.value.el_id}`} checked={opt.value.cr_opt === 1} onChange={() => opt.onChange({ ...opt.value, cr_opt: 1 })} inline>Split</Radio>
        </OverlayTrigger>
        <OverlayTrigger placement="top" overlay={<Tooltip id={uuid()}>duplicate the sample first and then associate with it</Tooltip>}>
          <Radio name={`dropS_${opt.value.el_id}`} checked={opt.value.cr_opt === 2} onChange={() => opt.onChange({ ...opt.value, cr_opt: 2 })} inline>Copy</Radio>
        </OverlayTrigger>
      </div>
    );
  }
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  const defaultIcon = opt.type === 'drag_element' ? <span className="fa fa-link icon_generic_nav indicator" /> : <span className="icon-sample indicator" />;
  const dragTarget = opt.isPreview === true ? <div className="target">{defaultIcon}</div> : <GenericElDropTarget opt={opt} onDrop={opt.onChange} />;

  return (
    <FormGroup>
      {fieldHeader}
      <FormControl.Static style={{ paddingBottom: '0px' }}>
        <div className={className}>
          {dragTarget}
          {createOpt}
          <div>
            <OverlayTrigger placement="top" overlay={<Tooltip id={uuid()}>remove</Tooltip>}>
              <Button className="btn_del" bsStyle="danger" bsSize="xsmall" onClick={() => opt.onChange({})}><i className="fa fa-trash-o" aria-hidden="true" /></Button>
            </OverlayTrigger>
          </div>
        </div>
      </FormControl.Static>
    </FormGroup>
  );
};

const GenDummy = () => (
  <FormGroup className="text_generic_properties">
    <FormControl type="text" className="dummy" readOnly />
  </FormGroup>
);

const GenPropertiesInputGroup = opt => {
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  const fLab = e => <div key={uuid()} className="form-control g_input_group_label">{e.value}</div>;
  const fTxt = e => <FormControl className="g_input_group" key={e.id} type={e.type} name={e.id} value={e.value} onChange={o => opt.onSubChange(o, e.id, opt.f_obj)} />;
  const fUnit = e => (
    <span key={`${e.id}_GenPropertiesInputGroup`} className="input-group" style={{ width: '100%' }}>
      <FormControl key={e.id} type="number" name={e.id} value={e.value} onChange={o => opt.onSubChange(o, e.id, opt.f_obj)} min={1} />
      <InputGroup.Button>
        <Button active onClick={() => opt.onSubChange(e, e.id, opt.f_obj)} bsStyle="success">
          {genUnitSup(genUnit(e.option_layers, e.value_system).label) || ''}
        </Button>
      </InputGroup.Button>
    </span>
  );
  const subs = opt.f_obj && opt.f_obj.sub_fields && opt.f_obj.sub_fields.map(e => {
    if (e.type === 'label') { return fLab(e); } if (e.type === 'system-defined') { return fUnit(e); } return fTxt(e);
  });
  return (
    <FormGroup>
      {fieldHeader}
      <InputGroup style={{ display: 'flex' }}>
        {subs}
      </InputGroup>
    </FormGroup>
  );
};

const GenPropertiesNumber = opt => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup>
      {fieldHeader}
      <FormControl
        type="number"
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
        min={1}
      />
    </FormGroup>
  );
};

const GenPropertiesSelect = opt => {
  const options = opt.options.map(op => ({ value: op.key, name: op.key, label: op.label }));
  let className = opt.isEditable ? 'select_generic_properties_editable' : 'select_generic_properties_readonly';
  className = opt.isRequired && opt.isEditable ? 'select_generic_properties_required' : className;
  className = `${className} status-select`;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  const val = options.find(o => o.value === opt.value) || null;
  return (
    <FormGroup>
      {fieldHeader}
      <Select
        isClearable
        menuContainerStyle={{ position: 'absolute' }}
        name={opt.field}
        multi={false}
        options={options}
        value={val}
        onChange={opt.onChange}
        className={className}
        disabled={opt.readOnly}
      />
    </FormGroup>
  );
};

const GenPropertiesSystemDefined = opt => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup>
      {fieldHeader}
      <InputGroup>
        <FormControl
          type="number"
          value={opt.value}
          onChange={opt.onChange}
          className={className}
          readOnly={opt.readOnly}
          required={opt.isRequired}
          placeholder={opt.placeholder}
          min={1}
        />
        <InputGroup.Button>
          <Button disabled={opt.readOnly} active onClick={opt.onClick} bsStyle="success">
            {genUnitSup(genUnit(opt.option_layers, opt.value_system).label) || ''}
          </Button>
        </InputGroup.Button>
      </InputGroup>
    </FormGroup>
  );
};

const GenPropertiesTable = opt => {
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup>
      {fieldHeader}
      <TableRecord key={`grid_${opt.f_obj.field}`} opt={opt} />
    </FormGroup>
  );
};

const GenPropertiesText = opt => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup className="text_generic_properties">
      {fieldHeader}
      <FormControl
        type="text"
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
      />
    </FormGroup>
  );
};

const GenPropertiesTextArea = opt => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  return (
    <FormGroup className="text_generic_properties">
      {fieldHeader}
      <FormControl
        componentClass="textarea"
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
      />
    </FormGroup>
  );
};

const GenTextFormula = opt => {
  const { layers } = opt;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  const subs = [];
  (opt.f_obj && opt.f_obj.text_sub_fields).map(e => {
    const { layer, field, separator } = e;
    if (field && field !== '') {
      if (field.includes('[@@]')) {
        const fds = field.split('[@@]');
        if (fds && fds.length === 2) {
          const fdt = ((layers[layer] || {}).fields || []).find(f => f.field === fds[0] && f.type === 'table');
          ((fdt && fdt.sub_values) || []).forEach(svv => {
            if (svv && svv[fds[1]] && svv[fds[1]] !== '') { subs.push(svv[fds[1]]); subs.push(separator); }
          });
        }
      } else {
        const fd = ((layers[layer] || {}).fields || []).find(f => f.field === field);
        if (fd && fd.value && fd.value !== '') { subs.push(fd.value); subs.push(separator); }
      }
    }
    return true;
  });
  return (
    <FormGroup className="text_generic_properties">
      {fieldHeader}
      <FormControl
        type="text"
        value={subs.join('')}
        className="readonly"
        readOnly
        required={false}
      />
    </FormGroup>
  );
};

const renderListGroupItem = (opt, attachment) => {
  const delBtn = (
    <Button bsSize="xsmall" id={attachment.uid} className="button-right" onClick={() => opt.onChange({ ...opt.value, action: 'd', uid: attachment.uid })}>
      <i className="fa fa-times" aria-hidden="true" />
    </Button>
  );
  const filename = attachment.aid
    ? (<a onClick={() => downloadFile({ contents: `/api/v1/attachments/${attachment.aid}`, name: attachment.filename })} style={{ cursor: 'pointer' }}>{attachment.filename}</a>) : attachment.filename;
  return (
    <div className="generic_grid">
      <div>
        <div>{delBtn}</div>
        <div className="generic_grid_row">{filename}</div>
        <div className="generic_grid_row">
          <FormGroup bsSize="small">
            <FormControl
              type="text"
              value={attachment.label || ''}
              onChange={e => opt.onChange({
                ...opt.value, action: 'l', uid: attachment.uid, val: e
              })}
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

const GenPropertiesUpload = opt => {
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  const attachments = (opt.value && opt.value.files) || [];
  if (opt.isSearch) return (<div>(This is an upload)</div>);

  return (
    <FormGroup className="text_generic_properties">
      {fieldHeader}
      <FormControl.Static style={{ paddingBottom: '0px' }}>
        <Dropzone
          id="dropzone"
          onDrop={e => opt.onChange({
            ...opt.value, action: 'f', val: e
          })}
          style={{ height: 30, width: '100%', border: '3px dashed lightgray' }}
        >
          <div style={{ textAlign: 'center', paddingTop: 6, color: 'gray' }}>
            Drop File, or Click to Select.
          </div>
        </Dropzone>
      </FormControl.Static>
      <ListGroup>
        {attachments.map(attachment => (
          <ListGroupItem key={attachment.id} className="generic_files">
            {renderListGroupItem(opt, attachment)}
          </ListGroupItem>
        ))}
      </ListGroup>
    </FormGroup>
  );
};

const GenWFNext = opt => {
  const options = (opt.f_obj.wf_options || []).map(op => {
    const label = op.label.match(/(.*)\(.*\)/);
    return ({ value: op.key, name: op.key, label: label[1] === '' ? label[0] : label[1] });
  });
  let className = opt.isEditable ? 'select_generic_properties_editable' : 'select_generic_properties_readonly';
  className = opt.isRequired && opt.isEditable ? 'select_generic_properties_required' : className;
  className = `${className} status-select`;
  const fieldHeader = opt.label === '' ? null : <FieldLabel label={opt.label} desc={opt.description} />;
  const val = options.find(o => o.value === opt.value) || null;
  return (
    <FormGroup>
      {fieldHeader}
      <Select
        menuContainerStyle={{ position: 'absolute' }}
        name={opt.field}
        multi={false}
        options={options}
        value={val}
        onChange={opt.onChange}
        className={className}
        disabled={opt.readOnly}
      />
    </FormGroup>
  );
};

export {
  GenPropertiesCalculate,
  GenPropertiesCheckbox,
  GenPropertiesDrop,
  GenDummy,
  GenTextFormula,
  GenPropertiesInputGroup,
  GenPropertiesNumber,
  GenPropertiesSelect,
  GenPropertiesSystemDefined,
  GenPropertiesTable,
  GenPropertiesText,
  GenPropertiesTextArea,
  GenPropertiesUpload,
  GenWFNext
};
