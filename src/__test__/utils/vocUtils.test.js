import {
  VOC_IDENT,
  VOC_MODE,
  vocMode,
} from '@utils/vocUtils';

describe('vocUtils', () => {
  describe('vocMode', () => {
    test('should return skip mode for null or undefined input', () => {
      expect(vocMode(null)).toBe(VOC_MODE.S.value);
      expect(vocMode(undefined)).toBe(VOC_MODE.S.value);
    });

    test('should return skip mode for falsy inputs', () => {
      expect(vocMode(false)).toBe(VOC_MODE.S.value);
      expect(vocMode(0)).toBe(VOC_MODE.S.value);
      expect(vocMode('')).toBe(VOC_MODE.S.value);
    });

    test('should return skip mode for empty object', () => {
      expect(vocMode({})).toBe(VOC_MODE.S.value);
    });

    test('should return skip mode for non-empty object without VOC_IDENT', () => {
      const fieldObject = {
        name: 'test',
        value: 'some value',
        opid: 8
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.S.value);
    });

    test('should return skip mode for arrays', () => {
      expect(vocMode([])).toBe(VOC_MODE.S.value);
      expect(vocMode([1, 2, 3])).toBe(VOC_MODE.S.value);
    });

    test('should return skip mode for primitive types', () => {
      expect(vocMode('string')).toBe(VOC_MODE.S.value);
      expect(vocMode(123)).toBe(VOC_MODE.S.value);
      expect(vocMode(true)).toBe(VOC_MODE.S.value);
    });

    test('should return write mode when VOC_IDENT is false', () => {
      const fieldObject = {
        [VOC_IDENT]: false,
        opid: 8
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.W.value);
    });

    test('should return write mode when VOC_IDENT is true but opid is less than read threshold', () => {
      const fieldObject = {
        [VOC_IDENT]: true,
        opid: 6 // Less than VOC_MODE.R.op (7)
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.W.value);
    });

    test('should return write mode when VOC_IDENT is true but opid is undefined', () => {
      const fieldObject = {
        [VOC_IDENT]: true
        // No opid property
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.W.value);
    });

    test('should return write mode when VOC_IDENT is true but opid is null', () => {
      const fieldObject = {
        [VOC_IDENT]: true,
        opid: null
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.W.value);
    });

    test('should return read mode when VOC_IDENT is true and opid equals read threshold', () => {
      const fieldObject = {
        [VOC_IDENT]: true,
        opid: VOC_MODE.R.op // Exactly 7
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.R.value);
    });

    test('should return read mode when VOC_IDENT is true and opid is greater than read threshold', () => {
      const fieldObject = {
        [VOC_IDENT]: true,
        opid: 10 // Greater than VOC_MODE.R.op (7)
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.R.value);
    });

    test('should handle objects with additional properties', () => {
      const fieldObject = {
        [VOC_IDENT]: true,
        opid: 8,
        name: 'test field',
        value: 'some value',
        type: 'text',
        required: true
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.R.value);
    });

    test('should return write mode when VOC_IDENT exists but is not boolean true', () => {
      const testCases = [
        { [VOC_IDENT]: 'true', opid: 8 },
        { [VOC_IDENT]: 1, opid: 8 },
        { [VOC_IDENT]: 'yes', opid: 8 },
        { [VOC_IDENT]: {}, opid: 8 }
      ];

      testCases.forEach(fieldObject => {
        expect(vocMode(fieldObject)).toBe(VOC_MODE.W.value);
      });
    });

    test('should handle edge case opid values', () => {
      // Test with opid exactly at the boundary values
      const readBoundary = {
        [VOC_IDENT]: true,
        opid: VOC_MODE.R.op - 1 // 6
      };
      expect(vocMode(readBoundary)).toBe(VOC_MODE.W.value);

      const writeBoundary = {
        [VOC_IDENT]: true,
        opid: VOC_MODE.W.op // 6
      };
      expect(vocMode(writeBoundary)).toBe(VOC_MODE.W.value);

      const skipBoundary = {
        [VOC_IDENT]: true,
        opid: VOC_MODE.S.op // 5
      };
      expect(vocMode(skipBoundary)).toBe(VOC_MODE.W.value);
    });

    test('should handle negative opid values', () => {
      const fieldObject = {
        [VOC_IDENT]: true,
        opid: -1
      };
      expect(vocMode(fieldObject)).toBe(VOC_MODE.W.value);
    });

    test('should handle string opid values', () => {
      const fieldObjectValidString = {
        [VOC_IDENT]: true,
        opid: '8' // String that converts to number >= 7
      };
      expect(vocMode(fieldObjectValidString)).toBe(VOC_MODE.R.value);

      const fieldObjectInvalidString = {
        [VOC_IDENT]: true,
        opid: '6' // String that converts to number < 7
      };
      expect(vocMode(fieldObjectInvalidString)).toBe(VOC_MODE.W.value);

      const fieldObjectNonNumericString = {
        [VOC_IDENT]: true,
        opid: 'not a number'
      };
      expect(vocMode(fieldObjectNonNumericString)).toBe(VOC_MODE.W.value);
    });

    test('should verify constants are correctly defined', () => {
      expect(VOC_MODE.R.value).toBe('read');
      expect(VOC_MODE.S.value).toBe('skip');
      expect(VOC_MODE.W.value).toBe('write');
      expect(VOC_MODE.R.op).toBe(7);
      expect(VOC_MODE.S.op).toBe(5);
      expect(VOC_MODE.W.op).toBe(6);
      expect(VOC_IDENT).toBe('is_voc');
    });
  });
});
