/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Constants from '../tools/Constants';
import FIcons from '../icons/FIcons';
import WorkflowModal from '../elements/WorkflowModal';
import DnDFlow from '../flow/DnDFlow';
import Response from '../../utils/response';
import { notifySuccess } from '../../utils/template/designer-message';

const WorkflowDesignBtn = props => {
  const { element, fnSave, genericType } = props;
  const [show, setShow] = useState(false);

  if (genericType !== Constants.GENERIC_TYPES.ELEMENT) return null;

  const handleSaveFlow = _flowObject => {
    const flow = _flowObject.flowObject;
    flow['nodes'] = flow['nodes'].map(_node => {
      if (!_node.data) return _node;
      if (_node.type === 'default') delete _node.data.label;
      return _node;
    });

    element.properties_template.flowObject = flow;
    delete element.properties_template.flow;
    fnSave(new Response(notifySuccess(), element));
    setShow(false);
  };

  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id="_tooltip_template_upload">Design workflow</Tooltip>
        }
      >
        <Button bsSize="sm" onClick={() => setShow(true)}>
          {FIcons.faDiagramProject}&nbsp;Workflow
        </Button>
      </OverlayTrigger>
      <WorkflowModal genericType={genericType} showProps={{ show, setShow }}>
        <DnDFlow element={element} fnSave={handleSaveFlow} />
      </WorkflowModal>
    </>
  );
};

WorkflowDesignBtn.propTypes = {
  element: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnSave: PropTypes.func.isRequired,
};

export default WorkflowDesignBtn;
