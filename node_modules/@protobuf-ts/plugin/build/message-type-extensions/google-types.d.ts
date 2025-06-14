import { TypescriptFile } from "../framework/typescript-file";
import * as ts from "typescript";
import { LongType } from "@protobuf-ts/runtime";
import { CustomMethodGenerator } from "../code-gen/message-type-generator";
import { DescMessage } from "@bufbuild/protobuf";
import { TypeScriptImports } from "../framework/typescript-imports";
export declare class GoogleTypes implements CustomMethodGenerator {
    private readonly imports;
    private readonly options;
    constructor(imports: TypeScriptImports, options: {
        normalLongType: LongType;
        runtimeImportPath: string;
        useProtoFieldName: boolean;
    });
    /**
     * Create custom methods for the handlers of some google types.
     */
    make(source: TypescriptFile, descMessage: DescMessage): ts.MethodDeclaration[];
    ['google.type.Color'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.type.Date'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.type.DateTime'](source: TypescriptFile, descMessage: DescMessage): string[];
    ['google.type.TimeOfDay'](source: TypescriptFile, descMessage: DescMessage): string[];
}
