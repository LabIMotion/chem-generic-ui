/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from './renderers/ActionRenderer';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';
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

const GenGridSg = (props) => {
  const {
    gridData,
    klasses,
    pageSize,
    theme,
    fnCopyKlass,
    fnDeleteKlass,
    fnEditKlass,
    fnDeActivateKlass,
    fnDownloadKlass,
    genericType,
    fnShowProp,
  } = props;

  const columnDefs = useMemo(
    () => [
      {
        hide: true,
        headerName: '#',
        valueFormatter: (params) => `${parseInt(params.node.id, 10) + 1}`,
        sortable: false,
      },
      {
        headerName: 'Action',
        cellRenderer: ActionRenderer,
        cellRendererParams: {
          fnCopy: fnCopyKlass,
          fnDelete: fnDeleteKlass,
          fnEdit: fnEditKlass,
          fnDownload: fnDownloadKlass,
          genericType,
          klasses,
        },
        sortable: false,
      },
      {
        headerName: 'Active',
        field: 'is_active',
        width: 100,
        cellRenderer: ActiveRenderer,
        cellRendererParams: { fnDeActivate: fnDeActivateKlass },
      },
      { headerName: 'Segment label', field: 'label' },
      { headerName: 'Description', field: 'desc', flex: 1 },
      {
        headerName: 'Belongs to',
        field: 'element_klass.name',
        width: 100,
        cellRenderer: BelongsToRenderer,
      },
      {
        headerName: 'Template',
        cellRenderer: TemplateRenderer,
        width: 100,
        cellRendererParams: { fnShow: fnShowProp },
        sortable: false,
      },
      { headerName: 'Version', field: 'version', width: 100 },
      { headerName: 'Released at', field: 'released_at' },
      { headerName: 'Updated at', field: 'updated_at' },
      { headerName: 'Id', field: 'uuid' },
      { headerName: 'Sync Time', field: 'sync_time' },
    ],
    [
      fnCopyKlass,
      fnDeleteKlass,
      fnEditKlass,
      fnDownloadKlass,
      fnDeActivateKlass,
      fnShowProp,
      genericType,
      klasses,
    ]
  );

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
  fnDownloadKlass: PropTypes.func.isRequired,
  fnDeleteKlass: PropTypes.func.isRequired,
  fnEditKlass: PropTypes.func.isRequired,
  genericType: PropTypes.string.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  // fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridSg.defaultProps = {
  pageSize: 10,
  theme: Constants.GRID_THEME.BALHAM.VALUE,
};

export default GenGridSg;
