/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';

const ArrangeModal = ({ onSave, showProps, children }) => {
  const { show, setShow } = showProps;
  if (!show) return null;

  const handleSave = () => {
    // Get the current value from ArrangeContent via ref
    const updatedLayers = children.ref?.current?.getNewLayers();
    if (updatedLayers) {
      onSave(updatedLayers);
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
      <Modal.Footer>
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
