import React from 'react';
import { diffChars } from 'diff';
import FIcons from '@components/icons/FIcons';
import { DIFF_COLORS, GRID_CONFIG } from '@ui/diff/diffConstants.js';
import { transformValueForDisplay } from '@ui/diff/valueTransforms.js';

/**
 * Inline string diff component for showing character-level differences
 * @param {Object} props - Component props
 * @param {string} props.oldStr - Old string value
 * @param {string} props.newStr - New string value
 * @returns {JSX.Element} Inline diff component
 */
export const InlineDiff = ({ oldStr = '', newStr = '' }) => {
  const changes = diffChars(oldStr, newStr);
  return (
    <span>
      {changes.map((part, index) => {
        const style = {
          backgroundColor: part.added
            ? DIFF_COLORS.added
            : part.removed
              ? DIFF_COLORS.removed
              : 'transparent',
        };
        return (
          <span key={index} style={style}>
            {part.value}
          </span>
        );
      })}
    </span>
  );
};

/**
 * Transform key for display (e.g., convert array indices to 1-based with parent context)
 * @param {string} key - The original key
 * @param {string} parentKey - The parent key for context
 * @returns {string} Transformed key for display
 */
const transformKeyForDisplay = (key, parentKey) => {
  // Check if this is a numeric array index (0, 1, 2, etc.)
  if (/^\d+$/.test(key)) {
    const displayIndex = parseInt(key, 10) + 1;
    return String(displayIndex); // Show just the number
    // Show with parent context if available
    // return parentKey ? `${parentKey}(${displayIndex})` : String(displayIndex);
  }
  return key;
};

/**
 * Custom cell renderer for indented keys showing tree structure
 * @param {Object} params - AG Grid cell renderer params
 * @returns {JSX.Element} Key cell renderer
 */
export const KeyCellRenderer = (params) => {
  const { data } = params;
  const indent = data.level * GRID_CONFIG.indentSize;

  // Transform key for display (convert array indices to 1-based)
  const displayKey = transformKeyForDisplay(data.key, data.parentKey);

  return (
    <div
      style={{
        paddingLeft: `${indent}px`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {data.isParent && (
        <span style={{ marginRight: '5px', color: '#666' }}>
          {FIcons.faMinus}
        </span>
      )}
      <span>{displayKey}</span>
    </div>
  );
};

/**
 * Custom cell renderer for old values with diff highlighting
 * @param {Object} params - AG Grid cell renderer params
 * @returns {JSX.Element} Old value cell renderer
 */
export const OldValueCellRenderer = (params) => {
  const { data } = params;
  const { rawOldValue, rawNewValue, change } = data;

  // Show inline diff for primitive value changes (string, number, boolean)
  if (
    change === 'modified' &&
    (typeof rawOldValue === 'string' || typeof rawOldValue === 'number' || typeof rawOldValue === 'boolean') &&
    (typeof rawNewValue === 'string' || typeof rawNewValue === 'number' || typeof rawNewValue === 'boolean')
  ) {
    // Convert to string for diff display with transformations
    const oldStr = String(transformValueForDisplay(rawOldValue, data.key, data.fullKey));
    const newStr = String(transformValueForDisplay(rawNewValue, data.key, data.fullKey));
    return <InlineDiff oldStr={oldStr} newStr="" />;
  }

  // Value is already transformed by formatValue in diffCalculator
  const displayValue = params.value;

  // Show background color for removed values
  if (change === 'removed') {
    return (
      <span style={{
        backgroundColor: DIFF_COLORS.removed,
        padding: '2px 4px',
        borderRadius: '3px'
      }}>
        {displayValue}
      </span>
    );
  }

  return <span>{displayValue}</span>;
};

/**
 * Custom cell renderer for new values with diff highlighting
 * @param {Object} params - AG Grid cell renderer params
 * @returns {JSX.Element} New value cell renderer
 */
export const NewValueCellRenderer = (params) => {
  const { data } = params;
  const { rawOldValue, rawNewValue, change } = data;

  // Show inline diff for primitive value changes (string, number, boolean)
  if (
    change === 'modified' &&
    (typeof rawOldValue === 'string' || typeof rawOldValue === 'number' || typeof rawOldValue === 'boolean') &&
    (typeof rawNewValue === 'string' || typeof rawNewValue === 'number' || typeof rawNewValue === 'boolean')
  ) {
    // Convert to string for diff display with transformations
    const oldStr = String(transformValueForDisplay(rawOldValue, data.key, data.fullKey));
    const newStr = String(transformValueForDisplay(rawNewValue, data.key, data.fullKey));
    return <InlineDiff oldStr="" newStr={newStr} />;
  }

  // Value is already transformed by formatValue in diffCalculator
  const displayValue = params.value;

  // Show background color for added values
  if (change === 'added') {
    return (
      <span style={{
        backgroundColor: DIFF_COLORS.added,
        padding: '2px 4px',
        borderRadius: '3px'
      }}>
        {displayValue}
      </span>
    );
  }

  return <span>{displayValue}</span>;
};
