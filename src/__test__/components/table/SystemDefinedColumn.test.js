import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FieldTypes } from 'generic-ui-core';
import TableRecord from '@components/table/TableRecord';
import { defaultVSystem } from '@components/tools/utils';

const renderWithDnd = (ui) =>
  render(<DndProvider backend={HTML5Backend}>{ui}</DndProvider>);

// One system-defined column "Mass" (default unit g) with a single row of 6 g.
const buildOpt = (overrides = {}) => ({
  isSearch: false,
  isEditable: true,
  layer: { key: 'layer1' },
  f_obj: {
    field: 'tbl',
    sub_fields: [
      {
        id: 'c1',
        col_name: 'Mass',
        type: FieldTypes.F_SYSTEM_DEFINED,
        option_layers: 'mass',
        value_system: 'g',
      },
    ],
    sub_values: [{ id: 'r1', c1: { value: 6, value_system: 'g' } }],
  },
  selectOptions: {},
  onSubChange: vi.fn(),
  onNavi: vi.fn(),
  genericType: 'Element',
  ...overrides,
});

describe('TableRecord with F_SYSTEM_DEFINED column', () => {
  test('at runtime, the unit button cycles the cell unit', () => {
    const opt = buildOpt();
    renderWithDnd(<TableRecord opt={opt} />);

    const unitBtn = screen.getAllByRole('button', { name: 'g' })[0];
    expect(unitBtn).toBeEnabled();

    fireEvent.click(unitBtn);

    expect(opt.onSubChange).toHaveBeenCalled();
    // g -> mg, so 6 g displays as 6000 mg.
    expect(opt.f_obj.sub_values[0].c1.value_system).toBe('mg');
    expect(opt.f_obj.sub_values[0].c1.value).toBe(6000);
  });

  test('in the Designer Preview, the unit button is disabled and cannot switch', () => {
    const opt = buildOpt({ isPreview: true });
    renderWithDnd(<TableRecord opt={opt} />);

    const unitBtn = screen.getAllByRole('button', { name: 'g' })[0];
    expect(unitBtn).toBeDisabled();

    fireEvent.click(unitBtn);

    // The default unit belongs to the Work Area, so nothing moves here.
    expect(opt.onSubChange).not.toHaveBeenCalled();
    expect(opt.f_obj.sub_values[0].c1.value_system).toBe('g');
    expect(opt.f_obj.sub_values[0].c1.value).toBe(6);
  });

  test('in the Designer Preview, the value cell stays editable', () => {
    const opt = buildOpt({ isPreview: true });
    renderWithDnd(<TableRecord opt={opt} />);

    const input = screen.getByDisplayValue('6');
    expect(input).not.toHaveAttribute('readonly');
    expect(input).toBeEnabled();
  });
});

describe('TableRecord addRow seeds a unit for system-defined columns', () => {
  // A column whose sub-field carries no value_system (e.g. dropped by a remodel).
  const buildBlankUnitOpt = (colValueSystem) =>
    buildOpt({
      f_obj: {
        field: 'tbl',
        sub_fields: [
          {
            id: 'c1',
            col_name: 'Mass',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: colValueSystem,
          },
        ],
        sub_values: [],
      },
    });

  test('a blank column value_system falls back to the default unit on the new row', () => {
    const opt = buildBlankUnitOpt('');
    const ref = React.createRef();
    renderWithDnd(<TableRecord ref={ref} opt={opt} />);

    ref.current.addRow();

    const defaultKey = defaultVSystem('mass')?.key;
    expect(defaultKey).toBeTruthy();
    expect(opt.f_obj.sub_values).toHaveLength(1);
    // Before the fix this stayed '' and UConverterRenderer showed a blank unit.
    expect(opt.f_obj.sub_values[0].c1.value_system).toBe(defaultKey);
    expect(opt.f_obj.sub_values[0].c1.value_system).not.toBe('');
    expect(opt.f_obj.sub_values[0].c1.value).toBe('');
  });

  test('an existing column value_system is preserved (no override)', () => {
    const opt = buildBlankUnitOpt('mg');
    const ref = React.createRef();
    renderWithDnd(<TableRecord ref={ref} opt={opt} />);

    ref.current.addRow();

    expect(opt.f_obj.sub_values).toHaveLength(1);
    expect(opt.f_obj.sub_values[0].c1.value_system).toBe('mg');
  });
});
