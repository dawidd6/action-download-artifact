import { PluginBaseProtobufES } from "./framework/plugin-base";
import { CodeGeneratorRequest, CodeGeneratorResponse_Feature } from "@bufbuild/protobuf/wkt";
import { GeneratedFile } from "./framework/generated-file";
export declare class DumpPlugin extends PluginBaseProtobufES<GeneratedFile> {
    generate(request: CodeGeneratorRequest): GeneratedFile[];
    private static mkdir;
    protected getSupportedFeatures: () => CodeGeneratorResponse_Feature[];
}
