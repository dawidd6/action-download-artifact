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
var StorageCorrectContentLengthPolicy_exports = {};
__export(StorageCorrectContentLengthPolicy_exports, {
  storageCorrectContentLengthPolicy: () => storageCorrectContentLengthPolicy,
  storageCorrectContentLengthPolicyName: () => storageCorrectContentLengthPolicyName
});
module.exports = __toCommonJS(StorageCorrectContentLengthPolicy_exports);
var import_constants = require("../utils/constants.js");
const storageCorrectContentLengthPolicyName = "StorageCorrectContentLengthPolicy";
function storageCorrectContentLengthPolicy() {
  function correctContentLength(request) {
    if (request.body && (typeof request.body === "string" || Buffer.isBuffer(request.body)) && request.body.length > 0) {
      request.headers.set(import_constants.HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(request.body));
    }
  }
  return {
    name: storageCorrectContentLengthPolicyName,
    async sendRequest(request, next) {
      correctContentLength(request);
      return next(request);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  storageCorrectContentLengthPolicy,
  storageCorrectContentLengthPolicyName
});
//# sourceMappingURL=StorageCorrectContentLengthPolicy.js.map
