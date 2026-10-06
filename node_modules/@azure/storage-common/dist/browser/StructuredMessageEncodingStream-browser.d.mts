import type { RequestBodyType as HttpRequestBody } from "@azure/core-rest-pipeline";
export declare function structuredMessageEncoding(source: HttpRequestBody, contentLength: number): Promise<{
    body: HttpRequestBody;
    encodedContentLength: number;
}>;
//# sourceMappingURL=StructuredMessageEncodingStream-browser.d.mts.map