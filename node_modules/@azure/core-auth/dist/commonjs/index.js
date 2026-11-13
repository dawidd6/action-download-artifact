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
var src_exports = {};
__export(src_exports, {
  AzureKeyCredential: () => import_azureKeyCredential.AzureKeyCredential,
  AzureNamedKeyCredential: () => import_azureNamedKeyCredential.AzureNamedKeyCredential,
  AzureSASCredential: () => import_azureSASCredential.AzureSASCredential,
  isKeyCredential: () => import_keyCredential.isKeyCredential,
  isNamedKeyCredential: () => import_azureNamedKeyCredential.isNamedKeyCredential,
  isSASCredential: () => import_azureSASCredential.isSASCredential,
  isTokenCredential: () => import_tokenCredential.isTokenCredential
});
module.exports = __toCommonJS(src_exports);
var import_azureKeyCredential = require("./azureKeyCredential.js");
var import_keyCredential = require("./keyCredential.js");
var import_azureNamedKeyCredential = require("./azureNamedKeyCredential.js");
var import_azureSASCredential = require("./azureSASCredential.js");
var import_tokenCredential = require("./tokenCredential.js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AzureKeyCredential,
  AzureNamedKeyCredential,
  AzureSASCredential,
  isKeyCredential,
  isNamedKeyCredential,
  isSASCredential,
  isTokenCredential
});
//# sourceMappingURL=index.js.map
