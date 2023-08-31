/* eslint-disable react/forbid-prop-types */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  ConnectionMode,
  MarkerType,
} from 'reactflow';
import { Button } from 'react-bootstrap';
import { useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons';

import DnDSidebar from './DnDSidebar';
import LayerNode from './LayerNode';
import {
  buildDefaultNode,
  buildFlowElements,
} from '../../utils/flow/build-flow-elements';

const nodeTypes = { selectorNode: LayerNode };

const DnDFlow = props => {
  const { element, fnSave } = props;
  const propertiesTemplate = element.properties_template;
  const reactFlowWrapper = useRef(null);
  const [elements, setElements] = useState(() =>
    buildFlowElements({
      properties: propertiesTemplate,
      propertiesRelease: propertiesTemplate,
    })
  );
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(elements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(elements.edges);

  const onConnect = useCallback(
    params =>
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
      ),
    []
  );

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flowObject = reactFlowInstance.toObject();
      // flowObject.elements = storeFlow(flowObject);
      fnSave({ flowObject });
    }
  }, [reactFlowInstance]);

  const addNode = (node, monitor) => {
    if (reactFlowInstance) {
      const clientOffset = monitor.getClientOffset();
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      let position = {
        x: clientOffset.x - reactFlowBounds.left,
        y: clientOffset.y - reactFlowBounds.top,
      };
      position = reactFlowInstance.project(position);
      const newNode = buildDefaultNode({
        layer: node,
        position,
        // position: {
        //   // x: clientOffset.x - reactFlowBounds.left + 30,
        //   // y: clientOffset.y - reactFlowBounds.top - 230,
        // },
      });
      setNodes(nds => nds.concat(newNode));
    }
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'lim-dnd-type',
    drop: (item, monitor) => {
      addNode(item, monitor);
      // if (reactFlowInstance) {
      //   const clientOffset = monitor.getClientOffset();
      //   const reactFlowBounds =
      //     reactFlowWrapper.current.getBoundingClientRect();
      //   const sidebarBounds = reactSidebar.current.getBoundingClientRect();
      //   let position = {
      //     x: clientOffset.x - reactFlowBounds.left, // - sidebarBounds.left,
      //     y: clientOffset.y - reactFlowBounds.top, // - sidebarBounds.top,
      //   };
      //   position = reactFlowInstance.project(position);
      //   const newNode = buildDefaultNode({
      //     layer: item,
      //     position,
      //     // position: {
      //     //   x: -32, // 0, // clientOffset.x, // - reactFlowBounds.left - sidebarBounds.left,
      //     //   y: -79, // 0, // clientOffset.y, // - reactFlowBounds.top - sidebarBounds.top,
      //     //   // x: clientOffset.x - reactFlowBounds.left + 30,
      //     //   // y: clientOffset.y - reactFlowBounds.top - 230,
      //     // },
      //   });
      //   setNodes(nds => nds.concat(newNode));
      // }
    },
    collect: monitor => {
      return { isOver: monitor.isOver(), canDrop: monitor.canDrop() };
    },
  });

  useEffect(() => {
    setElements(
      buildFlowElements({
        properties: propertiesTemplate,
        propertiesRelease: propertiesTemplate,
      })
    );
  }, [propertiesTemplate]);

  return (
    <>
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
              <div className="save__controls">
                <Button bsSize="xs" onClick={onSave}>
                  Save to draft&nbsp;
                  <FontAwesomeIcon icon={faFloppyDisk} />
                </Button>
              </div>
              <Controls />
            </ReactFlow>
          </div>
          <DnDSidebar element={element} />
        </ReactFlowProvider>
      </div>
      {/* <DnDSidebar element={element} /> */}
    </>
  );
};

DnDFlow.propTypes = {
  element: PropTypes.object.isRequired,
  fnSave: PropTypes.func.isRequired,
};

export default DnDFlow;
