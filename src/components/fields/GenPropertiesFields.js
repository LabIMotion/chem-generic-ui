/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-eval */
/* eslint-disable no-restricted-globals */

import React from 'react';
import {
  Button,
  Checkbox,
  FormGroup,
  FormControl,
  InputGroup,
  ListGroup,
  ListGroupItem,
  OverlayTrigger,
  Radio,
  Tooltip,
} from 'react-bootstrap';
// import DatePicker, { registerLocale } from 'react-datepicker';
import DatePicker from 'react-datepicker';
// import ptBR from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import { filter } from 'lodash';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { downloadFile, genUnit, unitConvToBase } from 'generic-ui-core';
import DateTimeRange from './DateTimeRange';
import FieldHeader from './FieldHeader';
import { fieldCls, genUnitSup } from '../tools/utils';
import GenericElDropTarget from '../dnd/GenericElDropTarget';
import TableRecord from '../table/TableRecord';

// registerLocale('ptBR', ptBR);
// import 'react-datepicker/dist/react-datepicker.css';

const GenPropertiesCalculate = opt => {
  const fields = (opt.layer && opt.layer.fields) || [];
  let showVal = 0;
  let showTxt = null;
  let newFormula = opt.formula;
  const calFields = filter(
    fields,
    o => o.type === 'integer' || o.type === 'system-defined'
  );
  const regF = /[a-zA-Z0-9_]+/gm;
  // eslint-disable-next-line max-len
  const varFields =
    opt.formula && opt.formula.match(regF)
      ? opt.formula.match(regF).sort((a, b) => b.length - a.length)
      : [];
  varFields.forEach(fi => {
    if (!isNaN(fi)) return;
    const tmpField = calFields.find(e => e.field === fi);
    if (typeof tmpField === 'undefined' || tmpField == null) {
      newFormula = newFormula?.replace(fi, 0);
    } else {
      newFormula =
        tmpField.type === 'system-defined'
          ? newFormula?.replace(
              fi,
              parseFloat(unitConvToBase({ field: tmpField }) || 0)
            )
          : newFormula?.replace(fi, parseFloat(tmpField.value || 0));
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
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup className={klz[1]}>
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
            <Button
              active
              className="clipboardBtn"
              onClick={() => opt.onChange(showTxt)}
            >
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

const GenPropertiesCheckbox = opt => {
  if (opt.isSpCall) {
    return (
      <FormGroup className="text_generic_properties gu_sp_form">
        {FieldHeader(opt)}
        <Checkbox
          name={opt.field}
          checked={opt.value}
          onChange={opt.onChange}
          disabled={opt.readOnly}
          className="gu_sp_column"
        />
      </FormGroup>
    );
  }
  return (
    <FormGroup>
      {FieldHeader({ label: '', description: '' })}
      <Checkbox
        name={opt.field}
        checked={opt.value}
        onChange={opt.onChange}
        disabled={opt.readOnly}
        style={{ marginTop: '5px' }}
      >
        <div style={{ marginTop: '-2px' }}>{FieldHeader(opt)}</div>
      </Checkbox>
    </FormGroup>
  );
};

const GenPropertiesDate = opt => {
  const klz = fieldCls(opt.isSpCall);
  const klzLayer =
    opt.isAtLayer || false
      ? 'gu_date_picker gu_date_picker_layer'
      : 'gu_date_picker';
  const newVal =
    opt.value &&
    new Date(moment(opt.value, 'DD/MM/YYYY HH:mm:ss').toISOString());
  // const newVal = opt.value && moment(opt.value, 'DD/MM/YYYY HH:mm:ss');
  return (
    <FormGroup className={klz[0]}>
      {FieldHeader(opt)}
      <div className={klzLayer}>
        <DatePicker
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="dd/MM/yyyy HH:mm"
          // locale="ptBR"
          selected={newVal}
          onSelect={opt.onChange} // when day is clicked
          onChange={opt.onChange} // only when value has changed
          placeholderText="DD/MM/YYYY hh:mm"
        />
      </div>
    </FormGroup>
  );
};

const GenPropertiesDateTimeRange = opt => {
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={`${klz[0]}`}>
      {FieldHeader(opt)}
      <DateTimeRange key={`grid_${opt.f_obj.field}`} opt={opt} />
    </FormGroup>
  );
};

const GenPropertiesDrop = opt => {
  const className = opt.isRequired
    ? 'drop_generic_properties field_required'
    : 'drop_generic_properties';

  let createOpt = null;
  if (opt.value.is_new === true) {
    createOpt = (
      <div className="sample_radios">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={uuid()}>associate with this sample</Tooltip>}
        >
          <Radio
            name={`dropS_${opt.value.el_id}`}
            disabled={opt.value.isAssoc === true}
            checked={opt.value.cr_opt === 0}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 0 })}
            inline
          >
            Current
          </Radio>
        </OverlayTrigger>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={uuid()}>
              split from the sample first and then associate with it
            </Tooltip>
          }
        >
          <Radio
            name={`dropS_${opt.value.el_id}`}
            checked={opt.value.cr_opt === 1}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 1 })}
            inline
          >
            Split
          </Radio>
        </OverlayTrigger>
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id={uuid()}>
              duplicate the sample first and then associate with it
            </Tooltip>
          }
        >
          <Radio
            name={`dropS_${opt.value.el_id}`}
            checked={opt.value.cr_opt === 2}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 2 })}
            inline
          >
            Copy
          </Radio>
        </OverlayTrigger>
      </div>
    );
  }
  const defaultIcon =
    opt.type === 'drag_element' ? (
      <span className="fa fa-link icon_generic_nav indicator" />
    ) : (
      <span className="icon-sample indicator" />
    );
  const dragTarget =
    opt.isPreview === true ? (
      <div className="target">{defaultIcon}</div>
    ) : (
      <GenericElDropTarget opt={opt} onDrop={opt.onChange} />
    );

  return (
    <FormGroup>
      {FieldHeader(opt)}
      <div style={{ paddingBottom: '0px' }}>
        <div className={className}>
          {dragTarget}
          {createOpt}
          <div style={{ zIndex: '3' }}>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={uuid()}>remove</Tooltip>}
            >
              <Button
                className="btn_del"
                bsStyle="danger"
                bsSize="xsmall"
                onClick={() => opt.onChange({})}
              >
                <i className="fa fa-trash-o" aria-hidden="true" />
              </Button>
            </OverlayTrigger>
          </div>
        </div>
      </div>
    </FormGroup>
  );
};

