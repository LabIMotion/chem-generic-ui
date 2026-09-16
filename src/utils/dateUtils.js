import moment from 'moment';

// Timestamps arrive from the Labimotion API already serialized. Current releases send ISO 8601
// ("2026-07-20T10:27:53+0000"); older ones sent strftime '%Y-%m-%d %H:%M:%S %Z'
// ("2026-07-20 10:27:53 UTC"). A zone *name* is not a valid ISO designator, so moment fails both
// its ISO and RFC2822 parsers on the legacy shape and falls back to `new Date()` — engine-specific
// behaviour that also logs a deprecation warning.
const LEGACY_ZONE_NAME = /\s+[A-Z]{2,5}$/;
const DISPLAY_FORMAT = 'YYYY-MM-DD HH:mm';
const LEGACY_PARSE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Parses an API timestamp into a moment, without ever falling back to `new Date()`.
 * @param {string} value
 * @returns {object|null} a moment in UTC, or null when the value is unparseable
 */
const parseApiTimestamp = (value) => {
  if (LEGACY_ZONE_NAME.test(value)) {
    // Strip the zone name and read the wall time as UTC. Parsing it with moment's `z` token
    // instead would silently mis-shift the instant (under TZ=Asia/Taipei, "10:27:53 UTC" comes
    // back as 02:27:53Z), so the offset is applied explicitly here.
    const parsed = moment.utc(
      value.replace(LEGACY_ZONE_NAME, ''),
      LEGACY_PARSE_FORMAT,
    );
    return parsed.isValid() ? parsed : null;
  }

  const parsed = moment.parseZone(value, moment.ISO_8601);
  return parsed.isValid() ? parsed.utc() : null;
};

/**
 * Formats an API timestamp for display as "YYYY-MM-DD HH:mm UTC".
 * The date-first layout keeps string sorting chronological, so callers can hand the raw value to
 * a grid and format only at render time.
 * @param {string|null|undefined} value
 * @param {string} [fallback=''] returned for blank or unparseable input
 * @returns {string}
 */
export const formatUtcTimestamp = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;

  const trimmed = String(value).trim();
  if (trimmed === '') return fallback;

  const parsed = parseApiTimestamp(trimmed);
  return parsed ? `${parsed.format(DISPLAY_FORMAT)} UTC` : fallback;
};
