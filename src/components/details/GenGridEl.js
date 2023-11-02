/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from './renderers/ActionRenderer';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';

const IconRenderer = params => {
  const { value, iconStyle } = params;
  return (
    <i
      className={value}
      aria-hidden="true"
      style={iconStyle || { color: 'black' }}
    />
  );
};

const GenGridEl = props => {
  const {
    gridData,
    pageSize,
    theme,
    fnCopyKlass,
    fnDeleteKlass,
    fnEditKlass,
    genericType,
    fnDeActivateKlass,
    fnShowProp,
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
      minWidth: 50,
      cellRendererParams: {
        fnCopy: fnCopyKlass,
        fnDelete: fnDeleteKlass,
        fnEdit: fnEditKlass,
        genericType,
      },
      sortable: false,
      filter: false,
    },
    {
      headerName: 'Active',
      field: 'is_active',
      minWidth: 50,
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
      width: 50,
      cellRendererParams: { fnShow: fnShowProp }, // , fnShowJson: fnShowPropJson
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

GenGridEl.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnCopyKlass: PropTypes.func.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnDeleteKlass: PropTypes.func.isRequired,
  fnEditKlass: PropTypes.func.isRequired,
  genericType: PropTypes.string.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  // fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridEl.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGridEl;
