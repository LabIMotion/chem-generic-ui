import {
  buildLayerFormula,
  calculateRowFormula,
  evalFormulaText,
  getEligibleOperands,
  operandValue,
  pruneFormulaRefs,
  recomputeFormulaCells,
  reconcileSystemCell,
  resolveFormulaDecimals,
} from '@utils/formulaUtils';
import { FieldTypes } from 'generic-ui-core';

// Mock generic-ui-core so we can drive base-unit lookup from the test
// (same fixtures as PropCalculate.test.js).
vi.mock('generic-ui-core', () => ({
  FieldTypes: {
    F_INTEGER: 'integer',
    F_NUMBER: 'number',
    F_FORMULA_FIELD: 'formula-field',
    F_SYSTEM_DEFINED: 'system-defined',
    F_TEXT: 'text',
  },
  genUnits: jest.fn((quantity) => {
    if (quantity === 'mass') {
      return [
        { key: 'g', label: 'g', nm: 1 },
        { key: 'kg', label: 'kg', nm: 0.001 },
        { key: 'mg', label: 'mg', nm: 1000 },
      ];
    }
    return [];
  }),
  unitConversion: jest.fn((q, u, v) => v),
}));

describe('operandValue', () => {
  test('parses number fields', () => {
    expect(operandValue({ type: FieldTypes.F_NUMBER, value: '2.5' })).toBe(2.5);
  });

  test('treats empty number value as 0', () => {
    expect(operandValue({ type: FieldTypes.F_NUMBER, value: '' })).toBe(0);
  });

  test('normalizes system-defined values to base unit', () => {
    expect(
      operandValue({
        type: FieldTypes.F_SYSTEM_DEFINED,
        option_layers: 'mass',
        value_system: 'kg',
        value: 1,
      }),
    ).toBe(1000);
  });

  test('falls back to raw value without unit metadata', () => {
    expect(
      operandValue({
        type: FieldTypes.F_SYSTEM_DEFINED,
        option_layers: 'mass',
        value: 7,
      }),
    ).toBe(7);
  });

  test('treats empty system-defined value as 0', () => {
    expect(
      operandValue({
        type: FieldTypes.F_SYSTEM_DEFINED,
        option_layers: 'mass',
        value_system: 'kg',
        value: '',
      }),
    ).toBe(0);
  });

  test('uses baseUnit (designer default) as the normalization base', () => {
    // value already in the base unit (kg) => no conversion
    expect(
      operandValue(
        {
          type: FieldTypes.F_SYSTEM_DEFINED,
          option_layers: 'mass',
          value_system: 'kg',
          value: 1,
        },
        'kg',
      ),
    ).toBe(1);
  });

  test('converts the current unit into the baseUnit', () => {
    // 1 g expressed in the kg base = 0.001
    expect(
      operandValue(
        {
          type: FieldTypes.F_SYSTEM_DEFINED,
          option_layers: 'mass',
          value_system: 'g',
          value: 1,
        },
        'kg',
      ),
    ).toBe(0.001);
  });

  test('falls back to nm===1 base when baseUnit is unknown', () => {
    expect(
      operandValue(
        {
          type: FieldTypes.F_SYSTEM_DEFINED,
          option_layers: 'mass',
          value_system: 'kg',
          value: 1,
        },
        'zzz',
      ),
    ).toBe(1000);
  });
});

