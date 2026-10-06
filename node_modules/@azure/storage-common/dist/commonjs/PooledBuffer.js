var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var PooledBuffer_exports = {};
__export(PooledBuffer_exports, {
  PooledBuffer: () => PooledBuffer
});
module.exports = __toCommonJS(PooledBuffer_exports);
var import_BuffersStream = require("./BuffersStream.js");
var import_node_buffer = __toESM(require("node:buffer"));
const maxBufferLength = import_node_buffer.default.constants.MAX_LENGTH;
class PooledBuffer {
  /**
   * Internal buffers used to keep the data.
   * Each buffer has a length of the maxBufferLength except last one.
   */
  buffers = [];
  /**
   * The total size of internal buffers.
   */
  capacity;
  /**
   * The total size of data contained in internal buffers.
   */
  _size;
  /**
   * The size of the data contained in the pooled buffers.
   */
  get size() {
    return this._size;
  }
  constructor(capacity, buffers, totalLength) {
    this.capacity = capacity;
    this._size = 0;
    const bufferNum = Math.ceil(capacity / maxBufferLength);
    for (let i = 0; i < bufferNum; i++) {
      let len = i === bufferNum - 1 ? capacity % maxBufferLength : maxBufferLength;
      if (len === 0) {
        len = maxBufferLength;
      }
      this.buffers.push(Buffer.allocUnsafe(len));
    }
    if (buffers) {
      this.fill(buffers, totalLength);
    }
  }
  /**
   * Fill the internal buffers with data in the input buffers serially
   * with respect to the total length and the total capacity of the internal buffers.
   * Data copied will be shift out of the input buffers.
   *
   * @param buffers - Input buffers containing the data to be filled in the pooled buffer
   * @param totalLength - Total length of the data to be filled in.
   *
   */
  fill(buffers, totalLength) {
    this._size = Math.min(this.capacity, totalLength);
    let i = 0, j = 0, targetOffset = 0, sourceOffset = 0, totalCopiedNum = 0;
    while (totalCopiedNum < this._size) {
      const source = buffers[i];
      const target = this.buffers[j];
      const copiedNum = source.copy(target, targetOffset, sourceOffset);
      totalCopiedNum += copiedNum;
      sourceOffset += copiedNum;
      targetOffset += copiedNum;
      if (sourceOffset === source.length) {
        i++;
        sourceOffset = 0;
      }
      if (targetOffset === target.length) {
        j++;
        targetOffset = 0;
      }
    }
    buffers.splice(0, i);
    if (buffers.length > 0) {
      buffers[0] = buffers[0].slice(sourceOffset);
    }
  }
  /**
   * Get the readable stream assembled from all the data in the internal buffers.
   *
   */
  getReadableStream() {
    return new import_BuffersStream.BuffersStream(this.buffers, this.size);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PooledBuffer
});
//# sourceMappingURL=PooledBuffer.js.map
