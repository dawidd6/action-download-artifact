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
var StorageSharedKeyCredentialPolicyV2_exports = {};
__export(StorageSharedKeyCredentialPolicyV2_exports, {
  storageSharedKeyCredentialPolicy: () => storageSharedKeyCredentialPolicy,
  storageSharedKeyCredentialPolicyName: () => storageSharedKeyCredentialPolicyName
});
module.exports = __toCommonJS(StorageSharedKeyCredentialPolicyV2_exports);
var import_node_crypto = require("node:crypto");
var import_constants = require("../utils/constants.js");
var import_utils_common = require("../utils/utils.common.js");
var import_SharedKeyComparator = require("../utils/SharedKeyComparator.js");
const storageSharedKeyCredentialPolicyName = "storageSharedKeyCredentialPolicy";
function storageSharedKeyCredentialPolicy(options) {
  function signRequest(request) {
    request.headers.set(import_constants.HeaderConstants.X_MS_DATE, (/* @__PURE__ */ new Date()).toUTCString());
    if (request.body && (typeof request.body === "string" || Buffer.isBuffer(request.body)) && request.body.length > 0) {
      request.headers.set(import_constants.HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(request.body));
    }
    const stringToSign = [
      request.method.toUpperCase(),
      getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_LANGUAGE),
      getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_ENCODING),
      getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_LENGTH),
      getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_MD5),
      getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_TYPE),
      getHeaderValueToSign(request, import_constants.HeaderConstants.DATE),
      getHeaderValueToSign(request, import_constants.HeaderConstants.IF_MODIFIED_SINCE),
      getHeaderValueToSign(request, import_constants.HeaderConstants.IF_MATCH),
      getHeaderValueToSign(request, import_constants.HeaderConstants.IF_NONE_MATCH),
      getHeaderValueToSign(request, import_constants.HeaderConstants.IF_UNMODIFIED_SINCE),
      getHeaderValueToSign(request, import_constants.HeaderConstants.RANGE)
    ].join("\n") + "\n" + getCanonicalizedHeadersString(request) + getCanonicalizedResourceString(request);
    const signature = (0, import_node_crypto.createHmac)("sha256", options.accountKey).update(stringToSign, "utf8").digest("base64");
    request.headers.set(
      import_constants.HeaderConstants.AUTHORIZATION,
      `SharedKey ${options.accountName}:${signature}`
    );
  }
  function getHeaderValueToSign(request, headerName) {
    const value = request.headers.get(headerName);
    if (!value) {
      return "";
    }
    if (headerName === import_constants.HeaderConstants.CONTENT_LENGTH && value === "0") {
      return "";
    }
    return value;
  }
  function getCanonicalizedHeadersString(request) {
    let headersArray = [];
    for (const [name, value] of request.headers) {
      if (name.toLowerCase().startsWith(import_constants.HeaderConstants.PREFIX_FOR_STORAGE)) {
        headersArray.push({ name, value });
      }
    }
    headersArray.sort((a, b) => {
      return (0, import_SharedKeyComparator.compareHeader)(a.name.toLowerCase(), b.name.toLowerCase());
    });
    headersArray = headersArray.filter((value, index, array) => {
      if (index > 0 && value.name.toLowerCase() === array[index - 1].name.toLowerCase()) {
        return false;
      }
      return true;
    });
    let canonicalizedHeadersStringToSign = "";
    headersArray.forEach((header) => {
      canonicalizedHeadersStringToSign += `${header.name.toLowerCase().trimRight()}:${header.value.trimLeft()}
`;
    });
    return canonicalizedHeadersStringToSign;
  }
  function getCanonicalizedResourceString(request) {
    const path = (0, import_utils_common.getURLPath)(request.url) || "/";
    let canonicalizedResourceString = "";
    canonicalizedResourceString += `/${options.accountName}${path}`;
    const queries = (0, import_utils_common.getURLQueries)(request.url);
    const lowercaseQueries = {};
    if (queries) {
      const queryKeys = [];
      for (const key in queries) {
        if (Object.prototype.hasOwnProperty.call(queries, key)) {
          const lowercaseKey = key.toLowerCase();
          lowercaseQueries[lowercaseKey] = queries[key];
          queryKeys.push(lowercaseKey);
        }
      }
      queryKeys.sort();
      for (const key of queryKeys) {
        canonicalizedResourceString += `
${key}:${decodeURIComponent(lowercaseQueries[key])}`;
      }
    }
    return canonicalizedResourceString;
  }
  return {
    name: storageSharedKeyCredentialPolicyName,
    async sendRequest(request, next) {
      signRequest(request);
      return next(request);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  storageSharedKeyCredentialPolicy,
  storageSharedKeyCredentialPolicyName
});
//# sourceMappingURL=StorageSharedKeyCredentialPolicyV2.js.map
