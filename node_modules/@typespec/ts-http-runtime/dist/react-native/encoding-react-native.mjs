// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Decodes a Uint8Array to a UTF-8 string.
 *
 * @internal
 */
export function decodeUtf8(bytes) {
    if (typeof TextDecoder === "undefined") {
        throw new Error("TextDecoder is not available in this environment. Please provide a polyfill.");
    }
    return new TextDecoder().decode(bytes);
}
/**
 * Encodes a string to a UTF-8 Uint8Array.
 *
 * @internal
 */
export function encodeUtf8(value) {
    if (typeof TextEncoder === "undefined") {
        throw new Error("TextEncoder is not available in this environment. Please provide a polyfill.");
    }
    return new TextEncoder().encode(value);
}
//# sourceMappingURL=encoding-react-native.mjs.map