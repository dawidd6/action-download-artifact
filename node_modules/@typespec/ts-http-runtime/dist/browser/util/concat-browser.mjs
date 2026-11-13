// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { isWebReadableStream } from "./typeGuards-browser.mjs";
/**
 * Drain the content of the given ReadableStream into a Blob.
 */
function drain(stream) {
    return new Response(stream).blob();
}
async function toBlobPart(source) {
    if (source instanceof Blob || source instanceof Uint8Array) {
        return source;
    }
    if (isWebReadableStream(source)) {
        return drain(source);
    }
    throw new Error("Unsupported source type. Only Blob, Uint8Array, and ReadableStream are supported in browser.");
}
/**
 * Converts a Uint8Array to a Uint8Array<ArrayBuffer>.
 */
function arrayToArrayBuffer(source) {
    if ("resize" in source.buffer) {
        // ArrayBuffer
        return source;
    }
    // SharedArrayBuffer
    return source.map((x) => x);
}
/**
 * Utility function that concatenates a set of binary inputs into one combined output.
 *
 * @param sources - array of sources for the concatenation
 * @returns a `Blob` representing all the concatenated inputs.
 *
 * @internal
 */
export async function concat(sources) {
    const parts = [];
    for (const source of sources) {
        const blobPart = await toBlobPart(typeof source === "function" ? source() : source);
        if (blobPart instanceof Blob) {
            parts.push(blobPart);
        }
        else {
            parts.push(new Blob([arrayToArrayBuffer(blobPart)]));
        }
    }
    return new Blob(parts);
}
//# sourceMappingURL=concat-browser.mjs.map