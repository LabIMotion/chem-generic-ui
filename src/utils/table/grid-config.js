/**
 * Shared grid configurations for AgGrid components
 */
export const labRowSelection = {
  mode: 'singleRow',
  checkboxes: false,
  enableClickSelection: true,
  headerCheckbox: false,
};

export const labDefaultColDef = {
  suppressMovable: true,
  resizable: true,
  sortable: false,
  filter: false,
};

export const labAutoSizeStrategy = {
  type: 'fitGridWidth',
  defaultMinWidth: 120,
  columnLimits: [
    {
      colId: 'id',
      minWidth: 60,
    },
  ],
};