/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import ButtonConfirm from '@components/fields/ButtonConfirm';
import FIcons from '@components/icons/FIcons';
import { handleDelete } from '@utils/template/action-handler';

const AS = { BUTTON: 'button', MENU: 'menu' };

/**
 * Allowed delete types derived from FieldTypes
 */
const ALLOWED_DELETE_TYPES = new Set(
  Object.entries(FieldTypes)
    .filter(([type]) => type.startsWith('DEL_'))
    .map(([, value]) => value),
);

const DELETE_ENTITIES = {
  [FieldTypes.DEL_SELECT]: {
    label: 'this select option',
    hasRoot: false,
  },
  [FieldTypes.DEL_OPTION]: {
    label: 'this option',
    hasRoot: true,
    rootLabel: 'select',
  },
  [FieldTypes.DEL_LAYER]: {
    label: 'this layer',
    hasRoot: false,
  },
  [FieldTypes.DEL_FIELD]: {
    label: 'this field',
    hasRoot: true,
    rootLabel: 'layer',
  },
};

function buildMessage(delType, delKey, delRoot) {
  const entity = DELETE_ENTITIES[delType];
  if (!entity) {
    return `remove ???: ${delType}`;
  }

  let base =
    `Removing ${entity.label} will remove it from layer display name, restrictions, etc., if used. ` +
    `Continue with removing:`;

  if (FieldTypes.DEL_FIELD !== delType) {
    base = base.replace('layer display name, ', '');
  }

  if (entity.hasRoot) {
    return `${base} ${entity.label.replace('this ', '')} [${delKey}] from ${entity.rootLabel} [${delRoot}] ?`;
  }

  return `${base} [${delKey}] ?`;
}

function confirmDelete({ generic, delType, delKey, delRoot, fnConfirm }) {
  const result = handleDelete(delType, delKey, delRoot, generic);
  fnConfirm(result);
}

function ButtonDelField(props) {
  const { generic, delType, delKey, delRoot, fnConfirm, as } = props;

  if (!ALLOWED_DELETE_TYPES.has(delType)) {
    return null;
  }

  const msg = buildMessage(delType, delKey, delRoot);

  const fnParams = {
    generic,
    delType,
    delKey,
    delRoot,
    fnConfirm,
  };

  if (as === AS.MENU) {
    return (
      <Dropdown.Item
        eventKey="_del_menu_item"
        onClick={() => confirmDelete(fnParams)}
        className="gu-menu-item-del"
      >
        {FIcons.faTrashCan}&nbsp;&nbsp;{msg}
      </Dropdown.Item>
    );
  }

  return (
    <ButtonConfirm msg={msg} fnClick={confirmDelete} fnParams={fnParams} />
  );
}

ButtonDelField.propTypes = {
  generic: PropTypes.object.isRequired,
  delType: PropTypes.string.isRequired,
  delKey: PropTypes.string,
  delRoot: PropTypes.string,
  fnConfirm: PropTypes.func.isRequired,
  as: PropTypes.oneOf([AS.BUTTON, AS.MENU]),
};

ButtonDelField.defaultProps = {
  delKey: '',
  delRoot: '',
  as: AS.BUTTON,
};

export default ButtonDelField;
