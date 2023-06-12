/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { handleDelete } from '../../../utils/template/action-handler';

// replace renderDeleteButton
const RemovePropBtn = props => {
  const { delStr, delKey, delRoot, element, fnDelete } = props;

  if (!['Select', 'Option', 'Layer', 'Field'].includes(delStr)) return <></>;

  let msg = 'remove?';
  if (delStr === 'Select') {
    msg = `remove this select option: [${delKey}] ?`;
  } else if (delStr === 'Option') {
    msg = `remove this option: [${delKey}] from select [${delRoot}] ?`;
  } else if (delStr === 'Layer') {
    msg = `remove this layer: [${delKey}] ?`;
  } else if (delStr === 'Field') {
    msg = `remove this field: [${delKey}] from layer [${delRoot}] ?`;
  } else {
    msg = `remove ???: ${delStr}`;
  }

  const onClick = () => {
    const result = handleDelete(delStr, delKey, delRoot, element);
    fnDelete(result);
  };

  const popover = (
    <Popover id="popover-positioned-scrolling-left">
      {msg} <br />
      <div className="btn-toolbar">
        <Button
          bsSize="xsmall"
          bsStyle="danger"
          aria-hidden="true"
          onClick={onClick}
        >
          Yes
        </Button>
        <span>&nbsp;&nbsp;</span>
        <Button bsSize="xsmall" bsStyle="warning">
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
      <Button bsSize="sm">
        <i className="fa fa-trash-o" aria-hidden="true" />
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