describe('reconcileSystemCell', () => {
  test('relabels on a same-quantity unit change, keeping the typed value (g -> kg)', () => {
    expect(
      reconcileSystemCell({ value: 1000, value_system: 'g' }, 'kg', 'mass'),
    ).toEqual({ value: 1000, value_system: 'kg' });
  });

  test('relabels g -> mg without converting', () => {
    expect(
      reconcileSystemCell({ value: 1000, value_system: 'g' }, 'mg', 'mass'),
    ).toEqual({ value: 1000, value_system: 'mg' });
  });

  test('the default-unit change relabels, keeping the entered magnitude', () => {
    // The formula base IS the column default unit (cellOperandValue), so a
    // designer default-unit change must keep the typed magnitude and only
    // relabel: this keeps BOTH the entered value and the formula result stable,
    // matching the independent/InputGroup system-defined fields. (Supersedes
    // the earlier "convert" behavior, which changed the value 1000 -> 1 and,
    // with the movable base, silently changed the formula result too.)
    const out = reconcileSystemCell(
      { value: 1000, value_system: 'g' },
      'kg',
      'mass',
    );
    expect(out.value_system).toBe('kg');
    expect(out.value).toBe(1000); // relabeled, not converted to 1
  });

  test('a Work-Area default-unit change keeps the entered value AND the formula result', () => {
    // Designer entered 3 in a system-defined column (default unit g), with a
    // formula column that echoes it. Changing the column default g -> mg must
    // leave both the entered value and the computed formula at 3.
    const sysCol = {
      id: 'c1',
      type: FieldTypes.F_SYSTEM_DEFINED,
      option_layers: 'mass',
      value_system: 'g',
    };
    const formulaCol = {
      id: 'c2',
      type: FieldTypes.F_FORMULA_FIELD,
      formula: 'w',
      decimal: 5,
      refs: [{ abbr: 'w', id: 'c1' }],
    };
    const cell = { value: 3, value_system: 'g' };

    const before = calculateRowFormula(
      'w',
      formulaCol.refs,
      [sysCol, formulaCol],
      { id: 'r1', c1: cell },
      5,
    );
    expect(before).toBe(3);

    // Work Area: change the column default g -> mg.
    const reCell = reconcileSystemCell(cell, 'mg', 'mass');
    expect(reCell).toEqual({ value: 3, value_system: 'mg' }); // entered value unchanged
    const sysColMg = { ...sysCol, value_system: 'mg' };

    const after = calculateRowFormula(
      'w',
      formulaCol.refs,
      [sysColMg, formulaCol],
      { id: 'r1', c1: reCell },
      5,
    );
    expect(after).toBe(3); // formula result unchanged
  });

  test('is a no-op when the unit is unchanged', () => {
    expect(
      reconcileSystemCell({ value: 5, value_system: 'g' }, 'g', 'mass'),
    ).toEqual({ value: 5, value_system: 'g' });
  });

  test('leaves an empty value, adopts the column unit', () => {
    expect(
      reconcileSystemCell({ value: '', value_system: 'g' }, 'kg', 'mass'),
    ).toEqual({ value: '', value_system: 'kg' });
  });

  test('drops the value when the cell unit is invalid for the quantity', () => {
    // 'ml' is not a unit of 'mass' -> quantity changed -> stale value cleared
    expect(
      reconcileSystemCell({ value: 7, value_system: 'ml' }, 'g', 'mass'),
    ).toEqual({ value: '', value_system: 'g' });
  });

  test('handles a non-object cell', () => {
    expect(reconcileSystemCell(undefined, 'kg', 'mass')).toEqual({
      value: '',
      value_system: 'kg',
    });
  });

  test('falls back to the quantity first unit when no column unit', () => {
    expect(
      reconcileSystemCell({ value: '', value_system: '' }, '', 'mass'),
    ).toEqual({ value: '', value_system: 'g' });
  });
});

describe('resolveFormulaDecimals', () => {
  test('preserves 0 (0-decimal columns configurable)', () => {
    expect(resolveFormulaDecimals(0)).toBe(0);
    expect(resolveFormulaDecimals('0')).toBe(0);
  });

  test('defaults to 5 when unset or invalid', () => {
    expect(resolveFormulaDecimals(undefined)).toBe(5);
    expect(resolveFormulaDecimals(null)).toBe(5);
    expect(resolveFormulaDecimals('')).toBe(5);
    expect(resolveFormulaDecimals('abc')).toBe(5);
  });

  test('clamps negatives to 0', () => {
    expect(resolveFormulaDecimals(-2)).toBe(0);
    expect(resolveFormulaDecimals('-7')).toBe(0);
  });

  test('passes positive integers through', () => {
    expect(resolveFormulaDecimals(3)).toBe(3);
    expect(resolveFormulaDecimals('2')).toBe(2);
  });
});

