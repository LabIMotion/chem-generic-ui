import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import LTooltip from '@components/shared/LTooltip';
import LayerManager from '@utils/desMgr';
import ButtonConfirm from '@components/fields/ButtonConfirm';
import Constants from '@components/tools/Constants';

const LayersGrid = ({ onLayerSelect, onLayerDelete, onLayerView }) => {
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
    {
      headerName: 'Action',
      cellRenderer: (params) => (
        <>
          <LTooltip idf="lyr_add2tpl">
            <Button size="sm" onClick={() => onLayerSelect(params)}>
              Add
            </Button>
          </LTooltip>
          <LTooltip idf="lyr_view">
            <Button
              className="gu-ml-1"
              size="sm"
              onClick={() => onLayerView(params)}
            >
              View
            </Button>
          </LTooltip>
          <ButtonConfirm
            cls="gu-ml-1"
            msg="Delete this Standard Layer permanently?"
            fnClick={onLayerDelete}
            fnParams={params}
          />
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
      className={Constants.GRID_THEME.QUARTZ.VALUE}
      style={{ height: '600px', width: '100%', overflow: 'auto' }}
    >
      <AgGridReact columnDefs={columnDefs} rowData={rowData} suppressAutoSize />
    </div>
  );
};

export default LayersGrid;
