import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import TAs from '../tools/TAs';

const LTooltip = ({ idf, children, placement }) => {
  const idfs = idf.split('.');
  const [uId] = useState(`ltt_${idfs[0]}_${uuidv4()}`);
  const message =
    typeof TAs[idfs[0]] === 'function'
      ? TAs[idfs[0]](idfs[1])
      : TAs[idfs[0]] || 'No message';

  return (
    <OverlayTrigger
      delayShow={1000}
      placement={placement || 'top'}
      overlay={<Tooltip id={uId}>{message || 'No message'}</Tooltip>}
    >
      {children}
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
