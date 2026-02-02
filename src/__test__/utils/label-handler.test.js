import {
  validateLabelFields,
  computeDynamicDisplayName,
  updateLabelFieldsOnRemoval,
  getAvailableFieldsForLabel,
} from '@utils/template/label-handler';
import { isFieldEffectivelyVisible } from '@utils/template/visibility-handler';

jest.mock('@utils/template/visibility-handler', () => ({
  isFieldEffectivelyVisible: jest.fn(),
}));

describe('validateLabelFields', () => {
  const layerFields = [
    { field: 'mode', type: 'select', label: 'Operation mode' },
    { field: 'atmosphere', type: 'select', label: 'Atmosphere' },
    { field: 'temperature', type: 'text', label: 'Temperature' },
    {
      field: 'readonly_notes',
      type: 'text',
      label: 'Readonly Notes',
      readonly: true,
    },
    { field: 'data', type: 'table', label: 'Data Table' }, // Invalid type
  ];

  it('should return only valid field names', () => {
    const labelFields = ['mode', 'atmosphere', 'temperature'];
    const result = validateLabelFields(labelFields, layerFields);
    expect(result).toEqual(['mode', 'atmosphere', 'temperature']);
  });

  it('should filter out fields with invalid types', () => {
    const labelFields = ['mode', 'data', 'temperature'];
    const result = validateLabelFields(labelFields, layerFields);
    expect(result).toEqual(['mode', 'temperature']);
  });

  it('should filter out readonly text fields', () => {
    const labelFields = ['mode', 'readonly_notes', 'temperature'];
    const result = validateLabelFields(labelFields, layerFields);
    expect(result).toEqual(['mode', 'temperature']);
  });

  it('should filter out non-existent fields', () => {
    const labelFields = ['mode', 'nonexistent', 'atmosphere'];
    const result = validateLabelFields(labelFields, layerFields);
    expect(result).toEqual(['mode', 'atmosphere']);
  });

  it('should return empty array for invalid inputs', () => {
    expect(validateLabelFields(null, layerFields)).toEqual([]);
    expect(validateLabelFields([], null)).toEqual([]);
    expect(validateLabelFields(undefined, [])).toEqual([]);
  });
});

describe('computeDynamicDisplayName', () => {
  const layerFields = [
    {
      field: 'mode',
      type: 'select',
      label: 'Operation mode',
      value: 'stirred',
    },
    {
      field: 'atmosphere',
      type: 'select',
      label: 'Atmosphere',
      value: 'nitrogen',
    },
    {
      field: 'temperature',
      type: 'text',
      label: 'Temperature',
      default: '25°C',
    },
  ];

  it('should return base label when labelFields is empty', () => {
    const result = computeDynamicDisplayName('Settings', [], { fields: layerFields });
    expect(result).toBe('Settings');
  });

  it('should compute display name with field values', () => {
    const labelFields = ['mode', 'atmosphere'];
    const result = computeDynamicDisplayName(
      'Settings',
      labelFields,
      { fields: layerFields },
    );
    expect(result).toBe('Settings - stirred - nitrogen');
  });

  it('should skip fields with empty values', () => {
    const fields = [
      { field: 'mode', type: 'select', value: 'stirred' },
      { field: 'atmosphere', type: 'select', value: '' },
      { field: 'temperature', type: 'text', value: '25°C' },
    ];
    const labelFields = ['mode', 'atmosphere', 'temperature'];
    const result = computeDynamicDisplayName('Settings', labelFields, { fields });
    expect(result).toBe('Settings - stirred - 25°C');
  });

  it('should use provided fieldValues over field defaults', () => {
    const labelFields = ['mode', 'atmosphere'];
    const fieldValues = { mode: 'flow cell', atmosphere: 'argon' };
    const result = computeDynamicDisplayName(
      'Settings',
      labelFields,
      { fields: layerFields },
      null, // No allLayers
      fieldValues,
    );
    expect(result).toBe('Settings - flow cell - argon');
  });

  it('should return base label when no valid field values exist', () => {
    const fields = [
      { field: 'mode', type: 'select', value: '' },
      { field: 'atmosphere', type: 'select', value: '' },
    ];
    const labelFields = ['mode', 'atmosphere'];
    const result = computeDynamicDisplayName('Settings', labelFields, { fields });
    expect(result).toBe('Settings');
  });

  it('should skip hidden fields when allLayers is provided', () => {
    const labelFields = ['mode', 'atmosphere'];
    const layer = { key: 'l1', fields: layerFields };
    const allLayers = { l1: layer };

    isFieldEffectivelyVisible
      .mockReturnValueOnce([true]) // mode visible
      .mockReturnValueOnce([false]); // atmosphere hidden

    const result = computeDynamicDisplayName(
      'Settings',
      labelFields,
      layer,
      allLayers,
    );
    expect(result).toBe('Settings - stirred');
  });

  it('should return empty string for empty base label', () => {
    const result = computeDynamicDisplayName('', ['mode'], { fields: layerFields });
    expect(result).toBe('');
  });
});

describe('updateLabelFieldsOnRemoval', () => {
  it('should remove the specified field', () => {
    const labelFields = ['mode', 'atmosphere', 'temperature'];
    const result = updateLabelFieldsOnRemoval(labelFields, 'atmosphere');
    expect(result).toEqual(['mode', 'temperature']);
  });

  it('should return same array if field not found', () => {
    const labelFields = ['mode', 'atmosphere'];
    const result = updateLabelFieldsOnRemoval(labelFields, 'nonexistent');
    expect(result).toEqual(['mode', 'atmosphere']);
  });

  it('should return empty array for invalid inputs', () => {
    expect(updateLabelFieldsOnRemoval(null, 'mode')).toEqual([]);
    expect(updateLabelFieldsOnRemoval(undefined, 'mode')).toEqual([]);
  });
});

describe('getAvailableFieldsForLabel', () => {
  const layerFields = [
    { field: 'mode', type: 'select', label: 'Operation mode' },
    { field: 'atmosphere', type: 'select', label: 'Atmosphere' },
    { field: 'temperature', type: 'text', label: 'Temperature' },
    {
      field: 'readonly_notes',
      type: 'text',
      label: 'Readonly Notes',
      readonly: true,
    },
    { field: 'data', type: 'table', label: 'Data Table' },
    { field: 'checkbox1', type: 'checkbox', label: 'Checkbox' },
  ];

  it('should return only select fields and non-readonly text fields', () => {
    const result = getAvailableFieldsForLabel(layerFields);
    expect(result).toHaveLength(3);
    expect(result.map((f) => f.field)).toEqual([
      'mode',
      'atmosphere',
      'temperature',
    ]);
  });

  it('should exclude readonly text fields', () => {
    const result = getAvailableFieldsForLabel(layerFields);
    const readonlyTextField = result.find((f) => f.field === 'readonly_notes');
    expect(readonlyTextField).toBeUndefined();
  });

  it('should return empty array for invalid input', () => {
    expect(getAvailableFieldsForLabel(null)).toEqual([]);
    expect(getAvailableFieldsForLabel(undefined)).toEqual([]);
    expect(getAvailableFieldsForLabel([])).toEqual([]);
  });
});
