// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { isNodeReadableStream, isWebReadableStream } from "./typeGuards-react-native.mjs";
export { isNodeReadableStream, isWebReadableStream };
export function isBinaryBody(body) {
    return (body !== undefined &&
        (body instanceof Uint8Array ||
            isReadableStream(body) ||
            typeof body === "function" ||
            body instanceof Blob));
}
export function isReadableStream(x) {
    return isNodeReadableStream(x) || isWebReadableStream(x);
}
export function isBlob(x) {
    return x instanceof Blob;
}
//# sourceMappingURL=typeGuards.js.map