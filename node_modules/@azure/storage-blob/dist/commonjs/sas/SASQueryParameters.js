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
var SASQueryParameters_exports = {};
__export(SASQueryParameters_exports, {
  SASProtocol: () => SASProtocol,
  SASQueryParameters: () => SASQueryParameters
});
module.exports = __toCommonJS(SASQueryParameters_exports);
var import_SasIPRange = require("./SasIPRange.js");
var import_utils_common = require("../utils/utils.common.js");
var SASProtocol = /* @__PURE__ */ ((SASProtocol2) => {
  SASProtocol2["Https"] = "https";
  SASProtocol2["HttpsAndHttp"] = "https,http";
  return SASProtocol2;
})(SASProtocol || {});
class SASQueryParameters {
  /**
   * The storage API version.
   */
  version;
  /**
   * Optional. The allowed HTTP protocol(s).
   */
  protocol;
  /**
   * Optional. The start time for this SAS token.
   */
  startsOn;
  /**
   * Optional only when identifier is provided. The expiry time for this SAS token.
   */
  expiresOn;
  /**
   * Optional only when identifier is provided.
   * Please refer to {@link AccountSASPermissions}, {@link BlobSASPermissions}, or {@link ContainerSASPermissions} for
   * more details.
   */
  permissions;
  /**
   * Optional. The storage services being accessed (only for Account SAS). Please refer to {@link AccountSASServices}
   * for more details.
   */
  services;
  /**
   * Optional. The storage resource types being accessed (only for Account SAS). Please refer to
   * {@link AccountSASResourceTypes} for more details.
   */
  resourceTypes;
  /**
   * Optional. The signed identifier (only for {@link BlobSASSignatureValues}).
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/establishing-a-stored-access-policy
   */
  identifier;
  /**
   * Optional. Beginning in version 2025-07-05, this value specifies the Entra ID of the user would is authorized to
   * use the resulting SAS URL.  The resulting SAS URL must be used in conjunction with an Entra ID token that has been
   * issued to the user specified in this value.
   */
  delegatedUserObjectId;
  /**
   * Optional. Encryption scope to use when sending requests authorized with this SAS URI.
   */
  encryptionScope;
  /**
   * Optional. Specifies which resources are accessible via the SAS (only for {@link BlobSASSignatureValues}).
   * @see https://learn.microsoft.com/rest/api/storageservices/create-service-sas#specifying-the-signed-resource-blob-service-only
   */
  resource;
  /**
   * The signature for the SAS token.
   */
  signature;
  /**
   * Value for cache-control header in Blob/File Service SAS.
   */
  cacheControl;
  /**
   * Value for content-disposition header in Blob/File Service SAS.
   */
  contentDisposition;
  /**
   * Value for content-encoding header in Blob/File Service SAS.
   */
  contentEncoding;
  /**
   * Value for content-length header in Blob/File Service SAS.
   */
  contentLanguage;
  /**
   * Value for content-type header in Blob/File Service SAS.
   */
  contentType;
  /**
   * Inner value of getter ipRange.
   */
  ipRangeInner;
  /**
   * The Azure Active Directory object ID in GUID format.
   * Property of user delegation key.
   */
  signedOid;
  /**
   * The Azure Active Directory tenant ID in GUID format.
   * Property of user delegation key.
   */
  signedTenantId;
  /**
   * The date-time the key is active.
   * Property of user delegation key.
   */
  signedStartsOn;
  /**
   * The date-time the key expires.
   * Property of user delegation key.
   */
  signedExpiresOn;
  /**
   * Abbreviation of the Azure Storage service that accepts the user delegation key.
   * Property of user delegation key.
   */
  signedService;
  /**
   * The service version that created the user delegation key.
   * Property of user delegation key.
   */
  signedVersion;
  /**
   * The delegated user tenant id in Azure AD.
   * Property of user delegation key.
   */
  signedDelegatedUserTid;
  /**
   * Authorized AAD Object ID in GUID format. The AAD Object ID of a user authorized by the owner of the User Delegation Key
   * to perform the action granted by the SAS. The Azure Storage service will ensure that the owner of the user delegation key
   * has the required permissions before granting access but no additional permission check for the user specified in
   * this value will be performed. This is only used for User Delegation SAS.
   */
  preauthorizedAgentObjectId;
  /**
   * A GUID value that will be logged in the storage diagnostic logs and can be used to correlate SAS generation with storage resource access.
   * This is only used for User Delegation SAS.
   */
  correlationId;
  /**
   * Keys for request headers required in the SAS token
   */
  requestHeaderKeys;
  /**
   * Keys for request query parameters required in the SAS token
   */
  requestQueryParameterKeys;
  /** To indicate the depth of the virtual blob directory specified
   * in the canonicalizedresource field of the string-to-sign.
   */
  directoryDepth;
  /**
   * Optional. IP range allowed for this SAS.
   *
   * @readonly
   */
  get ipRange() {
    if (this.ipRangeInner) {
      return {
        end: this.ipRangeInner.end,
        start: this.ipRangeInner.start
      };
    }
    return void 0;
  }
  constructor(version, signature, permissionsOrOptions, services, resourceTypes, protocol, startsOn, expiresOn, ipRange, identifier, resource, cacheControl, contentDisposition, contentEncoding, contentLanguage, contentType, userDelegationKey, preauthorizedAgentObjectId, correlationId, encryptionScope, delegatedUserObjectId, requestHeaderKeys, requestQueryParameterKeys, directoryDepth) {
    this.version = version;
    this.signature = signature;
    if (permissionsOrOptions !== void 0 && typeof permissionsOrOptions !== "string") {
      this.permissions = permissionsOrOptions.permissions;
      this.services = permissionsOrOptions.services;
      this.resourceTypes = permissionsOrOptions.resourceTypes;
      this.protocol = permissionsOrOptions.protocol;
      this.startsOn = permissionsOrOptions.startsOn;
      this.expiresOn = permissionsOrOptions.expiresOn;
      this.ipRangeInner = permissionsOrOptions.ipRange;
      this.identifier = permissionsOrOptions.identifier;
      this.delegatedUserObjectId = permissionsOrOptions.delegatedUserObjectId;
      this.encryptionScope = permissionsOrOptions.encryptionScope;
      this.resource = permissionsOrOptions.resource;
      this.cacheControl = permissionsOrOptions.cacheControl;
      this.contentDisposition = permissionsOrOptions.contentDisposition;
      this.contentEncoding = permissionsOrOptions.contentEncoding;
      this.contentLanguage = permissionsOrOptions.contentLanguage;
      this.contentType = permissionsOrOptions.contentType;
      this.requestHeaderKeys = permissionsOrOptions.requestHeaderKeys;
      this.requestQueryParameterKeys = permissionsOrOptions.requestQueryParameterKeys;
      this.directoryDepth = permissionsOrOptions.directoryDepth;
      if (permissionsOrOptions.userDelegationKey) {
        this.signedOid = permissionsOrOptions.userDelegationKey.signedObjectId;
        this.signedTenantId = permissionsOrOptions.userDelegationKey.signedTenantId;
        this.signedStartsOn = permissionsOrOptions.userDelegationKey.signedStartsOn;
        this.signedExpiresOn = permissionsOrOptions.userDelegationKey.signedExpiresOn;
        this.signedService = permissionsOrOptions.userDelegationKey.signedService;
        this.signedVersion = permissionsOrOptions.userDelegationKey.signedVersion;
        this.signedDelegatedUserTid = permissionsOrOptions.userDelegationKey.signedDelegatedUserTenantId;
        this.preauthorizedAgentObjectId = permissionsOrOptions.preauthorizedAgentObjectId;
        this.correlationId = permissionsOrOptions.correlationId;
      }
    } else {
      this.services = services;
      this.resourceTypes = resourceTypes;
      this.expiresOn = expiresOn;
      this.permissions = permissionsOrOptions;
      this.protocol = protocol;
      this.startsOn = startsOn;
      this.ipRangeInner = ipRange;
      this.delegatedUserObjectId = delegatedUserObjectId;
      this.encryptionScope = encryptionScope;
      this.identifier = identifier;
      this.resource = resource;
      this.cacheControl = cacheControl;
      this.contentDisposition = contentDisposition;
      this.contentEncoding = contentEncoding;
      this.contentLanguage = contentLanguage;
      this.contentType = contentType;
      this.requestHeaderKeys = requestHeaderKeys;
      this.requestQueryParameterKeys = requestQueryParameterKeys;
      this.directoryDepth = directoryDepth;
      if (userDelegationKey) {
        this.signedOid = userDelegationKey.signedObjectId;
        this.signedTenantId = userDelegationKey.signedTenantId;
        this.signedStartsOn = userDelegationKey.signedStartsOn;
        this.signedExpiresOn = userDelegationKey.signedExpiresOn;
        this.signedService = userDelegationKey.signedService;
        this.signedVersion = userDelegationKey.signedVersion;
        this.signedDelegatedUserTid = userDelegationKey.signedDelegatedUserTenantId;
        this.preauthorizedAgentObjectId = preauthorizedAgentObjectId;
        this.correlationId = correlationId;
      }
    }
  }
  /**
   * Encodes all SAS query parameters into a string that can be appended to a URL.
   *
   */
  toString() {
    const params = [
      "sv",
      "ss",
      "srt",
      "spr",
      "st",
      "se",
      "sip",
      "si",
      "ses",
      "skoid",
      // Signed object ID
      "sktid",
      // Signed tenant ID
      "skt",
      // Signed key start time
      "ske",
      // Signed key expiry time
      "sks",
      // Signed key service
      "skv",
      // Signed key version
      "sr",
      "sp",
      "rscc",
      "rscd",
      "rsce",
      "rscl",
      "rsct",
      "saoid",
      "scid",
      "sdd",
      "sduoid",
      // Signed key user delegation object ID
      "skdutid",
      // Signed key user delegation tenant ID
      "srh",
      // Request Headers
      "srq",
      // Request QueryParameters
      "sig"
    ];
    const queries = [];
    for (const param of params) {
      switch (param) {
        case "sv":
          this.tryAppendQueryParameter(queries, param, this.version);
          break;
        case "ss":
          this.tryAppendQueryParameter(queries, param, this.services);
          break;
        case "srt":
          this.tryAppendQueryParameter(queries, param, this.resourceTypes);
          break;
        case "spr":
          this.tryAppendQueryParameter(queries, param, this.protocol);
          break;
        case "st":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.startsOn ? (0, import_utils_common.truncatedISO8061Date)(this.startsOn, false) : void 0
          );
          break;
        case "se":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.expiresOn ? (0, import_utils_common.truncatedISO8061Date)(this.expiresOn, false) : void 0
          );
          break;
        case "sip":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.ipRange ? (0, import_SasIPRange.ipRangeToString)(this.ipRange) : void 0
          );
          break;
        case "si":
          this.tryAppendQueryParameter(queries, param, this.identifier);
          break;
        case "ses":
          this.tryAppendQueryParameter(queries, param, this.encryptionScope);
          break;
        case "skoid":
          this.tryAppendQueryParameter(queries, param, this.signedOid);
          break;
        case "sktid":
          this.tryAppendQueryParameter(queries, param, this.signedTenantId);
          break;
        case "skt":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.signedStartsOn ? (0, import_utils_common.truncatedISO8061Date)(this.signedStartsOn, false) : void 0
          );
          break;
        case "ske":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.signedExpiresOn ? (0, import_utils_common.truncatedISO8061Date)(this.signedExpiresOn, false) : void 0
          );
          break;
        case "sks":
          this.tryAppendQueryParameter(queries, param, this.signedService);
          break;
        case "skv":
          this.tryAppendQueryParameter(queries, param, this.signedVersion);
          break;
        case "skdutid":
          this.tryAppendQueryParameter(queries, param, this.signedDelegatedUserTid);
          break;
        case "sr":
          this.tryAppendQueryParameter(queries, param, this.resource);
          break;
        case "sp":
          this.tryAppendQueryParameter(queries, param, this.permissions);
          break;
        case "sig":
          this.tryAppendQueryParameter(queries, param, this.signature);
          break;
        case "rscc":
          this.tryAppendQueryParameter(queries, param, this.cacheControl);
          break;
        case "rscd":
          this.tryAppendQueryParameter(queries, param, this.contentDisposition);
          break;
        case "rsce":
          this.tryAppendQueryParameter(queries, param, this.contentEncoding);
          break;
        case "rscl":
          this.tryAppendQueryParameter(queries, param, this.contentLanguage);
          break;
        case "rsct":
          this.tryAppendQueryParameter(queries, param, this.contentType);
          break;
        case "saoid":
          this.tryAppendQueryParameter(queries, param, this.preauthorizedAgentObjectId);
          break;
        case "scid":
          this.tryAppendQueryParameter(queries, param, this.correlationId);
          break;
        case "sduoid":
          this.tryAppendQueryParameter(queries, param, this.delegatedUserObjectId);
          break;
        case "srh":
          this.tryAppendQueryParameter(queries, param, this.requestHeaderKeys);
          break;
        case "srq":
          this.tryAppendQueryParameter(queries, param, this.requestQueryParameterKeys);
          break;
        case "sdd":
          this.tryAppendQueryParameter(
            queries,
            param,
            this.directoryDepth !== void 0 ? this.directoryDepth.toString() : ""
          );
          break;
      }
    }
    return queries.join("&");
  }
  /**
   * A private helper method used to filter and append query key/value pairs into an array.
   *
   * @param queries -
   * @param key -
   * @param value -
   */
  tryAppendQueryParameter(queries, key, value) {
    if (!value) {
      return;
    }
    key = encodeURIComponent(key);
    value = encodeURIComponent(value);
    if (key.length > 0 && value.length > 0) {
      queries.push(`${key}=${value}`);
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SASProtocol,
  SASQueryParameters
});
//# sourceMappingURL=SASQueryParameters.js.map
