/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

const SelectRenderer = (props) => {
  const {
    sField, onChange, sOptions, node
  } = props;
  if (sField.type !== 'select' || sOptions.length < 1) return null;
  const { data } = node;
  const val = sOptions.find(o => o.value === data[sField.id].value) || null;
  const selectStyles = {
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    menu: base => ({ ...base, zIndex: 9999 })
  };
  return (
    <Select
      isClearable
      menuContainerStyle={{ position: 'absolute' }}
      multi={false}
      options={sOptions}
      value={val}
      onChange={e => onChange(e, sField, node)}
      className="status-select"
      styles={selectStyles}
    />
  );
};

SelectRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
  sOptions: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default SelectRenderer;
