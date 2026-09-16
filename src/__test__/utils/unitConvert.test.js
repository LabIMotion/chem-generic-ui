import { convertMeasurementValue } from '@utils/unitConvert';

// Deliberately NOT mocking generic-ui-core: the point of this helper is that it
// defers to chem-units, so the real unit tables are what needs exercising.

describe('convertMeasurementValue', () => {
  describe('offset quantities (the reason this delegates)', () => {
    // temperature carries no `nm` multiplier, so ratio-based conversion
    // silently returned the value unchanged and the caller relabelled the unit.
    it('converts celsius to fahrenheit', () => {
      expect(convertMeasurementValue(25, 'C', 'F', 'temperature')).toBe(77);
    });

    it('converts celsius to kelvin', () => {
      expect(convertMeasurementValue(25, 'C', 'K', 'temperature')).toBe(298.15);
    });

    it('converts fahrenheit back to celsius', () => {
      expect(convertMeasurementValue(77, 'F', 'C', 'temperature')).toBe(25);
    });

    it('round-trips through kelvin', () => {
      const toK = convertMeasurementValue(25, 'C', 'K', 'temperature');
      expect(convertMeasurementValue(toK, 'K', 'C', 'temperature')).toBe(25);
    });
  });

  describe('ratio quantities', () => {
    it('converts grams to milligrams', () => {
      expect(convertMeasurementValue(1, 'g', 'mg', 'mass')).toBe(1000);
    });

    it('converts micrograms to grams without rounding to zero', () => {
      // The chem-units default precision of 5 would return 0 here.
      expect(convertMeasurementValue(1, 'ug', 'g', 'mass')).toBe(0.000001);
    });

    it('keeps results far below the decimal-rounding cliff', () => {
      // Rounding by decimal place zeroes these however generous the setting:
      // 12 decimals still turns both into 0. Rounding by significant digits
      // is magnitude-independent, so they survive.
      expect(
        convertMeasurementValue(0.3, 'pmol', 'mol', 'amount_substance'),
      ).toBe(3e-13);
      expect(convertMeasurementValue(0.07, 'eV', 'j', 'energy')).toBe(
        1.1215236571797e-20,
      );
    });

    it('strips floating point noise from an awkward ratio', () => {
      expect(convertMeasurementValue(0.07, 'u', 'nkat', 'amount_enzyme')).toBe(
        1.1669,
      );
    });

    it('does not introduce floating point artefacts', () => {
      expect(convertMeasurementValue(0.07, 'g', 'mg', 'mass')).toBe(70);
    });

    it('accepts numeric strings', () => {
      expect(convertMeasurementValue('2', 'g', 'mg', 'mass')).toBe(2000);
    });
  });

  describe('pass-through', () => {
    it.each([
      ['empty string', ''],
      ['null', null],
      ['undefined', undefined],
    ])('returns %s unchanged', (_label, value) => {
      expect(convertMeasurementValue(value, 'g', 'mg', 'mass')).toBe(value);
    });

    it('returns non-numeric text unchanged', () => {
      expect(convertMeasurementValue('n.d.', 'g', 'mg', 'mass')).toBe('n.d.');
    });

    it('returns the value unchanged when the units match', () => {
      expect(convertMeasurementValue(5, 'g', 'g', 'mass')).toBe(5);
    });

    it.each([
      ['fromUnit', undefined, 'mg'],
      ['toUnit', 'g', undefined],
    ])('returns the value unchanged when %s is missing', (_l, from, to) => {
      expect(convertMeasurementValue(5, from, to, 'mass')).toBe(5);
    });
  });

  describe('unresolvable input', () => {
    // convertUnits returns null in these cases; a populated cell must never be
    // emptied by a failed lookup.
    it('returns the original value for an unknown unit', () => {
      expect(convertMeasurementValue(5, 'g', 'not-a-unit', 'mass')).toBe(5);
    });

    it('returns the original value for an unknown quantity', () => {
      expect(convertMeasurementValue(5, 'g', 'mg', 'not-a-quantity')).toBe(5);
    });

    it('returns the original value when the quantity is missing', () => {
      expect(convertMeasurementValue(5, 'g', 'mg', undefined)).toBe(5);
    });
  });
});
