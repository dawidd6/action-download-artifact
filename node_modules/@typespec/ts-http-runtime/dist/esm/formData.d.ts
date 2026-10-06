import type { FormDataMap } from "./interfaces.js";
/**
 * If the request body is a native FormData, convert it to our FormDataMap
 * representation and clear the body. Node.js's HTTP stack doesn't handle
 * FormData natively, so the pipeline must serialize it later.
 *
 * @internal
 */
export declare function convertBodyToFormDataMap(body: unknown): FormDataMap | undefined;
//# sourceMappingURL=formData.d.ts.map