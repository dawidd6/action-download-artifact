import * as rpc from "@protobuf-ts/runtime-rpc";
import * as ts from "typescript";
import { TypescriptFile } from "../framework/typescript-file";
import { TypeScriptImports } from "../framework/typescript-imports";
/**
 * Generates TypeScript code for runtime method information,
 * from method field information.
 */
export declare class MethodInfoGenerator {
    private readonly imports;
    constructor(imports: TypeScriptImports);
    createMethodInfoLiterals(source: TypescriptFile, methodInfos: readonly rpc.PartialMethodInfo[]): ts.ArrayLiteralExpression;
    createMethodInfoLiteral(source: TypescriptFile, methodInfo: rpc.PartialMethodInfo): ts.ObjectLiteralExpression;
    /**
     * Turn normalized method info returned by normalizeMethodInfo() back into
     * the minimized form.
     */
    private static denormalizeMethodInfo;
}
