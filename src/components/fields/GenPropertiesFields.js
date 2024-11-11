/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-eval */
/* eslint-disable no-restricted-globals */

import React, { useState, useCallback } from 'react';
import {
  Button,
  Form,
  InputGroup,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { downloadFile, genUnit, FieldTypes } from 'generic-ui-core';
import DateTimeRange from './DateTimeRange';
import FieldHeader from './FieldHeader';
import { fieldCls, frmSelSty, genUnitSup } from '../tools/utils';
import GenericElDropTarget from '../dnd/GenericElDropTarget';
import TableRecord from '../table/TableRecord';
import FieldUploadItem from './FieldUploadItem';
import DropReaction from '../dnd/DropReaction';
import ButtonDatePicker from './ButtonDatePicker';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';
import TAs from '../tools/TAs';
import mergeExt from '../../utils/ext-utils';

const ext = mergeExt();

const GenPropertiesCheckbox = (opt) => {
  if (opt.isSpCall) {
    return (
      <Form.Group className="text_generic_properties gu_sp_form">
        {FieldHeader(opt)}
        <Form.Check
          type="checkbox"
          name={opt.field}
          checked={opt.value}
          onChange={opt.onChange}
          disabled={opt.readOnly}
          className="gu_sp_column"
        />
      </Form.Group>
    );
  }
  return (
    <Form.Group>
      {FieldHeader({ label: '', description: '' })}
      <Form.Check
        type="checkbox"
        id={opt.field}
        checked={opt.value}
        onChange={opt.onChange}
        disabled={opt.readOnly}
        // style={{ marginTop: '5px' }}
      >
        <Form.Check.Input
          className="mt-2"
          type="checkbox"
          name={opt.field}
          checked={opt.value}
          onChange={opt.onChange}
          disabled={opt.readOnly}
        />
        <Form.Check.Label>{FieldHeader(opt)}</Form.Check.Label>
        {/* <div style={{ marginTop: '-2px' }}>{FieldHeader(opt)}</div> */}
      </Form.Check>
    </Form.Group>
  );
};

const GenPropertiesDate = (opt) => {
  const klz = fieldCls(opt.isSpCall);
  const klzLayer =
    opt.isAtLayer || false
      ? 'gu_date_picker gu_date_picker_layer'
      : 'gu_date_picker';
  const newVal =
    opt.value &&
    new Date(moment(opt.value, 'DD/MM/YYYY HH:mm:ss').toISOString());
  // const newVal = opt.value && moment(opt.value, 'DD/MM/YYYY HH:mm:ss');

  let readOnly = opt.readOnly || false;
  const { f_obj: fObj } = opt;
  if (fObj?.is_voc === true && fObj?.opid >= 7) readOnly = true;
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <div className={klzLayer}>
        <ButtonDatePicker
          onChange={opt.onChange}
          val={newVal}
          readOnly={readOnly ?? false}
        />
      </div>
    </Form.Group>
  );
};

const GenPropertiesDateTimeRange = (opt) => {
  const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group className={`${klz[0]}`}>
      {FieldHeader(opt)}
      <DateTimeRange key={`grid_${opt.f_obj.field}`} opt={opt} />
    </Form.Group>
  );
};

const GenPropertiesDrop = (opt) => {
  const className = opt.isRequired
    ? 'drop_generic_properties field_required'
    : 'drop_generic_properties';

  let createOpt = null;

  if (opt.value?.is_new === true && opt.classStr) {
    createOpt = (
      <div className="sample_radios">
        <LTooltip idf="associate_direct">
          <Form.Check
            type="radio"
            name={`dropS_${opt.value.el_id}`}
            disabled={opt.value.isAssoc === true}
            checked={opt.value.cr_opt === 0}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 0 })}
            inline
            label="Current"
          />
        </LTooltip>
        <LTooltip idf="associate_split">
          <Form.Check
            type="radio"
            name={`dropS_${opt.value.el_id}`}
            checked={opt.value.cr_opt === 1}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 1 })}
            inline
            label="Split"
          />
        </LTooltip>
        <LTooltip idf="associate_duplicate">
          <Form.Check
            type="radio"
            name={`dropS_${opt.value.el_id}`}
            checked={opt.value.cr_opt === 2}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 2 })}
            inline
            label="Copy"
          />
        </LTooltip>
      </div>
    );
  }
  const defaultIcon =
    opt.type === 'drag_element' ? (
      <span className="indicator">{FIcons.faLink}</span>
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
    <Form.Group>
      {FieldHeader(opt)}
      <div style={{ paddingBottom: '0px' }}>
        <div className={className}>
          {dragTarget}
          {createOpt}
          <div style={{ zIndex: '3' }}>
            <LTooltip idf="remove">
              <Button
                className="btn_del btn-gxs"
                variant="danger"
                onClick={() => opt.onChange({})}
              >
                {FIcons.faTrashCan}
              </Button>
            </LTooltip>
          </div>
        </div>
      </div>
    </Form.Group>
  );
};

