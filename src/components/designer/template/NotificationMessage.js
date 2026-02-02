import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

const NotificationMessage = ({ notify, onClose }) => {
  if (notify === null) return null;

  return (
    <Alert variant={notify.isSuccess ? 'success' : 'danger'}>
      <span>
        <b>{notify.title}</b>
        {`: ${notify.msg}`}
      </span>
      <Button
        size="xsm"
        className="gu_button_right"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        variant="light"
      >
        {FIcons.faTimes}
      </Button>
    </Alert>
  );
};

NotificationMessage.propTypes = {
  notify: PropTypes.shape({
    isSuccess: PropTypes.bool,
    title: PropTypes.string,
    msg: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

NotificationMessage.defaultProps = {
  notify: null,
};

export default NotificationMessage;
