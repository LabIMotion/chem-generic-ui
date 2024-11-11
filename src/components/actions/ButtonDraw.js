/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import cloneDeep from 'lodash/cloneDeep';
import Constants from '../tools/Constants';
import WorkflowModal from '../elements/WorkflowModal';
import FlowDesigner from '../flow/FlowDesigner';
import FIcons from '../icons/FIcons';
import { LWf } from '../shared/LCom';
import LTooltip from '../shared/LTooltip';

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
        nodes = nodes.map((node) => {
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
      <LTooltip idf="draw_flow">
        <Button size="sm" variant="primary" onClick={() => setShow(true)}>
          <LWf wf /> {FIcons.faPaintbrush}&nbsp;Workflow (Custom)
        </Button>
      </LTooltip>
      <WorkflowModal genericType={genericType} showProps={{ show, setShow }}>
        <FlowDesigner element={cloneDeep(generic || {})} fnSave={handleSave} />
      </WorkflowModal>
    </>
  );
};

ButtonDraw.propTypes = {
  generic: PropTypes.object,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
  ]).isRequired,
  fnSave: PropTypes.func,
};
ButtonDraw.defaultProps = {
  generic: {},
  fnSave: () => {},
};
export default ButtonDraw;
