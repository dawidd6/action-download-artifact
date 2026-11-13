import type { NodeReadableStream } from "@azure/core-rest-pipeline";
export type OutgoingHandler = (body: () => NodeReadableStream, length: number, offset?: number) => Promise<unknown>;
export declare class BufferScheduler {
    constructor(_readable: NodeReadableStream, _bufferSize: number, _maxBuffers: number, _outgoingHandler: OutgoingHandler, _concurrency: number, _encoding?: string);
    do(): Promise<void>;
}
//# sourceMappingURL=BufferScheduler-browser.d.mts.map