import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FieldTypes } from 'generic-ui-core';
import TableRecord from '@components/table/TableRecord';
import NumberEditor from '@components/table/NumberEditor';
import NumberRenderer from '@components/table/NumberRenderer';

const renderWithDnd = (ui) =>
  render(<DndProvider backend={HTML5Backend}>{ui}</DndProvider>);

describe('NumberRenderer', () => {
  it('formats stored number with column-level decimals', () => {
    const sField = { id: 'col1', numeric: { decimals: 2 } };
    const node = { data: { col1: { value: 1.234 } } };
    render(<NumberRenderer sField={sField} node={node} />);
    expect(screen.getByText('1.23')).toBeInTheDocument();
  });

  it('renders empty for nullish values', () => {
    const sField = { id: 'col1', numeric: { decimals: 2 } };
    const node = { data: { col1: { value: '' } } };
    const { container } = render(
      <NumberRenderer sField={sField} node={node} />,
    );
    // text-end div exists but with empty content
    expect(container.firstChild).toHaveTextContent('');
  });
});

describe('NumberEditor', () => {
  const buildProps = ({
    stored = '',
    numeric = {},
    onCellChange = vi.fn(),
  } = {}) => ({
    columnDef: {
      type: FieldTypes.F_NUMBER,
      field: 'col1',
      cellParams: { sField: { id: 'col1', numeric } },
    },
    rowValue: { id: 'row1', col1: { value: stored } },
    onCellChange,
  });

  it('rounds to column decimals on blur', () => {
    const onCellChange = vi.fn();
    const props = buildProps({ numeric: { decimals: 2 }, onCellChange });
    render(<NumberEditor {...props} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '1.234' } });
    fireEvent.blur(input, { target: { value: '1.234' } });
    expect(onCellChange).toHaveBeenCalledTimes(1);
    const arg = onCellChange.mock.calls[0][0];
    expect(arg.e.target.value).toBe(1.23);
  });

  it('clamps to max', () => {
    const onCellChange = vi.fn();
    const props = buildProps({
      numeric: { decimals: 0, min: 0, max: 100 },
      onCellChange,
    });
    render(<NumberEditor {...props} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.blur(input, { target: { value: '250' } });
    expect(onCellChange.mock.calls[0][0].e.target.value).toBe(100);
  });

  it('clamps to min', () => {
    const onCellChange = vi.fn();
    const props = buildProps({
      numeric: { decimals: 0, min: 5, max: 100 },
      onCellChange,
    });
    render(<NumberEditor {...props} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: '-3' } });
    fireEvent.blur(input, { target: { value: '-3' } });
    expect(onCellChange.mock.calls[0][0].e.target.value).toBe(5);
  });

  it('renders formatted display when not editing', () => {
    const props = buildProps({ stored: 1.5, numeric: { decimals: 2 } });
    render(<NumberEditor {...props} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('1.50');
  });

  it('focus seeds the input from the unformatted stored value', () => {
    const onCellChange = vi.fn();
    const props = buildProps({
      stored: 1.5,
      numeric: { decimals: 2 },
      onCellChange,
    });
    render(<NumberEditor {...props} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('1.50');
    fireEvent.focus(input);
    // Edit value is the raw stored number, not the numeral-formatted display
    expect(input).toHaveValue('1.5');
    fireEvent.blur(input, { target: { value: input.value } });
    // Unchanged focus-then-blur keeps the value intact
    expect(onCellChange.mock.calls[0][0].e.target.value).toBe(1.5);
  });

  it('emits empty string for invalid input', () => {
    const onCellChange = vi.fn();
    const props = buildProps({ numeric: { decimals: 2 }, onCellChange });
    render(<NumberEditor {...props} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input, { target: { value: 'abc' } });
    expect(onCellChange.mock.calls[0][0].e.target.value).toBe('');
  });
});

describe('TableRecord with F_NUMBER column', () => {
  const buildOpt = (overrides = {}) => ({
    isSearch: false,
    isEditable: true,
    layer: { key: 'layer1' },
    f_obj: {
      field: 'tbl',
      sub_fields: [
        {
          id: 'c1',
          col_name: 'Score',
          type: FieldTypes.F_NUMBER,
          numeric: { decimals: 2, min: 0, max: 100 },
        },
      ],
      sub_values: [{ id: 'r1', c1: { value: 12.5 } }],
    },
    selectOptions: {},
    onSubChange: vi.fn(),
    onNavi: vi.fn(),
    genericType: 'Element',
    ...overrides,
  });

  it('renders the formatted stored value in the row', () => {
    const opt = buildOpt();
    renderWithDnd(<TableRecord opt={opt} />);
    // Editable cell exists with formatted value
    const inputs = screen.getAllByRole('textbox');
    const numberInput = inputs.find((i) => i.value === '12.50');
    expect(numberInput).toBeTruthy();
  });

  it('renders read-only NumberRenderer when isEditable is false', () => {
    const opt = buildOpt({ isEditable: false });
    const { container } = renderWithDnd(<TableRecord opt={opt} />);
    const inputs = screen.queryAllByRole('textbox');
    expect(inputs.find((i) => i.value === '12.50')).toBeFalsy();
    expect(container).toHaveTextContent(/12\.50/);
  });

  it('parses + clamps + persists on blur', () => {
    const opt = buildOpt();
    renderWithDnd(<TableRecord opt={opt} />);
    const inputs = screen.getAllByRole('textbox');
    const numberInput = inputs.find((i) => i.value === '12.50');
    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, { target: { value: '250.999' } });
    fireEvent.blur(numberInput, { target: { value: '250.999' } });
    expect(opt.onSubChange).toHaveBeenCalled();
    expect(opt.f_obj.sub_values[0].c1.value).toBe(100);
  });
});
