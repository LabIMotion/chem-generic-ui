/* eslint-disable react/forbid-prop-types */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import { useDrop } from 'react-dnd';
import { sortBy } from 'lodash';
import DnDNodes from './DnDNodes';
import LayerNode from './LayerNode';
import {
  buildDefaultNode,
  decorateNodes,
  removeReactionLayers,
} from '../../utils/flow/build-flow-elements';

const nodeTypes = { selectorNode: LayerNode };

const getValidLayers = properties =>
  removeReactionLayers(properties?.layers || {});

const Sidebar = ({ properties = {}, nodes = [] }) => {
  if (!properties || Object.keys(properties).length < 1) {
    return null;
  }

  const newLayers = getValidLayers(properties);
  const sortedLayers = sortBy(newLayers, l => l.position) || [];
  const layersInFlow = nodes.map(n => n.data.lKey);
  const layersNotInFlow = sortedLayers.filter(
    l => !layersInFlow.includes(l.key)
  );

  return (
    <aside>
      <div className="description">
        You can drag the nodes listed below to the left pane to design your
        flow.
      </div>
      <div className="description">
        To remove the node from the pane, click on the node and press
        &apos;Del&apos; button.
      </div>
      <DnDNodes nodes={layersNotInFlow} />
    </aside>
  );
};

const FlowDesigner = ({ element, fnSave }) => {
  const { properties } = element;
  const [flow] = useState(properties?.u?.draw || {});
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes] = useState(
    decorateNodes(flow.nodes || [], Object.keys(getValidLayers(properties)))
  );
  const [edges, setEdges] = useState(flow.edges || []);
  const [changed, setChanged] = useState(false);

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const draw = reactFlowInstance.toObject();
      fnSave({ draw });
    }
  }, [reactFlowInstance, fnSave]);

  useEffect(() => {
    if (changed) {
      onSave();
      setChanged(false);
    }
  }, [changed, onSave]);

  const onNodesChange = useCallback(changes => {
    setNodes(nds => applyNodeChanges(changes, nds));
    setChanged(true);
  }, []);

  const onEdgesChange = useCallback(changes => {
    setEdges(eds => applyEdgeChanges(changes, eds));
    setChanged(true);
  }, []);

  const onConnect = useCallback(params => {
    setEdges(eds =>
      addEdge(
        {
          ...params,
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          label: 'next',
        },
        eds
      )
    );
    setChanged(true);
  }, []);

  const addNode = (node, monitor) => {
    if (reactFlowInstance) {
      const clientOffset = monitor.getClientOffset();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      let position = {
        x: clientOffset.x - reactFlowBounds.left,
        y: clientOffset.y - reactFlowBounds.top,
      };
      position = reactFlowInstance.project(position);
      const newNode = buildDefaultNode({ layer: node, position });
      setNodes(nds => nds.concat(newNode));
    }
  };

  const [, drop] = useDrop({
    accept: 'lim-dnd-type',
    drop: (item, monitor) => {
      addNode(item, monitor);
    },
    collect: monitor => {
      return { isOver: monitor.isOver(), canDrop: monitor.canDrop() };
    },
  });

  useEffect(() => {
    const initFlow = properties?.u?.draw || {};
    if (Object.keys(initFlow).length === 0) return;
    setNodes(
      decorateNodes(
        initFlow.nodes || [],
        Object.keys(getValidLayers(properties))
      )
    );
    setEdges(initFlow.edges || []);
  }, [properties]);

  return (
    <div ref={drop} className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={setReactFlowInstance}
            connectionMode={ConnectionMode.Loose}
            nodeTypes={nodeTypes}
            deleteKeyCode={['Delete', 'Backspace']}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
        <Sidebar properties={properties} nodes={nodes} />
      </ReactFlowProvider>
    </div>
  );
};

FlowDesigner.propTypes = {
  element: PropTypes.object.isRequired,
  fnSave: PropTypes.func.isRequired,
};

export default FlowDesigner;
