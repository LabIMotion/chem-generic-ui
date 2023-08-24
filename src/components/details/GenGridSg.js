/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from './renderers/ActionRenderer';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';

const BelongsToRenderer = params => {
  const { data } = params;
  return (
    <>
      {data.element_klass?.label}
      &nbsp;
      <i className={data.element_klass?.icon_name} aria-hidden="true" />
    </>
  );
};

const GenGridSg = props => {
  const {
    gridData,
    klasses,
    pageSize,
    theme,
    fnCopyKlass,
    fnDeleteKlass,
    fnEditKlass,
    fnDeActivateKlass,
    genericType,
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
        klasses,
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
    { headerName: 'Segment label', field: 'label' },
    { headerName: 'Description', field: 'desc' },
    {
      headerName: 'Belongs to',
      field: 'element_klass.name',
      minWidth: 50,
      cellRenderer: BelongsToRenderer,
    },
    {
      headerName: 'Template',
      minWidth: 50,
      cellRenderer: TemplateRenderer,
      cellRendererParams: { fnShow: fnShowProp }, // ,fnShowJson: fnShowPropJson
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

GenGridSg.propTypes = {
  gridData: PropTypes.array.isRequired,
  klasses: PropTypes.array.isRequired,
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

GenGridSg.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGridSg;
