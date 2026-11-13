import type { NodeReadableStream, WebReadableStream } from "../types-react-native.mjs";
import { isNodeReadableStream, isWebReadableStream } from "./typeGuards-react-native.mjs";
export { isNodeReadableStream, isWebReadableStream };
export declare function isBinaryBody(body: unknown): body is Uint8Array | NodeReadableStream | WebReadableStream<Uint8Array> | (() => NodeReadableStream) | (() => WebReadableStream<Uint8Array>) | Blob;
export declare function isReadableStream(x: unknown): x is WebReadableStream | NodeReadableStream;
export declare function isBlob(x: unknown): x is Blob;
//# sourceMappingURL=typeGuards.d.ts.map