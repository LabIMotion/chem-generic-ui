import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import LTooltip from '../../shared/LTooltip';
import LayerManager from '../../../utils/desMgr';
import ButtonConfirm from '../../fields/ButtonConfirm';

const LayersGrid = ({ onLayerSelect, onLayerDelete }) => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    const fetchLayers = async () => {
      const res = await LayerManager.getAllLayers();
      console.log('res=', res);
      if (res.notify.isSuccess) {
        setRowData(res.element.data || []);
      }
    };
    fetchLayers();
  }, []);

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
        </>
      ),
      sortable: false,
      filter: false,
      width: 100,
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
    <div className="ag-theme-alpine" style={{ height: 600, width: '100%' }}>
      <AgGridReact
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="normal"
      />
    </div>
  );
};

export default LayersGrid;
