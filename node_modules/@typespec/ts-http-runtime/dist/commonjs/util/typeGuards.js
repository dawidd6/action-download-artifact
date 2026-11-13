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
var typeGuards_exports = {};
__export(typeGuards_exports, {
  isBinaryBody: () => isBinaryBody,
  isBlob: () => isBlob,
  isNodeReadableStream: () => import_typeGuards.isNodeReadableStream,
  isReadableStream: () => isReadableStream,
  isWebReadableStream: () => import_typeGuards.isWebReadableStream
});
module.exports = __toCommonJS(typeGuards_exports);
var import_typeGuards = require("./typeGuards-node.js");
function isBinaryBody(body) {
  return body !== void 0 && (body instanceof Uint8Array || isReadableStream(body) || typeof body === "function" || body instanceof Blob);
}
function isReadableStream(x) {
  return (0, import_typeGuards.isNodeReadableStream)(x) || (0, import_typeGuards.isWebReadableStream)(x);
}
function isBlob(x) {
  return x instanceof Blob;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isBinaryBody,
  isBlob,
  isNodeReadableStream,
  isReadableStream,
  isWebReadableStream
});
//# sourceMappingURL=typeGuards.js.map
