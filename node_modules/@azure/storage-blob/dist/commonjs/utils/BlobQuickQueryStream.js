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
var BlobQuickQueryStream_exports = {};
__export(BlobQuickQueryStream_exports, {
  BlobQuickQueryStream: () => BlobQuickQueryStream
});
module.exports = __toCommonJS(BlobQuickQueryStream_exports);
var import_node_stream = require("node:stream");
var import_internal_avro = require("../internal-avro/index.js");
class BlobQuickQueryStream extends import_node_stream.Readable {
  source;
  avroReader;
  avroIter;
  avroPaused = true;
  onProgress;
  onError;
  /**
   * Creates an instance of BlobQuickQueryStream.
   *
   * @param source - The current ReadableStream returned from getter
   * @param options -
   */
  constructor(source, options = {}) {
    super();
    this.source = source;
    this.onProgress = options.onProgress;
    this.onError = options.onError;
    this.avroReader = new import_internal_avro.AvroReader(new import_internal_avro.AvroReadableFromStream(this.source));
    this.avroIter = this.avroReader.parseObjects({ abortSignal: options.abortSignal });
  }
  _read() {
    if (this.avroPaused) {
      this.readInternal().catch((err) => {
        this.emit("error", err);
      });
    }
  }
  async readInternal() {
    this.avroPaused = false;
    let avroNext;
    do {
      avroNext = await this.avroIter.next();
      if (avroNext.done) {
        break;
      }
      const obj = avroNext.value;
      const schema = obj.$schema;
      if (typeof schema !== "string") {
        throw Error("Missing schema in avro record.");
      }
      switch (schema) {
        case "com.microsoft.azure.storage.queryBlobContents.resultData":
          {
            const data = obj.data;
            if (data instanceof Uint8Array === false) {
              throw Error("Invalid data in avro result record.");
            }
            if (!this.push(Buffer.from(data))) {
              this.avroPaused = true;
            }
          }
          break;
        case "com.microsoft.azure.storage.queryBlobContents.progress":
          {
            const bytesScanned = obj.bytesScanned;
            if (typeof bytesScanned !== "number") {
              throw Error("Invalid bytesScanned in avro progress record.");
            }
            if (this.onProgress) {
              this.onProgress({ loadedBytes: bytesScanned });
            }
          }
          break;
        case "com.microsoft.azure.storage.queryBlobContents.end":
          if (this.onProgress) {
            const totalBytes = obj.totalBytes;
            if (typeof totalBytes !== "number") {
              throw Error("Invalid totalBytes in avro end record.");
            }
            this.onProgress({ loadedBytes: totalBytes });
          }
          this.push(null);
          break;
        case "com.microsoft.azure.storage.queryBlobContents.error":
          if (this.onError) {
            const fatal = obj.fatal;
            if (typeof fatal !== "boolean") {
              throw Error("Invalid fatal in avro error record.");
            }
            const name = obj.name;
            if (typeof name !== "string") {
              throw Error("Invalid name in avro error record.");
            }
            const description = obj.description;
            if (typeof description !== "string") {
              throw Error("Invalid description in avro error record.");
            }
            const position = obj.position;
            if (typeof position !== "number") {
              throw Error("Invalid position in avro error record.");
            }
            this.onError({
              position,
              name,
              isFatal: fatal,
              description
            });
          }
          break;
        default:
          throw Error(`Unknown schema ${schema} in avro progress record.`);
      }
    } while (!avroNext.done && !this.avroPaused);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlobQuickQueryStream
});
//# sourceMappingURL=BlobQuickQueryStream.js.map
