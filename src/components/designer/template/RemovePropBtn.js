/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import { handleDelete } from '../../../utils/template/action-handler';
import FIcons from '../../icons/FIcons';

// replace renderDeleteButton
const RemovePropBtn = props => {
  const { delStr, delKey, delRoot, element, fnDelete } = props;
  let allowed = Object.entries(FieldTypes)
    .filter(([key]) => key.startsWith('DEL_'))
    .reduce((acc, [key, value]) => {
      return { ...acc, [key]: value };
    }, {});
  allowed = Object.values(allowed);
  if (!allowed.includes(delStr)) return <></>;

  let msg = 'remove?';
  if (delStr === FieldTypes.DEL_SELECT) {
    msg = `remove this select option: [${delKey}] ?`;
  } else if (delStr === FieldTypes.DEL_OPTION) {
    msg = `remove this option: [${delKey}] from select [${delRoot}] ?`;
  } else if (delStr === FieldTypes.DEL_LAYER) {
    msg = `remove this layer: [${delKey}] ?`;
  } else if (delStr === FieldTypes.DEL_FIELD) {
    msg = `remove this field: [${delKey}] from layer [${delRoot}] ?`;
  } else {
    msg = `remove ???: ${delStr}`;
  }

  const onClick = event => {
    event.stopPropagation();
    const result = handleDelete(delStr, delKey, delRoot, element);
    fnDelete(result);
  };

  const popover = (
    <Popover id="popover-template-remove-props-btn">
      {msg} <br />
      <div className="btn-toolbar">
        <Button
          bsSize="sm"
          bsStyle="danger"
          aria-hidden="true"
          onClick={onClick}
          data-testid="template-remove-yes-btn"
        >
          Yes
        </Button>
        <span>&nbsp;&nbsp;</span>
        <Button
          bsSize="sm"
          bsStyle="warning"
          data-testid="template-remove-no-btn"
        >
          No
        </Button>
      </div>
    </Popover>
  );

  return (
    <OverlayTrigger
      animation
      placement="top"
      root
      trigger="focus"
      overlay={popover}
    >
      <Button bsSize="sm" data-testid="template-remove-btn">
        {FIcons.faTrashCan}
      </Button>
    </OverlayTrigger>
  );
};

RemovePropBtn.propTypes = {
  delStr: PropTypes.string.isRequired,
  delKey: PropTypes.string.isRequired,
  delRoot: PropTypes.string,
  element: PropTypes.object.isRequired,
  fnDelete: PropTypes.func.isRequired,
};

RemovePropBtn.defaultProps = { delRoot: null };

export default RemovePropBtn;
