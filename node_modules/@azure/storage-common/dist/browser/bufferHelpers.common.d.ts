/**
 * Creates a Blob from the given data.
 * Uses an indirect constructor reference to work around React Native's restrictive
 * Blob type definitions (which only accept string | Blob, not ArrayBuffer).
 */
export declare function createBlobFromData(data: Blob | ArrayBuffer | ArrayBufferView): Blob;
//# sourceMappingURL=bufferHelpers.common.d.ts.map