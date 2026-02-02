import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import { FieldTypes } from 'generic-ui-core';
import GenericSubField from '@components/models/GenericSubField';
import { AddRowBtn, DelRowBtn } from '@components/table/GridBtn';
import { defaultVSystem, isObject } from '@components/tools/utils';
import TypeSelect from '@components/elements/TypeSelect';
import DefinedRenderer from '@components/elements/DefinedRenderer';
import Constants from '@components/tools/Constants';
import findTypeLabel from '@components/tools/field-utils';
import { labRowSelection, labDefaultColDef } from '@utils/table/grid-config';

const TP_BASE = [
  FieldTypes.F_DRAG_MOLECULE,
  FieldTypes.F_SELECT,
  FieldTypes.F_SYSTEM_DEFINED,
  FieldTypes.F_TEXT,
];
const TP_ELEMENT = sortBy(TP_BASE.concat([FieldTypes.F_DRAG_SAMPLE]));
const TP_LOCKED = [
  FieldTypes.F_DRAG_MOLECULE,
  FieldTypes.F_DRAG_SAMPLE,
  FieldTypes.F_SELECT,
  FieldTypes.F_SYSTEM_DEFINED,
];

const FieldTable = (props) => {
  const { field, genericType, layerKey, selectOptions, unitsFields, updSub } =
    props;

  const gridRef = useRef(null);

  const [columnDefs, setColumnDefs] = useState([]);
  const [columnsReady, setColumnsReady] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [types] = useState(() => {
    return TP_ELEMENT.map((e) => ({ key: e, val: e, lab: findTypeLabel(e) }));
  });
  const [unitConfig] = useState(
    unitsFields.map((e) => ({
      value: e.field,
      name: e.label,
      label: e.label,
    })),
  );

  const defaultColDef = useMemo(() => labDefaultColDef, []);

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
    (value) => {
      const newField = cloneDeep(field);
      if (!value || value.length === 0) {
        newField.sub_fields = [];
        delete newField.sub_values;
        updSub(layerKey, newField);
        return;
      }

      newField.sub_fields = value;

      if (!newField.sub_values?.length) {
        updSub(layerKey, newField);
        return;
      }

      // Create a Set of valid field IDs for efficient lookup
      const validFieldIds = new Set(value.map((sf) => sf.id).filter(Boolean));

      // Clean up sub_values: remove entries that don't have corresponding sub_fields
      newField.sub_values = newField.sub_values.map((sv) => {
        const cleanedSv = {};
        // Preserve id if it exists in the current data
        if (sv.id) {
          cleanedSv.id = sv.id;
        } else {
          // Generate new ID if missing
          cleanedSv.id = GenericSubField.buildID();
        }
        Object.keys(sv).forEach((key) => {
          if (key === 'id') return;
          if (validFieldIds.has(key)) {
            cleanedSv[key] = sv[key];
          }
        });
        return cleanedSv;
      });

      // Prepare a template for new sub_value entries
      let newSv = new GenericSubField();
      value.map((e) => {
        if (e.type === FieldTypes.F_TEXT)
          return Object.assign(newSv, { [e.id]: '' });
        if (e.type === FieldTypes.F_SYSTEM_DEFINED) {
          const systemUnit = defaultVSystem(e.option_layers);
          return Object.assign(newSv, {
            [e.id]: { value_system: systemUnit?.key ?? '', value: '' },
          });
        }
        if (e.type === FieldTypes.F_SELECT) {
          const so = selectOptions?.[e.option_layers];
          return Object.assign(newSv, {
            [e.id]: { value: so?.options?.[0]?.key ?? '' },
          });
        }
        if (e.type.startsWith(FieldTypes.F_DRAG)) {
          return Object.assign(newSv, { [e.id]: {} });
        }
        return Object.assign(newSv, {
          [e.id]: { value: '', value_system: e.value_system },
        });
      });

      value.forEach((sf) => {
        if (!sf.id || !sf.type) return;

        // Add missing field if not present
        for (const row of newField.sub_values) {
          if (!row.hasOwnProperty(sf.id)) {
            row[sf.id] = { ...newSv[sf.id] };
          }
        }

        // Update sub_value entries
        newField.sub_values.forEach((sv) => {
          if (!(sf.id in sv)) return;

          // Handle F_DRAG types
          if (sf.type.startsWith(FieldTypes.F_DRAG)) {
            if (!isObject(sv[sf.id])) {
              sv[sf.id] = {};
            }
            sv[sf.id].value = {};
            delete sv[sf.id].value_system;
          }

          // Handle F_TEXT
          else if (sf.type === FieldTypes.F_TEXT) {
            sv[sf.id] = '';
            delete sv[sf.id].value_system;
          }

          // Handle F_SYSTEM_DEFINED
          else if (sf.type === FieldTypes.F_SYSTEM_DEFINED) {
            const systemUnit = defaultVSystem(sf.option_layers);
            if (!isObject(sv[sf.id])) {
              sv[sf.id] = { value: '', value_system: '' };
            }
            if (sv[sf.id].value == null) {
              sv[sf.id].value = '';
            }
            sv[sf.id].value_system = systemUnit?.key ?? '';
          }

          // Handle F_SELECT
          else if (sf.type === FieldTypes.F_SELECT) {
            if (!isObject(sv[sf.id])) {
              sv[sf.id] = {};
            }
            const so = selectOptions?.[sf.option_layers];
            sv[sf.id].value = so?.options?.[0]?.key ?? '';
            delete sv[sf.id].value_system;
          }
        });
      });
      updSub(layerKey, newField);
    },
    [field, layerKey, updSub, selectOptions],
  );

  const addRow = useCallback(() => {
    try {
      const newSub = new GenericSubField({
        col_name: '',
        type: FieldTypes.F_TEXT,
        value: '',
      });
      const idx = gridRef.current.api.getDisplayedRowCount();
      const res = gridRef.current.api.applyTransaction({
        add: [newSub],
        addIndex: idx,
      });
      if (res && res.add) {
        const rows = collectGridData();
        update(rows);
      }
    } catch (e) {
      console.error('Error adding row:', e);
    }
  }, [collectGridData, update]);

  const delRow = useCallback(() => {
    try {
      const selectedData = gridRef.current.api.getSelectedRows();
      const res = gridRef.current.api.applyTransaction({
        remove: selectedData,
      });
      if (res && res.remove) {
        const rows = collectGridData();
        update(rows);
      }
    } catch (e) {
      console.error('Error deleting row:', e);
    }
  }, [collectGridData, update]);

  const onCellValueChanged = useCallback(
    (params) => {
      const { oldValue, newValue } = params;
      if (oldValue === newValue) return;
      params.node.setDataValue(params.column.colId, newValue);
      const rows = collectGridData();
      update(rows);
    },
    [collectGridData, update],
  );

  const selType = useCallback(
    (e, node) => {
      const { data } = node;
      if (e.target.value === data.type) {
        return;
      }
      data.type = e.target.value;
      data.value = '';
      if (data.type === FieldTypes.F_SELECT) {
        data.option_layers = selectOptions[0]?.value;
        delete data.value_system;
      } else if (data.type === FieldTypes.F_SYSTEM_DEFINED) {
        data.option_layers = (unitConfig || [])[0].value;
        data.value_system = ((
          unitsFields.find((u) => u.field === data.option_layers) || {}
        ).units || [])[0].key;
      } else {
        delete data.option_layers;
        delete data.value_system;
      }
      const rows = collectGridData();
      update(rows);
    },
    [selectOptions, unitConfig, unitsFields, collectGridData, update],
  );

  const selDefined = useCallback(
    (e, node) => {
      const { data } = node;
      if (e.target.value === data.option_layers) {
        return;
      }
      data.option_layers = e.target.value;
      if (node.data.type === FieldTypes.F_SYSTEM_DEFINED) {
        data.value_system = ((
          unitsFields.find((u) => u.field === data.option_layers) || {}
        ).units || [])[0].key;
      }
      const rows = collectGridData();
      update(rows);
    },
    [unitsFields, collectGridData, update],
  );

  const chkAttr = useCallback(
    (val, chk, node) => {
      const { data } = node;
      const search = new RegExp(`${val};`, 'gi');
      if (chk) {
        data.value = data.value.concat(`${val};`);
      } else {
        data.value = data.value?.replace(search, '');
      }
      const rows = collectGridData();
      update(rows);
    },
    [collectGridData, update],
  );

  const buildColumnDefs = useCallback(() => {
    const colDefs = [
      {
        rowDrag: true,
        headerName: 'Id',
        field: 'id',
        editable: false,
        minWidth: 100,
        width: 100,
      },
      {
        headerName: 'Column Heading',
        field: 'col_name',
        editable: true,
        minWidth: 150,
        width: 150,
        onCellValueChanged,
      },
      {
        headerName: 'Column Type',
        field: 'type',
        editable: false,
        minWidth: 150,
        width: 150,
        cellRenderer: TypeSelect,
        cellRendererParams: {
          all: types,
          selType,
        },
      },
      {
        headerName: 'Default Value',
        field: 'value',
        editable: (e) => {
          return !TP_LOCKED.includes(e.data.type);
        },
        minWidth: 350,
        cellRenderer: DefinedRenderer,
        cellRendererParams: {
          unitConfig,
          selDefined,
          chkAttr,
          selectOptions,
        },
        onCellValueChanged,
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
        headerComponentParams: { addRow },
        cellRenderer: DelRowBtn,
        cellRendererParams: { delRow },
        editable: false,
        filter: false,
        minWidth: 60,
        width: 60,
        suppressSizeToFit: true,
        pinned: 'left',
      },
    ];

    return colDefs;
  }, [unitConfig, selDefined, chkAttr, selectOptions, types, selType]);

  const onRowDragEnd = useCallback(() => {
    try {
      const rows = collectGridData();
      update(rows);
    } catch (error) {
      console.error('Error handling row drag:', error);
    }
  }, [collectGridData, update]);

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
  }, [gridReady, columnsReady, buildColumnDefs]);

  useEffect(() => {
    if (columnsReady) {
      setRowData(field.sub_fields || []);
    }
  }, [columnsReady, field.sub_fields]);

  useEffect(() => {
    if (gridRef.current?.api) {
      const valueColumn = columnDefs.find((col) => col.field === 'value');
      if (!valueColumn) return;

      const currentOptions = valueColumn.cellRendererParams.selectOptions;
      const optionsChanged =
        !currentOptions ||
        currentOptions.length !== selectOptions.length ||
        JSON.stringify(currentOptions) !== JSON.stringify(selectOptions);
      if (!optionsChanged) return;
      valueColumn.cellRendererParams.selectOptions = selectOptions;
      gridRef.current.api.setGridOption('columnDefs', columnDefs);
    }
  }, [selectOptions, columnDefs]);

  return (
    <div>
      <div
        style={{ width: '100%', height: '100%' }}
        className={Constants.GRID_THEME.QUARTZ.VALUE}
      >
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          enableColResize
          onGridReady={onGridReady}
          onRowDragEnd={onRowDragEnd}
          ref={gridRef}
          rowData={rowData}
          rowDragManaged
          rowSelection={labRowSelection}
          singleClickEdit
          stopEditingWhenCellsLoseFocus
        />
      </div>
    </div>
  );
};

FieldTable.propTypes = {
  genericType: PropTypes.string.isRequired,
  layerKey: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  updSub: PropTypes.func.isRequired,
  unitsFields: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default React.memo(FieldTable);
