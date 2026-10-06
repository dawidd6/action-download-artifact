import type { NodeBuffer } from "@azure/core-rest-pipeline";
/**
 * In the browser, Buffer is not available. This always returns false.
 */
export declare function isBuffer(_value: unknown): _value is NodeBuffer;
/**
 * In the browser, Buffer is not available. This always throws.
 */
export declare function allocBuffer(_size: number): NodeBuffer;
/**
 * In the browser, Buffer is not available. This always throws.
 */
export declare function bufferFromArrayBuffer(_ab: ArrayBuffer, _byteOffset?: number, _length?: number): NodeBuffer;
/**
 * In the browser, Buffer is not available. This always throws.
 */
export declare function getBufferLength(_buffer: NodeBuffer): number;
//# sourceMappingURL=bufferHelpers-browser.d.mts.map