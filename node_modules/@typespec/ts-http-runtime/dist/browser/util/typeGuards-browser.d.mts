/**
 * Node.js readable streams are not natively available in the browser, but apps
 * may polyfill them. Use duck-typing so polyfilled streams are detected at runtime.
 *
 * @internal
 */
export declare function isNodeReadableStream(x: unknown): x is never;
/**
 * Checks if the given value is a web ReadableStream.
 *
 * @internal
 */
export declare function isWebReadableStream(x: unknown): x is ReadableStream;
//# sourceMappingURL=typeGuards-browser.d.mts.map