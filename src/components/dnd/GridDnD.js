/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useDrag, useDrop } from 'react-dnd';
import { compose } from 'redux';

const GridDnD = ({
  field,
  rowValue,
  handleMove,
  isDragging,
  isOver,
  canDrop,
}) => {
  const [{ isDraggingSource }, drag] = useDrag({
    item: { fid: field, rId: rowValue.id, type: 'GRID' },
    collect: monitor => {
      return {
        isDraggingSource: monitor.isDragging(),
      };
    },
  });
  const [{ isOverTarget }, drop] = useDrop({
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
        isOverTarget: monitor.isOver(),
        canDrop: monitor.canDrop(),
      };
    },
  });
  const className = `generic_grid_dnd${isOver ? ' is-over' : ''}${
    canDrop ? ' can-drop' : ''
  }${isDragging ? ' is-dragging' : ''}`;
  return (
    <div ref={compose(drag, drop)} className={className}>
      <div className="dnd-btn">
        <span className="text-info fa fa-arrows" />
      </div>
    </div>
  );
};

GridDnD.propTypes = {
  field: PropTypes.object.isRequired,
  rowValue: PropTypes.object.isRequired,
  handleMove: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  isOver: PropTypes.bool.isRequired,
  canDrop: PropTypes.bool.isRequired,
};

export default GridDnD;
