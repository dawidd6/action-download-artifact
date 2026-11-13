// const { Expression } = require('path-expression-matcher');

//type Matcher = unknown;
type Expression = unknown;

/**
 * A lightweight, live read-only view of a Matcher instance.
 *
 * Returned by `Matcher.readOnly()`. The same instance is reused across every
 * callback invocation — no allocation overhead per call. Reads directly from
 * the parent Matcher's internal state so it always reflects the current parser
 * position with no copying or freezing.
 */
class MatcherView {
  readonly separator: string;

  /** Check if current path matches an Expression. */
  matches(expression: Expression): boolean;

  /** Get current tag name, or `undefined` if path is empty. */
  getCurrentTag(): string | undefined;

  /** Get current namespace, or `undefined` if not present. */
  getCurrentNamespace(): string | undefined;

  /** Get attribute value of the current node. */
  getAttrValue(attrName: string): any;

  /** Check if the current node has a given attribute. */
  hasAttr(attrName: string): boolean;

  /** Sibling position of the current node (child index in parent). */
  getPosition(): number;

  /** Occurrence counter of the current tag name at this level. */
  getCounter(): number;

  /** Number of nodes in the current path. */
  getDepth(): number;

  /** Current path as a string (e.g. `"root.users.user"`). */
  toString(separator?: string, includeNamespace?: boolean): string;

  /** Current path as an array of tag names. */
  toArray(): string[];
}


type XmlBuilderOptions = {
  /**
   * Give a prefix to the attribute name in the resulting JS object
   * 
   * Defaults to '@_'
   */
  attributeNamePrefix?: string;

  /**
   * A name to group all attributes of a tag under, or `false` to disable
   * 
   * Defaults to `false`
   */
  attributesGroupName?: false | string;

  /**
   * The name of the next node in the resulting JS
   * 
   * Defaults to `#text`
   */
  textNodeName?: string;

  /**
   * Whether to ignore attributes when building
   * 
   * When `true` - ignores all the attributes
   * 
   * When `false` - builds all the attributes
   * 
   * When `Array<string | RegExp>` - filters out attributes that match provided patterns
   * 
   * When `Function` - calls the function for each attribute and filters out those for which the function returned `true`
   * 
   * Defaults to `true`
   */
  ignoreAttributes?: boolean | (string | RegExp)[] | ((attrName: string, jPath: string) => boolean);

  /**
   * Give a property name to set CDATA values to instead of merging to tag's text value
   * 
   * Defaults to `false`
   */
  cdataPropName?: false | string;

  /**
   * If set, parse comments and set as this property
   * 
   * Defaults to `false`
   */
  commentPropName?: false | string;

  /**
   * Whether to make output pretty instead of single line
   * 
   * Defaults to `false`
   */
  format?: boolean;


  /**
   * If `format` is set to `true`, sets the indent string
   * 
   * Defaults to `  `
   */
  indentBy?: string;

  /**
   * Give a name to a top-level array
   * 
   * Defaults to `undefined`
   */
  arrayNodeName?: string;

  /**
   * Create empty tags for tags with no text value
   * 
   * Defaults to `false`
   */
  suppressEmptyNode?: boolean;

  /**
   * Suppress an unpaired tag
   * 
   * Defaults to `true`
   */
  suppressUnpairedNode?: boolean;

  /**
   * Don't put a value for boolean attributes
   * 
   * Defaults to `true`
   */
  suppressBooleanAttributes?: boolean;

  /**
   * Preserve the order of tags in resulting JS object
   * 
   * Defaults to `false`
   */
  preserveOrder?: boolean;

  /**
   * List of tags without closing tags
   * 
   * Defaults to `[]`
   */
  unpairedTags?: string[];

  /**
   * Nodes to stop parsing at
   * 
   * Accepts string patterns or Expression objects from path-expression-matcher
   * 
   * String patterns starting with "*." are automatically converted to ".." for backward compatibility
   * 
   * Defaults to `[]`
   */
  stopNodes?: (string | Expression)[];

  /**
   * Control how tag value should be parsed. Called only if tag value is not empty
   * 
   * @returns {undefined|null} `undefined` or `null` to set original value.
   * @returns {unknown} 
   * 
   * 1. Different value or value with different data type to set new value.
   * 2. Same value to set parsed value if `parseTagValue: true`.
   * 
   * Defaults to `(tagName, val, jPath, hasAttributes, isLeafNode) => val`
   */
  tagValueProcessor?: (name: string, value: unknown) => unknown;

  /**
   * Control how attribute value should be parsed
   * 
   * @param attrName 
   * @param attrValue 
   * @param jPath 
   * @returns {undefined|null} `undefined` or `null` to set original value
   * @returns {unknown}
   * 
   * Defaults to `(attrName, val, jPath) => val`
   */
  attributeValueProcessor?: (name: string, value: unknown) => unknown;

  /**
   * Whether to process default and DOCTYPE entities
   * 
   * Defaults to `true`
   */
  processEntities?: boolean;


  oneListGroup?: boolean;

  /**
   * Maximum number of nested tags
   * 
   * Defaults to `100`
   */
  maxNestedTags?: number;

  /**
   * Validate or sanitize tag and attribute names before they are written to XML output.
   *
   * The context object provides:
   * - `isAttribute` — `true` when the name being resolved is an attribute name,
   *   `false` when it is a tag name.
   * - `matcher` — the current path matcher (readonly). Can be used to inspect the
   *   current element path, e.g. via `.toString()` or `.getDepth()`.
   *
   * Return the (possibly transformed) name to use in the output.
   * Throw an error inside the function to reject an invalid name entirely.
   *
   * When set to `false` (default) all names are written as-is, preserving
   * backward-compatible behaviour.
   *
   * @example
   * // Auto-fix invalid names using xml-naming
   * import { sanitize } from 'xml-naming';
   * { sanitizeName: (name) => sanitize(name, 'qName') }
   *
   * @example
   * // Reject invalid names
   * import { qName } from 'xml-naming';
   * { sanitizeName: (name) => { if (!qName(name)) throw new Error(`Invalid XML name: "${name}"`); return name; } }
   *
   * Defaults to `false`
   */
  sanitizeName?: false | ((name: string, context: SanitizeNameContext) => string);
};

/**
 * Context object passed as the second argument to {@link XmlBuilderOptions.sanitizeName}.
 */
type SanitizeNameContext = {
  /**
   * `true` when the name being resolved is an XML attribute name;
   * `false` when it is an XML element (tag) name.
   */
  isAttribute: boolean;

  /**
   * The current path matcher at the point where the name is being resolved.
   * Readonly from the callback's perspective — do not call mutating methods.
   * Use `.toString()` to get the current jPath string, `.getDepth()` for nesting depth.
   */
  matcher: MatcherView;
};

interface XMLBuilder {
  build(jObj: any): string;
}

interface XMLBuilderConstructor {
  new(options?: XmlBuilderOptions): XMLBuilder;
  (options?: XmlBuilderOptions): XMLBuilder;
}

declare const Builder: XMLBuilderConstructor;

export = Builder;