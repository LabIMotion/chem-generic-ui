import React from 'react';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const LLabel = ({ children, tooltip, isCheckLabel }) => {
  const LabelComponent = isCheckLabel ? Form.Check.Label : Form.Label;

  const label = <LabelComponent className="fw-bold">{children}</LabelComponent>;

  if (tooltip == null || React.Children.count(tooltip) === 0) {
    return label;
  }

  return (
    <OverlayTrigger
      overlay={<Tooltip>{tooltip}</Tooltip>}
      placement="top"
      delay={{ show: 250, hide: 400 }}
    >
      {label}
    </OverlayTrigger>
  );
};

LLabel.propTypes = {
  children: PropTypes.node.isRequired,
  tooltip: PropTypes.node,
  isCheckLabel: PropTypes.bool,
};

LLabel.defaultProps = {
  tooltip: null,
  isCheckLabel: false,
};

export default LLabel;
