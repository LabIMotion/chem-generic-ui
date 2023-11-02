/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import DnDFlow from '../flow/DnDFlow';
import Response from '../../utils/response';
import { notifySuccess } from '../../utils/template/designer-message';

const WorkflowModal = props => {
  const { element, fnSaveFlow, showProps } = props;
  const { show, setShow } = showProps;
  if (!show) return null;

  const handleSaveFlow = _flowObject => {
    const flow = _flowObject.flowObject;
    flow['nodes'] = flow['nodes'].map(_node => {
      if (!_node.data) return _node;
      if (_node.type === 'default') delete _node.data.label;
      return _node;
    });
    // const flow = _flowObject.flowObject.map(_flow => {
    //   const { edges, nodes, viewport } = _flow;
    //   _node = nodes.map(_node => {
    //     if (!_node.data) return _node;

    //     delete _node.data.label;
    //     return _node;
    //   });
    //   return { edges, node: _nodes, viewport }
    // });

    element.properties_template.flowObject = flow;
    delete element.properties_template.flow;
    fnSaveFlow(new Response(notifySuccess(), element));
    setShow(false);
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
