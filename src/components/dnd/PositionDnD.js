/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useDrag } from 'react-dnd';
import FIcons from '@components/icons/FIcons';

// The isButton prop determines how the drag-and-drop icon is rendered.
// If isButton is true, the component renders a button with a tooltip.
// If isButton is false, it renders a simple div with the icon.
const PositionDnD = React.memo(
  ({ type, field: fid, rowValue: rid, isButton = false }) => {

    const [{ isDragging }, drag] = useDrag({
      type,
      item: { fid, rid },
      collect: (monitor) => {
        const dragging = monitor.isDragging();
        return {
          isDragging: dragging,
        };
      },
    });

    const className = `${isDragging ? ' gu_is-dragging' : ''}`;

    const cursorStyle = {
      cursor: isDragging ? 'grabbing' : 'grab',
      zIndex: 900,
      position: 'relative',
      // zIndex: isDragging ? 1000 : 1,
    };

    const moveIcon = () => (
      <Button
        ref={drag}
        className="px-3"
        style={cursorStyle}
        variant="outline-light"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="text-primary">{FIcons.faArrowsUpDownLeftRight}</div>
      </Button>
    );

    return isButton ? (
      moveIcon()
    ) : (
      <div
        onMouseEnter={() => console.log('Mouse enter:', fid?.field)}
        onMouseLeave={() => console.log('Mouse leave:', fid?.field)}
        ref={drag}
        // className={className}
        className={`px-3 py-2 ${className}`}
        // className="d-inline-flex align-items-center justify-content-center px-3 fs-3 h-100"
        // style={{ ...cursorStyle, touchAction: 'none' }}
        style={cursorStyle} // Apply cursor style here
      >
        <div className="dnd-btn text-primary">
          <span>{FIcons.faArrowsUpDownLeftRight}</span>
        </div>
      </div>
    );
  }
);

PositionDnD.propTypes = {
  type: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  rowValue: PropTypes.object.isRequired,
  isButton: PropTypes.bool,
};

PositionDnD.defaultProps = {
  isButton: false,
};

PositionDnD.displayName = 'PositionDnD';

export default PositionDnD;
