/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import TermLink from '@components/fields/TermLink';

const FieldLabel = (props) => {
  const { label, desc, isSpCall, ontology } = props;
  const klz = isSpCall
    ? 'gu_sp_label fw-bold d-inline-block mt-2 mb-1'
    : 'gu_sp_label_none fw-bold d-inline-block mt-2 mb-1';
  return desc && desc !== '' && !isSpCall ? (
    <>
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip id={uuid()}>{desc}</Tooltip>}
      >
        <span className={klz}>{label}</span>
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
FieldLabel.defaultProps = { desc: '', isSpCall: false, ontology: null };

export default FieldLabel;
