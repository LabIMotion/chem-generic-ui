/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-eval */
/* eslint-disable no-restricted-globals */

import React, { useState } from 'react';
import { Button, Col, Form, InputGroup, ListGroup } from 'react-bootstrap';
// import DatePicker, { registerLocale } from 'react-datepicker';
// import ptBR from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css';
import Dropzone from 'react-dropzone';
import Select from 'react-select';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { downloadFile, genUnit, FieldTypes } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import DateTimeRange from '@components/fields/DateTimeRange';
import FieldHeader from '@components/fields/FieldHeader';
import { fieldCls, genUnitSup, frmSelSty } from '@components/tools/utils';
import GenericElDropTarget from '@components/dnd/GenericElDropTarget';
import TableRecord from '@components/table/TableRecord';
import FieldUploadItem from '@components/fields/FieldUploadItem';
import DropReaction from '@components/dnd/DropReaction';
import ButtonDatePicker from '@components/fields/ButtonDatePicker';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import LLabel from '@components/shared/LLabel';
import { renderBlank } from '@components/elements/Fields';

const LFieldLabel = ({ label, description, isCheckLabel = false }) => {
  return (
    <LLabel tooltip={description} isCheckLabel={isCheckLabel}>
      {label}
    </LLabel>
  );
};

const GenPropertiesCheckbox = (opt) => {
  return (
    <Form.Group as={Col}>
      <LLabel>&nbsp;</LLabel>
      <Form.Check.Input
        className="mt-2"
        type="checkbox"
        disabled={opt.readOnly}
        checked={opt.value}
        onChange={opt.onChange}
        name={opt.field}
      >
        <LFieldLabel
          label={opt.label}
          description={opt.description}
          isCheckLabel
        />
      </Form.Check.Input>
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
        <ButtonDatePicker onChange={opt.onChange} val={newVal} />
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
          >
            Current
          </Form.Check>
        </LTooltip>
        <LTooltip idf="associate_split">
          <Form.Check
            type="radio"
            name={`dropS_${opt.value.el_id}`}
            checked={opt.value.cr_opt === 1}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 1 })}
            inline
          >
            Split
          </Form.Check>
        </LTooltip>
        <LTooltip idf="associate_duplicate">
          <Form.Check
            type="radio"
            name={`dropS_${opt.value.el_id}`}
            checked={opt.value.cr_opt === 2}
            onChange={() => opt.onChange({ ...opt.value, cr_opt: 2 })}
            inline
          >
            Copy
          </Form.Check>
        </LTooltip>
      </div>
    );
  }
  const defaultIcon =
    opt.type === FieldTypes.F_DRAG_ELEMENT ? (
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
                size="sm"
                className="btn_del"
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

// blank field
const GenDummy = () => renderBlank();

// FieldHeader has hover tooltip if hover(desc) is not empty
// read-only label field
const GenLabel = (opt, value) => (
  <Form.Group as={Col}>
    <LFieldLabel label={opt.label} description={opt.description} />
    <Form.Control plaintext readOnly defaultValue={value} />
  </Form.Group>
);

const GenDropReaction = (opt) => (
  <DropReaction field={opt.f_obj} onNavi={opt.onNavi} onChange={opt.onChange} />
);

const GenPropertiesInputGroup = (opt) => {
  const fLab = (e) => (
    <div key={uuid()} className="form-control g_input_group_label">
      {e.value}
    </div>
  );
  const fTxt = (e) => (
    <Form.Control
      className="g_input_group"
      key={e.id}
      type={e.type}
      name={e.id}
      value={e.value || ''}
      onChange={(o) => opt.onSubChange(o, e.id, opt.f_obj)}
    />
  );
  const fUnit = (e) => (
    <span
      key={`${e.id}_GenPropertiesInputGroup`}
      className="input-group"
      style={{ width: '100%' }}
    >
      <Form.Control
        key={e.id}
        type="number"
        name={e.id}
        value={e.value}
        onChange={(o) => opt.onSubChange(o, e.id, opt.f_obj)}
        min={1}
      />
      <Button
        onClick={() => opt.onSubChange(e, e.id, opt.f_obj)}
        variant="success"
      >
        {genUnitSup(genUnit(e.option_layers, e.value_system).label) || ''}
      </Button>
    </span>
  );
  const subs =
    opt.f_obj &&
    opt.f_obj.sub_fields &&
    opt.f_obj.sub_fields.map((e) => {
      if (e.type === FieldTypes.F_LABEL) {
        return fLab(e);
      }
      if (e.type === FieldTypes.F_SYSTEM_DEFINED) {
        return fUnit(e);
      }
      return fTxt(e);
    });
  const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup style={{ display: 'flex' }}>{subs}</InputGroup>
    </Form.Group>
  );
};

