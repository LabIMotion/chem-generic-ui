import regConfig from '@/config/reg.json';

// rawKey format: "ns:base64Encoded". ns must exist in reg.json and its array
// must include the encoded segment. Returns the decoded (trimmed) registry key,
// or null on any validation failure.
const resolveRegKey = (rawKey) => {
  if (typeof rawKey !== 'string' || !rawKey.includes(':')) return null;
  const [ns, encoded] = rawKey.split(':');
  const allowed = regConfig[ns];
  if (!Array.isArray(allowed) || !allowed.includes(encoded)) return null;
  try {
    return atob(encoded).trim();
  } catch {
    return null;
  }
};

// Reverse of resolveRegKey for the package path: given a decoded registry name
// the host passes (e.g. "doi"), return the base64-ENCODED reg.json segment that
// decodes to it, or null when no whitelisted entry matches. This is the
// "is it registered?" gate — the host can pass a name, but it is only usable
// when reg.json whitelists it. The stored value may carry a trailing newline,
// so .trim() is required. reg.json arrays may hold multiple keys.
export const encKeyForName = (name) => {
  if (typeof name !== 'string' || name === '') return null;
  const encodedKeys = Object.values(regConfig).filter(Array.isArray).flat();
  for (let i = 0; i < encodedKeys.length; i += 1) {
    const encoded = encodedKeys[i];
    try {
      if (atob(encoded).trim() === name) return encoded;
    } catch {
      // skip malformed entries
    }
  }
  return null;
};

export default resolveRegKey;
