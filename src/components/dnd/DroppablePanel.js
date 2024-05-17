import React from 'react';
import { useDrop } from 'react-dnd';

const DroppablePanel = ({ children, type, field: fid, rowValue: rid, fnCb }) => {
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: type,
    canDrop: item => item.fid.field !== fid.field && item.rid.key === rid.key,
    drop: (item, monitor) => {
      // item: source, props: target
      fnCb({ source: item.fid, target: fid, rid });
    },
    collect: monitor => {
      return {
        isOver: !!monitor.isOver(),
        isOverValidTarget: !!monitor.canDrop(),
      };
    },
  });

  const dropClass = `${isOver ? 'gu_is-over' : ''}${
    isOverValidTarget ? ' gu_can-drop' : ''
  }`;
  return (
    <div
      ref={drop}
      className={dropClass}
      style={{
        display: 'flex',
      }}
    >
      {children}
    </div>
  );
};

export default DroppablePanel;
