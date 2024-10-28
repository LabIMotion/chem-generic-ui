/* eslint-disable react/forbid-prop-types */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import RepoRenderer from '../details/renderers/RepoRenderer';
import Constants from '../tools/Constants';
import ExternalManager from '../../utils/extMgr';

const RepoGridEl = ({ fnApi }) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const onGridReady = useCallback(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const res = await ExternalManager.getAllTemplates(
        Constants.GENERIC_TYPES.ELEMENT
      );
      if (res.error) {
        console.error(res.error);
      } else {
        setRowData(res.element.data || []);
      }
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const columnDefs = [
    {
      hide: true,
      headerName: '#',
      valueFormatter: (params) => `${parseInt(params.node.id, 10) + 1}`,
      sortable: false,
    },
    {
      headerName: 'Action',
      cellRenderer: RepoRenderer,
      cellRendererParams: { fnApi },
    },
    {
      headerName: 'Name',
      field: 'name',
      minWidth: 100,
      flex: 3,
    },
    {
      headerName: 'Element Label',
      field: 'label',
      minWidth: 100,
      flex: 3,
    },
    { headerName: 'Version', field: 'version' },
    { headerName: 'Released at', field: 'released_at' },
    { headerName: 'Identifier', field: 'identifier' },
    {
      headerName: 'Description',
      field: 'description',
      minWidth: 150,
      flex: 3,
    },
  ];

  return (
    <div
      className={Constants.GRID_THEME.QUARTZ.VALUE}
      style={{ height: '600px', width: '100%', overflow: 'auto' }}
    >
      <AgGridReact
        loading={loading}
        onGridReady={onGridReady}
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="normal"
        suppressAutoSize
      />
    </div>
  );
};

RepoGridEl.propTypes = {
  fnApi: PropTypes.func.isRequired,
};

export default RepoGridEl;
