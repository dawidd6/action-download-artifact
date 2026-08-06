export interface ValidationOptions {
  /** XML specification version to validate against. Defaults to '1.0'. */
  xmlVersion?: '1.0' | '1.1';
}

export interface SanitizeOptions extends ValidationOptions {
  /** Character used to replace invalid characters. Defaults to '_'. */
  replacement?: string;
}

export type Production = 'name' | 'ncName' | 'qName' | 'nmToken' | 'nmTokens';

export interface ValidationResult {
  valid: boolean;
  production: Production;
  input: string;
  /** Present only when valid is false. */
  reason?: string;
  /** Index of the first offending character. Present only when valid is false. */
  position?: number;
}

/**
 * Returns true if the string is a valid XML Name.
 * Colons are permitted anywhere (Name production).
 * Used for: DOCTYPE entity names, notation names, DTD element declarations.
 */
export function name(str: string, opts?: ValidationOptions): boolean;

/**
 * Returns true if the string is a valid NCName (Non-Colonized Name).
 * Colons are not permitted.
 * Used for: namespace prefixes, local names, SVG id attributes.
 */
export function ncName(str: string, opts?: ValidationOptions): boolean;

/**
 * Returns true if the string is a valid QName (Qualified Name).
 * Allows exactly one colon as a prefix separator: prefix:localName.
 * Used for: element and attribute names in namespace-aware XML/SVG.
 */
export function qName(str: string, opts?: ValidationOptions): boolean;

/**
 * Returns true if the string is a valid NMToken.
 * Same character set as Name but no restriction on the first character.
 * Used for: DTD NMTOKEN attribute values.
 */
export function nmToken(str: string, opts?: ValidationOptions): boolean;

/**
 * Returns true if the string is a valid NMTokens value.
 * A whitespace-separated list of NMToken values.
 * Used for: DTD NMTOKENS attribute values.
 */
export function nmTokens(str: string, opts?: ValidationOptions): boolean;

/**
 * Validates a string against a named XML production and returns a detailed result.
 */
export function validate(str: string, production: Production, opts?: ValidationOptions): ValidationResult;

/**
 * Validates an array of strings against a named XML production.
 */
export function validateAll(strings: string[], production: Production, opts?: ValidationOptions): ValidationResult[];

/**
 * Transforms an invalid string into the nearest valid XML name for the given production.
 * - Strips or replaces illegal characters
 * - Fixes invalid start characters by prepending the replacement character
 * - Removes colons for NCName production
 */
export function sanitize(str: string, production?: Production, opts?: SanitizeOptions): string;