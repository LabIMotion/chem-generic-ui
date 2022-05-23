import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, { ReactFlowProvider, Controls, ConnectionMode } from 'react-flow-renderer';
import LayerNode from './LayerNode';
import { conFlowEls, flowDefault } from '../tools/utils';

const FlowView = (props) => {
  const { properties, properties_release } = props;
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [elements, setElements] = useState([]);
  const onLoad = _reactFlowInstance => {
    setReactFlowInstance(_reactFlowInstance);
  };

  useEffect(() => {
    let flowEls = conFlowEls(props);
    flowEls = flowEls.length > 0 ? flowEls : flowDefault;
    // flowEls = decorateNode(flowEls, properties.layers || {});
    setElements(flowEls);
  }, [properties, properties_release]);

  useEffect(() => {
    let flowEls = conFlowEls(props);
    flowEls = flowEls.length > 0 ? flowEls : flowDefault;
    // flowEls = decorateNode(flowEls, properties.layers || {});
    setElements(flowEls);
  }, []);

  useEffect(() => {
    if (reactFlowInstance && elements.length) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance, elements.length]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        elements={elements}
        onLoad={onLoad}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={{ selectorNode: LayerNode }}
        deleteKeyCode={46}
      >
        <Controls />
      </ReactFlow>
    </ReactFlowProvider>
  );
};

FlowView.propTypes = {
  properties: PropTypes.object.isRequired,
};

export default FlowView;
