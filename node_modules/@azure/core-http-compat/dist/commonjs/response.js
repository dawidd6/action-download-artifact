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
var response_exports = {};
__export(response_exports, {
  toCompatResponse: () => toCompatResponse,
  toPipelineResponse: () => toPipelineResponse
});
module.exports = __toCommonJS(response_exports);
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_util = require("./util.js");
const originalResponse = /* @__PURE__ */ Symbol("Original FullOperationResponse");
function toCompatResponse(response, options) {
  let request = (0, import_util.toWebResourceLike)(response.request);
  let headers = (0, import_util.toHttpHeadersLike)(response.headers);
  if (options?.createProxy) {
    return new Proxy(response, {
      get(target, prop, receiver) {
        if (prop === "headers") {
          return headers;
        } else if (prop === "request") {
          return request;
        } else if (prop === originalResponse) {
          return response;
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        if (prop === "headers") {
          headers = value;
        } else if (prop === "request") {
          request = value;
        }
        return Reflect.set(target, prop, value, receiver);
      }
    });
  } else {
    return {
      ...response,
      request,
      headers
    };
  }
}
function toPipelineResponse(compatResponse) {
  const extendedCompatResponse = compatResponse;
  const response = extendedCompatResponse[originalResponse];
  const headers = (0, import_core_rest_pipeline.createHttpHeaders)(compatResponse.headers.toJson({ preserveCase: true }));
  if (response) {
    response.headers = headers;
    return response;
  } else {
    return {
      ...compatResponse,
      headers,
      request: (0, import_util.toPipelineRequest)(compatResponse.request)
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  toCompatResponse,
  toPipelineResponse
});
//# sourceMappingURL=response.js.map
