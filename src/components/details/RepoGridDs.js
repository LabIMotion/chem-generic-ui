/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import RepoRenderer from '@components/details/renderers/RepoRenderer';
import GenGrid from '@components/details/GenGrid';
import Constants from '@components/tools/Constants';
import { formatUtcTimestamp } from '@utils/dateUtils';

function RepoGridDs(props) {
  const { fnApi, gridData } = props;
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
      headerName: 'Chemical Methods Ontology',
      field: 'label',
      minWidth: 250,
      flex: 3,
    },
    {
      headerName: 'Released at',
      field: 'released_at',
      // Format at render time only: the raw ISO value stays in the row so sorting is chronological.
      valueFormatter: (p) => formatUtcTimestamp(p.value),
    },
    { headerName: 'Identifier', field: 'identifier' },
  ];

  return (
    <GenGrid
      columnDefs={columnDefs}
      gridData={gridData}
      pageSize={Constants.GRID_THEME.BALHAM.PAGE_SIZE}
      themeKey="BALHAM"
    />
  );
}

RepoGridDs.propTypes = {
  fnApi: PropTypes.func.isRequired,
  gridData: PropTypes.array.isRequired,
};

export default RepoGridDs;
