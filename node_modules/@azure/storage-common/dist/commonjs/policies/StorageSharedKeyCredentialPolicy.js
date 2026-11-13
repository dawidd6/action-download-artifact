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
var StorageSharedKeyCredentialPolicy_exports = {};
__export(StorageSharedKeyCredentialPolicy_exports, {
  StorageSharedKeyCredentialPolicy: () => StorageSharedKeyCredentialPolicy
});
module.exports = __toCommonJS(StorageSharedKeyCredentialPolicy_exports);
var import_constants = require("../utils/constants.js");
var import_utils_common = require("../utils/utils.common.js");
var import_CredentialPolicy = require("./CredentialPolicy.js");
var import_SharedKeyComparator = require("../utils/SharedKeyComparator.js");
class StorageSharedKeyCredentialPolicy extends import_CredentialPolicy.CredentialPolicy {
  /**
   * Reference to StorageSharedKeyCredential which generates StorageSharedKeyCredentialPolicy
   */
  factory;
  /**
   * Creates an instance of StorageSharedKeyCredentialPolicy.
   * @param nextPolicy -
   * @param options -
   * @param factory -
   */
  constructor(nextPolicy, options, factory) {
    super(nextPolicy, options);
    this.factory = factory;
  }
  /**
   * Signs request.
   *
   * @param request -
   */
  signRequest(request) {
    request.headers.set(import_constants.HeaderConstants.X_MS_DATE, (/* @__PURE__ */ new Date()).toUTCString());
    if (request.body && (typeof request.body === "string" || request.body !== void 0) && request.body.length > 0) {
      request.headers.set(import_constants.HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(request.body));
    }
    const stringToSign = [
      request.method.toUpperCase(),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_LANGUAGE),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_ENCODING),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_LENGTH),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_MD5),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.CONTENT_TYPE),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.DATE),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.IF_MODIFIED_SINCE),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.IF_MATCH),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.IF_NONE_MATCH),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.IF_UNMODIFIED_SINCE),
      this.getHeaderValueToSign(request, import_constants.HeaderConstants.RANGE)
    ].join("\n") + "\n" + this.getCanonicalizedHeadersString(request) + this.getCanonicalizedResourceString(request);
    const signature = this.factory.computeHMACSHA256(stringToSign);
    request.headers.set(
      import_constants.HeaderConstants.AUTHORIZATION,
      `SharedKey ${this.factory.accountName}:${signature}`
    );
    return request;
  }
  /**
   * Retrieve header value according to shared key sign rules.
   * @see https://learn.microsoft.com/rest/api/storageservices/authenticate-with-shared-key
   *
   * @param request -
   * @param headerName -
   */
  getHeaderValueToSign(request, headerName) {
    const value = request.headers.get(headerName);
    if (!value) {
      return "";
    }
    if (headerName === import_constants.HeaderConstants.CONTENT_LENGTH && value === "0") {
      return "";
    }
    return value;
  }
  /**
   * To construct the CanonicalizedHeaders portion of the signature string, follow these steps:
   * 1. Retrieve all headers for the resource that begin with x-ms-, including the x-ms-date header.
   * 2. Convert each HTTP header name to lowercase.
   * 3. Sort the headers lexicographically by header name, in ascending order.
   *    Each header may appear only once in the string.
   * 4. Replace any linear whitespace in the header value with a single space.
   * 5. Trim any whitespace around the colon in the header.
   * 6. Finally, append a new-line character to each canonicalized header in the resulting list.
   *    Construct the CanonicalizedHeaders string by concatenating all headers in this list into a single string.
   *
   * @param request -
   */
  getCanonicalizedHeadersString(request) {
    let headersArray = request.headers.headersArray().filter((value) => {
      return value.name.toLowerCase().startsWith(import_constants.HeaderConstants.PREFIX_FOR_STORAGE);
    });
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
  /**
   * Retrieves the webResource canonicalized resource string.
   *
   * @param request -
   */
  getCanonicalizedResourceString(request) {
    const path = (0, import_utils_common.getURLPath)(request.url) || "/";
    let canonicalizedResourceString = "";
    canonicalizedResourceString += `/${this.factory.accountName}${path}`;
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
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StorageSharedKeyCredentialPolicy
});
//# sourceMappingURL=StorageSharedKeyCredentialPolicy.js.map
