import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import RepoGridDs from './RepoGridDs';
import RepoGridSg from './RepoGridSg';
import RepoGridEl from './RepoGridEl';
import GridTheme from './GridTheme';

const RepoNewModal = props => {
  const { showModal, fnClose, gridData, fnCreate, content } = props;
  const handleCreate = _e => {
    fnCreate(_e);
  };

  switch (content) {
    case 'Dataset':
      return (
        <Modal backdrop="static" show={showModal} onHide={() => fnClose()}>
          <Modal.Header closeButton>
            <Modal.Title>
              Fetch from LabIMotion Hub (Generic Dataset)
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ overflow: 'auto' }}>
            <RepoGridDs
              fnApi={handleCreate}
              gridData={gridData}
              pageSize={GridTheme['ag-theme-balham'].pageSize}
              theme="ag-theme-balham"
            />
          </Modal.Body>
        </Modal>
      );
    case 'Segment':
      return (
        <Modal backdrop="static" show={showModal} onHide={() => fnClose()}>
          <Modal.Header closeButton>
            <Modal.Title>
              Fetch from LabIMotion Hub (Generic Segment)
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ overflow: 'auto' }}>
            <RepoGridSg
              fnApi={handleCreate}
              gridData={gridData}
              pageSize={GridTheme['ag-theme-balham'].pageSize}
              theme="ag-theme-balham"
            />
          </Modal.Body>
        </Modal>
      );
    case 'Element':
      return (
        <Modal backdrop="static" show={showModal} onHide={() => fnClose()}>
          <Modal.Header closeButton>
            <Modal.Title>
              Fetch from LabIMotion Hub (Generic Element)
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ overflow: 'auto' }}>
            <RepoGridEl
              fnApi={handleCreate}
              gridData={gridData}
              pageSize={GridTheme['ag-theme-balham'].pageSize}
              theme="ag-theme-balham"
            />
          </Modal.Body>
        </Modal>
      );
    default:
      break;
  }
};

RepoNewModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
  gridData: PropTypes.array.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnCreate: PropTypes.func.isRequired,
};

export default RepoNewModal;
