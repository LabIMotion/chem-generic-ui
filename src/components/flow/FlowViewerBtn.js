/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import FIcons from '../icons/FIcons';

const FlowViewerBtn = props => {
  const { fnClick, generic, label, text } = props;
  const propertiesRelease = generic.properties_release || {};

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
    <OverlayTrigger
      delayShow={500}
      placement="top"
      overlay={<Tooltip id={uuid()}>{text}</Tooltip>}
    >
      <Button
        onClick={() => fnClick(generic, true)}
        bsSize="sm"
        bsStyle="primary"
      >
        {FIcons.faDiagramProject}&nbsp;{label}
      </Button>
    </OverlayTrigger>
  );
};

FlowViewerBtn.propTypes = {
  fnClick: PropTypes.func.isRequired,
  generic: PropTypes.object.isRequired,
  label: PropTypes.string,
  text: PropTypes.string,
};
FlowViewerBtn.defaultProps = {
  label: 'Designed Workflow',
  text: 'click to view defined workflow',
};
export default FlowViewerBtn;
