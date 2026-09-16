import React from 'react';
import PropTypes from 'prop-types';
import RepoGridDs from '@components/repo/RepoGridDs';
import RepoGridSg from '@components/repo/RepoGridSg';
import RepoGridEl from '@components/repo/RepoGridEl';
import GModal from '@ui/modals/GModal';

const contentComponents = {
  Dataset: RepoGridDs,
  Segment: RepoGridSg,
  Element: RepoGridEl,
};

function RepoNewModal({ showModal, fnClose, fnCreate, content }) {
  const ContentComponent = contentComponents[content];
  if (!ContentComponent) return null;

  const title = `Generic ${content} Templates`;

  return (
    <GModal
      backdrop="static"
      size="lg"
      show={showModal}
      onHide={fnClose}
      dialogClassName="gu_modal-68w"
    >
      <GModal.Header>
        <GModal.Title>{title}</GModal.Title>
      </GModal.Header>
      <GModal.Body style={{ overflow: 'auto' }}>
        <ContentComponent fnApi={fnCreate} />
      </GModal.Body>
    </GModal>
  );
}

RepoNewModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnCreate: PropTypes.func.isRequired,
};

export default RepoNewModal;
