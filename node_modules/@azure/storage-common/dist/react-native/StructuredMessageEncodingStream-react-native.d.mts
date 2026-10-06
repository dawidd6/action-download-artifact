import type { RequestBodyType as HttpRequestBody } from "@azure/core-rest-pipeline";
/**
 * Encodes the request body with structured message format for CRC64 validation.
 * Uses a buffered approach suitable for React Native environments.
 */
export declare function structuredMessageEncoding(source: HttpRequestBody, contentLength: number): Promise<{
    body: HttpRequestBody;
    encodedContentLength: number;
}>;
//# sourceMappingURL=StructuredMessageEncodingStream-react-native.d.mts.map