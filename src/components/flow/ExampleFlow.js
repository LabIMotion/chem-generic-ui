/* eslint-disable react/forbid-prop-types */
import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
} from 'reactflow';
import { flowInputNode } from '../../utils/flow/initial-flow';

let id = 0;
const getId = () => `dndnode_${id++}`;

const ExampleFlow = props => {
  const { flow, propertiesTemplate } = props;

  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    flow.nodes || [flowInputNode]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(flow.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(params => {
    setEdges(eds => addEdge(params, eds));
  }, []);

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            // onDrop={onDrop}
            // onDragOver={onDragOver}
            fitView
            deleteKeyCode={46}
          >
            <Controls />
          </ReactFlow>
        </div>
        {/* <Sidebar /> */}
      </ReactFlowProvider>
    </div>
  );
};

ExampleFlow.propTypes = { flow: PropTypes.object.isRequired };

export default ExampleFlow;
