/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';

const GridDnD = ({ field, rowValue, handleMove }) => {
  const [{ isDraggingSource }, drag] = useDrag({
    type: 'GRID',
    item: { fid: field, rId: rowValue.id, type: 'GRID' },
    collect: monitor => {
      return {
        isDraggingSource: monitor.isDragging(),
      };
    },
  });
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: 'GRID',
    drop: item => {
      const tar = { fid: field, rId: rowValue.id };
      const src = item;
      if (tar.fid === src.fid && tar.rId !== src.rId) {
        handleMove(src.rId, tar.rId);
      }
    },
    collect: monitor => {
      return {
        isOver: monitor.isOver(),
        isOverValidTarget: monitor.canDrop(),
      };
    },
  });
  const className = `generic_grid_dnd${isOver ? ' is-over' : ''}${
    isOverValidTarget ? ' can-drop' : ''
  }${isDraggingSource ? ' is-dragging' : ''}`;
  return (
    <div ref={drop}>
      <div ref={drag} className={className}>
        <div className="dnd-btn">
          <span className="text-info fa fa-arrows" />
        </div>
      </div>
    </div>
  );
};

GridDnD.propTypes = {
  field: PropTypes.string.isRequired,
  rowValue: PropTypes.object.isRequired,
  handleMove: PropTypes.func.isRequired,
};

export default GridDnD;
