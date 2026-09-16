import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FieldTypes } from 'generic-ui-core';
import TableRecord from '@components/table/TableRecord';
import FormulaRenderer from '@components/table/FormulaRenderer';
import FormulaColumnModal from '@components/elements/FormulaColumnModal';
import DefinedRenderer from '@components/elements/DefinedRenderer';

const renderWithDnd = (ui) =>
  render(<DndProvider backend={HTML5Backend}>{ui}</DndProvider>);

// Real generic-ui-core units: mass -> g (base, nm=1), mg (nm=1000).
const colNum = {
  id: 'c1',
  col_name: 'Amount',
  type: FieldTypes.F_NUMBER,
  numeric: { decimals: 2, min: '', max: '' },
};
const colSys = {
  id: 'c2',
  col_name: 'Weight',
  type: FieldTypes.F_SYSTEM_DEFINED,
  option_layers: 'mass',
  value_system: 'g',
};
const colFormula = {
  id: 'c3',
  col_name: 'Total',
  type: FieldTypes.F_FORMULA_FIELD,
  formula: 'a * w',
  decimal: 2,
  refs: [
    { abbr: 'a', id: 'c1' },
    { abbr: 'w', id: 'c2' },
  ],
};
const subFields = [colNum, colSys, colFormula];

describe('FormulaRenderer', () => {
  it('computes from number and system-defined cells', () => {
    const node = {
      data: {
        id: 'r1',
        c1: { value: 3 },
        c2: { value: 2, value_system: 'g' },
      },
    };
    const { container } = render(
      <FormulaRenderer sField={colFormula} subFields={subFields} node={node} />,
    );
    expect(container).toHaveTextContent('6');
  });

  it('normalizes system-defined cells to base unit (mg -> g)', () => {
    const node = {
      data: {
        id: 'r1',
        c1: { value: 3 },
        c2: { value: 2000, value_system: 'mg' },
      },
    };
    const { container } = render(
      <FormulaRenderer sField={colFormula} subFields={subFields} node={node} />,
    );
    expect(container).toHaveTextContent('6');
  });

  it('treats refs to missing columns as 0', () => {
    const sField = {
      ...colFormula,
      formula: 'a + gone',
      refs: [...colFormula.refs, { abbr: 'gone', id: 'zz' }],
    };
    const node = { data: { id: 'r1', c1: { value: 3 } } };
    const { container } = render(
      <FormulaRenderer sField={sField} subFields={subFields} node={node} />,
    );
    expect(container).toHaveTextContent('3');
  });

  it('shows the evaluation error message for invalid syntax', () => {
    const sField = { ...colFormula, formula: 'a + * w' };
    const node = { data: { id: 'r1', c1: { value: 3 } } };
    const { container } = render(
      <FormulaRenderer sField={sField} subFields={subFields} node={node} />,
    );
    expect(container).toHaveTextContent(/expected|Unexpected/);
  });
});

