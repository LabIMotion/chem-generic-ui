/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import { FieldTypes } from 'generic-ui-core';
import GenericElTableDropTarget from '@components/table/GenericElTableDropTarget';

const DropRenderer = (props) => {
  const { opt, sField, onChange, node, genericType } = props;
  if (![FieldTypes.F_DRAG_MOLECULE, FieldTypes.F_DRAG_SAMPLE].includes(sField.type)) return null;
  const { data } = node;
  opt.dndItems = [sField.type.split('_')[1]];
  opt.sField = sField;
  opt.data = data;
  const oopt = cloneDeep(opt);
  return (
    <div className="drop_generic_properties drop_generic_table_wrap">
      <GenericElTableDropTarget opt={oopt} onDrop={onChange} genericType={genericType}  />
    </div>
  );
};

DropRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  opt: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
};

export default DropRenderer;
