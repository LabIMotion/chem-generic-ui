import React from 'react';
import { render, screen } from '@testing-library/react';
import PropCalculate from '@components/fields/PropCalculate';
import { FieldTypes } from 'generic-ui-core';

// Mocking dependencies that might break the test environment
vi.mock('@components/fields/FieldHeader', () => ({
  default: () => <div data-testid="field-header" />,
}));
vi.mock('@components/tools/utils', () => ({
  fieldCls: () => ['group-cls', 'control-cls'],
}));
vi.mock('@components/icons/FIcons', () => ({
  faArrowRight: 'ArrowRight',
}));
vi.mock('@components/shared/LTooltip', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// Mock generic-ui-core so we can drive base-unit lookup from the test.
// FieldTypes is preserved with the values referenced in the component.
vi.mock('generic-ui-core', () => ({
  FieldTypes: {
    F_INTEGER: 'integer',
    F_NUMBER: 'number',
    F_FORMULA_FIELD: 'formula-field',
    F_SYSTEM_DEFINED: 'system-defined',
  },
  // Two quantities used by the system-defined cases:
  //  - mass:   g (base, nm=1), kg (nm=0.001), mg (nm=1000)
  //  - length: m (base, nm=1), cm (nm=100), mm (nm=1000)
  // Conversion ratio used by toBaseUnit: result = value * (baseNm / fromNm).
  genUnits: jest.fn((quantity) => {
    if (quantity === 'mass') {
      return [
        { key: 'g', label: 'g', nm: 1 },
        { key: 'kg', label: 'kg', nm: 0.001 },
        { key: 'mg', label: 'mg', nm: 1000 },
      ];
    }
    if (quantity === 'length') {
      return [
        { key: 'm', label: 'm', nm: 1 },
        { key: 'cm', label: 'cm', nm: 100 },
        { key: 'mm', label: 'mm', nm: 1000 },
      ];
    }
    if (quantity === 'duration') {
      return [
        { key: 's', label: 's', nm: 1 },
        { key: 'min', label: 'min', nm: 1 / 60 },
      ];
    }
    return [];
  }),
  unitConversion: jest.fn((q, u, v) => v),
}));

describe('PropCalculate', () => {
  const mockLayer = {
    fields: [
      { field: 'A', value: '10', type: FieldTypes.F_INTEGER },
      { field: 'B', value: '20', type: FieldTypes.F_INTEGER },
    ],
  };

  const defaultProps = {
    f_obj: { canAdjust: false, decimal: 2 },
    formula: 'A + B',
    layer: mockLayer,
    type: FieldTypes.F_FORMULA_FIELD,
    isEditable: true,
    onChange: jest.fn(),
  };

  test('calculates simple addition correctly', () => {
    render(<PropCalculate {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('30');
  });

  test('calculates with parentheses correctly', () => {
    render(<PropCalculate {...defaultProps} formula="(A + B) * 2" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('60');
  });

  test('handles missing fields by treating them as 0', () => {
    render(<PropCalculate {...defaultProps} formula="A + C" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('10'); // 10 + 0
  });

  test('respects decimal precision', () => {
    const props = {
      ...defaultProps,
      f_obj: { ...defaultProps.f_obj, decimal: 3 },
      formula: '10 / 3',
    };
    render(<PropCalculate {...props} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('3.333');
  });

  test('handles division by zero or errors gracefully', () => {
    render(<PropCalculate {...defaultProps} formula="10 / 0" />);
    const input = screen.getByRole('textbox');
    // mathjs 10/0 is Infinity
    expect(input).toHaveValue('Infinity');
  });

  test('displays error message for invalid syntax', () => {
    render(<PropCalculate {...defaultProps} formula="A + * B" />);
    const input = screen.getByRole('textbox');
    expect(input.value).toMatch(/expected|Unexpected/); // mathjs error message
  });

  test('handles field names starting with numbers (invalid identifiers)', () => {
    const layer = {
      fields: [{ field: '1_VAR', value: '5', type: FieldTypes.F_INTEGER }],
    };
    render(
      <PropCalculate {...defaultProps} formula="1_VAR * 2" layer={layer} />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('10');
  });

  test('handles potential collisions between field names and mapping prefix', () => {
    const layer = {
      fields: [
        { field: 'abc', value: '10', type: FieldTypes.F_INTEGER },
        { field: 'v1', value: '20', type: FieldTypes.F_INTEGER }, // Collision with our prefix
      ],
    };
    // If double-replacement happened, "abc" might become "v1" then "v2"
    render(
      <PropCalculate {...defaultProps} formula="abc + v1" layer={layer} />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('30');
  });

  test('handles exponentiation operator ** by converting to ^', () => {
    render(<PropCalculate {...defaultProps} formula="(A + B) ** 2" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('900'); // (10 + 20)**2 = 900
  });

  test('handles native exponentiation operator ^', () => {
    render(<PropCalculate {...defaultProps} formula="(A + B) ^ 2" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('900'); // (10 + 20)^2 = 900
  });

  describe('system-defined operands (base-unit normalization)', () => {
    // Case A: same quantity (mass) — A=1 kg, B=1000 g, both reduce to 1000 g
    // base. C = A / B * 100 = 100. Switching A's unit to g should not change
    // the result because A is normalized before substitution.
    test('normalizes same-quantity operands to base unit (kg vs g)', () => {
      const layer = {
        fields: [
          {
            field: 'A',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'kg',
            value: 1,
          },
          {
            field: 'B',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'g',
            value: 1000,
          },
        ],
      };
      render(
        <PropCalculate {...defaultProps} formula="A / B * 100" layer={layer} />,
      );
      expect(screen.getByRole('textbox')).toHaveValue('100');
    });

    test('result is invariant under unit-switch on a system-defined operand', () => {
      // Same scenario as above but A is now stored in mg (10^6 mg = 1 kg).
      const layer = {
        fields: [
          {
            field: 'A',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'mg',
            value: 1_000_000,
          },
          {
            field: 'B',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'g',
            value: 1000,
          },
        ],
      };
      render(
        <PropCalculate {...defaultProps} formula="A / B * 100" layer={layer} />,
      );
      expect(screen.getByRole('textbox')).toHaveValue('100');
    });

    // Case B: mixed quantities (length / duration). C = A / B with A=100 m,
    // B=10 s -> 10. Switching A to 10000 cm keeps C=10 because A normalizes
    // to 100 m base.
    test('normalizes mixed-quantity operands independently', () => {
      const layer = {
        fields: [
          {
            field: 'A',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'length',
            value_system: 'cm',
            value: 10000,
          },
          {
            field: 'B',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'duration',
            value_system: 's',
            value: 10,
          },
        ],
      };
      render(<PropCalculate {...defaultProps} formula="A / B" layer={layer} />);
      expect(screen.getByRole('textbox')).toHaveValue('10');
    });

    // Case C: empty value should be treated as 0 with no crash.
    test('treats empty system-defined value as 0 without conversion crash', () => {
      const layer = {
        fields: [
          {
            field: 'A',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'kg',
            value: '',
          },
          {
            field: 'B',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'g',
            value: 5,
          },
        ],
      };
      render(<PropCalculate {...defaultProps} formula="A + B" layer={layer} />);
      // A=0 (empty), B=5 g => 5 g base => 0 + 5 = 5
      expect(screen.getByRole('textbox')).toHaveValue('5');
    });

    // Legacy / partial data: missing value_system falls back to raw value.
    test('falls back to raw value when value_system is missing', () => {
      const layer = {
        fields: [
          {
            field: 'A',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            // value_system intentionally omitted
            value: 7,
          },
        ],
      };
      render(<PropCalculate {...defaultProps} formula="A * 2" layer={layer} />);
      expect(screen.getByRole('textbox')).toHaveValue('14');
    });

    // value_system_base = designer default unit; the result is expressed in it.
    test('expresses the result in the pinned base unit (value_system_base)', () => {
      const layer = {
        fields: [
          {
            field: 'A',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'kg',
            value_system_base: 'kg',
            value: 1,
          },
        ],
      };
      // base kg => A stays 1 (not 1000 g). A * 2 = 2.
      render(<PropCalculate {...defaultProps} formula="A * 2" layer={layer} />);
      expect(screen.getByRole('textbox')).toHaveValue('2');
    });

    test('pinned base keeps the result invariant under a unit-switch', () => {
      // Same field pinned to kg; whether stored as 1 kg or 1000 g, A * 2 = 2.
      const inG = {
        fields: [
          {
            field: 'A',
            type: FieldTypes.F_SYSTEM_DEFINED,
            option_layers: 'mass',
            value_system: 'g',
            value_system_base: 'kg',
            value: 1000,
          },
        ],
      };
      render(<PropCalculate {...defaultProps} formula="A * 2" layer={inG} />);
      expect(screen.getByRole('textbox')).toHaveValue('2');
    });
  });
});
