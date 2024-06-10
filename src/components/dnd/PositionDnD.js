/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useDrag } from 'react-dnd';
import { v4 as uuid } from 'uuid';
import FIcons from '../icons/FIcons';

const PositionDnD = ({ type, field: fid, rowValue: rid, isButton = false }) => {
  const [{ isDraggingSource }, drag] = useDrag({
    type,
    item: () => {
      return { fid, rid };
    },
    collect: monitor => {
      return {
        isDraggingSource: monitor.isDragging(),
      };
    },
  });

  const dragClass = `${isDraggingSource ? 'gu_is-dragging' : ''}`;

  const moveIcon = _isDragging => (
    <div ref={drag} className={dragClass}>
      <OverlayTrigger
        delayShow={1000}
        placement="top"
        overlay={<Tooltip id={uuid()}>Drag and drop to move position</Tooltip>}
      >
        <Button
          bsSize="sm"
          onClick={() => {}}
          style={{ cursor: _isDragging ? 'grabbing' : 'grab' }}
        >
          {FIcons.faArrowsUpDownLeftRight}
        </Button>
      </OverlayTrigger>
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
