import cloneDeep from 'lodash/cloneDeep';
import { MarkerType } from 'reactflow';
import { initialNodes, initialViewport } from '@utils/flow/initial-flow';

/**
 * splitFlowElements, to construct flow into nodes, edges, viewport.
 *
 * @param {object} flow
 * @return {object} Returns a flow object.
 */
const splitFlowElements = flow => {
  const deep = cloneDeep(flow || {});
  const els = deep?.elements || [];

  if (els.length < 1)
    return { nodes: initialNodes, edges: [], viewport: initialViewport };

  const nodes = els.filter(el => !el.source);
  const edges = els
    .filter(el => el.source && el.source !== el.target)
    .map(el => {
      return { ...el, markerEnd: { type: MarkerType.ArrowClosed } };
    });
  const viewport = {
    x: deep?.position[0],
    y: deep?.position[1],
    zoom: deep?.zoom,
  };
  return { nodes, edges, viewport };
};

export default splitFlowElements;
