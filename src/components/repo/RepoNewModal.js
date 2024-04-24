import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import RepoGridDs from './RepoGridDs';
import RepoGridSg from './RepoGridSg';
import RepoGridEl from './RepoGridEl';

const contentComponents = {
  Dataset: RepoGridDs,
  Segment: RepoGridSg,
  Element: RepoGridEl,
};

const RepoNewModal = ({ showModal, fnClose, gridData, fnCreate, content }) => {
  const ContentComponent = contentComponents[content];
  if (!ContentComponent) return null;

  const title = `Generic ${content} Templates`;

  return (
    <Modal
      backdrop="static"
      bsSize="lg"
      show={showModal}
      onHide={() => fnClose()}
      dialogClassName="gu_modal-68w"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'auto' }}>
        <ContentComponent fnApi={fnCreate} gridData={gridData} />
      </Modal.Body>
    </Modal>
  );
};

RepoNewModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
  gridData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  fnClose: PropTypes.func.isRequired,
  fnCreate: PropTypes.func.isRequired,
};

export default RepoNewModal;