const GenDummy = () => (
  <Form.Group className="text_generic_properties">
    <Form.Control type="text" className="dummy" readOnly />
  </Form.Group>
);

const GenDropReaction = (opt) => (
  <DropReaction field={opt.f_obj} onNavi={opt.onNavi} onChange={opt.onChange} />
);

const GenLabel = (opt, value) => (
  <Form.Group className="text_generic_properties">
    {FieldHeader(opt)}
    <div>{value}</div>
  </Form.Group>
);

const GenPropertiesInputGroup = (opt) => {
  const { f_obj: fObj, isSpCall, onSubChange } = opt;
  const handleSubChange = useCallback(
    (event, id) => {
      onSubChange(event, id, fObj);
    },
    [onSubChange, fObj]
  );
  const klz = fieldCls(isSpCall);
  const subs = fObj?.sub_fields?.map((e) => {
    if (e.type === FieldTypes.F_LABEL) {
      return (
        <InputGroup.Text key={`_label_${e.id}`}>{e.value}</InputGroup.Text>
      );
    }
    if (e.type === FieldTypes.F_SYSTEM_DEFINED) {
      return (
        <React.Fragment key={`_fra_${e.id}`}>
          <Form.Control
            type="number"
            name={e.id}
            value={e.value}
            onChange={(o) => handleSubChange(o, e.id, fObj)}
            min={1}
          />
          <Button
            onClick={() => handleSubChange(e, e.id, fObj)}
            variant="success"
          >
            {genUnitSup(genUnit(e.option_layers, e.value_system, ext).label) || ''}
          </Button>
        </React.Fragment>
      );
    }
    return (
      <Form.Control
        key={e.id}
        type={e.type}
        name={e.id}
        value={e.value || ''}
        onChange={(o) => handleSubChange(o, e.id, fObj)}
      />
    );
  });
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup>{subs}</InputGroup>
    </Form.Group>
  );
};

const GenPropertiesNumber = (opt) => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <Form.Control
        type="number"
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
        min={1}
      />
    </Form.Group>
  );
};

const GenPropertiesSelect = (opt) => {
  const options = opt.options.map((op) => {
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
  // className = `${className} status-select`;
  const val = options.find((o) => o.value === opt.value) || null;
  const klz = fieldCls(opt.isSpCall);

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };
  return (
    <Form.Group className={klz[0]}>
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
          styles={{ ...frmSelSty, ...customStyles }}
        />
      </span>
    </Form.Group>
  );
};

const GenPropertiesSystemDefined = (opt) => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);
  const hasUT = !!genUnit(opt.option_layers, opt.value_system, ext).unit_type;
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup className={klz[1]}>
        <Form.Control
          type="number"
          value={
            opt.f_obj.value !== undefined && opt.f_obj.value !== null
              ? opt.f_obj.value
              : ''
          }
          onChange={opt.onChange}
          className={`${className} ${klz[1]}`}
          readOnly={opt.readOnly}
          required={opt.isRequired}
          placeholder={opt.placeholder}
        />
        <Button
          disabled={opt.readOnly}
          onClick={opt.onClick}
          variant="success"
          title={hasUT ? TAs.no_unit_conversion : undefined}
        >
          {genUnitSup(
            genUnit(opt.option_layers, opt.value_system, ext).label
          ) || ''}
        </Button>
      </InputGroup>
    </Form.Group>
  );
};

const GenPropertiesTable = (opt) => (
  <Form.Group>
    {FieldHeader(opt)}
    <TableRecord key={`grid_${opt.f_obj.field}`} opt={opt} />
  </Form.Group>
);

const GenPropertiesText = (opt) => {
  const [id] = useState(uuid());
  const { f_obj: fObj } = opt;
  const showVal = opt.value;
  if (fObj?.readonly) return GenLabel(opt, fObj.placeholder);
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);

  let readOnly = opt.readOnly || false;
  if (fObj?.is_voc === true && fObj?.opid >= 7) {
    readOnly = true;
    className = 'readonly';
  }

  return (
    <Form.Group className={`text_generic_properties ${klz[0]}`}>
      {FieldHeader(opt)}
      <Form.Control
        id={id}
        type="text"
        value={showVal}
        onChange={opt.onChange}
        className={`${className} ${klz[1]}`}
        readOnly={readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
      />
    </Form.Group>
  );
};

