import type { ImportExtension } from "./parameter.js";
/**
 * A configuration for rewriting import paths, a feature mainly used for
 * remote code generation in the BSR npm registry, which makes it possible
 * to serve the output of a BSR module and a plugin in an individual package.
 *
 * All plugins based on @bufbuild/protoplugin support the option
 * "rewrite_imports", which is parsed into this type. The option can be given
 * multiple times, in the form of `rewrite_imports=<pattern>:<target>`.
 *
 * The pattern is a very reduced subset of glob:
 * - `*` matches zero or more characters except `/`.
 * - `**` matches zero or more path elements, where an element is one or more
 *   characters with a trailing `/`.
 *
 * The target is typically a npm package name, for example `@scope/pkg`.
 *
 * If any generated file imports from a path matching one of the patterns, the
 * import path is rewritten to the corresponding target, by prepending the
 * target to the import path (after replacing any leading ./ or ../ from the
 * import path with / first).
 *
 * Note that the pattern is matched against the import path before it is made
 * relative to the file importing it. The first matching pattern wins.
 *
 * For example, the pattern `./foo/**\/*_pb.js` (escaped for block comment!)
 * matches:
 * - ./foo/bar_pb.js
 * - ./foo/bar/baz_pb.js
 *
 * But neither of:
 * - ./bar_pb.js
 * - ./foo/bar_xx.js
 *
 * With the target `@scope/pkg`, the import path `./foo/bar_pb.js` is
 * transformed to `@scope/pkg/foo/bar_pb.js`.
 */
export type RewriteImports = {
    pattern: string;
    target: string;
}[];
/**
 * Apply import rewrites to the given import path, and change all .js extensions
 * to the given import extension.
 */
export declare function rewriteImportPath(importPath: string, rewriteImports: RewriteImports, importExtension: ImportExtension): string;
export declare const relativePathRE: RegExp;
/**
 * Derives an ECMAScript module import path from a file path. For example,
 * the path `foo/bar.ts` is transformed into `./foo/bar.js`.
 */
export declare function deriveImportPath(filename: string): string;
/**
 * Makes an import path relative to the file importing it. For example,
 * consider the following files:
 * - foo/foo.js
 * - baz.js
 * If foo.js wants to import baz.js, we return ../baz.js
 */
export declare function makeImportPathRelative(importer: string, importPath: string): string;
