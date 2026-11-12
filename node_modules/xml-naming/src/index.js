/**
 * xml-naming
 * Validates XML Name productions as defined in the XML 1.0 and 1.1 specifications.
 * Covers: Name, NCName, QName, NMToken, NMTokens
 *
 * XML 1.0 spec: https://www.w3.org/TR/xml/#NT-Name
 * XML 1.1 spec: https://www.w3.org/TR/xml11/#NT-NameStartChar
 * XML NS spec:  https://www.w3.org/TR/xml-names/#NT-NCName
 */

// ---------------------------------------------------------------------------
// Character class strings — XML 1.0
//
// NameStartChar ::= ":" | [A-Z] | "_" | [a-z]
//   | [#xC0-#xD6]   | [#xD8-#xF6]   | [#xF8-#x2FF]
//   | [#x370-#x37D] | [#x37F-#x1FFF]    <- split to exclude #x0487
//   | [#x200C-#x200D]
//   | [#x2070-#x218F] | [#x2C00-#x2FEF]
//   | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD]
//
// NameChar ::= NameStartChar | "-" | "." | [0-9]
//   | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//
// Note: \u0487 (Combining Cyrillic Millions Sign) was added in Unicode 4.0,
// after XML 1.0 was defined against Unicode 2.0. It falls inside the range
// \u037F-\u1FFF but must be excluded. We split that range into
// \u037F-\u0486 and \u0488-\u1FFF to exclude it explicitly.
// ---------------------------------------------------------------------------

const nameStartChar10 =
  ':A-Za-z_' +
  '\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF' +
  '\u0370-\u037D' +
  '\u037F-\u0486\u0488-\u1FFF' +  // split to exclude \u0487
  '\u200C-\u200D' +
  '\u2070-\u218F' +
  '\u2C00-\u2FEF' +
  '\u3001-\uD7FF' +
  '\uF900-\uFDCF' +
  '\uFDF0-\uFFFD';

const nameChar10 =
  nameStartChar10 +
  '\\-\\.\\d' +
  '\u00B7' +
  '\u0300-\u036F' +
  '\u203F-\u2040';

// ---------------------------------------------------------------------------
// Character class strings — XML 1.1
//
// Differences from XML 1.0:
//
// NameStartChar:
//   1.0 has split ranges: \u00C0-\u00D6, \u00D8-\u00F6, \u00F8-\u02FF
//   1.1 merges them into: \u00C0-\u02FF
//   (\u00D7 x and \u00F7 / are division symbols, excluded in both versions)
//
//   1.0 tops out at \uFFFD (BMP only)
//   1.1 adds \u{10000}-\u{EFFFF} (supplementary planes)
//   These require the /u flag on the RegExp — see buildRegexes below.
//
// NameChar:
//   1.1 adds \u0487 (Combining Cyrillic Millions Sign, added in Unicode 4.0)
// ---------------------------------------------------------------------------

const nameStartChar11 =
  ':A-Za-z_' +
  '\u00C0-\u02FF' +                    // merged — 1.0 had three split ranges here
  '\u0370-\u037D' +
  '\u037F-\u0486\u0488-\u1FFF' +       // split to exclude \u0487 (combining mark, never a NameStartChar)
  '\u200C-\u200D' +
  '\u2070-\u218F' +
  '\u2C00-\u2FEF' +
  '\u3001-\uD7FF' +
  '\uF900-\uFDCF' +
  '\uFDF0-\uFFFD' +
  '\u{10000}-\u{EFFFF}';     // supplementary planes — REQUIRES /u flag on RegExp

const nameChar11 =
  nameStartChar11 +
  '\\-\\.\\d' +
  '\u00B7' +
  '\u0300-\u036F' +
  '\u0487' +                 // Combining Cyrillic Millions Sign — valid in 1.1, not 1.0
  '\u203F-\u2040';

