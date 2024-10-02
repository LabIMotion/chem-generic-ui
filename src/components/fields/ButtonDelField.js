/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { MenuItem } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import ButtonConfirm from './ButtonConfirm';
import FIcons from '../icons/FIcons';
import { handleDelete } from '../../utils/template/action-handler';

const confirmDelete = (props) => {
  const { generic, str, key, root, fnConfirm } = props;
  const result = handleDelete(str, key, root, generic);
  fnConfirm(result);
};

const ButtonDelField = (props) => {
  const { generic, delType, delKey, delRoot, fnConfirm, as } = props;

  let allowed = Object.entries(FieldTypes)
    .filter(([key]) => key.startsWith('DEL_'))
    .reduce((acc, [key, value]) => {
      return { ...acc, [key]: value };
    }, {});
  allowed = Object.values(allowed);
  if (!allowed.includes(delType)) return <></>;

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

  const conditionMenu = (
    <MenuItem
      eventKey="_del_menu_item"
      onClick={() => {
        confirmDelete(fnParams);
      }}
      className="gu-menu-item-del"
    >
      {FIcons.faTrashCan}&nbsp;&nbsp;{msg}
    </MenuItem>
  );

  return (
    <>
      {as === 'menu' ? (
        conditionMenu
      ) : (
        <ButtonConfirm msg={msg} fnClick={confirmDelete} fnParams={fnParams} />
      )}
    </>
  );
};

ButtonDelField.propTypes = {
  generic: PropTypes.object.isRequired,
  delType: PropTypes.string.isRequired,
  delKey: PropTypes.string,
  delRoot: PropTypes.string,
  fnConfirm: PropTypes.func.isRequired,
  as: PropTypes.string,
};

ButtonDelField.defaultProps = { delKey: '', delRoot: '', as: 'button' };

export default ButtonDelField;
