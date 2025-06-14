import { TypescriptFile } from "../framework/typescript-file";
import * as ts from "typescript";
import { CommentGenerator } from "./comment-generator";
import { Interpreter } from "../interpreter";
import { DescService } from "@bufbuild/protobuf";
import { TypeScriptImports } from "../framework/typescript-imports";
import { SymbolTable } from "../framework/symbol-table";
export declare class ServiceServerGeneratorGrpc {
    private readonly symbols;
    private readonly imports;
    private readonly comments;
    private readonly interpreter;
    private readonly symbolKindInterface;
    private readonly symbolKindDefinition;
    constructor(symbols: SymbolTable, imports: TypeScriptImports, comments: CommentGenerator, interpreter: Interpreter);
    registerSymbols(source: TypescriptFile, descService: DescService): void;
    generateInterface(source: TypescriptFile, descService: DescService): ts.InterfaceDeclaration;
    private createMethodPropertySignature;
    generateDefinition(source: TypescriptFile, descService: DescService): ts.VariableStatement;
    private makeDefinitionProperty;
}
