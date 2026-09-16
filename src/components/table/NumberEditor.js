/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import {
  formatNumberDisplay,
  parseNumberInput,
  resolveDecimals,
  validateNumberValue,
} from '@utils/numberUtils';

/**
 * Editable cell for a NUMBER table column.
 * Mirrors the standalone NUMBER field UX (`GenPropertiesNumber`):
 *  - while editing the raw text is preserved (no live formatting)
 *  - on blur the value is parsed via `parseNumberInput` (rounding + min/max
 *    clamp) and committed through `onCellChange`
 *  - the displayed value is formatted with `formatNumberDisplay`
 *  - the input is right-aligned and shows invalid feedback when the stored
 *    value violates current constraints
 */
function NumberEditor(props) {
  const { columnDef, rowValue, onCellChange } = props;
  const { sField } = columnDef.cellParams || {};
  const numeric = sField?.numeric || {};
  const decimals = resolveDecimals(numeric.decimals);

  const cell = rowValue?.[columnDef.field];
  const stored =
    cell && typeof cell === 'object' && 'value' in cell ? cell.value : cell;

  const [localValue, setLocalValue] = useState(null);

  const displayValue =
    stored === null || stored === undefined || stored === ''
      ? ''
      : formatNumberDisplay(stored, decimals);

  const isEditing = localValue !== null;
  const hasStoredValue =
    stored !== null && stored !== undefined && stored !== '';
  const { valid: isValueValid, errors: valueErrors } =
    !isEditing && hasStoredValue
      ? validateNumberValue(stored, {
          decimals: numeric.decimals,
          min: numeric.min,
          max: numeric.max,
        })
      : { valid: true, errors: [] };

  const handleFocus = () =>
    setLocalValue(
      stored === null || stored === undefined ? '' : String(stored),
    );
  const handleChange = (e) => setLocalValue(e.target.value);
  const handleBlur = (e) => {
    const raw = e.target.value;
    const parsed = parseNumberInput(raw, numeric.decimals, {
      min: numeric.min,
      max: numeric.max,
    });
    const next = parsed !== null ? parsed : '';
    if (onCellChange) {
      onCellChange({
        e: { target: { value: next } },
        columnDef,
        rowValue,
      });
    }
    setLocalValue(null);
  };

  return (
    <>
      <Form.Control
        type="text"
        value={isEditing ? localValue : displayValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        className="text-end"
        isInvalid={!isValueValid}
      />
      {!isValueValid && (
        <Form.Control.Feedback type="invalid">
          {valueErrors[0]}
        </Form.Control.Feedback>
      )}
    </>
  );
}

NumberEditor.propTypes = {
  columnDef: PropTypes.object.isRequired,
  rowValue: PropTypes.object.isRequired,
  onCellChange: PropTypes.func.isRequired,
};

export default NumberEditor;
