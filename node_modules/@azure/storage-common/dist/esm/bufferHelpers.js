// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Checks whether a value is a Node.js Buffer.
 */
export function isBuffer(value) {
    return Buffer.isBuffer(value);
}
/**
 * Allocates a new zero-filled Buffer of the given size.
 */
export function allocBuffer(size) {
    return Buffer.alloc(size);
}
/**
 * Creates a Buffer from an ArrayBuffer, with optional offset and length.
 */
export function bufferFromArrayBuffer(ab, byteOffset, length) {
    return Buffer.from(ab, byteOffset, length);
}
/**
 * Returns the byte length of a buffer.
 */
export function getBufferLength(buffer) {
    return buffer.length;
}
//# sourceMappingURL=bufferHelpers.js.map