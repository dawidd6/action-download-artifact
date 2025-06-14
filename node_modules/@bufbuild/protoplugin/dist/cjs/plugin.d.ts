import type { CodeGeneratorRequest, CodeGeneratorResponse } from "@bufbuild/protobuf/wkt";
/**
 * Represents any code generator plugin.
 */
export interface Plugin {
    /**
     * Name of this code generator plugin.
     */
    name: string;
    /**
     * Version of this code generator plugin.
     */
    version: string;
    /**
     * Run this plugin for the given request.
     */
    run(request: CodeGeneratorRequest): CodeGeneratorResponse;
}
