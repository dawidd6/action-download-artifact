// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { StructuredMessageDecoding } from "./StructuredMessageDecoding.js";
export const structuredMessageDecodingStream = undefined;
async function pump(reader, messageDecoding) {
    const { done, value } = await reader.read();
    // When no more data needs to be consumed, close the stream
    if (done) {
        return;
    }
    // Enqueue the next data chunk into our target stream
    messageDecoding.sourceDataHandler(value);
}
/**
 * To decode structured body for CRC64 content validtion in storage downloading.
 * @param source -
 * @returns -
 */
export async function structuredMessageDecodingBrowser(source) {
    const sourceStream = source instanceof Blob ? source.stream() : source;
    const reader = sourceStream.getReader();
    let messageDecoding = undefined;
    const stream = new ReadableStream({
        start(controller) {
            messageDecoding = new StructuredMessageDecoding((data) => {
                if (null !== data) {
                    controller.enqueue(data);
                }
                else {
                    controller.close();
                }
            });
        },
        pull(controller) {
            pump(reader, messageDecoding)
                .then(() => {
                return;
            })
                .catch((err) => {
                controller.error(err);
            });
        },
    });
    const response = new Response(stream);
    return response.blob();
}
//# sourceMappingURL=StructuredMessageDecodingStream-browser.mjs.map