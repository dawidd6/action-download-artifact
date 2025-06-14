import type { FileInfo } from "./generated-file.js";
export declare function transpile(files: FileInfo[], transpileJs: boolean, transpileDts: boolean, jsImportStyle: "module" | "legacy_commonjs"): FileInfo[];
