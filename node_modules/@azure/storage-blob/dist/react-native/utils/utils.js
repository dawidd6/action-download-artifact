// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
export async function streamToBuffer(_stream, _buffer, _offset, _end, _encoding) {
    throw new Error("streamToBuffer is not supported in React Native.");
}
export async function streamToBuffer2(_stream, _buffer, _encoding) {
    throw new Error("streamToBuffer2 is not supported in React Native.");
}
export async function readStreamToLocalFile(_rs, _file) {
    throw new Error("readStreamToLocalFile is not supported in React Native.");
}
export const fsStat = async function stat(_path) {
    throw new Error("fsStat is not supported in React Native.");
};
export const fsCreateReadStream = function createReadStream(_path, _options) {
    throw new Error("fsCreateReadStream is not supported in React Native.");
};
//# sourceMappingURL=utils.js.map