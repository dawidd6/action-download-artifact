import type { ImportSymbol } from "./import-symbol.js";
import { symbols } from "@bufbuild/protobuf/codegenv2";
export type RuntimeImports = mapRecord<typeof symbols>;
export declare function createRuntimeImports(bootstrapWkt: boolean): RuntimeImports;
type mapRecord<T extends Record<string, unknown>> = {
    [P in keyof T]: T[P] extends symbolInfo ? ImportSymbol : T[P] extends Record<string, unknown> ? mapRecord<T[P]> : never;
};
declare function mapRecord<T extends Record<string, unknown>>(record: T, bootstrapWkt: boolean): mapRecord<T>;
type symbolInfo = {
    readonly typeOnly: boolean;
    readonly from: string;
    readonly bootstrapWktFrom: string;
};
export {};
