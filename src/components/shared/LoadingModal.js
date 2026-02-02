import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Spinner } from 'react-bootstrap';

const LoadingModal = ({ show, message, title }) => {
  return (
    <Modal
      show={show}
      backdrop="static"
      keyboard={false}
      centered
      size="sm"
    >
      <Modal.Body className="text-center p-4">
        <div className="d-flex flex-column align-items-center">
          <Spinner animation="border" role="status" variant="primary" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          {title && <h6 className="mb-2">{title}</h6>}
          <p className="mb-0 text-muted">{message}</p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

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
