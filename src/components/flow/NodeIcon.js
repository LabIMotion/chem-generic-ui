/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const NodeIcon = ({ nodeClass, nodeIcon }) => (
  <div className={nodeClass}>
    <FontAwesomeIcon icon={nodeIcon} />
  </div>
);

NodeIcon.propTypes = {
  nodeClass: PropTypes.string.isRequired,
  nodeIcon: PropTypes.object.isRequired,
};

const createLayerNodeIcon = (layer, checked, nodeClass = 'chk') => {
  const nodeIcon = nodeClass === 'chk' ? faCircleCheck : faCirclePlus;
  return (
    <div className="gu_flow_default_element">
      {checked ? <NodeIcon nodeClass={nodeClass} nodeIcon={nodeIcon} /> : null}
      <div className="border_line">
        <b>{layer.label}</b>
      </div>
      <div>({layer.key})</div>
    </div>
  );
};

export default createLayerNodeIcon;
