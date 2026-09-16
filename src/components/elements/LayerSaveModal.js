import React from 'react';
import PropTypes from 'prop-types';
import GModal from '@ui/modals/GModal';

function LayerSaveModal({ acts, title, showProps, close, children }) {
  const { show } = showProps;
  if (!show) return null;

  return (
    <GModal show={show} onHide={close} dialogClassName="gu_modal-68w">
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
        role="button"
        tabIndex={0}
      >
        <GModal.Header>
          <GModal.Title>{title}</GModal.Title>
        </GModal.Header>
        <GModal.Body>{children}</GModal.Body>
        <GModal.Footer>{acts.map((act) => act)}</GModal.Footer>
      </div>
    </GModal>
  );
}

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