describe('TableRecord with F_FORMULA_FIELD column', () => {
  const buildOpt = (overrides = {}) => ({
    isSearch: false,
    isEditable: true,
    layer: { key: 'layer1' },
    f_obj: {
      field: 'tbl',
      sub_fields: JSON.parse(JSON.stringify(subFields)),
      sub_values: [
        {
          id: 'r1',
          c1: { value: 3 },
          c2: { value: 2, value_system: 'g' },
          c3: { value: '' },
        },
      ],
    },
    selectOptions: {},
    onSubChange: vi.fn(),
    onNavi: vi.fn(),
    genericType: 'Element',
    ...overrides,
  });

  it('renders the computed formula value in the row', () => {
    const opt = buildOpt();
    const { container } = renderWithDnd(<TableRecord opt={opt} />);
    expect(container).toHaveTextContent(/6/);
  });

  it('write-through: editing an operand recomputes the stored formula cell', () => {
    const opt = buildOpt();
    renderWithDnd(<TableRecord opt={opt} />);
    const inputs = screen.getAllByRole('textbox');
    const numberInput = inputs.find((i) => i.value === '3.00');
    fireEvent.focus(numberInput);
    fireEvent.change(numberInput, { target: { value: '5' } });
    fireEvent.blur(numberInput, { target: { value: '5' } });
    expect(opt.onSubChange).toHaveBeenCalled();
    expect(opt.f_obj.sub_values[0].c3).toEqual({ value: 10 });
  });

  it('write-through: cycling a unit keeps the stored formula value invariant', () => {
    const opt = buildOpt();
    renderWithDnd(<TableRecord opt={opt} />);
    // UConverterRenderer renders a button labelled with the current unit
    const unitBtn = screen.getByRole('button', { name: 'g' });
    fireEvent.click(unitBtn);
    expect(opt.onSubChange).toHaveBeenCalled();
    // 2 g -> 2000 mg, normalized back to base for the formula
    expect(opt.f_obj.sub_values[0].c2.value_system).not.toBe('g');
    expect(opt.f_obj.sub_values[0].c3).toEqual({ value: 6 });
  });

  it('shows the column default unit in the header info tooltip', async () => {
    const opt = buildOpt();
    renderWithDnd(<TableRecord opt={opt} />);
    const info = screen.getByRole('button', {
      name: /Weight column default unit/i,
    });
    expect(info).toBeInTheDocument();
    fireEvent.mouseOver(info);
    // label is wrapped by genUnitSup, so the unit sits in a child node
    const tip = await screen.findByText(/default unit:/i);
    expect(tip).toHaveTextContent(/default unit:\s*g/i);
  });

  it('renders superscripts in the header tooltip, not raw HTML', async () => {
    // acceleration unit "mm_s2" has label "mm/s²" — Unicode superscript
    // since chem-units 2.2.0-rc4 (no HTML markup left in any unit label)
    const sysCol = {
      id: 'c2',
      col_name: 'Accel',
      type: FieldTypes.F_SYSTEM_DEFINED,
      option_layers: 'acceleration',
      value_system: 'mm_s2',
    };
    const opt = buildOpt({
      f_obj: { field: 'tbl', sub_fields: [sysCol], sub_values: [] },
    });
    renderWithDnd(<TableRecord opt={opt} />);
    const info = screen.getByRole('button', {
      name: /Accel column default unit/i,
    });
    fireEvent.mouseOver(info);
    const tip = await screen.findByText(/default unit:/i);
    // the superscript glyph is shown; no raw or escaped markup leaks through
    expect(tip).toHaveTextContent('mm/s²');
    expect(tip).not.toHaveTextContent('<sup>');
  });
});

