/**
 * Creates an immutable enum object from an array of strings.
 *
 * The function takes an array of strings and creates an object where each key is
 * the uppercase version of the input string, and the value is the result of
 * calling a specified method on the string.
 *
 * @example
 * // Basic usage with default toString method
 * const Colors = createEnum(['red', 'green', 'blue']);
 * // Results in: { RED: 'red', GREEN: 'green', BLUE: 'blue' }
 *
 * @example
 * // Using a different String prototype method
 * const UppercaseEnum = createEnum(['foo', 'bar'], 'toUpperCase');
 * // Results in: { FOO: 'FOO', BAR: 'BAR' }
 */
const createEnum = (arr, fn = 'toString') =>
  Object.freeze(
    arr.reduce((acc, cur) => {
      acc[cur.toUpperCase()] = cur[fn]();
      return acc;
    }, {}),
  );

/**
 * Converts a value to a number. Returns 0 if the value cannot be converted to a number.
 * If the value is falsy (e.g., null, undefined, empty string), it's treated as '0'.
 */
const toNum = (val) => {
  const parse = Number(val || '');
  return Number.isNaN(parse) ? 0 : parse;
};

/**
 * Converts a value to either null or an integer.
 *
 * @example
 * toNullOrInt('123');    // returns 123
 * toNullOrInt(123.99);   // returns 123
 * toNullOrInt(0);        // returns null (because 0 is falsy)
 * toNullOrInt('');       // returns null
 * toNullOrInt(null);     // returns null
 * toNullOrInt('abc');    // returns null
 * toNullOrInt([]);       // returns 0 (due to parse logic)
 */
const toNullOrInt = (val) => {
  if (val) {
    const parse = Number(val);
    return Number.isNaN(parse) ? null : parseInt(Number(val), 10);
  }
  return null;
};

/**
 * Converts a value to a boolean.
 *
 * Values are first converted to strings and then evaluated. Returns true for all values
 * except empty strings, and strings that exactly match 'false' or '0' (case-insensitive).
 *
 * @example
 * toBool(true);      // returns true
 * toBool('true');    // returns true
 * toBool(1);         // returns true
 * toBool('1');       // returns true
 * toBool('yes');     // returns true
 * toBool(null);      // returns true ('null' is not empty)
 * toBool(undefined); // returns true ('undefined' is not empty)
 * toBool('any text'); // returns true
 * toBool(' false '); // returns true (not exactly 'false')
 *
 * toBool(false);     // returns false
 * toBool('false');   // returns false
 * toBool('FALSE');   // returns false (case insensitive)
 * toBool(0);         // returns false
 * toBool('0');       // returns false
 * toBool('');        // returns false
 * toBool([]);        // returns false ([] becomes empty string)
 */
const toBool = (val) => {
  const valLower = String(val).toLowerCase();
  return !(!valLower || valLower === 'false' || valLower === '0');
};

/**
 * Builds a string by joining an array of inputs with a specified separator.
 */
const buildString = (inputs, separator = '-') => inputs.join(separator);

const normalizeUrl = (text) => {
  if (/^https?:\/\//i.test(text)) {
    return text;
  }
  return `https://${text}`;
};

const parseTextWithLinks = (text) => {
  if (!text) {
    return [{ type: 'text', content: '' }];
  }
  const str = String(text); // <- ensures .matchAll exists
  // Examples:
  // http://localhost:3000/abc
  // https://127.0.0.1:8080/path
  // https://www.example.com/page
  const urlRegex =
    /\b((https?:\/\/)?(www\.)?((localhost)|([\p{L}\p{N}-]+\.)+[\p{L}]{2,}|(\d{1,3}\.){3}\d{1,3})(:\d+)?([\/?#][^\s]*)?)\b/giu;
  const parts = [];
  let lastIndex = 0;

  for (const match of str.matchAll(urlRegex)) {
    const matchText = match[0];
    const start = match.index;
    const end = start + matchText.length;

    // Text before the URL
    if (start > lastIndex) {
      parts.push({ type: 'text', content: str.slice(lastIndex, start) });
    }

    // Detected URL part
    const normalizedUrl = normalizeUrl(matchText);
    parts.push({ type: 'link', content: matchText, href: normalizedUrl });

    lastIndex = end;
  }

  // Push the remaining text
  if (lastIndex < str.length) {
    parts.push({ type: 'text', content: str.slice(lastIndex) });
  }

  return parts;
};

const editable = (editMode, fieldMode) => {
  if (editMode !== undefined) return editMode;
  return fieldMode !== undefined ? fieldMode : true;
};

const modeClass = (isRead, isRequired) => {
  let className = isRead ? 'readonly' : 'editable';
  className = isRequired && !isRead ? 'required' : className;
  return className;
};

const genericVariant = (generic) => {
  if (!generic) return null;
  const { element_type: elementType } = generic;
  if (!elementType) return 'Element';

  switch (elementType) {
    case 'Container':
      return 'Dataset';
    default:
      return 'Segment';
  }
};

const fieldLabelFor = (availableLayers, layerKey, fieldKey) => {
  const layer = availableLayers?.find((l) => l.key === layerKey);
  const field = layer?.fields?.find((f) => f.field === fieldKey);
  return field?.label || fieldKey;
};

const layerLabelFor = (availableLayers, layerKey) => {
  const layer = availableLayers?.find((l) => l.key === layerKey);
  return layer?.label || layerKey;
};

const getConditionDisplay = (cond, availableLayers, klasses = []) => {
  if (cond.layer === 'SRC-EL') {
    const klass = klasses.find((k) => k.name === cond.value);
    return {
      layerTitle: 'Source (Source)',
      fieldTitle: 'TYPE',
      valueTitle: klass?.label || cond.value,
    };
  }
  return {
    layerTitle: `${layerLabelFor(availableLayers, cond.layer)} (${cond.layer})`,
    fieldTitle: fieldLabelFor(availableLayers, cond.layer, cond.field),
    valueTitle:
      typeof cond.value === 'boolean' ? String(cond.value) : cond.value,
  };
};

export {
  createEnum,
  buildString,
  fieldLabelFor,
  layerLabelFor,
  normalizeUrl,
  toBool,
  toNum,
  toNullOrInt,
  parseTextWithLinks,
  editable,
  modeClass,
  genericVariant,
  getConditionDisplay,
};
