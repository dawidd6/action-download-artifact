"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeString = encodeString;
exports.encodeByteArray = encodeByteArray;
exports.decodeString = decodeString;
exports.decodeStringToString = decodeStringToString;
const core_util_1 = require("@azure/core-util");
/**
 * Encodes a string in base64 format.
 * @param value - the string to encode
 * @internal
 */
function encodeString(value) {
    return (0, core_util_1.uint8ArrayToString)((0, core_util_1.stringToUint8Array)(value, "utf-8"), "base64");
}
/**
 * Encodes a byte array in base64 format.
 * @param value - the Uint8Array to encode
 * @internal
 */
function encodeByteArray(value) {
    return (0, core_util_1.uint8ArrayToString)(value, "base64");
}
/**
 * Decodes a base64 string into a byte array.
 * @param value - the base64 string to decode
 * @internal
 */
function decodeString(value) {
    return (0, core_util_1.stringToUint8Array)(value, "base64");
}
/**
 * Decodes a base64 string into a string.
 * @param value - the base64 string to decode
 * @internal
 */
function decodeStringToString(value) {
    return (0, core_util_1.uint8ArrayToString)((0, core_util_1.stringToUint8Array)(value, "base64"), "utf-8");
}
//# sourceMappingURL=base64.js.map