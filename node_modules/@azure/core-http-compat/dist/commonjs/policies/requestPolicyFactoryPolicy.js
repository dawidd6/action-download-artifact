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
var requestPolicyFactoryPolicy_exports = {};
__export(requestPolicyFactoryPolicy_exports, {
  HttpPipelineLogLevel: () => HttpPipelineLogLevel,
  createRequestPolicyFactoryPolicy: () => createRequestPolicyFactoryPolicy,
  requestPolicyFactoryPolicyName: () => requestPolicyFactoryPolicyName
});
module.exports = __toCommonJS(requestPolicyFactoryPolicy_exports);
var import_util = require("../util.js");
var import_response = require("../response.js");
var HttpPipelineLogLevel = /* @__PURE__ */ ((HttpPipelineLogLevel2) => {
  HttpPipelineLogLevel2[HttpPipelineLogLevel2["ERROR"] = 1] = "ERROR";
  HttpPipelineLogLevel2[HttpPipelineLogLevel2["INFO"] = 3] = "INFO";
  HttpPipelineLogLevel2[HttpPipelineLogLevel2["OFF"] = 0] = "OFF";
  HttpPipelineLogLevel2[HttpPipelineLogLevel2["WARNING"] = 2] = "WARNING";
  return HttpPipelineLogLevel2;
})(HttpPipelineLogLevel || {});
const mockRequestPolicyOptions = {
  log(_logLevel, _message) {
  },
  shouldLog(_logLevel) {
    return false;
  }
};
const requestPolicyFactoryPolicyName = "RequestPolicyFactoryPolicy";
function createRequestPolicyFactoryPolicy(factories) {
  const orderedFactories = factories.slice().reverse();
  return {
    name: requestPolicyFactoryPolicyName,
    async sendRequest(request, next) {
      let httpPipeline = {
        async sendRequest(httpRequest) {
          const response2 = await next((0, import_util.toPipelineRequest)(httpRequest));
          return (0, import_response.toCompatResponse)(response2, { createProxy: true });
        }
      };
      for (const factory of orderedFactories) {
        httpPipeline = factory.create(httpPipeline, mockRequestPolicyOptions);
      }
      const webResourceLike = (0, import_util.toWebResourceLike)(request, { createProxy: true });
      const response = await httpPipeline.sendRequest(webResourceLike);
      return (0, import_response.toPipelineResponse)(response);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpPipelineLogLevel,
  createRequestPolicyFactoryPolicy,
  requestPolicyFactoryPolicyName
});
//# sourceMappingURL=requestPolicyFactoryPolicy.js.map
