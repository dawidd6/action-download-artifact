// ---------------------------------------------------------------------------
// @nodable/entities — TypeScript declarations
// ---------------------------------------------------------------------------

/** A function-based entity replacement value (used for numeric refs). */
export type EntityValFn = (match: string, captured: string, ...rest: unknown[]) => string;

// ---------------------------------------------------------------------------
// Entity registration hook
// ---------------------------------------------------------------------------

/**
 * Actions returned by `onExternalEntity` / `onInputEntity` hooks.
 * Use the `ENTITY_ACTION` constant object instead of raw strings to avoid typos.
 *
 * - `'allow'` — register and expand the entity normally
 * - `'block'` — silently skip the entity (not registered, treated as unknown)
 * - `'throw'` — abort registration with an error
 */
export type EntityHookAction = 'allow' | 'block' | 'throw';

/**
 * Immutable constant bag for entity registration hook return values.
 *
 * @example
 * import { ENTITY_ACTION } from '@nodable/entities';
 * const dec = new EntityDecoder({
 *   onInputEntity: (_name, _value) => ENTITY_ACTION.BLOCK,
 * });
 */
export const ENTITY_ACTION: Readonly<{
  /** Register and expand the entity normally. */
  ALLOW: 'allow';
  /** Silently skip this entity — it will not be registered. */
  BLOCK: 'block';
  /** Throw an error, aborting entity registration. */
  THROW: 'throw';
}>;

/**
 * Callback signature for `onExternalEntity` and `onInputEntity` hooks.
 *
 * Called once per entity **at registration time** (not at decode time).
 * Return `ENTITY_ACTION.ALLOW` (or `'allow'`) to accept, `ENTITY_ACTION.BLOCK`
 * to silently skip, or `ENTITY_ACTION.THROW` to raise an error.
 *
 * @param name  — the entity name without `&` / `;`, e.g. `"brand"`
 * @param value — the resolved string value after any `{regex,val}` unwrapping
 */
export type EntityRegistrationHook = (name: string, value: string) => EntityHookAction;

// ---------------------------------------------------------------------------
// Encoder options
// ---------------------------------------------------------------------------

export interface EntityEncoderOptions {
  /**
   * Whether to encode XML unsafe characters: `&`, `<`, `>`, `"`, `'`.
   * @default true
   */
  encodeXmlSafe?: boolean;

  /**
   * Whether to encode non‑ASCII characters (e.g. `é` → `&eacute;`) using a
   * named entity trie. When `false`, no trie is built at all — cheapest option
   * if you only need `encodeXmlSafe`.
   * @default true
   */
  encodeAllNamed?: boolean;

  /**
   * Restrict named-entity encoding to a specific set of entities instead of
   * the full built-in `ALL_ENTITIES` table. Only meaningful when
   * `encodeAllNamed` is `true` (the default). Passing a smaller set (e.g.
   * `{ ...COMMON_HTML, ...CURRENCY }`) avoids building a trie for entity
   * categories you never use.
   *
   * @default ALL_ENTITIES
   * @example
   * new EntityEncoder({ namedEntities: { ...COMMON_HTML, ...CURRENCY } });
   */
  namedEntities?: Record<string, string> | null;

  /**
   * Maximum number of replacements performed **cumulatively** across all
   * `encode()` calls. `0` means unlimited.
   *
   * Use `reset()` to reset the internal counter.
   * @default 0
   */
  maxReplacements?: number;
}

// ---------------------------------------------------------------------------
// EntityEncoder class
// ---------------------------------------------------------------------------

/**
 * High‑performance encoder that replaces characters with XML/HTML entities.
 *
 * - Escapes XML unsafe characters (`&`, `<`, `>`, `"`, `'`) when `encodeXmlSafe` is true.
 * - Replaces non‑ASCII characters (e.g. `é`, `©`) with named entities using
 *   a compact trie‑based lookup when `encodeAllNamed` is true.
 * - Supports a cumulative replacement limit (`maxReplacements`) that persists
 *   across multiple `encode()` calls until `reset()` is called.
 *
 * @example
 * const encoder = new EntityEncoder({ encodeXmlSafe: true, encodeAllNamed: true });
 * encoder.encode('<foo>');   // "&lt;foo&gt;"
 * encoder.encode('© 2025');  // "&copy; 2025"
 *
 * // With limit
 * const limited = new EntityEncoder({ maxReplacements: 2 });
 * limited.encode('<>&');     // "&lt;&gt;&"  (third replacement omitted)
 * limited.reset();           // reset counter
 */
