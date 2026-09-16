import { useEffect, useState } from 'react';
import Api from '@utils/apiManager';

export const MIN_USER_SEARCH_LENGTH = 3;

/** Hint shown under system-user selects to explain the search behavior. */
export const S_USRS_SEARCH_HINT = `Type ${MIN_USER_SEARCH_LENGTH}+ characters; first 5 users shown.`;

/**
 * Module-level cache shared across all system-user select components.
 * Keyed by user id (string). Survives component remounts within a page session.
 */
const _sUserCache = new Map();

/**
 * Ids that resolved to no user (deleted, mistyped, or a transient lookup
 * failure — the host `Api` cannot tell these apart, all surface as a non-`ss00`
 * result). Tracked so we don't re-fetch them on every mount / form reset.
 * Self-heals: an id is cleared the moment it reappears as a real user (e.g. a
 * transient failure recovers when the author searches and finds them).
 */
const _invalidUserIds = new Set();

/** Returns a snapshot of the cache as an array of react-select options. */
export const getCachedUserOptions = () => Array.from(_sUserCache.values());

/** Merges an array of react-select user options into the cache. */
export const mergeUserOptionsIntoCache = (options) => {
  options.forEach((op) => {
    const id = String(op.value);
    _sUserCache.set(id, op);
    _invalidUserIds.delete(id); // a resolved id is no longer invalid
  });
};

/**
 * Returns the ids from `values` that still need fetching — i.e. neither cached
 * as a real user nor already known to resolve to nothing.
 */
export const getMissingUserIds = (values) =>
  (values || [])
    .filter((v) => v !== null && v !== undefined && v !== '')
    .map((v) => String(v))
    .filter((id) => !_sUserCache.has(id) && !_invalidUserIds.has(id));

export const S_USRS_SRC = '-su03-';

export const S_USRS_SRC_OPTION = {
  value: S_USRS_SRC,
  name: S_USRS_SRC,
  label: 'System user list',
};

export const userToOption = (user) => {
  const abbr = user.name_abbreviation ? ` (${user.name_abbreviation})` : '';
  // Store the id as a string: it becomes the field's stored value, and the
  // generic-ui-core F_SELECT comparator does `(value || '').trim()` — a numeric
  // id would throw "trim is not a function" during restriction evaluation.
  const id = String(user.id);
  return {
    value: id,
    name: id,
    label: `${user.first_name} ${user.last_name}${abbr}`,
  };
};

export const responseUserOptions = (result) => {
  if (result?.mc !== 'ss00' || !Array.isArray(result.data)) return [];
  return result.data;
};

// Single-user GET (Api.getUser): `data` is one user object, not an array.
export const responseUserOption = (result) => {
  if (
    result?.mc !== 'ss00' ||
    !result.data ||
    typeof result.data !== 'object' ||
    Array.isArray(result.data)
  ) {
    return null;
  }
  return result.data;
};

/**
 * Fetches react-select options for the given user ids that are not already
 * cached, merges them into the shared cache, and returns the freshly fetched
 * options. Requests run concurrently.
 *
 * Count-agnostic: callers pass `[value]` for single-select or the full id list
 * for multi-select / condition resolution. The host `Api` never rejects (failed
 * lookups resolve to a non-`ss00` result and are dropped here), so no per-call
 * error handling is needed. Ids that resolve to nothing are recorded in
 * `_invalidUserIds` so they aren't re-fetched on every mount / form reset.
 */
export const fetchMissingUserOptions = async (ids) => {
  const missingIds = getMissingUserIds(ids);
  if (missingIds.length === 0) return [];
  const results = await Promise.all(missingIds.map((id) => Api.getUser(id)));
  const fetched = results
    .map(responseUserOption)
    .filter(Boolean)
    .map(userToOption)
    .filter((op) => op.value !== '');
  if (fetched.length > 0) mergeUserOptionsIntoCache(fetched);
  // Remember the ids that came back empty so we stop re-requesting them.
  const resolved = new Set(fetched.map((op) => String(op.value)));
  missingIds.forEach((id) => {
    if (!resolved.has(id)) _invalidUserIds.add(id);
  });
  return fetched;
};

export const deprecatedUserOption = (value) => {
  // Keep the value a string for the same reason as userToOption: it may be
  // written back as the field value and must survive `.trim()` in the comparator.
  const id = String(value);
  return {
    value: id,
    name: id,
    label: `${id} (depr.)`,
  };
};

// For single-select: resolves a stored value to a select option
export const selectedUserOption = (value, sourceOptions) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    sourceOptions.find((o) => String(o.value) === String(value)) ||
    deprecatedUserOption(value)
  );
};

// For multi-select: resolves an array of sub_fields to select options
export const selectedUserOptions = (subFields, sourceOptions) =>
  (subFields || [])
    .map((sf) => {
      const op = sourceOptions.find(
        (o) => String(o.value) === String(sf.value),
      );
      return op || deprecatedUserOption(sf.value);
    })
    .filter((op) => op.value !== '');

// True when (layerKey, fieldKey) resolves to a single-select field backed by
// the system-user source. Used to switch restriction value entry/display.
export const isSystemUserField = (layers, layerKey, fieldKey) => {
  const layer = (layers || []).find((l) => l.key === layerKey);
  const field = layer?.fields?.find((f) => f.field === fieldKey);
  return field?.option_layers === S_USRS_SRC;
};

/**
 * Resolves system-user condition values (stored as user ids) to user names.
 * For every condition whose (layer, field) is a system-user field, returns an
 * `id -> label` map seeded from the cache and backfilled via Api.getUser.
 */
export const useSystemUserConditionLabels = (conditions, layers) => {
  const ids = (conditions || [])
    .filter((c) => isSystemUserField(layers, c.layer, c.field))
    .map((c) => String(c.value))
    .filter((v) => v !== '' && v !== 'undefined' && v !== 'null');

  const [labels, setLabels] = useState(() => {
    const seed = {};
    getCachedUserOptions().forEach((op) => {
      seed[String(op.value)] = op.label;
    });
    return seed;
  });

  const idsKey = ids.join(',');
  useEffect(() => {
    // Rebuild the id -> label map from the (now-current) cache. Runs after a
    // backfill, and also when nothing was missing (another component may have
    // populated the cache since the last render).
    const reseedFromCache = () =>
      setLabels((prev) => {
        const next = { ...prev };
        getCachedUserOptions().forEach((op) => {
          next[String(op.value)] = op.label;
        });
        return next;
      });

    fetchMissingUserOptions(ids).then(reseedFromCache);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return labels;
};
