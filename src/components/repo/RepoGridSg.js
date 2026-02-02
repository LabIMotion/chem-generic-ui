import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import RepoRenderer from '@components/details/renderers/RepoRenderer';
import Constants from '@components/tools/Constants';
import ExternalManager from '@utils/extMgr';

const BelongsToRenderer = (params) => {
  const { data } = params;
  return (
    <>
      {data.element_klass?.label}
      &nbsp;
      <i className={data.element_klass?.icon_name} aria-hidden="true" />
    </>
  );
};

const RepoGridSg = ({ fnApi }) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultColDef = useMemo(() => {
    return {
      minWidth: 100,
      flex: 1,
    };
  }, []);

  const onGridReady = useCallback(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const res = await ExternalManager.getAllTemplates(
        Constants.GENERIC_TYPES.SEGMENT,
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
      sortable: false,
    },
    {
      headerName: 'Action',
      cellRenderer: RepoRenderer,
      cellRendererParams: { fnApi },
    },
    {
      headerName: 'Label',
      field: 'label',
      flex: 2,
    },
    {
      headerName: 'Belongs to',
      field: 'element_klass.name',
      cellRenderer: BelongsToRenderer,
      flex: 2,
    },
    { headerName: 'Version', field: 'version' },
    { headerName: 'Released at', field: 'released_at', flex: 2 },
    { headerName: 'Identifier', field: 'identifier' },
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
        defaultColDef={defaultColDef}
        rowData={rowData}
        domLayout="normal"
        suppressAutoSize
      />
    </div>
  );
};

RepoGridSg.propTypes = {
  fnApi: PropTypes.func.isRequired,
};

export default RepoGridSg;
