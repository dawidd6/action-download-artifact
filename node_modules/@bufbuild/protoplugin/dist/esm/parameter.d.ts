import type { RewriteImports } from "./import-path.js";
/**
 * Represents possible values of the plugin option `target`.
 */
export type Target = "js" | "ts" | "dts";
/**
 * Possible values of the plugin option `import_extension`.
 */
export type ImportExtension = "none" | "js" | "ts";
/**
 * Standard plugin options that every ECMAScript plugin supports.
 */
export interface EcmaScriptPluginOptions {
    /**
     * Controls whether the plugin generates JavaScript, TypeScript,
     * or TypeScript declaration files.
     *
     * The default is ["js", "dts].
     */
    targets: Target[];
    /**
     * Add an extension to every import: "js" or "ts".
     *
     * The default is "none".
     */
    importExtension: ImportExtension;
    /**
     * Generate `import` statements or `require()` calls.
     *
     * The default is "module".
     */
    jsImportStyle: "module" | "legacy_commonjs";
    /**
     * Generate an annotation at the top of each file to skip type checks:
     * `// @ts-nocheck`.
     *
     * The default is false.
     */
    tsNocheck: boolean;
    /**
     * Prune empty files from the output.
     *
     * The default is false.
     */
    keepEmptyFiles: boolean;
    /**
     * @private
     */
    bootstrapWkt: boolean;
    /**
     * @private
     */
    rewriteImports: RewriteImports;
}
export interface ParsedParameter<T> {
    parsed: T & EcmaScriptPluginOptions;
    sanitized: string;
}
export declare function parseParameter<T extends object>(parameter: string, parseExtraOptions: ((rawOptions: {
    key: string;
    value: string;
}[]) => T) | undefined): ParsedParameter<T>;
