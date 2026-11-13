// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { logPolicy } from "./policies/logPolicy.js";
import { createEmptyPipeline } from "./pipeline.js";
import { userAgentPolicy } from "./policies/userAgentPolicy.js";
import { defaultRetryPolicy } from "./policies/defaultRetryPolicy.js";
import { formDataPolicy } from "./policies/formDataPolicy.js";
import { addPlatformPolicies } from "./policies/platformPolicies-web.mjs";
import { multipartPolicy, multipartPolicyName } from "./policies/multipartPolicy.js";
/**
 * Create a new pipeline with a default set of customizable policies.
 * @param options - Options to configure a custom pipeline.
 */
export function createPipelineFromOptions(options) {
    const pipeline = createEmptyPipeline();
    addPlatformPolicies(pipeline, options);
    pipeline.addPolicy(formDataPolicy(), { beforePolicies: [multipartPolicyName] });
    pipeline.addPolicy(userAgentPolicy(options.userAgentOptions));
    // The multipart policy is added after policies with no phase, so that
    // policies can be added between it and formDataPolicy to modify
    // properties (e.g., making the boundary constant in recorded tests).
    pipeline.addPolicy(multipartPolicy(), { afterPhase: "Deserialize" });
    pipeline.addPolicy(defaultRetryPolicy(options.retryOptions), { phase: "Retry" });
    pipeline.addPolicy(logPolicy(options.loggingOptions), { afterPhase: "Sign" });
    return pipeline;
}
//# sourceMappingURL=createPipelineFromOptions.js.map