import React from 'react';
import { useDrag } from 'react-dnd';
import PropTypes from 'prop-types';

function DnDNode(props) {
  const { node } = props;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'lim-dnd-type',
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    item: node,
  }));

  return (
    <div
      key={node.key}
      className="react-flow__node-default"
      ref={drag}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div className="gu_flow_dnd_sidebar">
        <b>{node.label}</b>
      </div>
      <div>({node.key})</div>
    </div>
  );
}

DnDNode.propTypes = { node: PropTypes.object.isRequired };

function DnDNodes(props) {
  const { nodes } = props;

  return (
    <>
      {nodes.map((node) => (
        <DnDNode key={node.key} id={node.id} node={node} />
      ))}
    </>
  );
}

DnDNodes.propTypes = { nodes: PropTypes.array.isRequired };

export default DnDNodes;
