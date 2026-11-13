import type { AbortSignalLike } from "@azure/abort-controller";
/**
 * Creates a native AbortSignal which reflects the state of the provided AbortSignalLike.
 * If the AbortSignalLike is already a native AbortSignal, it is returned as is.
 *
 * React Native's AbortController polyfill (abort-controller\@3.x) does not support
 * `AbortSignal.abort()`, `AbortController.abort(reason)`, or `AbortSignal.reason`.
 * This simplified version works within those constraints.
 *
 * @param abortSignalLike - The AbortSignalLike to wrap.
 * @returns - An object containing the native AbortSignal and an optional cleanup function.
 */
export declare function wrapAbortSignalLike(abortSignalLike: AbortSignalLike): {
    abortSignal: AbortSignal;
    cleanup?: () => void;
};
//# sourceMappingURL=wrapAbortSignal-rn.d.mts.map