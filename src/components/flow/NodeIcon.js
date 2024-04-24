/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import FIcons from '../icons/FIcons';

const NodeIcon = ({ nodeClass, nodeIcon }) => (
  <div className={nodeClass}>{nodeIcon}</div>
);

NodeIcon.propTypes = {
  nodeClass: PropTypes.string.isRequired,
  nodeIcon: PropTypes.object.isRequired,
};

const createLayerNodeIcon = (
  layer,
  checked,
  nodeClass = 'chk',
  extCSS = ''
) => {
  const nodeIcon =
    nodeClass === 'chk' ? FIcons.faCircleCheck : FIcons.faCirclePlus;
  const klz = `border_line ${extCSS}`;
  return (
    <div className="gu_flow_default_element">
      {checked ? <NodeIcon nodeClass={nodeClass} nodeIcon={nodeIcon} /> : null}
      <div className={klz}>
        <b>{layer.label}</b>
      </div>
      <div>({layer.key})</div>
    </div>
  );
};

export default createLayerNodeIcon;
