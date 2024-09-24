import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'react-bootstrap';

const LayerGridFullWidth = ({ node, data, onClose, onHeightChange }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const measuredHeight = contentRef.current.offsetHeight;
      onHeightChange(measuredHeight);
    }
  }, [data, onHeightChange]);

  return (
    <div ref={contentRef} className="gu-full-width-panel">
      <div className="gu-full-width-center">
        <h3>Detailed Information for {data.name}</h3>
        <p>ID: {data.id}</p>
        <p>Name: {data.name}</p>
        <p>Display Name: {data.label}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        <p>Description: {data.description}</p>
        {/* Add more information as needed */}
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};

export default LayerGridFullWidth;
