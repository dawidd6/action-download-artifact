import * as ts from "typescript";
import { TypescriptFile } from "../framework/typescript-file";
import { CommentGenerator } from "./comment-generator";
import { DescEnum } from "@bufbuild/protobuf";
import { Interpreter } from "../interpreter";
import { TypeScriptImports } from "../framework/typescript-imports";
import { SymbolTable } from "../framework/symbol-table";
export declare class EnumGenerator {
    private readonly symbols;
    private readonly imports;
    private readonly comments;
    private readonly interpreter;
    constructor(symbols: SymbolTable, imports: TypeScriptImports, comments: CommentGenerator, interpreter: Interpreter);
    registerSymbols(source: TypescriptFile, descEnum: DescEnum): void;
    /**
     * For the following .proto:
     *
     * ```proto
     *   enum MyEnum {
     *     ANY = 0;
     *     YES = 1;
     *     NO = 2;
     *   }
     * ```
     *
     * We generate the following enum:
     *
     * ```typescript
     *   enum MyEnum {
     *       ANY = 0,
     *       YES = 1,
     *       NO = 2
     *   }
     * ```
     *
     * We drop a shared prefix, for example:
     *
     * ```proto
     * enum MyEnum {
     *     MY_ENUM_FOO = 0;
     *     MY_ENUM_BAR = 1;
     * }
     * ```
     *
     * Becomes:
     *
     * ```typescript
     *   enum MyEnum {
     *       FOO = 0,
     *       BAR = 1,
     *   }
     * ```
     *
     */
    generateEnum(source: TypescriptFile, descriptor: DescEnum): ts.EnumDeclaration;
}
