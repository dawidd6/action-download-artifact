import type { HttpClient } from "./interfaces.js";
declare global {
    interface RequestInit {
        duplex?: "half";
    }
}
/**
 * Create a new HttpClient instance for the browser environment.
 * @internal
 */
export declare function createFetchHttpClient(): HttpClient;
//# sourceMappingURL=fetchHttpClient.d.ts.map