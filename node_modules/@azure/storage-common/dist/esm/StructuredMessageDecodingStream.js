// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { AbortError } from "@azure/abort-controller";
import { Readable } from "node:stream";
import { StructuredMessageDecoding } from "./StructuredMessageDecoding.js";
/**
 * To decode structured body for CRC64 content validtion in storage downloading.
 * @param source -
 */
export async function structuredMessageDecodingBrowser(source) {
    /* eslint-disable no-unused-expressions */
    source;
    throw new Error("structuredMessageDecodingBrowser is only for Browser");
}
/**
 * To decode structured body for CRC64 content validtion in storage downloading.
 * @param source -
 * @param options -
 * @returns
 */
export function structuredMessageDecodingStream(source, options) {
    return new StructuredMessageDecodingStream(source, options);
}
class StructuredMessageDecodingStream extends Readable {
    source;
    decodingMethods;
    constructor(source, options) {
        super({ highWaterMark: options.highWaterMark });
        this.source = source;
        this.decodingMethods = new StructuredMessageDecoding((dataToHandle) => {
            if (!this.push(dataToHandle)) {
                source.pause();
            }
        });
        this.setSourceEventHandlers();
    }
    _read() {
        this.source.resume();
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
        try {
            this.decodingMethods.sourceDataHandler(data);
        }
        catch (err) {
            this.destroy(err);
        }
    };
    sourceAbortedHandler = () => {
        const abortError = new AbortError("The operation was aborted.");
        this.destroy(abortError);
    };
    sourceErrorOrEndHandler = (err) => {
        if (err) {
            this.destroy(err);
            return;
        }
        this.removeSourceEventHandlers();
    };
    _destroy(error, callback) {
        // remove listener from source and release source
        this.removeSourceEventHandlers();
        this.source.destroy();
        callback(error === null ? undefined : error);
    }
}
//# sourceMappingURL=StructuredMessageDecodingStream.js.map