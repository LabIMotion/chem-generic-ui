/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons';

const PositionDnD = ({ type, field: fid, rowValue: rid }) => {
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

  const dragClass = `btn ${isDraggingSource ? 'gu_is-dragging' : ''}`;
  return (
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
      <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
    </div>
  );
};

PositionDnD.propTypes = {
  type: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  rowValue: PropTypes.object.isRequired,
};

export default PositionDnD;
