import * as stream from 'stream';
export declare class WaterMarkedUploadStream extends stream.Transform {
    constructor(bufferSize: number);
    _transform(chunk: any, enc: any, cb: any): void;
}
export declare function createRawFileUploadStream(filePath: string): Promise<WaterMarkedUploadStream>;
