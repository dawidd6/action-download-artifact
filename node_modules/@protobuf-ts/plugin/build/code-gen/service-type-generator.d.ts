import { TypescriptFile } from "../framework/typescript-file";
import { CommentGenerator } from "./comment-generator";
import { DescService } from "@bufbuild/protobuf";
import { Interpreter } from "../interpreter";
import { TypeScriptImports } from "../framework/typescript-imports";
import { SymbolTable } from "../framework/symbol-table";
export declare class ServiceTypeGenerator {
    private readonly symbols;
    private readonly imports;
    private readonly comments;
    private readonly interpreter;
    private readonly options;
    private readonly methodInfoGenerator;
    constructor(symbols: SymbolTable, imports: TypeScriptImports, comments: CommentGenerator, interpreter: Interpreter, options: {
        runtimeRpcImportPath: string;
    });
    registerSymbols(source: TypescriptFile, descService: DescService): void;
    generateServiceType(source: TypescriptFile, descService: DescService): void;
}
