declare global {
    namespace NodeJS {
        interface ProcessVersions {
            bun?: string;
            deno?: string;
        }
    }
}
/**
 * @internal
 */
export declare function getHeaderName(): string;
/**
 * @internal
 */
export declare function setPlatformSpecificData(map: Map<string, string>): Promise<void>;
//# sourceMappingURL=userAgentPlatform.d.ts.map