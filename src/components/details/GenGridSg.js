/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from './renderers/ActionRenderer';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';

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

const GenGridSg = (props) => {
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

GenGridSg.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnCopyKlass: PropTypes.func.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnEditKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridSg.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGridSg;
