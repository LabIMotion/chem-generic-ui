// plan to replace flowDefault
export const flowInputNode = {
  id: '1',
  type: 'input',
  data: { label: 'Start' },
  position: { x: 250, y: 15 },
};

export const flowOutputNode = {
  id: '2',
  type: 'output',
  data: { label: 'End' },
  position: { x: 250, y: 255 },
};

export const initialNodes = [flowInputNode, flowOutputNode];

export const initialViewport = {
  x: 0,
  y: 0,
  zoom: 1,
};
