export interface StructuredMessageDecodingStreamOptions {
    highWaterMark?: number;
}
export declare const structuredMessageDecodingStream: (_source: never, _options: StructuredMessageDecodingStreamOptions) => never;
/**
 * To decode structured body for CRC64 content validtion in storage downloading.
 * @param source -
 * @returns -
 */
export declare function structuredMessageDecodingBrowser(source: Blob | ReadableStream<Uint8Array>): Promise<Blob>;
//# sourceMappingURL=StructuredMessageDecodingStream-browser.d.mts.map