'use strict';

import { TABLE, TABLE_OFFSET, HIGH_MAP, NOT_DIGIT } from './digitTable.js';

const CHAR_0 = 48; // '0'.charCodeAt(0)
const CHAR_9 = 57; // '9'.charCodeAt(0)
const CHAR_MINUS = 45; // '-'.charCodeAt(0)

// Unicode minus/hyphen variants worth normalizing to ASCII '-' in numeric context:
//   U+2212  MINUS SIGN       − (mathematically correct minus)
//   U+FF0D  FULLWIDTH HYPHEN-MINUS  － (Japanese fullwidth context)
//   U+FE63  SMALL HYPHEN-MINUS     ﹣ (small form variant)
//
// NOT normalized (deliberate):
//   U+2013  EN DASH  –  (punctuation, not a numeric sign)
//   U+2014  EM DASH  —  (punctuation)
//   U+2010  HYPHEN   ‐  (typographic hyphen)
//
// Rationale: only characters a human or locale formatter would plausibly use
// as a numeric minus sign are normalized. Dashes used for punctuation are left
// alone to avoid mangling non-numeric strings.
const MINUS_SET = new Set([0x2212, 0xFF0D, 0xFE63]);

/**
 * Normalize all Unicode decimal digit characters in a string to ASCII (0-9),
 * and normalize Unicode minus variants to ASCII '-' (U+002D).
 *
 * Non-digit, non-minus characters are passed through unchanged.
 *
 * Performance design:
 * - Fast path: if the string has no convertible characters, return it unchanged
 *   (zero allocation).
 * - BMP digits (0x0660..0xFFFF excl. surrogates): flat Uint8Array lookup (O(1)).
 * - Supplementary plane digits (> 0xFFFF, encoded as surrogate pairs): Map lookup.
 * - Minus variants: checked inline with a small fixed Set.
 *
 * @param {string} str
 * @returns {string}
 */
function anynum(str) {
  if (typeof str !== 'string') return str;

  const len = str.length;
  if (len === 0) return str;

  // Scan for first character needing conversion.
  // If none found, return original string (zero allocation).
  let firstHit = -1;

  for (let i = 0; i < len; i++) {
    const cc = str.charCodeAt(i);

    // ASCII digit or ASCII minus — already normalized, skip fast
    if ((cc >= CHAR_0 && cc <= CHAR_9) || cc === CHAR_MINUS) continue;

    // Below first unicode digit script — check minus variants only
    if (cc < TABLE_OFFSET) {
      if (MINUS_SET.has(cc)) { firstHit = i; break; }
      continue;
    }

    // Surrogate pairs live in BMP range 0xD800-0xDFFF — check before TABLE
    if (cc >= 0xD800 && cc <= 0xDBFF) {
      if (i + 1 < len) {
        const low = str.charCodeAt(i + 1);
        if (low >= 0xDC00 && low <= 0xDFFF) {
          const cp = 0x10000 + ((cc - 0xD800) << 10) + (low - 0xDC00);
          if (HIGH_MAP.has(cp)) { firstHit = i; break; }
        }
      }
      continue;
    }

    // BMP non-surrogate: flat table lookup; also check minus variants in this range
    if (TABLE[cc - TABLE_OFFSET] !== NOT_DIGIT || MINUS_SET.has(cc)) {
      firstHit = i;
      break;
    }
  }

  // Nothing to replace — return original, zero allocation
  if (firstHit === -1) return str;

  // Build result: copy unchanged prefix, then convert from firstHit onward
  const chars = [];

  if (firstHit > 0) chars.push(str.slice(0, firstHit));

  for (let i = firstHit; i < len; i++) {
    const cc = str.charCodeAt(i);

    // ASCII digit or ASCII minus — pass through
    if ((cc >= CHAR_0 && cc <= CHAR_9) || cc === CHAR_MINUS) {
      chars.push(str[i]);
      continue;
    }

    // Below TABLE_OFFSET — check minus variants, else pass through
    if (cc < TABLE_OFFSET) {
      chars.push(MINUS_SET.has(cc) ? '-' : str[i]);
      continue;
    }

    // Surrogate pairs
    if (cc >= 0xD800 && cc <= 0xDBFF) {
      if (i + 1 < len) {
        const low = str.charCodeAt(i + 1);
        if (low >= 0xDC00 && low <= 0xDFFF) {
          const cp = 0x10000 + ((cc - 0xD800) << 10) + (low - 0xDC00);
          const d = HIGH_MAP.get(cp);
          if (d !== undefined) {
            chars.push(String.fromCharCode(d + 48));
            i++; // consume low surrogate
            continue;
          }
        }
      }
      chars.push(str[i]);
      continue;
    }

    // BMP non-surrogate: flat table lookup + minus variants
    if (MINUS_SET.has(cc)) {
      chars.push('-');
      continue;
    }
    const d = TABLE[cc - TABLE_OFFSET];
    chars.push(d !== NOT_DIGIT ? String.fromCharCode(d + 48) : str[i]);
  }

  return chars.join('');
}

export { anynum };
export default anynum;