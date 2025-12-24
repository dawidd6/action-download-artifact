import { TypescriptFile } from "../framework/typescript-file";
import * as ts from "typescript";
import { LongType } from "@protobuf-ts/runtime";
import { CustomMethodGenerator } from "../code-gen/message-type-generator";
import { Interpreter } from "../interpreter";
import { DescMessage } from "@bufbuild/protobuf";
import { TypeScriptImports } from "../framework/typescript-imports";
/**
 * Generates a "create()" method for an `IMessageType`
 */
export declare class Create implements CustomMethodGenerator {
    private readonly imports;
    private readonly interpreter;
    private readonly options;
    constructor(imports: TypeScriptImports, interpreter: Interpreter, options: {
        normalLongType: LongType;
        oneofKindDiscriminator: string;
        runtimeImportPath: string;
    });
    make(source: TypescriptFile, descMessage: DescMessage): ts.MethodDeclaration[];
    private makeMethod;
    private makeMessageVariable;
    private makeMessagePropertyAssignments;
    private makeMergeIf;
}
