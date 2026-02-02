import cloneDeep from 'lodash/cloneDeep';
import findKey from 'lodash/findKey';
import { v4 as uuid } from 'uuid';
import Constants from '@components/tools/Constants';
import createLayerNodeIcon from '@components/flow/NodeIcon';
import splitFlowElements from '@utils/flow/split-flow-elements';
// import extendFlowElements from '@utils/flow/ext-flow-elements';
import arrangedFlowElements from '@utils/flow/arranged-flow-elements';

export const removeReactionLayers = (_layers) => {
  const layers = cloneDeep(_layers || {});
  return Object.keys(layers).reduce((acc, key) => {
    if (!key.startsWith(Constants.SYS_REACTION)) {
      acc[key] = layers[key];
    }
    return acc;
  }, {});
};

export const removeGroupedLayers = (_layers, metadata) => {
  const layers = cloneDeep(_layers || {});
  const groups = metadata?.groups || [];
  const groupedLayerKeys = groups.flatMap((group) => group.layers || []);

  return Object.keys(layers).reduce((acc, key) => {
    if (!groupedLayerKeys.includes(key)) {
      acc[key] = layers[key];
    }
    return acc;
  }, {});
};

const updateDataProperties = (els, layers, properties) =>
  els.map(d => {
    if (d.type === Constants.NODE_TYPES.DEFAULT && d.data) {
      const { lKey } = d.data;
      const layer = layers[lKey] || {};
      const matchingLayer = findKey(
        properties.layers || {},
        o => o.wf && (o.key === lKey || o.key.startsWith(`${lKey}.`))
      );

      const label = matchingLayer
        ? createLayerNodeIcon(layer, true)
        : createLayerNodeIcon(layer, false);

      d.data = { label, layer, lKey: layer.key };
    }
    if (
      d.type === Constants.NODE_TYPES.INPUT ||
      d.type === Constants.NODE_TYPES.OUTPUT
    ) {
      d.deletable = false;
    }
    return d;
  });

export const buildDefaultNode = (props) => {
  const { id, layer, position } = props;
  return {
    id: id || uuid(),
    type: Constants.NODE_TYPES.DEFAULT,
    data: {
      lKey: layer.key,
      layer,
      label: createLayerNodeIcon(layer, false),
    },
    position: position || { x: 0, y: 0 },
  };
};

export const buildNode = (props) => {
  const { id, layer, position } = props;
  return {
    id: id || uuid(),
    type: Constants.NODE_TYPES.DEFAULT,
    data: {
      lKey: layer.key,
      layer: { label: layer.label, key: layer.key },
      label: createLayerNodeIcon(layer, false),
    },
    position: position || { x: 0, y: 0 },
  };
};

export const decorateNodes = (_nodes, _layers = []) => {
  const isValidLayer = (_layer) => _layers.includes(_layer.key);
  return _nodes.map((_node) =>
    _node.data.layer
      ? {
          ..._node,
          data: {
            label: createLayerNodeIcon(
              _node.data.layer,
              false,
              '',
              isValidLayer(_node.data.layer) ? '' : 'invalid'
            ),
            layer: _node.data.layer,
            lKey: _node.data.layer.key,
          },
          style: {
            border: isValidLayer(_node.data.layer)
              ? '1px solid #000'
              : '1px solid lightcoral',
            color: isValidLayer(_node.data.layer) ? '#000' : 'lightcoral',
          },
        }
      : _node
  );
};

/**
 * buildFlowElements
 *
 * @param {Object} props
 * @return {Object} Returns a flow object.
 */
export const buildFlowElements = (props) => {
  const { properties, propertiesRelease, flowType = 'default' } = props;
  const { flow, flowObject, layers } = propertiesRelease;
  const { nodes, edges, viewport } = flowObject
    ? cloneDeep(flowObject)
    : splitFlowElements(flow);

  if (flowType !== 'default') {
    // if properties is an empty object, use propertiesRelease
    const flowProperties =
      Object.keys(properties).length === 0 ? propertiesRelease : properties;
    const arrangedElements = arrangedFlowElements(nodes, flowProperties);
    return {
      nodes: arrangedElements.nodes,
      edges: arrangedElements.edges,
      viewport: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    };
  }

  // NOTE: disable extendFlowElements part for now
  // const extendElements = extendFlowElements(nodes, layers, properties);
  const updatedNodes = updateDataProperties(nodes, layers, properties);
  // updatedNodes.push(...extendElements.nodes);
  // edges.push(...extendElements.edges);
  return { nodes: updatedNodes, edges, viewport };
};
