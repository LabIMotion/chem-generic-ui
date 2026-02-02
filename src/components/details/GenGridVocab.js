/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import GenGrid from '@components/details/GenGrid';

const GenGridVocab = props => {
  const { gridData, pageSize, theme } = props;
  const columnDefs = [
    {
      hide: true,
      headerName: '#',
      valueFormatter: params => `${parseInt(params.node.id, 10) + 1}`,
      sortable: false,
    },
    { headerName: 'Field Type', field: 'field_type' },
    { headerName: 'Label', field: 'label' },
    { headerName: 'name', field: 'name' },
    { headerName: 'term_id', field: 'term_id' },
    { headerName: 'source', field: 'source' },
  ];

  return (
    <GenGrid
      columnDefs={columnDefs}
      gridData={gridData}
      pageSize={pageSize}
      theme={theme}
    />
  );
};

GenGridVocab.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridVocab.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGridVocab;
