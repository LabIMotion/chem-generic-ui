/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import LBadge from '../shared/LBadge';

const FieldBadge = (props) => {
  const { fieldObj, prop } = props;
  let badgeText = fieldObj[prop] || '';

  if (prop === 'field') return <LBadge text={badgeText} />;
  if (prop === 'type' && fieldObj[prop] === 'select') {
    badgeText = `${badgeText}: ${fieldObj?.option_layers}`;
  }
  if (prop === 'cols' && !!badgeText) {
    badgeText = `column width division: ${badgeText}`;
  }

  return <LBadge as="!badge" text={badgeText} />;
};

FieldBadge.propTypes = {
  prop: PropTypes.string.isRequired,
  fieldObj: PropTypes.object.isRequired,
};

export default FieldBadge;
