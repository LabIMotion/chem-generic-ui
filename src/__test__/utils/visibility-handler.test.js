import { showProperties } from 'generic-ui-core';
import { isFieldEffectivelyVisible, isItemEffectivelyVisible } from '@utils/template/visibility-handler';

jest.mock('generic-ui-core', () => ({
  showProperties: jest.fn(),
}));

describe('visibility-handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isFieldEffectivelyVisible', () => {
    it('should return [true, label] if showProperties returns true and no dependencies', () => {
      const field = { field: 'f1', label: 'Field 1' };
      const layer = { key: 'l1' };
      const allLayers = { l1: { key: 'l1', fields: [field] } };

      showProperties.mockReturnValue([true, 'Field 1']);

      expect(isFieldEffectivelyVisible(field, layer, allLayers)).toEqual([true, 'Field 1']);
    });

    it('should return [false, label] if showProperties returns false', () => {
      const field = { field: 'f1', label: 'Field 1' };
      const layer = { key: 'l1' };
      const allLayers = { l1: { key: 'l1', fields: [field] } };

      showProperties.mockReturnValue([false, 'Field 1']);

      expect(isFieldEffectivelyVisible(field, layer, allLayers)).toEqual([false, 'Field 1']);
    });

    it('should return [false, label] if dependency is hidden', () => {
      const field = {
        field: 'f1',
        label: 'Field 1',
        cond_fields: [{ layer: 'l1', field: 'f2' }]
      };
      const depField = { field: 'f2', label: 'Field 2' };
      const layer = { key: 'l1', fields: [field, depField] };
      const allLayers = { l1: layer };

      showProperties
        .mockReturnValueOnce([true, 'Field 1']) // f1 shown by its own rule
        .mockReturnValueOnce([false, 'Field 2']); // f2 hidden

      expect(isFieldEffectivelyVisible(field, layer, allLayers)).toEqual([false, 'Field 1']);
    });

    it('should pass refElement to showProperties', () => {
      const field = { field: 'f1', label: 'Field 1' };
      const layer = { key: 'l1' };
      const allLayers = { l1: { key: 'l1', fields: [field] } };
      const refElement = 'SRC-EL';

      showProperties.mockReturnValue([true, 'Field 1']);

      isFieldEffectivelyVisible(field, layer, allLayers, new Set(), refElement);

      expect(showProperties).toHaveBeenCalledWith(field, allLayers, refElement);
    });
  });

  describe('isItemEffectivelyVisible', () => {
    it('should handle group restrictions', () => {
      const groupRestriction = {
        cond: [{ layer: 'l1', field: 'f1', value: 'val' }],
        op: 1
      };
      const allLayers = { l1: { key: 'l1', fields: [{ field: 'f1' }] } };

      showProperties
        .mockReturnValueOnce([true, null]) // group check
        .mockReturnValueOnce([true, 'Field 1']); // dep field check

      expect(isItemEffectivelyVisible(groupRestriction, allLayers)).toEqual([true, null]);

      // Verify transformation
      expect(showProperties).toHaveBeenCalledWith(
        expect.objectContaining({
          cond_fields: [{ layer: 'l1', field: 'f1', value: 'val' }],
          cond_operator: 1
        }),
        allLayers,
        null
      );
    });

    it('should return [false, label] if group dependency is hidden', () => {
      const groupRestriction = {
        cond: [{ layer: 'l1', field: 'f1', value: 'val' }],
        op: 1
      };
      const f1 = { field: 'f1' };
      const allLayers = { l1: { key: 'l1', fields: [f1] } };

      showProperties
        .mockReturnValueOnce([true, null]) // group restriction matches
        .mockReturnValueOnce([false, 'Field 1']); // f1 itself is hidden

      expect(isItemEffectivelyVisible(groupRestriction, allLayers)).toEqual([false, null]);
    });

    it('should return [true, label] for a layer with satisfied conditions', () => {
      const layer = {
        key: 'l1',
        label: 'Layer 1',
        cond_fields: [{ layer: 'l2', field: 'f2', value: 'shown' }]
      };
      const f2 = { field: 'f2' };
      const allLayers = {
        l1: layer,
        l2: { key: 'l2', fields: [f2] }
      };

      showProperties
        .mockReturnValueOnce([true, 'Layer 1']) // layer restriction returns true
        .mockReturnValueOnce([true, 'Field 2']); // dep field f2 is visible

      expect(isItemEffectivelyVisible(layer, allLayers)).toEqual([true, 'Layer 1']);
    });

    it('should pass refElement to showProperties', () => {
      const layer = { key: 'l1', label: 'Layer 1' };
      const allLayers = { l1: layer };
      const refElement = 'SRC-EL';

      showProperties.mockReturnValue([true, 'Layer 1']);

      isItemEffectivelyVisible(layer, allLayers, refElement);

      expect(showProperties).toHaveBeenCalledWith(layer, allLayers, refElement);
    });
  });
});
