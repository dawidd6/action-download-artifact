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
var StorageRequestFailureDetailsParserPolicy_exports = {};
__export(StorageRequestFailureDetailsParserPolicy_exports, {
  storageRequestFailureDetailsParserPolicy: () => storageRequestFailureDetailsParserPolicy,
  storageRequestFailureDetailsParserPolicyName: () => storageRequestFailureDetailsParserPolicyName
});
module.exports = __toCommonJS(StorageRequestFailureDetailsParserPolicy_exports);
const storageRequestFailureDetailsParserPolicyName = "storageRequestFailureDetailsParserPolicy";
function storageRequestFailureDetailsParserPolicy() {
  return {
    name: storageRequestFailureDetailsParserPolicyName,
    async sendRequest(request, next) {
      try {
        const response = await next(request);
        if (response.status === 400 && response.bodyAsText?.includes("<Error><Code>InvalidHeaderValue</Code>") && response.bodyAsText.includes("<HeaderName>x-ms-version</HeaderName>")) {
          response.bodyAsText = response.bodyAsText.replace(
            /<Message>.*<\/Message>/s,
            "<Message>The provided service version is not enabled on this storage account. Please see https://learn.microsoft.com/rest/api/storageservices/versioning-for-the-azure-storage-services for additional information.</Message>"
          );
        }
        return response;
      } catch (err) {
        if (typeof err === "object" && err !== null && err.response && err.response.parsedBody) {
          if (err.response.parsedBody.code === "InvalidHeaderValue" && err.response.parsedBody.HeaderName === "x-ms-version") {
            err.message = "The provided service version is not enabled on this storage account. Please see https://learn.microsoft.com/rest/api/storageservices/versioning-for-the-azure-storage-services for additional information.\n";
          }
        }
        throw err;
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  storageRequestFailureDetailsParserPolicy,
  storageRequestFailureDetailsParserPolicyName
});
//# sourceMappingURL=StorageRequestFailureDetailsParserPolicy.js.map