describe('buildLayerFormula + evalFormulaText (layer parity)', () => {
  const fields = [
    { field: 'A', value: '10', type: FieldTypes.F_INTEGER },
    { field: 'B', value: '20', type: FieldTypes.F_INTEGER },
  ];

  test('substitutes named operands', () => {
    expect(evalFormulaText(buildLayerFormula('A + B', fields), 2)).toBe(30);
  });

  test('missing operand resolves to 0', () => {
    expect(evalFormulaText(buildLayerFormula('A + C', fields), 2)).toBe(10);
  });

  test('converts ** to ^', () => {
    expect(evalFormulaText(buildLayerFormula('(A + B) ** 2', fields), 2)).toBe(
      900,
    );
  });

  test('invalid syntax returns error message', () => {
    expect(evalFormulaText(buildLayerFormula('A + * B', fields), 2)).toMatch(
      /expected|Unexpected/,
    );
  });

  test('division by zero yields Infinity', () => {
    expect(evalFormulaText('10 / 0', 2)).toBe(Infinity);
  });

  test('respects decimal precision', () => {
    expect(evalFormulaText('10 / 3', 3)).toBe(3.333);
  });
});

describe('buildLayerFormula with value_system_base (designer default base)', () => {
  const sysField = (overrides) => ({
    field: 'A',
    type: FieldTypes.F_SYSTEM_DEFINED,
    option_layers: 'mass',
    ...overrides,
  });

  test('result is expressed in the pinned base unit', () => {
    const fields = [
      sysField({ value: 1, value_system: 'kg', value_system_base: 'kg' }),
    ];
    expect(evalFormulaText(buildLayerFormula('A * 2', fields), 5)).toBe(2);
  });

  test('is invariant when the user switches the display unit', () => {
    const inKg = [
      sysField({ value: 1, value_system: 'kg', value_system_base: 'kg' }),
    ];
    const inG = [
      sysField({ value: 1000, value_system: 'g', value_system_base: 'kg' }),
    ];
    expect(evalFormulaText(buildLayerFormula('A * 2', inKg), 5)).toBe(2);
    expect(evalFormulaText(buildLayerFormula('A * 2', inG), 5)).toBe(2);
  });

  test('without value_system_base falls back to the nm===1 base', () => {
    const fields = [sysField({ value: 1, value_system: 'kg' })];
    // 1 kg -> 1000 g (nm===1 base), * 2 = 2000
    expect(evalFormulaText(buildLayerFormula('A * 2', fields), 5)).toBe(2000);
  });
});

