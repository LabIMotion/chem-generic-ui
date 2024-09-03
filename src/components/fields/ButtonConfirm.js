/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FIcons from '../icons/FIcons';
import LPopover from '../shared/LPopover';

const ButtonConfirm = (props) => {
  const { msg, size, fnClick, fnParams, place, fa, disabled } = props;
  const onClick = (event) => {
    event.stopPropagation();
    fnClick(fnParams);
  };
  const popoverContent = (
    <>
      <p>{msg || `Confirm`}</p>
      <div className="btn-toolbar">
        <Button
          bsSize="sm"
          bsStyle="danger"
          aria-hidden="true"
          onClick={onClick}
          data-testid="confirm-btn-yes"
        >
          Yes
        </Button>
        <span>&nbsp;&nbsp;</span>
        <Button bsSize="sm" bsStyle="warning" data-testid="confirm-btn-no">
          No
        </Button>
      </div>
    </>
  );
  return (
    <LPopover content={popoverContent} trigger={['focus']} placement={place}>
      <Button bsSize={size} disabled={disabled} data-testid="confirm-btn">
        {FIcons[fa]}
      </Button>
    </LPopover>
  );
};

ButtonConfirm.propTypes = {
  msg: PropTypes.string.isRequired,
  fnParams: PropTypes.object.isRequired,
  fnClick: PropTypes.func.isRequired,
  size: PropTypes.string,
  place: PropTypes.string,
  fa: PropTypes.string,
  disabled: PropTypes.bool,
};

ButtonConfirm.defaultProps = {
  size: 'sm',
  place: 'top',
  fa: 'faTrashCan',
  disabled: false,
};

export default ButtonConfirm;
