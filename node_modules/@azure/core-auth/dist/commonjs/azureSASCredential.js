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
var azureSASCredential_exports = {};
__export(azureSASCredential_exports, {
  AzureSASCredential: () => AzureSASCredential,
  isSASCredential: () => isSASCredential
});
module.exports = __toCommonJS(azureSASCredential_exports);
var import_core_util = require("@azure/core-util");
class AzureSASCredential {
  _signature;
  /**
   * The value of the shared access signature to be used in authentication
   */
  get signature() {
    return this._signature;
  }
  /**
   * Create an instance of an AzureSASCredential for use
   * with a service client.
   *
   * @param signature - The initial value of the shared access signature to use in authentication
   */
  constructor(signature) {
    if (!signature) {
      throw new Error("shared access signature must be a non-empty string");
    }
    this._signature = signature;
  }
  /**
   * Change the value of the signature.
   *
   * Updates will take effect upon the next request after
   * updating the signature value.
   *
   * @param newSignature - The new shared access signature value to be used
   */
  update(newSignature) {
    if (!newSignature) {
      throw new Error("shared access signature must be a non-empty string");
    }
    this._signature = newSignature;
  }
}
function isSASCredential(credential) {
  return (0, import_core_util.isObjectWithProperties)(credential, ["signature"]) && typeof credential.signature === "string";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AzureSASCredential,
  isSASCredential
});
//# sourceMappingURL=azureSASCredential.js.map
