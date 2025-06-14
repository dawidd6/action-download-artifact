/**
 * An import symbol represents an ECMAScript import.
 */
export type ImportSymbol = {
    readonly kind: "es_symbol";
    /**
     * The name to import.
     */
    readonly name: string;
    /**
     * The import path.
     *
     * The path can point to a package, for example `@foo/bar/baz.js`, or
     * to a file, for example `./bar/baz.js`.
     *
     * Note that while paths to a file begin with a `./`, they must be
     * relative to the project root.
     */
    readonly from: string;
    /**
     * Whether this is a type-only import - an import that only exists in
     * TypeScript.
     */
    readonly typeOnly: boolean;
    /**
     * Create a copy of this import, and make it type-only for TypeScript.
     */
    toTypeOnly(): ImportSymbol;
    /**
     * The unique ID based on name and from, disregarding typeOnly.
     */
    readonly id: `import("${string}").${string}`;
};
/**
 * Create a new import symbol.
 */
export declare function createImportSymbol(name: string, from: string, typeOnly?: boolean): ImportSymbol;
