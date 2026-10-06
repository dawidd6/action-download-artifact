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
var bufferHelpers_common_exports = {};
__export(bufferHelpers_common_exports, {
  createBlobFromData: () => createBlobFromData
});
module.exports = __toCommonJS(bufferHelpers_common_exports);
function createBlobFromData(data) {
  if (data instanceof Blob) {
    return data;
  }
  const BlobCtor = Blob;
  if (data instanceof ArrayBuffer) {
    return new BlobCtor([data]);
  } else {
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    return new BlobCtor([ab]);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createBlobFromData
});
//# sourceMappingURL=bufferHelpers.common.js.map
