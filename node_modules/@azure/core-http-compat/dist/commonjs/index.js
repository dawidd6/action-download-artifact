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
var src_exports = {};
__export(src_exports, {
  ExtendedServiceClient: () => import_extendedClient.ExtendedServiceClient,
  HttpPipelineLogLevel: () => import_requestPolicyFactoryPolicy.HttpPipelineLogLevel,
  convertHttpClient: () => import_httpClientAdapter.convertHttpClient,
  createRequestPolicyFactoryPolicy: () => import_requestPolicyFactoryPolicy.createRequestPolicyFactoryPolicy,
  disableKeepAlivePolicyName: () => import_disableKeepAlivePolicy.disableKeepAlivePolicyName,
  requestPolicyFactoryPolicyName: () => import_requestPolicyFactoryPolicy.requestPolicyFactoryPolicyName,
  toCompatResponse: () => import_response.toCompatResponse,
  toHttpHeadersLike: () => import_util.toHttpHeadersLike
});
module.exports = __toCommonJS(src_exports);
var import_extendedClient = require("./extendedClient.js");
var import_response = require("./response.js");
var import_requestPolicyFactoryPolicy = require("./policies/requestPolicyFactoryPolicy.js");
var import_disableKeepAlivePolicy = require("./policies/disableKeepAlivePolicy.js");
var import_httpClientAdapter = require("./httpClientAdapter.js");
var import_util = require("./util.js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExtendedServiceClient,
  HttpPipelineLogLevel,
  convertHttpClient,
  createRequestPolicyFactoryPolicy,
  disableKeepAlivePolicyName,
  requestPolicyFactoryPolicyName,
  toCompatResponse,
  toHttpHeadersLike
});
//# sourceMappingURL=index.js.map