export class EntityEncoder {
  constructor(options?: EntityEncoderOptions);

  /**
   * Encode a string by replacing XML‑unsafe characters and (optionally)
   * non‑ASCII characters with named entities.
   *
   * If `maxReplacements` is set and the cumulative limit has been reached,
   * the input string is returned unchanged.
   *
   * @returns Encoded string (may be identical to input if no replacements needed
   *          or the limit has been exhausted).
   */
  encode(str: string): string;

  /**
   * Reset the internal replacement counter.
   * Does **not** change `encodeXmlSafe`, `encodeAllNamed`, or `maxReplacements`.
   */
  reset(): void;
}

// ---------------------------------------------------------------------------
// Constructor options for EntityDecoder (existing)
// ---------------------------------------------------------------------------

/**
 * Controls which entity categories count toward the expansion limits.
 *
 * - `'external'` — only untrusted / injected entities (default)
 * - `'base'`     — only built‑in XML entities + user‑supplied `namedEntities`
 * - `'all'`      — all entities regardless of tier
 * - `string[]`   — explicit combination, e.g. `['external', 'base']`
 */
export type ApplyLimitsTo = 'external' | 'base' | 'all' | Array<'external' | 'base'>;

export interface EntityDecoderLimitOptions {
  /**
   * Maximum number of entity references expanded **per document**.
   * `0` means unlimited.
   * @default 0
   */
  maxTotalExpansions?: number;

  /**
   * Maximum number of characters **added** by entity expansion per document.
   * `0` means unlimited.
   * @default 0
   */
  maxExpandedLength?: number;

  /**
   * Which entity tiers count toward the expansion limits.
   *
   * - `'external'` (default) – only input/runtime + persistent external entities
   * - `'base'`               – only built‑in XML + `namedEntities`
   * - `'all'`                – every entity regardless of tier
   * - `string[]`             – explicit combination, e.g. `['external', 'base']`
   *
   * @default 'external'
   */
  applyLimitsTo?: ApplyLimitsTo;
}

export interface EntityDecoderNCROptions {
  /**
   * XML version used for NCR classification.
   * @default 1.0
   */
  xmlVersion?: 1.0 | 1.1;

  /**
   * Base action for all numeric references.
   * @default 'allow'
   */
  onNCR?: 'allow' | 'leave' | 'remove' | 'throw';

  /**
   * Action for null NCR (U+0000).
   * @default 'remove'
   */
  nullNCR?: 'remove' | 'throw';
}

export interface EntityDecoderOptions {
  /**
   * Extra named entities merged into the **base map** (trusted, counts as `'base'` tier).
   * These are combined with the built‑in XML entities (`lt`, `gt`, `quot`, `apos`).
   * Values containing `&` are silently skipped to prevent recursive expansion.
   *
   * @default null
   */
  namedEntities?: Record<string, string | { regex: RegExp; val: string | EntityValFn }> | null;


  /**
   * Hook called once on the fully decoded string (after all replacements).
   *
   * - Receives `(resolved, original)` and **must return a string**.
   * - To reject expansion, return `original`.
   * - To sanitize, return a cleaned version of `resolved`.
   *
   * @example
   * postCheck: (resolved, original) =>
   *   /<[a-z]/i.test(resolved) ? original : resolved
   */
  postCheck?: ((resolved: string, original: string) => string) | null;

  /**
   * Whether numeric character references (`&#NNN;`, `&#xHH;`) are allowed.
   * @default true
   */
  numericAllowed?: boolean;

  /**
   * Array of entity names or numeric references to leave unexpanded.
   * @default []
   */
  leave?: string[];

  /**
   * Array of entity names or numeric references to remove.
   * @default []
   */
  remove?: string[];

  /**
   * Security limits for entity expansion.
   */
  limit?: EntityDecoderLimitOptions;

