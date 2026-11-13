/**
 * is-unsafe v2
 *
 * Zero-dependency, DOM-free, pure predicate for detecting unsafe strings
 * across HTML, XML, SVG, SQL, SQL-STRICT, SHELL, REDOS, NOSQL, and LOG contexts.
 *
 * v2 change: contexts are imported as named pattern arrays rather than resolved
 * via a string-keyed registry. This makes each context independently
 * tree-shakeable — bundlers can drop any context you never import.
 *
 * @module is-unsafe
 */

// ─── Context pattern arrays (named exports) ────────────────────────────────
// Import only the ones you need. Each is independently tree-shakeable.

export { default as HTML } from './contexts/html.js';
export { default as XML  } from './contexts/xml.js';
export { default as SVG  } from './contexts/svg.js';
export { default as SQL  } from './contexts/sql.js';
export { default as SHELL   } from './contexts/shell.js';
export { default as REDOS   } from './contexts/redos.js';
export { default as NOSQL   } from './contexts/nosql.js';
export { default as LOG     } from './contexts/log.js';

// SQL-STRICT needs a quoted identifier because of the hyphen
import SQL_STRICT from './contexts/sql-strict.js';
export { SQL_STRICT };

// Markup contexts are also matched against an entity-decoded copy of the input,
// because browsers decode HTML character references before interpreting a URL
// scheme (e.g. javascript&#58;… is a javascript: URL).
import decodeEntities from './util/decode-entities.js';

// ─── VALID_CONTEXTS convenience re-export ─────────────────────────────────
// Importing this pulls in ALL contexts. Use it only when you need all of them
// (e.g. for validation UI, tooling, or exhaustive audits).
// If you only need a subset, import the named contexts directly instead.

import HTML    from './contexts/html.js';
import XML     from './contexts/xml.js';
import SVG     from './contexts/svg.js';
import SQL     from './contexts/sql.js';
import SHELL   from './contexts/shell.js';
import REDOS   from './contexts/redos.js';
import NOSQL   from './contexts/nosql.js';
import LOG     from './contexts/log.js';

// ─── Attach labels to named contexts ──────────────────────────────────────
// Each built-in PatternList carries its canonical name so matchList can read
// list.label directly — no registry lookup needed at match time.
// Custom PatternLists default to 'CUSTOM' unless the caller sets list.label.

HTML.label       = 'HTML';
XML.label        = 'XML';
SVG.label        = 'SVG';

// Markup contexts: also test an entity-decoded copy (see util/decode-entities.js).
// Non-markup contexts (SQL, SHELL, LOG, …) are matched byte-for-byte as supplied.
HTML.decodeEntities = true;
XML.decodeEntities  = true;
SVG.decodeEntities  = true;
SQL.label        = 'SQL';
SQL_STRICT.label = 'SQL-STRICT';
SHELL.label      = 'SHELL';
REDOS.label      = 'REDOS';
NOSQL.label      = 'NOSQL';
LOG.label        = 'LOG';

export const VALID_CONTEXTS = Object.freeze({
  HTML,
  XML,
  SVG,
  SQL,
  'SQL-STRICT': SQL_STRICT,
  SHELL,
  REDOS,
  NOSQL,
  LOG,
});

// ─── Types ────────────────────────────────────────────────────────────────

/**
 * @typedef {{ id: string, description: string, pattern: RegExp }} Rule
 */

/**
 * @typedef {Rule[]} PatternList
 */

/**
 * @typedef {Object} MatchResult
 * @property {string} context     - Label identifying which context matched ('HTML', 'CUSTOM', etc.)
 * @property {string} id          - Rule identifier
 * @property {string} description - Human-readable description of what was matched
 * @property {RegExp} pattern     - The pattern that matched
 */

// ─── Internal helpers ──────────────────────────────────────────────────────

/**
 * @param {unknown} value
 */
function assertString(value) {
  if (typeof value !== 'string') {
    throw new TypeError(
      `is-unsafe: first argument must be a string, got ${typeof value}`
    );
  }
}

/**
 * @param {unknown} context
 */
function assertContext(context) {
  if (context instanceof RegExp) return;

  if (Array.isArray(context)) {
    if (context.length === 0) {
      throw new TypeError('is-unsafe: context must not be an empty array');
    }
    // Detect array-of-arrays vs flat pattern list
    if (Array.isArray(context[0])) {
      // Array of PatternLists
      for (const list of context) {
        if (!Array.isArray(list) || list.length === 0) {
          throw new TypeError(
            'is-unsafe: each context in the array must be a non-empty pattern array (PatternList)'
          );
        }
      }
    }
    // else: flat PatternList — trust it, no deep validation needed
    return;
  }

  throw new TypeError(
    `is-unsafe: second argument must be a PatternList (e.g. HTML), ` +
    `an array of PatternLists (e.g. [HTML, XML]), or a RegExp. Got: ${typeof context}`
  );
}

