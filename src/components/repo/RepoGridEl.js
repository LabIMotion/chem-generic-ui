/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import RepoRenderer from '../details/renderers/RepoRenderer';
import GenGrid from '../details/GenGrid';
import Constants from '../tools/Constants';

const RepoGridEl = props => {
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
    }
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

RepoGridEl.propTypes = {
  fnApi: PropTypes.func.isRequired,
  gridData: PropTypes.array.isRequired,
};

export default RepoGridEl;
