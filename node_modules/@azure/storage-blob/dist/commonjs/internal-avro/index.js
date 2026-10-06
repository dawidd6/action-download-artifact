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
var internal_avro_exports = {};
__export(internal_avro_exports, {
  AvroReadable: () => import_AvroReadable.AvroReadable,
  AvroReadableFromStream: () => import_AvroReadableFromStream.AvroReadableFromStream,
  AvroReader: () => import_AvroReader.AvroReader
});
module.exports = __toCommonJS(internal_avro_exports);
var import_AvroReader = require("./AvroReader.js");
var import_AvroReadable = require("./AvroReadable.js");
var import_AvroReadableFromStream = require("./AvroReadableFromStream.js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvroReadable,
  AvroReadableFromStream,
  AvroReader
});
//# sourceMappingURL=index.js.map
