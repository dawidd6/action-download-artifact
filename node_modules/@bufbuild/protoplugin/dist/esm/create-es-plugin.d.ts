import { type SupportedEdition } from "@bufbuild/protobuf";
import type { Schema } from "./schema.js";
import type { FileInfo } from "./generated-file.js";
import type { Plugin } from "./plugin.js";
interface PluginInit<Options extends object> {
    /**
     * Name of this code generator plugin.
     */
    name: string;
    /**
     * Version of this code generator plugin.
     */
    version: string;
    /**
     * An optional parsing function which can be used to parse your own plugin
     * options.
     *
     * For example, if a plugin is run with the options foo=123,bar,baz=a,baz=b
     * the raw options are:
     *
     * ```ts
     * [
     *   { key: "foo", value: "123" },
     *   { key: "bar", value: "" },
     *   { key: "baz", value: "a" },
     *   { key: "baz", value: "b" },
     * ]
     * ```
     *
     * If your plugin does not recognize an option, it must throw an Error in
     * parseOptions.
     */
    parseOptions?: (rawOptions: {
        key: string;
        value: string;
    }[]) => Options;
    /**
     * The earliest edition supported by this plugin. Defaults to the minimum
     * edition supported by @bufbuild/protobuf.
     */
    minimumEdition?: SupportedEdition;
    /**
     * The latest edition supported by this plugin. Defaults to the maximum
     * edition supported by @bufbuild/protobuf.
     */
    maximumEdition?: SupportedEdition;
    /**
     * A function which will generate TypeScript files based on proto input.
     * This function will be invoked by the plugin framework when the plugin runs.
     *
     * Note that this is required to be provided for plugin initialization.
     */
    generateTs: (schema: Schema<Options>, target: "ts") => void;
    /**
     * A optional function which will generate JavaScript files based on proto
     * input.  This function will be invoked by the  plugin framework when the
     * plugin runs.
     *
     * If this function is not provided, the plugin framework will then check if
     * a transpile function is provided.  If so, it will be invoked to transpile
     * JavaScript files.  If not, the plugin framework will transpile the files
     * itself.
     */
    generateJs?: (schema: Schema<Options>, target: "js") => void;
    /**
     * A optional function which will generate TypeScript declaration files
     * based on proto input.  This function will be invoked by the plugin
     * framework when the plugin runs.
     *
     * If this function is not provided, the plugin framework will then check if
     * a transpile function is provided.  If so, it will be invoked to transpile
     * declaration files.  If not, the plugin framework will transpile the files
     * itself.
     */
    generateDts?: (schema: Schema<Options>, target: "dts") => void;
    /**
     * An optional function which will transpile a given set of files.
     *
     * This function is meant to be used in place of either generateJs,
     * generateDts, or both.  However, those functions will take precedence.
     * This means that if generateJs, generateDts, and this transpile function
     * are all provided, this transpile function will be ignored.
     *
     * If jsImportStyle is "module" (the standard behavior), the function is
     * expected to use ECMAScript module import and export statements when
     * transpiling to JS. If jsImportStyle is "legacy_commonjs", the function is
     * expected to use CommonJs require() and exports when transpiling to JS.
     */
    transpile?: (files: FileInfo[], transpileJs: boolean, transpileDts: boolean, jsImportStyle: "module" | "legacy_commonjs") => FileInfo[];
}
/**
 * Create a new code generator plugin for ECMAScript.
 * The plugin can generate JavaScript, TypeScript, or TypeScript declaration
 * files.
 */
export declare function createEcmaScriptPlugin<Options extends object = object>(init: PluginInit<Options>): Plugin;
export {};
