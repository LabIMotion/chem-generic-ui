import { describe, it, expect } from 'vitest';
import {
  normalizeDecimalSeparator,
  parseDecimal,
  parseNumberInput,
  validateNumberValue,
  isNumberFieldValid,
  buildNumeralFormat,
  formatNumberDisplay,
  resolveDecimals,
} from '@utils/numberUtils';

describe('numberUtils', () => {
  describe('resolveDecimals', () => {
    it('returns 0 for undefined/null/empty', () => {
      expect(resolveDecimals(undefined)).toBe(0);
      expect(resolveDecimals(null)).toBe(0);
      expect(resolveDecimals('')).toBe(0);
    });

    it('returns 0 for negative values', () => {
      expect(resolveDecimals(-1)).toBe(0);
      expect(resolveDecimals(-99)).toBe(0);
    });

    it('returns 0 for non-numeric strings', () => {
      expect(resolveDecimals('abc')).toBe(0);
    });

    it('returns the parsed integer for valid values', () => {
      expect(resolveDecimals(2)).toBe(2);
      expect(resolveDecimals('3')).toBe(3);
      expect(resolveDecimals(0)).toBe(0);
    });
  });

  describe('normalizeDecimalSeparator', () => {
    it('returns empty string for null/undefined', () => {
      expect(normalizeDecimalSeparator(null)).toBe('');
      expect(normalizeDecimalSeparator(undefined)).toBe('');
    });

    it('converts comma to dot', () => {
      expect(normalizeDecimalSeparator('1,5')).toBe('1.5');
    });

    it('leaves dot unchanged', () => {
      expect(normalizeDecimalSeparator('1.5')).toBe('1.5');
    });

    it('handles integers', () => {
      expect(normalizeDecimalSeparator('42')).toBe('42');
    });

    it('handles scientific notation', () => {
      expect(normalizeDecimalSeparator('1e10')).toBe('1e10');
      expect(normalizeDecimalSeparator('1.2e-3')).toBe('1.2e-3');
    });

    it('returns empty string for ambiguous separators (dot AND comma)', () => {
      expect(normalizeDecimalSeparator('1.234,56')).toBe('');
      expect(normalizeDecimalSeparator('1,234.56')).toBe('');
    });

    it('returns empty string for multiple dots', () => {
      expect(normalizeDecimalSeparator('1.2.3')).toBe('');
    });

    it('returns empty string for multiple commas', () => {
      expect(normalizeDecimalSeparator('1,2,3')).toBe('');
    });

    it('passes through numeric value', () => {
      expect(normalizeDecimalSeparator(3.14)).toBe('3.14');
    });
  });

  describe('parseDecimal', () => {
    it('returns null for empty/null', () => {
      expect(parseDecimal(null)).toBeNull();
      expect(parseDecimal(undefined)).toBeNull();
      expect(parseDecimal('')).toBeNull();
    });

    it('parses standard decimal', () => {
      const d = parseDecimal('3.14');
      expect(d).not.toBeNull();
      expect(d.toNumber()).toBe(3.14);
    });

    it('parses comma-separated decimal', () => {
      const d = parseDecimal('3,14');
      expect(d).not.toBeNull();
      expect(d.toNumber()).toBe(3.14);
    });

    it('parses scientific notation', () => {
      const d = parseDecimal('1e10');
      expect(d).not.toBeNull();
      expect(d.toNumber()).toBe(1e10);
    });

    it('parses negative scientific notation', () => {
      const d = parseDecimal('1.2e-3');
      expect(d).not.toBeNull();
      expect(d.toNumber()).toBeCloseTo(0.0012);
    });

    it('returns null for non-numeric string', () => {
      expect(parseDecimal('abc')).toBeNull();
    });

    it('returns null for ambiguous separators', () => {
      expect(parseDecimal('1.234,56')).toBeNull();
    });

    it('parses integer', () => {
      const d = parseDecimal(42);
      expect(d.toNumber()).toBe(42);
    });
  });

  describe('parseNumberInput', () => {
    it('returns null for invalid input', () => {
      expect(parseNumberInput('abc', 2)).toBeNull();
      expect(parseNumberInput('', 2)).toBeNull();
      expect(parseNumberInput(null, 2)).toBeNull();
    });

    it('parses standard decimal', () => {
      expect(parseNumberInput('3.14159', 2)).toBe(3.14);
    });

    it('applies precision rounding', () => {
      expect(parseNumberInput('3.145', 2)).toBe(3.15);
      expect(parseNumberInput('3.144', 2)).toBe(3.14);
    });

    it('handles 0 decimals (integer mode)', () => {
      expect(parseNumberInput('3.7', 0)).toBe(4);
      expect(parseNumberInput('3.4', 0)).toBe(3);
    });

    it('normalizes comma separator', () => {
      expect(parseNumberInput('3,14', 2)).toBe(3.14);
    });

    it('handles scientific notation with precision', () => {
      // 1e-3 = 0.001, rounded to 2 decimals = 0.00
      expect(parseNumberInput('1e-3', 2)).toBe(0);
    });

    it('defaults to 0 decimals when decimals is undefined', () => {
      expect(parseNumberInput('3.7', undefined)).toBe(4);
      expect(parseNumberInput('1e10', undefined)).toBe(1e10);
    });

    it('stores result as a number (not string) for valid input', () => {
      const result = parseNumberInput('3.14', 2);
      expect(typeof result).toBe('number');
    });

    it('clamps to max when value exceeds max', () => {
      expect(parseNumberInput('1.3', 1, { max: 1 })).toBe(1);
      expect(parseNumberInput('5', 0, { max: 3 })).toBe(3);
    });

    it('clamps to min when value is below min', () => {
      expect(parseNumberInput('0.5', 1, { min: 1 })).toBe(1);
      expect(parseNumberInput('-5', 0, { min: 0 })).toBe(0);
    });

    it('respects both min and max together', () => {
      expect(parseNumberInput('10', 1, { min: 1, max: 5 })).toBe(5);
      expect(parseNumberInput('0', 1, { min: 1, max: 5 })).toBe(1);
      expect(parseNumberInput('3', 1, { min: 1, max: 5 })).toBe(3);
    });

    it('ignores empty/undefined constraints', () => {
      expect(parseNumberInput('99', 1, { min: '', max: undefined })).toBe(99);
    });
  });

  describe('validateNumberValue', () => {
    it('returns valid for empty value', () => {
      expect(validateNumberValue(null).valid).toBe(true);
      expect(validateNumberValue(undefined).valid).toBe(true);
      expect(validateNumberValue('').valid).toBe(true);
    });

    it('returns invalid for non-numeric', () => {
      const result = validateNumberValue('abc');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('validates decimal precision', () => {
      expect(validateNumberValue(3.14, { decimals: 2 }).valid).toBe(true);
      expect(validateNumberValue(3.141, { decimals: 2 }).valid).toBe(false);
    });

    it('validates min constraint', () => {
      expect(validateNumberValue(5, { min: 1 }).valid).toBe(true);
      expect(validateNumberValue(0, { min: 1 }).valid).toBe(false);
      expect(validateNumberValue(-1, { min: 0 }).valid).toBe(false);
    });

    it('validates max constraint', () => {
      expect(validateNumberValue(5, { max: 10 }).valid).toBe(true);
      expect(validateNumberValue(15, { max: 10 }).valid).toBe(false);
    });

    it('validates combined min/max/decimals', () => {
      expect(
        validateNumberValue(5.5, { min: 0, max: 10, decimals: 1 }).valid,
      ).toBe(true);
      expect(
        validateNumberValue(10.5, { min: 0, max: 10, decimals: 1 }).valid,
      ).toBe(false);
      expect(
        validateNumberValue(5.55, { min: 0, max: 10, decimals: 1 }).valid,
      ).toBe(false);
    });

    it('handles scientific notation after conversion', () => {
      // 1e2 = 100, max = 200, decimals = 0
      expect(validateNumberValue('1e2', { max: 200, decimals: 0 }).valid).toBe(
        true,
      );
      // 1e3 = 1000 > max 200
      expect(validateNumberValue('1e3', { max: 200, decimals: 0 }).valid).toBe(
        false,
      );
    });

    it('decimals defaults to 0 when empty/unset — integer values pass, decimal values fail', () => {
      expect(validateNumberValue(42, {}).valid).toBe(true);
      expect(
        validateNumberValue(42, { min: '', max: '', decimals: '' }).valid,
      ).toBe(true);
      // 3.14 has decimal places but decimals defaults to 0 → invalid
      expect(validateNumberValue(3.14, {}).valid).toBe(false);
    });

    it('min/max not set means no constraint (infinite)', () => {
      expect(validateNumberValue(-1e9, {}).valid).toBe(true);
      expect(validateNumberValue(1e9, {}).valid).toBe(true);
    });
  });

  describe('isNumberFieldValid', () => {
    it('returns false for empty value', () => {
      expect(isNumberFieldValid(null)).toBe(false);
      expect(isNumberFieldValid(undefined)).toBe(false);
      expect(isNumberFieldValid('')).toBe(false);
    });

    it('returns true for valid number', () => {
      expect(isNumberFieldValid(42)).toBe(true);
      expect(isNumberFieldValid(3.14, { decimals: 2 })).toBe(true);
    });

    it('returns false when constraints violated', () => {
      expect(isNumberFieldValid(5.555, { decimals: 2 })).toBe(false);
      expect(isNumberFieldValid(-1, { min: 0 })).toBe(false);
      expect(isNumberFieldValid(100, { max: 10 })).toBe(false);
    });

    it('returns false for non-numeric value', () => {
      expect(isNumberFieldValid('abc')).toBe(false);
    });
  });

  describe('buildNumeralFormat', () => {
    it('returns integer format "0" for undefined/null/empty/negative decimals', () => {
      expect(buildNumeralFormat(undefined)).toBe('0');
      expect(buildNumeralFormat(null)).toBe('0');
      expect(buildNumeralFormat('')).toBe('0');
      expect(buildNumeralFormat(-1)).toBe('0');
    });

    it('returns integer format for decimals=0', () => {
      expect(buildNumeralFormat(0)).toBe('0');
      expect(buildNumeralFormat('0')).toBe('0');
    });

    it('returns fixed decimal format for positive decimals', () => {
      expect(buildNumeralFormat(2)).toBe('0.00');
      expect(buildNumeralFormat(4)).toBe('0.0000');
      expect(buildNumeralFormat('3')).toBe('0.000');
    });
  });

  describe('formatNumberDisplay', () => {
    it('returns empty string for null/undefined/empty', () => {
      expect(formatNumberDisplay(null, 2)).toBe('');
      expect(formatNumberDisplay(undefined, 2)).toBe('');
      expect(formatNumberDisplay('', 2)).toBe('');
    });

    it('formats with fixed decimal places', () => {
      expect(formatNumberDisplay(3.1, 2)).toBe('3.10');
      expect(formatNumberDisplay(3.14159, 2)).toBe('3.14');
      expect(formatNumberDisplay(42, 0)).toBe('42');
    });

    it('formats integer without trailing zeros when no decimals specified', () => {
      expect(formatNumberDisplay(42, undefined)).toBe('42');
    });

    it('formats negative numbers', () => {
      expect(formatNumberDisplay(-3.5, 2)).toBe('-3.50');
    });
  });
});
