/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import RepoRenderer from '../details/renderers/RepoRenderer';
import GenGrid from '../details/GenGrid';
import Constants from '../tools/Constants';

const RepoGridDs = props => {
  const { fnApi, gridData } = props;
  const columnDefs = [
    {
      hide: true,
      headerName: '#',
      valueFormatter: params => `${parseInt(params.node.id, 10) + 1}`,
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
    <GenGrid
      columnDefs={columnDefs}
      gridData={gridData}
      pageSize={Constants.GRID_THEME.BALHAM.PAGE_SIZE}
      theme={Constants.GRID_THEME.BALHAM.VALUE}
    />
  );
};

RepoGridDs.propTypes = {
  fnApi: PropTypes.func.isRequired,
  gridData: PropTypes.array.isRequired,
};

export default RepoGridDs;
