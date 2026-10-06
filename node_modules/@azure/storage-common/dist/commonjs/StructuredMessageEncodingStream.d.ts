import type { RequestBodyType as HttpRequestBody } from "@azure/core-rest-pipeline";
/**
 * Options used when creating StructuredMessageEncodingStream
 */
export interface StructuredMessageEncodingStreamOptions {
    /**
     * A threshold, not a limit. Dictates the amount of data that a stream buffers before it stops asking for more data.
     */
    highWaterMark?: number;
}
/**
 *
 * To encode structured body for CRC64 content validtion in storage uploading.
 * @param source -
 * @param contentLength -
 * @returns
 */
export declare function structuredMessageEncoding(source: HttpRequestBody, contentLength: number): Promise<{
    body: HttpRequestBody;
    encodedContentLength: number;
}>;
//# sourceMappingURL=StructuredMessageEncodingStream.d.ts.map