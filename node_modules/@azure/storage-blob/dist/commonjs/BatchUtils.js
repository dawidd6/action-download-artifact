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
var BatchUtils_exports = {};
__export(BatchUtils_exports, {
  getBodyAsText: () => getBodyAsText,
  utf8ByteLength: () => utf8ByteLength
});
module.exports = __toCommonJS(BatchUtils_exports);
var import_utils = require("./utils/utils.js");
var import_constants = require("./utils/constants.js");
async function getBodyAsText(batchResponse) {
  let buffer = Buffer.alloc(import_constants.BATCH_MAX_PAYLOAD_IN_BYTES);
  const responseLength = await (0, import_utils.streamToBuffer2)(
    batchResponse.readableStreamBody,
    buffer
  );
  buffer = buffer.slice(0, responseLength);
  return buffer.toString();
}
function utf8ByteLength(str) {
  return Buffer.byteLength(str);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getBodyAsText,
  utf8ByteLength
});
//# sourceMappingURL=BatchUtils.js.map
