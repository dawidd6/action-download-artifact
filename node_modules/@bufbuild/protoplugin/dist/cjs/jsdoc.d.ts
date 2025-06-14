import type { AnyDesc, DescFile } from "@bufbuild/protobuf";
export declare function createJsDocTextFromDesc(desc: Exclude<AnyDesc, DescFile>): string;
export declare function formatJsDocBlock(text: string, indentation: string | undefined): string;
