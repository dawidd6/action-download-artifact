import { DescFile } from "@bufbuild/protobuf";
import { Options } from "./options";
import { OutFile } from "./out-file";
export declare class FileTable {
    private readonly options;
    readonly outFiles: OutFile[];
    private readonly entries;
    private readonly clashResolveMaxTries;
    private readonly clashResolver;
    constructor(options: Options, clashResolver?: ClashResolver);
    register(requestedName: string, descFile: DescFile, kind?: string): string;
    create(descFile: DescFile, kind?: string): OutFile;
    protected hasName: (name: string) => boolean;
    /**
     * Find a symbol (of the given kind) for the given descriptor.
     * Return `undefined` if not found.
     */
    private findByProtoFilenameAndKind;
    /**
     * Find a symbol (of the given kind) for the given descriptor.
     * Raises error if not found.
     */
    get(descriptor: DescFile, kind?: string): FileTableEntry;
    /**
     * Is a name (of the given kind) registered for the the given descriptor?
     */
    private has;
    static defaultClashResolver(descriptor: DescFile, requestedName: string, kind: string, tryCount: number): string;
}
interface FileTableEntry {
    desc: DescFile;
    name: string;
    kind: string;
}
declare type ClashResolver = (descriptor: DescFile, requestedName: string, kind: string, tryCount: number, failedName: string) => string;
export {};
