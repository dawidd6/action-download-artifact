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
var keyCredential_exports = {};
__export(keyCredential_exports, {
  isKeyCredential: () => isKeyCredential
});
module.exports = __toCommonJS(keyCredential_exports);
var import_core_util = require("@azure/core-util");
function isKeyCredential(credential) {
  return (0, import_core_util.isObjectWithProperties)(credential, ["key"]) && typeof credential.key === "string";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isKeyCredential
});
//# sourceMappingURL=keyCredential.js.map