// ---------------------------------------------------------------------------
// Regex builders
//
// XML 1.0 regexes: no flags — BMP only, standard JS regex behaviour.
// XML 1.1 regexes: /u flag — required for \u{10000}-\u{EFFFF} to match actual
//   supplementary code points rather than lone surrogates (which are illegal XML).
// ---------------------------------------------------------------------------

const buildRegexes = (startChar, char, flags = '') => {
  const ncStart = startChar.replace(':', '');
  const ncChar = char.replace(':', '');
  const ncNamePat = `[${ncStart}][${ncChar}]*`;

  return {
    name: new RegExp(`^[${startChar}][${char}]*$`, flags),
    ncName: new RegExp(`^${ncNamePat}$`, flags),
    qName: new RegExp(`^${ncNamePat}(?::${ncNamePat})?$`, flags),
    nmToken: new RegExp(`^[${char}]+$`, flags),
    nmTokens: new RegExp(`^[${char}]+(?:\\s+[${char}]+)*$`, flags),
  };
};

const regexes10 = buildRegexes(nameStartChar10, nameChar10);       // no /u — BMP only
const regexes11 = buildRegexes(nameStartChar11, nameChar11, 'u');  // /u — enables \u{10000}-\u{EFFFF}

// ---------------------------------------------------------------------------
// ASCII-only fast path (opt-in, off by default)
//
// The XML 1.0 vs 1.1 NameStartChar/NameChar productions differ *only* in
// their non-ASCII ranges (merged vs split Latin-1 ranges, \u0487, and
// supplementary planes). Restricted to ASCII, both versions collapse to the
// same character classes, so a single regex pair covers both xmlVersion
// values — no /u flag needed.
//
// Rationale: unicode-aware regexes (the /u flag, required for XML 1.1's
// supplementary-plane range) are measurably slower in V8 than plain
// non-unicode regexes on the same input, even when the input is pure ASCII.
// For the common case — HTML/SVG ids, XML tags — names are ASCII, so callers
// who know this can opt in to skip the unicode-aware matching path entirely.
// This is a real but *conditional* win: mainly for XML 1.1 input (avoids /u),
// or at scale where the larger unicode character classes add engine
// overhead. It also changes behaviour (rejects legitimate non-ASCII XML
// 1.0/1.1 names), so it must never be silently enabled — hence off by
// default.
// ---------------------------------------------------------------------------

const nameStartCharAscii = ':A-Za-z_';
const nameCharAscii = nameStartCharAscii + '\\-\\.\\d';

const regexesAscii = buildRegexes(nameStartCharAscii, nameCharAscii); // no /u — ASCII only

const getRegexes = (xmlVersion = '1.0', asciiOnly = false) => {
  if (asciiOnly) return regexesAscii;
  return xmlVersion === '1.1' ? regexes11 : regexes10;
};

// ---------------------------------------------------------------------------
// Boolean validators
// ---------------------------------------------------------------------------

/**
 * Returns true if the string is a valid XML Name.
 * Colons are allowed anywhere (Name production).
 * Used for: DOCTYPE entity names, notation names, DTD element declarations.
 *
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
 *   asciiOnly: skip unicode-aware matching, ASCII names only (default false).
 */
export const name = (str, { xmlVersion = '1.0', asciiOnly = false } = {}) =>
  getRegexes(xmlVersion, asciiOnly).name.test(str);

/**
 * Returns true if the string is a valid NCName (Non-Colonized Name).
 * Colons are not permitted.
 * Used for: namespace prefixes, local names, SVG id attributes.
 *
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
 *   asciiOnly: skip unicode-aware matching, ASCII names only (default false).
 */
export const ncName = (str, { xmlVersion = '1.0', asciiOnly = false } = {}) =>
  getRegexes(xmlVersion, asciiOnly).ncName.test(str);

/**
 * Returns true if the string is a valid QName (Qualified Name).
 * Allows exactly one colon as a prefix separator: prefix:localName.
 * Used for: element and attribute names in namespace-aware XML/SVG.
 *
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
 *   asciiOnly: skip unicode-aware matching, ASCII names only (default false).
 */
