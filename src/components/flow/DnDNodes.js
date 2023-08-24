/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { useDrag } from 'react-dnd';
import PropTypes from 'prop-types';

const DnDNode = props => {
  const { node } = props;

  const [{ isDragging }, drag] = useDrag(() => {
    return {
      type: 'lim-dnd-type',
      collect: monitor => {
        return { isDragging: monitor.isDragging() };
      },
      item: node,
    };
  });

  return (
    <div key={node.key} className="react-flow__node-default" ref={drag}>
      <div className="gu_flow_dnd_sidebar">
        <b>{node.label}</b>
      </div>
      <div>({node.key})</div>
    </div>
  );
};

DnDNode.propTypes = { node: PropTypes.object.isRequired };

const DnDNodes = props => {
  const { nodes } = props;

  return (
    <>
      {(nodes?.filter(e => e.wf) || []).map(node => (
        <DnDNode key={node.key} id={node.id} node={node} />
      ))}
    </>
  );
};

DnDNodes.propTypes = { nodes: PropTypes.array.isRequired };

export default DnDNodes;
