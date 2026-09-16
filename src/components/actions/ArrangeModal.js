import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import GModal from '@ui/modals/GModal';

function ArrangeModal({ onSave, showProps, children }) {
  const { show, setShow } = showProps;
  if (!show) return null;

  const handleSave = () => {
    const updates = children.ref?.current?.getUpdates();
    if (updates) {
      onSave(updates);
      setShow(false);
    }
  };

  return (
    <GModal
      show={show}
      onHide={() => setShow(false)}
      fullscreen
      backdrop="static"
    >
      <GModal.Header>
        <GModal.Title>Arrange the order</GModal.Title>
      </GModal.Header>
      <GModal.Body
        className="d-flex flex-column p-0"
        style={{ overflow: 'hidden' }}
      >
        {children}
      </GModal.Body>
      <GModal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save
        </Button>
      </GModal.Footer>
    </GModal>
  );
}

ArrangeModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export default ArrangeModal;
