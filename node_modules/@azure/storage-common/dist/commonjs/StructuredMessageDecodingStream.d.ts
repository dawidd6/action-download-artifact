/**
 * To decode structured body for CRC64 content validtion in storage downloading.
 * @param source -
 */
export declare function structuredMessageDecodingBrowser(source: Blob | ReadableStream<Uint8Array>): Promise<Blob>;
/**
 * Options used when creating StructuredMessageDecodingStream
 */
export interface StructuredMessageDecodingStreamOptions {
    /**
     * A threshold, not a limit. Dictates the amount of data that a stream buffers before it stops asking for more data.
     */
    highWaterMark?: number;
}
/**
 * To decode structured body for CRC64 content validtion in storage downloading.
 * @param source -
 * @param options -
 * @returns
 */
export declare function structuredMessageDecodingStream(source: NodeJS.ReadableStream, options: StructuredMessageDecodingStreamOptions): NodeJS.ReadableStream;
//# sourceMappingURL=StructuredMessageDecodingStream.d.ts.map