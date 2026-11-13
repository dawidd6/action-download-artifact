// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { StorageCRC64Calculator } from "./StorageCRC64Calculator.js";
import { signalStreamEnd } from "./streamHelpers-browser.mjs";
export const MESSAGE_VERSION = 1;
export const MESSAGE_HEADER_LENGTH = 13;
export const SEGMENT_HEADER_LENGTH = 10;
export const FOOTER_LENGTH = 8;
export const MAX_SEGMENT_CONTENT_LENGTH = 4 * 1024 * 1024;
var SMRegion;
(function (SMRegion) {
    SMRegion[SMRegion["StreamHeader"] = 0] = "StreamHeader";
    SMRegion[SMRegion["StreamFooter"] = 1] = "StreamFooter";
    SMRegion[SMRegion["SegmentHeader"] = 2] = "SegmentHeader";
    SMRegion[SMRegion["SegmentFooter"] = 3] = "SegmentFooter";
    SMRegion[SMRegion["SegmentContent"] = 4] = "SegmentContent";
    SMRegion[SMRegion["Completed"] = 5] = "Completed";
})(SMRegion || (SMRegion = {}));
export class StructuredMessageEncoding {
    pushData;
    contentLength;
    messageLength;
    constructor(pushData, contentLength) {
        this.pushData = pushData;
        this.contentLength = contentLength;
        this.contentOffset = 0;
        this.currentDataOffset = 0;
        this.segmentsCount = Math.ceil(this.contentLength / MAX_SEGMENT_CONTENT_LENGTH);
        this.messageLength =
            this.contentLength +
                MESSAGE_HEADER_LENGTH +
                (SEGMENT_HEADER_LENGTH + FOOTER_LENGTH) * this.segmentsCount +
                FOOTER_LENGTH;
        this.messageHeaderBuffer = new Uint8Array(MESSAGE_HEADER_LENGTH);
        this.segmentNumber = 0;
        this.segmentContentLength = 0;
        this.segmentContentOffset = 0;
        this.state = SMRegion.StreamHeader;
        this.segmentCrc64 = new StorageCRC64Calculator();
        this.messageCrc64 = new StorageCRC64Calculator();
    }
    currentDataOffset;
    contentOffset;
    segmentsCount;
    messageHeaderBuffer;
    segmentNumber;
    segmentContentLength;
    segmentContentOffset;
    segmentCrc64;
    messageCrc64;
    state;
    sourceDataHandler = (data) => {
        this.currentDataOffset = 0;
        if (this.state === SMRegion.StreamHeader) {
            this.handlingMessageHeader();
        }
        while (this.segmentNumber < this.segmentsCount) {
            this.segmentContentLength = Math.min(MAX_SEGMENT_CONTENT_LENGTH, this.contentLength - this.contentOffset);
            if (this.state === SMRegion.SegmentHeader) {
                this.handlingSegmentHeader();
            }
            if (this.state === SMRegion.SegmentContent) {
                this.handlingSegmentContent(data);
            }
            if (this.state === SMRegion.SegmentFooter) {
                this.handlingSegmentFooter();
                this.contentOffset += this.segmentContentLength;
            }
            if (this.currentDataOffset === data.length) {
                break;
            }
        }
        if (this.state === SMRegion.StreamFooter) {
            this.handlingMessageFooter();
        }
    };
    handlingMessageHeader() {
        this.messageHeaderBuffer[0] = MESSAGE_VERSION;
        this.fillInt64(this.messageHeaderBuffer, 1, this.messageLength); // content length
        this.fillInt16(this.messageHeaderBuffer, 9, 1);
        this.fillInt16(this.messageHeaderBuffer, 11, this.segmentsCount);
        this.pushData(this.messageHeaderBuffer);
        this.state = SMRegion.SegmentHeader;
    }
    handlingSegmentHeader() {
        const segmentHeaderBuffer = new Uint8Array(SEGMENT_HEADER_LENGTH);
        this.fillInt16(segmentHeaderBuffer, 0, this.segmentNumber + 1);
        this.fillInt64(segmentHeaderBuffer, 2, this.segmentContentLength);
        this.segmentContentOffset = 0;
        this.pushData(segmentHeaderBuffer);
        this.state = SMRegion.SegmentContent;
    }
    handlingSegmentContent(data) {
        const length = Math.min(this.segmentContentLength - this.segmentContentOffset, data.length - this.currentDataOffset);
        if (length !== 0) {
            const current_content = Uint8Array.prototype.slice.call(data, this.currentDataOffset, this.currentDataOffset + length);
            this.messageCrc64.append(current_content, length);
            this.segmentCrc64.append(current_content, length);
            this.pushData(current_content);
        }
        this.segmentContentOffset += length;
        this.currentDataOffset += length;
        if (this.segmentContentOffset === this.segmentContentLength) {
            this.state = SMRegion.SegmentFooter;
        }
    }
    handlingSegmentFooter() {
        const crc64Result = this.segmentCrc64.final(new Uint8Array([]), 0);
        this.pushData(crc64Result);
        this.segmentCrc64 = new StorageCRC64Calculator();
        ++this.segmentNumber;
        if (this.segmentNumber === this.segmentsCount) {
            this.state = SMRegion.StreamFooter;
        }
        else {
            this.state = SMRegion.SegmentHeader;
        }
    }
    handlingMessageFooter() {
        const crc64Result = this.messageCrc64.final(new Uint8Array([]), 0);
        this.pushData(crc64Result);
        signalStreamEnd(this.pushData);
        this.state = SMRegion.Completed;
    }
    fillInt64(buffer, offset, input) {
        if (buffer.length < offset + 8) {
            throw new Error("Uint8Array length is not expected.");
        }
        const view = new DataView(buffer.buffer, buffer.byteOffset + offset, 8);
        view.setBigUint64(0, BigInt(input), true);
    }
    fillInt16(buffer, offset, input) {
        if (buffer.length < offset + 2) {
            throw new Error("Uint8Array length is not expected.");
        }
        const view = new DataView(buffer.buffer, buffer.byteOffset + offset, 2);
        view.setUint16(0, input, true);
    }
}
//# sourceMappingURL=StructuredMessageEncoding.js.map