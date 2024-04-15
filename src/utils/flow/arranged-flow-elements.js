import React from 'react';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { sortBy } from 'lodash';
import Constants from '../../components/tools/Constants';
import createLayerNodeIcon from '../../components/flow/NodeIcon';
import { flowInputNode, flowOutputNode } from './initial-flow';

/**
 * arrangedFlowElements, to add extra nodes and edges
 *
 * @param {Array} nodes nodes of the pre-defined workflow
 * @param {Object} properties properties of the template
 */
const arrangedFlowElements = (nodes, properties) => {
  const defaultNodes = nodes.filter(
    n => n.type === Constants.NODE_TYPES.DEFAULT
  );
  if (defaultNodes.length < 1) return { nodes: [], edges: [] };

  const returnNodes = [];
  const returnEdges = [];
  const { layers: layersProperties } = properties;
  const sortedLayers =
    sortBy(layersProperties, ['position', 'wf_position']) || [];

  // loop through the sortedLayers, for each layer, check if the layer's is associated with a node.data.lKey of defaultNodes
  sortedLayers.forEach(layer => {
    let associatedNode = defaultNodes.find(n => layer.key === n.data.lKey);
    let label = createLayerNodeIcon(layer, true);
    if (!associatedNode) {
      associatedNode = defaultNodes.find(n =>
        layer.key.startsWith(`${n.data.lKey}.`)
      );
      if (!associatedNode) return;
      label = createLayerNodeIcon(layer, true, 'add');
    }

    const lKey = layer.key;
    const newNode = {
      id: lKey,
      type: Constants.NODE_TYPES.DEFAULT,
      data: { label, layer, lKey },
      width: associatedNode.width,
      height: associatedNode.height,
    };
    returnNodes.push(newNode);
  });

  // add flowInputNode into returnNodes and make it as the first record, then, add flowOutputNode into returnNodes and make it as the last record
  returnNodes.unshift(flowInputNode);
  returnNodes.push(flowOutputNode);

  // loop through the returnNodes and update each node's position, the position.x is same as the previous node, the position.y is the previous node's position.y + 10 + the previous node's height
  const updatedNodes = [];
  returnNodes.forEach((node, index) => {
    if (index === 0) {
      updatedNodes.push(node);
    } else {
      const baseNode = updatedNodes[index - 1];
      const newPosition = {
        x: baseNode.position.x,
        y: baseNode.position.y + (index * 10 + 10 + node.height),
      };
      updatedNodes.push({ ...node, position: newPosition });
    }
  });

  // loop through the updatedNodes, for each node, create an edge between the node and the previous node and add it to returnEdges
  updatedNodes.forEach((node, index) => {
    if (index === 0) return;
    const baseNode = updatedNodes[index - 1];
    returnEdges.push({
      id: `${baseNode.id}-${node.id}`,
      source: baseNode.id,
      target: node.id,
      animated: true,
    });
  });

  return { nodes: updatedNodes, edges: returnEdges };
};

export default arrangedFlowElements;
