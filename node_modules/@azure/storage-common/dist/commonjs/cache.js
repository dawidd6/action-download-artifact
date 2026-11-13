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
var cache_exports = {};
__export(cache_exports, {
  getCachedDefaultHttpClient: () => getCachedDefaultHttpClient
});
module.exports = __toCommonJS(cache_exports);
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
let _defaultHttpClient;
function getCachedDefaultHttpClient() {
  if (!_defaultHttpClient) {
    _defaultHttpClient = (0, import_core_rest_pipeline.createDefaultHttpClient)();
  }
  return _defaultHttpClient;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCachedDefaultHttpClient
});
//# sourceMappingURL=cache.js.map
