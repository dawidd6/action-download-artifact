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
var StorageRetryPolicyType_exports = {};
__export(StorageRetryPolicyType_exports, {
  StorageRetryPolicyType: () => StorageRetryPolicyType
});
module.exports = __toCommonJS(StorageRetryPolicyType_exports);
var StorageRetryPolicyType = /* @__PURE__ */ ((StorageRetryPolicyType2) => {
  StorageRetryPolicyType2[StorageRetryPolicyType2["EXPONENTIAL"] = 0] = "EXPONENTIAL";
  StorageRetryPolicyType2[StorageRetryPolicyType2["FIXED"] = 1] = "FIXED";
  return StorageRetryPolicyType2;
})(StorageRetryPolicyType || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StorageRetryPolicyType
});
//# sourceMappingURL=StorageRetryPolicyType.js.map
