import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import FIcons from '../../icons/FIcons';

const NotificationMessage = ({ notify, onClose }) => {
  if (notify === null) return null;

  return (
    <Alert bsStyle={notify.isSuccess ? 'success' : 'danger'}>
      <span>
        <b>{notify.title}</b>
        {`: ${notify.msg}`}
      </span>
      <Button
        bsStyle={notify.isSuccess ? 'success' : 'danger'}
        className="gu_button_right btn-gxs"
        onClick={onClose}
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
