import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

const DnD = (props) => {
  const { canDrag, type, layer, field, handleMove, children } = props;
  const containerRef = useRef(null);

  const [{ isDraggingSource }, drag, preview] = useDrag({
    type,
    item: { type, layer, field, label: layer?.label || children.props?.label }, // pass label for preview
    canDrag: () => canDrag,
    collect: (monitor) => {
      return {
        isDraggingSource: monitor.isDragging(),
      };
    },
  });

  // Hide the default drag preview since we're using a custom DragLayer
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: type,
    canDrop: (item) => !layer.wf || !item.layer.wf,
    drop: (item, monitor) => {
      // Only handle drop if it's a valid move
      if (field === item.field && layer.key !== item.layer.key) {
        handleMove(item.layer.key, layer.key);
      }
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        isOverValidTarget: monitor.canDrop(),
      };
    },
  });


  let dndClass = 'generic_grid_dnd';
  if (isOver) dndClass += ' is-over';
  if (isOverValidTarget) dndClass += ' can-drop';

  // Enhanced styling for better drop zone visibility
  const dropZoneStyle = {
    opacity: isDraggingSource ? 0 : 1,
    position: 'relative',
    zIndex: isDraggingSource ? 9000 : 1,
    transition: 'all 0.2s ease',
    ...(isOver && isOverValidTarget && {
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      borderColor: '#007bff',
      transform: 'scale(1.02)',
    }),
  };

  return (
    <div
      ref={(node) => {
        drag(node);
        drop(node);
        containerRef.current = node?.parentElement; // track scrollable parent
      }}
      className={`w-100 p-2 m-2 ${dndClass}`}
      style={dropZoneStyle}
    >
      <div className="dnd">{children}</div>
    </div>
  );
};

DnD.propTypes = {
  canDrag: PropTypes.bool,
  type: PropTypes.string.isRequired,
  layer: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  handleMove: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

DnD.defaultProps = {
  canDrag: true,
};

export default DnD;
