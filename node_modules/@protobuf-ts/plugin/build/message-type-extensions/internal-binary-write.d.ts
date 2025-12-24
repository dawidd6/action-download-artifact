import * as ts from "typescript";
import { TypescriptFile } from "../framework/typescript-file";
import { CustomMethodGenerator } from "../code-gen/message-type-generator";
import { Interpreter } from "../interpreter";
import { DescMessage, FileRegistry } from "@bufbuild/protobuf";
import { TypeScriptImports } from "../framework/typescript-imports";
/**
 * Generates the `internalBinaryWrite` method, which writes a message
 * in binary format.
 *
 * Heads up: The generated code is only very marginally faster than
 * the reflection-based one. The gain is less than 3%.
 *
 */
export declare class InternalBinaryWrite implements CustomMethodGenerator {
    private readonly registry;
    private readonly imports;
    private readonly interpreter;
    private readonly options;
    constructor(registry: FileRegistry, imports: TypeScriptImports, interpreter: Interpreter, options: {
        oneofKindDiscriminator: string;
        runtimeImportPath: string;
    });
    make(source: TypescriptFile, descMessage: DescMessage): ts.MethodDeclaration[];
    private makeMethod;
    private makeUnknownFieldsHandler;
    private makeStatementsForEveryField;
    private scalar;
    private scalarRepeated;
    private scalarOneof;
    private message;
    private messageRepeated;
    private messageOneof;
    private map;
    private makeWriterCall;
    private makeWriterTagCall;
    private wireTypeForSingleScalar;
}
