/* eslint-disable no-restricted-globals */

/* eslint-disable react/forbid-prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import Numeral from 'numeral';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { genUnit, genUnits, unitConversion, FieldTypes } from 'generic-ui-core';
import Constants from '@components/tools/Constants';
import GenericSubField from '@components/models/GenericSubField';
import {
  AddRowBtn,
  DelRowBtn,
  DnDRowBtn,
  DLGridBtn,
} from '@components/table/GridBtn';
import { ColumnHeader, ColumnRow, NoRow } from '@components/table/GridEntry';
import UConverterRenderer from '@components/table/UConverterRenderer';
import {
  defaultVSystem,
  genUnitSup,
  molOptions,
  samOptions,
} from '@components/tools/utils';
import DropRenderer from '@components/table/DropRenderer';
import DropTextRenderer from '@components/table/DropTextRenderer';
import DropLinkRenderer from '@components/table/DropLinkRenderer';
import SampOption from '@components/table/SamOption';
import SelectRenderer from '@components/table/SelectRenderer';
import SelectMultiRenderer from '@components/table/SelectMultiRenderer';
import NumberRenderer from '@components/table/NumberRenderer';
import FormulaRenderer from '@components/table/FormulaRenderer';
import FIcons from '@components/icons/FIcons';
import { resolveDecimals } from '@utils/numberUtils';
import { recomputeFormulaCells } from '@utils/formulaUtils';
import { downloadResponseAsFile } from '@utils/fileUtils';
import ImpExpManager from '@/utils/impExpMgr';

export default class TableRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dlLoading: false };
    this.delRow = this.delRow.bind(this);
    this.download = this.download.bind(this);
    this.addRow = this.addRow.bind(this);
    this.moveRow = this.moveRow.bind(this);
    this.onCellChange = this.onCellChange.bind(this);
    this.onSelectClick = this.onSelectClick.bind(this);
    this.onSelectMultiClick = this.onSelectMultiClick.bind(this);
    this.onUnitClick = this.onUnitClick.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onChk = this.onChk.bind(this);
    this.getColumns = this.getColumns.bind(this);
  }

  onCellChange(params) {
    const { e, columnDef, rowValue } = params;
    const newValue = e.target.value;
    // Normalize the cell up front: a freshly added column can leave the
    // row entry missing or as a primitive (F_TEXT). Coerce to {value} so
    // every downstream branch can read .value without crashing.
    const existing = rowValue[columnDef.field];
    if (existing === undefined || existing === null) {
      rowValue[columnDef.field] =
        columnDef.type === FieldTypes.F_TEXT ? '' : { value: '' };
    } else if (
      columnDef.type !== FieldTypes.F_TEXT &&
      (typeof existing !== 'object' || !('value' in existing))
    ) {
      rowValue[columnDef.field] = { value: existing };
    }
    const cell = rowValue[columnDef.field];
    const oldValue = columnDef.type === FieldTypes.F_TEXT ? cell : cell.value;
    if (oldValue === newValue) return;
    if (columnDef.type === FieldTypes.F_TEXT) {
      rowValue[columnDef.field] = newValue;
    }
    if (columnDef.type === FieldTypes.F_SYSTEM_DEFINED) {
      if (isNaN(newValue)) return;
      rowValue[columnDef.field].value = Numeral(newValue).value();
    }
    if (columnDef.type === FieldTypes.F_NUMBER) {
      // newValue has already been parsed (or '') by NumberEditor
      rowValue[columnDef.field].value = newValue;
    }
    const { opt } = this.props;
    const subVals = opt.f_obj.sub_values || [];
    const idx = subVals.findIndex((s) => s.id === rowValue.id);
    subVals.splice(idx, 1, rowValue);
    opt.f_obj.sub_values = subVals;
    recomputeFormulaCells(opt.f_obj, rowValue);
    opt.onSubChange(0, 0, opt.f_obj, true);
  }

  onSelectClick(e, subField, node) {
    const { data } = node;
    const { opt } = this.props;
    const subVals = opt.f_obj.sub_values || [];
    const subVal = subVals.find((s) => s.id === data.id);
    subVal[subField.id] = { value: e ? e.value : '' };
    const idx = subVals.findIndex((s) => s.id === data.id);
    subVals.splice(idx, 1, subVal);
    opt.f_obj.sub_values = subVals;
    opt.onSubChange(subField, subField.id, opt.f_obj, true);
  }

  onSelectMultiClick(selected, subField, node) {
    const { data } = node;
    const { opt } = this.props;
    const subVals = opt.f_obj.sub_values || [];
    const subVal = subVals.find((s) => s.id === data.id);
    subVal[subField.id] = {
      value: selected ? selected.map((s) => s.value) : [],
    };
    const idx = subVals.findIndex((s) => s.id === data.id);
    subVals.splice(idx, 1, subVal);
    opt.f_obj.sub_values = subVals;
    opt.onSubChange(subField, subField.id, opt.f_obj, true);
  }

  onUnitClick(subField, node) {
    const { data } = node;
    const { opt } = this.props;
    const subVals = opt.f_obj.sub_values || [];
    const subVal = subVals.find((s) => s.id === data.id);
    const units = genUnits(subField.option_layers);
    let uIdx = units.findIndex(
      (u) => u.key === subVal[subField.id].value_system,
    );
    if (uIdx < units.length - 1) uIdx += 1;
    else uIdx = 0;
    const vs = units.length > 0 ? units[uIdx].key : '';
    const v = unitConversion(
      subField.option_layers,
      vs,
      subVal[subField.id].value,
    );
    subVal[subField.id] = { value: v, value_system: vs };
    const idx = subVals.findIndex((s) => s.id === data.id);
    subVals.splice(idx, 1, subVal);
    opt.f_obj.sub_values = subVals;
    recomputeFormulaCells(opt.f_obj, subVal);
    opt.onSubChange(subField, subField.id, opt.f_obj, true);
  }

  onDrop(targetProps, targetOpt) {
    const { opt } = this.props;
    const subField = targetOpt.sField;
    const subVals = opt.f_obj.sub_values || [];
    const subVal = subVals.find((s) => s.id === targetOpt.data.id);
    subVal[subField.id] = { value: targetProps };
    const idx = subVals.findIndex((s) => s.id === targetOpt.data.id);
    subVals.splice(idx, 1, subVal);
    opt.f_obj.sub_values = subVals;
    opt.onSubChange(subField, subField.id, opt.f_obj, true);
  }

  onChk(params) {
    const { node, subField, crOpt } = params;
    const { opt } = this.props;
    const subVals = opt.f_obj.sub_values || [];
    const subVal = subVals.find((s) => s.id === node.data.id);
    node.data[subField.id].value.cr_opt = crOpt;
    subVal[subField.id] = { value: node.data[subField.id].value };
    const idx = subVals.findIndex((s) => s.id === node.data.id);
    subVals.splice(idx, 1, subVal);
    opt.f_obj.sub_values = subVals;
    opt.onSubChange(subField, subField.id, opt.f_obj, true);
  }

  getColumns() {
    const { opt } = this.props;

    const { selectOptions, onNavi, isEditable } = opt;
    const sValues = opt.f_obj.sub_values || [];
    let columnDefs = [];
    (opt.f_obj.sub_fields || []).forEach((sF) => {
      let colDef = {
        type: sF.type,
        headerName: sF.col_name,
        field: sF.id,
      };
      const colDefExt = [];
      if (sF.type === FieldTypes.F_TEXT) {
        colDef = { ...colDef, editable: true, onCellChange: this.onCellChange };
      }
      if (sF.type === FieldTypes.F_NUMBER) {
        const numeric = sF.numeric || {};
        const hintParts = [`dec: ${resolveDecimals(numeric.decimals)}`];
        if (numeric.min !== '' && numeric.min != null)
          hintParts.push(`min: ${numeric.min}`);
        if (numeric.max !== '' && numeric.max != null)
          hintParts.push(`max: ${numeric.max}`);
        const tooltip = `(${hintParts.join(', ')})`;
        const cellParams = { sField: sF };
        colDef = {
          ...colDef,
          editable: isEditable !== false,
          headerName: (
            <span>
              {sF.col_name}
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip id={`tt_num_${sF.id}`}>{tooltip}</Tooltip>}
              >
                <Button
                  variant="link"
                  size="sm"
                  aria-label={`${sF.col_name} column constraints`}
                  style={{
                    padding: '0 4px',
                    verticalAlign: 'baseline',
                    textDecoration: 'none',
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  {FIcons.faCircleInfo}
                </Button>
              </OverlayTrigger>
            </span>
          ),
          cellRenderer: NumberRenderer,
          cellParams,
          onCellChange: this.onCellChange,
        };
      }
      if (sF.type === FieldTypes.F_FORMULA_FIELD) {
        const refText = (sF.refs || [])
          .map((r) => {
            const col = (opt.f_obj.sub_fields || []).find((c) => c.id === r.id);
            return `${r.abbr}: ${col ? col.col_name || col.id : '?'}`;
          })
          .join(', ');
        // const tooltip = refText
        //   ? `${sF.formula || ''} (${refText})`
        //   : sF.formula || '';
        const tooltip = `${sF.formula || ''} (Uses the referenced column's default unit.)`;
        colDef = {
          ...colDef,
          editable: false,
          headerName: (
            <span>
              {sF.col_name}
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`tt_formula_${sF.id}`}>{tooltip}</Tooltip>
                }
              >
                <Button
                  variant="link"
                  size="sm"
                  aria-label={`${sF.col_name} column formula`}
                  style={{
                    padding: '0 4px',
                    verticalAlign: 'baseline',
                    textDecoration: 'none',
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  {FIcons.faCircleInfo}
                </Button>
              </OverlayTrigger>
            </span>
          ),
          cellRenderer: FormulaRenderer,
          cellParams: { sField: sF, subFields: opt.f_obj.sub_fields || [] },
        };
      }
      if (sF.type === FieldTypes.F_SELECT) {
        let sOptions =
          (selectOptions[sF.option_layers] &&
            selectOptions[sF.option_layers].options) ||
          [];
        sOptions = sOptions.map((op) => ({
          value: op.key,
          name: op.key,
          label: op.label,
        }));
        const cellParams = {
          sField: sF,
          onChange: this.onSelectClick,
          sOptions,
        };
        colDef = {
          ...colDef,
          cellRenderer: SelectRenderer,
          cellParams,
          onCellChange: this.onCellChange,
        };
      }
      if (sF.type === FieldTypes.F_SELECT_MULTI) {
        let sOptions =
          (selectOptions[sF.option_layers] &&
            selectOptions[sF.option_layers].options) ||
          [];
        sOptions = sOptions.map((op) => ({
          value: op.key,
          name: op.key,
          label: op.label,
        }));
        const cellParams = {
          sField: sF,
          onChange: this.onSelectMultiClick,
          sOptions,
        };
        colDef = {
          ...colDef,
          cellRenderer: SelectMultiRenderer,
          cellParams,
          onCellChange: this.onCellChange,
        };
      }
      if (sF.type === FieldTypes.F_SYSTEM_DEFINED) {
        const unitLabel =
          genUnit(sF.option_layers, sF.value_system).label ||
          sF.value_system ||
          '';
        const cellParams = {
          sField: sF,
          onChange: this.onUnitClick,
          isPreview: opt.isPreview,
        };
        colDef = {
          ...colDef,
          headerName: (
            <span>
              {sF.col_name}
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`tt_unit_${sF.id}`}>
                    (default unit: {genUnitSup(unitLabel)})
                  </Tooltip>
                }
              >
                <Button
                  variant="link"
                  size="sm"
                  aria-label={`${sF.col_name} column default unit`}
                  style={{
                    padding: '0 4px',
                    verticalAlign: 'baseline',
                    textDecoration: 'none',
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  {FIcons.faCircleInfo}
                </Button>
              </OverlayTrigger>
            </span>
          ),
          cellRenderer: UConverterRenderer,
          cellParams,
          onCellChange: this.onCellChange,
        };
      }
      if (sF.type === FieldTypes.F_DRAG_MOLECULE) {
        const cellParams = {
          sField: sF,
          opt,
          onChange: this.onDrop,
          genericType: opt.genericType,
        };
        colDef = {
          ...colDef,
          cellRenderer: DropRenderer,
          cellParams,
          onCellChange: this.onCellChange,
          width: '5vw',
        };
        const conf = (sF.value || '').split(';') || []; // value could be molOptions with ;, e.g. "inchikey;smiles;"
        conf.forEach((c) => {
          const attr = molOptions.find((m) => m.value === c);
          if (attr) {
            const ext = {
              colId: c,
              editable: false,
              type: FieldTypes.F_TEXT,
              headerName: attr.label,
              cellRenderer: DropTextRenderer,
              cellParams: { attr, sField: sF },
            };
            colDefExt.push(ext);
          }
        });
      }
      if (sF.type === FieldTypes.F_DRAG_SAMPLE) {
        const sOpt = sValues.filter(
          (o) => o[sF.id] && o[sF.id].value && o[sF.id].value.is_new,
        );
        const cellParams = {
          sField: sF,
          opt,
          onChange: this.onDrop,
          genericType: opt.genericType,
        };
        colDef = {
          ...colDef,
          cellRenderer: DropRenderer,
          cellParams,
          onCellChange: this.onCellChange,
          width: '5vw',
        };
        const addOption = {
          colId: 'sam_option',
          editable: false,
          type: FieldTypes.F_TEXT,
          headerName: '',
          cellRenderer: SampOption,
          cellParams: {
            sField: sF,
            onChange: this.onChk,
            genericType: opt.genericType,
          },
          width: '3vw',
        };
        // Add the option column if the generic type is not 'Segment'
        if (sOpt.length > 0 && opt.genericType !== 'Segment')
          colDefExt.push(addOption);
        const addLink = {
          colId: 'sam_link',
          editable: false,
          type: FieldTypes.F_TEXT,
          headerName: 'Short label',
          cellRenderer: DropLinkRenderer,
          cellParams: { sField: sF, onNavi },
          width: '10vw',
        };
        colDefExt.push(addLink);
        const conf = (sF.value || '').split(';') || [];
        conf.forEach((c) => {
          const attr = samOptions.find((m) => m.value === c);
          if (attr) {
            const ext = {
              colId: c,
              editable: false,
              type: FieldTypes.F_TEXT,
              headerName: attr.label,
              cellRenderer: DropTextRenderer,
              cellParams: { attr, sField: sF },
            };
            colDefExt.push(ext);
          }
        });
      }
      columnDefs.push(colDef);
      if (colDefExt.length > 0) columnDefs = columnDefs.concat(colDefExt);
    });
    const act = {
      type: 'button',
      headerName: '',
      colId: opt.f_obj.field,
      headerComponent: AddRowBtn,
      headerParams: { addRow: this.addRow, isEditable },
      cellRenderer: DelRowBtn,
      cellParams: { delRow: this.delRow, isEditable },
      width: 'unset',
    };
    columnDefs.splice(0, 0, act);
    const dtype = `${Constants.PERMIT_TARGET.GENERIC_GRID}_${opt.layer.key}_${opt.f_obj.field}`;
    const move = {
      type: 'dnd',
      field: opt.f_obj.field,
      headerName: '',
      colId: `${opt.f_obj.field}_dnd`,
      headerComponent: DLGridBtn,
      headerParams: {
        download: this.download,
        opt,
        loading: this.state.dlLoading,
      },
      cellRenderer: DnDRowBtn,
      cellParams: {
        moveRow: this.moveRow,
        field: opt.f_obj.field,
        type: dtype,
        isEditable,
      },
      width: 'unset',
    };
    columnDefs.splice(0, 0, move);
    return columnDefs;
  }

  moveRow(source, target) {
    const { opt } = this.props;
    const alles = opt.f_obj.sub_values;
    const sid = alles.findIndex((e) => e.id === source);
    const tid = alles.findIndex((e) => e.id === target);
    const temp = alles[sid];
    alles[sid] = alles[tid];
    alles[tid] = temp;
    opt.onSubChange(0, 0, opt.f_obj, true);
  }

  delRow(rowData) {
    const { opt } = this.props;
    opt.f_obj.sub_values = opt.f_obj.sub_values.filter(
      (s) => s.id !== rowData.id,
    );
    opt.onSubChange(0, 0, opt.f_obj, true);
  }

  addRow() {
    const { opt } = this.props;
    const subFields = opt.f_obj.sub_fields || [];
    const newSub = new GenericSubField();
    subFields.forEach((e) => {
      if (e.type === FieldTypes.F_TEXT) {
        Object.assign(newSub, { [e.id]: '' });
      } else if (e.type === FieldTypes.F_SELECT_MULTI) {
        Object.assign(newSub, { [e.id]: { value: [] } });
      } else if (e.type === FieldTypes.F_NUMBER) {
        Object.assign(newSub, { [e.id]: { value: '' } });
      } else if (e.type === FieldTypes.F_FORMULA_FIELD) {
        Object.assign(newSub, { [e.id]: { value: '' } });
      } else if (e.type === FieldTypes.F_SYSTEM_DEFINED) {
        // Derive the unit from option_layers when the sub-field carries no
        // (or a stale/blank) value_system — otherwise the new row's unit label
        // renders blank. Mirrors the builder table (FieldTable.js).
        Object.assign(newSub, {
          [e.id]: {
            value: '',
            value_system:
              e.value_system || defaultVSystem(e.option_layers)?.key || '',
          },
        });
      } else {
        Object.assign(newSub, {
          [e.id]: { value: '', value_system: e.value_system },
        });
      }
    });
    opt.f_obj.sub_values = opt.f_obj.sub_values || [];
    opt.f_obj.sub_values.push(newSub);
    recomputeFormulaCells(opt.f_obj, newSub);
    opt.onSubChange(0, 0, opt.f_obj, true);
  }

  async download() {
    try {
      this.setState({ dlLoading: true });

      const { opt } = this.props;
      const response = await ImpExpManager.exportTable(opt.id, {
        klass: opt.genericType,
        layer_id: opt.layer.key,
        field_id: opt.field,
      });

      await downloadResponseAsFile(response);
    } catch (error) {
      console.error('Error exporting file:', error);
    } finally {
      this.setState({ dlLoading: false });
    }
  }

  render() {
    const { opt } = this.props;
    if (opt.isSearch) return <div>(This is a table)</div>;
    if ((opt.f_obj.sub_fields || []).length < 1) return null;
    const columnDefs = this.getColumns();
    return (
      <div>
        {ColumnHeader(columnDefs)}
        <div>{NoRow(opt.f_obj.sub_values)}</div>
        <div>
          {(opt.f_obj.sub_values || []).map((s) => ColumnRow(columnDefs, s))}
        </div>
      </div>
    );
  }
}

TableRecord.propTypes = {
  opt: PropTypes.object.isRequired,
};
