import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'react-bootstrap';
import GModal from '@ui/modals/GModal';

function LoadingModal({ show, message, title }) {
  return (
    <GModal show={show} backdrop="static" keyboard={false} size="sm">
      <GModal.Body className="text-center p-4">
        <div className="d-flex flex-column align-items-center">
          <Spinner
            animation="border"
            role="status"
            variant="primary"
            className="mb-3"
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          {title && <h6 className="mb-2">{title}</h6>}
          <p className="mb-0 text-muted">{message}</p>
        </div>
      </GModal.Body>
    </GModal>
  );
}

LoadingModal.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string,
  title: PropTypes.string,
};

LoadingModal.defaultProps = {
  message: 'Please wait...',
  title: null,
};

export default LoadingModal;
