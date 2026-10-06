// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// @ts-expect-error the crc64 js file is auto generated
import NativeCRC64 from "./crc64.js";
/**
 * Class used to calculator CRC64 checksum
 */
export class StorageCRC64Calculator {
    nativeCrc64Hash;
    static nativeInstance;
    constructor() {
        this.nativeCrc64Hash = new StorageCRC64Calculator.nativeInstance.Crc64Hash();
    }
    static initPromise;
    /**
     * Initialize environment for CRC64 checksum calculator
     */
    static async init() {
        if (!this.initPromise) {
            this.initPromise = NativeCRC64().then((instance) => {
                this.nativeInstance = instance;
                return;
            });
        }
        return this.initPromise;
    }
    /**
     * Append data for CRC64 checksum calculator
     * @param body - content to be append
     * @param length - length of the content
     */
    append(body, length) {
        const ptr = StorageCRC64Calculator.nativeInstance._malloc(length);
        StorageCRC64Calculator.nativeInstance.HEAPU8.set(body, ptr);
        this.nativeCrc64Hash.OnAppend(ptr, length);
        StorageCRC64Calculator.nativeInstance._free(ptr);
    }
    /**
     * Complete CRC64 checksum calculating and get the final result.
     * @param body -
     * @param length -
     * @returns
     */
    final(body, length) {
        const ptr = StorageCRC64Calculator.nativeInstance._malloc(length);
        StorageCRC64Calculator.nativeInstance.HEAPU8.set(body, ptr);
        const result = StorageCRC64Calculator.nativeInstance._malloc(8);
        this.nativeCrc64Hash.OnFinal(ptr, length, result);
        StorageCRC64Calculator.nativeInstance._free(ptr);
        const resultArray = new Uint8Array(8);
        resultArray.set(StorageCRC64Calculator.nativeInstance.HEAPU8.subarray(result, result + 8));
        StorageCRC64Calculator.nativeInstance._free(result);
        return resultArray;
    }
}
//# sourceMappingURL=StorageCRC64Calculator.js.map