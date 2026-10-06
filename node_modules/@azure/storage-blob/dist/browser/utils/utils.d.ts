/**
 * Convert a Browser Blob object into ArrayBuffer.
 *
 * @param blob -
 */
export declare function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer>;
/**
 * Convert a Browser Blob object into string.
 *
 * @param blob -
 */
export declare function blobToString(blob: Blob): Promise<string>;
export declare function streamToBuffer(_stream: NodeJS.ReadableStream, _buffer: Buffer, _offset: number, _end: number, _encoding?: BufferEncoding): Promise<void>;
export declare function streamToBuffer2(_stream: NodeJS.ReadableStream, _buffer: Buffer, _encoding?: BufferEncoding): Promise<number>;
export declare function readStreamToLocalFile(_rs: NodeJS.ReadableStream, _file: string): Promise<void>;
export declare const fsStat: (_path: string) => Promise<{
    size: number;
}>;
export declare const fsCreateReadStream: (_path: string, _options?: {
    autoClose?: boolean;
    end?: number;
    start?: number;
}) => NodeJS.ReadableStream;
//# sourceMappingURL=utils.d.ts.map