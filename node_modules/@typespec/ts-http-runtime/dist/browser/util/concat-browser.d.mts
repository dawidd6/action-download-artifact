/**
 * Accepted binary data types for concat
 *
 * @internal
 */
export type ConcatSource = ReadableStream<Uint8Array<ArrayBuffer>> | Uint8Array<ArrayBuffer> | Blob;
/**
 * Utility function that concatenates a set of binary inputs into one combined output.
 *
 * @param sources - array of sources for the concatenation
 * @returns a `Blob` representing all the concatenated inputs.
 *
 * @internal
 */
export declare function concat(sources: (ConcatSource | (() => ConcatSource))[]): Promise<Blob>;
//# sourceMappingURL=concat-browser.d.mts.map