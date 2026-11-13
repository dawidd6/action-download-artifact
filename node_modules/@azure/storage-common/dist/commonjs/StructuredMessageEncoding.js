var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var StructuredMessageEncoding_exports = {};
__export(StructuredMessageEncoding_exports, {
  FOOTER_LENGTH: () => FOOTER_LENGTH,
  MAX_SEGMENT_CONTENT_LENGTH: () => MAX_SEGMENT_CONTENT_LENGTH,
  MESSAGE_HEADER_LENGTH: () => MESSAGE_HEADER_LENGTH,
  MESSAGE_VERSION: () => MESSAGE_VERSION,
  SEGMENT_HEADER_LENGTH: () => SEGMENT_HEADER_LENGTH,
  StructuredMessageEncoding: () => StructuredMessageEncoding
});
module.exports = __toCommonJS(StructuredMessageEncoding_exports);
var import_StorageCRC64Calculator = require("./StorageCRC64Calculator.js");
var import_streamHelpers = require("./streamHelpers.js");
const MESSAGE_VERSION = 1;
const MESSAGE_HEADER_LENGTH = 13;
const SEGMENT_HEADER_LENGTH = 10;
const FOOTER_LENGTH = 8;
const MAX_SEGMENT_CONTENT_LENGTH = 4 * 1024 * 1024;
var SMRegion = /* @__PURE__ */ ((SMRegion2) => {
  SMRegion2[SMRegion2["StreamHeader"] = 0] = "StreamHeader";
  SMRegion2[SMRegion2["StreamFooter"] = 1] = "StreamFooter";
  SMRegion2[SMRegion2["SegmentHeader"] = 2] = "SegmentHeader";
  SMRegion2[SMRegion2["SegmentFooter"] = 3] = "SegmentFooter";
  SMRegion2[SMRegion2["SegmentContent"] = 4] = "SegmentContent";
  SMRegion2[SMRegion2["Completed"] = 5] = "Completed";
  return SMRegion2;
})(SMRegion || {});
class StructuredMessageEncoding {
  pushData;
  contentLength;
  messageLength;
  constructor(pushData, contentLength) {
    this.pushData = pushData;
    this.contentLength = contentLength;
    this.contentOffset = 0;
    this.currentDataOffset = 0;
    this.segmentsCount = Math.ceil(this.contentLength / MAX_SEGMENT_CONTENT_LENGTH);
    this.messageLength = this.contentLength + MESSAGE_HEADER_LENGTH + (SEGMENT_HEADER_LENGTH + FOOTER_LENGTH) * this.segmentsCount + FOOTER_LENGTH;
    this.messageHeaderBuffer = new Uint8Array(MESSAGE_HEADER_LENGTH);
    this.segmentNumber = 0;
    this.segmentContentLength = 0;
    this.segmentContentOffset = 0;
    this.state = 0 /* StreamHeader */;
    this.segmentCrc64 = new import_StorageCRC64Calculator.StorageCRC64Calculator();
    this.messageCrc64 = new import_StorageCRC64Calculator.StorageCRC64Calculator();
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
    if (this.state === 0 /* StreamHeader */) {
      this.handlingMessageHeader();
    }
    while (this.segmentNumber < this.segmentsCount) {
      this.segmentContentLength = Math.min(
        MAX_SEGMENT_CONTENT_LENGTH,
        this.contentLength - this.contentOffset
      );
      if (this.state === 2 /* SegmentHeader */) {
        this.handlingSegmentHeader();
      }
      if (this.state === 4 /* SegmentContent */) {
        this.handlingSegmentContent(data);
      }
      if (this.state === 3 /* SegmentFooter */) {
        this.handlingSegmentFooter();
        this.contentOffset += this.segmentContentLength;
      }
      if (this.currentDataOffset === data.length) {
        break;
      }
    }
    if (this.state === 1 /* StreamFooter */) {
      this.handlingMessageFooter();
    }
  };
  handlingMessageHeader() {
    this.messageHeaderBuffer[0] = MESSAGE_VERSION;
    this.fillInt64(this.messageHeaderBuffer, 1, this.messageLength);
    this.fillInt16(this.messageHeaderBuffer, 9, 1);
    this.fillInt16(this.messageHeaderBuffer, 11, this.segmentsCount);
    this.pushData(this.messageHeaderBuffer);
    this.state = 2 /* SegmentHeader */;
  }
  handlingSegmentHeader() {
    const segmentHeaderBuffer = new Uint8Array(SEGMENT_HEADER_LENGTH);
    this.fillInt16(segmentHeaderBuffer, 0, this.segmentNumber + 1);
    this.fillInt64(segmentHeaderBuffer, 2, this.segmentContentLength);
    this.segmentContentOffset = 0;
    this.pushData(segmentHeaderBuffer);
    this.state = 4 /* SegmentContent */;
  }
  handlingSegmentContent(data) {
    const length = Math.min(
      this.segmentContentLength - this.segmentContentOffset,
      data.length - this.currentDataOffset
    );
    if (length !== 0) {
      const current_content = Uint8Array.prototype.slice.call(
        data,
        this.currentDataOffset,
        this.currentDataOffset + length
      );
      this.messageCrc64.append(current_content, length);
      this.segmentCrc64.append(current_content, length);
      this.pushData(current_content);
    }
    this.segmentContentOffset += length;
    this.currentDataOffset += length;
    if (this.segmentContentOffset === this.segmentContentLength) {
      this.state = 3 /* SegmentFooter */;
    }
  }
  handlingSegmentFooter() {
    const crc64Result = this.segmentCrc64.final(new Uint8Array([]), 0);
    this.pushData(crc64Result);
    this.segmentCrc64 = new import_StorageCRC64Calculator.StorageCRC64Calculator();
    ++this.segmentNumber;
    if (this.segmentNumber === this.segmentsCount) {
      this.state = 1 /* StreamFooter */;
    } else {
      this.state = 2 /* SegmentHeader */;
    }
  }
  handlingMessageFooter() {
    const crc64Result = this.messageCrc64.final(new Uint8Array([]), 0);
    this.pushData(crc64Result);
    (0, import_streamHelpers.signalStreamEnd)(this.pushData);
    this.state = 5 /* Completed */;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FOOTER_LENGTH,
  MAX_SEGMENT_CONTENT_LENGTH,
  MESSAGE_HEADER_LENGTH,
  MESSAGE_VERSION,
  SEGMENT_HEADER_LENGTH,
  StructuredMessageEncoding
});
//# sourceMappingURL=StructuredMessageEncoding.js.map
