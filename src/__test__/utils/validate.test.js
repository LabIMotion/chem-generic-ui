import { hasGenKlass, useDnD } from '@utils/validate';

describe('validate', () => {
  describe('hasGenKlass', () => {
    test('should return true when klass exists in elements', () => {
      const klasses = [{ name: 'Reaction' }, { name: 'Sample' }];
      expect(hasGenKlass('Reaction', klasses)).toBe(true);
    });

    test('should return false when klass does not exist in elements', () => {
      const klasses = [{ name: 'Reaction' }, { name: 'Sample' }];
      expect(hasGenKlass('Unknown', klasses)).toBe(false);
    });

    test('should return false when klass is null or undefined', () => {
      const klasses = [{ name: 'Reaction' }];
      expect(hasGenKlass(null, klasses)).toBeFalsy();
      expect(hasGenKlass(undefined, klasses)).toBeFalsy();
    });

    test('should return false when elements array is empty', () => {
      expect(hasGenKlass('Reaction', [])).toBe(false);
    });

    test('should return false when klass is empty string', () => {
      const klasses = [{ name: 'Reaction' }];
      expect(hasGenKlass('', klasses)).toBeFalsy();
    });
  });

  describe('useDnD', () => {
    test('should return true when element is generic', () => {
      const element = { type: 'Reaction', segments: [] };
      const klasses = [{ name: 'Reaction' }];
      expect(useDnD(element, klasses)).toBe(true);
    });

    test('should return true when element has segments', () => {
      const element = {
        type: 'Unknown',
        segments: [{ id: 1 }],
      };
      const klasses = [{ name: 'Reaction' }];
      expect(useDnD(element, klasses)).toBe(true);
    });

    test('should return true when element is generic and has segments', () => {
      const element = {
        type: 'Reaction',
        segments: [{ id: 1 }],
      };
      const klasses = [{ name: 'Reaction' }];
      expect(useDnD(element, klasses)).toBe(true);
    });

    test('should return false when element is not generic and has no segments', () => {
      const element = {
        type: 'Unknown',
        segments: [],
      };
      const klasses = [{ name: 'Reaction' }];
      expect(useDnD(element, klasses)).toBe(false);
    });

    test('should return false when element is undefined', () => {
      const klasses = [{ name: 'Reaction' }];
      expect(useDnD(undefined, klasses)).toBe(false);
    });

    test('should return false when element has no segments property', () => {
      const element = { type: 'Unknown' };
      const klasses = [{ name: 'Reaction' }];
      expect(useDnD(element, klasses)).toBe(false);
    });

    test('should return true when element segments is undefined but element is generic', () => {
      const element = { type: 'Reaction' };
      const klasses = [{ name: 'Reaction' }];
      expect(useDnD(element, klasses)).toBe(true);
    });

    test('should handle empty klasses array', () => {
      const element = {
        type: 'Unknown',
        segments: [{ id: 1 }],
      };
      expect(useDnD(element, [])).toBe(true);
    });
  });
});
