import type { Codec } from './registry.ts';
import { CompressionType } from '../../fb/compression-type.js';
export interface CompressionValidator {
    isValidCodecEncode(codec: Codec): boolean;
}
export declare const compressionValidators: Record<CompressionType, CompressionValidator>;
