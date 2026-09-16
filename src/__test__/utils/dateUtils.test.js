import { describe, it, expect } from 'vitest';
import { formatUtcTimestamp } from '@utils/dateUtils';

describe('dateUtils', () => {
  describe('formatUtcTimestamp', () => {
    it('formats the ISO 8601 shape the API sends', () => {
      expect(formatUtcTimestamp('2026-07-20T10:27:53+0000')).toBe(
        '2026-07-20 10:27 UTC',
      );
      expect(formatUtcTimestamp('2026-07-20T10:27:53+00:00')).toBe(
        '2026-07-20 10:27 UTC',
      );
      expect(formatUtcTimestamp('2026-07-20T10:27:53Z')).toBe(
        '2026-07-20 10:27 UTC',
      );
    });

    it('normalizes a non-UTC offset to UTC', () => {
      expect(formatUtcTimestamp('2026-07-20T18:27:53+0800')).toBe(
        '2026-07-20 10:27 UTC',
      );
    });

    it('formats the legacy zone-name shape from older API releases', () => {
      expect(formatUtcTimestamp('2026-07-20 10:27:53 UTC')).toBe(
        '2026-07-20 10:27 UTC',
      );
    });

    it('reads the legacy wall time as UTC rather than shifting it', () => {
      // moment's `z` parsing token would turn this into 02:27 UTC under TZ=Asia/Taipei.
      expect(formatUtcTimestamp('2026-07-20 10:27:53 UTC')).toContain('10:27');
    });

    it('returns the fallback for blank input', () => {
      expect(formatUtcTimestamp(null)).toBe('');
      expect(formatUtcTimestamp(undefined)).toBe('');
      expect(formatUtcTimestamp('')).toBe('');
      expect(formatUtcTimestamp('   ')).toBe('');
      expect(formatUtcTimestamp(null, 'N/A')).toBe('N/A');
    });

    it('returns the fallback rather than an Invalid date for unparseable input', () => {
      expect(formatUtcTimestamp('not a timestamp')).toBe('');
      expect(formatUtcTimestamp('N/A', 'N/A')).toBe('N/A');
    });
  });
});
