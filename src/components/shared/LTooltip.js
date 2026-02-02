import React, { useState, cloneElement, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import TAs from '@components/tools/TAs';

const LTooltip = ({ idf, children, placement }) => {
  const idfs = idf.split('.');
  const [uId] = useState(`ltt_${idfs[0]}_${uuidv4()}`);
  const message =
    typeof TAs[idfs[0]] === 'function'
      ? TAs[idfs[0]](idfs[1])
      : TAs[idfs[0]] || 'No message';

  // Check if the child is a disabled button
  const isDisabled =
    isValidElement(children) && children.props && children.props.disabled;

  // Wrap disabled buttons in a span to allow tooltips to work
  const wrappedChildren = isDisabled ? (
    <span
      className="d-inline-flex"
      style={{
        pointerEvents: 'auto',
        cursor: 'not-allowed',
      }}
      tabIndex={0}
    >
      {children}
    </span>
  ) : (
    children
  );

  return (
    <OverlayTrigger
      delayShow={1000}
      placement={placement || 'top'}
      overlay={<Tooltip id={uId}>{message || 'No message'}</Tooltip>}
    >
      {wrappedChildren}
    </OverlayTrigger>
  );
};

LTooltip.propTypes = {
  idf: PropTypes.string,
  children: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
};

LTooltip.defaultProps = { idf: 'ltt', placement: 'top' };

export default LTooltip;
