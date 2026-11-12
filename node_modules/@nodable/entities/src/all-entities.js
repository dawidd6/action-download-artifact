// all-entities.js
//
// ALL_ENTITIES lives in its OWN module, deliberately separate from
// entities.js. An object spread like `{ ...GREEK, ...CYRILLIC, ... }` is
// treated conservatively by bundlers (esbuild, Rollup, webpack) as a
// potential side effect — spreading can invoke getters or Symbol.iterator —
// so a module containing such a spread cannot be safely tree-shaken. If that
// spread lived inside entities.js alongside the individual category exports,
// its mere presence would pin every category into any bundle that imports
// even one of them, regardless of whether ALL_ENTITIES itself is ever used.
//
// Keeping it isolated here means:
//   - `import { COMMON_HTML } from './entities.js'` tree-shakes cleanly —
//     no other category is dragged in.
//   - Only consumers who explicitly `import { ALL_ENTITIES } from
//     './all-entities.js'` (re-exported from index.js for convenience) pay
//     for the full merged set.

import {
  BASIC_LATIN,
  LATIN_ACCENTS,
  LATIN_EXTENDED,
  GREEK,
  CYRILLIC,
  MATH,
  MATH_ADVANCED,
  ARROWS,
  SHAPES,
  PUNCTUATION,
  CURRENCY,
  FRACTIONS,
  MISC_SYMBOLS,
} from './entities.js';

/**
 * All entities combined (if you need everything).
 * @type {Record<string, string>}
 */
export const ALL_ENTITIES = {
  ...BASIC_LATIN,
  ...LATIN_ACCENTS,
  ...LATIN_EXTENDED,
  ...GREEK,
  ...CYRILLIC,
  ...MATH,
  ...MATH_ADVANCED,
  ...ARROWS,
  ...SHAPES,
  ...PUNCTUATION,
  ...CURRENCY,
  ...FRACTIONS,
  ...MISC_SYMBOLS,
};
