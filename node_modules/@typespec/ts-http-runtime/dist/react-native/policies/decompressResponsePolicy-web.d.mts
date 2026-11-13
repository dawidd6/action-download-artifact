import type { PipelinePolicy } from "../pipeline.js";
export declare const decompressResponsePolicyName = "decompressResponsePolicy";
/**
 * decompressResponsePolicy is not supported in the browser and attempting
 * to use it will raise an error.
 */
export declare function decompressResponsePolicy(): PipelinePolicy;
//# sourceMappingURL=decompressResponsePolicy-web.d.mts.map