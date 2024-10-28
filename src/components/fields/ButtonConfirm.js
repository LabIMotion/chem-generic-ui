/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FIcons from '../icons/FIcons';
import LPopover from '../shared/LPopover';

const ButtonConfirm = (props) => {
  const { msg, cls, fnClick, size, fnParams, place, fa, disabled } = props;
  const onClick = (event) => {
    fnClick(fnParams);
    event.stopPropagation();
  };
  const popoverContent = (
    <div className="p-3">
      <p>{msg || `Confirm`}</p>
      <div className="btn-toolbar">
        <Button
          size="sm"
          variant="danger"
          onClick={onClick}
          data-testid="confirm-btn-yes"
        >
          Yes
        </Button>
        <span>&nbsp;&nbsp;</span>
        <Button
          size="sm"
          variant="warning"
          onClick={(e) => e.stopPropagation}
          data-testid="confirm-btn-no"
        >
          No
        </Button>
      </div>
    </div>
  );
  return (
    <LPopover content={popoverContent} trigger={['focus']} placement={place}>
      <Button
        size={size || undefined}
        className={cls}
        disabled={disabled}
        data-testid="confirm-btn"
        variant="light"
        onClick={(e) => e.stopPropagation()}
      >
        {FIcons[fa]}
      </Button>
    </LPopover>
  );
};

ButtonConfirm.propTypes = {
  msg: PropTypes.string.isRequired,
  fnParams: PropTypes.object.isRequired,
  fnClick: PropTypes.func.isRequired,
  cls: PropTypes.string,
  size: PropTypes.string,
  place: PropTypes.string,
  fa: PropTypes.string,
  disabled: PropTypes.bool,
};

ButtonConfirm.defaultProps = {
  cls: 'btn-none',
  size: undefined,
  place: 'top',
  fa: 'faTrashCan',
  disabled: false,
};

export default ButtonConfirm;
