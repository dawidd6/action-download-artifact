// EntityDecoder.js
import { trie1, trie2, trie3 } from './entityTries.js';

// Replacement strings indexed by char code — direct array access, no hashing
const XML_UNSAFE_REPLACEMENT = new Array(128);
XML_UNSAFE_REPLACEMENT[38] = '&amp;';   // &
XML_UNSAFE_REPLACEMENT[60] = '&lt;';    // <
XML_UNSAFE_REPLACEMENT[62] = '&gt;';    // >
XML_UNSAFE_REPLACEMENT[34] = '&quot;';  // "
XML_UNSAFE_REPLACEMENT[39] = '&apos;';  // '

// Typed bitmask for O(1) "is this ASCII code XML-unsafe?" check
const IS_XML_UNSAFE = new Uint8Array(128);
IS_XML_UNSAFE[38] = 1;
IS_XML_UNSAFE[60] = 1;
IS_XML_UNSAFE[62] = 1;
IS_XML_UNSAFE[34] = 1;
IS_XML_UNSAFE[39] = 1;

// Fast pre-scan: bail out immediately if nothing needs encoding
const NEEDS_PROCESSING = /[&<>"'\u0080-\uFFFF]/;

export default class EntityEncoder {
  constructor(options = {}) {
    this.encodeXmlSafe = options.encodeXmlSafe !== false;
    this.encodeAllNamed = options.encodeAllNamed !== false;
    this.maxReplacements = options.maxReplacements || 0;
    this.replacementsCount = 0;
  }

  encode(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    if (!NEEDS_PROCESSING.test(str)) return str;

    const maxRep = this.maxReplacements;
    if (maxRep > 0 && this.replacementsCount >= maxRep) return str;

    // Hoist to locals — avoids `this` property lookup inside the hot loop
    const encodeXmlSafe = this.encodeXmlSafe;
    const encodeAllNamed = this.encodeAllNamed;

    const len = str.length;

    let result = '';
    let last = 0;
    let i = 0;
    let limitReached = false;

    // ── Main loop: runs to len-2 so trie3 never needs a bounds check ────────
    // The last 2 characters are handled by the tail block below.
    const mainEnd = len - 2;  // i <= mainEnd guarantees i+1 and i+2 are valid

    while (i <= mainEnd && !limitReached) {
      const c0 = str.charCodeAt(i);

      // ── ASCII branch ───────────────────────────────────────────────────
      if (c0 < 128) {
        if (encodeXmlSafe && IS_XML_UNSAFE[c0] === 1) {
          result += str.substring(last, i) + XML_UNSAFE_REPLACEMENT[c0];
          last = ++i;
          if (maxRep > 0) {
            this.replacementsCount++;
            if (this.replacementsCount >= maxRep) {
              limitReached = true;
              break;
            }
          }
        } else {
          // Bulk-skip: advance to the next interesting position without
          // touching the outer loop overhead on every safe character
          i++;
          while (i <= mainEnd && !limitReached) {
            const c = str.charCodeAt(i);
            if (c >= 128 || (encodeXmlSafe && IS_XML_UNSAFE[c] === 1)) break;
            i++;
          }
        }
        continue;
      }

      // ── Non-ASCII: integer-keyed trie lookup ───────────────────────────
      // No bounds checks needed for c1/c2 because i <= mainEnd guarantees
      // i+1 and i+2 are both within the string.
      let matchedEntity = null;
      let advance = 1;

      // Try 3-char match first (longest wins)
      const mid3 = trie3.get(c0);
      if (mid3 !== undefined) {
        const c1 = str.charCodeAt(i + 1);
        const inner3 = mid3.get(c1);
        if (inner3 !== undefined) {
          const c2 = str.charCodeAt(i + 2);
          const candidate = inner3.get(c2);
          if (candidate !== undefined) { matchedEntity = candidate; advance = 3; }
        }
      }

      // Try 2-char match
      if (matchedEntity === null) {
        const inner2 = trie2.get(c0);
        if (inner2 !== undefined) {
          const c1 = str.charCodeAt(i + 1);
          const candidate = inner2.get(c1);
          if (candidate !== undefined) { matchedEntity = candidate; advance = 2; }
        }
      }

      // Try 1-char match
      if (matchedEntity === null && encodeAllNamed) {
        const candidate = trie1.get(c0);
        if (candidate !== undefined) { matchedEntity = candidate; }
      }

      if (matchedEntity !== null) {
        result += str.substring(last, i) + matchedEntity;
        i += advance;
        last = i;
        if (maxRep > 0) {
          this.replacementsCount++;
          if (this.replacementsCount >= maxRep) {
            limitReached = true;
            break;
          }
        }
      } else {
        i++;
      }
    }

    // ── Tail: handle the last 1-2 characters (no 3-char match possible) ────
    while (i < len && !limitReached) {
      const c0 = str.charCodeAt(i);

      if (c0 < 128) {
        if (encodeXmlSafe && IS_XML_UNSAFE[c0] === 1) {
          result += str.substring(last, i) + XML_UNSAFE_REPLACEMENT[c0];
          last = ++i;
          if (maxRep > 0) {
            this.replacementsCount++;
            if (this.replacementsCount >= maxRep) {
              limitReached = true;
              break;
            }
          }
        } else {
          i++;
        }
        continue;
      }

      // Non-ASCII tail — only 2-char and 1-char matches are possible here
      let matchedEntity = null;
      let advance = 1;

      if (i + 1 < len) {
        const inner2 = trie2.get(c0);
        if (inner2 !== undefined) {
          const c1 = str.charCodeAt(i + 1);
          const candidate = inner2.get(c1);
          if (candidate !== undefined) { matchedEntity = candidate; advance = 2; }
        }
      }

      if (matchedEntity === null && encodeAllNamed) {
        const candidate = trie1.get(c0);
        if (candidate !== undefined) { matchedEntity = candidate; }
      }

      if (matchedEntity !== null) {
        result += str.substring(last, i) + matchedEntity;
        i += advance;
        last = i;
        if (maxRep > 0) {
          this.replacementsCount++;
          if (this.replacementsCount >= maxRep) {
            limitReached = true;
            break;
          }
        }
      } else {
        i++;
      }
    }

    // ── Flush any remaining literal suffix ────────────────────────────────
    if (last < len) result += str.substring(last);
    return result;
  }

  reset() {
    this.replacementsCount = 0;
  }
}