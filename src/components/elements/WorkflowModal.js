import React from 'react';
import PropTypes from 'prop-types';
import GModal from '@ui/modals/GModal';

function WorkflowModal({ showProps, children }) {
  const { show, setShow } = showProps;
  if (!show) return null;

  return (
    <GModal
      show={show}
      onHide={() => setShow(false)}
      fullscreen
      backdrop="static"
    >
      <GModal.Header>
        <GModal.Title>Design Workflow</GModal.Title>
      </GModal.Header>
      <GModal.Body>{children}</GModal.Body>
    </GModal>
  );
}

WorkflowModal.propTypes = {
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export default WorkflowModal;
