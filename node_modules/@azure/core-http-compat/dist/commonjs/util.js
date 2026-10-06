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
var util_exports = {};
__export(util_exports, {
  toHttpHeadersLike: () => toHttpHeadersLike,
  toPipelineRequest: () => toPipelineRequest,
  toWebResourceLike: () => toWebResourceLike
});
module.exports = __toCommonJS(util_exports);
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
const originalRequestSymbol = /* @__PURE__ */ Symbol("Original PipelineRequest");
const originalClientRequestSymbol = /* @__PURE__ */ Symbol.for("@azure/core-client original request");
const passThroughProps = /* @__PURE__ */ new Set([
  "url",
  "method",
  "withCredentials",
  "timeout",
  "requestId",
  "abortSignal",
  "body",
  "formData",
  "onDownloadProgress",
  "onUploadProgress",
  "proxySettings",
  "streamResponseStatusCodes",
  "agent",
  "requestOverrides"
]);
function toPipelineRequest(webResource, options = {}) {
  const compatWebResource = webResource;
  const request = compatWebResource[originalRequestSymbol];
  const headers = (0, import_core_rest_pipeline.createHttpHeaders)(webResource.headers.toJson({ preserveCase: true }));
  if (request) {
    request.headers = headers;
    return request;
  } else {
    const newRequest = (0, import_core_rest_pipeline.createPipelineRequest)({
      url: webResource.url,
      method: webResource.method,
      headers,
      withCredentials: webResource.withCredentials,
      timeout: webResource.timeout,
      requestId: webResource.requestId,
      abortSignal: webResource.abortSignal,
      body: webResource.body,
      formData: webResource.formData,
      disableKeepAlive: !!webResource.keepAlive,
      onDownloadProgress: webResource.onDownloadProgress,
      onUploadProgress: webResource.onUploadProgress,
      proxySettings: webResource.proxySettings,
      streamResponseStatusCodes: webResource.streamResponseStatusCodes,
      agent: webResource.agent,
      requestOverrides: webResource.requestOverrides
    });
    if (options.originalRequest) {
      newRequest[originalClientRequestSymbol] = options.originalRequest;
    }
    return newRequest;
  }
}
function toWebResourceLike(request, options) {
  const originalRequest = options?.originalRequest ?? request;
  const webResource = {
    url: request.url,
    method: request.method,
    headers: toHttpHeadersLike(request.headers),
    withCredentials: request.withCredentials,
    timeout: request.timeout,
    requestId: request.headers.get("x-ms-client-request-id") || request.requestId,
    abortSignal: request.abortSignal,
    body: request.body,
    formData: request.formData,
    keepAlive: !!request.disableKeepAlive,
    onDownloadProgress: request.onDownloadProgress,
    onUploadProgress: request.onUploadProgress,
    proxySettings: request.proxySettings,
    streamResponseStatusCodes: request.streamResponseStatusCodes,
    agent: request.agent,
    requestOverrides: request.requestOverrides,
    clone() {
      throw new Error("Cannot clone a non-proxied WebResourceLike");
    },
    prepare() {
      throw new Error("WebResourceLike.prepare() is not supported by @azure/core-http-compat");
    },
    validateRequestProperties() {
    }
  };
  if (options?.createProxy) {
    return new Proxy(webResource, {
      get(target, prop, receiver) {
        if (prop === originalRequestSymbol) {
          return request;
        } else if (prop === "clone") {
          return () => {
            return toWebResourceLike(toPipelineRequest(webResource, { originalRequest }), {
              createProxy: true,
              originalRequest
            });
          };
        }
        return Reflect.get(target, prop, receiver);
      },
      set(target, prop, value, receiver) {
        if (prop === "keepAlive") {
          request.disableKeepAlive = !value;
        }
        if (typeof prop === "string" && passThroughProps.has(prop)) {
          request[prop] = value;
        }
        return Reflect.set(target, prop, value, receiver);
      }
    });
  } else {
    return webResource;
  }
}
function toHttpHeadersLike(headers) {
  return new HttpHeaders(headers.toJSON({ preserveCase: true }));
}
function getHeaderKey(headerName) {
  return headerName.toLowerCase();
}
class HttpHeaders {
  _headersMap;
  constructor(rawHeaders) {
    this._headersMap = {};
    if (rawHeaders) {
      for (const headerName in rawHeaders) {
        this.set(headerName, rawHeaders[headerName]);
      }
    }
  }
  /**
   * Set a header in this collection with the provided name and value. The name is
   * case-insensitive.
   * @param headerName - The name of the header to set. This value is case-insensitive.
   * @param headerValue - The value of the header to set.
   */
  set(headerName, headerValue) {
    this._headersMap[getHeaderKey(headerName)] = {
      name: headerName,
      value: headerValue.toString()
    };
  }
  /**
   * Get the header value for the provided header name, or undefined if no header exists in this
   * collection with the provided name.
   * @param headerName - The name of the header.
   */
  get(headerName) {
    const header = this._headersMap[getHeaderKey(headerName)];
    return !header ? void 0 : header.value;
  }
  /**
   * Get whether or not this header collection contains a header entry for the provided header name.
   */
  contains(headerName) {
    return !!this._headersMap[getHeaderKey(headerName)];
  }
  /**
   * Remove the header with the provided headerName. Return whether or not the header existed and
   * was removed.
   * @param headerName - The name of the header to remove.
   */
  remove(headerName) {
    const result = this.contains(headerName);
    delete this._headersMap[getHeaderKey(headerName)];
    return result;
  }
  /**
   * Get the headers that are contained this collection as an object.
   */
  rawHeaders() {
    return this.toJson({ preserveCase: true });
  }
  /**
   * Get the headers that are contained in this collection as an array.
   */
  headersArray() {
    const headers = [];
    for (const headerKey in this._headersMap) {
      headers.push(this._headersMap[headerKey]);
    }
    return headers;
  }
  /**
   * Get the header names that are contained in this collection.
   */
  headerNames() {
    const headerNames = [];
    const headers = this.headersArray();
    for (let i = 0; i < headers.length; ++i) {
      headerNames.push(headers[i].name);
    }
    return headerNames;
  }
  /**
   * Get the header values that are contained in this collection.
   */
  headerValues() {
    const headerValues = [];
    const headers = this.headersArray();
    for (let i = 0; i < headers.length; ++i) {
      headerValues.push(headers[i].value);
    }
    return headerValues;
  }
  /**
   * Get the JSON object representation of this HTTP header collection.
   */
  toJson(options = {}) {
    const result = {};
    if (options.preserveCase) {
      for (const headerKey in this._headersMap) {
        const header = this._headersMap[headerKey];
        result[header.name] = header.value;
      }
    } else {
      for (const headerKey in this._headersMap) {
        const header = this._headersMap[headerKey];
        result[getHeaderKey(header.name)] = header.value;
      }
    }
    return result;
  }
  /**
   * Get the string representation of this HTTP header collection.
   */
  toString() {
    return JSON.stringify(this.toJson({ preserveCase: true }));
  }
  /**
   * Create a deep clone/copy of this HttpHeaders collection.
   */
  clone() {
    const resultPreservingCasing = {};
    for (const headerKey in this._headersMap) {
      const header = this._headersMap[headerKey];
      resultPreservingCasing[header.name] = header.value;
    }
    return new HttpHeaders(resultPreservingCasing);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  toHttpHeadersLike,
  toPipelineRequest,
  toWebResourceLike
});
//# sourceMappingURL=util.js.map
