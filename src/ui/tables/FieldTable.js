import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
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
import { dedupeSubFieldIds } from '@utils/template/prune-references';
import { labRowSelection, labDefaultColDef } from '@utils/table/grid-config';
import { resolveGridTheme } from '@utils/table/grid-theme';
import {
  isMinMaxValid,
  parseDecimal,
  parseNumberInput,
  resolveDecimals,
  validateNumberValue,
} from '@utils/numberUtils';
import {
  TABLE_OPERAND_TYPES,
  pruneFormulaRefs,
  recomputeFormulaCells,
  reconcileSystemCell,
} from '@utils/formulaUtils';

const TP_BASE = [
  FieldTypes.F_DRAG_MOLECULE,
  FieldTypes.F_FORMULA_FIELD,
  FieldTypes.F_NUMBER,
  FieldTypes.F_SELECT,
  FieldTypes.F_SELECT_MULTI,
  FieldTypes.F_SYSTEM_DEFINED,
  FieldTypes.F_TEXT,
];
const TP_ELEMENT = sortBy(TP_BASE.concat([FieldTypes.F_DRAG_SAMPLE]));
const TP_LOCKED = [
  FieldTypes.F_DRAG_MOLECULE,
  FieldTypes.F_DRAG_SAMPLE,
  FieldTypes.F_FORMULA_FIELD,
  FieldTypes.F_NUMBER,
  FieldTypes.F_SELECT,
  FieldTypes.F_SELECT_MULTI,
  FieldTypes.F_SYSTEM_DEFINED,
];

