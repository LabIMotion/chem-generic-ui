/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import RepoRenderer from '../details/renderers/RepoRenderer';
import GenGrid from '../details/GenGrid';
import Constants from '../tools/Constants';

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

const RepoGridSg = props => {
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
      headerName: 'Label',
      field: 'label',
      minWidth: 180,
      flex: 3,
    },
    {
      headerName: 'Belongs to',
      field: 'element_klass.name',
      minWidth: 120,
      cellRenderer: BelongsToRenderer,
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

RepoGridSg.propTypes = {
  fnApi: PropTypes.func.isRequired,
  gridData: PropTypes.array.isRequired,
};

export default RepoGridSg;
