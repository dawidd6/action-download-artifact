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
var typeGuards_node_exports = {};
__export(typeGuards_node_exports, {
  isNodeReadableStream: () => isNodeReadableStream,
  isWebReadableStream: () => isWebReadableStream
});
module.exports = __toCommonJS(typeGuards_node_exports);
var import_stream = require("stream");
function isNodeReadableStream(x) {
  return x instanceof import_stream.Readable;
}
function isWebReadableStream(x) {
  return x instanceof ReadableStream;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isNodeReadableStream,
  isWebReadableStream
});
//# sourceMappingURL=typeGuards-node.js.map
