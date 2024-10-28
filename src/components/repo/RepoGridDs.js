/* eslint-disable react/forbid-prop-types */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import RepoRenderer from '../details/renderers/RepoRenderer';
import Constants from '../tools/Constants';
import ExternalManager from '../../utils/extMgr';

const RepoGridDs = ({ fnApi }) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchTemplates = async () => {
  //     const res = await ExternalManager.getAllTemplates(
  //       Constants.GENERIC_TYPES.DATASET
  //     );
  //     if (res.error) {
  //       console.error(res.error);
  //     } else {
  //       setRowData(res.element.data || []);
  //     }
  //   };
  //   fetchTemplates();
  // }, []);

  const onGridReady = useCallback(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const res = await ExternalManager.getAllTemplates(
        Constants.GENERIC_TYPES.DATASET
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
      minWidth: 60,
      cellRendererParams: { fnApi },
    },
    {
      headerName: 'Chemical Methods Ontology',
      field: 'label',
      minWidth: 200,
      flex: 3,
    },
    { headerName: 'Version', field: 'version' },
    { headerName: 'Released at', minWidth: 120, field: 'released_at' },
    { headerName: 'Identifier', minWidth: 120, field: 'identifier' },
  ];

  return (
    <div
      className={Constants.GRID_THEME.BALHAM.VALUE}
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

RepoGridDs.propTypes = {
  fnApi: PropTypes.func.isRequired,
};

export default RepoGridDs;
