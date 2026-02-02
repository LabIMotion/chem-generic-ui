/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { FieldTypes } from 'generic-ui-core';
import { frmSelSty } from '@components/tools/utils';

const SelectRenderer = (props) => {
  const { sField, onChange, sOptions, node } = props;
  if (sField.type !== FieldTypes.F_SELECT || sOptions.length < 1) return null;
  const { data } = node;
  const val = sOptions.find((o) => o.value === data[sField.id].value) || null;
  return (
    <Select
      styles={frmSelSty}
      isClearable
      menuContainerStyle={{ position: 'absolute' }}
      multi={false}
      options={sOptions}
      value={val}
      onChange={(e) => onChange(e, sField, node)}
      menuPlacement="auto"
      menuPortalTarget={document.body}
      // className="status-select"
    />
  );
};

SelectRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  sOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default SelectRenderer;
