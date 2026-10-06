// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { agentPolicy } from "./agentPolicy.js";
import { tlsPolicy } from "./tlsPolicy.js";
import { proxyPolicy } from "./proxyPolicy.js";
import { decompressResponsePolicy } from "./decompressResponsePolicy.js";
import { redirectPolicy } from "./redirectPolicy.js";
/**
 * Add platform-specific policies to the pipeline.
 *
 * On Node.js, this adds agent, TLS, proxy, decompression, and redirect
 * policies. On browser and React Native these concerns are handled
 * natively by the runtime, so this is a no-op.
 *
 * @internal
 */
export function addPlatformPolicies(pipeline, options) {
    if (options.agent) {
        pipeline.addPolicy(agentPolicy(options.agent));
    }
    if (options.tlsOptions) {
        pipeline.addPolicy(tlsPolicy(options.tlsOptions));
    }
    pipeline.addPolicy(proxyPolicy(options.proxyOptions));
    pipeline.addPolicy(decompressResponsePolicy());
    // Both XHR and Fetch expect to handle redirects automatically,
    // so this only takes effect on Node.
    pipeline.addPolicy(redirectPolicy(options.redirectOptions), { afterPhase: "Retry" });
}
//# sourceMappingURL=platformPolicies.js.map