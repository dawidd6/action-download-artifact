// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Decodes a Uint8Array to a UTF-8 string.
 *
 * @internal
 */
export function decodeUtf8(bytes) {
    return new TextDecoder().decode(bytes);
}
/**
 * Encodes a string to a UTF-8 Uint8Array.
 *
 * @internal
 */
export function encodeUtf8(value) {
    return new TextEncoder().encode(value);
}
//# sourceMappingURL=encoding.js.map