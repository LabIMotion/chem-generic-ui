import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import RepoGridDs from '@components/repo/RepoGridDs';
import RepoGridSg from '@components/repo/RepoGridSg';
import RepoGridEl from '@components/repo/RepoGridEl';

const contentComponents = {
  Dataset: RepoGridDs,
  Segment: RepoGridSg,
  Element: RepoGridEl,
};

const RepoNewModal = ({ showModal, fnClose, fnCreate, content }) => {
  const ContentComponent = contentComponents[content];
  if (!ContentComponent) return null;

  const title = `Generic ${content} Templates`;

  return (
    <Modal
      centered
      backdrop="static"
      size="lg"
      show={showModal}
      onHide={fnClose}
      dialogClassName="gu_modal-68w"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'auto' }}>
        <ContentComponent fnApi={fnCreate} />
      </Modal.Body>
    </Modal>
  );
};

RepoNewModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnCreate: PropTypes.func.isRequired,
};

export default RepoNewModal;
