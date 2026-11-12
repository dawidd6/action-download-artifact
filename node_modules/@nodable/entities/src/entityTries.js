// entityTries.js
// Builds integer-keyed tries so the encoder never allocates a string object
// during lookup — every key is a plain charCode number.
//
// trie1: Map<code0, entity>
// trie2: Map<code0, Map<code1, entity>>
// trie3: Map<code0, Map<code1, Map<code2, entity>>>
//
// Trie construction is now a pure function, called on-demand by whoever
// needs it (EntityEncoder, at instantiation time) instead of running
// eagerly at module-import time against the full ALL_ENTITIES set. This
// keeps the cost — and the entity data itself — out of any bundle/consumer
// that never actually asks for it.

/**
 * Build integer-keyed tries from a name → chars entity map.
 * @param {Record<string, string>} entityMap
 * @returns {{ trie1: Map, trie2: Map, trie3: Map }}
 */
export function buildTries(entityMap) {
  const trie1 = new Map();   // code0          → entity string
  const trie2 = new Map();   // code0 → Map    → entity string
  const trie3 = new Map();   // code0 → Map → Map → entity string

  // Reverse map: character sequence → "&name;"
  // (built inline, not kept around — only the tries need to survive)
  for (const name in entityMap) {
    const chars = entityMap[name];
    const entity = `&${name};`;
    const len = chars.length;

    if (len === 1) {
      const c0 = chars.charCodeAt(0);
      // Keep shortest match only if no longer match already claimed this code
      // (longer matches are inserted in the same pass so we just overwrite —
      //  trie1 is only consulted after trie2/trie3 both miss, so no conflict)
      trie1.set(c0, entity);

    } else if (len === 2) {
      const c0 = chars.charCodeAt(0);
      const c1 = chars.charCodeAt(1);
      let inner = trie2.get(c0);
      if (inner === undefined) { inner = new Map(); trie2.set(c0, inner); }
      inner.set(c1, entity);

    } else if (len === 3) {
      const c0 = chars.charCodeAt(0);
      const c1 = chars.charCodeAt(1);
      const c2 = chars.charCodeAt(2);
      let mid = trie3.get(c0);
      if (mid === undefined) { mid = new Map(); trie3.set(c0, mid); }
      let inner = mid.get(c1);
      if (inner === undefined) { inner = new Map(); mid.set(c1, inner); }
      inner.set(c2, entity);
    }
    // HTML5 has no named entity whose character sequence is longer than 3 chars
  }

  return { trie1, trie2, trie3 };
}
