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
var BuffersStream_exports = {};
__export(BuffersStream_exports, {
  BuffersStream: () => BuffersStream
});
module.exports = __toCommonJS(BuffersStream_exports);
var import_node_stream = require("node:stream");
class BuffersStream extends import_node_stream.Readable {
  /**
   * Creates an instance of BuffersStream that will emit the data
   * contained in the array of buffers.
   *
   * @param buffers - Array of buffers containing the data
   * @param byteLength - The total length of data contained in the buffers
   */
  constructor(buffers, byteLength, options) {
    super(options);
    this.buffers = buffers;
    this.byteLength = byteLength;
    this.byteOffsetInCurrentBuffer = 0;
    this.bufferIndex = 0;
    this.pushedBytesLength = 0;
    let buffersLength = 0;
    for (const buf of this.buffers) {
      buffersLength += buf.byteLength;
    }
    if (buffersLength < this.byteLength) {
      throw new Error("Data size shouldn't be larger than the total length of buffers.");
    }
  }
  buffers;
  byteLength;
  /**
   * The offset of data to be read in the current buffer.
   */
  byteOffsetInCurrentBuffer;
  /**
   * The index of buffer to be read in the array of buffers.
   */
  bufferIndex;
  /**
   * The total length of data already read.
   */
  pushedBytesLength;
  /**
   * Internal _read() that will be called when the stream wants to pull more data in.
   *
   * @param size - Optional. The size of data to be read
   */
  _read(size) {
    if (this.pushedBytesLength >= this.byteLength) {
      this.push(null);
    }
    if (!size) {
      size = this.readableHighWaterMark;
    }
    const outBuffers = [];
    let i = 0;
    while (i < size && this.pushedBytesLength < this.byteLength) {
      const remainingDataInAllBuffers = this.byteLength - this.pushedBytesLength;
      const remainingCapacityInThisBuffer = this.buffers[this.bufferIndex].byteLength - this.byteOffsetInCurrentBuffer;
      const remaining = Math.min(remainingCapacityInThisBuffer, remainingDataInAllBuffers);
      if (remaining > size - i) {
        const end = this.byteOffsetInCurrentBuffer + size - i;
        outBuffers.push(this.buffers[this.bufferIndex].slice(this.byteOffsetInCurrentBuffer, end));
        this.pushedBytesLength += size - i;
        this.byteOffsetInCurrentBuffer = end;
        i = size;
        break;
      } else {
        const end = this.byteOffsetInCurrentBuffer + remaining;
        outBuffers.push(this.buffers[this.bufferIndex].slice(this.byteOffsetInCurrentBuffer, end));
        if (remaining === remainingCapacityInThisBuffer) {
          this.byteOffsetInCurrentBuffer = 0;
          this.bufferIndex++;
        } else {
          this.byteOffsetInCurrentBuffer = end;
        }
        this.pushedBytesLength += remaining;
        i += remaining;
      }
    }
    if (outBuffers.length > 1) {
      this.push(Buffer.concat(outBuffers));
    } else if (outBuffers.length === 1) {
      this.push(outBuffers[0]);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BuffersStream
});
//# sourceMappingURL=BuffersStream.js.map
