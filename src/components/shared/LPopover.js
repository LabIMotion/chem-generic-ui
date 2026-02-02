import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { OverlayTrigger, Popover } from 'react-bootstrap';

const LPopover = ({ idf, content, trigger, placement, children }) => {
  const idfs = idf.split('.');
  const [uId] = useState(`lpo_${idfs[0]}_${uuidv4()}`);
  const popover = <Popover id={uId}>{content}</Popover>;

  return (
    <OverlayTrigger
      animation
      placement={placement || 'top'}
      trigger={trigger}
      overlay={popover}
    >
      {children}
    </OverlayTrigger>
  );
};

LPopover.propTypes = {
  idf: PropTypes.string,
  content: PropTypes.node.isRequired,
  trigger: PropTypes.arrayOf(PropTypes.string).isRequired,
  placement: PropTypes.string,
  children: PropTypes.node.isRequired,
};

LPopover.defaultProps = { idf: 'lpo', placement: 'top' };

export default LPopover;
