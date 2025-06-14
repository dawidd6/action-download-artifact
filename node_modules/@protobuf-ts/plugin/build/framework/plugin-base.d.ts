/// <reference types="node" />
import type { CodeGeneratorRequest, CodeGeneratorResponse } from "@bufbuild/protobuf/wkt";
import { CodeGeneratorResponse_Feature } from "@bufbuild/protobuf/wkt";
import { ReadStream } from "tty";
import { GeneratedFile } from "./generated-file";
export declare abstract class PluginBaseProtobufES<T extends GeneratedFile = GeneratedFile> {
    abstract generate(request: CodeGeneratorRequest): Promise<T[]> | T[];
    run(): Promise<void>;
    protected getSupportedFeatures(): CodeGeneratorResponse_Feature[];
    protected readBytes(stream: ReadStream): Promise<Uint8Array>;
    protected createResponse(files: GeneratedFile[]): CodeGeneratorResponse;
    protected errorToString(error: any): string;
    private setBlockingStdout;
}
