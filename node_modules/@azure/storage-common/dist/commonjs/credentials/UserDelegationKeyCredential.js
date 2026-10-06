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
var UserDelegationKeyCredential_exports = {};
__export(UserDelegationKeyCredential_exports, {
  UserDelegationKeyCredential: () => UserDelegationKeyCredential
});
module.exports = __toCommonJS(UserDelegationKeyCredential_exports);
var import_node_crypto = require("node:crypto");
class UserDelegationKeyCredential {
  /**
   * Azure Storage account name; readonly.
   */
  accountName;
  /**
   * Azure Storage user delegation key; readonly.
   */
  userDelegationKey;
  /**
   * Key value in Buffer type.
   */
  key;
  /**
   * Creates an instance of UserDelegationKeyCredential.
   * @param accountName -
   * @param userDelegationKey -
   */
  constructor(accountName, userDelegationKey) {
    this.accountName = accountName;
    this.userDelegationKey = userDelegationKey;
    this.key = Buffer.from(userDelegationKey.value, "base64");
  }
  /**
   * Generates a hash signature for an HTTP request or for a SAS.
   *
   * @param stringToSign -
   */
  computeHMACSHA256(stringToSign) {
    return (0, import_node_crypto.createHmac)("sha256", this.key).update(stringToSign, "utf8").digest("base64");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  UserDelegationKeyCredential
});
//# sourceMappingURL=UserDelegationKeyCredential.js.map
