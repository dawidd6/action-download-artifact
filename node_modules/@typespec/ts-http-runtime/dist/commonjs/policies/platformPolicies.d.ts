import type { Pipeline } from "../pipeline.js";
import type { Agent, ProxySettings, TlsSettings } from "../interfaces.js";
import type { RedirectPolicyOptions } from "./redirectPolicy.js";
/**
 * Options for configuring platform-specific pipeline policies.
 *
 * @internal
 */
export interface PlatformPoliciesOptions {
    agent?: Agent;
    tlsOptions?: TlsSettings;
    proxyOptions?: ProxySettings;
    redirectOptions?: RedirectPolicyOptions;
}
/**
 * Add platform-specific policies to the pipeline.
 *
 * On Node.js, this adds agent, TLS, proxy, decompression, and redirect
 * policies. On browser and React Native these concerns are handled
 * natively by the runtime, so this is a no-op.
 *
 * @internal
 */
export declare function addPlatformPolicies(pipeline: Pipeline, options: PlatformPoliciesOptions): void;
//# sourceMappingURL=platformPolicies.d.ts.map