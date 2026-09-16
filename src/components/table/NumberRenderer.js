/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { formatNumberDisplay } from '@utils/numberUtils';

/**
 * Read-only renderer for a NUMBER table column.
 * Mirrors the standalone NUMBER field display: numeral.js format with the
 * column-level decimals, right-aligned text.
 */
function NumberRenderer(props) {
  const { sField, node } = props;
  const { data } = node;
  const cell = data?.[sField.id];
  const raw =
    cell && typeof cell === 'object' && 'value' in cell ? cell.value : cell;
  const decimals = sField?.numeric?.decimals;
  const display =
    raw === null || raw === undefined || raw === ''
      ? ''
      : formatNumberDisplay(raw, decimals);
  return (
    <div className="text-end" style={{ width: '100%', textAlign: 'right' }}>
      {display}
    </div>
  );
}

NumberRenderer.propTypes = {
  sField: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
};

export default NumberRenderer;
