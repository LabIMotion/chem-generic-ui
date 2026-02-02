import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Popover, OverlayTrigger } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

export const ModalOntologySelect = props => {
  const { showProps, modalComponent } = props;
  const { show, setShow } = showProps;

  return (
    <Modal centered backdrop="static" show={show} onHide={() => setShow(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Select Term</Modal.Title>
      </Modal.Header>
      <Modal.Body>{modalComponent}</Modal.Body>
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
      <div className="p-3">Link to ontology terminology</div>
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
        <Button
          variant="light"
          onClick={() => setShow(true)}
          className="flex-shrink-0"
        >
          {customClass ? (
            <span>
              <span style={{ color: 'green' }}>{FIcons.faCircleCheck}</span>
              &nbsp;
            </span>
          ) : null}
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
