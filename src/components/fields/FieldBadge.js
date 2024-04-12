/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

const FieldBadge = props => {
  const { fieldObj, prop } = props;
  let badgeText = fieldObj[prop] || '';

  if (prop === 'type' && fieldObj[prop] === 'select') {
    badgeText = `${badgeText}: ${fieldObj?.option_layers}`;
  }
  if (prop === 'cols' && !!badgeText) {
    badgeText = `column width division: ${badgeText}`;
  }

  return <Badge className="bg-bs-field-display">{badgeText}</Badge>;
};

FieldBadge.propTypes = {
  prop: PropTypes.string.isRequired,
  fieldObj: PropTypes.object.isRequired,
};

export default FieldBadge;
