/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import { FieldTypes } from 'generic-ui-core';

// Use for reaction drop panel
const DroppablePanel = ({
  children,
  type,
  field: fid,
  rowValue: rid,
  fnCb,
}) => {
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: type,
    canDrop: (item) => {
      // only allow drop reaction to sys-reaction field
      const isAccepted = (
        item.element.type === 'reaction' &&
        rid.key === FieldTypes.F_SYS_REACTION
      );
      return isAccepted;
      // return item.fid.field !== fid.field && item.rid.key === rid.key;
    },
    drop: (item) => fnCb({ source: item, target: fid, rid }),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      isOverValidTarget: !!monitor.canDrop(),
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
    }),
  });

  const dropClass = [
    // 'panel-heading',
    // 'template_panel_heading_reset',
    // 'd-flex justify-content-between align-items-center',
    isOver && 'gu_is-over',
    isOverValidTarget && 'gu_can-drop',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={drop} className={dropClass}>
      {children}
    </div>
  );
};

DroppablePanel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  type: PropTypes.array.isRequired,
  fnCb: PropTypes.func.isRequired,
  field: PropTypes.object.isRequired,
  rowValue: PropTypes.object.isRequired,
};

export default DroppablePanel;
