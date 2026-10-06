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
  KnownBlobExpiryOptions: () => KnownBlobExpiryOptions,
  KnownEncryptionAlgorithmType: () => KnownEncryptionAlgorithmType,
  KnownFileShareTokenIntent: () => KnownFileShareTokenIntent,
  KnownStorageErrorCode: () => KnownStorageErrorCode
});
module.exports = __toCommonJS(models_exports);
var KnownEncryptionAlgorithmType = /* @__PURE__ */ ((KnownEncryptionAlgorithmType2) => {
  KnownEncryptionAlgorithmType2["AES256"] = "AES256";
  return KnownEncryptionAlgorithmType2;
})(KnownEncryptionAlgorithmType || {});
var KnownFileShareTokenIntent = /* @__PURE__ */ ((KnownFileShareTokenIntent2) => {
  KnownFileShareTokenIntent2["Backup"] = "backup";
  return KnownFileShareTokenIntent2;
})(KnownFileShareTokenIntent || {});
var KnownBlobExpiryOptions = /* @__PURE__ */ ((KnownBlobExpiryOptions2) => {
  KnownBlobExpiryOptions2["NeverExpire"] = "NeverExpire";
  KnownBlobExpiryOptions2["RelativeToCreation"] = "RelativeToCreation";
  KnownBlobExpiryOptions2["RelativeToNow"] = "RelativeToNow";
  KnownBlobExpiryOptions2["Absolute"] = "Absolute";
  return KnownBlobExpiryOptions2;
})(KnownBlobExpiryOptions || {});
var KnownStorageErrorCode = /* @__PURE__ */ ((KnownStorageErrorCode2) => {
  KnownStorageErrorCode2["AccountAlreadyExists"] = "AccountAlreadyExists";
  KnownStorageErrorCode2["AccountBeingCreated"] = "AccountBeingCreated";
  KnownStorageErrorCode2["AccountIsDisabled"] = "AccountIsDisabled";
  KnownStorageErrorCode2["AuthenticationFailed"] = "AuthenticationFailed";
  KnownStorageErrorCode2["AuthorizationFailure"] = "AuthorizationFailure";
  KnownStorageErrorCode2["ConditionHeadersNotSupported"] = "ConditionHeadersNotSupported";
  KnownStorageErrorCode2["ConditionNotMet"] = "ConditionNotMet";
  KnownStorageErrorCode2["EmptyMetadataKey"] = "EmptyMetadataKey";
  KnownStorageErrorCode2["InsufficientAccountPermissions"] = "InsufficientAccountPermissions";
  KnownStorageErrorCode2["InternalError"] = "InternalError";
  KnownStorageErrorCode2["InvalidAuthenticationInfo"] = "InvalidAuthenticationInfo";
  KnownStorageErrorCode2["InvalidHeaderValue"] = "InvalidHeaderValue";
  KnownStorageErrorCode2["InvalidHttpVerb"] = "InvalidHttpVerb";
  KnownStorageErrorCode2["InvalidInput"] = "InvalidInput";
  KnownStorageErrorCode2["InvalidMd5"] = "InvalidMd5";
  KnownStorageErrorCode2["InvalidMetadata"] = "InvalidMetadata";
  KnownStorageErrorCode2["InvalidQueryParameterValue"] = "InvalidQueryParameterValue";
  KnownStorageErrorCode2["InvalidRange"] = "InvalidRange";
  KnownStorageErrorCode2["InvalidResourceName"] = "InvalidResourceName";
  KnownStorageErrorCode2["InvalidUri"] = "InvalidUri";
  KnownStorageErrorCode2["InvalidXmlDocument"] = "InvalidXmlDocument";
  KnownStorageErrorCode2["InvalidXmlNodeValue"] = "InvalidXmlNodeValue";
  KnownStorageErrorCode2["Md5Mismatch"] = "Md5Mismatch";
  KnownStorageErrorCode2["MetadataTooLarge"] = "MetadataTooLarge";
  KnownStorageErrorCode2["MissingContentLengthHeader"] = "MissingContentLengthHeader";
  KnownStorageErrorCode2["MissingRequiredQueryParameter"] = "MissingRequiredQueryParameter";
  KnownStorageErrorCode2["MissingRequiredHeader"] = "MissingRequiredHeader";
  KnownStorageErrorCode2["MissingRequiredXmlNode"] = "MissingRequiredXmlNode";
  KnownStorageErrorCode2["MultipleConditionHeadersNotSupported"] = "MultipleConditionHeadersNotSupported";
  KnownStorageErrorCode2["OperationTimedOut"] = "OperationTimedOut";
  KnownStorageErrorCode2["OutOfRangeInput"] = "OutOfRangeInput";
  KnownStorageErrorCode2["OutOfRangeQueryParameterValue"] = "OutOfRangeQueryParameterValue";
  KnownStorageErrorCode2["RequestBodyTooLarge"] = "RequestBodyTooLarge";
  KnownStorageErrorCode2["ResourceTypeMismatch"] = "ResourceTypeMismatch";
  KnownStorageErrorCode2["RequestUrlFailedToParse"] = "RequestUrlFailedToParse";
  KnownStorageErrorCode2["ResourceAlreadyExists"] = "ResourceAlreadyExists";
  KnownStorageErrorCode2["ResourceNotFound"] = "ResourceNotFound";
  KnownStorageErrorCode2["ServerBusy"] = "ServerBusy";
  KnownStorageErrorCode2["UnsupportedHeader"] = "UnsupportedHeader";
  KnownStorageErrorCode2["UnsupportedXmlNode"] = "UnsupportedXmlNode";
  KnownStorageErrorCode2["UnsupportedQueryParameter"] = "UnsupportedQueryParameter";
  KnownStorageErrorCode2["UnsupportedHttpVerb"] = "UnsupportedHttpVerb";
  KnownStorageErrorCode2["AppendPositionConditionNotMet"] = "AppendPositionConditionNotMet";
  KnownStorageErrorCode2["BlobAlreadyExists"] = "BlobAlreadyExists";
  KnownStorageErrorCode2["BlobImmutableDueToPolicy"] = "BlobImmutableDueToPolicy";
  KnownStorageErrorCode2["BlobNotFound"] = "BlobNotFound";
  KnownStorageErrorCode2["BlobOverwritten"] = "BlobOverwritten";
  KnownStorageErrorCode2["BlobTierInadequateForContentLength"] = "BlobTierInadequateForContentLength";
  KnownStorageErrorCode2["BlobUsesCustomerSpecifiedEncryption"] = "BlobUsesCustomerSpecifiedEncryption";
  KnownStorageErrorCode2["BlockCountExceedsLimit"] = "BlockCountExceedsLimit";
  KnownStorageErrorCode2["BlockListTooLong"] = "BlockListTooLong";
  KnownStorageErrorCode2["CannotChangeToLowerTier"] = "CannotChangeToLowerTier";
  KnownStorageErrorCode2["CannotVerifyCopySource"] = "CannotVerifyCopySource";
  KnownStorageErrorCode2["ContainerAlreadyExists"] = "ContainerAlreadyExists";
  KnownStorageErrorCode2["ContainerBeingDeleted"] = "ContainerBeingDeleted";
  KnownStorageErrorCode2["ContainerDisabled"] = "ContainerDisabled";
  KnownStorageErrorCode2["ContainerNotFound"] = "ContainerNotFound";
  KnownStorageErrorCode2["ContentLengthLargerThanTierLimit"] = "ContentLengthLargerThanTierLimit";
  KnownStorageErrorCode2["CopyAcrossAccountsNotSupported"] = "CopyAcrossAccountsNotSupported";
  KnownStorageErrorCode2["CopyIdMismatch"] = "CopyIdMismatch";
  KnownStorageErrorCode2["FeatureVersionMismatch"] = "FeatureVersionMismatch";
  KnownStorageErrorCode2["IncrementalCopyBlobMismatch"] = "IncrementalCopyBlobMismatch";
  KnownStorageErrorCode2["IncrementalCopyOfEarlierSnapshotNotAllowed"] = "IncrementalCopyOfEarlierSnapshotNotAllowed";
  KnownStorageErrorCode2["IncrementalCopySourceMustBeSnapshot"] = "IncrementalCopySourceMustBeSnapshot";
  KnownStorageErrorCode2["InfiniteLeaseDurationRequired"] = "InfiniteLeaseDurationRequired";
  KnownStorageErrorCode2["InvalidBlobOrBlock"] = "InvalidBlobOrBlock";
  KnownStorageErrorCode2["InvalidBlobTier"] = "InvalidBlobTier";
  KnownStorageErrorCode2["InvalidBlobType"] = "InvalidBlobType";
  KnownStorageErrorCode2["InvalidBlockId"] = "InvalidBlockId";
  KnownStorageErrorCode2["InvalidBlockList"] = "InvalidBlockList";
  KnownStorageErrorCode2["InvalidOperation"] = "InvalidOperation";
  KnownStorageErrorCode2["InvalidPageRange"] = "InvalidPageRange";
  KnownStorageErrorCode2["InvalidSourceBlobType"] = "InvalidSourceBlobType";
  KnownStorageErrorCode2["InvalidSourceBlobUrl"] = "InvalidSourceBlobUrl";
  KnownStorageErrorCode2["InvalidVersionForPageBlobOperation"] = "InvalidVersionForPageBlobOperation";
  KnownStorageErrorCode2["LeaseAlreadyPresent"] = "LeaseAlreadyPresent";
  KnownStorageErrorCode2["LeaseAlreadyBroken"] = "LeaseAlreadyBroken";
  KnownStorageErrorCode2["LeaseIdMismatchWithBlobOperation"] = "LeaseIdMismatchWithBlobOperation";
  KnownStorageErrorCode2["LeaseIdMismatchWithContainerOperation"] = "LeaseIdMismatchWithContainerOperation";
  KnownStorageErrorCode2["LeaseIdMismatchWithLeaseOperation"] = "LeaseIdMismatchWithLeaseOperation";
  KnownStorageErrorCode2["LeaseIdMissing"] = "LeaseIdMissing";
  KnownStorageErrorCode2["LeaseIsBreakingAndCannotBeAcquired"] = "LeaseIsBreakingAndCannotBeAcquired";
  KnownStorageErrorCode2["LeaseIsBreakingAndCannotBeChanged"] = "LeaseIsBreakingAndCannotBeChanged";
  KnownStorageErrorCode2["LeaseIsBrokenAndCannotBeRenewed"] = "LeaseIsBrokenAndCannotBeRenewed";
  KnownStorageErrorCode2["LeaseLost"] = "LeaseLost";
  KnownStorageErrorCode2["LeaseNotPresentWithBlobOperation"] = "LeaseNotPresentWithBlobOperation";
  KnownStorageErrorCode2["LeaseNotPresentWithContainerOperation"] = "LeaseNotPresentWithContainerOperation";
  KnownStorageErrorCode2["LeaseNotPresentWithLeaseOperation"] = "LeaseNotPresentWithLeaseOperation";
  KnownStorageErrorCode2["MaxBlobSizeConditionNotMet"] = "MaxBlobSizeConditionNotMet";
  KnownStorageErrorCode2["NoAuthenticationInformation"] = "NoAuthenticationInformation";
  KnownStorageErrorCode2["NoPendingCopyOperation"] = "NoPendingCopyOperation";
  KnownStorageErrorCode2["OperationNotAllowedOnIncrementalCopyBlob"] = "OperationNotAllowedOnIncrementalCopyBlob";
  KnownStorageErrorCode2["PendingCopyOperation"] = "PendingCopyOperation";
  KnownStorageErrorCode2["PreviousSnapshotCannotBeNewer"] = "PreviousSnapshotCannotBeNewer";
  KnownStorageErrorCode2["PreviousSnapshotNotFound"] = "PreviousSnapshotNotFound";
  KnownStorageErrorCode2["PreviousSnapshotOperationNotSupported"] = "PreviousSnapshotOperationNotSupported";
  KnownStorageErrorCode2["SequenceNumberConditionNotMet"] = "SequenceNumberConditionNotMet";
  KnownStorageErrorCode2["SequenceNumberIncrementTooLarge"] = "SequenceNumberIncrementTooLarge";
  KnownStorageErrorCode2["SnapshotCountExceeded"] = "SnapshotCountExceeded";
  KnownStorageErrorCode2["SnapshotOperationRateExceeded"] = "SnapshotOperationRateExceeded";
  KnownStorageErrorCode2["SnapshotsPresent"] = "SnapshotsPresent";
  KnownStorageErrorCode2["SourceConditionNotMet"] = "SourceConditionNotMet";
  KnownStorageErrorCode2["SystemInUse"] = "SystemInUse";
  KnownStorageErrorCode2["TargetConditionNotMet"] = "TargetConditionNotMet";
  KnownStorageErrorCode2["UnauthorizedBlobOverwrite"] = "UnauthorizedBlobOverwrite";
  KnownStorageErrorCode2["BlobBeingRehydrated"] = "BlobBeingRehydrated";
  KnownStorageErrorCode2["BlobArchived"] = "BlobArchived";
  KnownStorageErrorCode2["BlobNotArchived"] = "BlobNotArchived";
  KnownStorageErrorCode2["AuthorizationSourceIPMismatch"] = "AuthorizationSourceIPMismatch";
  KnownStorageErrorCode2["AuthorizationProtocolMismatch"] = "AuthorizationProtocolMismatch";
  KnownStorageErrorCode2["AuthorizationPermissionMismatch"] = "AuthorizationPermissionMismatch";
  KnownStorageErrorCode2["AuthorizationServiceMismatch"] = "AuthorizationServiceMismatch";
  KnownStorageErrorCode2["AuthorizationResourceTypeMismatch"] = "AuthorizationResourceTypeMismatch";
  KnownStorageErrorCode2["BlobAccessTierNotSupportedForAccountType"] = "BlobAccessTierNotSupportedForAccountType";
  return KnownStorageErrorCode2;
})(KnownStorageErrorCode || {});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  KnownBlobExpiryOptions,
  KnownEncryptionAlgorithmType,
  KnownFileShareTokenIntent,
  KnownStorageErrorCode
});
//# sourceMappingURL=index.js.map
