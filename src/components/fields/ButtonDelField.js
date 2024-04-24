/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FieldTypes } from 'generic-ui-core';
import ButtonConfirm from './ButtonConfirm';
import { handleDelete } from '../../utils/template/action-handler';

const confirmDelete = props => {
  const { generic, str, key, root, fnConfirm } = props;
  const result = handleDelete(str, key, root, generic);
  fnConfirm(result);
};

const ButtonDelField = props => {
  const { generic, delType, delKey, delRoot, fnConfirm } = props;
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
    generic,
    str: delType,
    key: delKey,
    root: delRoot,
    fnConfirm,
  };

  return (
    <ButtonConfirm
      msg={msg}
      fnClick={confirmDelete}
      fnParams={fnParams}
      bs="default"
      place="top"
    />
  );
};

ButtonDelField.propTypes = {
  generic: PropTypes.object.isRequired,
  delType: PropTypes.string.isRequired,
  delKey: PropTypes.string,
  delRoot: PropTypes.string,
  fnConfirm: PropTypes.func.isRequired,
};

ButtonDelField.defaultProps = { delKey: '', delRoot: '' };

export default ButtonDelField;
