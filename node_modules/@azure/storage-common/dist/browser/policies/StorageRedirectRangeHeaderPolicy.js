// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Redirects the "range" header to "x-ms-range" for Azure Storage requests as the latter is preferred.
 */
export const storageRedirectRangeHeaderPolicyName = "storageRedirectRangeHeaderPolicy";
/**
 * StorageRedirectRangeHeaderPolicy
 */
export function storageRedirectRangeHeaderPolicy() {
    return {
        name: storageRedirectRangeHeaderPolicyName,
        async sendRequest(request, next) {
            if (request.headers.has("range")) {
                request.headers.set("x-ms-range", request.headers.get("range"));
                request.headers.delete("range");
            }
            return next(request);
        },
    };
}
//# sourceMappingURL=StorageRedirectRangeHeaderPolicy.js.map