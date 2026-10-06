// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export { calculateRetryDelay } from "./delay.js";
export { getRandomIntegerInclusive } from "./random.js";
export { isObject } from "./object.js";
export { isError } from "./error.js";
export { computeSha256Hash, computeSha256Hmac } from "./sha256-web.mjs";
export { randomUUID } from "./uuidUtils-react-native.mjs";
export { isBrowser, isBun, isNodeLike, isNodeRuntime, isDeno, isReactNative, isWebWorker, } from "../env-react-native.mjs";
export { stringToUint8Array, uint8ArrayToString } from "./bytesEncoding-web.mjs";
export { Sanitizer } from "./sanitizer.js";
//# sourceMappingURL=internal.js.map