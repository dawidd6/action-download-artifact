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
var models_exports = {};
__export(models_exports, {
  BlockBlobTier: () => BlockBlobTier,
  PremiumPageBlobTier: () => PremiumPageBlobTier,
  StorageBlobAudience: () => StorageBlobAudience,
  ensureCpkIfSpecified: () => ensureCpkIfSpecified,
  getBlobServiceAccountAudience: () => getBlobServiceAccountAudience,
  toAccessTier: () => toAccessTier
});
module.exports = __toCommonJS(models_exports);
var import_constants = require("./utils/constants.js");
var BlockBlobTier = /* @__PURE__ */ ((BlockBlobTier2) => {
  BlockBlobTier2["Hot"] = "Hot";
  BlockBlobTier2["Cool"] = "Cool";
  BlockBlobTier2["Cold"] = "Cold";
  BlockBlobTier2["Archive"] = "Archive";
  return BlockBlobTier2;
})(BlockBlobTier || {});
var PremiumPageBlobTier = /* @__PURE__ */ ((PremiumPageBlobTier2) => {
  PremiumPageBlobTier2["P4"] = "P4";
  PremiumPageBlobTier2["P6"] = "P6";
  PremiumPageBlobTier2["P10"] = "P10";
  PremiumPageBlobTier2["P15"] = "P15";
  PremiumPageBlobTier2["P20"] = "P20";
  PremiumPageBlobTier2["P30"] = "P30";
  PremiumPageBlobTier2["P40"] = "P40";
  PremiumPageBlobTier2["P50"] = "P50";
  PremiumPageBlobTier2["P60"] = "P60";
  PremiumPageBlobTier2["P70"] = "P70";
  PremiumPageBlobTier2["P80"] = "P80";
  return PremiumPageBlobTier2;
})(PremiumPageBlobTier || {});
function toAccessTier(tier) {
  if (tier === void 0) {
    return void 0;
  }
  return tier;
}
function ensureCpkIfSpecified(cpk, isHttps) {
  if (cpk && !isHttps) {
    throw new RangeError("Customer-provided encryption key must be used over HTTPS.");
  }
  if (cpk && !cpk.encryptionAlgorithm) {
    cpk.encryptionAlgorithm = import_constants.EncryptionAlgorithmAES25;
  }
}
var StorageBlobAudience = /* @__PURE__ */ ((StorageBlobAudience2) => {
  StorageBlobAudience2["StorageOAuthScopes"] = "https://storage.azure.com/.default";
  StorageBlobAudience2["DiskComputeOAuthScopes"] = "https://disk.compute.azure.com/.default";
  return StorageBlobAudience2;
})(StorageBlobAudience || {});
function getBlobServiceAccountAudience(storageAccountName) {
  return `https://${storageAccountName}.blob.core.windows.net/.default`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlockBlobTier,
  PremiumPageBlobTier,
  StorageBlobAudience,
  ensureCpkIfSpecified,
  getBlobServiceAccountAudience,
  toAccessTier
});
//# sourceMappingURL=models.js.map
