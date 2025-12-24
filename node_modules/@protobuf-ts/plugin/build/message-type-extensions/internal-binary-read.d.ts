import * as ts from "typescript";
import { TypescriptFile } from "../framework/typescript-file";
import { LongType } from "@protobuf-ts/runtime";
import { CustomMethodGenerator } from "../code-gen/message-type-generator";
import { Interpreter } from "../interpreter";
import { DescMessage, FileRegistry } from "@bufbuild/protobuf";
import { TypeScriptImports } from "../framework/typescript-imports";
/**
 * Generates a "internalBinaryRead()" method for an `IMessageType`
 */
export declare class InternalBinaryRead implements CustomMethodGenerator {
    private readonly registry;
    private readonly imports;
    private readonly interpreter;
    private readonly options;
    constructor(registry: FileRegistry, imports: TypeScriptImports, interpreter: Interpreter, options: {
        normalLongType: LongType;
        oneofKindDiscriminator: string;
        runtimeImportPath: string;
    });
    private readonly binaryReadMapEntryMethodName;
    make(source: TypescriptFile, descMessage: DescMessage): ts.MethodDeclaration[];
    private makeMethod;
    private makeVariables;
    private makeWhileSwitch;
    private makeCaseClauses;
    private makeDefaultClause;
    private map;
    private message;
    private messageOneof;
    private messageRepeated;
    private scalar;
    private scalarOneof;
    private scalarRepeated;
    private makeMapEntryReadMethod;
    private createMapKeyDefaultValue;
    private createMapValueDefaultValue;
    private createScalarDefaultValue;
    private makeReaderCall;
}
