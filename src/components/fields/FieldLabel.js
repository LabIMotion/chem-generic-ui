import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

const FieldLabel = props => {
  const { label, desc } = props;
  return (desc && desc !== '') ? (
    <OverlayTrigger placement="top" delayShow={1000} overlay={<Tooltip id={uuid()}>{desc}</Tooltip>}>
      <span>{label}</span>
    </OverlayTrigger>
  ) : <span>{label}</span>;
};

FieldLabel.propTypes = { label: PropTypes.string.isRequired, desc: PropTypes.string };
FieldLabel.defaultProps = { desc: '' };

export default FieldLabel;
