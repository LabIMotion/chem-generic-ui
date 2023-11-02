import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

const FieldLabel = props => {
  const { label, desc, isSpCall } = props;
  const klz = isSpCall ? 'gu_sp_label' : 'gu_sp_label_none';
  return desc && desc !== '' && !isSpCall ? (
    <OverlayTrigger
      placement="top"
      delayShow={1000}
      overlay={<Tooltip id={uuid()}>{desc}</Tooltip>}
    >
      <span>{label}</span>
    </OverlayTrigger>
  ) : (
    <span className={klz}>{label}</span>
  );
};

FieldLabel.propTypes = {
  label: PropTypes.string.isRequired,
  desc: PropTypes.string,
  isSpCall: PropTypes.bool,
};
FieldLabel.defaultProps = { desc: '', isSpCall: false };

export default FieldLabel;
