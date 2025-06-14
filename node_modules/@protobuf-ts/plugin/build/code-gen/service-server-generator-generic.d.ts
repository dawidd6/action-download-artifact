import { TypescriptFile } from "../framework/typescript-file";
import * as ts from "typescript";
import { CommentGenerator } from "./comment-generator";
import { Interpreter } from "../interpreter";
import { DescService } from "@bufbuild/protobuf";
import { TypeScriptImports } from "../framework/typescript-imports";
import { SymbolTable } from "../framework/symbol-table";
export declare class ServiceServerGeneratorGeneric {
    private readonly symbols;
    private readonly imports;
    private readonly comments;
    private readonly interpreter;
    private readonly options;
    private readonly symbolKindInterface;
    constructor(symbols: SymbolTable, imports: TypeScriptImports, comments: CommentGenerator, interpreter: Interpreter, options: {
        runtimeRpcImportPath: string;
    });
    registerSymbols(source: TypescriptFile, descService: DescService): void;
    generateInterface(source: TypescriptFile, descService: DescService): ts.InterfaceDeclaration;
    private createUnary;
    private createServerStreaming;
    private createClientStreaming;
    private createBidi;
}