const GenPropertiesNumber = (opt) => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  return (
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
      <Form.Control
        type="number"
        name={opt.field}
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
  className = `${className} status-select`;
  const val = options.find((o) => o.value === opt.value) || null;
  return (
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
      <div style={{ display: 'flex' }}>
                <span style={{ width: '100%' }}>
          <Select
            multi={false}
            isClearable
            options={options}
            value={val}
            onChange={opt.onChange}
            className={className}
            isDisabled={opt.readOnly}
            menuPlacement="auto"
            menuPortalTarget={document.body}
            styles={frmSelSty}
          />
        </span>
      </div>
    </Form.Group>
  );
};

const GenPropertiesSystemDefined = (opt) => {
  let className = opt.isEditable ? 'editable' : 'readonly';
  className = opt.isRequired && opt.isEditable ? 'required' : className;
  const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
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
        <Button disabled={opt.readOnly} onClick={opt.onClick} variant="success">
          {genUnitSup(genUnit(opt.option_layers, opt.value_system).label) || ''}
        </Button>
      </InputGroup>
    </Form.Group>
  );
};

const GenPropertiesTable = (opt) => (
  <Form.Group as={Col}>
    <LFieldLabel label={opt.label} description={opt.description} />
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
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
      <Form.Control
        id={id}
        name={id}
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
  // const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
      <Form.Control
        id={id}
        name={id}
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
      if (field.includes(`[${Constants.SEPARATOR_TAG}]`)) {
        const fds = field.split(`[${Constants.SEPARATOR_TAG}]`);
        if (fds && fds.length === 2) {
          const fdt = ((layers[layer] || {}).fields || []).find(
            (f) => f.field === fds[0] && f.type === FieldTypes.F_TABLE
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
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
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
      size="sm"
      id={attachment.uid}
      className="button-right"
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
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
      <div className="py-0">
        <Dropzone
          id="dropzone"
          onDrop={(e) =>
            opt.onChange({
              ...opt.value,
              action: 'f',
              val: e,
            })
          }
          className="lu-drop-zone"
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
          <ListGroup.Item key={attachment.uid}>
            {/* {renderListGroupItem(opt, attachment)} */}
            <FieldUploadItem opt={opt} attachment={attachment} />
          </ListGroup.Item>
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
  className = `${className} status-select`;
  const val = options.find((o) => o.value === opt.value) || null;
  return (
    <Form.Group as={Col}>
      <LFieldLabel label={opt.label} description={opt.description} />
      <Select
        menuContainerStyle={{ position: 'absolute' }}
        name={opt.field}
        multi={false}
        options={options}
        value={val}
        onChange={opt.onChange}
        className={className}
        disabled={opt.readOnly}
        menuPlacement="auto"
        menuPortalTarget={document.body}
      />
    </Form.Group>
  );
};

export {
  GenDummy,
  GenPropertiesCheckbox,
  GenPropertiesNumber,
  GenPropertiesSelect,
  GenPropertiesSystemDefined,
  GenPropertiesTable,
  GenPropertiesText,
  GenPropertiesTextArea,
  GenTextFormula,
  GenPropertiesUpload,
  // GenLabel,
  GenPropertiesDate,
  GenPropertiesDateTimeRange,
  GenPropertiesDrop,
  GenPropertiesInputGroup,
  GenWFNext,
  GenDropReaction,
};
