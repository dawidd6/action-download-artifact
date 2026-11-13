import type { ProxySettings } from "../interfaces.js";
import type { PipelinePolicy } from "../pipeline.js";
export declare const proxyPolicyName = "proxyPolicy";
/**
 * Proxy settings are not supported outside of Node.js, so there are no
 * settings to retrieve in this environment.
 * @deprecated - Internally this method is no longer necessary when setting proxy information.
 */
export declare function getDefaultProxySettings(_proxyUrl?: string): ProxySettings | undefined;
/**
 * proxyPolicy is not supported outside of Node.js. To avoid breaking pipelines
 * that include it on unsupported platforms, this implementation returns a
 * no-op policy that simply forwards the request to the next policy.
 */
export declare function proxyPolicy(_proxySettings?: ProxySettings, _options?: {
    customNoProxyList?: string[];
}): PipelinePolicy;
/**
 * A function to reset the cached agents.
 * proxyPolicy is not supported outside of Node.js, so this is a no-op.
 * @internal
 */
export declare function resetCachedProxyAgents(): void;
//# sourceMappingURL=proxyPolicy.common.d.ts.map