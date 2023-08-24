/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';

const GenGridDs = props => {
  const { gridData, pageSize, theme, fnDeActivateKlass, fnShowProp } = props;
  const columnDefs = [
    {
      hide: true,
      headerName: '#',
      valueFormatter: params => `${parseInt(params.node.id, 10) + 1}`,
      sortable: false,
    },
    {
      headerName: 'Active',
      field: 'is_active',
      minWidth: 50,
      cellRenderer: ActiveRenderer,
      cellRendererParams: { fnDeActivate: fnDeActivateKlass },
    },
    {
      headerName: 'Chemical Methods Ontology',
      field: 'label',
      minWidth: 200,
      flex: 3,
    },
    {
      headerName: 'Template',
      cellRenderer: TemplateRenderer,
      minWidth: 50,
      cellRendererParams: { fnShow: fnShowProp }, // fnShowJson: fnShowPropJson
      sortable: false,
      filter: false,
    },
    { headerName: 'Version', field: 'version' },
    { headerName: 'Released at', field: 'released_at' },
    { headerName: 'Updated at', field: 'updated_at' },
    { headerName: 'Id', field: 'uuid' },
    { headerName: 'Sync Time', field: 'sync_time' },
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

GenGridDs.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  // fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridDs.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGridDs;
