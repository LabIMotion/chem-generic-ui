/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { calculateRowFormula } from '@utils/formulaUtils';

/**
 * Read-only renderer for a FORMULA-FIELD table column.
 * Always computes live from the current row data so the display stays
 * correct even for rows persisted before the formula changed; right-aligned
 * like the NUMBER renderer. Evaluation errors show as text (layer parity).
 */
function FormulaRenderer(props) {
  const { sField, subFields, node } = props;
  const { data } = node;
  const display = calculateRowFormula(
    sField.formula,
    sField.refs,
    subFields,
    data,
    sField.decimal,
  );
  return (
    <div className="text-end" style={{ width: '100%', textAlign: 'right' }}>
      {display}
    </div>
  );
}

FormulaRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  subFields: PropTypes.arrayOf(PropTypes.object).isRequired,
  node: PropTypes.object.isRequired,
};

export default FormulaRenderer;