export const qName = (str, { xmlVersion = '1.0', asciiOnly = false } = {}) =>
  getRegexes(xmlVersion, asciiOnly).qName.test(str);

/**
 * Returns true if the string is a valid NMToken.
 * Like Name but no restriction on the first character.
 * Used for: DTD NMTOKEN attribute values.
 *
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
 *   asciiOnly: skip unicode-aware matching, ASCII names only (default false).
 */
export const nmToken = (str, { xmlVersion = '1.0', asciiOnly = false } = {}) =>
  getRegexes(xmlVersion, asciiOnly).nmToken.test(str);

/**
 * Returns true if the string is a valid NMTokens value.
 * A whitespace-separated list of NMToken values.
 * Used for: DTD NMTOKENS attribute values.
 *
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
 *   asciiOnly: skip unicode-aware matching, ASCII names only (default false).
 */
export const nmTokens = (str, { xmlVersion = '1.0', asciiOnly = false } = {}) =>
  getRegexes(xmlVersion, asciiOnly).nmTokens.test(str);

// ---------------------------------------------------------------------------
// Memoized validator factory
//
// Real documents reuse a small vocabulary of tag/attribute names across many
// siblings (e.g. `id`, `class`, `href` repeated across hundreds of elements).
// The plain boolean validators above re-run the regex on every call
// regardless of repeats. `createValidator` returns a closure with a private
// string -> boolean cache, so repeated names after the first become O(1)
// lookups instead of regex tests.
//
// - opts (xmlVersion, asciiOnly) are fixed at creation time, so the regex is
//   resolved once, not on every call.
// - The cache is private to the returned closure — no shared/global state,
//   no cross-caller pollution.
// - `maxCacheSize` bounds memory: once the cache reaches this many entries,
//   it stops accepting new ones (existing entries keep serving hits; new
//   misses just fall through to the regex, uncached). This avoids unbounded
//   growth against adversarial/high-cardinality input (e.g. validating
//   attacker-supplied names with no repeats) without the cost/complexity of
//   a full LRU, and without the perf cliff of reset-and-refill thrashing.
// - Call `.reset()` on the returned function to clear the cache manually
//   (e.g. between unrelated parse calls).
// ---------------------------------------------------------------------------

const PRODUCTIONS = ['name', 'ncName', 'qName', 'nmToken', 'nmTokens'];

/**
 * Returns a memoized boolean validator function for a single production,
 * with opts fixed at creation time.
 *
 * @param {'name'|'ncName'|'qName'|'nmToken'|'nmTokens'} production
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean, maxCacheSize?: number }} [opts]
 *   maxCacheSize: max number of distinct strings to cache (default 2048).
 *   Once reached, new strings are validated but not cached; existing cached
 *   entries keep being served.
 * @returns {((str: string) => boolean) & { reset: () => void }}
 */
export const createValidator = (production, { xmlVersion = '1.0', asciiOnly = false, maxCacheSize = 2048 } = {}) => {
  if (!PRODUCTIONS.includes(production)) {
    throw new TypeError(
      `Unknown production "${production}". Must be one of: ${PRODUCTIONS.join(', ')}`
    );
  }

  const regex = getRegexes(xmlVersion, asciiOnly)[production];
  let cache = new Map();

  const validator = (str) => {
    const cached = cache.get(str);
    if (cached !== undefined) return cached;

    const result = regex.test(str);
    if (cache.size < maxCacheSize) cache.set(str, result);
    return result;
  };

  validator.reset = () => { cache = new Map(); };

  return validator;
};

// ---------------------------------------------------------------------------
// Diagnostic validator
// ---------------------------------------------------------------------------

/**
 * Validates a string against a named production and returns a detailed result.
 *
 * @param {string} str
 * @param {'name'|'ncName'|'qName'|'nmToken'|'nmTokens'} production
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
 * @returns {{ valid: boolean, production: string, input: string, reason?: string, position?: number }}
 */
