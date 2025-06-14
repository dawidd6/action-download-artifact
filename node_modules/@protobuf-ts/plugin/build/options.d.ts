import * as rt from "@protobuf-ts/runtime";
import * as ts from "typescript";
import { DescFile, DescService } from "@bufbuild/protobuf";
import { FileOptions_OptimizeMode } from "@bufbuild/protobuf/wkt";
import { ServerStyle, ClientStyle } from "./gen/protobuf-ts_pb";
/**
 * Internal settings for the file generation.
 */
export interface Options {
    readonly generateDependencies: boolean;
    readonly pluginCredit?: string;
    readonly normalLongType: rt.LongType;
    readonly normalOptimizeMode: FileOptions_OptimizeMode;
    readonly forcedOptimizeMode: FileOptions_OptimizeMode | undefined;
    readonly normalServerStyle: ServerStyle;
    readonly forcedServerStyle: ServerStyle | undefined;
    readonly normalClientStyle: ClientStyle;
    readonly forcedClientStyle: ClientStyle | undefined;
    readonly synthesizeEnumZeroValue: string | false;
    readonly oneofKindDiscriminator: string;
    readonly runtimeRpcImportPath: string;
    readonly runtimeImportPath: string;
    readonly forceExcludeAllOptions: boolean;
    readonly keepEnumPrefix: boolean;
    readonly useProtoFieldName: boolean;
    readonly tsNoCheck: boolean;
    readonly esLintDisable: boolean;
    readonly transpileTarget: ts.ScriptTarget | undefined;
    readonly transpileModule: ts.ModuleKind;
    readonly forceDisableServices: boolean;
    readonly addPbSuffix: boolean;
    getOptimizeMode(file: DescFile): FileOptions_OptimizeMode;
    getClientStyles(descriptor: DescService): ClientStyle[];
    getServerStyles(descriptor: DescService): ServerStyle[];
}
export declare function parseOptions(parameter: string, pluginCredit?: string): Options;
