/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import Workflow from '../flow/Workflow';

const WorkflowModal = (props) => {
  const {
    show, element, fnClose, fnSaveFlow
  } = props;
  if (!show) return null;
  return (
    <Modal show={show} bsSize="small" onHide={fnClose} dialogClassName="importChemDrawModal">
      <Modal.Header closeButton><Modal.Title>Design Workflow</Modal.Title></Modal.Header>
      <Modal.Body>
        <div className="generic_wf_modal">
          <Workflow element={element} fnSaveFlow={fnSaveFlow} />
        </div>
      </Modal.Body>
    </Modal>
  );
};

WorkflowModal.propTypes = {
  show: PropTypes.bool.isRequired,
  element: PropTypes.object.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnSaveFlow: PropTypes.func.isRequired
};

export default WorkflowModal;