  /**
   * Numeric Character Reference (NCR) policy.
   */
  ncr?: EntityDecoderNCROptions;

  /**
   * Hook called once **at registration time** for each entity passed to
   * `setExternalEntities()` or `addExternalEntity()`.
   *
   * - `'allow'` (or `ENTITY_ACTION.ALLOW`) — register the entity normally (default)
   * - `'block'` (or `ENTITY_ACTION.BLOCK`) — silently skip; the entity is not stored
   * - `'throw'` (or `ENTITY_ACTION.THROW`) — abort registration with an `Error`
   *
   * The hook receives the entity name (without `&`/`;`) and the resolved string
   * value. It is **not** called during `decode()` — only when entities are added.
   *
   * @example
   * const dec = new EntityDecoder({
   *   onExternalEntity: (name, value) =>
   *     DANGEROUS_NAMES.has(name) ? ENTITY_ACTION.BLOCK : ENTITY_ACTION.ALLOW,
   * });
   */
  onExternalEntity?: EntityRegistrationHook | null;

  /**
   * Hook called once **at registration time** for each entity passed to
   * `addInputEntities()`.
   *
   * Follows the same `'allow' | 'block' | 'throw'` contract as `onExternalEntity`.
   *
   * @example
   * const dec = new EntityDecoder({
   *   // Block all input / DOCTYPE entities unconditionally
   *   onInputEntity: () => ENTITY_ACTION.BLOCK,
   * });
   */
  onInputEntity?: EntityRegistrationHook | null;
}

// ---------------------------------------------------------------------------
// EntityDecoder class
// ---------------------------------------------------------------------------

/**
 * Single‑pass, zero‑regex entity decoder for XML/HTML content.
 *
 * ## Entity lookup priority (highest → lowest)
 * 1. **input / runtime** – injected via `addInputEntities()` (DOCTYPE per document)
 * 2. **persistent external** – set via `setExternalEntities()` / `addExternalEntity()`
 * 3. **base map** – built‑in XML entities + user‑supplied `namedEntities`
 *
 * Numeric references (`&#NNN;`, `&#xHH;`) are resolved directly and count as the `'base'` tier.
 *
 * @example
 * const decoder = new EntityDecoder({
 *   namedEntities: COMMON_HTML,
 *   maxTotalExpansions: 100
 * });
 * decoder.setExternalEntities({ brand: 'Acme' });
 *
 * decoder.addInputEntities({ version: '1.0' });
 * decoder.decode('&brand; v&version; &lt;'); // 'Acme v1.0 <'
 *
 * decoder.reset(); // clears input entities + counters, keeps external entities
 */
export class EntityDecoder {
  constructor(options?: EntityDecoderOptions);

  setExternalEntities(
    map: Record<string, string | { regex: RegExp; val: string | EntityValFn }>
  ): void;

  addExternalEntity(key: string, value: string): void;

  addInputEntities(
    map: Record<
      string,
      | string
      | { regx: RegExp; val: string | EntityValFn }
      | { regex: RegExp; val: string | EntityValFn }
    >
  ): void;

  reset(): this;

  /** Update the XML version used for NCR classification, once the document's `<?xml version="...">` declaration is parsed. */
  setXmlVersion(version: number): void;

  decode(str: string): string;
}

// ---------------------------------------------------------------------------
// Named entity group exports (for use with `namedEntities` option)
// ---------------------------------------------------------------------------

export const COMMON_HTML: Record<string, string>;
export const ALL_ENTITIES: Record<string, string>;
export const XML: Record<string, string>;
export const BASIC_LATIN: Record<string, string>;
export const LATIN_ACCENTS: Record<string, string>;
export const LATIN_EXTENDED: Record<string, string>;
export const GREEK: Record<string, string>;
export const CYRILLIC: Record<string, string>;
export const MATH: Record<string, string>;
export const MATH_ADVANCED: Record<string, string>;
export const ARROWS: Record<string, string>;
export const SHAPES: Record<string, string>;
export const PUNCTUATION: Record<string, string>;
export const CURRENCY: Record<string, string>;
export const FRACTIONS: Record<string, string>;
export const MISC_SYMBOLS: Record<string, string>;