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
var bufferHelpers_exports = {};
__export(bufferHelpers_exports, {
  allocBuffer: () => allocBuffer,
  bufferFromArrayBuffer: () => bufferFromArrayBuffer,
  getBufferLength: () => getBufferLength,
  isBuffer: () => isBuffer
});
module.exports = __toCommonJS(bufferHelpers_exports);
function isBuffer(value) {
  return Buffer.isBuffer(value);
}
function allocBuffer(size) {
  return Buffer.alloc(size);
}
function bufferFromArrayBuffer(ab, byteOffset, length) {
  return Buffer.from(ab, byteOffset, length);
}
function getBufferLength(buffer) {
  return buffer.length;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  allocBuffer,
  bufferFromArrayBuffer,
  getBufferLength,
  isBuffer
});
//# sourceMappingURL=bufferHelpers.js.map
