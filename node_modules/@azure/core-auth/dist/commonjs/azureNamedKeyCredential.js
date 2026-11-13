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
var azureNamedKeyCredential_exports = {};
__export(azureNamedKeyCredential_exports, {
  AzureNamedKeyCredential: () => AzureNamedKeyCredential,
  isNamedKeyCredential: () => isNamedKeyCredential
});
module.exports = __toCommonJS(azureNamedKeyCredential_exports);
var import_core_util = require("@azure/core-util");
class AzureNamedKeyCredential {
  _key;
  _name;
  /**
   * The value of the key to be used in authentication.
   */
  get key() {
    return this._key;
  }
  /**
   * The value of the name to be used in authentication.
   */
  get name() {
    return this._name;
  }
  /**
   * Create an instance of an AzureNamedKeyCredential for use
   * with a service client.
   *
   * @param name - The initial value of the name to use in authentication.
   * @param key - The initial value of the key to use in authentication.
   */
  constructor(name, key) {
    if (!name || !key) {
      throw new TypeError("name and key must be non-empty strings");
    }
    this._name = name;
    this._key = key;
  }
  /**
   * Change the value of the key.
   *
   * Updates will take effect upon the next request after
   * updating the key value.
   *
   * @param newName - The new name value to be used.
   * @param newKey - The new key value to be used.
   */
  update(newName, newKey) {
    if (!newName || !newKey) {
      throw new TypeError("newName and newKey must be non-empty strings");
    }
    this._name = newName;
    this._key = newKey;
  }
}
function isNamedKeyCredential(credential) {
  return (0, import_core_util.isObjectWithProperties)(credential, ["name", "key"]) && typeof credential.key === "string" && typeof credential.name === "string";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AzureNamedKeyCredential,
  isNamedKeyCredential
});
//# sourceMappingURL=azureNamedKeyCredential.js.map
