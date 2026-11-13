import type { OperationRequestInfo } from "./interfaces.js";
/**
 * Holds the singleton operationRequestMap, to be shared across CJS and ESM imports.
 */
export declare const state: {
    operationRequestMap: WeakMap<import("@azure/core-rest-pipeline").PipelineRequest, OperationRequestInfo>;
};
//# sourceMappingURL=state-cjs.d.ts.map