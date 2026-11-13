// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * In the browser, Buffer is not available. This always returns false.
 */
export function isBuffer(_value) {
    return false;
}
/**
 * In the browser, Buffer is not available. This always throws.
 */
export function allocBuffer(_size) {
    throw new Error("Buffer is not available in this environment.");
}
/**
 * In the browser, Buffer is not available. This always throws.
 */
export function bufferFromArrayBuffer(_ab, _byteOffset, _length) {
    throw new Error("Buffer is not available in this environment.");
}
/**
 * In the browser, Buffer is not available. This always throws.
 */
export function getBufferLength(_buffer) {
    throw new Error("Buffer is not available in this environment.");
}
//# sourceMappingURL=bufferHelpers-browser.mjs.map