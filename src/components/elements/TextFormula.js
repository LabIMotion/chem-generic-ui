/* eslint-disable react/forbid-prop-types */
import { AgGridReact } from 'ag-grid-react';
import PropTypes from 'prop-types';
import React from 'react';
import { FieldTypes } from 'generic-ui-core';
import GenericSubField from '@components/models/GenericSubField';
import { AddRowBtn, DelRowBtn } from '@components/table/GridBtn';
import LayerSelect from '@components/elements/LayerSelect';
import FieldSelect from '@components/elements/FieldSelect';
import Constants from '@components/tools/Constants';

export default class TextFormula extends React.Component {
  constructor(props) {
    super(props);
    this.autoSizeAll = this.autoSizeAll.bind(this);
    this.onGridReady = this.onGridReady.bind(this);
    this.delRow = this.delRow.bind(this);
    this.addRow = this.addRow.bind(this);
    this.selLayer = this.selLayer.bind(this);
    this.selField = this.selField.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onCellValueChanged = this.onCellValueChanged.bind(this);
    this.savedColumnState = null;
  }

  componentDidUpdate(prevProps) {
    const { field, allLayers } = this.props;
    const sub = field.text_sub_fields || [];
    if (allLayers !== prevProps.allLayers && this.gridApi) {
      const columnDefs = this.gridApi.getColumnDefs();
      columnDefs.find(c => c.field === 'layer').cellRendererParams.allLayers =
        allLayers;
      columnDefs.find(c => c.field === 'field').cellRendererParams.allLayers =
        allLayers;
      this.gridApi.setGridOption('columnDefs', columnDefs);
      this.gridApi.setGridOption('rowData', sub);
    }
    // this.gridApi && this.gridApi.setRowData(sub);
  }

  // Helper method to safely get and save column state
  saveColumnState() {
    if (this.gridColumnApi && typeof this.gridColumnApi.getColumnState === 'function') {
      try {
        this.savedColumnState = this.gridColumnApi.getColumnState();
        return true;
      } catch (error) {
        console.warn('Failed to save column state:', error);
      }
    }
    return false;
  }

  // Helper method to safely restore column state
  restoreColumnState() {
    if (this.gridColumnApi && this.savedColumnState) {
      try {
        this.gridColumnApi.applyColumnState({ state: this.savedColumnState });
        return true;
      } catch (error) {
        console.warn('Failed to restore column state:', error);
      }
    }
    return false;
  }

  onGridReady(e) {
    const { allLayers } = this.props;
    this.gridApi = e.api;
    this.gridColumnApi = e.columnApi;
    const columnDefs = [
      {
        rowDrag: true,
        resizable: true,
        headerName: 'Id',
        field: 'id',
        editable: false,
        minWidth: 100,
        width: 100,
      },
      {
        headerName: 'Layer',
        field: 'layer',
        editable: false,
        minWidth: 150,
        width: 150,
        cellRenderer: LayerSelect,
        cellRendererParams: {
          allLayers,
          selLayer: this.selLayer,
        },
      },
      {
        headerName: 'Field (type: text)',
        field: 'field',
        editable: false,
        minWidth: 250,
        cellRenderer: FieldSelect,
        cellRendererParams: {
          allLayers,
          selField: this.selField,
          types: [FieldTypes.F_TEXT],
          tableText: true,
        },
      },
      {
        headerName: 'Separator',
        field: 'separator',
        editable: true,
        minWidth: 80,
        width: 80,
        onCellValueChanged: this.onCellValueChanged,
      },
      {
        headerName: '',
        colId: 'actions',
        headerComponent: AddRowBtn,
        headerComponentParams: { addRow: this.addRow },
        cellRenderer: DelRowBtn,
        cellRendererParams: { delRow: this.delRow },
        editable: false,
        filter: false,
        minWidth: 60,
        width: 60,
        suppressSizeToFit: true,
        pinned: 'left',
      },
    ];
    this.gridApi.setGridOption('columnDefs', columnDefs);
    this.autoSizeAll();
  }

  onCellValueChanged(params) {
    const { oldValue, newValue } = params;
    if (oldValue === newValue) return;
    this.saveColumnState();
    this.refresh();
  }

  delRow() {
    this.saveColumnState();
    const selectedData = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({ remove: selectedData });
    this.refresh();
  }

  addRow() {
    this.saveColumnState();
    const { allLayers } = this.props;
    const lys = allLayers.filter(
      e => (e.fields || []).filter(f => f.type === FieldTypes.F_TEXT).length > 0
    );
    const ly = (lys.length > 0 && lys[0].key) || '';
    const fd =
      ly === ''
        ? ''
        : ((allLayers.find(e => e.key === ly) || {}).fields || []).filter(
            e => e.type === FieldTypes.F_TEXT
          )[0].field;
    const newSub = new GenericSubField({
      layer: ly,
      field: fd,
      separator: '.',
    });
    const idx = this.gridApi.getDisplayedRowCount();
    this.gridApi.applyTransaction({ add: [newSub], addIndex: idx });
    this.refresh();
  }

  selLayer(e, node) {
    const { data } = node;
    if (e.target.value === data.layer) {
      return;
    }
    this.saveColumnState();
    data.layer = e.target.value;
    const { allLayers } = this.props;
    const ly = data.layer;
    const fdf =
      ((allLayers.find(l => l.key === ly) || {}).fields || []).filter(
        l => l.type === FieldTypes.F_TEXT
      ) || [];
    const fd = (fdf.length > 0 && fdf[0].field) || '';
    data.field = fd;
    const { updSub, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode(nd => {
      rows.push(nd.data);
    });
    field.text_sub_fields = rows;
    this.gridApi.setGridOption('rowData', rows);
    updSub(layerKey, field, () => {
      this.restoreColumnState();
    });
  }

  selField(e, node) {
    const { data } = node;
    if (e.target.value === data.field) {
      return;
    }
    this.saveColumnState();
    data.field = e.target.value;
    this.refresh();
  }

  refresh() {
    const { updSub, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode(nd => {
      rows.push(nd.data);
    });
    field.text_sub_fields = rows;
    updSub(layerKey, field, () => {
      if (rows.length > 0) {
        this.restoreColumnState();
      }
    });
  }

  autoSizeAll() {
    const { panelIsExpanded } = this.props;
    if (!panelIsExpanded) return;
    if (!this.gridApi) return;
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 10);
  }

  render() {
    const { field } = this.props;
    const sub = field.text_sub_fields || [];
    return (
      <div>
        <div
          style={{ width: '100%', height: '100%' }}
          className={Constants.GRID_THEME.QUARTZ.VALUE}
        >
          <AgGridReact
            enableColResize
            defaultColDef={{ suppressMovable: true }}
            rowSelection={{
              mode: 'singleRow',
              checkboxes: false,
              enableClickSelection: true,
            }}
            onGridReady={this.onGridReady}
            rowData={sub}
            singleClickEdit
            stopEditingWhenCellsLoseFocus
            domLayout="autoHeight"
            rowDragManaged
            onRowDragEnd={this.refresh}
          />
        </div>
      </div>
    );
  }
}

TextFormula.propTypes = {
  layerKey: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  updSub: PropTypes.func.isRequired,
  allLayers: PropTypes.arrayOf(PropTypes.object),
  panelIsExpanded: PropTypes.bool.isRequired,
};

TextFormula.defaultProps = { allLayers: [] };
