/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import { FieldTypes } from 'generic-ui-core';

const DroppablePanel = ({
  children,
  type,
  field: fid,
  rowValue: rid,
  fnCb,
}) => {
  const [{ isOver, isOverValidTarget }, drop] = useDrop({
    accept: type,
    canDrop: item => {
      if (type === 'element') {
        // only allow drop reaction to sys-reaction field
        return (
          item.element.type === 'reaction' &&
          rid.key === FieldTypes.F_SYS_REACTION
        );
      }
      return item.fid.field !== fid.field && item.rid.key === rid.key;
    },
    drop: item => {
      fnCb({ source: item, target: fid, rid });
    },
    collect: monitor => {
      return {
        isOver: !!monitor.isOver(),
        isOverValidTarget: !!monitor.canDrop(),
      };
    },
  });

  const dropClass = `panel-heading template_panel_heading_reset ${
    isOver ? ' gu_is-over' : ''
  }${isOverValidTarget ? ' gu_can-drop' : ''}`;
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

DroppablePanel.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  type: PropTypes.string.isRequired,
  fnCb: PropTypes.func.isRequired,
  field: PropTypes.object.isRequired,
  rowValue: PropTypes.object.isRequired,
};

export default DroppablePanel;
