/* eslint-disable react/destructuring-assignment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import AsyncSelect from 'react-select/async';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { downloadFile, genUnit, FieldTypes } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import DateTimeRange from '@components/fields/DateTimeRange';
import FieldHeader from '@components/fields/FieldHeader';
import { fieldCls, frmSelSty, genUnitSup } from '@components/tools/utils';
import GenericElDropTarget from '@components/dnd/GenericElDropTarget';
import TableRecord from '@components/table/TableRecord';
import FieldUploadItem from '@components/fields/FieldUploadItem';
import DropReaction from '@components/dnd/DropReaction';
import ButtonDatePicker from '@components/fields/ButtonDatePicker';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import TAs from '@components/tools/TAs';
import TextLabel from '@ui/common/TextLabel';
import { modeClass } from '@/utils/pureUtils';
import Api from '@utils/apiManager';
import {
  MIN_USER_SEARCH_LENGTH,
  S_USRS_SEARCH_HINT,
  S_USRS_SRC,
  userToOption,
  responseUserOptions,
  selectedUserOption,
  getCachedUserOptions,
  mergeUserOptionsIntoCache,
  fetchMissingUserOptions,
} from '@utils/userSelectUtils';
import {
  formatNumberDisplay,
  resolveDecimals,
  validateNumberValue,
} from '@utils/numberUtils';

const toSelectOption = (op) => ({
  value: op.key,
  name: op.key,
  label: op.label,
});

function GenPropertiesCheckbox(opt) {
  if (opt.isSpCall) {
    return (
      <Form.Group className="props_text gu_sp_form">
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
    <Form.Group className={fieldCls(opt.isSpCall)[0]}>
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
          // className="mt-2"
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
}

function GenPropertiesDate(opt) {
  const klz = fieldCls(opt.isSpCall);
  const isAtLayer = opt.isAtLayer || false;
  const klzLayer = isAtLayer ? 'gu_date_picker_layer' : '';
  // at layer level the picker is not a field row, so it carries no row margin
  const klzFrm = isAtLayer ? klz[0].replace('mb-3', '').trim() : klz[0];
  const newVal =
    opt.value &&
    new Date(moment(opt.value, 'DD/MM/YYYY HH:mm:ss').toISOString());
  // const newVal = opt.value && moment(opt.value, 'DD/MM/YYYY HH:mm:ss');

  return (
    <Form.Group className={klzFrm}>
      {FieldHeader(opt)}
      <div className={klzLayer}>
        <ButtonDatePicker
          onChange={opt.onChange}
          val={newVal}
          readOnly={opt.readOnly}
        />
      </div>
    </Form.Group>
  );
}

function GenPropertiesDateTimeRange(opt) {
  const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group className={`${klz[0]}`}>
      {FieldHeader(opt)}
      <DateTimeRange key={`grid_${opt.f_obj.field}`} opt={opt} />
    </Form.Group>
  );
}

function GenPropertiesDrop(opt) {
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
    opt.type === FieldTypes.F_DRAG_ELEMENT ? (
      <span className="indicator">{FIcons.faLink}</span>
    ) : (
      <span className="icon-sample indicator" />
    );
  const dragTarget =
    opt.isPreview === true ? (
      <div className="target">{defaultIcon}</div>
    ) : (
      <GenericElDropTarget
        opt={opt}
        onDrop={opt.onChange}
        readOnly={opt.readOnly}
      />
    );

  return (
    <Form.Group className={fieldCls(opt.isSpCall)[0]}>
      {FieldHeader(opt)}
      <div style={{ paddingBottom: '0px' }}>
        <div className={className}>
          {dragTarget}
          {createOpt}
          {opt.isEditable && (
            <div style={{ zIndex: '3' }}>
              <LTooltip idf="remove">
                <Button
                  size="sm"
                  className="btn_del"
                  variant="danger"
                  onClick={() => opt.onChange({})}
                  disabled={!opt.isEditable}
                >
                  {FIcons.faTrashCan}
                </Button>
              </LTooltip>
            </div>
          )}
        </div>
      </div>
    </Form.Group>
  );
}

function GenDummy() {
  return (
    <Form.Group className={`props_text ${fieldCls()[0]}`}>
      <Form.Control type="text" className="dummy" readOnly />
    </Form.Group>
  );
}

function GenDropReaction(opt) {
  return (
    <DropReaction
      field={opt.f_obj}
      onNavi={opt.onNavi}
      onChange={opt.onChange}
      isEditable={opt.isEditable}
    />
  );
}

function GenPropertiesInputGroup(opt) {
  const { f_obj: fObj, isPreview, isSpCall, onSubChange, readOnly } = opt;
  const handleSubChange = useCallback(
    (event, id) => {
      onSubChange(event, id, fObj);
    },
    [onSubChange, fObj],
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
            className={`gu-${modeClass(readOnly, false)}`}
            onChange={(o) => handleSubChange(o, e.id, fObj)}
            min={1}
            readOnly={readOnly}
          />
          <Button
            onClick={() => handleSubChange(e, e.id, fObj)}
            variant="success"
            disabled={readOnly || isPreview}
          >
            {genUnitSup(genUnit(e.option_layers, e.value_system).label) || ''}
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
        className={`gu-${modeClass(readOnly, false)}`}
        onChange={(o) => handleSubChange(o, e.id, fObj)}
        readOnly={readOnly}
      />
    );
  });
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <InputGroup>{subs}</InputGroup>
    </Form.Group>
  );
}

function GenPropertiesNumber(opt) {
  const className = modeClass(opt.readOnly, opt.isRequired);
  const klz = fieldCls(opt.isSpCall);
  const fObj = opt.f_obj || {};

  const decimals = resolveDecimals(fObj.numeric?.decimals);

  const numericHint = (() => {
    if (!fObj.numeric) return null;
    const parts = [];
    parts.push(`dec: ${resolveDecimals(fObj.numeric.decimals)}`);
    if (fObj.numeric.min !== '' && fObj.numeric.min != null)
      parts.push(`min: ${fObj.numeric.min}`);
    if (fObj.numeric.max !== '' && fObj.numeric.max != null)
      parts.push(`max: ${fObj.numeric.max}`);
    return `(${parts.join(', ')})`;
  })();

  // localValue holds the raw text while the user is typing (null = not editing)
  const [localValue, setLocalValue] = useState(null);

  const displayValue =
    opt.value !== null && opt.value !== undefined && opt.value !== ''
      ? formatNumberDisplay(opt.value, decimals)
      : '';

  // Validate the stored value against current constraints when not actively editing
  const isEditing = localValue !== null;
  const hasStoredValue =
    opt.value !== null && opt.value !== undefined && opt.value !== '';
  const { valid: isValueValid, errors: valueErrors } =
    !isEditing && hasStoredValue
      ? validateNumberValue(opt.value, {
          decimals: fObj.numeric?.decimals,
          min: fObj.numeric?.min,
          max: fObj.numeric?.max,
        })
      : { valid: true, errors: [] };

  const handleFocus = () => {
    // Seed with the raw stored value so the edit text is parseable on blur.
    // Avoid the formatted display string, which may include thousands
    // separators that parseDecimal rejects.
    setLocalValue(
      opt.value === null || opt.value === undefined || opt.value === ''
        ? ''
        : String(opt.value),
    );
  };

  const handleChange = (e) => {
    // keep the raw text while the user is typing — no parsing or formatting yet
    setLocalValue(e.target.value);
  };

  const handleBlur = (e) => {
    // commit to parent with a synthetic event; parent will parse + store
    if (opt.onChange) {
      opt.onChange({ target: { value: e.target.value } });
    }
    setLocalValue(null);
  };

  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <Form.Control
        type="text"
        value={localValue !== null ? localValue : displayValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${className} text-end`}
        isInvalid={!isValueValid}
        readOnly={opt.readOnly}
        required={opt.isRequired}
        placeholder={opt.placeholder}
      />
      {!isValueValid && (
        <Form.Control.Feedback type="invalid">
          {valueErrors[0]}
        </Form.Control.Feedback>
      )}
      {numericHint && <Form.Text muted>{numericHint}</Form.Text>}
    </Form.Group>
  );
}

function GenPropertiesSelect(opt) {
  const isSUsers = opt.f_obj?.option_layers === S_USRS_SRC;
  const [remoteOptions, setRemoteOptions] = useState(() =>
    isSUsers ? getCachedUserOptions() : [],
  );
  const options = useMemo(
    () => (opt.options || []).map(toSelectOption),
    [opt.options],
  );

  // Resolve the stored value id whenever it changes (incl. mount) so a value
  // swapped in after mount doesn't linger as "(depr.)". The fetch is a no-op
  // when the id is already cached or known-invalid.
  useEffect(() => {
    if (!isSUsers) return;
    fetchMissingUserOptions(
      opt.value != null && opt.value !== '' ? [opt.value] : [],
    ).then((fetched) => {
      if (fetched.length > 0) setRemoteOptions(getCachedUserOptions());
    });
  }, [opt.value, isSUsers]);
  let className = modeClass(opt.readOnly, opt.isRequired);
  className = `select_generic_properties_${className}`;
  const sourceOptions = isSUsers ? remoteOptions : options;
  const val = selectedUserOption(opt.value, sourceOptions);
  const klz = fieldCls(opt.isSpCall);

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
  };

  const loadUserOptions = async (inputValue) => {
    const search = inputValue.trim();
    if (search.length < MIN_USER_SEARCH_LENGTH) return [];

    const result = await Api.getUsers({ name: search });
    const fetchedOptions = responseUserOptions(result)
      .map(userToOption)
      .filter((op) => op.value !== '');
    mergeUserOptionsIntoCache(fetchedOptions);
    setRemoteOptions((currentOptions) => {
      const optionMap = new Map(
        [...currentOptions, ...fetchedOptions].map((op) => [op.value, op]),
      );
      return Array.from(optionMap.values());
    });
    return fetchedOptions;
  };

  const selectProps = {
    isClearable: true,
    name: opt.field,
    value: val,
    onChange: opt.onChange,
    className,
    isDisabled: opt.readOnly,
    menuPlacement: 'auto',
    menuPortalTarget: document.body,
    styles: { ...frmSelSty, ...customStyles },
  };

  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <span className={klz[1]}>
        {isSUsers ? (
          <AsyncSelect
            {...selectProps}
            cacheOptions
            defaultOptions={false}
            loadOptions={loadUserOptions}
          />
        ) : (
          <Select {...selectProps} options={options} />
        )}
      </span>
      {isSUsers && <Form.Text muted>{S_USRS_SEARCH_HINT}</Form.Text>}
    </Form.Group>
  );
}

function GenPropertiesSystemDefined(opt) {
  const className = modeClass(opt.readOnly, opt.isRequired);
  const klz = fieldCls(opt.isSpCall);
  const hasUT = !!genUnit(opt.option_layers, opt.value_system).unit_type;
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
          className={`gu-${className} ${klz[1]}`}
          readOnly={opt.readOnly}
          required={opt.isRequired}
          placeholder={opt.placeholder}
        />
        <Button
          size="sm"
          disabled={opt.readOnly || opt.isPreview}
          onClick={opt.onClick}
          variant="success"
          title={hasUT ? TAs.no_unit_conversion : undefined}
        >
          {genUnitSup(genUnit(opt.option_layers, opt.value_system).label) || ''}
        </Button>
      </InputGroup>
    </Form.Group>
  );
}

function GenPropertiesTable(opt) {
  return (
    <Form.Group className={fieldCls(opt.isSpCall)[0]}>
      {FieldHeader(opt)}
      <TableRecord key={`grid_${opt.f_obj.field}`} opt={opt} />
    </Form.Group>
  );
}

function GenPropertiesText(opt) {
  const [id] = useState(uuid());
  const { f_obj: fObj } = opt;
  const showVal = opt.value;
  if (fObj?.readonly) return <TextLabel opt={opt} value={fObj.placeholder} />;

  const klz = fieldCls(opt.isSpCall);

  let className = modeClass(opt.readOnly, opt.isRequired);
  const readOnly = opt.readOnly || false;
  if (readOnly) {
    className = 'readonly';
  }

  return (
    <Form.Group className={`props_text ${klz[0]}`}>
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
}

function GenPropertiesTextArea(opt) {
  const [id] = useState(uuid());
  const className = modeClass(opt.readOnly, opt.isRequired);
  const klz = fieldCls(opt.isSpCall);
  return (
    <Form.Group className={`props_text ${klz[0]}`}>
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
}

function GenTextFormula(opt) {
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
            (f) => f.field === fds[0] && f.type === FieldTypes.F_TABLE,
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
          (f) => f.field === field,
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
    <Form.Group className={`props_text ${klz[0]}`}>
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
}

const renderListGroupItem = (opt, attachment) => {
  const delBtn = (
    <Button
      id={attachment.uid}
      size="sm"
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

function GenPropertiesUpload(opt) {
  const attachments = (opt.value && opt.value.files) || [];
  if (opt.isSearch) return <div>(This is an upload)</div>;
  return (
    <Form.Group className={`props_text ${fieldCls(opt.isSpCall)[0]}`}>
      {FieldHeader(opt)}
      {!opt.readOnly ? (
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
      ) : null}
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
}

function GenWFNext(opt) {
  const options = (opt.f_obj.wf_options || []).map((op) => {
    const label = op.label.match(/(.*)\(.*\)/);
    return {
      value: op.key,
      name: op.key,
      label: label[1] === '' ? label[0] : label[1],
    };
  });
  let className = modeClass(opt.readOnly, opt.isRequired);
  className = `select_generic_properties_${className}`;

  const val = options.find((o) => o.value === opt.value) || null;
  return (
    <Form.Group className={fieldCls(opt.isSpCall)[0]}>
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
}

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
