/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const FieldTooltip = ({ link }) => {
  if (!link) return null;
  return (
    <Button
      style={{ padding: '0' }}
      bsStyle="link"
      bsSize="xsmall"
      href={link}
      target="_blank"
      onClick={e => e.stopPropagation()}
    >
      <i className="fa fa-info-circle" aria-hidden="true" />
    </Button>
  );
};

FieldTooltip.propTypes = { link: PropTypes.string.isRequired };

export default FieldTooltip;
