// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AbortError } from "@azure/abort-controller";
import Stream, { Readable } from "node:stream";
import { StructuredMessageEncoding } from "./StructuredMessageEncoding.js";
function isNodeReadableStream(source) {
    return (source !== null &&
        source instanceof Stream &&
        typeof source._read === "function" &&
        typeof source._readableState === "object" &&
        typeof source.pipe === "function");
}
/**
 *
 * To encode structured body for CRC64 content validtion in storage uploading.
 * @param source -
 * @param contentLength -
 * @returns
 */
export async function structuredMessageEncoding(source, contentLength) {
    if (source === null) {
        return {
            body: source,
            encodedContentLength: contentLength,
        };
    }
    if (isNodeReadableStream(source)) {
        const encodingMessage = new StructuredMessageEncodingStream(source, contentLength, {});
        return {
            body: encodingMessage,
            encodedContentLength: encodingMessage.messageLength(),
        };
    }
    if (typeof source === "function") {
        const encodingMessage = new StructuredMessageEncodingStream(source(), contentLength, {});
        return {
            body: encodingMessage,
            encodedContentLength: encodingMessage.messageLength(),
        };
    }
    if (source instanceof Blob) {
        const encoding = await BrowserStream(source, contentLength);
        return {
            body: encoding.content,
            encodedContentLength: encoding.encodedContentLength,
        };
    }
    if (typeof source === "string") {
        const s = new Readable();
        s._read = () => { };
        s.push(source);
        s.push(null);
        const stringContentLength = Buffer.byteLength(source);
        const encodingMessage = await new StructuredMessageEncodingStream(s, stringContentLength, {});
        return {
            body: encodingMessage,
            encodedContentLength: encodingMessage.messageLength(),
        };
    }
    if (source instanceof ArrayBuffer) {
        const stream = Readable.from(Buffer.from(source));
        const encodingMessage = await new StructuredMessageEncodingStream(stream, contentLength, {});
        return {
            body: encodingMessage,
            encodedContentLength: encodingMessage.messageLength(),
        };
    }
    if (source instanceof Buffer) {
        const stream = Readable.from(source);
        const encodingMessage = await new StructuredMessageEncodingStream(stream, contentLength, {});
        return {
            body: encodingMessage,
            encodedContentLength: encodingMessage.messageLength(),
        };
    }
    if (ArrayBuffer.isView(source)) {
        const stream = Readable.from(Buffer.from(source.buffer, source.byteOffset, source.byteLength));
        const encodingMessage = await new StructuredMessageEncodingStream(stream, contentLength, {});
        return {
            body: encodingMessage,
            encodedContentLength: encodingMessage.messageLength(),
        };
    }
    throw new Error("The specified request body type is not supported for CRC64 checksum");
}
async function pump(reader, controller, encodingStream) {
    const { done, value } = await reader.read();
    // When no more data needs to be consumed, close the stream
    if (done) {
        controller.close();
        return;
    }
    // Enqueue the next data chunk into our target stream
    encodingStream.sourceDataHandler(Buffer.from(value));
}
async function BrowserStream(source, contentLength) {
    const sourceStream = source instanceof Blob ? source.stream() : source;
    const reader = sourceStream.getReader();
    let encodingStream = undefined;
    const stream = new ReadableStream({
        start(controller) {
            encodingStream = new StructuredMessageEncoding((data) => {
                controller.enqueue(data);
            }, contentLength);
        },
        pull(controller) {
            pump(reader, controller, encodingStream)
                .then(() => {
                return;
            })
                .catch(function (error) {
                controller.error(error);
            });
        },
    });
    const response = new Response(stream);
    return {
        content: await response.blob(),
        encodedContentLength: encodingStream.messageLength,
    };
}
class StructuredMessageEncodingStream extends Readable {
    source;
    encodingMethods;
    constructor(source, contentLength, options) {
        super({ highWaterMark: options.highWaterMark });
        this.source = source;
        this.encodingMethods = new StructuredMessageEncoding((dataToHandle) => {
            if (!this.push(dataToHandle)) {
                source.pause();
            }
        }, contentLength);
        this.setSourceEventHandlers();
    }
    messageLength() {
        return this.encodingMethods.messageLength;
    }
    setSourceEventHandlers() {
        this.source.on("data", this.sourceDataHandler);
        this.source.on("end", this.sourceErrorOrEndHandler);
        this.source.on("error", this.sourceErrorOrEndHandler);
        // needed for Node14
        this.source.on("aborted", this.sourceAbortedHandler);
    }
    removeSourceEventHandlers() {
        this.source.removeListener("data", this.sourceDataHandler);
        this.source.removeListener("end", this.sourceErrorOrEndHandler);
        this.source.removeListener("error", this.sourceErrorOrEndHandler);
        this.source.removeListener("aborted", this.sourceAbortedHandler);
    }
    sourceDataHandler = (data) => {
        this.encodingMethods.sourceDataHandler(data);
    };
    sourceAbortedHandler = () => {
        const abortError = new AbortError("The operation was aborted.");
        this.destroy(abortError);
    };
    sourceErrorOrEndHandler = (err) => {
        if (err && err.name === "AbortError") {
            this.destroy(err);
            return;
        }
        // console.log(
        //   `Source stream emits end or error, offset: ${
        //     this.offset
        //   }, dest end : ${this.end}`
        // );
        this.removeSourceEventHandlers();
    };
    _read() {
        this.source.resume();
    }
    _destroy(error, callback) {
        // remove listener from source and release source
        this.removeSourceEventHandlers();
        this.source.destroy();
        callback(error === null ? undefined : error);
    }
}
//# sourceMappingURL=StructuredMessageEncodingStream.js.map