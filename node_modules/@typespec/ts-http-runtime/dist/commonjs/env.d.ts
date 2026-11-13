declare global {
    namespace NodeJS {
        interface ProcessVersions {
            bun?: string;
            deno?: string;
        }
    }
}
/**
 * Returns the value of the specified environment variable.
 *
 * @internal
 */
export declare function getEnvironmentVariable(name: string): string | undefined;
/**
 * Emits a Node.js process warning.
 *
 * @internal
 */
export declare function emitNodeWarning(warning: string): void;
/**
 * A constant that indicates whether the environment the code is running is a Web Browser.
 */
export declare const isBrowser: boolean;
/**
 * A constant that indicates whether the environment the code is running is a Web Worker.
 */
export declare const isWebWorker: boolean;
/**
 * A constant that indicates whether the environment the code is running is Deno.
 */
export declare const isDeno: boolean;
/**
 * A constant that indicates whether the environment the code is running is Bun.sh.
 */
export declare const isBun: boolean;
/**
 * A constant that indicates whether the environment the code is running is a Node.js compatible environment.
 */
export declare const isNodeLike: boolean;
/**
 * A constant that indicates whether the environment the code is running is Node.JS.
 */
export declare const isNodeRuntime: boolean;
/**
 * A constant that indicates whether the environment the code is running is in React-Native.
 */
export declare const isReactNative: boolean;
//# sourceMappingURL=env.d.ts.map