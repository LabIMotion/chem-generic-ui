/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';

const LayerSaveModal = ({ acts, title, showProps, children }) => {
  const { show, setShow } = showProps;
  if (!show) return null;

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="gu_modal-68w"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        {acts.map(act => act)}
        <Button onClick={() => setShow(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

LayerSaveModal.propTypes = {
  acts: PropTypes.arrayOf(PropTypes.node),
  title: PropTypes.string.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

LayerSaveModal.defaultProps = { acts: [] };

export default LayerSaveModal;
