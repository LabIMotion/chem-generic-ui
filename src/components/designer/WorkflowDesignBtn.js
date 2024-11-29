/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Constants from '../tools/Constants';
import { LWf } from '../shared/LCom';
import LTooltip from '../shared/LTooltip';
import WorkflowModal from '../elements/WorkflowModal';
import DnDFlow from '../flow/DnDFlow';
import Response from '../../utils/response';
import { notifySuccess } from '../../utils/template/designer-message';

const WorkflowDesignBtn = (props) => {
  const { element, fnSave, genericType, btnCls } = props;
  const [show, setShow] = useState(false);

  if (
    ![
      Constants.GENERIC_TYPES.ELEMENT,
      Constants.GENERIC_TYPES.SEGMENT,
    ].includes(genericType)
  ) {
    return null;
  }

  const handleSaveFlow = (_flowObject) => {
    const flow = _flowObject.flowObject;
    flow['nodes'] = flow['nodes'].map((_node) => {
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
      <LTooltip idf="design_flow">
        <Button
          onClick={() => setShow(true)}
          variant="light"
          size="sm"
          className={btnCls}
        >
          <LWf wf /> Workflow
        </Button>
      </LTooltip>
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
  btnCls: PropTypes.string,
};

WorkflowDesignBtn.defaultProps = {
  btnCls: '',
};

export default WorkflowDesignBtn;
