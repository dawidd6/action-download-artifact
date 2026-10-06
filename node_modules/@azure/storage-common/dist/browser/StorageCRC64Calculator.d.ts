/**
 * Class used to calculator CRC64 checksum
 */
export declare class StorageCRC64Calculator {
    private nativeCrc64Hash;
    private static nativeInstance;
    constructor();
    private static initPromise?;
    /**
     * Initialize environment for CRC64 checksum calculator
     */
    static init(): Promise<void>;
    /**
     * Append data for CRC64 checksum calculator
     * @param body - content to be append
     * @param length - length of the content
     */
    append(body: Uint8Array, length: number): void;
    /**
     * Complete CRC64 checksum calculating and get the final result.
     * @param body -
     * @param length -
     * @returns
     */
    final(body: Uint8Array, length: number): Uint8Array;
}
//# sourceMappingURL=StorageCRC64Calculator.d.ts.map