describe('FormulaColumnModal', () => {
  const columns = [colNum, colSys];
  const baseProps = () => ({
    show: true,
    onHide: vi.fn(),
    columns,
    initial: { formula: '', decimal: 5, refs: [] },
    onSave: vi.fn(),
  });

  it('lists eligible columns with suggested abbreviations', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByLabelText('abbr for Amount').value).toBe('Amount');
    expect(screen.getByLabelText('abbr for Weight').value).toBe('Weight');
  });

  it('keeps existing abbreviations from refs', () => {
    const props = baseProps();
    props.initial = {
      formula: 'a * w',
      decimal: 2,
      refs: [
        { abbr: 'a', id: 'c1' },
        { abbr: 'w', id: 'c2' },
      ],
    };
    render(<FormulaColumnModal {...props} />);
    expect(screen.getByLabelText('abbr for Amount').value).toBe('a');
    expect(screen.getByLabelText('abbr for Weight').value).toBe('w');
  });

  it('saves formula, decimal and refs', () => {
    const props = baseProps();
    render(<FormulaColumnModal {...props} />);
    fireEvent.change(screen.getByLabelText('abbr for Amount'), {
      target: { value: 'a' },
    });
    fireEvent.change(screen.getByLabelText('abbr for Weight'), {
      target: { value: 'w' },
    });
    fireEvent.change(screen.getByLabelText('formula'), {
      target: { value: 'a * w' },
    });
    fireEvent.change(screen.getByLabelText('decimal'), {
      target: { value: '3' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(props.onSave).toHaveBeenCalledWith({
      formula: 'a * w',
      decimal: 3,
      refs: [
        { abbr: 'a', id: 'c1' },
        { abbr: 'w', id: 'c2' },
      ],
    });
  });

  it('blocks save on invalid abbreviation', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    fireEvent.change(screen.getByLabelText('abbr for Amount'), {
      target: { value: '1bad' },
    });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByText(/invalid/)).toBeInTheDocument();
  });

  it('blocks save on duplicate abbreviations', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    fireEvent.change(screen.getByLabelText('abbr for Amount'), {
      target: { value: 'x' },
    });
    fireEvent.change(screen.getByLabelText('abbr for Weight'), {
      target: { value: 'x' },
    });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByText(/used more than once/)).toBeInTheDocument();
  });

  it('hints about unknown tokens in the formula', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    fireEvent.change(screen.getByLabelText('formula'), {
      target: { value: 'Amount * unknown_token' },
    });
    expect(screen.getByText(/unknown_token/)).toBeInTheDocument();
    // Unknown tokens warn but do not block saving
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  });

  it('does not flag scientific-notation exponents as unknown tokens', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    fireEvent.change(screen.getByLabelText('formula'), {
      target: { value: 'Amount * 1e3 + 1.5e2' },
    });
    expect(screen.queryByText(/Unknown in formula/)).not.toBeInTheDocument();
  });

  it('hints about refs to deleted columns', () => {
    const props = baseProps();
    props.initial = {
      formula: 'old_ref * 2',
      decimal: 5,
      refs: [{ abbr: 'old_ref', id: 'gone-col' }],
    };
    render(<FormulaColumnModal {...props} />);
    expect(screen.getByText(/will be dropped/)).toBeInTheDocument();
  });

  it('greys out non-eligible columns and preserves their refs on save', () => {
    const colText = { id: 'c4', col_name: 'Note', type: FieldTypes.F_TEXT };
    const props = baseProps();
    props.columns = [colNum, colText];
    props.initial = {
      formula: 'a + n',
      decimal: 2,
      refs: [
        { abbr: 'a', id: 'c1' },
        { abbr: 'n', id: 'c4' }, // column retyped to text after ref was made
      ],
    };
    render(<FormulaColumnModal {...props} />);
    const textAbbr = screen.getByLabelText('abbr for Note');
    expect(textAbbr).toBeDisabled();
    expect(textAbbr.value).toBe('n');
    expect(screen.getByText(/not eligible — counts as 0/)).toBeInTheDocument();
    // hint about formula token referencing the retyped column
    expect(
      screen.getByText(/count as 0 until the type is switched back/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(props.onSave).toHaveBeenCalledWith({
      formula: 'a + n',
      decimal: 2,
      refs: [
        { abbr: 'a', id: 'c1' },
        { abbr: 'n', id: 'c4' },
      ],
    });
  });

  it('greys out sibling formula columns and preserves their refs on save', () => {
    const colF2 = {
      id: 'c5',
      col_name: 'Subtotal',
      type: FieldTypes.F_FORMULA_FIELD,
      formula: '',
      decimal: 5,
      refs: [],
    };
    const props = baseProps();
    props.columns = [colNum, colF2];
    props.initial = {
      formula: 'a + s',
      decimal: 2,
      refs: [
        { abbr: 'a', id: 'c1' },
        { abbr: 's', id: 'c5' }, // column retyped to formula after ref was made
      ],
    };
    render(<FormulaColumnModal {...props} />);
    const formulaAbbr = screen.getByLabelText('abbr for Subtotal');
    expect(formulaAbbr).toBeDisabled();
    expect(formulaAbbr.value).toBe('s');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(props.onSave).toHaveBeenCalledWith({
      formula: 'a + s',
      decimal: 2,
      refs: [
        { abbr: 'a', id: 'c1' },
        { abbr: 's', id: 'c5' },
      ],
    });
  });

  it('does not auto-suggest abbreviations for non-eligible columns', () => {
    const colText = { id: 'c4', col_name: 'Note', type: FieldTypes.F_TEXT };
    const props = baseProps();
    props.columns = [colNum, colText];
    render(<FormulaColumnModal {...props} />);
    expect(screen.getByLabelText('abbr for Note').value).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    // no ref saved for the text column (empty abbr filtered out)
    expect(props.onSave.mock.calls[0][0].refs).toEqual([
      { abbr: 'Amount', id: 'c1' },
    ]);
  });

  it('shows a notice when no eligible columns exist', () => {
    const props = { ...baseProps(), columns: [] };
    render(<FormulaColumnModal {...props} />);
    expect(screen.getByText(/No eligible columns/)).toBeInTheDocument();
  });

  it('shows the notice when only non-eligible columns exist', () => {
    const colText = { id: 'c4', col_name: 'Note', type: FieldTypes.F_TEXT };
    const props = { ...baseProps(), columns: [colText] };
    render(<FormulaColumnModal {...props} />);
    expect(screen.getByText(/No eligible columns/)).toBeInTheDocument();
    // the greyed sibling list is still rendered alongside the notice
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('hides the notice when an eligible column exists', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    expect(screen.queryByText(/No eligible columns/)).not.toBeInTheDocument();
  });

  it('defaults cleared or invalid decimal input to 5 on save', () => {
    const props = baseProps();
    render(<FormulaColumnModal {...props} />);
    fireEvent.change(screen.getByLabelText('decimal'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(props.onSave.mock.calls[0][0].decimal).toBe(5);
  });

  it('preserves decimal 0 on save', () => {
    const props = baseProps();
    render(<FormulaColumnModal {...props} />);
    fireEvent.change(screen.getByLabelText('decimal'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(props.onSave.mock.calls[0][0].decimal).toBe(0);
  });

  it('shows the column ids in the sibling table', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    expect(screen.getByText('Id')).toBeInTheDocument();
    expect(screen.getByText('c1')).toBeInTheDocument();
    expect(screen.getByText('c2')).toBeInTheDocument();
  });

  it('explains abbreviation usage next to the formula label', () => {
    render(<FormulaColumnModal {...baseProps()} />);
    expect(
      screen.getByText(/reference columns by their Abbr\./),
    ).toBeInTheDocument();
  });
});

describe('DefinedRenderer formula cell', () => {
  const renderCell = (formula) =>
    render(
      <DefinedRenderer
        node={{ data: { id: 'c3', type: FieldTypes.F_FORMULA_FIELD, formula } }}
        setFormulaProps={vi.fn()}
        getSiblingColumns={() => []}
        unitConfig={[]}
        selectOptions={[]}
      />,
    );

  it('renders only the Formula button, no formula input', () => {
    renderCell('');
    expect(screen.getByRole('button', { name: 'Formula' })).toBeInTheDocument();
    expect(screen.queryByLabelText('formula')).not.toBeInTheDocument();
  });

  it('uses a light button while no formula is set', () => {
    renderCell('');
    expect(screen.getByRole('button', { name: 'Formula' })).toHaveClass(
      'btn-light',
    );
  });

  it('switches the button color once a formula is entered', () => {
    renderCell('a * w');
    expect(screen.getByRole('button', { name: 'Formula' })).toHaveClass(
      'btn-primary',
    );
  });
});

describe('DefinedRenderer system-defined cell (Default Unit button)', () => {
  const renderSys = (selUnit, valueSystem = 'g') =>
    render(
      <DefinedRenderer
        node={{
          data: {
            id: 'c2',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: valueSystem,
          },
        }}
        unitConfig={[{ value: 'mass', name: 'mass', label: 'mass' }]}
        selDefined={vi.fn()}
        selUnit={selUnit}
        selectOptions={[]}
      />,
    );

  it('renders a Default Unit button showing the current unit', () => {
    renderSys(vi.fn());
    // the unit button's accessible name is the current unit label
    expect(screen.getByRole('button', { name: 'g' })).toBeInTheDocument();
  });

  it('cycles to the next unit and calls selUnit on click', () => {
    const selUnit = vi.fn();
    renderSys(selUnit);
    fireEvent.click(screen.getByRole('button', { name: 'g' }));
    expect(selUnit).toHaveBeenCalledTimes(1);
    const nextKey = selUnit.mock.calls[0][0];
    expect(typeof nextKey).toBe('string');
    expect(nextKey).not.toBe('g');
  });
});
