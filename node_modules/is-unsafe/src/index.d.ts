/**
 * is-unsafe v2 — TypeScript declarations
 *
 * Each context is a tree-shakeable named export. Import only what you need.
 */

/** A single detection rule: a pattern plus metadata. */
export interface Rule {
  id: string;
  description: string;
  pattern: RegExp;
}

/**
 * An ordered list of Rules for a given injection context.
 *
 * Built-in contexts (HTML, XML, etc.) have `label` pre-set by the library.
 * Custom lists default to `'CUSTOM'` in MatchResult unless you set `label`:
 *
 * ```js
 * const MY_RULES = [{ id: 'my-rule', description: '...', pattern: /danger/ }];
 * MY_RULES.label = 'MY_CONTEXT';
 * whyUnsafe('danger', MY_RULES); // → { context: 'MY_CONTEXT', ... }
 * ```
 */
export type PatternList = Rule[] & {
  label?: string;
  /**
   * When `true`, each rule is tested against the raw input AND a copy with
   * HTML character references decoded (numeric, hex, &colon;, &Tab;, &NewLine;).
   * Set on HTML, XML and SVG. Leave unset for non-markup contexts.
   */
  decodeEntities?: boolean;
};

/**
 * Valid context argument:
 *   - A single PatternList (e.g. `HTML`)
 *   - An array of PatternLists (e.g. `[HTML, XML]`) — unsafe if matches ANY
 *   - A custom RegExp
 */
export type ContextArg = PatternList | PatternList[] | RegExp;

/** Describes which rule matched and why. */
export interface MatchResult {
  /** Context label ('HTML', 'XML', 'CUSTOM', etc.) */
  context: string;
  id: string;
  description: string;
  pattern: RegExp;
}

// ─── Named context exports (tree-shakeable) ────────────────────────────────

export const HTML:       PatternList;
export const XML:        PatternList;
export const SVG:        PatternList;
export const SQL:        PatternList;
export const SQL_STRICT: PatternList;
export const SHELL:      PatternList;
export const REDOS:      PatternList;
export const NOSQL:      PatternList;
export const LOG:        PatternList;

// ─── VALID_CONTEXTS (convenience — pulls in all contexts) ──────────────────

export const VALID_CONTEXTS: {
  readonly HTML:         PatternList;
  readonly XML:          PatternList;
  readonly SVG:          PatternList;
  readonly SQL:          PatternList;
  readonly 'SQL-STRICT': PatternList;
  readonly SHELL:        PatternList;
  readonly REDOS:        PatternList;
  readonly NOSQL:        PatternList;
  readonly LOG:          PatternList;
};

// ─── Core functions ────────────────────────────────────────────────────────

/**
 * Returns `true` if `value` is unsafe in the given context(s).
 *
 * @example
 * import { isUnsafe, HTML, XML } from 'is-unsafe';
 * isUnsafe('<script>alert(1)</script>', HTML)   // true
 * isUnsafe('hello', [HTML, XML])                // false
 * isUnsafe('hello', /danger/)                   // false
 */
export function isUnsafe(value: string, context: ContextArg): boolean;

/**
 * Returns the first `MatchResult` explaining why `value` is unsafe, or `null` if safe.
 */
export function whyUnsafe(value: string, context: ContextArg): MatchResult | null;

/**
 * Returns all matching rules across the given context(s), or `[]` if safe.
 */
export function allUnsafe(value: string, context: ContextArg): MatchResult[];

declare const isUnsafeDefault: typeof isUnsafe;
export default isUnsafeDefault;
