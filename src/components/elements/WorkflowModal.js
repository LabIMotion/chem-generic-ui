/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import DnDFlow from '../flow/DnDFlow';

const WorkflowModal = props => {
  const { element, fnSaveFlow, showProps } = props;
  const { show, setShow } = showProps;
  console.log('WorkflowModal: element=', element);
  if (!show) return null;

  const handleSaveFlow = _flowObject => {
    fnSaveFlow(element, _flowObject);
  };

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      dialogClassName="gu-full-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Design Workflow</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DnDFlow element={element} fnSave={handleSaveFlow} />
      </Modal.Body>
    </Modal>
  );
};

WorkflowModal.propTypes = {
  element: PropTypes.object.isRequired,
  fnSaveFlow: PropTypes.func.isRequired,
  showProps: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    setShow: PropTypes.func.isRequired,
  }).isRequired,
};

export default WorkflowModal;