/**
 * Normalise any valid context arg into an array of PatternLists.
 *
 * @param {Rule[]|Rule[][]|RegExp} context
 * @returns {{ lists: Rule[][]|null, regex: RegExp|null }}
 */
function normalise(context) {
  if (context instanceof RegExp) return { lists: null, regex: context };
  // Distinguish PatternList (array of rule objects) from array of PatternLists
  if (Array.isArray(context[0])) return { lists: context, regex: null };
  return { lists: [context], regex: null };
}

/**
 * For markup contexts, return an entity-decoded copy of `value` to test
 * alongside the raw input, or null when there is nothing extra to test.
 *
 * @param {string} value
 * @param {Rule[]} list
 * @returns {string|null}
 */
function decodedCopy(value, list) {
  if (!list.decodeEntities) return null;
  const decoded = decodeEntities(value);
  return decoded === value ? null : decoded;
}

/**
 * Test value against a single PatternList. Returns the first MatchResult or null.
 *
 * @param {string} value
 * @param {Rule[]} list
 * @returns {MatchResult|null}
 */
function matchList(value, list) {
  const label = list.label ?? 'CUSTOM';
  const decoded = decodedCopy(value, list);
  for (const rule of list) {
    if (rule.pattern.test(value) || (decoded !== null && rule.pattern.test(decoded))) {
      return { context: label, id: rule.id, description: rule.description, pattern: rule.pattern };
    }
  }
  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Returns `true` if `value` is unsafe in the given context(s), `false` otherwise.
 *
 * @param {string} value - The string to test
 * @param {PatternList | PatternList[] | RegExp} context
 *   - A PatternList imported from is-unsafe (e.g. `HTML`, `XML`)
 *   - An array of PatternLists — returns true if unsafe in **any** of them
 *   - A custom RegExp — returns true if the pattern matches
 * @returns {boolean}
 *
 * @example
 * import { isUnsafe, HTML, SQL } from 'is-unsafe';
 *
 * isUnsafe('<script>alert(1)</script>', HTML)       // true
 * isUnsafe('hello world', HTML)                     // false
 * isUnsafe('value', [HTML, SQL])                    // false
 * isUnsafe('value', /my-pattern/i)                  // false
 */
function isUnsafe(value, context) {
  assertString(value);
  assertContext(context);

  const { lists, regex } = normalise(context);

  if (regex) return regex.test(value);

  for (const list of lists) {
    if (matchList(value, list) !== null) return true;
  }
  return false;
}

/**
 * Like `isUnsafe`, but returns the first `MatchResult` describing **why**
 * the value was flagged, or `null` if it is safe.
 *
 * @param {string} value
 * @param {PatternList | PatternList[] | RegExp} context
 * @returns {MatchResult|null}
 *
 * @example
 * import { whyUnsafe, HTML } from 'is-unsafe';
 *
 * whyUnsafe('<script>alert(1)</script>', HTML)
 * // { context: 'HTML', id: 'html-script-open', description: '...', pattern: /.../ }
 */
function whyUnsafe(value, context) {
  assertString(value);
  assertContext(context);

  const { lists, regex } = normalise(context);

  if (regex) {
    return regex.test(value)
      ? { context: 'CUSTOM', id: 'custom-regex', description: 'Matched caller-supplied pattern', pattern: regex }
      : null;
  }

  for (const list of lists) {
    const result = matchList(value, list);
    if (result !== null) return result;
  }
  return null;
}

/**
 * Returns **all** matching rules across the given context(s), or an empty
 * array if the value is safe. Useful for comprehensive auditing.
 *
 * @param {string} value
 * @param {PatternList | PatternList[] | RegExp} context
 * @returns {MatchResult[]}
 */
function allUnsafe(value, context) {
  assertString(value);
  assertContext(context);

  const { lists, regex } = normalise(context);
  const results = [];

  if (regex) {
    if (regex.test(value)) {
      results.push({ context: 'CUSTOM', id: 'custom-regex', description: 'Matched caller-supplied pattern', pattern: regex });
    }
    return results;
  }

  for (const list of lists) {
    const label = list.label ?? 'CUSTOM';
    const decoded = decodedCopy(value, list);
    for (const rule of list) {
      if (rule.pattern.test(value) || (decoded !== null && rule.pattern.test(decoded))) {
        results.push({ context: label, id: rule.id, description: rule.description, pattern: rule.pattern });
      }
    }
  }

  return results;
}

export { isUnsafe, whyUnsafe, allUnsafe };
export default isUnsafe;
