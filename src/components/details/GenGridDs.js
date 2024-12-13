/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ActiveRenderer from './renderers/ActiveRenderer';
import TemplateRenderer from './renderers/TemplateRenderer';
import GenGrid from './GenGrid';
import Constants from '../tools/Constants';

const GenGridDs = (props) => {
  const { gridData, pageSize, theme, fnDeActivateKlass, fnShowProp } = props;
  const columnDefs = useMemo(
    () => [
      {
        hide: true,
        headerName: '#',
        valueFormatter: (params) => `${parseInt(params.node.id, 10) + 1}`,
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
        headerName: 'Chemical Methods Ontology',
        field: 'label',
        flex: 1,
      },
      {
        headerName: 'Template',
        cellRenderer: TemplateRenderer,
        width: 100,
        cellRendererParams: { fnShow: fnShowProp }, // fnShowJson: fnShowPropJson
        sortable: false,
      },
      { headerName: 'Version', field: 'version', width: 100 },
      { headerName: 'Released at', field: 'released_at' },
      { headerName: 'Updated at', field: 'updated_at' },
      { headerName: 'Id', field: 'uuid' },
      { headerName: 'Sync Time', field: 'sync_time' },
    ],
    [fnDeActivateKlass, fnShowProp]
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

GenGridDs.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  // fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridDs.defaultProps = {
  pageSize: 10,
  theme: Constants.GRID_THEME.BALHAM.VALUE,
};

export default GenGridDs;
