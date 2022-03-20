/* eslint-disable react/prop-types */
import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

const targetHandleStyle = { background: '#555' };
const sourceHandleStyleA = { ...targetHandleStyle, top: 10 };
const onConnect = params => console.log('handle onConnect', params);

const LayerNode = ({ data }) =>
  (
    <>
      <Handle type="target" position={Position.Top} style={targetHandleStyle} onConnect={onConnect} />
      <div>
        <div style={{ borderWidth: '0px 0px 1px 0px', borderColor: 'black', borderStyle: 'solid' }}><b>{data.layer.label}</b></div>
        <div>({data.layer.key})</div>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" style={sourceHandleStyleA} />
    </>
  );

export default memo(LayerNode);
