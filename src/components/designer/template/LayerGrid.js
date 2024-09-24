import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import LTooltip from '../../shared/LTooltip';
import LayerManager from '../../../utils/desMgr';
import ButtonConfirm from '../../fields/ButtonConfirm';
import LayerGridFullWidth from './LayerGridFullWidth';

const LayersGrid = ({ onLayerSelect, onLayerDelete, onLayerView }) => {
  const [rowData, setRowData] = useState([]);
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [expandedRowHeight, setExpandedRowHeight] = useState(50); // Default height
  const [gridHeight, setGridHeight] = useState(600);
  const gridRef = useRef(null); // Add a reference to the grid

  useEffect(() => {
    const fetchLayers = async () => {
      const res = await LayerManager.getAllLayers();
      if (res.notify.isSuccess) {
        setRowData(res.element.data || []);
      }
    };
    fetchLayers();
  }, []);

  const updateGridLayout = useCallback(() => {
    if (gridRef.current && gridRef.current.api) {
      console.log('updateGridLayout');
      // gridRef.current.api.resetRowHeights(); // This method is not needed when using dynamic row heights, and it's causing the conflict with Auto Row Height.
      gridRef.current.api.onRowHeightChanged();
      gridRef.current.api.refreshCells({ force: true });
    }
  }, []);

  useEffect(() => {
    updateGridLayout();
  }, [expandedRowIndex, gridHeight, updateGridLayout]);

  const handleHeightChange = useCallback(
    (height) => {
      setExpandedRowHeight(height + 20); // Add some padding
      const newGridHeight = Math.max(600, rowData.length * 50 + height + 20);
      setGridHeight(newGridHeight);
    },
    [rowData]
  );

  const togglePanel = useCallback((rowIndex) => {
    setExpandedRowIndex(rowIndex);
  }, []);

  // Usage in getRowHeight
  const getRowHeight = useCallback(
    (params) => {
      return params.node.rowIndex === expandedRowIndex ? expandedRowHeight : 50;
    },
    [expandedRowHeight, expandedRowIndex]
  );

  const isFullWidthRow = useCallback(
    (params) => {
      return params?.rowNode?.rowIndex === expandedRowIndex;
    },
    [expandedRowIndex]
  );

  const fullWidthRenderer = useCallback(
    (params) => {
      const { node, data } = params;
      return (
        // <div ref={contentRef} className="gu-full-width-panel">
        <LayerGridFullWidth
          node={node}
          data={data}
          onHeightChange={handleHeightChange}
          onClose={() => {
            setExpandedRowIndex(null);
            updateGridLayout();
          }}
        />
        // </div>
      );
    },
    [handleHeightChange, updateGridLayout]
  );

  const columnDefs = [
    {
      headerName: 'Action',
      cellRenderer: (params) => (
        <>
          <LTooltip idf="add_lyr2tpl">
            <Button className="btn-gxs" onClick={() => onLayerSelect(params)}>
              Add
            </Button>
          </LTooltip>
          <ButtonConfirm
            cls="btn-gxs gu-ml-1"
            msg="Delete this Standard Layer permanently?"
            fnClick={onLayerDelete}
            fnParams={params}
          />
          <LTooltip idf="add_lyr2tpl">
            <Button
              className="btn-gxs gu-ml-1"
              // onClick={() => togglePanel(params.node.rowIndex)}
              onClick={() => onLayerView(params)}
            >
              Show
            </Button>
          </LTooltip>
        </>
      ),
      sortable: false,
      filter: false,
      width: 160,
    },
    {
      field: 'id',
      headerName: 'ID',
      sortable: false,
      filter: false,
      width: 70,
    },
    {
      field: 'name',
      headerName: 'Name',
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      field: 'label',
      headerName: 'Display Name',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: false,
      cellStyle: { whiteSpace: 'pre-wrap', lineHeight: '20px' },
      cellRenderer: (params) => {
        return params.value ? (
          <pre
            style={{
              margin: 0,
              fontFamily: 'inherit',
              backgroundColor: 'unset',
              border: 'unset',
            }}
          >
            {params.value}
          </pre>
        ) : (
          ''
        );
      },
      autoHeight: true,
      flex: 1,
    },
  ];

  return (
    <div
      className="ag-theme-alpine"
      style={{ maxHeight: `${gridHeight}px`, width: '100%', overflow: 'auto' }}
      // style={{ height: `${gridHeight}px`, width: '100%', overflow: 'auto' }}
    >
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="autoHeight"
        // domLayout="normal"
        isFullWidthRow={isFullWidthRow}
        fullWidthCellRenderer={fullWidthRenderer}
        getRowHeight={getRowHeight}
        suppressAutoSize
        animateRows
      />
    </div>
  );
};

export default LayersGrid;
