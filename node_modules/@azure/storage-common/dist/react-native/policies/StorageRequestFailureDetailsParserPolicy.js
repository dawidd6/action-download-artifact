// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * The programmatic identifier of the StorageRequestFailureDetailsParserPolicy.
 */
export const storageRequestFailureDetailsParserPolicyName = "storageRequestFailureDetailsParserPolicy";
/**
 * StorageRequestFailureDetailsParserPolicy
 */
export function storageRequestFailureDetailsParserPolicy() {
    return {
        name: storageRequestFailureDetailsParserPolicyName,
        async sendRequest(request, next) {
            try {
                const response = await next(request);
                if (response.status === 400 &&
                    response.bodyAsText?.includes("<Error><Code>InvalidHeaderValue</Code>") &&
                    response.bodyAsText.includes("<HeaderName>x-ms-version</HeaderName>")) {
                    // replace the error message with a more user-friendly one that includes a link to documentation
                    /* example response text:
                    `<?xml version="1.0" encoding="utf-8"?>
          <Error><Code>InvalidHeaderValue</Code><Message>The value for one of the HTTP headers is not in the correct format.
          RequestId:e5ea566c-101e-001c-1ec4-acf180000000
          Time:2026-03-05T17:24:34.6688015Z</Message><HeaderName>x-ms-version</HeaderName><HeaderValue>3025-01-01</HeaderValue></Error>`
                    */
                    response.bodyAsText = response.bodyAsText.replace(/<Message>.*<\/Message>/s, "<Message>The provided service version is not enabled on this storage account. Please see https://learn.microsoft.com/rest/api/storageservices/versioning-for-the-azure-storage-services for additional information.</Message>");
                }
                return response;
            }
            catch (err) {
                if (typeof err === "object" &&
                    err !== null &&
                    err.response &&
                    err.response.parsedBody) {
                    if (err.response.parsedBody.code === "InvalidHeaderValue" &&
                        err.response.parsedBody.HeaderName === "x-ms-version") {
                        err.message =
                            "The provided service version is not enabled on this storage account. Please see https://learn.microsoft.com/rest/api/storageservices/versioning-for-the-azure-storage-services for additional information.\n";
                    }
                }
                throw err;
            }
        },
    };
}
//# sourceMappingURL=StorageRequestFailureDetailsParserPolicy.js.map