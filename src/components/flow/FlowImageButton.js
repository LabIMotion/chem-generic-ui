// refer to the example from https://reactflow.dev/examples/misc/download-image

import React from 'react';
import { Button } from 'react-bootstrap';
import {
  Panel,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from 'reactflow';
import { toPng } from 'html-to-image';

function downloadImage(dataUrl) {
  const link = document.createElement('a');
  link.setAttribute('download', 'workflow.png');
  link.setAttribute('href', dataUrl);
  link.setAttribute('crossorigin', 'anonymous');
  link.click();
}

const imageWidth = 1024;
const imageHeight = 768;

function FlowImageButton() {
  const { getNodes } = useReactFlow();
  const onClick = () => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );
    toPng(document.querySelector('.react-flow__viewport'), {
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    })
      .then(downloadImage)
      .catch(error => console.log('oops, something went wrong!', error));
  };

  return (
    <Panel position="top-right">
      <Button onClick={onClick}>Download Image</Button>
    </Panel>
  );
}

export default FlowImageButton;
