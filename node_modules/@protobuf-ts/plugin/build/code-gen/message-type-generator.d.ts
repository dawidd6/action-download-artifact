import * as ts from "typescript";
import { LongType } from "@protobuf-ts/runtime";
import { TypescriptFile } from "../framework/typescript-file";
import { CommentGenerator } from "./comment-generator";
import { Interpreter } from "../interpreter";
import { DescMessage, FileRegistry } from "@bufbuild/protobuf";
import { FileOptions_OptimizeMode } from "@bufbuild/protobuf/wkt";
import { TypeScriptImports } from "../framework/typescript-imports";
export interface CustomMethodGenerator {
    make(source: TypescriptFile, descMessage: DescMessage): ts.MethodDeclaration[];
}
export declare class MessageTypeGenerator {
    private readonly registry;
    private readonly imports;
    private readonly comments;
    private readonly interpreter;
    private readonly options;
    private readonly wellKnown;
    private readonly googleTypes;
    private readonly typeMethodCreate;
    private readonly typeMethodInternalBinaryRead;
    private readonly typeMethodInternalBinaryWrite;
    private readonly fieldInfoGenerator;
    constructor(registry: FileRegistry, imports: TypeScriptImports, comments: CommentGenerator, interpreter: Interpreter, options: {
        runtimeImportPath: string;
        normalLongType: LongType;
        oneofKindDiscriminator: string;
        useProtoFieldName: boolean;
    });
    /**
     * Declare a handler for the message. The handler provides
     * functions to read / write messages of the specific type.
     *
     * For the following .proto:
     *
     *   package test;
     *   message MyMessage {
     *     string str_field = 1;
     *   }
     *
     * We generate the following variable declaration:
     *
     *   import { H } from "R";
     *   const MyMessage: H<MyMessage> =
     *     new H<MyMessage>(
     *       ".test.MyMessage",
     *       [{ no: 0, name: "str_field", kind: "scalar", T: 9 }]
     *     );
     *
     * H is the concrete class imported from runtime R.
     * Some field information is passed to the handler's
     * constructor.
     */
    generateMessageType(source: TypescriptFile, descMessage: DescMessage, optimizeFor: FileOptions_OptimizeMode): void;
}
