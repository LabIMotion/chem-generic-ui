/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

const LayerSaveModal = ({ acts, title, showProps, close, children }) => {
  const { show } = showProps;
  if (!show) return null;

  return (
    <Modal centered show={show} onHide={close} dialogClassName="gu_modal-68w">
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
        role="button"
        tabIndex={0}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer className="justify-content-start">{acts.map((act) => act)}</Modal.Footer>
      </div>
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
  close: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

LayerSaveModal.defaultProps = { acts: [] };

export default LayerSaveModal;