function FieldTable(props) {
  const { field, genericType, layerKey, selectOptions, unitsFields, updSub } =
    props;
  const { themeProps, wrapperClassName } = resolveGridTheme('QUARTZ');
  const gridRef = useRef(null);

  const [columnDefs, setColumnDefs] = useState([]);
  const [columnsReady, setColumnsReady] = useState(false);
  const [gridReady, setGridReady] = useState(false);
  const [rowData, setRowData] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [types] = useState(() =>
    TP_ELEMENT.map((e) => ({ key: e, val: e, lab: findTypeLabel(e) })),
  );
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
    (rawValue, opts = {}) => {
      const { roundColumnId = null } = opts;
      // Heal duplicate sub_field ids before persisting: two columns sharing an
      // id collide on the id-keyed cell store. Designer-side only.
      const value = dedupeSubFieldIds(rawValue);
      const newField = cloneDeep(field);
      if (!value || value.length === 0) {
        newField.sub_fields = [];
        delete newField.sub_values;
        updSub(layerKey, newField);
        return;
      }

      newField.sub_fields = value;
      // Drop refs to deleted columns (their uuid can never come back);
      // refs to retyped columns are kept so a switch-back reconnects them.
      pruneFormulaRefs(newField.sub_fields);

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
      const newSv = new GenericSubField();
      value.map((e) => {
        if (e.type === FieldTypes.F_TEXT)
          return Object.assign(newSv, { [e.id]: '' });
        if (e.type === FieldTypes.F_SYSTEM_DEFINED) {
          // prefer the designer's column default unit; fall back to the
          // quantity's first unit for legacy columns without one
          const colUnit =
            e.value_system || defaultVSystem(e.option_layers)?.key || '';
          return Object.assign(newSv, {
            [e.id]: { value_system: colUnit, value: '' },
          });
        }
        if (e.type === FieldTypes.F_SELECT) {
          const so = selectOptions?.[e.option_layers];
          return Object.assign(newSv, {
            [e.id]: { value: so?.options?.[0]?.key ?? '' },
          });
        }
        if (e.type === FieldTypes.F_SELECT_MULTI) {
          return Object.assign(newSv, { [e.id]: { value: [] } });
        }
        if (e.type === FieldTypes.F_FORMULA_FIELD) {
          return Object.assign(newSv, { [e.id]: { value: '' } });
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

          // Handle F_SYSTEM_DEFINED — reconcile the cell with the column's
          // default unit without relabeling a stored magnitude: convert on a
          // same-quantity unit change, clear on a quantity change.
          else if (sf.type === FieldTypes.F_SYSTEM_DEFINED) {
            // eslint-disable-next-line no-param-reassign
            sv[sf.id] = reconcileSystemCell(
              sv[sf.id],
              sf.value_system,
              sf.option_layers,
            );
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

          // Handle F_SELECT_MULTI
          else if (sf.type === FieldTypes.F_SELECT_MULTI) {
            if (!isObject(sv[sf.id])) {
              sv[sf.id] = {};
            }
            if (!Array.isArray(sv[sf.id].value)) {
              sv[sf.id].value = [];
            } else {
              // Remove values that no longer exist in the current option list
              const so = selectOptions?.[sf.option_layers];
              const validKeys = new Set((so?.options || []).map((o) => o.key));
              sv[sf.id].value = sv[sf.id].value.filter((v) => validKeys.has(v));
            }
            delete sv[sf.id].value_system;
          }

          // Handle F_NUMBER
          // - For the column whose decimals just changed (roundColumnId), round
          //   each stored value through parseNumberInput so it stays usable
          //   when possible; only clear when it cannot be parsed.
          // - For any other path (min/max change, row add/delete, etc.), keep
          //   the stricter validate-then-clear semantics.
          else if (sf.type === FieldTypes.F_NUMBER) {
            if (!isObject(sv[sf.id])) {
              sv[sf.id] = { value: '' };
            }
            const cell = sv[sf.id];
            if (cell.value !== '' && cell.value != null) {
              if (sf.id === roundColumnId) {
                const parsed = parseNumberInput(
                  cell.value,
                  sf.numeric?.decimals,
                  {
                    min: sf.numeric?.min,
                    max: sf.numeric?.max,
                  },
                );
                if (parsed === null) cell.value = '';
                else if (String(parsed) !== String(cell.value))
                  cell.value = parsed;
              } else {
                const { valid } = validateNumberValue(cell.value, {
                  decimals: sf.numeric?.decimals,
                  min: sf.numeric?.min,
                  max: sf.numeric?.max,
                });
                if (!valid) cell.value = '';
              }
            }
            delete sv[sf.id].value_system;
          }

          // Handle F_FORMULA_FIELD — read-only computed cell; the actual
          // value is refreshed by recomputeFormulaCells below.
          else if (sf.type === FieldTypes.F_FORMULA_FIELD) {
            if (!isObject(sv[sf.id])) {
              sv[sf.id] = { value: '' };
            }
            delete sv[sf.id].value_system;
          }
        });
      });
      recomputeFormulaCells(newField);
      updSub(layerKey, newField);
      return newField;
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
        // Warn when a deleted column is referenced by a formula column —
        // update() prunes those refs and the references count as 0.
        const removedIds = new Set(selectedData.map((r) => r.id));
        const referencing = rows.filter(
          (r) =>
            r.type === FieldTypes.F_FORMULA_FIELD &&
            (r.refs || []).some((ref) => removedIds.has(ref.id)),
        );
        if (referencing.length) {
          const refIds = new Set(
            referencing.flatMap((r) => (r.refs || []).map((ref) => ref.id)),
          );
          const names = selectedData
            .filter((rc) => refIds.has(rc.id))
            .map((rc) => `"${rc.col_name || rc.id}"`);
          setWarnings((prev) => [
            ...prev,
            `Deleted column(s) ${names.join(', ')} were referenced by formula column(s) ${referencing
              .map((r) => `"${r.col_name || r.id}"`)
              .join(', ')} — those references were removed and now count as 0.`,
          ]);
        }
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
      delete data.formula;
      delete data.decimal;
      delete data.refs;
      if (
        data.type === FieldTypes.F_SELECT ||
        data.type === FieldTypes.F_SELECT_MULTI
      ) {
        data.option_layers = selectOptions[0]?.value;
        delete data.value_system;
        delete data.numeric;
      } else if (data.type === FieldTypes.F_SYSTEM_DEFINED) {
        data.option_layers = (unitConfig || [])[0].value;
        data.value_system = ((
          unitsFields.find((u) => u.field === data.option_layers) || {}
        ).units || [])[0].key;
        delete data.numeric;
      } else if (data.type === FieldTypes.F_NUMBER) {
        delete data.option_layers;
        delete data.value_system;
        if (!data.numeric) data.numeric = { decimals: 0, min: '', max: '' };
      } else if (data.type === FieldTypes.F_FORMULA_FIELD) {
        delete data.option_layers;
        delete data.value_system;
        delete data.numeric;
        data.formula = '';
        data.decimal = 5;
        data.refs = [];
      } else {
        delete data.option_layers;
        delete data.value_system;
        delete data.numeric;
      }
      const rows = collectGridData();
      // Warn when the changed column is referenced by a formula column and is
      // no longer an eligible operand (its references now resolve to 0).
      if (!TABLE_OPERAND_TYPES.includes(data.type)) {
        const referencing = rows.filter(
          (r) =>
            r.type === FieldTypes.F_FORMULA_FIELD &&
            (r.refs || []).some((ref) => ref.id === data.id),
        );
        if (referencing.length) {
          const label = data.col_name || data.id;
          setWarnings((prev) => [
            ...prev,
            `Column "${label}" is referenced by formula column(s) ${referencing
              .map((r) => `"${r.col_name || r.id}"`)
              .join(
                ', ',
              )} but is no longer a Number/System-Defined column — its references now count as 0.`,
          ]);
        }
      }
      update(rows);
    },
    [selectOptions, unitConfig, unitsFields, collectGridData, update],
  );

  const setFormulaProps = useCallback(
    (payload, node) => {
      const { data } = node;
      data.formula = payload.formula;
      data.decimal = payload.decimal;
      data.refs = payload.refs;
      update(collectGridData());
    },
    [collectGridData, update],
  );

  // All sibling columns except the edited one. Formula siblings are kept
  // (the modal greys them out as non-eligible) so a ref to a column retyped
  // to Formula-Field survives the save and reconnects on switch-back.
  const getSiblingColumns = useCallback(
    (node) => collectGridData().filter((c) => c.id !== node.data.id),
    [collectGridData],
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

  // Designer picks the column's default unit (the formula base unit for the
  // column). Stores it on the column definition's `value_system`; update()
  // seeds the default rows' cells with it.
  const selUnit = useCallback(
    (unitKey, node) => {
      const { data } = node;
      if (data.type !== FieldTypes.F_SYSTEM_DEFINED) return;
      if (!unitKey || unitKey === data.value_system) return;
      data.value_system = unitKey;
      const rows = collectGridData();
      update(rows);
    },
    [collectGridData, update],
  );

  const setNumeric = useCallback(
    (key, value, node) => {
      const { data } = node;
      const label = data.col_name || data.id;
      const next = { ...(data.numeric || {}) };

      // Reject non-numeric input: clear and warn (matches standalone NUMBER).
      // For decimals, mirror handleFieldInputChange: coerce fractional/non-integer
      // input with parseInt + warn (e.g. "2.5" → 2), clamping to 0 only when the
      // result is NaN/negative.
      let decimalsCoerced = false;
      let decimalsCoercedTo = null;
      if (value !== '' && value !== null && value !== undefined) {
        if (key === 'decimals') {
          const rawStr = String(value);
          if (!/^\d+$/.test(rawStr)) {
            const parsed = parseInt(rawStr, 10);
            const coerced = Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
            next.decimals = coerced;
            decimalsCoerced = true;
            decimalsCoercedTo = coerced;
          }
        } else if (
          (key === 'min' || key === 'max') &&
          parseDecimal(value) === null
        ) {
          next[key] = '';
          data.numeric = next;
          setWarnings((prev) => [
            ...prev,
            `${key === 'min' ? 'Min' : 'Max'} must be numeric for "${label}" — reset to empty.`,
          ]);
          update(collectGridData());
          return;
        }
      }

      if (value === '' || value === null || value === undefined) {
        next[key] = key === 'decimals' ? 0 : '';
      } else if (key === 'decimals') {
        if (!decimalsCoerced) {
          // Coerce to a non-negative integer so the schema (numeric.decimals: int)
          // and downstream consumers always see a number, not a string.
          next[key] = resolveDecimals(value);
        }
      } else {
        next[key] = value;
      }

      const msgs = [];
      if (decimalsCoerced) {
        msgs.push(
          `Invalid decimals for "${label}" — must be a non-negative integer. Coerced to ${decimalsCoercedTo}.`,
        );
      }

      // Round min/max to current decimals precision
      if (
        (key === 'min' || key === 'max') &&
        next[key] !== '' &&
        next[key] != null
      ) {
        const rounded = parseNumberInput(next[key], next.decimals);
        if (rounded !== null && String(rounded) !== String(next[key])) {
          msgs.push(
            `${key === 'min' ? 'Min' : 'Max'} rounded to ${rounded} for "${label}" to match decimals precision (${resolveDecimals(next.decimals)}).`,
          );
          next[key] = rounded;
        }
      }

      // When decimals changes, re-round existing min/max to the new precision
      if (key === 'decimals') {
        const newDec = resolveDecimals(next.decimals);
        const roundedParts = [];
        ['min', 'max'].forEach((k) => {
          const v = next[k];
          if (v === '' || v == null) return;
          const r = parseNumberInput(v, newDec);
          if (r !== null && String(r) !== String(v)) {
            next[k] = r;
            roundedParts.push(`${k} → ${r}`);
          }
        });
        if (roundedParts.length) {
          msgs.push(
            `Constraints updated for "${label}" to match decimals precision (${newDec}): ${roundedParts.join(', ')}.`,
          );
        }
      }

      // Guard: min must not exceed max
      if (!isMinMaxValid(next.min, next.max)) {
        if (key === 'decimals') {
          // Decimals rounding caused the conflict — clear max so the field stays usable
          next.max = '';
        } else {
          next[key] = '';
        }
        msgs.push(
          `Invalid constraint for "${label}" — min cannot be greater than max.`,
        );
        data.numeric = next;
        if (msgs.length) setWarnings((prev) => [...prev, ...msgs]);
        update(collectGridData());
        return;
      }

      // Inspect stored cells under the new constraints. For decimals change we
      // round-then-keep when possible (parseNumberInput); for min/max we still
      // clear values that fall outside the range.
      let willRound = 0;
      let willClear = 0;
      (field.sub_values || []).forEach((sv) => {
        const cell = sv?.[data.id];
        if (!cell || typeof cell !== 'object') return;
        if (cell.value === '' || cell.value == null) return;
        if (key === 'decimals') {
          const parsed = parseNumberInput(cell.value, next.decimals, {
            min: next.min,
            max: next.max,
          });
          if (parsed === null) willClear += 1;
          else if (String(parsed) !== String(cell.value)) willRound += 1;
        } else {
          const { valid } = validateNumberValue(cell.value, {
            decimals: next.decimals,
            min: next.min,
            max: next.max,
          });
          if (!valid) willClear += 1;
        }
      });
      if (willRound > 0) {
        msgs.push(
          `Default value(s) rounded for "${label}" to match decimals precision (${resolveDecimals(next.decimals)}).`,
        );
      }
      if (willClear > 0) {
        msgs.push(
          key === 'decimals'
            ? `Default value(s) cleared for "${label}" — they could not be parsed.`
            : `Default value(s) cleared for "${label}" — they fall outside the updated constraints.`,
        );
      }

      data.numeric = next;
      if (msgs.length) setWarnings((prev) => [...prev, ...msgs]);
      update(
        collectGridData(),
        key === 'decimals' ? { roundColumnId: data.id } : {},
      );
    },
    [field, collectGridData, update],
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
        editable: (e) => !TP_LOCKED.includes(e.data.type),
        minWidth: 350,
        cellRenderer: DefinedRenderer,
        cellRendererParams: {
          unitConfig,
          selDefined,
          selUnit,
          chkAttr,
          selectOptions,
          setNumeric,
          setFormulaProps,
          getSiblingColumns,
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
  }, [
    unitConfig,
    selDefined,
    selUnit,
    chkAttr,
    selectOptions,
    types,
    selType,
    setNumeric,
    setFormulaProps,
    getSiblingColumns,
  ]);

  const onRowDragEnd = useCallback(() => {
    try {
      const rows = collectGridData();
      update(rows);
    } catch (error) {
      console.error('Error handling row drag:', error);
    }
  }, [collectGridData, update]);

  useEffect(() => {
    if (!gridReady) return undefined;
    if (columnsReady) return undefined;

    const columnState = gridRef.current.api.getColumnState();
    setColumnDefs(buildColumnDefs());

    const timer = setTimeout(() => {
      if (!gridRef.current?.api) return;
      gridRef.current.api.applyColumnState({
        state: columnState,
        applyOrder: true,
      });
      setColumnsReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [gridReady, columnsReady, buildColumnDefs]);

  useEffect(() => {
    if (columnsReady) {
      // Re-mint any duplicate sub_field ids as the columns load so the editor
      // grid (and the next save) work with unique per-column identities.
      setRowData(dedupeSubFieldIds(field.sub_fields || []));
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

  const dismissWarning = useCallback((idx) => {
    setWarnings((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  return (
    <div>
      {warnings.map((msg, idx) => (
        <Alert
          key={`field_table_warn_${idx}_${msg}`}
          variant="warning"
          dismissible
          onClose={() => dismissWarning(idx)}
          className="mb-2 py-1"
        >
          {msg}
        </Alert>
      ))}
      <div
        className={wrapperClassName}
        style={{ width: '100%', height: '100%' }}
      >
        <AgGridReact
          {...themeProps}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
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
}

FieldTable.propTypes = {
  genericType: PropTypes.string.isRequired,
  layerKey: PropTypes.string.isRequired,
  field: PropTypes.object.isRequired,
  updSub: PropTypes.func.isRequired,
  unitsFields: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default React.memo(FieldTable);
