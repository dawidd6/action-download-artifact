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
var StorageResponseFormat_exports = {};
__export(StorageResponseFormat_exports, {
  StorageResponseFormat: () => StorageResponseFormat
});
module.exports = __toCommonJS(StorageResponseFormat_exports);
const StorageResponseFormat = {
  /**
   * Default. Currently maps to {@link StorageResponseFormat.Xml}, but may be updated in future releases.
   */
  Auto: "Auto",
  /**
   * Use XML to return list results.
   */
  Xml: "Xml",
  /**
   * Use Apache Arrow to return list results.
   */
  Arrow: "Arrow"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StorageResponseFormat
});
//# sourceMappingURL=StorageResponseFormat.js.map
