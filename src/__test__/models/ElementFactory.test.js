
import { createElement } from '@models/ElementFactory';
import { showProperties } from 'generic-ui-core';
import { organizeLayersForDisplay } from '@utils/template/group-handler';

// Mock generic-ui-core
jest.mock('generic-ui-core', () => ({
  showProperties: jest.fn(),
  resetProperties: jest.fn(p => p),
  FieldTypes: {
    F_TEXT: 'text',
    F_INTEGER: 'integer'
  }
}));

// Mock group-handler
jest.mock('@utils/template/group-handler', () => ({
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
  });

  it('should be valid if name and all visible required fields are set', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: true, value: 'val1', type: 'text' }
        ]
      }
    };

    organizeLayersForDisplay.mockReturnValue([{ type: 'layer', key: 'layer1', data: layers.layer1 }]);
    showProperties.mockReturnValue([true, 'Label']);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {}
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should be invalid if visible required field is empty', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: true, value: '', type: 'text' }
        ]
      }
    };

    organizeLayersForDisplay.mockReturnValue([{ type: 'layer', key: 'layer1', data: layers.layer1 }]);
    showProperties.mockReturnValue([true, 'Label']);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {}
    });

    expect(el.isValidated()).toBe(false);
  });

  it('should be valid if required field is hidden', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: true, value: '', type: 'text' }
        ]
      }
    };

    organizeLayersForDisplay.mockReturnValue([{ type: 'layer', key: 'layer1', data: layers.layer1 }]);
    // Mock showProperties to return false for the field f1
    showProperties.mockReturnValue([false, 'Label']);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {}
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
            cond_fields: [{ layer: 'layer1', field: 'f1', value: 'v1' }]
          }
        ]
      }
    };

    organizeLayersForDisplay.mockReturnValue([{ type: 'layer', key: 'layer1', data: layers.layer1 }]);

    // showProperties called for:
    // 1. Layer1 check
    // 2. f1 check
    // 3. f2 check
    // 4. f1 recursive check for f2 (dependency)
    showProperties
      .mockReturnValueOnce([true]) // layer1
      .mockReturnValueOnce([true]) // f1
      .mockReturnValueOnce([true]) // f2
      .mockReturnValueOnce([true]); // f1 (recursive check for f2)

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {}
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
          { field: 'f2', required: true, value: '', type: 'text' } // Should block
        ]
      }
    };

    organizeLayersForDisplay.mockReturnValue([{ type: 'layer', key: 'layer1', data: layers.layer1 }]);
    showProperties.mockReturnValue([true]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {}
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
        fields: [{ field: 'f1', required: true, value: 'some_value', type: 'text' }]
      }
    };
    const metadata = {
      groups: [{ id: 'group1', label: 'Group 1', layers: ['layer1'] }],
      restrict: {
        group1: { cond: [{ layer: 'layer1', field: 'f1', value: 'has_value' }], op: 1 }
      }
    };

    organizeLayersForDisplay.mockReturnValue([
      {
        type: 'group',
        id: 'group1',
        layers: [{ data: layers.layer1 }]
      }
    ]);

    // Group visibility check returns false
    showProperties.mockReturnValueOnce([false]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should be valid if the layer is hidden within a visible group', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        cond_fields: [{ layer: 'layer2', field: 'other', value: 'val' }],
        fields: [{ field: 'f1', required: true, value: '', type: 'text' }]
      },
      layer2: {
        key: 'layer2',
        fields: [{ field: 'other', required: true, value: 'other val', type: 'text' }]
      }
    };
    const metadata = {
      groups: [{ id: 'group1', label: 'Group 1', layers: ['layer1'] }],
      restrict: {}
    };

    organizeLayersForDisplay.mockReturnValue([
      {
        type: 'group',
        id: 'group1',
        layers: [{ data: layers.layer1 }]
      }
    ]);

    showProperties
      .mockReturnValueOnce([true]) // group check (none, but default true if no restrict)
      .mockReturnValueOnce([false]); // layer1 check

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should handle stale values: hidden field hiding dependent group', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', value: 'stale_val', type: 'text', cond_fields: [{ layer: 'layer2', field: 'f2', value: 'ON' }] }
        ]
      },
      layer2: {
        key: 'layer2',
        fields: [{ field: 'f2', required: true, value: '', type: 'text' }]
      }
    };
    const metadata = {
      groups: [{ id: 'groupB', label: 'Group B', layers: ['layer2'] }],
      restrict: {
        groupB: { cond: [{ layer: 'layer1', field: 'f1', value: 'stale_val' }], op: 1 }
      }
    };

    organizeLayersForDisplay.mockReturnValue([
      { type: 'layer', key: 'layer1', data: layers.layer1 },
      { type: 'group', id: 'groupB', layers: [{ data: layers.layer2 }] }
    ]);

    // Top-down check:
    // 1. Layer 1 check
    // 2. f1 recursive check (triggered by groupB check below)
    // 3. Group B check

    showProperties
      .mockReturnValueOnce([true])  // Layer 1 visible
      .mockReturnValueOnce([false]) // f1 hidden (trigger is not ON)
      .mockReturnValueOnce([true]);  // Group B restriction itself matches 'stale_val'

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata
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
        fields: [{ field: 'f1', value: '', type: 'text' }] // required is missing
      }
    };
    organizeLayersForDisplay.mockReturnValue([{ type: 'layer', key: 'layer1', data: layers.layer1 }]);
    showProperties.mockReturnValue([true]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {}
    });

    expect(el.isValidated()).toBe(true);
  });

  it('should be valid if a field required property is null or undefined', () => {
    const layers = {
      layer1: {
        key: 'layer1',
        fields: [
          { field: 'f1', required: null, value: '', type: 'text' },
          { field: 'f2', required: undefined, value: '', type: 'text' }
        ]
      }
    };
    organizeLayersForDisplay.mockReturnValue([{ type: 'layer', key: 'layer1', data: layers.layer1 }]);
    showProperties.mockReturnValue([true]);

    const el = new GenElement({
      name: 'Test Element',
      properties: { layers },
      metadata: {}
    });

    expect(el.isValidated()).toBe(true);
  });
});
