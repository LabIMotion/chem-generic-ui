/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';

const GenGridDs = (props) => {
  const {
    gridData,
    pageSize,
    theme,
    fnDeActivateKlass,
    fnShowProp,
    fnShowPropJson
  } = props;
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
      cellRenderer: ActiveRenderer,
      cellRendererParams: { fnDeActivate: fnDeActivateKlass },
    },
    {
      headerName: 'Chemical Methods Ontology', field: 'label', minWidth: 350, flex: 3
    },
    {
      headerName: 'Template',
      cellRenderer: TemplateRenderer,
      cellRendererParams: { fnShow: fnShowProp, fnShowJson: fnShowPropJson },
      sortable: false,
      filter: false,
    },
    { headerName: 'Released at', field: 'released_at' },
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
  fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridDs.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGridDs;
