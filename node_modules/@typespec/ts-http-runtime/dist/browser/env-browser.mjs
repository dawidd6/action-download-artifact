// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Returns the value of the specified environment variable.
 * In browser environments, this checks for a globally-defined `process.env`
 * which may be injected by bundlers or test frameworks (e.g. vitest's `define`).
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
// eslint-disable-next-line @azure/azure-sdk/ts-no-window
export const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
/**
 * A constant that indicates whether the environment the code is running is a Web Worker.
 */
export const isWebWorker = typeof self === "object" &&
    "importScripts" in self &&
    typeof self.importScripts === "function" &&
    (self.constructor?.name === "DedicatedWorkerGlobalScope" ||
        self.constructor?.name === "ServiceWorkerGlobalScope" ||
        self.constructor?.name === "SharedWorkerGlobalScope");
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
export const isReactNative = false;
//# sourceMappingURL=env-browser.mjs.map