import { CompressionType } from '../../fb/compression-type.js';
export interface Codec {
    encode?(data: Uint8Array): Uint8Array;
    decode?(data: Uint8Array): Uint8Array;
}
declare class _CompressionRegistry {
    protected registry: {
        [key in CompressionType]?: Codec;
    };
    constructor();
    set(compression: CompressionType, codec: Codec): void;
    get(compression: CompressionType): Codec | null;
}
export declare const compressionRegistry: _CompressionRegistry;
export {};
