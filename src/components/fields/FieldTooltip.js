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
      href={link}
      target="_blank"
      onClick={e => e.stopPropagation()}
    >
      {FIcons.faCircleQuestion}
    </Button>
  );
};

FieldTooltip.propTypes = { link: PropTypes.string.isRequired };

export default FieldTooltip;
