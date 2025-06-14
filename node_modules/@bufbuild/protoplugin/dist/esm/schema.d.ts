import type { DescEnum, DescExtension, DescFile, DescMessage, DescService } from "@bufbuild/protobuf";
import type { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { Edition } from "@bufbuild/protobuf/wkt";
import type { FileInfo, GeneratedFile } from "./generated-file.js";
import type { EcmaScriptPluginOptions, ParsedParameter, Target } from "./parameter.js";
/**
 * Schema describes the files and types that the plugin is requested to
 * generate.
 */
export interface Schema<Options extends object = object> {
    /**
     * The files we are asked to generate.
     */
    readonly files: readonly DescFile[];
    /**
     * All files contained in the code generator request.
     */
    readonly allFiles: readonly DescFile[];
    /**
     * The plugin option `target`. A code generator should support all targets.
     */
    readonly targets: readonly Target[];
    /**
     * Parsed plugin options. They include the standard options for all
     * plugins, and options parsed by your plugin.
     */
    readonly options: Options & EcmaScriptPluginOptions;
    /**
     * Generate a new file with the given name.
     */
    generateFile(name: string): GeneratedFile;
    /**
     * List all types in a file (including messages, enumerations, and extensions
     * nested in messages).
     */
    typesInFile(file: DescFile): Iterable<DescMessage | DescEnum | DescExtension | DescService>;
    /**
     * The original google.protobuf.compiler.CodeGeneratorRequest.
     */
    readonly proto: CodeGeneratorRequest;
}
interface SchemaController<Options extends object> extends Schema<Options> {
    getFileInfo: () => FileInfo[];
    prepareGenerate(target: Target): void;
}
export declare function createSchema<T extends object>(request: CodeGeneratorRequest, parameter: ParsedParameter<T>, pluginName: string, pluginVersion: string, minimumEdition: Edition, maximumEdition: Edition): SchemaController<T>;
export {};
