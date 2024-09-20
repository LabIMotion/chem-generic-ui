import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import LayerManager from '../../../utils/desMgr';

const LayersGrid = () => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const fetchLayers = async () => {
      const res = await LayerManager.getAllLayers();
      if (res.notify.isSuccess) {
        setRowData(res.element.data || []);
      }
    };
    fetchLayers();
  }, []);

  const columnDefs = [
    { field: 'id', headerName: 'ID', sortable: false, filter: false },
    { field: 'key', headerName: 'Name', sortable: true, filter: false },
    {
      field: 'label',
      headerName: 'Display Name',
      sortable: true,
      filter: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: true,
      cellStyle: { 'white-space': 'normal', 'line-height': '20px' },
      autoHeight: true,
    },
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="autoHeight"
      />
    </div>
  );
};

export default LayersGrid;
