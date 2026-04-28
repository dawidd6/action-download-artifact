// entityTries.js
// Builds integer-keyed tries so the decoder never allocates a string object
// during lookup — every key is a plain charCode number.
//
// trie1: Map<code0, entity>
// trie2: Map<code0, Map<code1, entity>>
// trie3: Map<code0, Map<code1, Map<code2, entity>>>

import { ALL_ENTITIES } from './entities.js';

// Reverse map: character sequence → "&name;"
const CHAR_TO_ENTITY = new Map();
for (const [name, chars] of Object.entries(ALL_ENTITIES)) {
  CHAR_TO_ENTITY.set(chars, `&${name};`);
}

export const trie1 = new Map();   // code0          → entity string
export const trie2 = new Map();   // code0 → Map    → entity string
export const trie3 = new Map();   // code0 → Map → Map → entity string

for (const [chars, entity] of CHAR_TO_ENTITY) {
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