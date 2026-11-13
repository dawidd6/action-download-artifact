import type { NodeBuffer } from "@azure/core-rest-pipeline";
/**
 * Checks whether a value is a Node.js Buffer.
 */
export declare function isBuffer(value: unknown): value is NodeBuffer;
/**
 * Allocates a new zero-filled Buffer of the given size.
 */
export declare function allocBuffer(size: number): NodeBuffer;
/**
 * Creates a Buffer from an ArrayBuffer, with optional offset and length.
 */
export declare function bufferFromArrayBuffer(ab: ArrayBuffer, byteOffset?: number, length?: number): NodeBuffer;
/**
 * Returns the byte length of a buffer.
 */
export declare function getBufferLength(buffer: NodeBuffer): number;
//# sourceMappingURL=bufferHelpers.d.ts.map