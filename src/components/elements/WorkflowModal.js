/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

const WorkflowModal = ({ showProps, children }) => {
  const { show, setShow } = showProps;
  if (!show) return null;

  return (
    <Modal
      centered
      show={show}
      onHide={() => setShow(false)}
      fullscreen
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Design Workflow</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

WorkflowModal.propTypes = {
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export default WorkflowModal;
