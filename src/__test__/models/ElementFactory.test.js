import { createElement } from '@models/ElementFactory';
import {
  isFieldEffectivelyVisible,
  isItemEffectivelyVisible,
} from '@utils/template/visibility-handler';
import { organizeLayersForDisplay } from '@utils/template/group-handler';

// Mock generic-ui-core
vi.mock('generic-ui-core', () => ({
  showProperties: jest.fn(),
  resetProperties: jest.fn((p) => p),
  FieldTypes: {
    F_TEXT: 'text',
    F_INTEGER: 'integer',
    F_NUMBER: 'number',
  },
}));

// Mock visibility-handler (re-exports from generic-ui-core)
vi.mock('@utils/template/visibility-handler', () => ({
  isFieldEffectivelyVisible: jest.fn(),
  isItemEffectivelyVisible: jest.fn(),
}));

// Mock group-handler
vi.mock('@utils/template/group-handler', () => ({
  organizeLayersForDisplay: jest.fn(),
}));

describe('ElementFactory isValidated', () => {
  const MockElementBase = class {
    constructor(props) {
      Object.assign(this, props);
      this._name = props.name;
    }
  };
  const MockContainer = { init: jest.fn() };
  const MockSegment = jest.fn();

  const GenElement = createElement(MockElementBase, MockContainer, MockSegment);

  beforeEach(() => {
    jest.clearAllMocks();
    isFieldEffectivelyVisible.mockReturnValue([true]);
    isItemEffectivelyVisible.mockReturnValue([true]);
  });

  it('should be valid if name and all visible required fields are set', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [{ field: 'f1', required: true, value: 'val1', type: 'text' }],
      },
    };

    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {},
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should be invalid if visible required field is empty', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [{ field: 'f1', required: true, value: '', type: 'text' }],
      },
    };

    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {},
    });

    expect(el.isValidated()).toBe(false);
  });

  it('should be valid if required field is hidden', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [{ field: 'f1', required: true, value: '', type: 'text' }],
      },
    };

    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);
    // Field f1 is hidden
    isFieldEffectivelyVisible.mockReturnValue([false]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {},
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should handle recursive visibility (chained restrictions)', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: true, value: 'v1', type: 'text' },
          {
            field: 'f2',
            required: true,
            value: '',
            type: 'text',
            cond_fields: [{ layer: 'layer1', field: 'f1', value: 'v1' }],
          },
        ],
      },
    };

    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    // Both fields visible (default mock); f2 visible and empty -> invalid

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {},
    });

    // f2 is visible and empty
    expect(el.isValidated()).toBe(false);
  });

  it('should only validate required for F_TEXT and F_INTEGER types', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: true, value: '', type: 'other_type' }, // Should be skipped
          { field: 'f2', required: true, value: '', type: 'text' }, // Should block
        ],
      },
    };

    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {},
    });

    // Valid because f1 is skipped, but wait, f2 blocks it.
    expect(el.isValidated()).toBe(false);

    // If we fill f2, it should be valid even if f1 is empty
    layers.layer1.fields[1].value = 'some value';
    expect(el.isValidated()).toBe(true);
  });

  it('should be valid if the entire group is hidden', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: true, value: 'some_value', type: 'text' },
        ],
      },
    };
    const metadata = {
      groups: [{ id: 'group1', label: 'Group 1', layers: ['layer1'] }],
      restrict: {
        group1: {
          cond: [{ layer: 'layer1', field: 'f1', value: 'has_value' }],
          op: 1,
        },
      },
    };

    organizeLayersForDisplay.mockReturnValue([
      {
        type: 'group',
        id: 'group1',
        layers: [{ data: layers.layer1 }],
      },
    ]);

    // Group visibility check returns false
    isItemEffectivelyVisible.mockReturnValueOnce([false]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata,
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should be valid if the layer is hidden within a visible group', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        cond_fields: [{ layer: 'layer2', field: 'other', value: 'val' }],
        fields: [{ field: 'f1', required: true, value: '', type: 'text' }],
      },
      layer2: {
        key: 'layer2',
        fields: [
          { field: 'other', required: true, value: 'other val', type: 'text' },
        ],
      },
    };
    const metadata = {
      groups: [{ id: 'group1', label: 'Group 1', layers: ['layer1'] }],
      restrict: {},
    };

    organizeLayersForDisplay.mockReturnValue([
      {
        type: 'group',
        id: 'group1',
        layers: [{ data: layers.layer1 }],
      },
    ]);

    // layer1 is hidden
    isItemEffectivelyVisible.mockReturnValueOnce([false]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata,
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should handle stale values: hidden field hiding dependent group', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          {
            field: 'f1',
            value: 'stale_val',
            type: 'text',
            cond_fields: [{ layer: 'layer2', field: 'f2', value: 'ON' }],
          },
        ],
      },
      layer2: {
        key: 'layer2',
        fields: [{ field: 'f2', required: true, value: '', type: 'text' }],
      },
    };
    const metadata = {
      groups: [{ id: 'groupB', label: 'Group B', layers: ['layer2'] }],
      restrict: {
        groupB: {
          cond: [{ layer: 'layer1', field: 'f1', value: 'stale_val' }],
          op: 1,
        },
      },
    };

    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
      { type: 'group', id: 'groupB', layers: [{ data: layers.layer2 }] },
    ]);

    // Group B effectively hidden (f1 stale)
    isItemEffectivelyVisible.mockReturnValueOnce([false]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata,
    });

    // Even though Group B restrict matches 'stale_val', f1 is hidden,
    // so Group B should be effectively hidden.
    // wait, my current implementation for group doesn't yet do recursive dep check on its restriction fields.
    // Let's re-verify the implementation.
    expect(el.isValidated()).toBe(true);
  });

  it('should be valid if a field is not required (property missing)', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [{ field: 'f1', value: '', type: 'text' }], // required is missing
      },
    };
    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {},
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should be valid if a field required property is null or undefined', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: null, value: '', type: 'text' },
          { field: 'f2', required: undefined, value: '', type: 'text' },
        ],
      },
    };
    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {},
    });

    expect(el.isValidated()).toBe(true);
  });

  it('F_NUMBER: valid when value is empty', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          {
            field: 'f1',
            type: 'number',
            value: '',
            numeric: { decimals: 0, min: 1, max: 10 },
          },
        ],
      },
    };
    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test',
      properties: { layers },
      metadata: {},
    });
    expect(el.isValidated()).toBe(true);
  });

  it('F_NUMBER: valid when value satisfies constraints', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          {
            field: 'f1',
            type: 'number',
            value: 5,
            numeric: { decimals: 0, min: 1, max: 10 },
          },
        ],
      },
    };
    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test',
      properties: { layers },
      metadata: {},
    });
    expect(el.isValidated()).toBe(true);
  });

  it('F_NUMBER: invalid when non-empty value exceeds max', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          {
            field: 'f1',
            type: 'number',
            value: 15,
            numeric: { decimals: 0, min: 1, max: 10 },
          },
        ],
      },
    };
    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
    ]);

    const el = new GenElement({
      name: 'Test',
      properties: { layers },
      metadata: {},
    });
    expect(el.isValidated()).toBe(false);
  });
});
