/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { LWf } from '../shared/LCom';
import LTooltip from '../shared/LTooltip';
import WorkflowModal from '../elements/WorkflowModal';
import FlowView from './FlowView';

const FlowViewerBtn = ({ generic }) => {
  const [show, setShow] = useState(false);
  const properties = generic.properties || {};
  const propertiesRelease = generic.properties_release || {};

  if (generic?.is_new) return null;
  if (Object.keys(propertiesRelease || {}).length < 1) return null;

  const hasFlow =
    (Object.keys(propertiesRelease.flow || {}).length > 0 &&
      propertiesRelease.flow?.elements?.length > 2) ||
    false;
  const hasFlowObject =
    (Object.keys(propertiesRelease.flowObject || {}).length > 0 &&
      propertiesRelease.flowObject?.nodes?.length > 2) ||
    false;

  if (!hasFlow && !hasFlowObject) return null;

  return (
    <>
      <LTooltip idf="fl_view">
        <Button size="sm" variant="primary" onClick={() => setShow(true)}>
          <LWf wf /> Workflow (Predefined)
        </Button>
      </LTooltip>
      <WorkflowModal showProps={{ show, setShow }}>
        <FlowView
          properties={properties}
          propertiesRelease={propertiesRelease}
        />
      </WorkflowModal>
    </>
  );
};

FlowViewerBtn.propTypes = {
  generic: PropTypes.object.isRequired,
};

export default FlowViewerBtn;
