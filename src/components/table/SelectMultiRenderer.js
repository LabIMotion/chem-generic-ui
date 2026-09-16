/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { FieldTypes } from 'generic-ui-core';
import { frmSelSty } from '@components/tools/utils';

function SelectMultiRenderer(props) {
  const { sField, onChange, sOptions, node } = props;
  if (sField.type !== FieldTypes.F_SELECT_MULTI || sOptions.length < 1)
    return null;
  const { data } = node;
  const rawValue = data[sField.id]?.value;
  const selected = Array.isArray(rawValue)
    ? rawValue.map((v) => sOptions.find((o) => o.value === v)).filter(Boolean)
    : [];
  return (
    <Select
      styles={frmSelSty}
      isClearable
      isMulti
      menuContainerStyle={{ position: 'absolute' }}
      options={sOptions}
      value={selected}
      onChange={(e) => onChange(e, sField, node)}
      menuPlacement="auto"
      menuPortalTarget={document.body}
    />
  );
}

SelectMultiRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  sOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SelectMultiRenderer;
