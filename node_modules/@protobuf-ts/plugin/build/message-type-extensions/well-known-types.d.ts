import { TypescriptFile } from "../framework/typescript-file";
import * as ts from "typescript";
import { LongType } from "@protobuf-ts/runtime";
import { CustomMethodGenerator } from "../code-gen/message-type-generator";
import { DescMessage } from "@bufbuild/protobuf";
import { TypeScriptImports } from "../framework/typescript-imports";
export declare class WellKnownTypes implements CustomMethodGenerator {
    private readonly imports;
    private readonly options;
    static readonly protoFilenames: string[];
    constructor(imports: TypeScriptImports, options: {
        normalLongType: LongType;
        runtimeImportPath: string;
        useProtoFieldName: boolean;
    });
    /**
     * Create custom methods for the handlers of well known types.
     *
     * Well known types have a custom JSON representation and we
     * also add some convenience methods, for example to convert a
     * `google.protobuf.Timestamp` to a javascript Date.
     */
    make(source: TypescriptFile, descMessage: DescMessage): ts.MethodDeclaration[];
    ['google.protobuf.Empty'](): void;
    ['google.protobuf.Any'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.Timestamp'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.Duration'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.FieldMask'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.Struct'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.Value'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.NullValue'](): void;
    ['google.protobuf.ListValue'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.BoolValue'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.StringValue'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.DoubleValue'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.FloatValue'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.Int32Value'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.UInt32Value'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.Int64Value'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.UInt64Value'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.protobuf.BytesValue'](source: TypescriptFile, descMessage: DescMessage): string[];
}
