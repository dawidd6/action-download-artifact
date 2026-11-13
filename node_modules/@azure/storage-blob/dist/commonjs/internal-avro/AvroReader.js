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
var AvroReader_exports = {};
__export(AvroReader_exports, {
  AvroReader: () => AvroReader
});
module.exports = __toCommonJS(AvroReader_exports);
var import_AvroConstants = require("./AvroConstants.js");
var import_AvroParser = require("./AvroParser.js");
var import_utils_common = require("./utils/utils.common.js");
class AvroReader {
  _dataStream;
  _headerStream;
  _syncMarker;
  _metadata;
  _itemType;
  _itemsRemainingInBlock;
  // Remembers where we started if partial data stream was provided.
  _initialBlockOffset;
  /// The byte offset within the Avro file (both header and data)
  /// of the start of the current block.
  _blockOffset;
  get blockOffset() {
    return this._blockOffset;
  }
  _objectIndex;
  get objectIndex() {
    return this._objectIndex;
  }
  _initialized;
  constructor(dataStream, headerStream, currentBlockOffset, indexWithinCurrentBlock) {
    this._dataStream = dataStream;
    this._headerStream = headerStream || dataStream;
    this._initialized = false;
    this._blockOffset = currentBlockOffset || 0;
    this._objectIndex = indexWithinCurrentBlock || 0;
    this._initialBlockOffset = currentBlockOffset || 0;
  }
  async initialize(options = {}) {
    const header = await import_AvroParser.AvroParser.readFixedBytes(this._headerStream, import_AvroConstants.AVRO_INIT_BYTES.length, {
      abortSignal: options.abortSignal
    });
    if (!(0, import_utils_common.arraysEqual)(header, import_AvroConstants.AVRO_INIT_BYTES)) {
      throw new Error("Stream is not an Avro file.");
    }
    this._metadata = await import_AvroParser.AvroParser.readMap(this._headerStream, import_AvroParser.AvroParser.readString, {
      abortSignal: options.abortSignal
    });
    const codec = this._metadata[import_AvroConstants.AVRO_CODEC_KEY];
    if (!(codec === void 0 || codec === null || codec === "null")) {
      throw new Error("Codecs are not supported");
    }
    this._syncMarker = await import_AvroParser.AvroParser.readFixedBytes(this._headerStream, import_AvroConstants.AVRO_SYNC_MARKER_SIZE, {
      abortSignal: options.abortSignal
    });
    const schema = JSON.parse(this._metadata[import_AvroConstants.AVRO_SCHEMA_KEY]);
    this._itemType = import_AvroParser.AvroType.fromSchema(schema);
    if (this._blockOffset === 0) {
      this._blockOffset = this._initialBlockOffset + this._dataStream.position;
    }
    this._itemsRemainingInBlock = await import_AvroParser.AvroParser.readLong(this._dataStream, {
      abortSignal: options.abortSignal
    });
    await import_AvroParser.AvroParser.readLong(this._dataStream, { abortSignal: options.abortSignal });
    this._initialized = true;
    if (this._objectIndex && this._objectIndex > 0) {
      for (let i = 0; i < this._objectIndex; i++) {
        await this._itemType.read(this._dataStream, { abortSignal: options.abortSignal });
        this._itemsRemainingInBlock--;
      }
    }
  }
  hasNext() {
    return !this._initialized || this._itemsRemainingInBlock > 0;
  }
  async *parseObjects(options = {}) {
    if (!this._initialized) {
      await this.initialize(options);
    }
    while (this.hasNext()) {
      const result = await this._itemType.read(this._dataStream, {
        abortSignal: options.abortSignal
      });
      this._itemsRemainingInBlock--;
      this._objectIndex++;
      if (this._itemsRemainingInBlock === 0) {
        const marker = await import_AvroParser.AvroParser.readFixedBytes(this._dataStream, import_AvroConstants.AVRO_SYNC_MARKER_SIZE, {
          abortSignal: options.abortSignal
        });
        this._blockOffset = this._initialBlockOffset + this._dataStream.position;
        this._objectIndex = 0;
        if (!(0, import_utils_common.arraysEqual)(this._syncMarker, marker)) {
          throw new Error("Stream is not a valid Avro file.");
        }
        try {
          this._itemsRemainingInBlock = await import_AvroParser.AvroParser.readLong(this._dataStream, {
            abortSignal: options.abortSignal
          });
        } catch {
          this._itemsRemainingInBlock = 0;
        }
        if (this._itemsRemainingInBlock > 0) {
          await import_AvroParser.AvroParser.readLong(this._dataStream, { abortSignal: options.abortSignal });
        }
      }
      yield result;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvroReader
});
//# sourceMappingURL=AvroReader.js.map
