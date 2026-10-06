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
var AvroConstants_exports = {};
__export(AvroConstants_exports, {
  AVRO_CODEC_KEY: () => AVRO_CODEC_KEY,
  AVRO_INIT_BYTES: () => AVRO_INIT_BYTES,
  AVRO_SCHEMA_KEY: () => AVRO_SCHEMA_KEY,
  AVRO_SYNC_MARKER_SIZE: () => AVRO_SYNC_MARKER_SIZE
});
module.exports = __toCommonJS(AvroConstants_exports);
const AVRO_SYNC_MARKER_SIZE = 16;
const AVRO_INIT_BYTES = new Uint8Array([79, 98, 106, 1]);
const AVRO_CODEC_KEY = "avro.codec";
const AVRO_SCHEMA_KEY = "avro.schema";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AVRO_CODEC_KEY,
  AVRO_INIT_BYTES,
  AVRO_SCHEMA_KEY,
  AVRO_SYNC_MARKER_SIZE
});
//# sourceMappingURL=AvroConstants.js.map
