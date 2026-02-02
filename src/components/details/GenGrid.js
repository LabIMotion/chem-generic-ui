/* eslint-disable react/forbid-prop-types */
import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import Constants from '@components/tools/Constants';

const defaultColDef = {
  minWidth: 50,
  width: 150,
  filter: false,
  sortable: true,
};

const GenGrid = ({ columnDefs, gridData, pageSize, theme, rowSelected, filterText, onSetAutoHeight, onClearSelection }) => {
  const [columns] = useState(columnDefs);
  const gridRef = useRef();
  const gridStyle = useMemo(() => ({ height: '80vh', width: '100%' }), []);
  const [rowData, setRowData] = useState(gridData || []);
  const selectedIdRef = useRef(null);

  const scrollToSelectedRow = useCallback(() => {
    if (!gridRef?.current?.api) return;

    const selectedNodes = gridRef.current.api.getSelectedNodes();
    if (selectedNodes.length > 0) {
      const node = selectedNodes[0];
      gridRef.current.api.ensureNodeVisible(node, 'top');
    }
  }, []);

  const setAutoHeight = useCallback(() => {
    if (gridRef?.current?.api) {
      setTimeout(() => {
        document.querySelector('#guiDesignerGrid').style.height = '80vh';
      }, 100);
    }
  }, []);

  // Expose setAutoHeight function to parent component
  useEffect(() => {
    if (onSetAutoHeight) {
      onSetAutoHeight(setAutoHeight);
    }
  }, [onSetAutoHeight, setAutoHeight]);

  const clearSelection = useCallback(() => {
    if (gridRef?.current?.api) {
      gridRef.current.api.deselectAll();
      selectedIdRef.current = null;
    }
  }, []);

  // Expose clearSelection function to parent component
  useEffect(() => {
    if (onClearSelection) {
      onClearSelection(clearSelection);
    }
  }, [onClearSelection, clearSelection]);

  const setFixedHeight = useCallback(() => {
    if (gridRef?.current?.api) {
      setTimeout(() => {
        document.querySelector('#guiDesignerGrid').style.height = '16vh';
        scrollToSelectedRow();
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (rowSelected) {
      setFixedHeight();
    } else {
      setAutoHeight();
    }
  }, [rowSelected, setAutoHeight, setFixedHeight]);

  useEffect(() => {
    const currentSelected = gridRef?.current?.api?.getSelectedRows()?.[0];
    if (currentSelected?.id) {
      selectedIdRef.current = currentSelected.id;
    } else {
      selectedIdRef.current = null;
    }
    setRowData(gridData);
    requestAnimationFrame(() => {
      if (selectedIdRef.current && gridRef?.current?.api) {
        gridRef.current.api.forEachNode((node) => {
          if (node.data.id === selectedIdRef.current) {
            node.setSelected(true);
          }
        });
      }
    });
  }, [gridData]);

  useEffect(() => {
    if (gridRef?.current?.api) {
      gridRef.current.api.setGridOption('quickFilterText', filterText || '');
    }
  }, [filterText]);

  return (
    <>
      <div id="guiDesignerGrid" style={gridStyle} className={theme}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          rowSelection={{
            mode: 'singleRow',
            checkboxes: false,
            enableClickSelection: false,
          }}
          // paginationPageSize={pageSize}
          rowData={rowData}
        />
      </div>
    </>
  );
};

GenGrid.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  gridData: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
  rowSelected: PropTypes.bool,
  filterText: PropTypes.string,
  onSetAutoHeight: PropTypes.func,
  onClearSelection: PropTypes.func,
};

GenGrid.defaultProps = {
  pageSize: Constants.GRID_THEME.BALHAM.PAGE_SIZE,
  theme: Constants.GRID_THEME.BALHAM.VALUE,
  rowSelected: false,
};

export default GenGrid;
