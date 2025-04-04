/* eslint-disable react/forbid-prop-types */
import { AgGridReact } from 'ag-grid-react';
import PropTypes from 'prop-types';
import React from 'react';
import { FieldTypes } from 'generic-ui-core';
import GenericSubField from '../models/GenericSubField';
import { AddRowBtn, DelRowBtn } from '../table/GridBtn';
import TypeSelect from './TypeSelect';
import DefinedRenderer from './DefinedRenderer';

const TP_BASE = [
  FieldTypes.F_DRAG_MOLECULE,
  FieldTypes.F_SELECT,
  FieldTypes.F_SYSTEM_DEFINED,
  FieldTypes.F_TEXT,
];
const TP_ELEMENT = TP_BASE.concat([FieldTypes.F_DRAG_SAMPLE]);
const TP_LOCKED = [
  FieldTypes.F_DRAG_MOLECULE,
  FieldTypes.F_DRAG_SAMPLE,
  FieldTypes.F_SELECT,
  FieldTypes.F_SYSTEM_DEFINED,
];

export default class TableDef extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unitConfig: props.unitsFields.map((e) => ({
        value: e.field,
        name: e.label,
        label: e.label,
      })),
    };
    this.autoSizeAll = this.autoSizeAll.bind(this);
    this.onGridReady = this.onGridReady.bind(this);
    this.delRow = this.delRow.bind(this);
    this.addRow = this.addRow.bind(this);
    this.selType = this.selType.bind(this);
    this.selDefined = this.selDefined.bind(this);
    this.chkAttr = this.chkAttr.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onCellValueChanged = this.onCellValueChanged.bind(this);
    this.onFirstDataRendered = this.onFirstDataRendered.bind(this);
    this.tblType = props.genericType === 'Element' ? TP_ELEMENT : TP_BASE;
    this.columnDefs = [
      {
        headerName: 'Id',
        field: 'id',
        editable: false,
        minWidth: 50,
        width: 50,
      },
      {
        headerName: 'Column Heading',
        field: 'col_name',
        editable: true,
        minWidth: 150,
        width: 150,
        onCellValueChanged: this.onCellValueChanged,
      },
      {
        headerName: 'Column Type',
        field: 'type',
        editable: false,
        minWidth: 150,
        width: 150,
        cellRenderer: TypeSelect,
        cellRendererParams: {
          all: this.tblType.map((e) => ({ key: e, val: e, lab: e })),
          selType: this.selType,
        },
      },
      {
        headerName: 'Default Value',
        field: 'value',
        editable: (e) => {
          if (TP_LOCKED.includes(e.data.type)) return false;
          return true;
        },
        minWidth: 350,
        cellRenderer: DefinedRenderer,
        cellRendererParams: {
          unitConfig: this.state.unitConfig,
          selDefined: this.selDefined,
          chkAttr: this.chkAttr,
          selectOptions: this.props.selectOptions,
        },
        onCellValueChanged: this.onCellValueChanged,
      },
      {
        headerName: 'Option Layers(hidden)',
        field: 'option_layers',
        width: 10,
        hide: true,
      },
      {
        headerName: 'Value System(hidden)',
        field: 'value_system',
        width: 10,
        hide: true,
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
        minWidth: 48,
        width: 48,
        suppressSizeToFit: true,
        pinned: 'left',
      },
    ];
  }

  componentDidUpdate(prevProps) {
    const { selectOptions } = this.props;
    this.autoSizeAll();
    if (prevProps.selectOptions !== selectOptions && this.gridApi) {
      const valueColumn = this.columnDefs.find((col) => col.field === 'value');
      if (valueColumn) {
        valueColumn.cellRendererParams.selectOptions = selectOptions;
        this.gridApi.setGridOption('columnDefs', this.columnDefs);
      }
    }
  }

  onGridReady(e) {
    this.gridApi = e.api;
    // this.autoSizeAll();
  }

  onCellValueChanged(params) {
    const { oldValue, newValue } = params;
    if (oldValue === newValue) return;
    this.refresh();
  }

  onFirstDataRendered = (params) => {
    const { panelIsExpanded } = this.props;
    if (!panelIsExpanded) return;
    params.api.sizeColumnsToFit();
  };

  autoSizeAll() {
    const { panelIsExpanded } = this.props;
    if (!panelIsExpanded) return;
    if (!this.gridApi) return;
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 10);
  }

  delRow() {
    const selectedData = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({ remove: selectedData });
    this.refresh();
  }

  addRow() {
    const newSub = new GenericSubField({
      col_name: '',
      type: 'text',
      value: '',
    });
    const idx = this.gridApi.getDisplayedRowCount();
    this.gridApi.applyTransaction({ add: [newSub], addIndex: idx });
    this.refresh();
  }

  selType(e, node) {
    const { data } = node;
    if (e.target.value === data.type) {
      return;
    }
    data.type = e.target.value;
    data.value = '';
    const { unitConfig } = this.state;
    const { selectOptions } = this.props;
    if (data.type === FieldTypes.F_SELECT) {
      data.option_layers = selectOptions[0] && selectOptions[0].value;
      delete data.value_system;
    } else if (data.type === FieldTypes.F_SYSTEM_DEFINED) {
      data.option_layers = (unitConfig || [])[0].value;
      data.value_system = ((
        this.props.unitsFields.find((u) => u.field === data.option_layers) || {}
      ).units || [])[0].key;
    } else {
      delete data.option_layers;
      delete data.value_system;
    }
    const { updSub, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode((nd) => {
      rows.push(nd.data);
    });
    field.sub_fields = rows;
    this.gridApi.setGridOption('rowData', rows);
    updSub(layerKey, field, () => {});
  }

  chkAttr(val, chk, node) {
    const { data } = node;
    const search = new RegExp(`${val};`, 'gi');
    if (chk) {
      data.value = data.value.concat(`${val};`);
    } else {
      data.value = data.value?.replace(search, '');
    }
    const { updSub, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode((nd) => {
      rows.push(nd.data);
    });
    field.sub_fields = rows;
    this.gridApi.setGridOption('rowData', rows);
    updSub(layerKey, field, () => {});
  }

  selDefined(e, node) {
    const { data } = node;
    if (e.target.value === data.option_layers) {
      return;
    }
    data.option_layers = e.target.value;
    if (node.data.type === FieldTypes.F_SYSTEM_DEFINED) {
      data.value_system = ((
        this.props.unitsFields.find((u) => u.field === data.option_layers) || {}
      ).units || [])[0].key;
    }
    this.refresh();
  }

  refresh() {
    const { updSub, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode((nd) => {
      rows.push(nd.data);
    });
    field.sub_fields = rows;
    updSub(layerKey, field, () => {});
  }

  render() {
    const { field } = this.props;
    const sub = field.sub_fields || [];
    return (
      <div>
        <div
          style={{ width: '100%', height: '100%' }}
          className="ag-theme-balham"
        >
          <AgGridReact
            defaultColDef={{ resizable: true }}
            enableColResize
            columnDefs={this.columnDefs}
            rowSelection={{
              mode: 'singleRow',
              checkboxes: false,
              enableClickSelection: true,
            }}
            onGridReady={this.onGridReady}
            onFirstDataRendered={this.onFirstDataRendered}
            rowData={sub}
            singleClickEdit
            stopEditingWhenCellsLoseFocus
            domLayout="autoHeight"
          />
        </div>
      </div>
    );
  }
}

TableDef.propTypes = {
  genericType: PropTypes.string.isRequired,
  layerKey: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  updSub: PropTypes.func.isRequired,
  unitsFields: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  panelIsExpanded: PropTypes.bool.isRequired,
};
