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
var urlHelpers_exports = {};
__export(urlHelpers_exports, {
  appendQueryParams: () => appendQueryParams,
  buildBaseUrl: () => buildBaseUrl,
  buildRequestUrl: () => buildRequestUrl,
  replaceAll: () => replaceAll
});
module.exports = __toCommonJS(urlHelpers_exports);
function isQueryParameterWithOptions(x) {
  if (typeof x !== "object" || x === null || !Object.hasOwn(x, "value")) {
    return false;
  }
  const value = x.value;
  return typeof value?.toString === "function";
}
function buildRequestUrl(endpoint, routePath, pathParameters, options = {}) {
  if (routePath.startsWith("https://") || routePath.startsWith("http://")) {
    return routePath;
  }
  endpoint = buildBaseUrl(endpoint, options);
  const updatedRoutePath = buildRoutePath(routePath, pathParameters, options);
  const requestUrl = appendQueryParams(appendPath(endpoint, updatedRoutePath), options);
  const url = new URL(requestUrl);
  return url.toString();
}
function appendPath(endpoint, pathToAppend) {
  const endpointSearchStart = endpoint.indexOf("?");
  const pathSearchStart = pathToAppend.indexOf("?");
  const endpointParts = endpointSearchStart !== -1 ? [endpoint.substring(0, endpointSearchStart), endpoint.substring(endpointSearchStart + 1)] : [endpoint, ""];
  const pathParts = pathSearchStart !== -1 ? [pathToAppend.substring(0, pathSearchStart), pathToAppend.substring(pathSearchStart + 1)] : [pathToAppend, ""];
  const combinedSearch = [endpointParts[1], pathParts[1].replaceAll("?", "&")].filter(Boolean).join("&");
  const baseEndpoint = endpointParts[0].replace(/(^[^:]+:\/\/[^/]+)\/\/+/, "$1/");
  const basePathToAppend = pathParts[0];
  let combinedUrl = baseEndpoint;
  if (!baseEndpoint.endsWith("/") && !basePathToAppend.startsWith("/") && basePathToAppend !== "") {
    combinedUrl += `/${basePathToAppend}`;
  } else if (baseEndpoint.endsWith("/") && basePathToAppend.startsWith("/")) {
    combinedUrl += basePathToAppend.substring(1);
  } else {
    combinedUrl += basePathToAppend;
  }
  if (combinedSearch) {
    combinedUrl += `?${combinedSearch}`;
  }
  return combinedUrl;
}
function getQueryParamValue(key, allowReserved, style, param) {
  let separator;
  if (style === "pipeDelimited") {
    separator = "|";
  } else if (style === "spaceDelimited") {
    separator = "%20";
  } else {
    separator = ",";
  }
  let paramValues;
  if (Array.isArray(param)) {
    paramValues = param;
  } else if (typeof param === "object" && param.toString === Object.prototype.toString) {
    paramValues = Object.entries(param).flat();
  } else {
    paramValues = [param];
  }
  const value = paramValues.map((p) => {
    if (p === null || p === void 0) {
      return "";
    }
    if (!p.toString || typeof p.toString !== "function") {
      throw new Error(`Query parameters must be able to be represented as string, ${key} can't`);
    }
    const rawValue = p.toISOString !== void 0 ? p.toISOString() : p.toString();
    return allowReserved ? rawValue : encodeURIComponent(rawValue);
  }).join(separator);
  return `${allowReserved ? key : encodeURIComponent(key)}=${value}`;
}
function simpleParseQueryParams(queryString) {
  const result = /* @__PURE__ */ new Map();
  if (!queryString || queryString[0] !== "?") {
    return result;
  }
  queryString = queryString.slice(1);
  const pairs = queryString.split("&");
  for (const pair of pairs) {
    const eqIndex = pair.indexOf("=");
    const name = eqIndex === -1 ? pair : pair.substring(0, eqIndex);
    const value = eqIndex === -1 ? "" : pair.substring(eqIndex + 1);
    const existingValue = result.get(name);
    if (existingValue !== void 0) {
      if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else {
        result.set(name, [existingValue, value]);
      }
    } else {
      result.set(name, value);
    }
  }
  return result;
}
function appendQueryParams(url, options = {}) {
  if (!options.queryParameters) {
    return url;
  }
  const parsedUrl = new URL(url);
  const queryParams = options.queryParameters;
  const existingParams = simpleParseQueryParams(parsedUrl.search);
  const newParamStrings = [];
  for (const key of Object.keys(queryParams)) {
    const param = queryParams[key];
    if (param === void 0 || param === null) {
      continue;
    }
    const hasMetadata = isQueryParameterWithOptions(param);
    const rawValue = hasMetadata ? param.value : param;
    const explode = hasMetadata ? param.explode ?? false : false;
    const style = hasMetadata && param.style ? param.style : "form";
    if (explode) {
      if (Array.isArray(rawValue)) {
        for (const item of rawValue) {
          newParamStrings.push(
            getQueryParamValue(key, options.skipUrlEncoding ?? false, style, item)
          );
        }
      } else if (rawValue !== null && typeof rawValue === "object") {
        for (const [actualKey, value] of Object.entries(rawValue)) {
          newParamStrings.push(
            getQueryParamValue(actualKey, options.skipUrlEncoding ?? false, style, value)
          );
        }
      } else {
        throw new Error("explode can only be set to true for objects and arrays");
      }
    } else {
      newParamStrings.push(
        getQueryParamValue(key, options.skipUrlEncoding ?? false, style, rawValue)
      );
    }
  }
  for (const paramString of newParamStrings) {
    const eqIndex = paramString.indexOf("=");
    const name = paramString.substring(0, eqIndex);
    const value = paramString.substring(eqIndex + 1);
    const existingValue = existingParams.get(name);
    if (existingValue !== void 0) {
      if (Array.isArray(existingValue)) {
        if (!existingValue.includes(value)) {
          existingValue.push(value);
        }
      } else if (existingValue !== value) {
        existingParams.set(name, [existingValue, value]);
      }
    } else {
      existingParams.set(name, value);
    }
  }
  const searchPieces = [];
  for (const [name, value] of existingParams) {
    if (Array.isArray(value)) {
      for (const subValue of value) {
        searchPieces.push(`${name}=${subValue}`);
      }
    } else {
      searchPieces.push(`${name}=${value}`);
    }
  }
  parsedUrl.search = searchPieces.length ? `?${searchPieces.join("&")}` : "";
  return parsedUrl.toString();
}
function buildBaseUrl(endpoint, options) {
  if (!options.pathParameters) {
    return endpoint;
  }
  const pathParams = options.pathParameters;
  for (const [key, param] of Object.entries(pathParams)) {
    if (param === void 0 || param === null) {
      throw new Error(`Path parameters ${key} must not be undefined or null`);
    }
    if (!param.toString || typeof param.toString !== "function") {
      throw new Error(`Path parameters must be able to be represented as string, ${key} can't`);
    }
    let value = param.toISOString !== void 0 ? param.toISOString() : String(param);
    if (!options.skipUrlEncoding) {
      value = encodeURIComponent(param);
    }
    endpoint = replaceAll(endpoint, `{${key}}`, value) ?? "";
  }
  return endpoint;
}
function buildRoutePath(routePath, pathParameters, options = {}) {
  for (const pathParam of pathParameters) {
    const allowReserved = typeof pathParam === "object" && (pathParam.allowReserved ?? false);
    let value = typeof pathParam === "object" ? pathParam.value : pathParam;
    if (!options.skipUrlEncoding && !allowReserved) {
      value = encodeURIComponent(value);
    }
    routePath = routePath.replace(/\{[\w-]+\}/, String(value));
  }
  return routePath;
}
function replaceAll(value, searchValue, replaceValue) {
  return !value || !searchValue ? value : value.split(searchValue).join(replaceValue || "");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  appendQueryParams,
  buildBaseUrl,
  buildRequestUrl,
  replaceAll
});
//# sourceMappingURL=urlHelpers.js.map
