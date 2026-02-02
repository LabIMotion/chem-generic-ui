/**
 * JsonDiffTreeAgGrid Component
 *
 * A comprehensive JSON diff viewer built with AG Grid that displays differences
 * between two JSON objects in a tree structure with visual highlighting.
 *
 * Features:
 * - Side-by-side comparison of JSON objects
 * - Tree-like indentation for nested structures
 * - Color-coded diff highlighting (added, removed, modified)
 * - Character-level inline diffs for string changes
 * - Container handling for layers, fields, and arrays
 * - User-friendly value transformations
 * - Toggle for showing only changes vs. all data
 */

import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Form } from 'react-bootstrap';
import sortBy from 'lodash/sortBy';
import Constants from '@components/tools/Constants';

// Import refactored utilities and components
import { preprocessJson } from '@ui/diff/jsonPreprocessor.js';
import { buildFlatData } from '@ui/diff/diffCalculator.js';
import { createColumnDefs, getDefaultColDef, getRowStyle } from '@ui/diff/gridConfig.js';
import { GRID_CONFIG } from '@ui/diff/diffConstants.js';

/**
 * Main JsonDiffTreeAgGrid Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.oldJson - The baseline/old JSON object to compare
 * @param {Object} props.newJson - The new JSON object to compare against
 * @param {string} props.oldVersionId - Display label for the old version column
 * @param {string} props.newVersionId - Display label for the new version column
 * @returns {JSX.Element} The JSON diff tree grid component
 */
export default function JsonDiffTreeAgGrid({
  oldJson,
  newJson,
  oldVersionId,
  newVersionId
}) {
  // State for controlling whether to show only changes or all data
  const [showChangesOnly, setShowChangesOnly] = useState(true);

  /**
   * Preprocess both JSON objects for consistent comparison
   * - Establishes layer ordering from newJson for consistency
   * - Applies property filtering and renaming
   * - Handles special structures like layers and fields
   */
  const { preprocessedOldJson, preprocessedNewJson } = useMemo(() => {
    // Extract layer order from newJson to maintain consistent ordering
    let newJsonLayerOrder = null;
    if (newJson?.layers && typeof newJson.layers === 'object' && !Array.isArray(newJson.layers)) {
      const sortedEntries = sortBy(Object.entries(newJson.layers), '[1].position');
      newJsonLayerOrder = sortedEntries.map(([key]) => key);
    }

    // Preprocess both JSONs with the same layer order for consistency
    return {
      preprocessedOldJson: preprocessJson(oldJson, newJsonLayerOrder),
      preprocessedNewJson: preprocessJson(newJson, newJsonLayerOrder)
    };
  }, [oldJson, newJson]);

  /**
   * Build flat data structure from preprocessed JSONs
   * - Uses jsondiffpatch to calculate differences
   * - Flattens nested structure into grid-compatible rows
   * - Preserves hierarchy information for tree display
   */
  const allRowData = useMemo(
    () => buildFlatData(preprocessedOldJson, preprocessedNewJson),
    [preprocessedOldJson, preprocessedNewJson],
  );

  /**
   * Filter data based on showChangesOnly setting
   * - When enabled, shows only rows with changes (added, removed, modified)
   * - When disabled, shows all rows including unchanged ones
   */
  const rowData = useMemo(() => {
    if (showChangesOnly) {
      return allRowData.filter(row => row.change !== 'same');
    }
    return allRowData;
  }, [allRowData, showChangesOnly]);

  /**
   * Handle toggle for show changes only checkbox
   * @param {Event} e - Checkbox change event
   */
  const handleShowChangesToggle = (e) => {
    setShowChangesOnly(e.target.checked);
  };

  // Grid configuration
  const columnDefs = createColumnDefs(oldVersionId, newVersionId);
  const defaultColDef = getDefaultColDef();
  const getRowStyleFunc = getRowStyle();

  return (
    <div style={{ width: '100%' }}>
      {/* Controls Section */}
      <div className="mb-3">
        <Form.Check
          type="checkbox"
          id="showChangesOnly"
          label="Show changes only"
          checked={showChangesOnly}
          onChange={handleShowChangesToggle}
        />
      </div>

      {/* Grid Section */}
      <div
        className={Constants.GRID_THEME.QUARTZ.VALUE}
        style={{ height: GRID_CONFIG.height, width: '100%' }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          animateRows={GRID_CONFIG.animateRows}
          getRowStyle={getRowStyleFunc}
        />
      </div>
    </div>
  );
}
