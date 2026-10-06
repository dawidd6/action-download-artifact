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
var platformPolicies_exports = {};
__export(platformPolicies_exports, {
  addPlatformPolicies: () => addPlatformPolicies
});
module.exports = __toCommonJS(platformPolicies_exports);
var import_agentPolicy = require("./agentPolicy.js");
var import_tlsPolicy = require("./tlsPolicy.js");
var import_proxy = require("./proxyPolicy.js");
var import_decompress = require("./decompressResponsePolicy.js");
var import_redirectPolicy = require("./redirectPolicy.js");
function addPlatformPolicies(pipeline, options) {
  if (options.agent) {
    pipeline.addPolicy((0, import_agentPolicy.agentPolicy)(options.agent));
  }
  if (options.tlsOptions) {
    pipeline.addPolicy((0, import_tlsPolicy.tlsPolicy)(options.tlsOptions));
  }
  pipeline.addPolicy((0, import_proxy.proxyPolicy)(options.proxyOptions));
  pipeline.addPolicy((0, import_decompress.decompressResponsePolicy)());
  pipeline.addPolicy((0, import_redirectPolicy.redirectPolicy)(options.redirectOptions), { afterPhase: "Retry" });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addPlatformPolicies
});
//# sourceMappingURL=platformPolicies.js.map
