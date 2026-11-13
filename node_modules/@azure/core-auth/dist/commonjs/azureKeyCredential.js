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
var azureKeyCredential_exports = {};
__export(azureKeyCredential_exports, {
  AzureKeyCredential: () => AzureKeyCredential
});
module.exports = __toCommonJS(azureKeyCredential_exports);
class AzureKeyCredential {
  _key;
  /**
   * The value of the key to be used in authentication
   */
  get key() {
    return this._key;
  }
  /**
   * Create an instance of an AzureKeyCredential for use
   * with a service client.
   *
   * @param key - The initial value of the key to use in authentication
   */
  constructor(key) {
    if (!key) {
      throw new Error("key must be a non-empty string");
    }
    this._key = key;
  }
  /**
   * Change the value of the key.
   *
   * Updates will take effect upon the next request after
   * updating the key value.
   *
   * @param newKey - The new key value to be used
   */
  update(newKey) {
    this._key = newKey;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AzureKeyCredential
});
//# sourceMappingURL=azureKeyCredential.js.map
