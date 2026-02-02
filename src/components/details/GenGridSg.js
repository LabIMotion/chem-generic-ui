/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from '@components/details/renderers/ActionRenderer';
import ActiveRenderer from '@components/details/renderers/ActiveRenderer';
import InfoRenderer from '@components/details/renderers/InfoRenderer';
import TemplateRenderer from '@components/details/renderers/TemplateRenderer';
import GenGrid from '@components/details/GenGrid';
import Constants from '@components/tools/Constants';

const GTYPE = Constants.GENERIC_TYPES.SEGMENT;

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
    fnDeleteKlass,
    fnEditKlass,
    fnDeActivateKlass,
    fnDownloadKlass,
    fnShowProp,
    rowSelected,
    filterText,
    onSetAutoHeight,
    onClearSelection,
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
          genericType: GTYPE,
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
      { headerName: 'Segment label', field: 'label', flex: 1 },
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
      {
        headerName: 'Ver. Info.',
        cellRenderer: InfoRenderer,
        width: 100,
        cellRendererParams: { genericType: GTYPE },
        sortable: false,
      },
    ],
    [
      fnCopyKlass,
      fnDeleteKlass,
      fnEditKlass,
      fnDownloadKlass,
      fnDeActivateKlass,
      fnShowProp,
    ]
  );

  return (
    <GenGrid
      columnDefs={columnDefs}
      gridData={gridData}
      pageSize={pageSize}
      theme={theme}
      rowSelected={rowSelected}
      filterText={filterText}
      onSetAutoHeight={onSetAutoHeight}
      onClearSelection={onClearSelection}
    />
  );
};

GenGridSg.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnCopyKlass: PropTypes.func.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnDownloadKlass: PropTypes.func.isRequired,
  fnDeleteKlass: PropTypes.func.isRequired,
  fnEditKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  // fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
  filterText: PropTypes.string,
  rowSelected: PropTypes.bool,
  onSetAutoHeight: PropTypes.func,
  onClearSelection: PropTypes.func,
};

GenGridSg.defaultProps = {
  pageSize: 10,
  theme: Constants.GRID_THEME.QUARTZ.VALUE,
};

export default GenGridSg;
