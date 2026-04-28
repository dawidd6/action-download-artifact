/**
 * @nodable/entities
 *
 * Standalone, zero-dependency XML/HTML entity replacement.
 *

 */

export { default as EntityDecoder } from './EntityDecoder.js';
export {
  COMMON_HTML,
  XML,
  ALL_ENTITIES,
  ARROWS,
  BASIC_LATIN,
  CURRENCY,
  MATH,
  MATH_ADVANCED,
  CYRILLIC,
  FRACTIONS,
  GREEK,
  LATIN_ACCENTS,
  LATIN_EXTENDED,
  MISC_SYMBOLS,
  PUNCTUATION,
  SHAPES,
} from './entities.js';

export { default as EntityEncoder } from './EntityEncoder.js';