import {
  coerceFieldValue,
  isNumericFieldType,
  listSegmentKlasses,
} from '@components/variations/ElVarUtils';

describe('GenericElementVariationsUtils', () => {
  describe('isNumericFieldType', () => {
    it('covers the three numeric field types', () => {
      expect(isNumericFieldType('number')).toBe(true);
      expect(isNumericFieldType('integer')).toBe(true);
      expect(isNumericFieldType('system-defined')).toBe(true);
    });

    it('leaves every other field type alone', () => {
      ['text', 'select', 'select-multi', 'date', 'datetime', undefined].forEach(
        (fieldType) => {
          expect(isNumericFieldType(fieldType)).toBe(false);
        },
      );
    });
  });

  describe('coerceFieldValue', () => {
    it('passes non-numeric columns through untouched', () => {
      expect(coerceFieldValue('text', 'aaa')).toBe('aaa');
      expect(coerceFieldValue('select', 'a')).toBe('a');
      expect(coerceFieldValue(undefined, 'aaa')).toBe('aaa');
    });

    it('stores a number for number and system-defined columns', () => {
      expect(coerceFieldValue('number', '1.5')).toBe(1.5);
      expect(coerceFieldValue('number', '-2')).toBe(-2);
      expect(coerceFieldValue('system-defined', '20')).toBe(20);
      expect(coerceFieldValue('number', 1.5)).toBe(1.5);
    });

    it('accepts a comma as the decimal separator', () => {
      expect(coerceFieldValue('number', '1,5')).toBe(1.5);
    });

    it('accepts scientific notation', () => {
      expect(coerceFieldValue('number', '1e3')).toBe(1000);
    });

    // What the user typed to surface this: text in a numeric column.
    it('clears text a numeric column cannot hold', () => {
      expect(coerceFieldValue('number', 'aaa')).toBe('');
      expect(coerceFieldValue('integer', 'aaa')).toBe('');
      expect(coerceFieldValue('system-defined', 'aaa')).toBe('');
    });

    // Parsed strictly: a number with a tail is not a number. The importer
    // rejects the same input, so a cell cannot mean one thing in the grid and
    // another in the sheet.
    it('clears a number with trailing text rather than salvaging the digits', () => {
      expect(coerceFieldValue('number', '12abc')).toBe('');
      expect(coerceFieldValue('number', '1.2.3')).toBe('');
      expect(coerceFieldValue('number', '1,234,5')).toBe('');
    });

    it('clears a non-finite value', () => {
      expect(coerceFieldValue('number', 'Infinity')).toBe('');
      expect(coerceFieldValue('number', 'NaN')).toBe('');
    });

    it('clears a decimal in an integer column', () => {
      expect(coerceFieldValue('integer', '1.5')).toBe('');
      expect(coerceFieldValue('integer', '3')).toBe(3);
    });

    it('clears a blank cell rather than storing NaN', () => {
      ['', '   ', null, undefined].forEach((value) => {
        expect(coerceFieldValue('number', value)).toBe('');
        expect(coerceFieldValue('integer', value)).toBe('');
      });
    });

    it('keeps zero, which is falsy but valid', () => {
      expect(coerceFieldValue('number', '0')).toBe(0);
      expect(coerceFieldValue('integer', '0')).toBe(0);
    });
  });

  // The klasses now arrive as an argument instead of being read out of the
  // host's UserStore, so the caller decides what the library sees.
  describe('listSegmentKlasses', () => {
    const element = { type: 'my_element', segments: [] };
    const klassFor = (type, overrides = {}) => ({
      id: 1,
      label: 'Seg A',
      is_active: true,
      element_klass: { name: type },
      ...overrides,
    });

    it('returns nothing when the element has no type', () => {
      expect(
        listSegmentKlasses({ segments: [] }, [klassFor('my_element')]),
      ).toEqual([]);
      expect(listSegmentKlasses(null, [klassFor('my_element')])).toEqual([]);
    });

    it('tolerates omitted klasses instead of reaching for a global store', () => {
      expect(listSegmentKlasses(element)).toEqual([]);
      expect(listSegmentKlasses(element, null)).toEqual([]);
    });

    it('keeps only klasses belonging to the element type', () => {
      const result = listSegmentKlasses(element, [
        klassFor('my_element'),
        klassFor('other_element', { id: 2 }),
      ]);
      expect(result.map((k) => k.klassId)).toEqual([1]);
    });

    it('drops inactive klasses unless the element already carries that segment', () => {
      const inactive = klassFor('my_element', { id: 7, is_active: false });
      expect(listSegmentKlasses(element, [inactive])).toEqual([]);

      const withSegment = {
        type: 'my_element',
        segments: [{ segment_klass_id: 7 }],
      };
      expect(
        listSegmentKlasses(withSegment, [inactive]).map((k) => k.klassId),
      ).toEqual([7]);
    });

    it('falls back to desc, then to a generated label', () => {
      const noLabel = klassFor('my_element', {
        id: 3,
        label: null,
        desc: 'Described',
      });
      const noneAtAll = klassFor('my_element', {
        id: 4,
        label: null,
        desc: null,
      });
      const result = listSegmentKlasses(element, [noLabel, noneAtAll]);
      expect(result.map((k) => k.label)).toEqual(['Described', 'Segment 4']);
    });
  });
});
