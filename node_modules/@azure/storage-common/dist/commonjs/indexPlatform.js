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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var indexPlatform_exports = {};
__export(indexPlatform_exports, {
  BaseRequestPolicy: () => import_RequestPolicy.BaseRequestPolicy,
  createBlobFromData: () => import_bufferHelpers_common.createBlobFromData,
  getCachedDefaultHttpClient: () => import_cache.getCachedDefaultHttpClient
});
module.exports = __toCommonJS(indexPlatform_exports);
__reExport(indexPlatform_exports, require("./BufferScheduler.js"), module.exports);
__reExport(indexPlatform_exports, require("./bufferHelpers.js"), module.exports);
var import_bufferHelpers_common = require("./bufferHelpers.common.js");
__reExport(indexPlatform_exports, require("./StructuredMessageEncodingStream.js"), module.exports);
__reExport(indexPlatform_exports, require("./StructuredMessageDecodingStream.js"), module.exports);
__reExport(indexPlatform_exports, require("./StorageCRC64Calculator.js"), module.exports);
var import_cache = require("./cache.js");
__reExport(indexPlatform_exports, require("./StorageResponseFormat.js"), module.exports);
__reExport(indexPlatform_exports, require("./StorageBrowserPolicyFactory.js"), module.exports);
__reExport(indexPlatform_exports, require("./credentials/AnonymousCredential.js"), module.exports);
__reExport(indexPlatform_exports, require("./credentials/Credential.js"), module.exports);
__reExport(indexPlatform_exports, require("./credentials/StorageSharedKeyCredential.js"), module.exports);
__reExport(indexPlatform_exports, require("./StorageRetryPolicyFactory.js"), module.exports);
var import_RequestPolicy = require("./policies/RequestPolicy.js");
__reExport(indexPlatform_exports, require("./policies/AnonymousCredentialPolicy.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/CredentialPolicy.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/StorageBrowserPolicyV2.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/StorageCorrectContentLengthPolicy.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/StorageRetryPolicyV2.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/StorageSharedKeyCredentialPolicy.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/StorageSharedKeyCredentialPolicyV2.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/StorageRedirectRangeHeaderPolicy.js"), module.exports);
__reExport(indexPlatform_exports, require("./policies/StorageRequestFailureDetailsParserPolicy.js"), module.exports);
__reExport(indexPlatform_exports, require("./credentials/UserDelegationKeyCredential.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseRequestPolicy,
  createBlobFromData,
  getCachedDefaultHttpClient,
  ...require("./BufferScheduler.js"),
  ...require("./bufferHelpers.js"),
  ...require("./StructuredMessageEncodingStream.js"),
  ...require("./StructuredMessageDecodingStream.js"),
  ...require("./StorageCRC64Calculator.js"),
  ...require("./StorageResponseFormat.js"),
  ...require("./StorageBrowserPolicyFactory.js"),
  ...require("./credentials/AnonymousCredential.js"),
  ...require("./credentials/Credential.js"),
  ...require("./credentials/StorageSharedKeyCredential.js"),
  ...require("./StorageRetryPolicyFactory.js"),
  ...require("./policies/AnonymousCredentialPolicy.js"),
  ...require("./policies/CredentialPolicy.js"),
  ...require("./policies/StorageBrowserPolicyV2.js"),
  ...require("./policies/StorageCorrectContentLengthPolicy.js"),
  ...require("./policies/StorageRetryPolicyV2.js"),
  ...require("./policies/StorageSharedKeyCredentialPolicy.js"),
  ...require("./policies/StorageSharedKeyCredentialPolicyV2.js"),
  ...require("./policies/StorageRedirectRangeHeaderPolicy.js"),
  ...require("./policies/StorageRequestFailureDetailsParserPolicy.js"),
  ...require("./credentials/UserDelegationKeyCredential.js")
});
//# sourceMappingURL=indexPlatform.js.map
