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
    expect(input.value).toBe('30');
  });

  test('calculates with parentheses correctly', () => {
    render(<PropCalculate {...defaultProps} formula="(A + B) * 2" />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('60');
  });

  test('handles missing fields by treating them as 0', () => {
    render(<PropCalculate {...defaultProps} formula="A + C" />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('10'); // 10 + 0
  });

  test('respects decimal precision', () => {
    const props = {
      ...defaultProps,
      f_obj: { ...defaultProps.f_obj, decimal: 3 },
      formula: '10 / 3',
    };
    render(<PropCalculate {...props} />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('3.333');
  });

  test('handles division by zero or errors gracefully', () => {
    render(<PropCalculate {...defaultProps} formula="10 / 0" />);
    const input = screen.getByRole('textbox');
    // mathjs 10/0 is Infinity
    expect(input.value).toBe('Infinity');
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
    render(<PropCalculate {...defaultProps} formula="1_VAR * 2" layer={layer} />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('10');
  });

  test('handles potential collisions between field names and mapping prefix', () => {
    const layer = {
      fields: [
        { field: 'abc', value: '10', type: FieldTypes.F_INTEGER },
        { field: 'v1', value: '20', type: FieldTypes.F_INTEGER }, // Collision with our prefix
      ],
    };
    // If double-replacement happened, "abc" might become "v1" then "v2"
    render(<PropCalculate {...defaultProps} formula="abc + v1" layer={layer} />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('30');
  });

  test('handles exponentiation operator ** by converting to ^', () => {
    render(<PropCalculate {...defaultProps} formula="(A + B) ** 2" />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('900'); // (10 + 20)**2 = 900
  });

  test('handles native exponentiation operator ^', () => {
    render(<PropCalculate {...defaultProps} formula="(A + B) ^ 2" />);
    const input = screen.getByRole('textbox');
    expect(input.value).toBe('900'); // (10 + 20)^2 = 900
  });
});
