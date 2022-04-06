/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { findIndex } from 'lodash';
import ButtonConfirm from './ButtonConfirm';
import FieldTypes from './FieldTypes';

const confirmDelete = (props) => {
  const {
    generic, str, key, root, fnConfirm
  } = props;
  if (str === FieldTypes.DEL_SELECT) {
    delete generic.properties_template.select_options[key];
  } else if (str === FieldTypes.DEL_OPTION) {
    const { options } = generic.properties_template.select_options[root];
    if (options && options.length > 0) {
      const idx = findIndex(options, o => o.key === key);
      options.splice(idx, 1);
    }
  } else if (str === FieldTypes.DEL_LAYER) {
    delete generic.properties_template.layers[key];
  } else if (str === FieldTypes.DEL_FIELD) {
    const { fields } = generic.properties_template.layers[root];
    const idx = findIndex(fields, o => o.field === key);
    fields.splice(idx, 1);
  }
  fnConfirm(generic);
};

const ButtonDelField = (props) => {
  const {
    generic, delType, delKey, delRoot, fnConfirm
  } = props;
  let msg = 'remove?';
  if (delType === FieldTypes.DEL_SELECT) {
    msg = `remove this select option: [${delKey}] ?`;
  } else if (delType === FieldTypes.DEL_OPTION) {
    msg = `remove this option: [${delKey}] from select [${delRoot}] ?`;
  } else if (delType === FieldTypes.DEL_LAYER) {
    msg = `remove this layer: [${delKey}] ?`;
  } else if (delType === FieldTypes.DEL_FIELD) {
    msg = `remove this field: [${delKey}] from layer [${delRoot}] ?`;
  } else {
    msg = `remove ???: ${delType}`;
  }
  const fnParams = {
    generic, str: delType, key: delKey, root: delRoot, fnConfirm
  };

  return (
    <ButtonConfirm
      msg={msg}
      fnClick={confirmDelete}
      fnParams={fnParams}
      bs="default"
      place="top"
      size="sm"
    />
  );
};

ButtonDelField.propTypes = {
  generic: PropTypes.object.isRequired,
  delType: PropTypes.string.isRequired,
  delKey: PropTypes.string,
  delRoot: PropTypes.string,
  fnConfirm: PropTypes.func.isRequired
};

ButtonDelField.defaultProps = { delKey: '', delRoot: '' };

export default ButtonDelField;
