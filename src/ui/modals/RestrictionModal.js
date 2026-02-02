import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import {
  Button,
  ButtonGroup,
  Modal,
  ToggleButton,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import { condOperatorOptions, FieldTypes } from 'generic-ui-core';
import LayerSelect from '@components/elements/LayerSelect';
import FieldSelect from '@components/elements/FieldSelect';
import GenericSubField from '@components/models/GenericSubField';
import { AddRowBtn, DelRowBtn } from '@components/table/GridBtn';
import Constants from '@components/tools/Constants';
import DocuConst from '@components/tools/DocuConst';
import FIcons from '@components/icons/FIcons';
import {
  labRowSelection,
  labDefaultColDef,
  labAutoSizeStrategy,
} from '@utils/table/grid-config';

const TP_ALLOW = [
  FieldTypes.F_CHECKBOX,
  FieldTypes.F_SELECT,
  FieldTypes.F_TEXT,
];

function getRowData(field, layer) {
  return (field == null ? layer.cond_fields : field.cond_fields) || [];
}

function getDesc(field, layer) {
  return field === null ? (
    <>
      <b>Layer: {layer.label}</b> is hidden until the [Layer, Field, Value]
      criteria are met.
    </>
  ) : (
    <>
      <b>Field: {field.label}</b> (in <b>Layer: {layer.label}</b>) is hidden
      until the [Layer, Field, Value] criteria are met.
    </>
  );
}

function getDescAddition(field) {
  return (
    field && (
      <>
        If [Match One] is set, an alternative name can be assigned via{' '}
        <b>Display as</b>
        (only works with Match One).
        <br />
      </>
    )
  );
}

function getTitle(field, layer) {
  return field == null
    ? `Layer Restriction Setting [ ${layer.label} ]`
    : `Field Restriction Setting [ field: ${field.label} ] in [ layer: ${layer.label} ] `;
}

function RestrictionModal(props) {
  const {
    showModal,
    fnClose,
    layer,
    layerKey,
    field,
    allLayers,
    updSub,
    updLayer,
  } = props;

  const gridRef = useRef(null);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState(getRowData(field, layer));
  const [columnsReady, setColumnsReady] = useState(false);
  const [gridReady, setGridReady] = useState(false);

  const defaultColDef = useMemo(() => labDefaultColDef, []);
  const autoSizeStrategy = useMemo(() => labAutoSizeStrategy, []);
  const defaultCondOperator = useMemo(
    () => (field == null ? layer.cond_operator : field.cond_operator) ?? 1,
    [field, layer],
    [],
  );

  const onGridReady = useCallback(() => {
    setGridReady(true);
  }, []);

  const collectGridData = useCallback(() => {
    const rows = [];
    if (gridRef.current?.api) {
      gridRef.current.api.forEachNode((nd) => {
        rows.push({ ...nd.data });
      });
    }
    return rows;
  }, []);

  const update = useCallback(
    (target, value) => {
      if (field == null) {
        const newLayer = cloneDeep(layer);
        newLayer[target] = value;
        updLayer(layerKey, newLayer);
      } else {
        const newField = cloneDeep(field);
        newField[target] = value;
        updSub(layerKey, newField);
      }
    },
    [field, layer],
  );

  const addRow = useCallback(() => {
    try {
      const lys = allLayers.filter(
        (e) =>
          (e.fields || []).filter((f) => TP_ALLOW.includes(f.type)).length > 0,
      );

      const ly = (lys.length > 0 && lys[0].key) || '';
      const fd =
        ly === ''
          ? ''
          : ((allLayers.find((e) => e.key === ly) || {}).fields || []).filter(
              (e) => TP_ALLOW.includes(e.type),
            )[0]?.field || '';

      const newSub = new GenericSubField({
        layer: ly,
        field: fd,
        value: '',
        label: '',
      });

      const idx = gridRef.current.api.getDisplayedRowCount();

      const res = gridRef.current.api.applyTransaction({
        add: [newSub],
        addIndex: idx,
      });

      if (res && res.add) {
        const rows = collectGridData();
        update('cond_fields', rows);
      }
    } catch (error) {
      console.error('Error adding row:', error);
    }
  }, [allLayers, update]);

  const delRow = useCallback(() => {
    try {
      const selectedData = gridRef.current.api.getSelectedRows();
      if (selectedData?.length > 0) {
        const res = gridRef.current.api.applyTransaction({
          remove: selectedData,
        });
        if (res && res.remove) {
          const rows = collectGridData();
          update('cond_fields', rows);
        }
      }
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  }, [update]);

  const onCellValueChanged = useCallback(
    (params) => {
      const { oldValue, newValue } = params;
      if (oldValue === newValue) return;

      params.node.setDataValue(params.column.colId, newValue);
      const rows = collectGridData();
      update('cond_fields', rows);
    },
    [update],
  );

  const selLayer = useCallback(
    (e, node) => {
      const { data } = node;
      if (e.target.value === data.layer) {
        return;
      }

      try {
        const updatedData = { ...data };

        updatedData.layer = e.target.value;
        const ly = updatedData.layer;
        const fdf =
          ((allLayers.find((l) => l.key === ly) || {}).fields || []).filter(
            (l) => TP_ALLOW.includes(l.type),
          ) || [];
        updatedData.field = (fdf.length > 0 && fdf[0].field) || '';

        node.setData(updatedData);

        const rows = collectGridData();
        update('cond_fields', rows);
      } catch (error) {
        console.error('Error selecting layer:', error);
      }
    },
    [allLayers, update],
  );

  const selField = useCallback(
    (e, node) => {
      const { data } = node;
      if (e.target.value === data.field) {
        return;
      }

      try {
        const updatedData = { ...data };
        updatedData.field = e.target.value;

        node.setData(updatedData);

        const rows = collectGridData();
        update('cond_fields', rows);
      } catch (error) {
        console.error('Error selecting field:', error);
      }
    },
    [update],
  );

  const buildColumnDefs = useCallback(() => {
    const condOperator =
      (field == null ? layer.cond_operator : field.cond_operator) ?? 1;

    const colDefs = [
      {
        colId: 'id',
        pinned: 'left',
        rowDrag: true,
        resizable: true,
        headerName: 'Id',
        field: 'id',
        editable: false,
        minWidth: 60,
        width: 60,
        sortable: false,
      },
      {
        headerName: 'Layer',
        field: 'layer',
        editable: false,
        minWidth: 120,
        width: 200,
        sortable: false,
        filter: false,
        enableCellChangeFlash: false,
        cellRenderer: LayerSelect,
        cellRendererParams: {
          allLayers,
          selLayer,
        },
      },
      {
        headerName: 'Field',
        field: 'field',
        editable: false,
        minWidth: 120,
        width: 200,
        sortable: false,
        filter: false,
        enableCellChangeFlash: false,
        cellRenderer: FieldSelect,
        cellRendererParams: {
          allLayers,
          selField,
          types: TP_ALLOW,
        },
      },
      {
        headerName: 'Value',
        field: 'value',
        editable: true,
        minWidth: 120,
        width: 120,
        onCellValueChanged,
        sortable: false,
        filter: false,
      },
    ];

    if (field !== null) {
      colDefs.push({
        headerName: 'Display as',
        field: 'label',
        editable: condOperator === 1,
        minWidth: 120,
        width: 120,
        onCellValueChanged,
        sortable: false,
        filter: false,
      });
    }

    colDefs.push({
      headerName: '',
      colId: 'actions',
      headerComponent: AddRowBtn,
      headerComponentParams: { addRow },
      cellRenderer: DelRowBtn,
      cellRendererParams: { delRow },
      editable: false,
      filter: false,
      sortable: false,
      minWidth: 60,
      width: 60,
      resizable: false,
    });

    return colDefs;
  }, [allLayers, layer, field]);

  const onOpChanged = useCallback(
    (e) => {
      try {
        const operatorValue = parseInt(e, 10);
        update('cond_operator', operatorValue);
      } catch (error) {
        console.error('Error changing operator:', error);
      }
    },
    [update],
  );

  const onRowDragEnd = useCallback(() => {
    try {
      const rows = collectGridData();
      update('cond_fields', rows);
    } catch (error) {
      console.error('Error handling row drag:', error);
    }
  }, [update]);

  useEffect(() => {
    if (!gridReady) return;
    if (columnsReady) return;

    const columnState = gridRef.current.api.getColumnState();
    setColumnDefs(buildColumnDefs());

    setTimeout(() => {
      gridRef.current.api.applyColumnState({
        state: columnState,
        applyOrder: true,
      });
      setColumnsReady(true);
    }, 0);
  }, [gridReady, field, layer, buildColumnDefs]);

  useEffect(() => {
    if (columnsReady) {
      setRowData(getRowData(field, layer));
    }
  }, [columnsReady, field, layer]);

  if (!showModal) {
    return null;
  }

  return (
    <Modal
      centered
      backdrop="static"
      dialogClassName="gu_modal-68w"
      show={showModal}
      onHide={() => fnClose()}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {getTitle(field, layer)}
          <OverlayTrigger
            delayShow={1000}
            placement="top"
            overlay={
              <Tooltip id="_rs_docsite_tooltip">
                What is Restriction Setting?
              </Tooltip>
            }
          >
            <Button
              title="What is Restriction Setting?"
              variant="link"
              href={[
                DocuConst.DOC_SITE,
                'designer',
                'components',
                'layers',
                'restriction-setting',
              ].join('/')}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
            >
              {FIcons.faCircleQuestion}
            </Button>
          </OverlayTrigger>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflow: 'auto' }}>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            marginBottom: '4px',
          }}
        >
          <div className="text-primary" style={{ flex: '1' }}>
            {getDesc(field, layer)}
            <br />
            Restriction can be [ Match One ], [ Match All ], or [ Match None ].
            <br />
            {getDescAddition(field)}
            Available field types: Checkbox (true/false), Select, Text.
          </div>
          <div>
            <ButtonGroup>
              {condOperatorOptions.map((radio, idx) => (
                <ToggleButton
                  key={`radio-op-${idx}`}
                  id={`radio-${idx}`}
                  type="radio"
                  variant={
                    defaultCondOperator === radio.value ? 'success' : 'light'
                  }
                  name="radio"
                  value={radio.value}
                  checked={defaultCondOperator === radio.value}
                  onChange={(e) => onOpChanged(e.currentTarget.value)}
                >
                  {radio.label}
                </ToggleButton>
              ))}
            </ButtonGroup>
            <OverlayTrigger
              delayShow={1000}
              placement="top"
              overlay={
                <Tooltip id="_match_docsite_tooltip">
                  What is Match One, Match All, Match None?
                </Tooltip>
              }
            >
              <Button
                title="What is Match One, Match All, Match None?"
                variant="link"
                href={[
                  DocuConst.DOC_SITE,
                  '/designer',
                  '/component',
                  '/layers',
                  '/restriction-setting',
                  '#match-condition',
                ].join('')}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                {FIcons.faCircleQuestion}
              </Button>
            </OverlayTrigger>
          </div>
        </div>
        <div style={{ width: '100%', height: '40vh' }}>
          <div
            style={{ width: '100%', height: '100%' }}
            className={Constants.GRID_THEME.QUARTZ.VALUE}
          >
            <AgGridReact
              ref={gridRef}
              defaultColDef={defaultColDef}
              rowSelection={labRowSelection}
              onGridReady={onGridReady}
              rowData={rowData}
              columnDefs={columnDefs}
              singleClickEdit
              stopEditingWhenCellsLoseFocus
              rowDragManaged
              onRowDragEnd={onRowDragEnd}
              getRowId={(params) => params.data.id}
              suppressScrollOnNewData
              suppressPropertyNamesCheck
              suppressCellFocus={false}
              debounceVerticalScrollbar
              animateRows={false}
              enableCellTextSelection
              suppressColumnVirtualisation
              suppressRowVirtualisation={false}
              autoSizeStrategy={autoSizeStrategy}
            />
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

RestrictionModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  layer: PropTypes.object.isRequired,
  allLayers: PropTypes.arrayOf(PropTypes.object),
  layerKey: PropTypes.string.isRequired,
  updSub: PropTypes.func.isRequired,
  updLayer: PropTypes.func.isRequired,
  field: PropTypes.object,
  fnClose: PropTypes.func.isRequired,
};

RestrictionModal.defaultProps = {
  allLayers: [],
  field: null,
};

export default React.memo(RestrictionModal);
