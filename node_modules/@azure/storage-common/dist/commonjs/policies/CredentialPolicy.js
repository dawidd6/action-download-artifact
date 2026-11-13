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
var CredentialPolicy_exports = {};
__export(CredentialPolicy_exports, {
  CredentialPolicy: () => CredentialPolicy
});
module.exports = __toCommonJS(CredentialPolicy_exports);
var import_RequestPolicy = require("./RequestPolicy.js");
class CredentialPolicy extends import_RequestPolicy.BaseRequestPolicy {
  /**
   * Sends out request.
   *
   * @param request -
   */
  sendRequest(request) {
    return this._nextPolicy.sendRequest(this.signRequest(request));
  }
  /**
   * Child classes must implement this method with request signing. This method
   * will be executed in {@link sendRequest}.
   *
   * @param request -
   */
  signRequest(request) {
    return request;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CredentialPolicy
});
//# sourceMappingURL=CredentialPolicy.js.map
