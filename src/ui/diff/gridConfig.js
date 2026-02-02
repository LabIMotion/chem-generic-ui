import { GRID_CONFIG } from '@ui/diff/diffConstants.js';
import { KeyCellRenderer, OldValueCellRenderer, NewValueCellRenderer } from '@ui/diff/CellRenderers.js';

/**
 * Create column definitions for the diff grid
 * @param {string} oldVersionId - ID/label for the old version
 * @param {string} newVersionId - ID/label for the new version
 * @returns {Array} Column definitions for AG Grid
 */
export const createColumnDefs = (oldVersionId, newVersionId) => [
  {
    field: 'key',
    headerName: 'Key',
    cellRenderer: KeyCellRenderer,
    flex: 2,
    minWidth: 300,
    pinned: 'left', // Pin the Key column to the left
  },
  {
    field: 'oldValue',
    headerName: `${oldVersionId || 'Old Value'} (baseline)`,
    cellRenderer: OldValueCellRenderer,
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'newValue',
    headerName: newVersionId || 'New Value',
    cellRenderer: NewValueCellRenderer,
    flex: 1,
    minWidth: 200,
  },
  {
    field: 'change',
    headerName: 'Change',
    width: 100,
    minWidth: 100,
  },
];

/**
 * Get the default column definition for the grid
 * @returns {Object} Default column definition
 */
export const getDefaultColDef = () => GRID_CONFIG.defaultColDef;

/**
 * Get row styling function for the grid
 * @returns {Function} Row styling function
 */
export const getRowStyle = () => (params) => ({
  backgroundColor: params.data.change === 'same' ? 'transparent' : '#f8f9fa', // Very light gray for changes
});
