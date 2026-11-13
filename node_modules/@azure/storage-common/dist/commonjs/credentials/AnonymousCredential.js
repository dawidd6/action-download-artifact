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
var AnonymousCredential_exports = {};
__export(AnonymousCredential_exports, {
  AnonymousCredential: () => AnonymousCredential
});
module.exports = __toCommonJS(AnonymousCredential_exports);
var import_AnonymousCredentialPolicy = require("../policies/AnonymousCredentialPolicy.js");
var import_Credential = require("./Credential.js");
class AnonymousCredential extends import_Credential.Credential {
  /**
   * Creates an {@link AnonymousCredentialPolicy} object.
   *
   * @param nextPolicy -
   * @param options -
   */
  create(nextPolicy, options) {
    return new import_AnonymousCredentialPolicy.AnonymousCredentialPolicy(nextPolicy, options);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AnonymousCredential
});
//# sourceMappingURL=AnonymousCredential.js.map
