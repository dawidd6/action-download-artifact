import * as rt from "@protobuf-ts/runtime";
import * as ts from "typescript";
import { TypescriptFile } from "../framework/typescript-file";
import { TypeScriptImports } from "../framework/typescript-imports";
import { FileRegistry } from "@bufbuild/protobuf";
/**
 * Generates TypeScript code for runtime field information,
 * from runtime field information.
 */
export declare class FieldInfoGenerator {
    private readonly registry;
    private readonly imports;
    constructor(registry: FileRegistry, imports: TypeScriptImports);
    createFieldInfoLiterals(source: TypescriptFile, fieldInfos: readonly rt.PartialFieldInfo[]): ts.ArrayLiteralExpression;
    createFieldInfoLiteral(source: TypescriptFile, fieldInfo: rt.PartialFieldInfo): ts.ObjectLiteralExpression;
    /**
     * Creates the interface field / oneof name based on original proto field name and naming options.
     */
    static createTypescriptLocalName(name: string, options: {
        useProtoFieldName: boolean;
    }): string;
    /**
     * Turn normalized field info returned by normalizeFieldInfo() back into
     * the minimized form.
     */
    private static denormalizeFieldInfo;
    private createMessageT;
    private createEnumT;
    private createRepeatType;
    private createScalarType;
    private createLongType;
    private createMapV;
}
