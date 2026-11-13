/**
 * `NodeJS.ReadableStream` is not available in the browser.
 *
 * @public
 */
export type NodeReadableStream = never;
/**
 * `Buffer` is not available in the browser.
 *
 * @public
 */
export type NodeBuffer = never;
/**
 * Re-export of the Web `ReadableStream` for use in platform-neutral code.
 *
 * @public
 */
export type WebReadableStream<R = any> = ReadableStream<R>;
//# sourceMappingURL=types-browser.d.mts.map