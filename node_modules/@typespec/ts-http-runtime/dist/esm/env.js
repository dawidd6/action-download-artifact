// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import process from "node:process";
/**
 * Returns the value of the specified environment variable.
 *
 * @internal
 */
export function getEnvironmentVariable(name) {
    return process.env[name];
}
/**
 * Emits a Node.js process warning.
 *
 * @internal
 */
export function emitNodeWarning(warning) {
    process.emitWarning(warning);
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
export const isDeno = typeof process.versions.deno === "string" && process.versions.deno.length > 0;
/**
 * A constant that indicates whether the environment the code is running is Bun.sh.
 */
export const isBun = typeof process.versions.bun === "string" && process.versions.bun.length > 0;
/**
 * A constant that indicates whether the environment the code is running is a Node.js compatible environment.
 */
export const isNodeLike = true;
/**
 * A constant that indicates whether the environment the code is running is Node.JS.
 */
export const isNodeRuntime = !isBun && !isDeno;
/**
 * A constant that indicates whether the environment the code is running is in React-Native.
 */
export const isReactNative = false;
//# sourceMappingURL=env.js.map