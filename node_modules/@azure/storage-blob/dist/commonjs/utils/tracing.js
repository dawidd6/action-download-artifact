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
var tracing_exports = {};
__export(tracing_exports, {
  tracingClient: () => tracingClient
});
module.exports = __toCommonJS(tracing_exports);
var import_core_tracing = require("@azure/core-tracing");
var import_constants = require("./constants.js");
const tracingClient = (0, import_core_tracing.createTracingClient)({
  packageName: "@azure/storage-blob",
  packageVersion: import_constants.SDK_VERSION,
  namespace: "Microsoft.Storage"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  tracingClient
});
//# sourceMappingURL=tracing.js.map
