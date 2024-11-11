/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from './renderers/ActionRenderer';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';
import Constants from '../tools/Constants';

const IconRenderer = (params) => {
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
    fnDownloadKlass,
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
      {
        field: 'name',
      },
      { headerName: 'Prefix', field: 'klass_prefix', width: 100 },
      { headerName: 'Element label', field: 'label' },
      {
        headerName: 'Icon',
        field: 'icon_name',
        width: 100,
        sortable: false,
        cellRenderer: IconRenderer,
      },
      { headerName: 'Description', field: 'desc', width: 150 },
      {
        headerName: 'Template',
        cellRenderer: TemplateRenderer,
        width: 100,
        cellRendererParams: { fnShow: fnShowProp }, // , fnShowJson: fnShowPropJson
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

GenGridEl.propTypes = {
  gridData: PropTypes.array.isRequired,
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

GenGridEl.defaultProps = {
  pageSize: 10,
  theme: Constants.GRID_THEME.BALHAM.VALUE,
};

export default GenGridEl;
