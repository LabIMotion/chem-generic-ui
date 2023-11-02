/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';

const ButtonConfirm = (props) => {
  const {
    msg, size, bs, fnClick, fnParams, place, fa, disabled
  } = props;
  const popover = (
    <Popover id="popover-button-confirm">
      {msg}
      {' '}
      <br />
      <div className="btn-toolbar">
        <Button
          bsSize="xsmall"
          bsStyle="danger"
          aria-hidden="true"
          onClick={() => fnClick(fnParams)}
        >
          Yes
        </Button>
        <span>&nbsp;&nbsp;</span>
        <Button bsSize="xsmall" bsStyle="warning">No</Button>
      </div>
    </Popover>
  );

  return (
    <OverlayTrigger animation placement={place} root trigger="focus" overlay={popover}>
      <Button bsSize={size} bsStyle={bs} disabled={disabled}>
        <i className={`fa ${fa}`} aria-hidden="true" />
      </Button>
    </OverlayTrigger>
  );
};

ButtonConfirm.propTypes = {
  msg: PropTypes.string.isRequired,
  fnParams: PropTypes.object.isRequired,
  fnClick: PropTypes.func.isRequired,
  bs: PropTypes.string,
  size: PropTypes.string,
  place: PropTypes.string,
  fa: PropTypes.string,
  disabled: PropTypes.bool,
};

ButtonConfirm.defaultProps = {
  bs: 'danger', size: 'xs', place: 'right', fa: 'fa-trash-o', disabled: false
};

export default ButtonConfirm;
