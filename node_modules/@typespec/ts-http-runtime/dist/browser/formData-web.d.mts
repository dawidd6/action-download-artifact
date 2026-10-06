import type { FormDataMap } from "./interfaces.js";
/**
 * Browser and React Native runtimes handle FormData natively,
 * so no conversion from FormData to FormDataMap is needed.
 *
 * @internal
 */
export declare function convertBodyToFormDataMap(_body: unknown): FormDataMap | undefined;
//# sourceMappingURL=formData-web.d.mts.map