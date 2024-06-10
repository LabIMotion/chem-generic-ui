/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FIcons from '../icons/FIcons';

const FieldTooltip = ({ link }) => {
  if (!link) return null;
  return (
    <Button
      style={{ padding: '0' }}
      bsStyle="link"
      bsSize="sm"
      href={link}
      target="_blank"
      onClick={e => e.stopPropagation()}
    >
      {FIcons.faCircleInfo}
    </Button>
  );
};

FieldTooltip.propTypes = { link: PropTypes.string.isRequired };

export default FieldTooltip;
