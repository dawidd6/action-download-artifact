// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Signals the end of a stream by pushing null.
 * In Node.js, this is required to signal the end of a Readable stream.
 * @internal
 */
export function signalStreamEnd(pushData) {
    pushData(null);
}
//# sourceMappingURL=streamHelpers.js.map