const GenDummy = () => (
  <FormGroup className="text_generic_properties">
    <FormControl type="text" className="dummy" readOnly />
  </FormGroup>
);

const GenPropertiesInputGroup = opt => {
  const fLab = e => (
    <div key={uuid()} className="form-control g_input_group_label">
      {e.value}
    </div>
  );
  const fTxt = e => (
    <FormControl
      className="g_input_group"
      key={e.id}
      type={e.type}
      name={e.id}
      value={e.value || ''}
      onChange={o => opt.onSubChange(o, e.id, opt.f_obj)}
    />
  );
  const fUnit = e => (
    <span
      key={`${e.id}_GenPropertiesInputGroup`}
      className="input-group"
      style={{ width: '100%' }}
    >
      <FormControl
        key={e.id}
        type="number"
        name={e.id}
        value={e.value}
        onChange={o => opt.onSubChange(o, e.id, opt.f_obj)}
        min={1}
      />
      <InputGroup.Button>
        <Button
          active
          onClick={() => opt.onSubChange(e, e.id, opt.f_obj)}
          bsStyle="success"
        >
          {genUnitSup(genUnit(e.option_layers, e.value_system).label) || ''}
        </Button>
      </InputGroup.Button>
    </span>
  );
  const subs =
    opt.f_obj &&
    opt.f_obj.sub_fields &&
    opt.f_obj.sub_fields.map(e => {
      if (e.type === 'label') {
        return fLab(e);
      }
      if (e.type === 'system-defined') {
        return fUnit(e);
      }
      return fTxt(e);
    });
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup style={{ display: 'flex' }}>{subs}</InputGroup>
    </FormGroup>
  );
};

const GenPropertiesNumber = opt => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={klz[0]}>
      {FieldHeader(opt)}
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
  const options = opt.options.map(op => {
    return {
      value: op.key,
      name: op.key,
      label: op.label,
    };
  });
  let className = opt.isEditable
    ? 'select_generic_properties_editable'
    : 'select_generic_properties_readonly';
  className =
    opt.isRequired && opt.isEditable
      ? 'select_generic_properties_required'
      : className;
  className = `${className} status-select`;
  const val = options.find(o => o.value === opt.value) || null;
  const klz = fieldCls(opt.isSpCall);
  const selectStyles = {
    menuPortal: base => {
      return { ...base, zIndex: 9999 };
    },
    menu: base => {
      return { ...base, zIndex: 9999 };
    },
    control: base => {
      return {
        ...base,
        height: 35,
        minHeight: 35,
      };
    },
  };
  return (
    <FormGroup className={klz[0]}>
      {FieldHeader(opt)}
      <span className={klz[1]}>
        <Select
          isClearable
          name={opt.field}
          multi={false}
          options={options}
          value={val}
          onChange={opt.onChange}
          className={className}
          isDisabled={opt.readOnly}
          menuPortalTarget={document.body}
          styles={selectStyles}
        />
      </span>
    </FormGroup>
  );
};

