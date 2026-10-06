// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RestError } from "../restError.js";
import { createHttpHeaders } from "../httpHeaders.js";
export function createRestError(messageOrResponse, response) {
    const resp = typeof messageOrResponse === "string" ? response : messageOrResponse;
    const internalError = resp.body?.error ?? resp.body;
    const message = typeof messageOrResponse === "string"
        ? messageOrResponse
        : (internalError?.message ?? `Unexpected status code: ${resp.status}`);
    return new RestError(message, {
        statusCode: statusCodeToNumber(resp.status),
        code: internalError?.code,
        request: resp.request,
        response: toPipelineResponse(resp),
    });
}
function toPipelineResponse(errorResponse) {
    return {
        headers: createHttpHeaders(errorResponse.headers),
        request: errorResponse.request,
        status: statusCodeToNumber(errorResponse.status) ?? -1,
        ...(typeof errorResponse.body === "string" ? { bodyAsText: errorResponse.body } : {}),
    };
}
function statusCodeToNumber(statusCode) {
    const status = Number.parseInt(statusCode);
    return Number.isNaN(status) ? undefined : status;
}
//# sourceMappingURL=restError.js.map