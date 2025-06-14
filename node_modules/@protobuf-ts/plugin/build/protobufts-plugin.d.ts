import { FileRegistry } from "@bufbuild/protobuf";
import { CodeGeneratorResponse_Feature } from "@bufbuild/protobuf/wkt";
import type { CodeGeneratorRequest } from "@bufbuild/protobuf/wkt";
import { GeneratedFile } from "./framework/generated-file";
import { OutFile } from "./out-file";
import { Options } from "./options";
import { PluginBaseProtobufES } from "./framework/plugin-base";
export declare class ProtobuftsPlugin extends PluginBaseProtobufES {
    private readonly version;
    constructor(version: string);
    generate(request: CodeGeneratorRequest): GeneratedFile[];
    protected transpile(tsFiles: OutFile[], options: Options): GeneratedFile[];
    protected getSupportedFeatures: () => CodeGeneratorResponse_Feature[];
    private isFileUsed;
    private isTypeUsed;
}
export declare function createFileRegistryFromRequest(request: CodeGeneratorRequest): FileRegistry;
