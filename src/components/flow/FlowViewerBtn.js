/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ButtonTooltip from '../fields/ButtonTooltip';

const FlowViewerBtn = (props) => {
  const { fnClick, generic, label } = props;
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
    <ButtonTooltip
      idf="fl_view"
      fnClick={() => fnClick(generic, true)}
      fa="faDiagramProject"
      txt={label || 'Designed Workflow'}
      bs="primary"
    />
  );
};

FlowViewerBtn.propTypes = {
  fnClick: PropTypes.func.isRequired,
  generic: PropTypes.object.isRequired,
  label: PropTypes.string,
};
FlowViewerBtn.defaultProps = { label: 'Designed Workflow' };
export default FlowViewerBtn;
