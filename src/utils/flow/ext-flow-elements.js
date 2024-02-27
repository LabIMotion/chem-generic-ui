import React from 'react';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import Constants from '../../components/tools/Constants';
import createLayerNodeIcon from '../../components/flow/NodeIcon';

/**
 * extendFlowElements, to add extra nodes and edges
 *
 * @param {Array} nodes nodes of the defined workflow
 * @param {Object} layers layers of the defined template
 * @param {Object} properties properties of the defined template
 */
const extendFlowElements = (nodes, layers, properties) => {
  const defaultNodes = nodes.filter(
    n => n.type === Constants.NODE_TYPES.DEFAULT
  );
  if (defaultNodes.length < 1) return { nodes: [], edges: [] };

  const returnNodes = [];
  const returnEdges = [];
  const { layers: layersProperties } = properties;

  defaultNodes.forEach(node => {
    const { type, data, position, style } = node;
    const associatedLayerKeys = Object.keys(layersProperties).filter(key =>
      key.startsWith(`${data.lKey}.`)
    );
    if (associatedLayerKeys.length < 1) return;
    const associatedLayers = associatedLayerKeys.map(
      key => layersProperties[key]
    );

    associatedLayers.forEach((associatedLayer, index) => {
      const label = createLayerNodeIcon(associatedLayer, true, 'add');
      const lKey = associatedLayer.key;
      const newPosition = {
        x: position.x + (index * 10 - 50),
        y: position.y + (index * 10 + 10 + node.height),
      };
      const newNode = {
        id: lKey,
        type,
        data: { label, layer: associatedLayer, lKey },
        position: newPosition,
        // style: { ...style, backgroundColor: '#8ce6f2' },
      };
      returnNodes.push(newNode);
      returnEdges.push({
        id: `${node.id}-${newNode.id}`,
        source: node.id,
        target: newNode.id,
      });
    });
  });

  return { nodes: returnNodes, edges: returnEdges };
};

export default extendFlowElements;
