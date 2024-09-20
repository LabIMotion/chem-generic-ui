import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import LayersGrid from './LayerGrid';
import FIcons from '../../icons/FIcons';

const LayerGridBtn = () => {
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <Button className="button-right btn-gxs" onClick={handleShow}>
        {FIcons.faPlus}&nbsp;From Standard Layer
      </Button>

      <Modal
        show={showModal}
        onHide={handleClose}
        dialogClassName="gu_modal-68w"
      >
        <Modal.Header closeButton>
          <Modal.Title>Standard Layer List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LayersGrid />
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LayerGridBtn;
