import type { PipelinePolicy } from "@azure/core-rest-pipeline";
/**
 * Redirects the "range" header to "x-ms-range" for Azure Storage requests as the latter is preferred.
 */
export declare const storageRedirectRangeHeaderPolicyName = "storageRedirectRangeHeaderPolicy";
/**
 * StorageRedirectRangeHeaderPolicy
 */
export declare function storageRedirectRangeHeaderPolicy(): PipelinePolicy;
//# sourceMappingURL=StorageRedirectRangeHeaderPolicy.d.ts.map