const GenPropertiesSystemDefined = opt => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup className={klz[1]}>
        <FormControl
          type="number"
          value={opt.f_obj.value || ''}
          onChange={opt.onChange}
          className={`${className} ${klz[1]}`}
          readOnly={opt.readOnly}
          required={opt.isRequired}
          placeholder={opt.placeholder}
        />
        <InputGroup.Button>
          <Button
            disabled={opt.readOnly}
            active
            onClick={opt.onClick}
            bsStyle="success"
          >
            {genUnitSup(genUnit(opt.option_layers, opt.value_system).label) ||
              ''}
          </Button>
        </InputGroup.Button>
      </InputGroup>
    </FormGroup>
  );
};

const GenPropertiesTable = opt => (
  <FormGroup>
    {FieldHeader(opt)}
    <TableRecord key={`grid_${opt.f_obj.field}`} opt={opt} />
  </FormGroup>
);

const GenPropertiesText = opt => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={`text_generic_properties ${klz[0]}`}>
      {FieldHeader(opt)}
      <FormControl
        type="text"
        value={opt.value}
        onChange={opt.onChange}
        className={`${className} ${klz[1]}`}
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
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={`text_generic_properties ${klz[0]}`}>
      {FieldHeader(opt)}
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
  const subs = [];
  (opt.f_obj && opt.f_obj.text_sub_fields).map(e => {
    const { layer, field, separator } = e;
    if (field && field !== '') {
      if (field.includes('[@@]')) {
        const fds = field.split('[@@]');
        if (fds && fds.length === 2) {
          const fdt = ((layers[layer] || {}).fields || []).find(
            f => f.field === fds[0] && f.type === 'table'
          );
          ((fdt && fdt.sub_values) || []).forEach(svv => {
            if (svv && svv[fds[1]] && svv[fds[1]] !== '') {
              subs.push(svv[fds[1]]);
              subs.push(separator);
            }
          });
        }
      } else {
        const fd = ((layers[layer] || {}).fields || []).find(
          f => f.field === field
        );
        if (fd && fd.value && fd.value !== '') {
          subs.push(fd.value);
          subs.push(separator);
        }
      }
    }
    return true;
  });
  const klz = fieldCls(opt.isSpCall);
  return (
    <FormGroup className={`text_generic_properties ${klz[0]}`}>
      {FieldHeader(opt)}
      <FormControl
        type="text"
        value={subs.join('')}
        className={`readonly ${klz[1]}`}
        readOnly
        required={false}
      />
    </FormGroup>
  );
};

const renderListGroupItem = (opt, attachment) => {
  const delBtn = (
    <Button
      bsSize="xsmall"
      id={attachment.uid}
      className="button-right"
      onClick={() =>
        opt.onChange({ ...opt.value, action: 'd', uid: attachment.uid })
      }
    >
      <i className="fa fa-times" aria-hidden="true" />
    </Button>
  );
  const filename = attachment.aid ? (
    <a
      onClick={() =>
        downloadFile({
          contents: `/api/v1/attachments/${attachment.aid}`,
          name: attachment.filename,
        })
      }
      style={{ cursor: 'pointer' }}
    >
      {attachment.filename}
    </a>
  ) : (
    attachment.filename
  );
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
              onChange={e =>
                opt.onChange({
                  ...opt.value,
                  action: 'l',
                  uid: attachment.uid,
                  val: e,
                })
              }
            />
          </FormGroup>
        </div>
      </div>
    </div>
  );
};

const GenPropertiesUpload = opt => {
  const attachments = (opt.value && opt.value.files) || [];
  if (opt.isSearch) return <div>(This is an upload)</div>;
  return (
    <FormGroup className="text_generic_properties">
      {FieldHeader(opt)}
      <div style={{ paddingBottom: '0px', paddingTop: '0px' }}>
        <Dropzone
          id="dropzone"
          onDrop={e =>
            opt.onChange({
              ...opt.value,
              action: 'f',
              val: e,
            })
          }
          style={{ height: 34, width: '100%', border: '3px dashed lightgray' }}
        >
          <div
            style={{
              textAlign: 'center',
              color: 'gray',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            Drop File, or Click to Select.
          </div>
        </Dropzone>
      </div>
      <ListGroup>
        {attachments.map(attachment => (
          <ListGroupItem key={attachment.uid} className="generic_files">
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
    return {
      value: op.key,
      name: op.key,
      label: label[1] === '' ? label[0] : label[1],
    };
  });
  let className = opt.isEditable
    ? 'select_generic_properties_editable'
    : 'select_generic_properties_readonly';
  className =
    opt.isRequired && opt.isEditable
      ? 'select_generic_properties_required'
      : className;
  className = `${className} status-select`;
  const val = options.find(o => o.value === opt.value) || null;
  return (
    <FormGroup>
      {FieldHeader(opt)}
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
  GenPropertiesDate,
  GenPropertiesDateTimeRange,
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
  GenWFNext,
};
