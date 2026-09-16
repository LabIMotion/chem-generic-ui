import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import RepoRenderer from '@components/details/renderers/RepoRenderer';
import Constants from '@components/tools/Constants';
import ExternalManager from '@utils/extMgr';
import { resolveGridTheme } from '@utils/table/grid-theme';
import { formatUtcTimestamp } from '@utils/dateUtils';
import ElIcon from '@components/icons/ElIcon';

function BelongsToRenderer(params) {
  const { data } = params;
  return (
    <>
      {data.element_klass?.label}
      &nbsp;
      <ElIcon iconName={data.element_klass?.icon_name} />
    </>
  );
}

function RepoGridSg({ fnApi }) {
  const { themeProps, wrapperClassName } = resolveGridTheme('QUARTZ');
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultColDef = useMemo(
    () => ({
      minWidth: 100,
      flex: 1,
    }),
    [],
  );

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
    {
      headerName: 'Released at',
      field: 'released_at',
      flex: 2,
      // Format at render time only: the raw ISO value stays in the row so sorting is chronological.
      valueFormatter: (p) => formatUtcTimestamp(p.value),
    },
    { headerName: 'Identifier', field: 'identifier' },
  ];

  return (
    <div
      className={wrapperClassName}
      style={{ height: '600px', width: '100%', overflow: 'auto' }}
    >
      <AgGridReact
        {...themeProps}
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
}

RepoGridSg.propTypes = {
  fnApi: PropTypes.func.isRequired,
};

export default RepoGridSg;
