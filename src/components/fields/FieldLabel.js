import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import TermLink from './TermLink';

const FieldLabel = props => {
  const { label, desc, isSpCall, ontology } = props;
  const klz = isSpCall ? 'gu_sp_label' : 'gu_sp_label_none';
  return desc && desc !== '' && !isSpCall ? (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={uuid()}>{desc}</Tooltip>}
      >
        <span>{label}</span>
      </OverlayTrigger>
      {TermLink(ontology)}
    </>
  ) : (
    <span className={klz}>
      {label}&nbsp;{TermLink(ontology)}
    </span>
  );
};

FieldLabel.propTypes = {
  label: PropTypes.string.isRequired,
  desc: PropTypes.string,
  isSpCall: PropTypes.bool,
  ontology: PropTypes.object,
};
FieldLabel.defaultProps = { desc: '', isSpCall: false };

export default FieldLabel;
