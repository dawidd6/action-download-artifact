interface BrowserBrand {
    brand: string;
    version: string;
}
interface UserAgentData {
    brands: BrowserBrand[];
    mobile: boolean;
    platform?: string;
    getHighEntropyValues: (hints: string[]) => Promise<{
        architecture: string;
        bitness: string;
        brands: BrowserBrand[];
        formFactor: string;
        fullVersionList: BrowserBrand[];
        mobile: boolean;
        model: string;
        platform: string;
        platformVersion: string;
        wow64: boolean;
    }>;
}
declare global {
    interface Navigator {
        userAgentData?: UserAgentData;
    }
    var EdgeRuntime: string | undefined;
}
/**
 * @internal
 */
export declare function getHeaderName(): string;
/**
 * @internal
 */
export declare function setPlatformSpecificData(map: Map<string, string>): Promise<void>;
export {};
//# sourceMappingURL=userAgentPlatform-browser.d.mts.map