/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { genUnits, genUnit } from 'generic-ui-core';
import TAs from '@components/tools/TAs';
import { genUnitSup } from '@components/tools/utils';
import { convertValues, validateInput, getValidationErrors } from '@utils/unitHelpers';

/**
 * SysUnitButton - A button component that displays a unit of measurement
 * and allows the user to cycle through available units.
 * @param {object} props - The component props
 * @param {object} props.generic - The generic object containing unit information
 * @param {string} props.variant - The button variant
 * @param {string} props.size - The button size
 * @param {function} props.fnCb - Callback function to handle button click
 * @returns {JSX.Element|null} - The rendered button or null if the generic object is invalid
 */
const SysUnitButton = ({ generic, variant, size, fnCb }) => {
  if (!generic) {
    console.error('Error: input object is undefined or null!');
    return null;
  }

  const isValid = validateInput(generic);
  if (!isValid) {
    console.error('Invalid generic object:', getValidationErrors());
    return null;
  }

  const { measurable_quantity, unit, values = [] } = generic;

  const units = useMemo(
    () => genUnits(measurable_quantity),
    [measurable_quantity],
  );
  if (!units || units.length === 0) {
    console.error(
      `Error: ${measurable_quantity} is not in the list of supported units!`,
    );
    return null;
  }

  const unitInfo = useMemo(
    () => genUnit(measurable_quantity, unit),
    [measurable_quantity, unit],
  );
  const hasUT = !!unitInfo.unit_type;
  const defaultUnit = unit || units[0]?.key || '';

  const handleClick = () => {
    const update = { ...generic };
    try {
      let uIdx = units.findIndex((e) => e.key === defaultUnit);
      if (uIdx < units.length - 1) uIdx += 1;
      else uIdx = 0;

      const newValSystem = units.length > 0 ? units[uIdx].key : '';
      const newValues = convertValues(measurable_quantity, newValSystem, values);

      update.unit = newValSystem;
      update.values = newValues;
    } catch (error) {
      console.error('Error changing unit:', error);
    } finally {
      fnCb(update);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      title={hasUT ? TAs.no_unit_conversion : undefined}
      className="gen-unit-btn"
    >
      {genUnitSup(unitInfo.label || '') || ''}
    </Button>
  );
};

SysUnitButton.propTypes = {
  generic: PropTypes.shape({
    type: PropTypes.string.isRequired,
    measurable_quantity: PropTypes.string.isRequired,
    unit: PropTypes.string,
    values: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    ),
  }).isRequired,
  variant: PropTypes.string,
  size: PropTypes.string,
  fnCb: PropTypes.func,
};

SysUnitButton.defaultProps = {
  variant: 'success',
  size: 'sm',
  fnCb: () => {},
};

export default SysUnitButton;
