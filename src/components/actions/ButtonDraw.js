/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { cloneDeep } from 'lodash';
import Constants from '../tools/Constants';
import WorkflowModal from '../elements/WorkflowModal';
import FlowDesigner from '../flow/FlowDesigner';
import FIcons from '../icons/FIcons';

const BTN_FLOW_TIP = (
  <Tooltip id="_cgu_tooltip_workflow">Draw a workflow</Tooltip>
);

const ButtonDraw = ({ generic = {}, genericType, fnSave = () => {} }) => {
  const [show, setShow] = useState(false);
  if (generic?.is_new) return null;
  if (
    Object.keys(generic.properties).length === 0 ||
    genericType !== Constants.GENERIC_TYPES.ELEMENT
  )
    return null;

  const handleSave = ({ draw }) => {
    const updates = cloneDeep(generic || {});
    let { nodes } = draw;
    const drawCopy = { ...draw };
    if (updates.properties) {
      if (nodes.length === 0) {
        delete updates.properties.u;
      } else {
        nodes = nodes.map(node => {
          if (node.type === Constants.NODE_TYPES.DEFAULT) {
            const { label, ...restData } = node.data;
            return { ...node, data: restData };
          }
          return node;
        });
        drawCopy.nodes = nodes;
        Object.assign(updates.properties, { u: { draw: drawCopy } });
      }
      updates.changed = true;
      fnSave(updates);
    }
  };

  return (
    <>
      <OverlayTrigger placement="top" overlay={BTN_FLOW_TIP}>
        <Button bsSize="sm" bsStyle="primary" onClick={() => setShow(true)}>
          {FIcons.faPencil} Draw Flow
        </Button>
      </OverlayTrigger>
      <WorkflowModal genericType={genericType} showProps={{ show, setShow }}>
        <FlowDesigner element={cloneDeep(generic || {})} fnSave={handleSave} />
      </WorkflowModal>
    </>
  );
};

ButtonDraw.propTypes = {
  generic: PropTypes.object,
  genericType: PropTypes.oneOf([Constants.GENERIC_TYPES.ELEMENT]).isRequired,
  fnSave: PropTypes.func,
};
ButtonDraw.defaultProps = {
  generic: {},
  fnSave: () => {},
};
export default ButtonDraw;
