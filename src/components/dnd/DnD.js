/* eslint-disable react/forbid-prop-types */
import React, { forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';

const orderSource = {
  beginDrag(props) {
    return props;
  },
};

const DnD = forwardRef((props, ref) => {
  const { canDrag, type, layer, field, handleMove, children } = props;

  // Memoize the handleMove function
  const memoizedHandleMove = useCallback(
    (sourceKey, targetKey) => {
      handleMove(sourceKey, targetKey);
    },
    [handleMove]
  );

  const [{ isDraggingSource }, drag] = useDrag({
    type,
    item: () => orderSource.beginDrag(props),
    canDrag: () => canDrag,
    collect: (monitor) => {
      return {
        isDraggingSource: monitor.isDragging(),
      };
    },
  });

  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: type,
    canDrop: (item) => !layer.wf || !item.layer.wf,
    drop: (item) => {
      if (field === item.field && layer.key !== item.layer.key)
        memoizedHandleMove(item.layer.key, layer.key);
    },
    collect: (monitor) => {
      return {
        isOver: monitor.isOver(),
        isOverValidTarget: monitor.canDrop(),
      };
    },
  });

  const className = `generic_grid_dnd${isOver ? ' is-over' : ''}${
    isOverValidTarget ? ' can-drop' : ''
  }${isDraggingSource ? ' is-dragging' : ''}`;

  // Combine the drag and drop refs
  const dragDropRef = (element) => {
    drag(element);
    drop(element);
    if (ref) {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        const currentRef = ref; // Create a new reference
        currentRef.current = element; // Assign to the new reference
      }
    }
  };

  return (
    <div
      ref={dragDropRef}
      className={`w-100 p-2 m-2 ${className}`}
      style={{ position: 'relative' }}
    >
      <div className={canDrag ? 'dnd' : ''}>{children}</div>
    </div>
  );
});

DnD.displayName = 'DnD';

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
