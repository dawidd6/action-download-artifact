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
var utils_common_exports = {};
__export(utils_common_exports, {
  EscapePath: () => EscapePath,
  appendToURLPath: () => appendToURLPath,
  appendToURLQuery: () => appendToURLQuery,
  assertResponse: () => assertResponse,
  attachCredential: () => attachCredential,
  delay: () => delay,
  escapeURLPath: () => escapeURLPath,
  extractConnectionStringParts: () => extractConnectionStringParts,
  generateBlockID: () => generateBlockID,
  getAccountNameFromUrl: () => getAccountNameFromUrl,
  getURLParameter: () => getURLParameter,
  getURLPath: () => getURLPath,
  getURLPathAndQuery: () => getURLPathAndQuery,
  getURLQueries: () => getURLQueries,
  getURLScheme: () => getURLScheme,
  getValueInConnString: () => getValueInConnString,
  httpAuthorizationToString: () => httpAuthorizationToString,
  iEqual: () => iEqual,
  isIpEndpointStyle: () => isIpEndpointStyle,
  padStart: () => padStart,
  sanitizeHeaders: () => sanitizeHeaders,
  sanitizeURL: () => sanitizeURL,
  setURLHost: () => setURLHost,
  setURLParameter: () => setURLParameter,
  truncatedISO8061Date: () => truncatedISO8061Date
});
module.exports = __toCommonJS(utils_common_exports);
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_core_util = require("@azure/core-util");
var import_constants = require("./constants.js");
function escapeURLPath(url) {
  const urlParsed = new URL(url);
  let path = urlParsed.pathname;
  path = path || "/";
  path = escape(path);
  urlParsed.pathname = path;
  return urlParsed.toString();
}
function getProxyUriFromDevConnString(connectionString) {
  let proxyUri = "";
  if (connectionString.search("DevelopmentStorageProxyUri=") !== -1) {
    const matchCredentials = connectionString.split(";");
    for (const element of matchCredentials) {
      if (element.trim().startsWith("DevelopmentStorageProxyUri=")) {
        proxyUri = element.trim().match("DevelopmentStorageProxyUri=(.*)")[1];
      }
    }
  }
  return proxyUri;
}
function getValueInConnString(connectionString, argument) {
  const elements = connectionString.split(";");
  for (const element of elements) {
    if (element.trim().startsWith(argument)) {
      return element.trim().match(argument + "=(.*)")[1];
    }
  }
  return "";
}
function extractConnectionStringParts(connectionString) {
  let proxyUri = "";
  if (connectionString.startsWith("UseDevelopmentStorage=true")) {
    proxyUri = getProxyUriFromDevConnString(connectionString);
    connectionString = import_constants.DevelopmentConnectionString;
  }
  let blobEndpoint = getValueInConnString(connectionString, "BlobEndpoint");
  blobEndpoint = blobEndpoint.endsWith("/") ? blobEndpoint.slice(0, -1) : blobEndpoint;
  if (connectionString.search("DefaultEndpointsProtocol=") !== -1 && connectionString.search("AccountKey=") !== -1) {
    let defaultEndpointsProtocol = "";
    let accountName = "";
    let accountKey = (0, import_core_util.stringToUint8Array)("accountKey", "base64");
    let endpointSuffix = "";
    accountName = getValueInConnString(connectionString, "AccountName");
    accountKey = (0, import_core_util.stringToUint8Array)(getValueInConnString(connectionString, "AccountKey"), "base64");
    if (!blobEndpoint) {
      defaultEndpointsProtocol = getValueInConnString(connectionString, "DefaultEndpointsProtocol");
      const protocol = defaultEndpointsProtocol.toLowerCase();
      if (protocol !== "https" && protocol !== "http") {
        throw new Error(
          "Invalid DefaultEndpointsProtocol in the provided Connection String. Expecting 'https' or 'http'"
        );
      }
      endpointSuffix = getValueInConnString(connectionString, "EndpointSuffix");
      if (!endpointSuffix) {
        throw new Error("Invalid EndpointSuffix in the provided Connection String");
      }
      blobEndpoint = `${defaultEndpointsProtocol}://${accountName}.blob.${endpointSuffix}`;
    }
    if (!accountName) {
      throw new Error("Invalid AccountName in the provided Connection String");
    } else if (accountKey.length === 0) {
      throw new Error("Invalid AccountKey in the provided Connection String");
    }
    return {
      kind: "AccountConnString",
      url: blobEndpoint,
      accountName,
      accountKey,
      proxyUri
    };
  } else {
    let accountSas = getValueInConnString(connectionString, "SharedAccessSignature");
    let accountName = getValueInConnString(connectionString, "AccountName");
    if (!accountName) {
      accountName = getAccountNameFromUrl(blobEndpoint);
    }
    if (!blobEndpoint) {
      throw new Error("Invalid BlobEndpoint in the provided SAS Connection String");
    } else if (!accountSas) {
      throw new Error("Invalid SharedAccessSignature in the provided SAS Connection String");
    }
    if (accountSas.startsWith("?")) {
      accountSas = accountSas.substring(1);
    }
    return { kind: "SASConnString", url: blobEndpoint, accountName, accountSas };
  }
}
function escape(text) {
  return encodeURIComponent(text).replace(/%2F/g, "/").replace(/'/g, "%27").replace(/\+/g, "%20").replace(/%25/g, "%");
}
function appendToURLPath(url, name) {
  const urlParsed = new URL(url);
  let path = urlParsed.pathname;
  path = path ? path.endsWith("/") ? `${path}${name}` : `${path}/${name}` : name;
  urlParsed.pathname = path;
  return urlParsed.toString();
}
function setURLParameter(url, name, value) {
  const urlParsed = new URL(url);
  const encodedName = encodeURIComponent(name);
  const encodedValue = value ? encodeURIComponent(value) : void 0;
  const searchString = urlParsed.search === "" ? "?" : urlParsed.search;
  const searchPieces = [];
  for (const pair of searchString.slice(1).split("&")) {
    if (pair) {
      const [key] = pair.split("=", 2);
      if (key !== encodedName) {
        searchPieces.push(pair);
      }
    }
  }
  if (encodedValue) {
    searchPieces.push(`${encodedName}=${encodedValue}`);
  }
  urlParsed.search = searchPieces.length ? `?${searchPieces.join("&")}` : "";
  return urlParsed.toString();
}
function getURLParameter(url, name) {
  const urlParsed = new URL(url);
  return urlParsed.searchParams.get(name) ?? void 0;
}
function setURLHost(url, host) {
  const urlParsed = new URL(url);
  urlParsed.hostname = host;
  return urlParsed.toString();
}
function getURLPath(url) {
  try {
    const urlParsed = new URL(url);
    return urlParsed.pathname;
  } catch (e) {
    return void 0;
  }
}
function getURLScheme(url) {
  try {
    const urlParsed = new URL(url);
    return urlParsed.protocol.endsWith(":") ? urlParsed.protocol.slice(0, -1) : urlParsed.protocol;
  } catch (e) {
    return void 0;
  }
}
function getURLPathAndQuery(url) {
  const urlParsed = new URL(url);
  const pathString = urlParsed.pathname;
  if (!pathString) {
    throw new RangeError("Invalid url without valid path.");
  }
  let queryString = urlParsed.search || "";
  queryString = queryString.trim();
  if (queryString !== "") {
    queryString = queryString.startsWith("?") ? queryString : `?${queryString}`;
  }
  return `${pathString}${queryString}`;
}
function getURLQueries(url) {
  let queryString = new URL(url).search;
  if (!queryString) {
    return {};
  }
  queryString = queryString.trim();
  queryString = queryString.startsWith("?") ? queryString.substring(1) : queryString;
  let querySubStrings = queryString.split("&");
  querySubStrings = querySubStrings.filter((value) => {
    const indexOfEqual = value.indexOf("=");
    const lastIndexOfEqual = value.lastIndexOf("=");
    return indexOfEqual > 0 && indexOfEqual === lastIndexOfEqual && lastIndexOfEqual < value.length - 1;
  });
  const queries = {};
  for (const querySubString of querySubStrings) {
    const splitResults = querySubString.split("=");
    const key = splitResults[0];
    const value = splitResults[1];
    queries[key] = value;
  }
  return queries;
}
function appendToURLQuery(url, queryParts) {
  const urlParsed = new URL(url);
  let query = urlParsed.search;
  if (query) {
    query += "&" + queryParts;
  } else {
    query = queryParts;
  }
  urlParsed.search = query;
  return urlParsed.toString();
}
function truncatedISO8061Date(date, withMilliseconds = true) {
  const dateString = date.toISOString();
  return withMilliseconds ? dateString.substring(0, dateString.length - 1) + "0000Z" : dateString.substring(0, dateString.length - 5) + "Z";
}
function generateBlockID(blockIDPrefix, blockIndex) {
  const maxSourceStringLength = 48;
  const maxBlockIndexLength = 6;
  const maxAllowedBlockIDPrefixLength = maxSourceStringLength - maxBlockIndexLength;
  if (blockIDPrefix.length > maxAllowedBlockIDPrefixLength) {
    blockIDPrefix = blockIDPrefix.slice(0, maxAllowedBlockIDPrefixLength);
  }
  const res = blockIDPrefix + padStart(blockIndex.toString(), maxSourceStringLength - blockIDPrefix.length, "0");
  return (0, import_core_util.uint8ArrayToString)((0, import_core_util.stringToUint8Array)(res, "utf-8"), "base64");
}
async function delay(timeInMs, aborter, abortError) {
  return new Promise((resolve, reject) => {
    let timeout;
    const abortHandler = () => {
      if (timeout !== void 0) {
        clearTimeout(timeout);
      }
      reject(abortError);
    };
    const resolveHandler = () => {
      if (aborter !== void 0) {
        aborter.removeEventListener("abort", abortHandler);
      }
      resolve();
    };
    timeout = setTimeout(resolveHandler, timeInMs);
    if (aborter !== void 0) {
      aborter.addEventListener("abort", abortHandler);
    }
  });
}
function padStart(currentString, targetLength, padString = " ") {
  if (String.prototype.padStart) {
    return currentString.padStart(targetLength, padString);
  }
  padString = padString || " ";
  if (currentString.length > targetLength) {
    return currentString;
  } else {
    targetLength = targetLength - currentString.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    return padString.slice(0, targetLength) + currentString;
  }
}
function sanitizeURL(url) {
  let safeURL = url;
  if (getURLParameter(safeURL, import_constants.URLConstants.Parameters.SIGNATURE)) {
    safeURL = setURLParameter(safeURL, import_constants.URLConstants.Parameters.SIGNATURE, "*****");
  }
  return safeURL;
}
function sanitizeHeaders(originalHeader) {
  const headers = (0, import_core_rest_pipeline.createHttpHeaders)();
  for (const [name, value] of originalHeader) {
    if (name.toLowerCase() === import_constants.HeaderConstants.AUTHORIZATION.toLowerCase()) {
      headers.set(name, "*****");
    } else if (name.toLowerCase() === import_constants.HeaderConstants.X_MS_COPY_SOURCE) {
      headers.set(name, sanitizeURL(value));
    } else {
      headers.set(name, value);
    }
  }
  return headers;
}
function iEqual(str1, str2) {
  return str1.toLocaleLowerCase() === str2.toLocaleLowerCase();
}
function getAccountNameFromUrl(url) {
  const parsedUrl = new URL(url);
  let accountName;
  try {
    if (parsedUrl.hostname.split(".")[1] === "blob") {
      accountName = parsedUrl.hostname.split(".")[0];
    } else if (isIpEndpointStyle(parsedUrl)) {
      accountName = parsedUrl.pathname.split("/")[1];
    } else {
      accountName = "";
    }
    return accountName;
  } catch (error) {
    throw new Error("Unable to extract accountName with provided information.");
  }
}
function isIpEndpointStyle(parsedUrl) {
  const host = parsedUrl.host;
  return /^.*:.*:.*$|^(localhost|host.docker.internal)(:[0-9]+)?$|^(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])){3}(:[0-9]+)?$/.test(
    host
  ) || Boolean(parsedUrl.port) && import_constants.PathStylePorts.includes(parsedUrl.port);
}
function attachCredential(thing, credential) {
  thing.credential = credential;
  return thing;
}
function httpAuthorizationToString(httpAuthorization) {
  return httpAuthorization ? httpAuthorization.scheme + " " + httpAuthorization.value : void 0;
}
function EscapePath(blobName) {
  const split = blobName.split("/");
  for (let i = 0; i < split.length; i++) {
    split[i] = encodeURIComponent(split[i]);
  }
  return split.join("/");
}
function assertResponse(response) {
  if (`_response` in response) {
    return response;
  }
  throw new TypeError(`Unexpected response object ${response}`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EscapePath,
  appendToURLPath,
  appendToURLQuery,
  assertResponse,
  attachCredential,
  delay,
  escapeURLPath,
  extractConnectionStringParts,
  generateBlockID,
  getAccountNameFromUrl,
  getURLParameter,
  getURLPath,
  getURLPathAndQuery,
  getURLQueries,
  getURLScheme,
  getValueInConnString,
  httpAuthorizationToString,
  iEqual,
  isIpEndpointStyle,
  padStart,
  sanitizeHeaders,
  sanitizeURL,
  setURLHost,
  setURLParameter,
  truncatedISO8061Date
});
//# sourceMappingURL=utils.common.js.map
