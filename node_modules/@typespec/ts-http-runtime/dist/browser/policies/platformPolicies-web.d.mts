import type { Pipeline } from "../pipeline.js";
import type { PlatformPoliciesOptions } from "./platformPolicies.js";
/**
 * Browser and React Native runtimes handle agent, TLS, proxy, decompression,
 * and redirects natively — no pipeline policies needed.
 *
 * @internal
 */
export declare function addPlatformPolicies(_pipeline: Pipeline, _options: PlatformPoliciesOptions): void;
//# sourceMappingURL=platformPolicies-web.d.mts.map