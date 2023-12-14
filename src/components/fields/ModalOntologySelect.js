import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Popover, OverlayTrigger } from 'react-bootstrap';

export const ModalOntologySelect = props => {
  const { showProps, modalComponent } = props;
  const { show, setShow } = showProps;

  return (
    <Modal backdrop="static" show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Select Term</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {modalComponent}
      </Modal.Body>
    </Modal>
  );
};

ModalOntologySelect.propTypes = {
  modalComponent: PropTypes.element.isRequired,
  showProps: PropTypes.object.isRequired,
};

export const ButtonOntologySelect = props => {
  const { modalComponent, customClass } = props;
  const [show, setShow] = useState(false);
  const popover = (
    <Popover id="popover-positioned-scrolling-left">
      Link to ontology terminology
    </Popover>
  );
  return (
    <>
      <OverlayTrigger
        animation
        placement="top"
        root
        trigger={['hover', 'focus', 'click']}
        overlay={popover}
      >
        <Button onClick={() => setShow(true)}>
          {customClass ? <span><i style={{ color: 'green' }} className="fa fa-check-circle" aria-hidden="true" />&nbsp;</span> : null}
          Term
        </Button>
      </OverlayTrigger>
      <ModalOntologySelect
        modalComponent={modalComponent}
        showProps={{ show, setShow }}
      />
    </>
  );
};
