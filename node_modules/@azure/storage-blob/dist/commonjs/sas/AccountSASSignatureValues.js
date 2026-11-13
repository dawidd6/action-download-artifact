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
var AccountSASSignatureValues_exports = {};
__export(AccountSASSignatureValues_exports, {
  generateAccountSASQueryParameters: () => generateAccountSASQueryParameters,
  generateAccountSASQueryParametersInternal: () => generateAccountSASQueryParametersInternal
});
module.exports = __toCommonJS(AccountSASSignatureValues_exports);
var import_AccountSASPermissions = require("./AccountSASPermissions.js");
var import_AccountSASResourceTypes = require("./AccountSASResourceTypes.js");
var import_AccountSASServices = require("./AccountSASServices.js");
var import_SasIPRange = require("./SasIPRange.js");
var import_SASQueryParameters = require("./SASQueryParameters.js");
var import_constants = require("../utils/constants.js");
var import_utils_common = require("../utils/utils.common.js");
function generateAccountSASQueryParameters(accountSASSignatureValues, sharedKeyCredential) {
  return generateAccountSASQueryParametersInternal(accountSASSignatureValues, sharedKeyCredential).sasQueryParameters;
}
function generateAccountSASQueryParametersInternal(accountSASSignatureValues, sharedKeyCredential) {
  const version = accountSASSignatureValues.version ? accountSASSignatureValues.version : import_constants.SERVICE_VERSION;
  if (accountSASSignatureValues.permissions && accountSASSignatureValues.permissions.setImmutabilityPolicy && version < "2020-08-04") {
    throw RangeError("'version' must be >= '2020-08-04' when provided 'i' permission.");
  }
  if (accountSASSignatureValues.permissions && accountSASSignatureValues.permissions.deleteVersion && version < "2019-10-10") {
    throw RangeError("'version' must be >= '2019-10-10' when provided 'x' permission.");
  }
  if (accountSASSignatureValues.permissions && accountSASSignatureValues.permissions.permanentDelete && version < "2019-10-10") {
    throw RangeError("'version' must be >= '2019-10-10' when provided 'y' permission.");
  }
  if (accountSASSignatureValues.permissions && accountSASSignatureValues.permissions.tag && version < "2019-12-12") {
    throw RangeError("'version' must be >= '2019-12-12' when provided 't' permission.");
  }
  if (accountSASSignatureValues.permissions && accountSASSignatureValues.permissions.filter && version < "2019-12-12") {
    throw RangeError("'version' must be >= '2019-12-12' when provided 'f' permission.");
  }
  if (accountSASSignatureValues.encryptionScope && version < "2020-12-06") {
    throw RangeError("'version' must be >= '2020-12-06' when provided 'encryptionScope' in SAS.");
  }
  const parsedPermissions = import_AccountSASPermissions.AccountSASPermissions.parse(
    accountSASSignatureValues.permissions.toString()
  );
  const parsedServices = import_AccountSASServices.AccountSASServices.parse(accountSASSignatureValues.services).toString();
  const parsedResourceTypes = import_AccountSASResourceTypes.AccountSASResourceTypes.parse(
    accountSASSignatureValues.resourceTypes
  ).toString();
  let stringToSign;
  if (version >= "2020-12-06") {
    stringToSign = [
      sharedKeyCredential.accountName,
      parsedPermissions,
      parsedServices,
      parsedResourceTypes,
      accountSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(accountSASSignatureValues.startsOn, false) : "",
      (0, import_utils_common.truncatedISO8061Date)(accountSASSignatureValues.expiresOn, false),
      accountSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(accountSASSignatureValues.ipRange) : "",
      accountSASSignatureValues.protocol ? accountSASSignatureValues.protocol : "",
      version,
      accountSASSignatureValues.encryptionScope ? accountSASSignatureValues.encryptionScope : "",
      ""
      // Account SAS requires an additional newline character
    ].join("\n");
  } else {
    stringToSign = [
      sharedKeyCredential.accountName,
      parsedPermissions,
      parsedServices,
      parsedResourceTypes,
      accountSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(accountSASSignatureValues.startsOn, false) : "",
      (0, import_utils_common.truncatedISO8061Date)(accountSASSignatureValues.expiresOn, false),
      accountSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(accountSASSignatureValues.ipRange) : "",
      accountSASSignatureValues.protocol ? accountSASSignatureValues.protocol : "",
      version,
      ""
      // Account SAS requires an additional newline character
    ].join("\n");
  }
  const signature = sharedKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      version,
      signature,
      parsedPermissions.toString(),
      parsedServices,
      parsedResourceTypes,
      accountSASSignatureValues.protocol,
      accountSASSignatureValues.startsOn,
      accountSASSignatureValues.expiresOn,
      accountSASSignatureValues.ipRange,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      accountSASSignatureValues.encryptionScope
    ),
    stringToSign
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateAccountSASQueryParameters,
  generateAccountSASQueryParametersInternal
});
//# sourceMappingURL=AccountSASSignatureValues.js.map
