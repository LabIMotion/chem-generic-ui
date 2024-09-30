/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  Modal,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from 'react-bootstrap';
import { cloneDeep } from 'lodash';
import LayerSelect from './LayerSelect';
import FieldSelect from './FieldSelect';
import GenericSubField from '../models/GenericSubField';
import VocabularyRenderer from '../details/renderers/VocabularyRenderer';

export default class VocabularyListModal extends Component {
  constructor(props) {
    super(props);

    this.autoSizeAll = this.autoSizeAll.bind(this);
    this.getColumnDefs = this.getColumnDefs.bind(this);
    this.onGridReady = this.onGridReady.bind(this);
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
        this.gridApi.setColumnDefs(columnDefs);
        this.autoSizeAll();
      }
    }
  }

  onGridReady(e) {
    const { allLayers, field, layer, vocabularies, fnApi } = this.props;
    const condOperator =
      (field == null ? layer.cond_operator : field.cond_operator) ?? 1;
    this.gridApi = e.api;
    this.gridColumnApi = e.columnApi;
    const columnDefs = this.getColumnDefs(
      vocabularies,
      allLayers,
      condOperator,
      field,
      fnApi
    );
    this.gridApi.setGridOption('columnDefs', columnDefs);
    this.autoSizeAll();
  }

  getColumnDefs(vocabularies, allLayers, condOperator, field, fnApi) {
    const columnDefs = [
      {
        headerName: 'Action',
        cellRenderer: VocabularyRenderer,
        cellRendererParams: { fnApi },
        minWidth: 60,
        width: 60,
      },
      {
        headerName: 'name',
        field: 'name',
        minWidth: 80,
        width: 80,
      },
      {
        headerName: 'label',
        field: 'label',
        minWidth: 80,
        width: 80,
      },
      {
        headerName: 'source',
        field: 'source',
        editable: false,
        minWidth: 60,
        width: 60,
      },
      {
        headerName: 'field_type',
        field: 'field_type',
        minWidth: 60,
        width: 60,
      },
      {
        headerName: 'Layer',
        field: 'layer_id',
        minWidth: 80,
        width: 80,
      },
      {
        headerName: 'Field',
        field: 'field_id',
        minWidth: 80,
        width: 80,
      },
    ];

    return columnDefs;
  }

  autoSizeAll() {
    if (!this.gridApi) return;
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 10);
  }

  render() {
    const {
      showModal,
      fnClose,
      layer,
      layerKey,
      field,
      allLayers,
      vocabularies,
    } = this.props;

    const sub = vocabularies || [];
    const title =
      field == null
        ? `LabIMotion Vocabulary List [ ${layer.label}]`
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
          backdrop="static"
          bsSize="large"
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
            ></div>
            <div style={{ width: '100%', height: '26vh' }}>
              <div
                style={{ width: '100%', height: '100%' }}
                className="ag-theme-balham"
              >
                <AgGridReact
                  defaultColDef={{ suppressMovable: true, resizable: true }}
                  rowSelection="single"
                  onGridReady={this.onGridReady}
                  rowData={sub}
                  stopEditingWhenCellsLoseFocus
                  rowDragManaged
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

VocabularyListModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  layer: PropTypes.object.isRequired,
  allLayers: PropTypes.arrayOf(PropTypes.object),
  layerKey: PropTypes.string.isRequired,
  updSub: PropTypes.func.isRequired,
  updLayer: PropTypes.func.isRequired,
  field: PropTypes.object,
  fnApi: PropTypes.func.isRequired,
  fnClose: PropTypes.func.isRequired,
  vocabularies: PropTypes.array,
};

VocabularyListModal.defaultProps = { vocabularies: [] };

// AG Grid: since v25.2.2, the grid property `stopEditingWhenGridLosesFocus` has been replaced by `stopEditingWhenCellsLoseFocus`.
// https://www.ag-grid.com/changelog/?fixVersion=27.0.0
