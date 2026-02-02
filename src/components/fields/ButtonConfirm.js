/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import LPopover from '@components/shared/LPopover';

function ButtonConfirm(props) {
  const { msg, cls, fnClick, size, fnParams, place, fa, disabled } = props;
  const onClick = (event) => {
    fnClick(fnParams);
    event.stopPropagation();
  };
  const popoverContent = (
    <div
      className="bg-white border rounded shadow-sm p-3"
      style={{ maxWidth: '400px' }}
    >
      <h6 className="mb-2">Confirm Action</h6>
      <p className="mb-3">
        {FIcons.faTriangleExclamation} {msg || 'Confirm'}
      </p>
      <div className="d-flex justify-content-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => e.stopPropagation()}
          data-testid="confirm-btn-no"
        >
          No
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={onClick}
          data-testid="confirm-btn-yes"
        >
          Yes
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
        type="button"
      >
        {FIcons[fa]}
      </Button>
    </LPopover>
  );
}

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
