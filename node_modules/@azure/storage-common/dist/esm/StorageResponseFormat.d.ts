/**
 * Specifies the format the service should use to return list results.
 */
export declare const StorageResponseFormat: {
    /**
     * Default. Currently maps to {@link StorageResponseFormat.Xml}, but may be updated in future releases.
     */
    readonly Auto: "Auto";
    /**
     * Use XML to return list results.
     */
    readonly Xml: "Xml";
    /**
     * Use Apache Arrow to return list results.
     */
    readonly Arrow: "Arrow";
};
/**
 * Specifies the format the service should use to return list results.
 */
export type StorageResponseFormat = (typeof StorageResponseFormat)[keyof typeof StorageResponseFormat];
//# sourceMappingURL=StorageResponseFormat.d.ts.map