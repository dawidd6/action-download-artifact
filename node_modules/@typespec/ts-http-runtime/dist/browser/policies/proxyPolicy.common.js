// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export const proxyPolicyName = "proxyPolicy";
/**
 * Proxy settings are not supported outside of Node.js, so there are no
 * settings to retrieve in this environment.
 * @deprecated - Internally this method is no longer necessary when setting proxy information.
 */
export function getDefaultProxySettings(_proxyUrl) {
    return undefined;
}
/**
 * proxyPolicy is not supported outside of Node.js. To avoid breaking pipelines
 * that include it on unsupported platforms, this implementation returns a
 * no-op policy that simply forwards the request to the next policy.
 */
export function proxyPolicy(_proxySettings, _options) {
    return {
        name: proxyPolicyName,
        sendRequest(request, next) {
            // Proxy is not supported outside of Node.js, so do nothing.
            return next(request);
        },
    };
}
/**
 * A function to reset the cached agents.
 * proxyPolicy is not supported outside of Node.js, so this is a no-op.
 * @internal
 */
export function resetCachedProxyAgents() {
    // Proxy is not supported outside of Node.js, so there is nothing to reset.
}
//# sourceMappingURL=proxyPolicy.common.js.map