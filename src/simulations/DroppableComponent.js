import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
} from 'reactflow';
import { useDrop } from 'react-dnd';
import DraggableSideBar from './DraggableSideBar';
import { buildDefaultNode } from '../utils/flow/build-flow-elements';
import { flowInputNode } from '../utils/flow/initial-flow';

let id = 0;
const getId = () => `dndnode_${id++}`;

const DroppableComponent = props => {
  const { element, fnSave } = props;
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([flowInputNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const addNode = (node, clientOffset) => {
    if (reactFlowInstance) {
      // const vp = reactFlowInstance.getViewport();
      // console.log('getViewport', reactFlowInstance.getViewport());
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      // console.log('clientOffset', clientOffset);
      // console.log('reactFlowBounds', reactFlowBounds);
      // const newNode = defaultNode(node, {
      //   x: position.x - vp.x,
      //   y: position.y - vp.y,
      // });
      // const newNode = defaultNode(node, {
      //   x: clientOffset.x - reactFlowBounds.left + 30,
      //   y: clientOffset.y - reactFlowBounds.top - 230,
      // });
      const newNode = buildDefaultNode({
        layer: node,
        position: {
          x: clientOffset.x - reactFlowBounds.left + 30,
          y: clientOffset.y - reactFlowBounds.top - 230,
        },
      });
      // const newNode = defaultNode(node, position);
      setNodes(nds => nds.concat(newNode));
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'dnd-type',
    drop: (item, monitor) => {
      console.log('item', item);
      // console.log('monitor', monitor);
      // console.log('monitor.getDropResult()', monitor.getClientOffset());
      addNode(item, monitor.getClientOffset());
    },
    collect: monitor => {
      return { isOver: monitor.isOver(), canDrop: monitor.canDrop() };
    },
  });

  const onConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    []
  );
  console.log('nodes', nodes);
  return (
    <div ref={drop} className="dndflow" style={{ height: 800 }}>
      <ReactFlowProvider>
        {/* <DraggableComponent element={el} /> */}
        <div
          className="reactflow-wrapper"
          ref={reactFlowWrapper}
          style={{ borderColor: 'red', borderWidth: '2', borderStyle: 'solid' }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            // onDrop={handleDrop}
            // onDragOver={handleDragOver}
            fitView
          >
            <Controls />
          </ReactFlow>
        </div>
        <DraggableSideBar element={element} />
      </ReactFlowProvider>
    </div>
  );
};

export default DroppableComponent;
