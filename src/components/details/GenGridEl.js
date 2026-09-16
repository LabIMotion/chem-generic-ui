import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ActionRenderer from '@components/details/renderers/ActionRenderer';
import ActiveRenderer from '@components/details/renderers/ActiveRenderer';
import InfoRenderer from '@components/details/renderers/InfoRenderer';
import TemplateRenderer from '@components/details/renderers/TemplateRenderer';
import GenGrid from '@components/details/GenGrid';
import Constants from '@components/tools/Constants';
import ElIcon from '@components/icons/ElIcon';
import RegCellRenderer from '@components/details/renderers/RegCellRenderer';
import { listRegComps } from '@components/regComps/regCompStatusPackage';
import { useDesignerContext } from '@components/designer/DesignerContext';

const GTYPE = Constants.GENERIC_TYPES.ELEMENT;

function IconRenderer(params) {
  const { value, iconStyle } = params;
  return <ElIcon iconName={value} style={iconStyle || { color: 'black' }} />;
}

function GenGridEl(props) {
  const {
    gridData,
    pageSize,
    themeKey,
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

  const { regComp } = useDesignerContext();

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
      {
        field: 'name',
      },
      { headerName: 'Prefix', field: 'klass_prefix', width: 100 },
      { headerName: 'Element label', field: 'label', flex: 1 },
      {
        headerName: 'Icon',
        field: 'icon_name',
        width: 100,
        sortable: false,
        cellRenderer: IconRenderer,
      },
      { headerName: 'Description', field: 'desc', flex: 1 },
      {
        headerName: 'Template',
        cellRenderer: TemplateRenderer,
        width: 100,
        cellRendererParams: { fnShow: fnShowProp }, // , fnShowJson: fnShowPropJson
        sortable: false,
      },
      {
        headerName: 'Ver. Info',
        cellRenderer: InfoRenderer,
        width: 100,
        cellRendererParams: { genericType: GTYPE },
        sortable: false,
      },
      ...listRegComps(regComp).map((rc) => ({
        headerName: rc.label,
        cellRenderer: RegCellRenderer,
        cellRendererParams: { regCompName: rc.name },
        width: 100,
        sortable: false,
      })),
    ],
    [
      fnCopyKlass,
      fnDeleteKlass,
      fnEditKlass,
      fnDownloadKlass,
      fnDeActivateKlass,
      fnShowProp,
      regComp,
    ],
  );

  return (
    <GenGrid
      columnDefs={columnDefs}
      gridData={gridData}
      pageSize={pageSize}
      themeKey={themeKey}
      rowSelected={rowSelected}
      filterText={filterText}
      onSetAutoHeight={onSetAutoHeight}
      onClearSelection={onClearSelection}
    />
  );
}

GenGridEl.propTypes = {
  gridData: PropTypes.array.isRequired,
  fnCopyKlass: PropTypes.func.isRequired,
  fnDeActivateKlass: PropTypes.func.isRequired,
  fnDownloadKlass: PropTypes.func.isRequired,
  fnDeleteKlass: PropTypes.func.isRequired,
  fnEditKlass: PropTypes.func.isRequired,
  fnShowProp: PropTypes.func.isRequired,
  // fnShowPropJson: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  themeKey: PropTypes.string,
  filterText: PropTypes.string,
  rowSelected: PropTypes.bool,
  onSetAutoHeight: PropTypes.func,
  onClearSelection: PropTypes.func,
};

GenGridEl.defaultProps = {
  pageSize: 10,
  themeKey: 'QUARTZ',
};

export default GenGridEl;
