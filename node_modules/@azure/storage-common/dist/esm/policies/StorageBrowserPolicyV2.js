// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * The programmatic identifier of the StorageBrowserPolicy.
 */
export const storageBrowserPolicyName = "storageBrowserPolicy";
/**
 * storageBrowserPolicy is a policy used to prevent browsers from caching requests
 * and to remove cookies and explicit content-length headers.
 *
 * In Node.js, this policy is a no-op pass-through.
 */
export function storageBrowserPolicy() {
    return {
        name: storageBrowserPolicyName,
        async sendRequest(request, next) {
            return next(request);
        },
    };
}
//# sourceMappingURL=StorageBrowserPolicyV2.js.map