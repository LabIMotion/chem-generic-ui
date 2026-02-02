import React from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import FieldHeader from '@components/fields/FieldHeader';
import { fieldCls, frmSelSty } from '@components/tools/utils';

const GenPropSelectMulti = (opt) => {
  const {
    field,
    f_obj: fObj,
    options,
    onChange,
    isRequired,
    isEditable,
    isSpCall,
    readOnly,
  } = opt;
  const klz = fieldCls(isSpCall);
  const selectOpts = options.map((op) => {
    return {
      value: op.key,
      name: op.key,
      label: op.label,
    };
  });
  let className = isEditable
    ? 'select_generic_properties_editable'
    : 'select_generic_properties_readonly';
  className =
    isRequired && isEditable ? 'select_generic_properties_required' : className;
  const selectedOpts = (fObj?.sub_fields || [])
    .map((sf) => {
      const op = selectOpts.find((o) => o.value === sf.value);
      if (op) {
        return op;
      }
      return null;
    })
    .filter(Boolean);
  return (
    <Form.Group className={klz[0]}>
      {FieldHeader(opt)}
      <span className={klz[1]}>
        <Select
          className={className}
          isClearable
          isMulti
          isDisabled={readOnly}
          menuPlacement="auto"
          menuPortalTarget={document.body}
          name={field}
          options={selectOpts}
          onChange={onChange}
          styles={frmSelSty}
          value={selectedOpts}
        />
      </span>
    </Form.Group>
  );
};

export default GenPropSelectMulti;
