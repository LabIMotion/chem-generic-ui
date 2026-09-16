/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FieldTypes } from 'generic-ui-core';
import LBadge from '@components/shared/LBadge';
import findTypeLabel from '@components/tools/field-utils';
import { S_USRS_SRC_OPTION } from '@utils/userSelectUtils';

const isSelectType = (type) =>
  type === FieldTypes.F_SELECT || type === FieldTypes.F_SELECT_MULTI;

const sourceLabel = (optionLayer) =>
  optionLayer === S_USRS_SRC_OPTION.value
    ? S_USRS_SRC_OPTION.label
    : optionLayer;

const typeText = (type, optionLayer) => {
  const typeLabel = findTypeLabel(type);
  if (!isSelectType(type) || !optionLayer) return typeLabel;
  return `${typeLabel}: ${sourceLabel(optionLayer)}`;
};

/**
 * Displays field property badges with appropriate styling.
 * Renders different badge variants based on the property type.
 */
function FieldBadge({ fieldObj, prop }) {
  const value = fieldObj[prop];

  // Configuration mapping for different property types
  const configs = {
    field: {
      text: value || '',
      variant: 'solid',
      color: 'dark',
    },
    type: {
      text: typeText(fieldObj.type, fieldObj?.option_layers),
      variant: 'outline',
      color: 'x',
    },
    cols: {
      text: value ? `column width division: ${value}` : '',
      variant: 'outline',
      color: 'default',
    },
  };

  // Get config for prop or use default
  const badgeConfig = configs[prop] || {
    text: value || '',
    variant: 'outline',
    color: 'default',
  };

  return (
    <LBadge
      variant={badgeConfig.variant}
      color={badgeConfig.color}
      text={badgeConfig.text}
    />
  );
}

FieldBadge.propTypes = {
  prop: PropTypes.oneOf(['field', 'type', 'cols']).isRequired,
  fieldObj: PropTypes.object.isRequired,
};

export default FieldBadge;
