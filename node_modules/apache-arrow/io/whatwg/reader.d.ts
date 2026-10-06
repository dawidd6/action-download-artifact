/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { TypeMap } from '../../type.js';
import { RecordBatch } from '../../recordbatch.js';
/** @ignore */
export declare function recordBatchReaderThroughDOMStream<T extends TypeMap = any>(writableStrategy?: ByteLengthQueuingStrategy, readableStrategy?: {
    autoDestroy: boolean;
}): {
    writable: import("node:stream/web").WritableStream<NodeJS.ArrayBufferView>;
    readable: import("node:stream/web").ReadableStream<RecordBatch<T>>;
};
