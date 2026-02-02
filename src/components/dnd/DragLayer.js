import React, { useEffect, useRef } from 'react';
import { useDragLayer } from 'react-dnd';
import { FieldTypes } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import { sysHeaderInfo, extHeaderInfo } from '@components/shared/arrangeUtils';

export default function DragLayer({ scrollableContainerRef }) {
  const scrollTimeoutRef = useRef(null);

  const { item, isDragging, currentOffset } = useDragLayer(
    (monitor) => ({
      item: monitor.getItem(),
      isDragging: monitor.isDragging(),
      currentOffset: monitor.getClientOffset(),
    }),
  );

  // Auto-scroll functionality for drag and drop
  useEffect(() => {
    if (!isDragging || !currentOffset || !scrollableContainerRef?.current) {
      // Clear any existing scroll timeout when not dragging
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      return;
    }

    const container = scrollableContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const { y } = currentOffset;

    // Only auto-scroll if cursor is within the container horizontally
    const isWithinContainer =
      currentOffset.x >= containerRect.left &&
      currentOffset.x <= containerRect.right;

    if (!isWithinContainer) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      return;
    }

    const scrollThreshold = 60; // pixels from edge to trigger scroll
    const scrollSpeed = 8; // pixels per scroll

    let shouldScroll = false;
    let direction = null;

    // Check if near top edge and can scroll up
    if (y < containerRect.top + scrollThreshold && container.scrollTop > 0) {
      shouldScroll = true;
      direction = 'up';
    }
    // Check if near bottom edge and can scroll down
    else if (y > containerRect.bottom - scrollThreshold) {
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (container.scrollTop < maxScroll) {
        shouldScroll = true;
        direction = 'down';
      }
    }

    if (shouldScroll && !scrollTimeoutRef.current) {
      const performScroll = () => {
        if (!isDragging) return;

        if (direction === 'up') {
          container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
        } else if (direction === 'down') {
          const maxScroll = container.scrollHeight - container.clientHeight;
          container.scrollTop = Math.min(maxScroll, container.scrollTop + scrollSpeed);
        }

        // Continue scrolling if still near edge
        scrollTimeoutRef.current = setTimeout(performScroll, 50);
      };

      scrollTimeoutRef.current = setTimeout(performScroll, 100);
    } else if (!shouldScroll && scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    // Cleanup function
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, [isDragging, currentOffset, scrollableContainerRef]);

  if (!isDragging || !currentOffset || !item) return null;

  const { x, y } = currentOffset;

  // Generate display text based on the type of item being dragged
  const getDisplayText = () => {
    const layer = item.layer || {};

    // For field items (from FieldOrderContent)
    if (layer.field !== undefined) {
      const { label, field, type } = layer;
      const isDummy = FieldTypes.F_DUMMY === type;
      return isDummy ? '(dummy field)' : `${label}(${field})`;
    }

    // For layer items (from ArrangeContent and LayerOrderContent)
    if (layer.key !== undefined) {
      const { label, key, fields } = layer;
      const isSys = key && key.startsWith(Constants.SYS_REACTION);
      const content = isSys ? sysHeaderInfo(fields) : `${label}(${key})`;
      const splitKey = key ? key.split('.') : [];
      const repetitionInfo = extHeaderInfo(splitKey);

      return repetitionInfo ? `${content} - ${repetitionInfo.props.children}` : content;
    }

    // Fallback to basic label
    return layer.label || item.label || 'Item';
  };

  const displayText = getDisplayText();

  return (
    <div
      className="drag-layer-preview"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        top: y,
        left: x,
        zIndex: 10000,
        transform: 'translate(-50%, -50%)',
        opacity: 0.9,
      }}
    >
      <div
        className="w-100 drag-item-content"
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #007bff',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 4px 16px rgba(0,123,255,0.2)',
          fontWeight: 500,
          color: '#333333',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          minWidth: '120px',
          textAlign: 'center',
        }}
      >
        {displayText}
      </div>
    </div>
  );
}
