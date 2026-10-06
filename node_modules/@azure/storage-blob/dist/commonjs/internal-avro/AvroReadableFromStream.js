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
var AvroReadableFromStream_exports = {};
__export(AvroReadableFromStream_exports, {
  AvroReadableFromStream: () => AvroReadableFromStream
});
module.exports = __toCommonJS(AvroReadableFromStream_exports);
var import_AvroReadable = require("./AvroReadable.js");
var import_abort_controller = require("@azure/abort-controller");
var import_buffer = require("buffer");
const ABORT_ERROR = new import_abort_controller.AbortError("Reading from the avro stream was aborted.");
class AvroReadableFromStream extends import_AvroReadable.AvroReadable {
  _position;
  _readable;
  toUint8Array(data) {
    if (typeof data === "string") {
      return import_buffer.Buffer.from(data);
    }
    return data;
  }
  constructor(readable) {
    super();
    this._readable = readable;
    this._position = 0;
  }
  get position() {
    return this._position;
  }
  async read(size, options = {}) {
    if (options.abortSignal?.aborted) {
      throw ABORT_ERROR;
    }
    if (size < 0) {
      throw new Error(`size parameter should be positive: ${size}`);
    }
    if (size === 0) {
      return new Uint8Array();
    }
    if (!this._readable.readable) {
      throw new Error("Stream no longer readable.");
    }
    const chunk = this._readable.read(size);
    if (chunk) {
      this._position += chunk.length;
      return this.toUint8Array(chunk);
    } else {
      return new Promise((resolve, reject) => {
        const cleanUp = () => {
          this._readable.removeListener("readable", readableCallback);
          this._readable.removeListener("error", rejectCallback);
          this._readable.removeListener("end", rejectCallback);
          this._readable.removeListener("close", rejectCallback);
          if (options.abortSignal) {
            options.abortSignal.removeEventListener("abort", abortHandler);
          }
        };
        const readableCallback = () => {
          const callbackChunk = this._readable.read(size);
          if (callbackChunk) {
            this._position += callbackChunk.length;
            cleanUp();
            resolve(this.toUint8Array(callbackChunk));
          }
        };
        const rejectCallback = () => {
          cleanUp();
          reject();
        };
        const abortHandler = () => {
          cleanUp();
          reject(ABORT_ERROR);
        };
        this._readable.on("readable", readableCallback);
        this._readable.once("error", rejectCallback);
        this._readable.once("end", rejectCallback);
        this._readable.once("close", rejectCallback);
        if (options.abortSignal) {
          options.abortSignal.addEventListener("abort", abortHandler);
        }
      });
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvroReadableFromStream
});
//# sourceMappingURL=AvroReadableFromStream.js.map
