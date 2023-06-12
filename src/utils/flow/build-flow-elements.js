import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { cloneDeep, findKey } from 'lodash';
import { v4 as uuid } from 'uuid';
import Constants from '../../components/tools/Constants';
import splitFlowElements from './split-flow-elements';

const createCheckElement = () => (
  <div className="chk">
    <FontAwesomeIcon icon={faCheckCircle} />
  </div>
);

const createLayerElement = (layer, checked) => (
  <div className="gu_flow_default_element">
    {checked ? createCheckElement() : null}
    <div className="border_line">
      <b>{layer.label}</b>
    </div>
    <div>({layer.key})</div>
  </div>
);

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
        ? createLayerElement(layer, true)
        : createLayerElement(layer, false);

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

export const buildDefaultNode = props => {
  const { id, layer, position } = props;
  return {
    id: id || uuid(),
    type: Constants.NODE_TYPES.DEFAULT,
    data: {
      lKey: layer.key,
      layer,
      label: createLayerElement(layer, false),
    },
    position: position || { x: 0, y: 0 },
  };
};

/**
 * buildFlowElements, to replace conFlowEls
 *
 * @param {object} props
 * @return {object} Returns a flow object.
 */
export const buildFlowElements = props => {
  const { properties, propertiesRelease } = props;
  const { flow, flowObject, layers } = propertiesRelease;
  const { nodes, edges, viewport } = flowObject
    ? cloneDeep(flowObject)
    : splitFlowElements(flow);
  const updatedNodes = updateDataProperties(nodes, layers, properties);
  return { nodes: updatedNodes, edges, viewport };
};
