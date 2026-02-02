/* eslint-disable react/forbid-prop-types */
import { AgGridReact } from 'ag-grid-react';
import PropTypes from 'prop-types';
import React from 'react';
import { Form } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';
import GenericSubField from '@components/models/GenericSubField';
import { AddRowBtn, DelRowBtn } from '@components/table/GridBtn';
import DefinedRenderer from '@components/elements/DefinedRenderer';
import Constants from '@components/tools/Constants';

const TypeSelect = ({ selType, node }) => (
  <Form.Group size="sm" style={{ marginRight: '-10px', marginLeft: '-10px' }}>
    <Form.Control
      as="select"
      placeholder="select the type"
      onChange={(e) => selType(e, node)}
      defaultValue={node.data.type}
    >
      <option value="label">label</option>
      <option value="number">number</option>
      <option value="text">text</option>
      <option value="system-defined">System-Defined</option>
    </Form.Control>
  </Form.Group>
);

TypeSelect.propTypes = {
  selType: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
};

export default class GroupFields extends React.Component {
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
    this.refresh = this.refresh.bind(this);
    this.onCellValueChanged = this.onCellValueChanged.bind(this);
    this.columnDefs = [
      {
        rowDrag: true,
        headerName: 'Id',
        field: 'id',
        editable: false,
        minWidth: 100,
        width: 100,
      },
      {
        headerName: 'Data Type',
        field: 'type',
        editable: false,
        minWidth: 150,
        width: 150,
        cellRenderer: TypeSelect,
        cellRendererParams: { selType: this.selType },
      },
      {
        headerName: 'Default Value',
        field: 'value',
        editable: (e) => {
          if (e.data.type === FieldTypes.F_SYSTEM_DEFINED) return false;
          return true;
        },
        minWidth: 250,
        cellRenderer: DefinedRenderer,
        cellRendererParams: {
          unitConfig: this.state.unitConfig,
          selDefined: this.selDefined,
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
        minWidth: 60,
        width: 60,
        suppressSizeToFit: true,
        pinned: 'left',
      },
    ];
    this.savedColumnState = null;
  }

  componentDidUpdate() {
    this.autoSizeAll();
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
    this.gridApi = e.api;
    this.gridColumnApi = e.columnApi;
    this.autoSizeAll();
  }

  onCellValueChanged(params) {
    const { oldValue, newValue } = params;
    if (oldValue === newValue) return;
    this.saveColumnState();
    this.refresh();
  }

  autoSizeAll() {
    const { panelIsExpanded } = this.props;
    if (!panelIsExpanded) return;
    if (!this.gridApi) return;
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 10);
  }

  delRow() {
    this.saveColumnState();
    const selectedData = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({ remove: selectedData });
    this.refresh();
  }

  addRow() {
    this.saveColumnState();
    const newSub = new GenericSubField({ type: FieldTypes.F_TEXT, value: '' });
    const idx = this.gridApi.getDisplayedRowCount();
    this.gridApi.applyTransaction({ add: [newSub], addIndex: idx });
    this.refresh();
  }

  selType(e, node) {
    const { data } = node;
    if (e.target.value === data.type) {
      return;
    }
    this.saveColumnState();
    data.type = e.target.value;
    data.value = '';
    const { unitConfig } = this.state;
    if (data.type === FieldTypes.F_SYSTEM_DEFINED) {
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
    updSub(layerKey, field, () => {
      this.restoreColumnState();
    });
  }

  selDefined(e, node) {
    const { data } = node;
    if (e.target.value === data.option_layers) {
      return;
    }
    data.option_layers = e.target.value;
    data.value_system = ((
      this.props.unitsFields.find((u) => u.field === data.option_layers) || {}
    ).units || [])[0].key;
    this.saveColumnState();
    this.refresh();
  }

  refresh() {
    const { updSub, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode((nd) => {
      rows.push(nd.data);
    });
    field.sub_fields = rows;
    updSub(layerKey, field, () => {
      if (rows.length > 0) {
        this.restoreColumnState();
      }
    });
  }

  render() {
    const { field } = this.props;
    const sub = field.sub_fields || [];
    return (
      <div>
        <div
          className={Constants.GRID_THEME.QUARTZ.VALUE}
          style={{ width: '100%', height: '100%' }}
        >
          <AgGridReact
            enableColResize
            columnDefs={this.columnDefs}
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

GroupFields.propTypes = {
  layerKey: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  updSub: PropTypes.func.isRequired,
  unitsFields: PropTypes.arrayOf(PropTypes.object).isRequired,
  panelIsExpanded: PropTypes.bool.isRequired,
};
