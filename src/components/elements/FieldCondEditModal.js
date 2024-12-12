/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { Button, ButtonGroup, Modal, ToggleButton } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import { condOperatorOptions } from 'generic-ui-core';
import LayerSelect from './LayerSelect';
import FieldSelect from './FieldSelect';
import GenericSubField from '../models/GenericSubField';
import FIcons from '../icons/FIcons';

const AddRowBtn = ({ addRow }) => (
  <Button onClick={() => addRow()} className="btn-gxs" variant="primary">
    {FIcons.faPlus}
  </Button>
);

AddRowBtn.propTypes = { addRow: PropTypes.func.isRequired };

const DelRowBtn = ({ delRow, node }) => {
  const { data } = node;
  const btnClick = () => {
    delRow(data);
  };
  return (
    <Button onClick={btnClick} className="btn-gxs" variant="danger">
      {FIcons.faTrashCan}
    </Button>
  );
};

DelRowBtn.propTypes = {
  delRow: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
};

export default class FieldCondEditModal extends Component {
  constructor(props) {
    super(props);

    this.autoSizeAll = this.autoSizeAll.bind(this);
    this.getColumnDefs = this.getColumnDefs.bind(this);
    this.onGridReady = this.onGridReady.bind(this);
    this.delRow = this.delRow.bind(this);
    this.addRow = this.addRow.bind(this);
    this.selLayer = this.selLayer.bind(this);
    this.selField = this.selField.bind(this);
    this.refresh = this.refresh.bind(this);
    this.onCellValueChanged = this.onCellValueChanged.bind(this);
    this.onOpChanged = this.onOpChanged.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.gridApi) {
      const { allLayers, field, layer } = this.props;
      const condOperator =
        (field == null ? layer.cond_operator : field.cond_operator) ?? 1;

      const { field: preField, layer: preLayer } = prevProps;
      const condOperatorPre =
        (preField == null ? preLayer.cond_operator : preField.cond_operator) ??
        1;

      if (condOperator !== condOperatorPre && field !== null) {
        const columnDefs = this.getColumnDefs(allLayers, condOperator, field);
        this.gridApi.setGridOption('columnDefs', columnDefs);
        this.autoSizeAll();
      }
    }
  }

  onGridReady(e) {
    const { allLayers, field, layer } = this.props;
    const condOperator =
      (field == null ? layer.cond_operator : field.cond_operator) ?? 1;
    this.gridApi = e.api;
    this.gridColumnApi = e.columnApi;
    const columnDefs = this.getColumnDefs(allLayers, condOperator, field);
    this.gridApi.setGridOption('columnDefs', columnDefs);
    this.autoSizeAll();
  }

  getColumnDefs(allLayers, condOperator, field) {
    const columnDefs = [
      {
        rowDrag: true,
        resizable: true,
        headerName: 'Id',
        field: 'id',
        editable: false,
        minWidth: 10,
        width: 10,
      },
      {
        headerName: 'Layer',
        field: 'layer',
        editable: false,
        minWidth: 120,
        width: 120,
        cellRenderer: LayerSelect,
        cellRendererParams: {
          allLayers,
          selLayer: this.selLayer,
        },
      },
      {
        headerName: 'Field',
        field: 'field',
        editable: false,
        minWidth: 120,
        width: 120,
        cellRenderer: FieldSelect,
        cellRendererParams: {
          allLayers,
          selField: this.selField,
          types: ['text', 'select', 'checkbox'],
        },
      },
      {
        headerName: 'Value',
        field: 'value',
        editable: true,
        minWidth: 120,
        width: 120,
        onCellValueChanged: this.onCellValueChanged,
      },
    ];

    const displayAsObject = {
      headerName: 'Display as',
      field: 'label',
      editable: condOperator === 1,
      minWidth: 120,
      width: 120,
      onCellValueChanged: this.onCellValueChanged,
    };

    const actionObject = {
      headerName: '',
      colId: 'actions',
      headerComponent: AddRowBtn,
      headerComponentParams: { addRow: this.addRow },
      cellRenderer: DelRowBtn,
      cellRendererParams: { delRow: this.delRow },
      editable: false,
      filter: false,
      minWidth: 35,
      width: 35,
    };

    if (field !== null) {
      columnDefs.push(displayAsObject);
    }
    columnDefs.push(actionObject);

    return columnDefs;
  }

  delRow() {
    const selectedData = this.gridApi.getSelectedRows();
    this.gridApi.applyTransaction({ remove: selectedData });
    this.refresh();
  }

  addRow() {
    const { allLayers } = this.props;
    const lys = allLayers.filter(
      (e) =>
        (e.fields || []).filter((f) =>
          ['text', 'select', 'checkbox'].includes(f.type)
        ).length > 0
    );
    const ly = (lys.length > 0 && lys[0].key) || '';
    const fd =
      ly === ''
        ? ''
        : ((allLayers.find((e) => e.key === ly) || {}).fields || []).filter(
            (e) => ['text', 'select', 'checkbox'].includes(e.type)
          )[0].field;
    const newSub = new GenericSubField({
      layer: ly,
      field: fd,
      value: '',
      label: '',
    });
    const idx = this.gridApi.getDisplayedRowCount();
    this.gridApi.applyTransaction({ add: [newSub], addIndex: idx });
    this.refresh();
  }

  autoSizeAll() {
    if (!this.gridApi) return;
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 10);
  }

  selLayer(e, node) {
    const { data } = node;
    if (e.target.value === data.layer) {
      return;
    }
    data.layer = e.target.value;
    const { allLayers } = this.props;
    const ly = data.layer;
    const fdf =
      ((allLayers.find((l) => l.key === ly) || {}).fields || []).filter((l) =>
        ['text', 'select', 'checkbox'].includes(l.type)
      ) || [];
    const fd = (fdf.length > 0 && fdf[0].field) || '';
    data.field = fd;
    const { updSub, updLayer, layer, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode((nd) => {
      rows.push(nd.data);
    });
    this.gridApi.setGridOption('rowData', rows);
    if (field == null) {
      layer.cond_fields = rows;
      updLayer(layerKey, layer, () => {});
    } else {
      field.cond_fields = rows;
      updSub(layerKey, field, () => {});
    }
  }

  selField(e, node) {
    const { data } = node;
    if (e.target.value === data.field) {
      return;
    }
    data.field = e.target.value;
    this.refresh();
  }

  refresh() {
    const { updSub, updLayer, layer, layerKey, field } = this.props;
    const rows = [];
    this.gridApi.forEachNode((nd) => {
      rows.push(nd.data);
    });

    if (field == null) {
      layer.cond_fields = rows;
      updLayer(layerKey, layer, () => {});
    } else {
      field.cond_fields = rows;
      updSub(layerKey, field, () => {});
    }
  }

  onCellValueChanged(params) {
    const { oldValue, newValue } = params;
    if (oldValue === newValue) return;
    this.refresh();
  }

  onOpChanged(e) {
    const { updSub, updLayer, layer, layerKey, field } = this.props;
    if (field == null) {
      const newLayer = cloneDeep(layer);
      newLayer.cond_operator = e;
      updLayer(layerKey, newLayer, () => {});
    } else {
      const newField = cloneDeep(field);
      newField.cond_operator = e;
      updSub(layerKey, newField, () => {});
    }
  }

  render() {
    const { showModal, fnClose, layer, layerKey, field, allLayers } =
      this.props;

    const sub = (field == null ? layer.cond_fields : field.cond_fields) || [];
    const title =
      field == null
        ? `Layer Restriction Setting [ ${layer.label}]`
        : `Field Restriction Setting [ layer: ${layer.label} ] [ field: ${field.label} ]`;
    const lafi =
      field == null
        ? `layer:${layer.label}`
        : `field:${field.label}(in layer:${layer.label})`;

    const defaultCondOperator =
      (field == null ? layer.cond_operator : field.cond_operator) ?? 1;

    if (showModal) {
      return (
        <Modal
          centered
          backdrop="static"
          dialogClassName="gu_modal-68w"
          show={showModal}
          onHide={() => fnClose()}
        >
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ overflow: 'auto' }}>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                marginBottom: '4px',
              }}
            >
              <div style={{ flex: '1', fontSize: '10px' }}>
                <b>Restriction: </b>
                When a restriction is set, the {lafi} is hidden and will be only
                displayed when the [Layer,Field,Value] criteria are met.{' '}
                <b>Match </b>[One of them], [All of them], or [None of them].
                <br />
                <b>Restriction on Field: </b>When a restriction is set to `Match
                One`, an alternative display name can be set for the field via
                `Display as`. Please note that `Display as` is only effective
                when a restriction is `Match One`.
                <br />
                <b>available field type: </b>
                Checkbox (true/false), Select, Text
              </div>
              <div>
                <ButtonGroup>
                  {condOperatorOptions.map((radio, idx) => (
                    <ToggleButton
                      // eslint-disable-next-line react/no-array-index-key
                      key={idx}
                      id={`radio-${idx}`}
                      type="radio"
                      variant={
                        defaultCondOperator === radio.value
                          ? 'success'
                          : 'light'
                      }
                      name="radio"
                      value={radio.value}
                      checked={defaultCondOperator === radio.value}
                      onChange={(e) =>
                        this.onOpChanged(parseInt(e.currentTarget.value, 10))
                      }
                    >
                      {radio.label}
                    </ToggleButton>
                  ))}
                </ButtonGroup>
              </div>
            </div>
            <div style={{ width: '100%', height: '26vh' }}>
              <div
                style={{ width: '100%', height: '100%' }}
                className="ag-theme-balham"
              >
                <AgGridReact
                  defaultColDef={{ suppressMovable: true, resizable: true }}
                  rowSelection={{
                    mode: 'singleRow',
                    checkboxes: false,
                    enableClickSelection: true,
                  }}
                  onGridReady={this.onGridReady}
                  rowData={sub}
                  singleClickEdit
                  stopEditingWhenCellsLoseFocus
                  rowDragManaged
                  onRowDragEnd={this.refresh}
                />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      );
    }
    return null;
  }
}

FieldCondEditModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  layer: PropTypes.object.isRequired,
  allLayers: PropTypes.arrayOf(PropTypes.object),
  layerKey: PropTypes.string.isRequired,
  updSub: PropTypes.func.isRequired,
  updLayer: PropTypes.func.isRequired,
  field: PropTypes.object,
  fnClose: PropTypes.func.isRequired,
};
// AG Grid: since v25.2.2, the grid property `stopEditingWhenGridLosesFocus` has been replaced by `stopEditingWhenCellsLoseFocus`.
// https://www.ag-grid.com/changelog/?fixVersion=27.0.0
