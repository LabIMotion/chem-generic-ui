/* eslint-disable react/forbid-prop-types */
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, {
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import LayerNode from '@components/flow/LayerNode';
import { buildFlowElements } from '@utils/flow/build-flow-elements';

const nodeTypes = { selectorNode: LayerNode };

const FlowView = ({ properties, propertiesRelease }) => {
  const reactFlowWrapper = useRef(null);
  const [, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState(() =>
    buildFlowElements({ properties, propertiesRelease })
  );
  const [nodes, , onNodesChange] = useNodesState(elements.nodes);
  const [edges, , onEdgesChange] = useEdgesState(elements.edges || []);

  useEffect(() => {
    setElements(buildFlowElements({ properties, propertiesRelease }));
  }, [properties, propertiesRelease]);

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges || []}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
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
  propertiesRelease: PropTypes.object.isRequired,
};
export default FlowView;
