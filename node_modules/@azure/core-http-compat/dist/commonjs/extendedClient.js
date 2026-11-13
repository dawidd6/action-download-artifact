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
var extendedClient_exports = {};
__export(extendedClient_exports, {
  ExtendedServiceClient: () => ExtendedServiceClient
});
module.exports = __toCommonJS(extendedClient_exports);
var import_disableKeepAlivePolicy = require("./policies/disableKeepAlivePolicy.js");
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_core_client = require("@azure/core-client");
var import_response = require("./response.js");
class ExtendedServiceClient extends import_core_client.ServiceClient {
  constructor(options) {
    super(options);
    if (options.keepAliveOptions?.enable === false && !(0, import_disableKeepAlivePolicy.pipelineContainsDisableKeepAlivePolicy)(this.pipeline)) {
      this.pipeline.addPolicy((0, import_disableKeepAlivePolicy.createDisableKeepAlivePolicy)());
    }
    if (options.redirectOptions?.handleRedirects === false) {
      this.pipeline.removePolicy({
        name: import_core_rest_pipeline.redirectPolicyName
      });
    }
  }
  /**
   * Compatible send operation request function.
   *
   * @param operationArguments - Operation arguments
   * @param operationSpec - Operation Spec
   * @returns
   */
  async sendOperationRequest(operationArguments, operationSpec) {
    const userProvidedCallBack = operationArguments?.options?.onResponse;
    let lastResponse;
    function onResponse(rawResponse, flatResponse, error) {
      lastResponse = rawResponse;
      if (userProvidedCallBack) {
        userProvidedCallBack(rawResponse, flatResponse, error);
      }
    }
    operationArguments.options = {
      ...operationArguments.options,
      onResponse
    };
    const result = await super.sendOperationRequest(operationArguments, operationSpec);
    if (lastResponse) {
      Object.defineProperty(result, "_response", {
        value: (0, import_response.toCompatResponse)(lastResponse)
      });
    }
    return result;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ExtendedServiceClient
});
//# sourceMappingURL=extendedClient.js.map
