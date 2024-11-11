/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';

const ArrangeModal = ({ onSave, showProps, children }) => {
  const { show, setShow } = showProps;
  if (!show) return null;

  const handleSave = () => {
    // Get the current value from ArrangeContent via ref
    const updates = children.ref?.current?.getUpdates();
    if (updates) {
      onSave(updates);
      setShow(false);
    }
  };

  return (
    <Modal
      centered
      show={show}
      onHide={() => setShow(false)}
      fullscreen
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Arrange the order</Modal.Title>
      </Modal.Header>
      <Modal.Body
        className="d-flex flex-column p-0"
        style={{ overflow: 'hidden' }}
      >
        {children}
      </Modal.Body>
      <Modal.Footer className="justify-content-start">
        <Button variant="secondary" onClick={() => setShow(false)}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ArrangeModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export default ArrangeModal;
