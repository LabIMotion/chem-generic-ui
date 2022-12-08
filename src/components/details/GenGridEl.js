/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from './renderers/ActionRenderer';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';

const IconRenderer = (params) => {
  const { value, iconStyle } = params;
  return <i className={value} aria-hidden="true" style={iconStyle || { color: 'black' }} />;
};

const GenGridEl = (props) => {
  const {
    gridData,
    pageSize,
    theme,
    fnCopyKlass,
    fnEditKlass,
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
      headerName: 'Action',
      cellRenderer: ActionRenderer,
      cellRendererParams: { fnCopy: fnCopyKlass, fnEdit: fnEditKlass },
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Active',
      field: 'is_active',
      cellRenderer: ActiveRenderer,
      cellRendererParams: { fnDeActivate: fnDeActivateKlass },
    },
    {
      field: 'name',
      minWidth: 170,
    },
    { headerName: 'Prefix', field: 'klass_prefix' },
    { headerName: 'Element label', field: 'label' },
    {
      headerName: 'Icon',
      field: 'icon_name',
      minWidth: 50,
      width: 50,
      sortable: false,
      filter: false,
      cellRenderer: IconRenderer,
    },
    { headerName: 'Description', field: 'desc' },
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

GenGridEl.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnCopyKlass: PropTypes.func.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnEditKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridEl.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGridEl;
