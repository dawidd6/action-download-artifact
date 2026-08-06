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

const getRegexes = (xmlVersion = '1.0') =>
  xmlVersion === '1.1' ? regexes11 : regexes10;

// ---------------------------------------------------------------------------
// Boolean validators
// ---------------------------------------------------------------------------

/**
 * Returns true if the string is a valid XML Name.
 * Colons are allowed anywhere (Name production).
 * Used for: DOCTYPE entity names, notation names, DTD element declarations.
 */
export const name = (str, { xmlVersion = '1.0' } = {}) =>
  getRegexes(xmlVersion).name.test(str);

/**
 * Returns true if the string is a valid NCName (Non-Colonized Name).
 * Colons are not permitted.
 * Used for: namespace prefixes, local names, SVG id attributes.
 */
export const ncName = (str, { xmlVersion = '1.0' } = {}) =>
  getRegexes(xmlVersion).ncName.test(str);

/**
 * Returns true if the string is a valid QName (Qualified Name).
 * Allows exactly one colon as a prefix separator: prefix:localName.
 * Used for: element and attribute names in namespace-aware XML/SVG.
 */
export const qName = (str, { xmlVersion = '1.0' } = {}) =>
  getRegexes(xmlVersion).qName.test(str);

/**
 * Returns true if the string is a valid NMToken.
 * Like Name but no restriction on the first character.
 * Used for: DTD NMTOKEN attribute values.
 */
export const nmToken = (str, { xmlVersion = '1.0' } = {}) =>
  getRegexes(xmlVersion).nmToken.test(str);

/**
 * Returns true if the string is a valid NMTokens value.
 * A whitespace-separated list of NMToken values.
 * Used for: DTD NMTOKENS attribute values.
 */
export const nmTokens = (str, { xmlVersion = '1.0' } = {}) =>
  getRegexes(xmlVersion).nmTokens.test(str);

// ---------------------------------------------------------------------------
// Diagnostic validator
// ---------------------------------------------------------------------------

const PRODUCTIONS = ['name', 'ncName', 'qName', 'nmToken', 'nmTokens'];

/**
 * Validates a string against a named production and returns a detailed result.
 *
 * @param {string} str
 * @param {'name'|'ncName'|'qName'|'nmToken'|'nmTokens'} production
 * @param {{ xmlVersion?: '1.0'|'1.1' }} [opts]
 * @returns {{ valid: boolean, production: string, input: string, reason?: string, position?: number }}
 */
export const validate = (str, production, { xmlVersion = '1.0' } = {}) => {
  if (!PRODUCTIONS.includes(production)) {
    throw new TypeError(
      `Unknown production "${production}". Must be one of: ${PRODUCTIONS.join(', ')}`
    );
  }

  const validators = { name, ncName, qName, nmToken, nmTokens };
  const isValid = validators[production](str, { xmlVersion });

  if (isValid) return { valid: true, production, input: str };

  let reason = 'Does not match the production rules';
  let position;

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
    !/^[:A-Za-z_\u00C0-\uFFFD]/.test(str[0])
  ) {
    reason = `First character "${str[0]}" is not a valid NameStartChar`;
    position = 0;
  } else {
    for (let i = 0; i < str.length; i++) {
      if (!/[\w\-\\.:\u00B7\u00C0-\uFFFD]/.test(str[i])) {
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
 * @param {{ xmlVersion?: '1.0'|'1.1' }} [opts]
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
 * @param {{ replacement?: string }} [opts]
 * @returns {string}
 */
export const sanitize = (str, production = 'name', { replacement = '_' } = {}) => {
  if (!str) return replacement;

  let result = str;

  // Strip colons for NCName
  if (production === 'ncName') {
    result = result.replace(/:/g, '');
  }

  // Replace illegal characters
  result = result.replace(/[^\w\-\.:\u00B7\u00C0-\uFFFD]/g, replacement);

  // Fix invalid start character for Name / NCName / QName
  if (production !== 'nmToken' && production !== 'nmTokens') {
    if (/^[\-\.\d]/.test(result)) {
      result = replacement + result;
    }
  }

  return result || replacement;
};