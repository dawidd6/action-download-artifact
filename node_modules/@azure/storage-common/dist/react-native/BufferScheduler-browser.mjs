// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export class BufferScheduler {
    constructor(_readable, _bufferSize, _maxBuffers, _outgoingHandler, _concurrency, _encoding) {
        throw new Error("BufferScheduler is not supported in non-Node.js environments.");
    }
    async do() {
        throw new Error("BufferScheduler is not supported in non-Node.js environments.");
    }
}
//# sourceMappingURL=BufferScheduler-browser.mjs.map