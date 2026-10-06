/**
 * Node.js readable streams are not natively available in React Native, but apps
 * may polyfill them (e.g. `readable-stream` for Event Hubs). Use duck-typing
 * so polyfilled streams are detected at runtime.
 *
 * @internal
 */
export declare function isNodeReadableStream(x: unknown): x is never;
/**
 * Web ReadableStream is not natively available in React Native, but apps may
 * polyfill it. Use duck-typing so polyfilled streams are detected at runtime.
 *
 * @internal
 */
export declare function isWebReadableStream(x: unknown): x is never;
//# sourceMappingURL=typeGuards-react-native.d.mts.map