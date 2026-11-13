// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Returns the value of the specified environment variable.
 * In React Native environments, this checks for a globally-defined `process.env`
 * which may be injected by bundlers like Metro.
 *
 * @internal
 */
export function getEnvironmentVariable(name) {
    return globalThis.process?.env?.[name];
}
/**
 * Emits a warning via `process.emitWarning` if available.
 *
 * @internal
 */
export function emitNodeWarning(warning) {
    globalThis.process?.emitWarning?.(warning);
}
/**
 * A constant that indicates whether the environment the code is running is a Web Browser.
 */
export const isBrowser = false;
/**
 * A constant that indicates whether the environment the code is running is a Web Worker.
 */
export const isWebWorker = false;
/**
 * A constant that indicates whether the environment the code is running is Deno.
 */
export const isDeno = false;
/**
 * A constant that indicates whether the environment the code is running is Bun.sh.
 */
export const isBun = false;
/**
 * A constant that indicates whether the environment the code is running is a Node.js compatible environment.
 */
export const isNodeLike = false;
/**
 * A constant that indicates whether the environment the code is running is Node.JS.
 */
export const isNodeRuntime = false;
/**
 * A constant that indicates whether the environment the code is running is in React-Native.
 */
// https://github.com/facebook/react-native/blob/main/packages/react-native/Libraries/Core/setUpNavigator.js
export const isReactNative = true;
//# sourceMappingURL=env-react-native.mjs.map