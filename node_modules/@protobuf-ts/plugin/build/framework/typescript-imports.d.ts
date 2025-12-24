import { SymbolTable } from "./symbol-table";
import { TypescriptFile } from "./typescript-file";
import { DescEnum, DescMessage, DescService, FileRegistry } from "@bufbuild/protobuf";
export declare class TypeScriptImports {
    private readonly symbols;
    private readonly registry;
    constructor(symbols: SymbolTable, registry: FileRegistry);
    /**
     * Import {importName} from "importFrom";
     *
     * Automatically finds a free name if the
     * `importName` would collide with another
     * identifier.
     *
     * Returns imported name.
     */
    name(source: TypescriptFile, importName: string, importFrom: string, isTypeOnly?: boolean): string;
    /**
     * Import * as importAs from "importFrom";
     *
     * Returns name for `importAs`.
     */
    namespace(source: TypescriptFile, importAs: string, importFrom: string, isTypeOnly?: boolean): string;
    /**
     * Import a previously registered identifier for a message
     * or other descriptor.
     *
     * Uses the symbol table to look for the type, adds an
     * import statement if necessary and automatically finds a
     * free name if the identifier would clash in this file.
     *
     * If you have multiple representations for a descriptor
     * in your generated code, use `kind` to discriminate.
     */
    type(source: TypescriptFile, descriptor: DescMessage | DescEnum | DescService, kind?: string, isTypeOnly?: boolean): string;
    typeByName(source: TypescriptFile, typeName: string, kind?: string, isTypeOnly?: boolean): string;
}
