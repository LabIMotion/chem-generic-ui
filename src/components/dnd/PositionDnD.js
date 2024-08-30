/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useDrag } from 'react-dnd';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const PositionDnD = ({ type, field: fid, rowValue: rid, isButton = false }) => {
  const [{ isDraggingSource }, drag] = useDrag({
    type,
    item: () => {
      return { fid, rid };
    },
    collect: (monitor) => {
      return {
        isDraggingSource: monitor.isDragging(),
      };
    },
  });

  const dragClass = `${isDraggingSource ? 'gu_is-dragging' : ''}`;

  const moveIcon = (_isDragging) => (
    <div ref={drag} className={dragClass}>
      <LTooltip idf="change_position">
        <Button
          bsSize="sm"
          onClick={() => {}}
          style={{ cursor: _isDragging ? 'grabbing' : 'grab' }}
        >
          {FIcons.faArrowsUpDownLeftRight}
        </Button>
      </LTooltip>
    </div>
  );

  return isButton ? (
    moveIcon(drag, isDraggingSource)
  ) : (
    <div
      ref={drag}
      className={dragClass}
      style={{
        cursor: isDraggingSource ? 'grabbing' : 'grab',
        marginBottom: '20px',
        paddingLeft: '0px',
        paddingRight: '3px',
      }}
    >
      {FIcons.faArrowsUpDownLeftRight}
    </div>
  );
};

PositionDnD.propTypes = {
  type: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  rowValue: PropTypes.object.isRequired,
};

export default PositionDnD;