export const validate = (str, production, { xmlVersion = '1.0', asciiOnly = false } = {}) => {
  if (!PRODUCTIONS.includes(production)) {
    throw new TypeError(
      `Unknown production "${production}". Must be one of: ${PRODUCTIONS.join(', ')}`
    );
  }

  const validators = { name, ncName, qName, nmToken, nmTokens };
  const isValid = validators[production](str, { xmlVersion, asciiOnly });

  if (isValid) return { valid: true, production, input: str };

  let reason = 'Does not match the production rules';
  let position;

  // Diagnostic fallback char checks must mirror the same character set the
  // boolean validator above used, or the reported reason/position could
  // contradict the `valid: false` result (e.g. flagging a char as illegal
  // that the unicode-aware check would have accepted).
  const startCharPattern = asciiOnly ? /^[:A-Za-z_]/ : /^[:A-Za-z_\u00C0-\uFFFD]/;
  const namePattern = asciiOnly ? /[\w\-\\.:]/ : /[\w\-\\.:\u00B7\u00C0-\uFFFD]/;

  if (str.length === 0) {
    reason = 'Input is empty';
  } else if (production === 'ncName' && str.includes(':')) {
    position = str.indexOf(':');
    reason = 'Colon is not allowed in NCName';
  } else if (production === 'qName' && str.startsWith(':')) {
    reason = 'QName cannot start with a colon';
    position = 0;
  } else if (production === 'qName' && str.endsWith(':')) {
    reason = 'QName cannot end with a colon';
    position = str.length - 1;
  } else if (production === 'qName' && (str.match(/:/g) || []).length > 1) {
    reason = 'QName can have at most one colon';
    position = str.lastIndexOf(':');
  } else if (
    ['name', 'ncName', 'qName'].includes(production) &&
    !startCharPattern.test(str[0])
  ) {
    reason = `First character "${str[0]}" is not a valid NameStartChar`;
    position = 0;
  } else {
    for (let i = 0; i < str.length; i++) {
      if (!namePattern.test(str[i])) {
        reason = `Character "${str[i]}" at position ${i} is not a valid NameChar`;
        position = i;
        break;
      }
    }
  }

  return { valid: false, production, input: str, reason, position };
};

// ---------------------------------------------------------------------------
// Batch validator
// ---------------------------------------------------------------------------

/**
 * Validates an array of strings against a named production.
 *
 * @param {string[]} strings
 * @param {'name'|'ncName'|'qName'|'nmToken'|'nmTokens'} production
 * @param {{ xmlVersion?: '1.0'|'1.1', asciiOnly?: boolean }} [opts]
 * @returns {Array<{ valid: boolean, production: string, input: string, reason?: string, position?: number }>}
 */
export const validateAll = (strings, production, opts = {}) =>
  strings.map(str => validate(str, production, opts));

// ---------------------------------------------------------------------------
// Sanitizer
// ---------------------------------------------------------------------------

/**
 * Transforms an invalid string into the nearest valid XML name for the given production.
 *
 * @param {string} str
 * @param {'name'|'ncName'|'qName'|'nmToken'|'nmTokens'} production
 * @param {{ replacement?: string, asciiOnly?: boolean }} [opts]
 *   asciiOnly: also replace any non-ASCII character, not just XML-illegal
 *   ones (default false).
 * @returns {string}
 */
export const sanitize = (str, production = 'name', { replacement = '_', asciiOnly = false } = {}) => {
  if (!str) return replacement;

  let result = str;

  // Strip colons for NCName
  if (production === 'ncName') {
    result = result.replace(/:/g, '');
  }

  // Replace illegal characters
  const allowedCharPattern = asciiOnly ? /[^\w\-\.:]/g : /[^\w\-\.:\u00B7\u00C0-\uFFFD]/g;
  result = result.replace(allowedCharPattern, replacement);

  // Fix invalid start character for Name / NCName / QName
  if (production !== 'nmToken' && production !== 'nmTokens') {
    if (/^[\-\.\d]/.test(result)) {
      result = replacement + result;
    }
  }

  return result || replacement;
};