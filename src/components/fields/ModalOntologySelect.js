import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, OverlayTrigger } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import GModal from '@ui/modals/GModal';

export function ModalOntologySelect(props) {
  const { showProps, modalComponent } = props;
  const { show, setShow } = showProps;

  return (
    <GModal backdrop="static" show={show} onHide={() => setShow(false)}>
      <GModal.Header>
        <GModal.Title>Select Term</GModal.Title>
      </GModal.Header>
      <GModal.Body>{modalComponent}</GModal.Body>
    </GModal>
  );
}

ModalOntologySelect.propTypes = {
  modalComponent: PropTypes.element.isRequired,
  showProps: PropTypes.object.isRequired,
};

export function ButtonOntologySelect(props) {
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
}
