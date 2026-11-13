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
var BlobSASSignatureValues_exports = {};
__export(BlobSASSignatureValues_exports, {
  generateBlobSASQueryParameters: () => generateBlobSASQueryParameters,
  generateBlobSASQueryParametersInternal: () => generateBlobSASQueryParametersInternal
});
module.exports = __toCommonJS(BlobSASSignatureValues_exports);
var import_BlobSASPermissions = require("./BlobSASPermissions.js");
var import_ContainerSASPermissions = require("./ContainerSASPermissions.js");
var import_storage_common = require("@azure/storage-common");
var import_SasIPRange = require("./SasIPRange.js");
var import_SASQueryParameters = require("./SASQueryParameters.js");
var import_constants = require("../utils/constants.js");
var import_utils_common = require("../utils/utils.common.js");
var import_storage_common2 = require("@azure/storage-common");
function generateBlobSASQueryParameters(blobSASSignatureValues, sharedKeyCredentialOrUserDelegationKey, accountName) {
  return generateBlobSASQueryParametersInternal(
    blobSASSignatureValues,
    sharedKeyCredentialOrUserDelegationKey,
    accountName
  ).sasQueryParameters;
}
function generateBlobSASQueryParametersInternal(blobSASSignatureValues, sharedKeyCredentialOrUserDelegationKey, accountName) {
  const version = blobSASSignatureValues.version ? blobSASSignatureValues.version : import_constants.SERVICE_VERSION;
  const sharedKeyCredential = sharedKeyCredentialOrUserDelegationKey instanceof import_storage_common.StorageSharedKeyCredential ? sharedKeyCredentialOrUserDelegationKey : void 0;
  let userDelegationKeyCredential;
  if (sharedKeyCredential === void 0 && accountName !== void 0) {
    userDelegationKeyCredential = new import_storage_common2.UserDelegationKeyCredential(
      accountName,
      sharedKeyCredentialOrUserDelegationKey
    );
  }
  if (sharedKeyCredential === void 0 && userDelegationKeyCredential === void 0) {
    throw TypeError("Invalid sharedKeyCredential, userDelegationKey or accountName.");
  }
  if (version >= "2020-12-06") {
    if (sharedKeyCredential !== void 0) {
      return generateBlobSASQueryParameters20201206(blobSASSignatureValues, sharedKeyCredential);
    } else {
      if (version >= "2026-04-06") {
        return generateBlobSASQueryParametersUDK20260406(
          blobSASSignatureValues,
          userDelegationKeyCredential
        );
      } else if (version >= "2025-07-05") {
        return generateBlobSASQueryParametersUDK20250705(
          blobSASSignatureValues,
          userDelegationKeyCredential
        );
      } else {
        return generateBlobSASQueryParametersUDK20201206(
          blobSASSignatureValues,
          userDelegationKeyCredential
        );
      }
    }
  }
  if (version >= "2018-11-09") {
    if (sharedKeyCredential !== void 0) {
      if (version >= "2020-02-10") {
        return generateBlobSASQueryParameters20200210(blobSASSignatureValues, sharedKeyCredential);
      } else {
        return generateBlobSASQueryParameters20181109(blobSASSignatureValues, sharedKeyCredential);
      }
    } else {
      if (version >= "2020-02-10") {
        return generateBlobSASQueryParametersUDK20200210(
          blobSASSignatureValues,
          userDelegationKeyCredential
        );
      } else {
        return generateBlobSASQueryParametersUDK20181109(
          blobSASSignatureValues,
          userDelegationKeyCredential
        );
      }
    }
  }
  if (version >= "2015-04-05") {
    if (sharedKeyCredential !== void 0) {
      return generateBlobSASQueryParameters20150405(blobSASSignatureValues, sharedKeyCredential);
    } else {
      throw new RangeError(
        "'version' must be >= '2018-11-09' when generating user delegation SAS using user delegation key."
      );
    }
  }
  throw new RangeError("'version' must be >= '2015-04-05'.");
}
function generateBlobSASQueryParameters20150405(blobSASSignatureValues, sharedKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.identifier && !(blobSASSignatureValues.permissions && blobSASSignatureValues.expiresOn)) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when 'identifier' is not provided."
    );
  }
  let resource = "c";
  if (blobSASSignatureValues.blobName) {
    resource = "b";
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      sharedKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    blobSASSignatureValues.identifier,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    blobSASSignatureValues.cacheControl ? blobSASSignatureValues.cacheControl : "",
    blobSASSignatureValues.contentDisposition ? blobSASSignatureValues.contentDisposition : "",
    blobSASSignatureValues.contentEncoding ? blobSASSignatureValues.contentEncoding : "",
    blobSASSignatureValues.contentLanguage ? blobSASSignatureValues.contentLanguage : "",
    blobSASSignatureValues.contentType ? blobSASSignatureValues.contentType : ""
  ].join("\n");
  const signature = sharedKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType
    ),
    stringToSign
  };
}
function generateBlobSASQueryParameters20181109(blobSASSignatureValues, sharedKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.identifier && !(blobSASSignatureValues.permissions && blobSASSignatureValues.expiresOn)) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when 'identifier' is not provided."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  if (blobSASSignatureValues.blobName) {
    resource = "b";
    if (blobSASSignatureValues.snapshotTime) {
      resource = "bs";
    } else if (blobSASSignatureValues.versionId) {
      resource = "bv";
      timestamp = blobSASSignatureValues.versionId;
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      sharedKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    blobSASSignatureValues.identifier,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.cacheControl ? blobSASSignatureValues.cacheControl : "",
    blobSASSignatureValues.contentDisposition ? blobSASSignatureValues.contentDisposition : "",
    blobSASSignatureValues.contentEncoding ? blobSASSignatureValues.contentEncoding : "",
    blobSASSignatureValues.contentLanguage ? blobSASSignatureValues.contentLanguage : "",
    blobSASSignatureValues.contentType ? blobSASSignatureValues.contentType : ""
  ].join("\n");
  const signature = sharedKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType
    ),
    stringToSign
  };
}
function generateBlobSASQueryParameters20200210(blobSASSignatureValues, sharedKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.identifier && !(blobSASSignatureValues.permissions && blobSASSignatureValues.expiresOn)) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when 'identifier' is not provided."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  let directoryDepth = void 0;
  if (blobSASSignatureValues.blobName) {
    if (blobSASSignatureValues.isDirectory === true) {
      resource = "d";
      directoryDepth = trimBlobName(blobSASSignatureValues.blobName).split("/").length;
    } else {
      resource = "b";
      if (blobSASSignatureValues.snapshotTime) {
        resource = "bs";
      } else if (blobSASSignatureValues.versionId) {
        resource = "bv";
        timestamp = blobSASSignatureValues.versionId;
      }
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      sharedKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    blobSASSignatureValues.identifier,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.cacheControl ? blobSASSignatureValues.cacheControl : "",
    blobSASSignatureValues.contentDisposition ? blobSASSignatureValues.contentDisposition : "",
    blobSASSignatureValues.contentEncoding ? blobSASSignatureValues.contentEncoding : "",
    blobSASSignatureValues.contentLanguage ? blobSASSignatureValues.contentLanguage : "",
    blobSASSignatureValues.contentType ? blobSASSignatureValues.contentType : ""
  ].join("\n");
  const signature = sharedKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      directoryDepth
    ),
    stringToSign
  };
}
function generateBlobSASQueryParameters20201206(blobSASSignatureValues, sharedKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.identifier && !(blobSASSignatureValues.permissions && blobSASSignatureValues.expiresOn)) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when 'identifier' is not provided."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  let directoryDepth = void 0;
  if (blobSASSignatureValues.blobName) {
    if (blobSASSignatureValues.isDirectory === true) {
      resource = "d";
      directoryDepth = trimBlobName(blobSASSignatureValues.blobName).split("/").length;
    } else {
      resource = "b";
      if (blobSASSignatureValues.snapshotTime) {
        resource = "bs";
      } else if (blobSASSignatureValues.versionId) {
        resource = "bv";
        timestamp = blobSASSignatureValues.versionId;
      }
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      sharedKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    blobSASSignatureValues.identifier,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.encryptionScope,
    blobSASSignatureValues.cacheControl ? blobSASSignatureValues.cacheControl : "",
    blobSASSignatureValues.contentDisposition ? blobSASSignatureValues.contentDisposition : "",
    blobSASSignatureValues.contentEncoding ? blobSASSignatureValues.contentEncoding : "",
    blobSASSignatureValues.contentLanguage ? blobSASSignatureValues.contentLanguage : "",
    blobSASSignatureValues.contentType ? blobSASSignatureValues.contentType : ""
  ].join("\n");
  const signature = sharedKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType,
      void 0,
      void 0,
      void 0,
      blobSASSignatureValues.encryptionScope,
      void 0,
      void 0,
      void 0,
      directoryDepth
    ),
    stringToSign
  };
}
function generateBlobSASQueryParametersUDK20181109(blobSASSignatureValues, userDelegationKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.permissions || !blobSASSignatureValues.expiresOn) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when generating user delegation SAS."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  if (blobSASSignatureValues.blobName) {
    resource = "b";
    if (blobSASSignatureValues.snapshotTime) {
      resource = "bs";
    } else if (blobSASSignatureValues.versionId) {
      resource = "bv";
      timestamp = blobSASSignatureValues.versionId;
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      userDelegationKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    userDelegationKeyCredential.userDelegationKey.signedObjectId,
    userDelegationKeyCredential.userDelegationKey.signedTenantId,
    userDelegationKeyCredential.userDelegationKey.signedStartsOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedStartsOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedExpiresOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedExpiresOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedService,
    userDelegationKeyCredential.userDelegationKey.signedVersion,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.cacheControl,
    blobSASSignatureValues.contentDisposition,
    blobSASSignatureValues.contentEncoding,
    blobSASSignatureValues.contentLanguage,
    blobSASSignatureValues.contentType
  ].join("\n");
  const signature = userDelegationKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType,
      userDelegationKeyCredential.userDelegationKey
    ),
    stringToSign
  };
}
function generateBlobSASQueryParametersUDK20200210(blobSASSignatureValues, userDelegationKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.permissions || !blobSASSignatureValues.expiresOn) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when generating user delegation SAS."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  let directoryDepth = void 0;
  if (blobSASSignatureValues.blobName) {
    if (blobSASSignatureValues.isDirectory === true) {
      resource = "d";
      directoryDepth = trimBlobName(blobSASSignatureValues.blobName).split("/").length;
    } else {
      resource = "b";
      if (blobSASSignatureValues.snapshotTime) {
        resource = "bs";
      } else if (blobSASSignatureValues.versionId) {
        resource = "bv";
        timestamp = blobSASSignatureValues.versionId;
      }
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      userDelegationKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    userDelegationKeyCredential.userDelegationKey.signedObjectId,
    userDelegationKeyCredential.userDelegationKey.signedTenantId,
    userDelegationKeyCredential.userDelegationKey.signedStartsOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedStartsOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedExpiresOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedExpiresOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedService,
    userDelegationKeyCredential.userDelegationKey.signedVersion,
    blobSASSignatureValues.preauthorizedAgentObjectId,
    void 0,
    // agentObjectId
    blobSASSignatureValues.correlationId,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.cacheControl,
    blobSASSignatureValues.contentDisposition,
    blobSASSignatureValues.contentEncoding,
    blobSASSignatureValues.contentLanguage,
    blobSASSignatureValues.contentType
  ].join("\n");
  const signature = userDelegationKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType,
      userDelegationKeyCredential.userDelegationKey,
      blobSASSignatureValues.preauthorizedAgentObjectId,
      blobSASSignatureValues.correlationId,
      void 0,
      void 0,
      void 0,
      void 0,
      directoryDepth
    ),
    stringToSign
  };
}
function generateBlobSASQueryParametersUDK20201206(blobSASSignatureValues, userDelegationKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.permissions || !blobSASSignatureValues.expiresOn) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when generating user delegation SAS."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  let directoryDepth = void 0;
  if (blobSASSignatureValues.blobName) {
    if (blobSASSignatureValues.isDirectory === true) {
      resource = "d";
      directoryDepth = trimBlobName(blobSASSignatureValues.blobName).split("/").length;
    } else {
      resource = "b";
      if (blobSASSignatureValues.snapshotTime) {
        resource = "bs";
      } else if (blobSASSignatureValues.versionId) {
        resource = "bv";
        timestamp = blobSASSignatureValues.versionId;
      }
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      userDelegationKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    userDelegationKeyCredential.userDelegationKey.signedObjectId,
    userDelegationKeyCredential.userDelegationKey.signedTenantId,
    userDelegationKeyCredential.userDelegationKey.signedStartsOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedStartsOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedExpiresOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedExpiresOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedService,
    userDelegationKeyCredential.userDelegationKey.signedVersion,
    blobSASSignatureValues.preauthorizedAgentObjectId,
    void 0,
    // agentObjectId
    blobSASSignatureValues.correlationId,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.encryptionScope,
    blobSASSignatureValues.cacheControl,
    blobSASSignatureValues.contentDisposition,
    blobSASSignatureValues.contentEncoding,
    blobSASSignatureValues.contentLanguage,
    blobSASSignatureValues.contentType
  ].join("\n");
  const signature = userDelegationKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType,
      userDelegationKeyCredential.userDelegationKey,
      blobSASSignatureValues.preauthorizedAgentObjectId,
      blobSASSignatureValues.correlationId,
      blobSASSignatureValues.encryptionScope,
      void 0,
      void 0,
      void 0,
      directoryDepth
    ),
    stringToSign
  };
}
function generateBlobSASQueryParametersUDK20250705(blobSASSignatureValues, userDelegationKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.permissions || !blobSASSignatureValues.expiresOn) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when generating user delegation SAS."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  let directoryDepth = void 0;
  if (blobSASSignatureValues.blobName) {
    if (blobSASSignatureValues.isDirectory === true) {
      resource = "d";
      directoryDepth = trimBlobName(blobSASSignatureValues.blobName).split("/").length;
    } else {
      resource = "b";
      if (blobSASSignatureValues.snapshotTime) {
        resource = "bs";
      } else if (blobSASSignatureValues.versionId) {
        resource = "bv";
        timestamp = blobSASSignatureValues.versionId;
      }
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      userDelegationKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    userDelegationKeyCredential.userDelegationKey.signedObjectId,
    userDelegationKeyCredential.userDelegationKey.signedTenantId,
    userDelegationKeyCredential.userDelegationKey.signedStartsOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedStartsOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedExpiresOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedExpiresOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedService,
    userDelegationKeyCredential.userDelegationKey.signedVersion,
    blobSASSignatureValues.preauthorizedAgentObjectId,
    void 0,
    // agentObjectId
    blobSASSignatureValues.correlationId,
    userDelegationKeyCredential.userDelegationKey.signedDelegatedUserTenantId,
    // SignedKeyDelegatedUserTenantId, will be added in a future release.
    blobSASSignatureValues.delegatedUserObjectId,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.encryptionScope,
    blobSASSignatureValues.cacheControl,
    blobSASSignatureValues.contentDisposition,
    blobSASSignatureValues.contentEncoding,
    blobSASSignatureValues.contentLanguage,
    blobSASSignatureValues.contentType
  ].join("\n");
  const signature = userDelegationKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType,
      userDelegationKeyCredential.userDelegationKey,
      blobSASSignatureValues.preauthorizedAgentObjectId,
      blobSASSignatureValues.correlationId,
      blobSASSignatureValues.encryptionScope,
      blobSASSignatureValues.delegatedUserObjectId,
      void 0,
      void 0,
      directoryDepth
    ),
    stringToSign
  };
}
function generateBlobSASQueryParametersUDK20260406(blobSASSignatureValues, userDelegationKeyCredential) {
  blobSASSignatureValues = SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues);
  if (!blobSASSignatureValues.permissions || !blobSASSignatureValues.expiresOn) {
    throw new RangeError(
      "Must provide 'permissions' and 'expiresOn' for Blob SAS generation when generating user delegation SAS."
    );
  }
  let resource = "c";
  let timestamp = blobSASSignatureValues.snapshotTime;
  let directoryDepth = void 0;
  if (blobSASSignatureValues.blobName) {
    if (blobSASSignatureValues.isDirectory === true) {
      resource = "d";
      directoryDepth = trimBlobName(blobSASSignatureValues.blobName).split("/").length;
    } else {
      resource = "b";
      if (blobSASSignatureValues.snapshotTime) {
        resource = "bs";
      } else if (blobSASSignatureValues.versionId) {
        resource = "bv";
        timestamp = blobSASSignatureValues.versionId;
      }
    }
  }
  let verifiedPermissions;
  if (blobSASSignatureValues.permissions) {
    if (blobSASSignatureValues.blobName) {
      verifiedPermissions = import_BlobSASPermissions.BlobSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    } else {
      verifiedPermissions = import_ContainerSASPermissions.ContainerSASPermissions.parse(
        blobSASSignatureValues.permissions.toString()
      ).toString();
    }
  }
  const stringToSign = [
    verifiedPermissions ? verifiedPermissions : "",
    blobSASSignatureValues.startsOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.startsOn, false) : "",
    blobSASSignatureValues.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(blobSASSignatureValues.expiresOn, false) : "",
    getCanonicalName(
      userDelegationKeyCredential.accountName,
      blobSASSignatureValues.containerName,
      blobSASSignatureValues.blobName
    ),
    userDelegationKeyCredential.userDelegationKey.signedObjectId,
    userDelegationKeyCredential.userDelegationKey.signedTenantId,
    userDelegationKeyCredential.userDelegationKey.signedStartsOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedStartsOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedExpiresOn ? (0, import_utils_common.truncatedISO8061Date)(userDelegationKeyCredential.userDelegationKey.signedExpiresOn, false) : "",
    userDelegationKeyCredential.userDelegationKey.signedService,
    userDelegationKeyCredential.userDelegationKey.signedVersion,
    blobSASSignatureValues.preauthorizedAgentObjectId,
    void 0,
    // agentObjectId
    blobSASSignatureValues.correlationId,
    userDelegationKeyCredential.userDelegationKey.signedDelegatedUserTenantId,
    // SignedKeyDelegatedUserTenantId, will be added in a future release.
    blobSASSignatureValues.delegatedUserObjectId,
    blobSASSignatureValues.ipRange ? (0, import_SasIPRange.ipRangeToString)(blobSASSignatureValues.ipRange) : "",
    blobSASSignatureValues.protocol ? blobSASSignatureValues.protocol : "",
    blobSASSignatureValues.version,
    resource,
    timestamp,
    blobSASSignatureValues.encryptionScope,
    formatRequestHeadersForSasSigning(blobSASSignatureValues.requestHeaders),
    formatRequestQueryParametersForSasSigning(blobSASSignatureValues.requestQueryParameters),
    blobSASSignatureValues.cacheControl,
    blobSASSignatureValues.contentDisposition,
    blobSASSignatureValues.contentEncoding,
    blobSASSignatureValues.contentLanguage,
    blobSASSignatureValues.contentType
  ].join("\n");
  const signature = userDelegationKeyCredential.computeHMACSHA256(stringToSign);
  return {
    sasQueryParameters: new import_SASQueryParameters.SASQueryParameters(
      blobSASSignatureValues.version,
      signature,
      verifiedPermissions,
      void 0,
      void 0,
      blobSASSignatureValues.protocol,
      blobSASSignatureValues.startsOn,
      blobSASSignatureValues.expiresOn,
      blobSASSignatureValues.ipRange,
      blobSASSignatureValues.identifier,
      resource,
      blobSASSignatureValues.cacheControl,
      blobSASSignatureValues.contentDisposition,
      blobSASSignatureValues.contentEncoding,
      blobSASSignatureValues.contentLanguage,
      blobSASSignatureValues.contentType,
      userDelegationKeyCredential.userDelegationKey,
      blobSASSignatureValues.preauthorizedAgentObjectId,
      blobSASSignatureValues.correlationId,
      blobSASSignatureValues.encryptionScope,
      blobSASSignatureValues.delegatedUserObjectId,
      getKeysOfRequestHeaders(blobSASSignatureValues.requestHeaders),
      getKeysOfRequestHeaders(blobSASSignatureValues.requestQueryParameters),
      directoryDepth
    ),
    stringToSign
  };
}
function formatRequestHeadersForSasSigning(requestHeaders) {
  if (requestHeaders === void 0) {
    return void 0;
  }
  let canonicalValue = "";
  Object.keys(requestHeaders).forEach(function(key) {
    canonicalValue = canonicalValue + key + ":" + requestHeaders[key] + "\n";
  });
  return canonicalValue;
}
function formatRequestQueryParametersForSasSigning(queryParameters) {
  if (queryParameters === void 0) {
    return void 0;
  }
  let canonicalValue = "";
  Object.keys(queryParameters).forEach(function(key) {
    canonicalValue = canonicalValue + "\n" + key + ":" + queryParameters[key];
  });
  return canonicalValue;
}
function getKeysOfRequestHeaders(requestHeaders) {
  if (requestHeaders === void 0) {
    return void 0;
  }
  let requestKeys = "";
  let index = 0;
  Object.keys(requestHeaders).forEach(function(key) {
    if (index !== 0) {
      requestKeys = requestKeys + ",";
    }
    requestKeys = requestKeys + key;
    ++index;
  });
  return requestKeys;
}
function getCanonicalName(accountName, containerName, blobName) {
  const elements = [`/blob/${accountName}/${containerName}`];
  if (blobName) {
    elements.push(`/${blobName}`);
  }
  return elements.join("");
}
function SASSignatureValuesSanityCheckAndAutofill(blobSASSignatureValues) {
  const version = blobSASSignatureValues.version ? blobSASSignatureValues.version : import_constants.SERVICE_VERSION;
  if (blobSASSignatureValues.snapshotTime && version < "2018-11-09") {
    throw RangeError("'version' must be >= '2018-11-09' when providing 'snapshotTime'.");
  }
  if (blobSASSignatureValues.blobName === void 0 && blobSASSignatureValues.snapshotTime) {
    throw RangeError("Must provide 'blobName' when providing 'snapshotTime'.");
  }
  if (blobSASSignatureValues.versionId && version < "2019-10-10") {
    throw RangeError("'version' must be >= '2019-10-10' when providing 'versionId'.");
  }
  if (blobSASSignatureValues.blobName === void 0 && blobSASSignatureValues.versionId) {
    throw RangeError("Must provide 'blobName' when providing 'versionId'.");
  }
  if (blobSASSignatureValues.permissions && blobSASSignatureValues.permissions.setImmutabilityPolicy && version < "2020-08-04") {
    throw RangeError("'version' must be >= '2020-08-04' when provided 'i' permission.");
  }
  if (blobSASSignatureValues.permissions && blobSASSignatureValues.permissions.deleteVersion && version < "2019-10-10") {
    throw RangeError("'version' must be >= '2019-10-10' when providing 'x' permission.");
  }
  if (blobSASSignatureValues.permissions && blobSASSignatureValues.permissions.permanentDelete && version < "2019-10-10") {
    throw RangeError("'version' must be >= '2019-10-10' when providing 'y' permission.");
  }
  if (blobSASSignatureValues.permissions && blobSASSignatureValues.permissions.tag && version < "2019-12-12") {
    throw RangeError("'version' must be >= '2019-12-12' when providing 't' permission.");
  }
  if (version < "2020-02-10" && blobSASSignatureValues.permissions && (blobSASSignatureValues.permissions.move || blobSASSignatureValues.permissions.execute)) {
    throw RangeError("'version' must be >= '2020-02-10' when providing the 'm' or 'e' permission.");
  }
  if (version < "2021-04-10" && blobSASSignatureValues.permissions && blobSASSignatureValues.permissions.filterByTags) {
    throw RangeError("'version' must be >= '2021-04-10' when providing the 'f' permission.");
  }
  if (version < "2020-02-10" && (blobSASSignatureValues.preauthorizedAgentObjectId || blobSASSignatureValues.correlationId)) {
    throw RangeError(
      "'version' must be >= '2020-02-10' when providing 'preauthorizedAgentObjectId' or 'correlationId'."
    );
  }
  if (blobSASSignatureValues.encryptionScope && version < "2020-12-06") {
    throw RangeError("'version' must be >= '2020-12-06' when provided 'encryptionScope' in SAS.");
  }
  blobSASSignatureValues.version = version;
  return blobSASSignatureValues;
}
function trimBlobName(blobName) {
  let internalName = blobName;
  while (internalName.startsWith("/")) {
    internalName = internalName.substring(1);
  }
  while (internalName.endsWith("/")) {
    internalName = internalName.substring(0, internalName.length - 1);
  }
  return internalName;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateBlobSASQueryParameters,
  generateBlobSASQueryParametersInternal
});
//# sourceMappingURL=BlobSASSignatureValues.js.map
