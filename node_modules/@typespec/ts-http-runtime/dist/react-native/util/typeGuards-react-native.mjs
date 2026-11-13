// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Node.js readable streams are not natively available in React Native, but apps
 * may polyfill them (e.g. `readable-stream` for Event Hubs). Use duck-typing
 * so polyfilled streams are detected at runtime.
 *
 * @internal
 */
export function isNodeReadableStream(x) {
    return (x !== null &&
        x !== undefined &&
        typeof x === "object" &&
        "pipe" in x &&
        typeof x.pipe === "function" &&
        "read" in x &&
        typeof x.read === "function");
}
/**
 * Web ReadableStream is not natively available in React Native, but apps may
 * polyfill it. Use duck-typing so polyfilled streams are detected at runtime.
 *
 * @internal
 */
export function isWebReadableStream(x) {
    return (x !== null &&
        x !== undefined &&
        typeof x === "object" &&
        "getReader" in x &&
        typeof x.getReader === "function" &&
        "tee" in x &&
        typeof x.tee === "function");
}
//# sourceMappingURL=typeGuards-react-native.mjs.map