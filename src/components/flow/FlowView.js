/* eslint-disable react/forbid-prop-types */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, {
  Controls,
  // ConnectionMode,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from 'reactflow';
// import ExampleFlow from './ExampleFlow';
import LayerNode from './LayerNode';
import { buildFlowElements } from '../../utils/flow/build-flow-elements';

const nodeTypes = {
  selectorNode: LayerNode,
};

const FlowView = props => {
  const { properties, propertiesRelease } = props;
  const reactFlowWrapper = useRef(null);
  const [, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState(() => buildFlowElements(props));
  const [nodes, , onNodesChange] = useNodesState(elements.nodes);
  const [edges, , onEdgesChange] = useEdgesState(elements.edges || []);

  useEffect(() => {
    setElements(buildFlowElements(props));
  }, [properties, propertiesRelease]);

  return (
    // <ExampleFlow flow={elements} propertiesTemplate={propertiesRelease} />
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            // connectionMode={ConnectionMode.Loose}
            edges={edges || []}
            fitView
            // nodeTypes={nodeTypes}
            nodes={nodes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setReactFlowInstance}
          >
            <Controls />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

FlowView.propTypes = {
  properties: PropTypes.object.isRequired,
};

export default FlowView;
