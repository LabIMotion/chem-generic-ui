/* eslint-disable no-alert */
/* eslint-disable no-param-reassign */
/* eslint-disable react/forbid-prop-types */
import React, {
  useState, useRef, useCallback, useEffect
} from 'react';
import PropTypes from 'prop-types';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  removeElements,
  Controls,
  ConnectionMode,
} from 'react-flow-renderer';
import { Button } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import DnDSidebar from './DnDSidebar';
import LayerNode from './LayerNode';
import { conFlowEls, storeFlow, flowDefault } from '../tools/utils';

const DnDFlow = (props) => {
  const { element, fnSave } = props;
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState();
  const [elements, setElements] = useState([]);
  const onConnect = params => setElements(els => addEdge({
    ...params, animated: true, arrowHeadType: 'arrowclosed', label: 'next'
  }, els));
  const onElementsRemove = (elementsToRemove) => {
    const rms = elementsToRemove.filter(e => ['input', 'output'].includes(e.type));
    if (rms.length > 0) {
      alert(`[${rms[0].data.label}] can not be removed.`);
    } else {
      setElements(els => removeElements(elementsToRemove, els));
    }
  };

  const onLoad = (_reactFlowInstance) => {
    setReactFlowInstance(_reactFlowInstance);
  };

  const onDragOver = (ev) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (ev) => {
    ev.preventDefault();
    if (reactFlowInstance) {
      const node = ev.dataTransfer.getData('application/generic');
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: ev.clientX - reactFlowBounds.left,
        y: ev.clientY - reactFlowBounds.top,
      });
      const layer = element.properties_template.layers[node];
      const ll = (
        <div>
          <div className="gu_flow_dnd_sidebar"><b>{layer.label}</b></div>
          <div>
            (
            {layer.key}
            )
          </div>
        </div>
      );
      const newNode = {
        id: uuid(), type: 'default', position, data: { label: ll, lKey: layer.key }
      };
      setElements(es => es.concat(newNode));
    }
  };

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flowObject = reactFlowInstance.toObject();
      flowObject.elements = storeFlow(flowObject);
      fnSave({ flowObject });
    }
  }, [reactFlowInstance]);

  useEffect(() => {
    let flowEls = conFlowEls({ properties: {}, properties_release: element.properties_template });
    flowEls = flowEls.length > 0 ? flowEls : flowDefault;
    setElements(flowEls);
  }, [element.id]);

  useEffect(() => {
    if (reactFlowInstance && elements.length) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance, element.id]);

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ width: '100%' }}>
          <ReactFlow
            elements={elements}
            onConnect={onConnect}
            onElementsRemove={onElementsRemove}
            onLoad={onLoad}
            connectionMode={ConnectionMode.Loose}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={{ selectorNode: LayerNode }}
            deleteKeyCode={46}
          >
            <div className="save__controls">
              <Button bsSize="xs" onClick={onSave}>
                Save to draft&nbsp;
                <i className="fa fa-floppy-o" aria-hidden="true" />
              </Button>
            </div>
            <Controls />
          </ReactFlow>
        </div>
        <DnDSidebar element={element} />
      </ReactFlowProvider>
    </div>
  );
};

DnDFlow.propTypes = {
  element: PropTypes.object.isRequired,
  fnSave: PropTypes.func.isRequired
};

export default DnDFlow;