describe('table formula columns', () => {
  const colNum = {
    id: 'aaaa-1',
    col_name: 'Amount',
    type: FieldTypes.F_NUMBER,
  };
  const colSys = {
    id: 'bbbb-2',
    col_name: 'Weight',
    type: FieldTypes.F_SYSTEM_DEFINED,
    option_layers: 'mass',
    value_system: 'g',
  };
  const colText = { id: 'cccc-3', col_name: 'Note', type: FieldTypes.F_TEXT };
  const colFormula = {
    id: 'dddd-4',
    col_name: 'Total',
    type: FieldTypes.F_FORMULA_FIELD,
    formula: 'a * w',
    decimal: 2,
    refs: [
      { abbr: 'a', id: 'aaaa-1' },
      { abbr: 'w', id: 'bbbb-2' },
    ],
  };
  const subFields = [colNum, colSys, colText, colFormula];

  describe('getEligibleOperands', () => {
    test('keeps only number and system-defined columns', () => {
      expect(getEligibleOperands(subFields).map((sf) => sf.id)).toEqual([
        'aaaa-1',
        'bbbb-2',
      ]);
    });
  });

  describe('calculateRowFormula', () => {
    const row = {
      id: 'row-1',
      'aaaa-1': { value: 3 },
      'bbbb-2': { value: 2, value_system: 'g' },
    };

    test('computes from number and system-defined cells', () => {
      expect(
        calculateRowFormula('a * w', colFormula.refs, subFields, row, 2),
      ).toBe(6);
    });

    test('is invariant under unit-switch (base-unit normalization)', () => {
      const rowKg = {
        ...row,
        'bbbb-2': { value: 0.002, value_system: 'kg' },
      };
      expect(
        calculateRowFormula('a * w', colFormula.refs, subFields, rowKg, 2),
      ).toBe(6);
    });

    test('falls back to column unit when cell has none', () => {
      const rowNoUnit = { ...row, 'bbbb-2': { value: 2 } };
      expect(
        calculateRowFormula('a * w', colFormula.refs, subFields, rowNoUnit, 2),
      ).toBe(6);
    });

    test('unknown abbreviation resolves to 0', () => {
      expect(
        calculateRowFormula('a + x', colFormula.refs, subFields, row, 2),
      ).toBe(3);
    });

    test('ref to deleted column resolves to 0', () => {
      const refs = [...colFormula.refs, { abbr: 'gone', id: 'zzzz-9' }];
      expect(calculateRowFormula('a + gone', refs, subFields, row, 2)).toBe(3);
    });

    test('ref to non-eligible (text) column resolves to 0', () => {
      const refs = [{ abbr: 'n', id: 'cccc-3' }];
      expect(calculateRowFormula('n + 1', refs, subFields, row, 2)).toBe(1);
    });

    test('empty cells count as 0', () => {
      const emptyRow = { id: 'row-2', 'aaaa-1': { value: '' } };
      expect(
        calculateRowFormula('a + w', colFormula.refs, subFields, emptyRow, 2),
      ).toBe(0);
    });

    test('negative values survive substitution', () => {
      const negRow = { ...row, 'aaaa-1': { value: -3 } };
      expect(
        calculateRowFormula('a * w', colFormula.refs, subFields, negRow, 2),
      ).toBe(-6);
    });

    test('supports ** and respects decimal', () => {
      expect(
        calculateRowFormula('a ** 2 / 7', colFormula.refs, subFields, row, 3),
      ).toBe(1.286);
    });

    test('decimal 0 rounds to integer (not forced to 5)', () => {
      expect(
        calculateRowFormula('a / 7', colFormula.refs, subFields, row, 0),
      ).toBe(0);
      expect(
        calculateRowFormula('a * w / 7', colFormula.refs, subFields, row, 0),
      ).toBe(1);
    });

    test('negative decimal clamps to 0 instead of erroring', () => {
      expect(
        calculateRowFormula('a * w / 7', colFormula.refs, subFields, row, -2),
      ).toBe(1);
    });

    test('scientific notation is not substituted as a token', () => {
      expect(
        calculateRowFormula('a * 1e3', colFormula.refs, subFields, row, 2),
      ).toBe(3000);
      expect(
        calculateRowFormula('a + 1.5e2', colFormula.refs, subFields, row, 2),
      ).toBe(153);
    });

    test('invalid syntax returns error message', () => {
      expect(
        calculateRowFormula('a + * w', colFormula.refs, subFields, row, 2),
      ).toMatch(/expected|Unexpected/);
    });

    test('empty formula returns empty string', () => {
      expect(calculateRowFormula('', colFormula.refs, subFields, row, 2)).toBe(
        '',
      );
    });
  });

  describe('column base unit = column value_system (designer default)', () => {
    const colSysKg = {
      id: 'bbbb-2',
      col_name: 'Weight',
      type: FieldTypes.F_SYSTEM_DEFINED,
      option_layers: 'mass',
      value_system: 'kg',
    };
    const subFieldsKg = [colNum, colSysKg, colFormula];
    const { refs } = colFormula;

    test('normalizes cells to the column default (kg), not nm===1 (g)', () => {
      // cell entered in g; column base kg => 1000 g = 1 kg
      const row = {
        'aaaa-1': { value: 3 },
        'bbbb-2': { value: 1000, value_system: 'g' },
      };
      expect(calculateRowFormula('a * w', refs, subFieldsKg, row, 5)).toBe(3);
    });

    test('is invariant when the cell unit is switched', () => {
      const rowKg = {
        'aaaa-1': { value: 3 },
        'bbbb-2': { value: 1, value_system: 'kg' },
      };
      expect(calculateRowFormula('a * w', refs, subFieldsKg, rowKg, 5)).toBe(3);
    });
  });

  describe('pruneFormulaRefs', () => {
    test('drops refs to deleted columns, keeps refs to existing ones', () => {
      const formulaCol = {
        ...colFormula,
        refs: [...colFormula.refs, { abbr: 'gone', id: 'zzzz-9' }],
      };
      const fields = [colNum, colSys, colText, formulaCol];
      pruneFormulaRefs(fields);
      expect(formulaCol.refs).toEqual([
        { abbr: 'a', id: 'aaaa-1' },
        { abbr: 'w', id: 'bbbb-2' },
      ]);
    });

    test('keeps refs to retyped (non-eligible) columns', () => {
      const formulaCol = {
        ...colFormula,
        refs: [{ abbr: 'n', id: 'cccc-3' }],
      };
      const fields = [colNum, colSys, colText, formulaCol];
      pruneFormulaRefs(fields);
      expect(formulaCol.refs).toEqual([{ abbr: 'n', id: 'cccc-3' }]);
    });

    test('ignores non-formula columns and missing refs', () => {
      const fields = [colNum, { ...colFormula, refs: undefined }];
      expect(() => pruneFormulaRefs(fields)).not.toThrow();
    });
  });

  describe('recomputeFormulaCells', () => {
    test('writes computed values into sub_values', () => {
      const fObj = {
        sub_fields: subFields,
        sub_values: [
          {
            id: 'row-1',
            'aaaa-1': { value: 3 },
            'bbbb-2': { value: 2, value_system: 'g' },
            'dddd-4': { value: '' },
          },
          {
            id: 'row-2',
            'aaaa-1': { value: 10 },
            'bbbb-2': { value: 0.001, value_system: 'kg' },
            'dddd-4': { value: '' },
          },
        ],
      };
      recomputeFormulaCells(fObj);
      expect(fObj.sub_values[0]['dddd-4']).toEqual({ value: 6 });
      expect(fObj.sub_values[1]['dddd-4']).toEqual({ value: 10 });
    });

    test('stores empty value when formula errors', () => {
      const broken = {
        ...colFormula,
        formula: 'a + * w',
      };
      const fObj = {
        sub_fields: [colNum, colSys, broken],
        sub_values: [{ id: 'row-1', 'aaaa-1': { value: 3 } }],
      };
      recomputeFormulaCells(fObj);
      expect(fObj.sub_values[0]['dddd-4']).toEqual({ value: '' });
    });

    test('row-scoped recompute only touches the given row', () => {
      const fObj = {
        sub_fields: subFields,
        sub_values: [
          {
            id: 'row-1',
            'aaaa-1': { value: 3 },
            'bbbb-2': { value: 2, value_system: 'g' },
            'dddd-4': { value: 'stale' },
          },
          {
            id: 'row-2',
            'aaaa-1': { value: 10 },
            'bbbb-2': { value: 1, value_system: 'g' },
            'dddd-4': { value: 'stale' },
          },
        ],
      };
      recomputeFormulaCells(fObj, fObj.sub_values[1]);
      expect(fObj.sub_values[0]['dddd-4']).toEqual({ value: 'stale' });
      expect(fObj.sub_values[1]['dddd-4']).toEqual({ value: 10 });
    });

    test('is a no-op without formula columns', () => {
      const fObj = {
        sub_fields: [colNum],
        sub_values: [{ id: 'row-1', 'aaaa-1': { value: 3 } }],
      };
      const before = JSON.parse(JSON.stringify(fObj.sub_values));
      recomputeFormulaCells(fObj);
      expect(fObj.sub_values).toEqual(before);
    });
  });
});
