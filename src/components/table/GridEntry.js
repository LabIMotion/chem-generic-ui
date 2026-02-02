/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FieldTypes } from 'generic-ui-core';

const setCell = (columnDef, rowValue) => {
  const { type, field, onCellChange, cellRenderer, cellParams } = columnDef;
  switch (type) {
    case FieldTypes.F_TEXT:
      return (
        <Form.Control
          type="text"
          value={rowValue[field] || ''}
          onChange={e => onCellChange({ e, columnDef, rowValue })}
        />
      );
    case FieldTypes.F_SYSTEM_DEFINED:
      return (
        <InputGroup>
          <Form.Control
            type="number"
            value={rowValue[field].value || ''}
            onChange={(e) => onCellChange({ e, columnDef, rowValue })}
          />
          {cellRenderer({ ...cellParams, node: { data: rowValue } })}
        </InputGroup>
      );
    case FieldTypes.F_SELECT:
    case FieldTypes.F_DRAG_MOLECULE:
    case FieldTypes.F_DRAG_SAMPLE:
    case 'dnd':
      return cellRenderer({ ...cellParams, node: { data: rowValue } });
    default:
      return <span />;
  }
};

const ColumnHeader = _columnDefs => {
  const columnDefs = _columnDefs;
  const ch = [];
  const h = (col, idx) => {
    const { width, headerName, headerComponent, headerParams } = col;
    const colCss = {};
    if (width) {
      Object.assign(colCss, { width, minWidth: width });
    }
    return (
      <div
        key={`column_header_${col.colId || col.field}_${idx}`}
        className="generic_grid_header"
        style={colCss}
      >
        {headerComponent ? headerComponent(headerParams) : null}
        <div style={colCss}>{headerName}</div>
      </div>
    );
  };
  columnDefs.forEach((col, idx) => ch.push(h(col, idx)));
  return (
    <div className="generic_grid" style={{ borderBottom: '1px solid #ccc' }}>
      <div>{ch}</div>
    </div>
  );
};

const ColumnRow = (_columnDefs, _rowValue) => {
  const columnDefs = _columnDefs;
  const rowValue = _rowValue;
  const ch = [];
  const h = (col, val, idx) => {
    const { field, width, cellParams, cellRenderer, type } = col;
    const colCss = {};
    if (width) {
      Object.assign(colCss, { width, minWidth: width });
    }
    const rowKlz =
      type === FieldTypes.F_SELECT
        ? 'generic_grid_row generic_grid_row_left'
        : 'generic_grid_row';
    return (
      <div
        key={`column_row_${val.id}_${col.colId || col.field}_${idx}`}
        className={rowKlz}
        style={colCss}
      >
        {field
          ? setCell(col, val) || ''
          : cellRenderer({ ...cellParams, node: { data: val } }) || ''}
      </div>
    );
  };
  columnDefs.forEach((col, idx) => ch.push(h(col, rowValue, idx)));
  return (
    <div key={`column_row_${rowValue.id}`} className="generic_grid">
      <div>{ch}</div>
    </div>
  );
};

const NoRow = (rows) => {
  const values = rows;
  if (values && values.length > 0) return null;
  return (
    <div className="generic_grid">
      <div>
        <div className="generic_grid_row" style={{ width: '100%' }}>
          (No data)
        </div>
      </div>
    </div>
  );
};

export { ColumnHeader, ColumnRow, NoRow };
