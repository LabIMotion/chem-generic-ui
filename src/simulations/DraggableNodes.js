/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { useDrag } from 'react-dnd';
import PropTypes from 'prop-types';

const DraggableNode = props => {
  const { node } = props;

  const [{ isDragging }, drag] = useDrag(() => {
    return {
      type: 'dnd-type',
      item: node,
      collect: monitor => {
        return {
          isDragging: monitor.isDragging(),
        };
      },
    };
  });

  return (
    <div key={node.key} className="react-flow__node-default dndnode" ref={drag}>
      <div className="gu_flow_dnd_sidebar">
        <b>{node.label}</b>
      </div>
      <div>({node.key})</div>
    </div>
  );
};

DraggableNode.propTypes = { node: PropTypes.object.isRequired };

const DraggableNodes = props => {
  const { nodes } = props;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {(nodes?.filter(e => e.wf) || []).map(node => (
        <DraggableNode key={node.key} id={node.id} node={node} />
      ))}
    </div>
  );
};

DraggableNodes.propTypes = { nodes: PropTypes.array.isRequired };

export default DraggableNodes;
