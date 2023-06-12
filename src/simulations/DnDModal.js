/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import DroppableComponent from './DroppableComponent';
import el from './_el_sem_v.json';

const DnDModal = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <h2>Flow Editor</h2>
      <Button variant="primary" onClick={() => setShow(true)}>
        Primary
      </Button>
      <Modal size="lg" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Woohoo, you are reading this text in a modal!
          {/* <DraggableSideBar /> */}
          {/* <DraggableNode text="Drag me!!!!!!!!!!" /> */}
          <DroppableComponent element={el} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DnDModal;
