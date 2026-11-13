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
var StorageSharedKeyCredential_exports = {};
__export(StorageSharedKeyCredential_exports, {
  StorageSharedKeyCredential: () => StorageSharedKeyCredential
});
module.exports = __toCommonJS(StorageSharedKeyCredential_exports);
var import_node_crypto = require("node:crypto");
var import_StorageSharedKeyCredentialPolicy = require("../policies/StorageSharedKeyCredentialPolicy.js");
var import_Credential = require("./Credential.js");
class StorageSharedKeyCredential extends import_Credential.Credential {
  /**
   * Azure Storage account name; readonly.
   */
  accountName;
  /**
   * Azure Storage account key; readonly.
   */
  accountKey;
  /**
   * Creates an instance of StorageSharedKeyCredential.
   * @param accountName -
   * @param accountKey -
   */
  constructor(accountName, accountKey) {
    super();
    this.accountName = accountName;
    this.accountKey = Buffer.from(accountKey, "base64");
  }
  /**
   * Creates a StorageSharedKeyCredentialPolicy object.
   *
   * @param nextPolicy -
   * @param options -
   */
  create(nextPolicy, options) {
    return new import_StorageSharedKeyCredentialPolicy.StorageSharedKeyCredentialPolicy(nextPolicy, options, this);
  }
  /**
   * Generates a hash signature for an HTTP request or for a SAS.
   *
   * @param stringToSign -
   */
  computeHMACSHA256(stringToSign) {
    return (0, import_node_crypto.createHmac)("sha256", this.accountKey).update(stringToSign, "utf8").digest("base64");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StorageSharedKeyCredential
});
//# sourceMappingURL=StorageSharedKeyCredential.js.map