const GenPropertiesTextArea = (opt) => {
  const [id] = useState(uuid());
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group className={`text_generic_properties ${klz[0]}`}>
      {FieldHeader(opt)}
      <Form.Control
        id={id}
        as="textarea"
        value={opt.value}
        onChange={opt.onChange}
        className={className}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
      />
    </Form.Group>
  );
};

const GenTextFormula = (opt) => {
  const [id] = useState(uuid());
  const { layers } = opt;
  const subs = [];
  (opt.f_obj?.text_sub_fields || []).map((e) => {
    const { layer, field, separator } = e;
    if (field && field !== '') {
      if (field.includes('[@@]')) {
        const fds = field.split('[@@]');
        if (fds && fds.length === 2) {
          const fdt = ((layers[layer] || {}).fields || []).find(
            (f) => f.field === fds[0] && f.type === 'table'
          );
          ((fdt && fdt.sub_values) || []).forEach((svv) => {
            if (svv && svv[fds[1]] && svv[fds[1]] !== '') {
              subs.push(svv[fds[1]]);
              subs.push(separator);
            }
          });
        }
      } else {
        const fd = ((layers[layer] || {}).fields || []).find(
          (f) => f.field === field
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
    <Form.Group className={`text_generic_properties ${klz[0]}`}>
      {FieldHeader(opt)}
      <Form.Control
        id={id}
        type="text"
        value={subs.join('')}
        className={`readonly ${klz[1]}`}
        readOnly
        required={false}
      />
    </Form.Group>
  );
};

const renderListGroupItem = (opt, attachment) => {
  const delBtn = (
    <Button
      id={attachment.uid}
      className="button-right btn-gxs"
      onClick={() =>
        opt.onChange({ ...opt.value, action: 'd', uid: attachment.uid })
      }
    >
      {FIcons.faTimes}
    </Button>
  );
  const filename = attachment.aid ? (
    <>
      <a
        onClick={() =>
          downloadFile({
            contents: `/api/v1/attachments/${attachment.aid}`,
            name: attachment.filename,
          })
        }
        style={{ cursor: 'pointer' }}
        title={attachment.filename}
      >
        {attachment.filename}
      </a>
      <br />
      <img
        src={`/api/v1/attachments/thumbnail/${attachment.aid}`}
        alt={attachment.filename}
      />
    </>
  ) : (
    attachment.filename
  );
  return (
    <div className="generic_grid">
      <div>
        <div>{delBtn}</div>
        <div className="generic_grid_row file_text">{filename}</div>
        <div className="generic_grid_row">
          <Form.Group size="sm">
            <Form.Control
              type="text"
              value={attachment.label || ''}
              onChange={(e) =>
                opt.onChange({
                  ...opt.value,
                  action: 'l',
                  uid: attachment.uid,
                  val: e,
                })
              }
            />
          </Form.Group>
        </div>
      </div>
    </div>
  );
};

const GenPropertiesUpload = (opt) => {
  const attachments = (opt.value && opt.value.files) || [];
  if (opt.isSearch) return <div>(This is an upload)</div>;
  return (
    <Form.Group className="text_generic_properties">
      {FieldHeader(opt)}
      <div style={{ paddingBottom: '0px', paddingTop: '0px' }}>
        <Dropzone
          id="dropzone"
          onDrop={(e) =>
            opt.onChange({
              ...opt.value,
              action: 'f',
              val: e,
            })
          }
          className="gu-drop-zone"
          style={{ height: 34 }}
        >
          <div
            style={{
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
        {attachments.map((attachment) => (
          <ListGroupItem key={attachment.uid} className="generic_files">
            {/* {renderListGroupItem(opt, attachment)} */}
            <FieldUploadItem opt={opt} attachment={attachment} />
          </ListGroupItem>
        ))}
      </ListGroup>
    </Form.Group>
  );
};

const GenWFNext = (opt) => {
  const options = (opt.f_obj.wf_options || []).map((op) => {
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
  // className = `${className} status-select`;
  const val = options.find((o) => o.value === opt.value) || null;
  return (
    <Form.Group>
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
        styles={frmSelSty}
      />
    </Form.Group>
  );
};

export {
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
  GenDropReaction,
};
