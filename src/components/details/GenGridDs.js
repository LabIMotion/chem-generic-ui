/* eslint-disable react/forbid-prop-types */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ActiveRenderer from '@components/details/renderers/ActiveRenderer';
import InfoRenderer from '@components/details/renderers/InfoRenderer';
import TemplateRenderer from '@components/details/renderers/TemplateRenderer';
import GenGrid from '@components/details/GenGrid';
import Constants from '@components/tools/Constants';

const GTYPE = Constants.GENERIC_TYPES.DATASET;

const GenGridDs = (props) => {
  const { gridData, pageSize, theme, fnDeActivateKlass, fnShowProp, rowSelected, filterText, onSetAutoHeight, onClearSelection } = props;
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
      {
        headerName: 'Ver. Info.',
        cellRenderer: InfoRenderer,
        width: 100,
        cellRendererParams: { genericType: GTYPE },
        sortable: false,
      },
    ],
    [fnDeActivateKlass, fnShowProp]
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

GenGridDs.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  // fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
  filterText: PropTypes.string,
  rowSelected: PropTypes.bool,
  onSetAutoHeight: PropTypes.func,
  onClearSelection: PropTypes.func,
};

GenGridDs.defaultProps = {
  pageSize: 10,
  theme: Constants.GRID_THEME.QUARTZ.VALUE,
};

export default GenGridDs;
