// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Convert a Browser Blob object into ArrayBuffer.
 *
 * @param blob -
 */
export async function blobToArrayBuffer(blob) {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onloadend = (ev) => {
            resolve(ev.target.result);
        };
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(blob);
    });
}
/**
 * Convert a Browser Blob object into string.
 *
 * @param blob -
 */
export async function blobToString(blob) {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onloadend = (ev) => {
            resolve(ev.target.result);
        };
        fileReader.onerror = reject;
        fileReader.readAsText(blob);
    });
}
export async function streamToBuffer(_stream, _buffer, _offset, _end, _encoding) {
    throw new Error("streamToBuffer is not supported in the browser.");
}
export async function streamToBuffer2(_stream, _buffer, _encoding) {
    throw new Error("streamToBuffer2 is not supported in the browser.");
}
export async function readStreamToLocalFile(_rs, _file) {
    throw new Error("readStreamToLocalFile is not supported in the browser.");
}
export const fsStat = async function stat(_path) {
    throw new Error("fsStat is not supported in the browser.");
};
export const fsCreateReadStream = function createReadStream(_path, _options) {
    throw new Error("fsCreateReadStream is not supported in the browser.");
};
//# sourceMappingURL=utils.js.map