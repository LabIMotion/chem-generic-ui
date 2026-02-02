/* eslint-disable react/forbid-prop-types */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import FIcons from '@components/icons/FIcons';

const ResizeIndicator = ({ position, fontSize = '10px' }) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          top: '20px',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      case 'center':
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
      case 'bottom':
        return {
          bottom: '20px',
          left: '50%',
          transform: 'translate(-50%, 50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        color: '#6c757d',
        backgroundColor: 'rgba(108, 117, 125, 0.1)',
        opacity: 0.8,
        fontSize,
        height: '24px',
        width: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '2px',
        ...getPositionStyles(),
      }}
    >
      {FIcons.faGripLinesVertical}
    </div>
  );
};

ResizeIndicator.propTypes = {
  position: PropTypes.oneOf(['top', 'center', 'bottom']).isRequired,
  fontSize: PropTypes.string,
};

const ResizablePanel = ({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 66.67,
  minLeftWidth = 50,
  minRightWidth = 20,
  className = '',
  style = {},
  minHeightForMultipleIndicators = 200,
}) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [showMultipleIndicators, setShowMultipleIndicators] = useState(false);
  const containerRef = useRef(null);
  const resizeHandleRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;

      let newLeftWidth = (mouseX / containerWidth) * 100;

      newLeftWidth = Math.max(minLeftWidth, newLeftWidth);
      newLeftWidth = Math.min(100 - minRightWidth, newLeftWidth);

      setLeftWidth(newLeftWidth);
    },
    [isDragging, minLeftWidth, minRightWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const checkIndicatorVisibility = useCallback(() => {
    if (resizeHandleRef.current) {
      const handleHeight = resizeHandleRef.current.offsetHeight;
      setShowMultipleIndicators(handleHeight >= minHeightForMultipleIndicators);
    }
  }, [minHeightForMultipleIndicators]);

  useEffect(() => {
    checkIndicatorVisibility();

    const resizeObserver = new ResizeObserver(() => {
      checkIndicatorVisibility();
    });

    if (resizeHandleRef.current) {
      resizeObserver.observe(resizeHandleRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkIndicatorVisibility]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const rightWidth = 100 - leftWidth;

  return (
    <div
      ref={containerRef}
      className={`d-flex ${className}`}
      style={{
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Left Panel */}
      <div
        style={{
          width: `${leftWidth}%`,
          overflow: 'hidden',
          paddingRight: '4px',
        }}
      >
        {leftPanel}
      </div>
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        onMouseDown={handleMouseDown}
        style={{
          width: '8px',
          backgroundColor: isDragging ? '#6c757d' : '#dee2e6',
          cursor: 'col-resize',
          borderLeft: '1px solid #dee2e6',
          borderRight: '1px solid #dee2e6',
          position: 'relative',
          flexShrink: 0,
          transition: isDragging ? 'none' : 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.target.style.backgroundColor = '#adb5bd';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.target.style.backgroundColor = '#dee2e6';
          }
        }}
      >
        {showMultipleIndicators && <ResizeIndicator position="top" fontSize="10px" />}
        <ResizeIndicator position="center" fontSize="12px" />
        {showMultipleIndicators && <ResizeIndicator position="bottom" fontSize="10px" />}
      </div>
      {/* Right Panel */}
      <div
        style={{
          width: `${rightWidth}%`,
          overflow: 'hidden',
          paddingLeft: '4px',
        }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

ResizablePanel.propTypes = {
  leftPanel: PropTypes.node.isRequired,
  rightPanel: PropTypes.node.isRequired,
  defaultLeftWidth: PropTypes.number,
  minLeftWidth: PropTypes.number,
  minRightWidth: PropTypes.number,
  className: PropTypes.string,
  style: PropTypes.object,
  minHeightForMultipleIndicators: PropTypes.number,
};

export default ResizablePanel;
