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
var StructuredMessageDecoding_exports = {};
__export(StructuredMessageDecoding_exports, {
  StructuredMessageDecoding: () => StructuredMessageDecoding
});
module.exports = __toCommonJS(StructuredMessageDecoding_exports);
var import_StorageCRC64Calculator = require("./StorageCRC64Calculator.js");
const MESSAGE_VERSION = 1;
const MESSAGE_HEADER_LENGTH = 13;
const SEGMENT_HEADER_LENGTH = 10;
const FOOTER_LENGTH = 8;
var SMRegion = /* @__PURE__ */ ((SMRegion2) => {
  SMRegion2[SMRegion2["StreamHeader"] = 0] = "StreamHeader";
  SMRegion2[SMRegion2["StreamFooter"] = 1] = "StreamFooter";
  SMRegion2[SMRegion2["SegmentHeader"] = 2] = "SegmentHeader";
  SMRegion2[SMRegion2["SegmentFooter"] = 3] = "SegmentFooter";
  SMRegion2[SMRegion2["SegmentContent"] = 4] = "SegmentContent";
  return SMRegion2;
})(SMRegion || {});
class StructuredMessageDecoding {
  pushData;
  segmentsCount;
  //   private currentState: SMRegion;
  currentOffset;
  currentDataOffset;
  messageHeaderBuffer;
  messageHeaderOffset;
  segmentNumber;
  segmentHeaderOffset;
  segmentHeaderBuffer;
  segmentContentOffset;
  segmentContentLength;
  segmentFooterOffset;
  segmentFooterBuffer;
  messageFooterOffset;
  messageFooterBuffer;
  segmentCrc64;
  messageCrc64;
  state;
  constructor(pushData) {
    this.pushData = pushData;
    this.currentOffset = 0;
    this.segmentsCount = 0;
    this.messageHeaderOffset = 0;
    this.messageHeaderBuffer = new Uint8Array(MESSAGE_HEADER_LENGTH);
    this.currentDataOffset = 0;
    this.segmentNumber = 0;
    this.segmentHeaderOffset = 0;
    this.segmentHeaderBuffer = new Uint8Array(SEGMENT_HEADER_LENGTH);
    this.segmentContentOffset = 0;
    this.segmentContentLength = 0;
    this.state = 0 /* StreamHeader */;
    this.segmentFooterOffset = 0;
    this.segmentFooterBuffer = new Uint8Array(FOOTER_LENGTH);
    this.messageFooterOffset = 0;
    this.messageFooterBuffer = new Uint8Array(FOOTER_LENGTH);
    this.segmentCrc64 = new import_StorageCRC64Calculator.StorageCRC64Calculator();
    this.messageCrc64 = new import_StorageCRC64Calculator.StorageCRC64Calculator();
  }
  sourceDataHandler = (data) => {
    this.currentDataOffset = 0;
    if (this.state === 0 /* StreamHeader */) {
      this.parseMessageHeader(data);
    }
    while (this.segmentNumber < this.segmentsCount && this.currentDataOffset < data.length) {
      if (this.state === 2 /* SegmentHeader */) {
        this.parseSegmentHeader(data);
      }
      if (this.state === 4 /* SegmentContent */) {
        this.parseSegmentContent(data);
      }
      if (this.state === 3 /* SegmentFooter */) {
        this.parseSegmentFooter(data);
      }
    }
    if (this.state === 1 /* StreamFooter */) {
      this.parseMessageFooter(data);
    }
  };
  parseMessageHeader(data) {
    const length = Math.min(
      MESSAGE_HEADER_LENGTH - this.messageHeaderOffset,
      data.length - this.currentDataOffset
    );
    this.messageHeaderBuffer.set(
      Uint8Array.prototype.slice.call(
        data,
        this.currentDataOffset,
        this.currentDataOffset + length
      ),
      this.messageHeaderOffset
    );
    this.currentDataOffset += length;
    this.messageHeaderOffset += length;
    this.currentOffset += length;
    if (this.messageHeaderOffset === MESSAGE_HEADER_LENGTH) {
      const currentVersion = this.messageHeaderBuffer[0];
      if (currentVersion !== MESSAGE_VERSION) {
        throw new Error("Unexpected message version");
      }
      this.segmentsCount = this.toInt16(
        Uint8Array.prototype.slice.call(this.messageHeaderBuffer, 11, 13)
      );
      this.state = 2 /* SegmentHeader */;
    }
  }
  parseSegmentHeader(data) {
    const length = Math.min(
      SEGMENT_HEADER_LENGTH - this.segmentHeaderOffset,
      data.length - this.currentDataOffset
    );
    this.segmentHeaderBuffer.set(
      Uint8Array.prototype.slice.call(
        data,
        this.currentDataOffset,
        this.currentDataOffset + length
      ),
      this.segmentHeaderOffset
    );
    this.currentDataOffset += length;
    this.segmentHeaderOffset += length;
    this.currentOffset += length;
    if (this.segmentHeaderOffset === SEGMENT_HEADER_LENGTH) {
      const currentSegmentNumber = this.toInt16(
        Uint8Array.prototype.slice.call(this.segmentHeaderBuffer, 0, 2)
      );
      if (currentSegmentNumber !== this.segmentNumber + 1) {
        throw new Error("Segment number is unexpected.");
      }
      this.segmentContentLength = this.toInt64(this.segmentHeaderBuffer, 2);
      this.segmentContentOffset = 0;
      this.state = 4 /* SegmentContent */;
    }
  }
  parseSegmentContent(data) {
    const length = Math.min(
      this.segmentContentLength - this.segmentContentOffset,
      data.length - this.currentDataOffset
    );
    const dataToHandle = Uint8Array.prototype.slice.call(
      data,
      this.currentDataOffset,
      this.currentDataOffset + length
    );
    this.segmentCrc64.append(dataToHandle, length);
    this.messageCrc64.append(dataToHandle, length);
    this.pushData(dataToHandle);
    this.currentDataOffset += length;
    this.segmentContentOffset += length;
    this.currentOffset += length;
    if (this.segmentContentOffset === this.segmentContentLength) {
      this.state = 3 /* SegmentFooter */;
    }
  }
  parseSegmentFooter(data) {
    const length = Math.min(
      FOOTER_LENGTH - this.segmentFooterOffset,
      data.length - this.currentDataOffset
    );
    this.segmentFooterBuffer.set(
      Uint8Array.prototype.slice.call(
        data,
        this.currentDataOffset,
        this.currentDataOffset + length
      ),
      this.segmentFooterOffset
    );
    this.currentDataOffset += length;
    this.segmentFooterOffset += length;
    this.currentOffset += length;
    if (this.segmentFooterOffset === FOOTER_LENGTH) {
      const crc64Result = this.segmentCrc64.final(new Uint8Array([]), 0);
      if (!this.checkCrc64CheckSum(crc64Result, this.segmentFooterBuffer)) {
        throw new Error(`Segment check sum mismatch, segmentNumber: ${this.segmentNumber}`);
      }
      ++this.segmentNumber;
      if (this.segmentNumber === this.segmentsCount) {
        this.state = 1 /* StreamFooter */;
      } else {
        this.segmentHeaderOffset = 0;
        this.segmentFooterOffset = 0;
        this.segmentCrc64 = new import_StorageCRC64Calculator.StorageCRC64Calculator();
        this.state = 2 /* SegmentHeader */;
      }
    }
  }
  parseMessageFooter(data) {
    const length = Math.min(
      FOOTER_LENGTH - this.messageFooterOffset,
      data.length - this.currentDataOffset
    );
    this.messageFooterBuffer.set(
      Uint8Array.prototype.slice.call(
        data,
        this.currentDataOffset,
        this.currentDataOffset + length
      ),
      this.messageFooterOffset
    );
    this.currentDataOffset += length;
    this.messageFooterOffset += length;
    this.currentOffset += length;
    if (this.messageFooterOffset === FOOTER_LENGTH) {
      const crc64Result = this.messageCrc64.final(new Uint8Array([]), 0);
      if (!this.checkCrc64CheckSum(crc64Result, this.messageFooterBuffer)) {
        throw new Error("Check sum mismatch");
      }
      this.pushData(null);
    }
  }
  toInt64(input, offset) {
    if (input.length < offset + 8) {
      throw new Error("CRC64 buffer error, something wrong with crc64 calculator");
    }
    const view = new DataView(input.buffer, input.byteOffset + offset, 8);
    return Number(view.getBigUint64(0, true));
  }
  toInt16(input) {
    if (input.length !== 2) {
      throw new Error("CRC64 buffer error, something wrong with crc64 calculator");
    }
    return input[0] + input[1] * 256;
  }
  checkCrc64CheckSum(first, second) {
    if (first.length !== 8 || second.length !== 8) {
      throw new Error("CRC64 buffer error, something wrong with crc64 calculator");
    }
    for (let index = 0; index < 8; ++index) {
      if (first[index] !== second[index]) {
        return false;
      }
    }
    return true;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StructuredMessageDecoding
});
//# sourceMappingURL=StructuredMessageDecoding.js.map
