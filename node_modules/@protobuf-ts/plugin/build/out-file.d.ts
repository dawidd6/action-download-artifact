import { TypescriptFile } from "./framework/typescript-file";
import { GeneratedFile } from "./framework/generated-file";
import { Options } from "./options";
import { DescFile } from "@bufbuild/protobuf";
/**
 * A protobuf-ts output file.
 */
export declare class OutFile extends TypescriptFile implements GeneratedFile {
    readonly descFile: DescFile;
    private readonly options;
    private header;
    constructor(name: string, descFile: DescFile, options: Options);
    getContent(): string;
    getHeader(): string;
    private makeHeader;
}
