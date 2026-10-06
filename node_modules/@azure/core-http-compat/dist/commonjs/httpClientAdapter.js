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
var httpClientAdapter_exports = {};
__export(httpClientAdapter_exports, {
  convertHttpClient: () => convertHttpClient
});
module.exports = __toCommonJS(httpClientAdapter_exports);
var import_response = require("./response.js");
var import_util = require("./util.js");
function convertHttpClient(requestPolicyClient) {
  return {
    sendRequest: async (request) => {
      const response = await requestPolicyClient.sendRequest(
        (0, import_util.toWebResourceLike)(request, { createProxy: true })
      );
      return (0, import_response.toPipelineResponse)(response);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  convertHttpClient
});
//# sourceMappingURL=httpClientAdapter.js.map
