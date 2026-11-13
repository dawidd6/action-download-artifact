// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Readable } from "stream";
/**
 * Checks if the given value is a Node.js readable stream.
 *
 * @internal
 */
export function isNodeReadableStream(x) {
    return x instanceof Readable;
}
/**
 * Checks if the given value is a web ReadableStream.
 *
 * @internal
 */
export function isWebReadableStream(x) {
    return x instanceof ReadableStream;
}
//# sourceMappingURL=typeGuards-node.js.map