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
var constants_exports = {};
__export(constants_exports, {
  DevelopmentConnectionString: () => DevelopmentConnectionString,
  HeaderConstants: () => HeaderConstants,
  PathStylePorts: () => PathStylePorts,
  SDK_VERSION: () => SDK_VERSION,
  URLConstants: () => URLConstants
});
module.exports = __toCommonJS(constants_exports);
const SDK_VERSION = "12.5.0";
const URLConstants = {
  Parameters: {
    FORCE_BROWSER_NO_CACHE: "_",
    SIGNATURE: "sig",
    SNAPSHOT: "snapshot",
    VERSIONID: "versionid",
    TIMEOUT: "timeout"
  }
};
const HeaderConstants = {
  AUTHORIZATION: "Authorization",
  AUTHORIZATION_SCHEME: "Bearer",
  CONTENT_ENCODING: "Content-Encoding",
  CONTENT_ID: "Content-ID",
  CONTENT_LANGUAGE: "Content-Language",
  CONTENT_LENGTH: "Content-Length",
  CONTENT_MD5: "Content-Md5",
  CONTENT_TRANSFER_ENCODING: "Content-Transfer-Encoding",
  CONTENT_TYPE: "Content-Type",
  COOKIE: "Cookie",
  DATE: "date",
  IF_MATCH: "if-match",
  IF_MODIFIED_SINCE: "if-modified-since",
  IF_NONE_MATCH: "if-none-match",
  IF_UNMODIFIED_SINCE: "if-unmodified-since",
  PREFIX_FOR_STORAGE: "x-ms-",
  RANGE: "Range",
  USER_AGENT: "User-Agent",
  X_MS_CLIENT_REQUEST_ID: "x-ms-client-request-id",
  X_MS_COPY_SOURCE: "x-ms-copy-source",
  X_MS_DATE: "x-ms-date",
  X_MS_ERROR_CODE: "x-ms-error-code",
  X_MS_VERSION: "x-ms-version",
  X_MS_CopySourceErrorCode: "x-ms-copy-source-error-code"
};
const DevelopmentConnectionString = `DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;`;
const PathStylePorts = [
  "10000",
  "10001",
  "10002",
  "10003",
  "10004",
  "10100",
  "10101",
  "10102",
  "10103",
  "10104",
  "11000",
  "11001",
  "11002",
  "11003",
  "11004",
  "11100",
  "11101",
  "11102",
  "11103",
  "11104"
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DevelopmentConnectionString,
  HeaderConstants,
  PathStylePorts,
  SDK_VERSION,
  URLConstants
});
//# sourceMappingURL=constants.js.map
