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
var Clients_exports = {};
__export(Clients_exports, {
  AppendBlobClient: () => AppendBlobClient,
  BlobClient: () => BlobClient,
  BlockBlobClient: () => BlockBlobClient,
  PageBlobClient: () => PageBlobClient
});
module.exports = __toCommonJS(Clients_exports);
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_core_auth = require("@azure/core-auth");
var import_core_util = require("@azure/core-util");
var import_core_util2 = require("@azure/core-util");
var import_BlobDownloadResponse = require("./BlobDownloadResponse.js");
var import_BlobQueryResponse = require("./BlobQueryResponse.js");
var import_storage_common = require("@azure/storage-common");
var import_models = require("./models.js");
var import_PageBlobRangeResponse = require("./PageBlobRangeResponse.js");
var import_Pipeline = require("./Pipeline.js");
var import_BlobStartCopyFromUrlPoller = require("./pollers/BlobStartCopyFromUrlPoller.js");
var import_Range = require("./Range.js");
var import_StorageClient = require("./StorageClient.js");
var import_Batch = require("./utils/Batch.js");
var import_storage_common2 = require("@azure/storage-common");
var import_constants = require("./utils/constants.js");
var import_tracing = require("./utils/tracing.js");
var import_utils_common = require("./utils/utils.common.js");
var import_utils = require("./utils/utils.js");
var import_BlobSASSignatureValues = require("./sas/BlobSASSignatureValues.js");
var import_BlobLeaseClient = require("./BlobLeaseClient.js");
class BlobClient extends import_StorageClient.StorageClient {
  /**
   * blobContext provided by protocol layer.
   */
  blobContext;
  _name;
  _containerName;
  _versionId;
  _snapshot;
  /**
   * Config used in creating blob client instances.
   */
  blobClientConfig;
  /**
   * The name of the blob.
   */
  get name() {
    return this._name;
  }
  /**
   * The name of the storage container the blob is associated with.
   */
  get containerName() {
    return this._containerName;
  }
  constructor(urlOrConnectionString, credentialOrPipelineOrContainerName, blobNameOrOptions, options) {
    options = options || {};
    let pipeline;
    let url;
    if ((0, import_Pipeline.isPipelineLike)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      pipeline = credentialOrPipelineOrContainerName;
      options = blobNameOrOptions;
    } else if (import_core_util.isNodeLike && credentialOrPipelineOrContainerName instanceof import_storage_common.StorageSharedKeyCredential || credentialOrPipelineOrContainerName instanceof import_storage_common.AnonymousCredential || (0, import_core_auth.isTokenCredential)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      options = blobNameOrOptions;
      pipeline = (0, import_Pipeline.newPipeline)(credentialOrPipelineOrContainerName, options);
    } else if (!credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName !== "string") {
      url = urlOrConnectionString;
      if (blobNameOrOptions && typeof blobNameOrOptions !== "string") {
        options = blobNameOrOptions;
      }
      pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
    } else if (credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName === "string" && blobNameOrOptions && typeof blobNameOrOptions === "string") {
      const containerName = credentialOrPipelineOrContainerName;
      const blobName = blobNameOrOptions;
      const extractedCreds = (0, import_utils_common.extractConnectionStringParts)(urlOrConnectionString);
      if (extractedCreds.kind === "AccountConnString") {
        if (import_core_util.isNodeLike) {
          const sharedKeyCredential = new import_storage_common.StorageSharedKeyCredential(
            extractedCreds.accountName,
            extractedCreds.accountKey
          );
          url = (0, import_utils_common.appendToURLPath)(
            (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
            encodeURIComponent(blobName)
          );
          if (!options.proxyOptions) {
            options.proxyOptions = (0, import_core_rest_pipeline.getDefaultProxySettings)(extractedCreds.proxyUri);
          }
          pipeline = (0, import_Pipeline.newPipeline)(sharedKeyCredential, options);
        } else {
          throw new Error("Account connection string is only supported in Node.js environment");
        }
      } else if (extractedCreds.kind === "SASConnString") {
        url = (0, import_utils_common.appendToURLPath)(
          (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
          encodeURIComponent(blobName)
        ) + "?" + extractedCreds.accountSas;
        pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
      } else {
        throw new Error(
          "Connection string must be either an Account connection string or a SAS connection string"
        );
      }
    } else {
      throw new Error("Expecting non-empty strings for containerName and blobName parameters");
    }
    super(url, pipeline);
    ({ blobName: this._name, containerName: this._containerName } = this.getBlobAndContainerNamesFromUrl());
    this.blobContext = this.storageClientContext.blob;
    this._snapshot = (0, import_utils_common.getURLParameter)(this.url, import_constants.URLConstants.Parameters.SNAPSHOT);
    this._versionId = (0, import_utils_common.getURLParameter)(this.url, import_constants.URLConstants.Parameters.VERSIONID);
    this.blobClientConfig = options;
  }
  /**
   * Creates a new BlobClient object identical to the source but with the specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a Client to the base blob.
   *
   * @param snapshot - The snapshot timestamp.
   * @returns A new BlobClient object identical to the source but with the specified snapshot timestamp
   */
  withSnapshot(snapshot) {
    return new BlobClient(
      (0, import_utils_common.setURLParameter)(
        this.url,
        import_constants.URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? void 0 : snapshot
      ),
      this.pipeline,
      this.blobClientConfig
    );
  }
  /**
   * Creates a new BlobClient object pointing to a version of this blob.
   * Provide "" will remove the versionId and return a Client to the base blob.
   *
   * @param versionId - The versionId.
   * @returns A new BlobClient object pointing to the version of this blob.
   */
  withVersion(versionId) {
    return new BlobClient(
      (0, import_utils_common.setURLParameter)(
        this.url,
        import_constants.URLConstants.Parameters.VERSIONID,
        versionId.length === 0 ? void 0 : versionId
      ),
      this.pipeline,
      this.blobClientConfig
    );
  }
  /**
   * Creates a AppendBlobClient object.
   *
   */
  getAppendBlobClient() {
    return new AppendBlobClient(this.url, this.pipeline, this.blobClientConfig);
  }
  /**
   * Creates a BlockBlobClient object.
   *
   */
  getBlockBlobClient() {
    return new BlockBlobClient(this.url, this.pipeline, this.blobClientConfig);
  }
  /**
   * Creates a PageBlobClient object.
   *
   */
  getPageBlobClient() {
    return new PageBlobClient(this.url, this.pipeline, this.blobClientConfig);
  }
  /**
   * Reads or downloads a blob from the system, including its metadata and properties.
   * You can also call Get Blob to read a snapshot.
   *
   * * In Node.js, data returns in a Readable stream readableStreamBody
   * * In browsers, data returns in a promise blobBody
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/get-blob
   *
   * @param offset - From which position of the blob to download, greater than or equal to 0
   * @param count - How much data to be downloaded, greater than 0. Will download to the end when undefined
   * @param options - Optional options to Blob Download operation.
   *
   *
   * Example usage (Node.js):
   *
   * ```ts snippet:ReadmeSampleDownloadBlob_Node
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   * import { buffer } from "node:stream/consumers";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const blobClient = containerClient.getBlobClient(blobName);
   *
   * // Get blob content from position 0 to the end
   * // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
   * const downloadBlockBlobResponse = await blobClient.download();
   * if (downloadBlockBlobResponse.readableStreamBody) {
   *   // Download the raw bytes of the blob. Use `text` from "node:stream/consumers"
   *   // instead if you want to read the content as a string directly.
   *   const downloaded = await buffer(downloadBlockBlobResponse.readableStreamBody);
   *   console.log(`Downloaded blob content: ${downloaded.toString()}`);
   * }
   * ```
   *
   * Example usage (browser):
   *
   * ```ts snippet:ReadmeSampleDownloadBlob_Browser
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const blobClient = containerClient.getBlobClient(blobName);
   *
   * // Get blob content from position 0 to the end
   * // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
   * const downloadBlockBlobResponse = await blobClient.download();
   * const blobBody = await downloadBlockBlobResponse.blobBody;
   * if (blobBody) {
   *   const downloaded = await blobBody.text();
   *   console.log(`Downloaded blob content: ${downloaded}`);
   * }
   * ```
   */
  async download(offset = 0, count, options = {}) {
    options.conditions = options.conditions || {};
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("BlobClient-download", options, async (updatedOptions) => {
      let contentChecksumAlgorithm = options.contentChecksumAlgorithm ?? this.blobClientConfig?.downloadContentChecksumAlgorithm;
      if (contentChecksumAlgorithm === void 0) {
        contentChecksumAlgorithm = "Customized";
      } else if (contentChecksumAlgorithm === "Auto") {
        contentChecksumAlgorithm = "StorageCrc64";
      }
      if (contentChecksumAlgorithm === "StorageCrc64") {
        await import_storage_common2.StorageCRC64Calculator.init();
      }
      const res = (0, import_utils_common.assertResponse)(
        await this.blobContext.download({
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          requestOptions: {
            onDownloadProgress: import_core_util.isNodeLike ? void 0 : options.onProgress
            // for Node.js, progress is reported by RetriableReadableStream
          },
          range: offset === 0 && !count ? void 0 : (0, import_Range.rangeToString)({ offset, count }),
          rangeGetContentMD5: options.rangeGetContentMD5,
          rangeGetContentCRC64: options.rangeGetContentCrc64,
          snapshot: options.snapshot,
          cpkInfo: options.customerProvidedKey,
          tracingOptions: updatedOptions.tracingOptions,
          structuredBodyType: contentChecksumAlgorithm === "StorageCrc64" ? "XSM/1.0; properties=crc64" : void 0
        })
      );
      const wrappedRes = {
        ...res,
        _response: res._response,
        // _response is made non-enumerable
        objectReplicationDestinationPolicyId: res.objectReplicationPolicyId,
        objectReplicationSourceProperties: (0, import_utils_common.parseObjectReplicationRecord)(res.objectReplicationRules)
      };
      if (!import_core_util.isNodeLike) {
        if (contentChecksumAlgorithm === "StorageCrc64") {
          wrappedRes.blobBody = (0, import_storage_common2.structuredMessageDecodingBrowser)(await wrappedRes.blobBody);
        }
        return wrappedRes;
      }
      if (options.maxRetryRequests === void 0 || options.maxRetryRequests < 0) {
        options.maxRetryRequests = import_constants.DEFAULT_MAX_DOWNLOAD_RETRY_REQUESTS;
      }
      if (res.contentLength === void 0) {
        throw new RangeError(`File download response doesn't contain valid content length header`);
      }
      if (contentChecksumAlgorithm === "StorageCrc64" && res.structuredContentLength === void 0) {
        throw new RangeError(`Unexpected structured content length`);
      }
      if (!res.etag) {
        throw new RangeError(`File download response doesn't contain valid etag header`);
      }
      const expectedContentLength = contentChecksumAlgorithm === "StorageCrc64" ? res.structuredContentLength : res.contentLength;
      return new import_BlobDownloadResponse.BlobDownloadResponse(
        wrappedRes,
        async (start) => {
          const updatedDownloadOptions = {
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ifMatch: options.conditions.ifMatch || res.etag,
              ifModifiedSince: options.conditions.ifModifiedSince,
              ifNoneMatch: options.conditions.ifNoneMatch,
              ifUnmodifiedSince: options.conditions.ifUnmodifiedSince,
              ifTags: options.conditions?.tagConditions
            },
            range: (0, import_Range.rangeToString)({
              count: offset + expectedContentLength - start,
              offset: start
            }),
            rangeGetContentMD5: options.rangeGetContentMD5,
            rangeGetContentCRC64: options.rangeGetContentCrc64,
            snapshot: options.snapshot,
            cpkInfo: options.customerProvidedKey,
            structuredBodyType: contentChecksumAlgorithm === "StorageCrc64" ? "XSM/1.0; properties=crc64" : void 0
          };
          const resBody = (await this.blobContext.download({
            abortSignal: options.abortSignal,
            ...updatedDownloadOptions
          })).readableStreamBody;
          if (contentChecksumAlgorithm === "StorageCrc64") {
            return (0, import_storage_common.structuredMessageDecodingStream)(resBody, {});
          } else {
            return resBody;
          }
        },
        offset,
        expectedContentLength,
        {
          maxRetryRequests: options.maxRetryRequests,
          onProgress: options.onProgress
        }
      );
    });
  }
  /**
   * Returns true if the Azure blob resource represented by this client exists; false otherwise.
   *
   * NOTE: use this function with care since an existing blob might be deleted by other clients or
   * applications. Vice versa new blobs might be added by other clients or applications after this
   * function completes.
   *
   * @param options - options to Exists operation.
   */
  async exists(options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-exists", options, async (updatedOptions) => {
      try {
        (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
        await this.getProperties({
          abortSignal: options.abortSignal,
          customerProvidedKey: options.customerProvidedKey,
          conditions: options.conditions,
          tracingOptions: updatedOptions.tracingOptions
        });
        return true;
      } catch (e) {
        if (e.statusCode === 404) {
          return false;
        } else if (e.statusCode === 409 && (e.details.errorCode === import_constants.BlobUsesCustomerSpecifiedEncryptionMsg || e.details.errorCode === import_constants.BlobDoesNotUseCustomerSpecifiedEncryption)) {
          return true;
        }
        throw e;
      }
    });
  }
  /**
   * Returns all user-defined metadata, standard HTTP properties, and system properties
   * for the blob. It does not return the content of the blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-blob-properties
   *
   * WARNING: The `metadata` object returned in the response will have its keys in lowercase, even if
   * they originally contained uppercase characters. This differs from the metadata keys returned by
   * the methods of {@link ContainerClient} that list blobs using the `includeMetadata` option, which
   * will retain their original casing.
   *
   * @param options - Optional options to Get Properties operation.
   */
  async getProperties(options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("BlobClient-getProperties", options, async (updatedOptions) => {
      const res = (0, import_utils_common.assertResponse)(
        await this.blobContext.getProperties({
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          cpkInfo: options.customerProvidedKey,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
      return {
        ...res,
        _response: res._response,
        // _response is made non-enumerable
        objectReplicationDestinationPolicyId: res.objectReplicationPolicyId,
        objectReplicationSourceProperties: (0, import_utils_common.parseObjectReplicationRecord)(res.objectReplicationRules)
      };
    });
  }
  /**
   * Marks the specified blob or snapshot for deletion. The blob is later deleted
   * during garbage collection. Note that in order to delete a blob, you must delete
   * all of its snapshots. You can delete both at the same time with the Delete
   * Blob operation.
   * @see https://learn.microsoft.com/rest/api/storageservices/delete-blob
   *
   * @param options - Optional options to Blob Delete operation.
   */
  async delete(options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan("BlobClient-delete", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.delete({
          abortSignal: options.abortSignal,
          deleteSnapshots: options.deleteSnapshots,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          tracingOptions: updatedOptions.tracingOptions,
          accessTierIfModifiedSince: options.conditions?.accessTierIfModifiedSince,
          accessTierIfUnmodifiedSince: options.conditions?.accessTierIfUnmodifiedSince
        })
      );
    });
  }
  /**
   * Marks the specified blob or snapshot for deletion if it exists. The blob is later deleted
   * during garbage collection. Note that in order to delete a blob, you must delete
   * all of its snapshots. You can delete both at the same time with the Delete
   * Blob operation.
   * @see https://learn.microsoft.com/rest/api/storageservices/delete-blob
   *
   * @param options - Optional options to Blob Delete operation.
   */
  async deleteIfExists(options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-deleteIfExists", options, async (updatedOptions) => {
      try {
        const res = (0, import_utils_common.assertResponse)(await this.delete(updatedOptions));
        return {
          succeeded: true,
          ...res,
          _response: res._response
          // _response is made non-enumerable
        };
      } catch (e) {
        if (e.details?.errorCode === "BlobNotFound") {
          return {
            succeeded: false,
            ...e.response?.parsedHeaders,
            _response: e.response
          };
        }
        throw e;
      }
    });
  }
  /**
   * Restores the contents and metadata of soft deleted blob and any associated
   * soft deleted snapshots. Undelete Blob is supported only on version 2017-07-29
   * or later.
   * @see https://learn.microsoft.com/rest/api/storageservices/undelete-blob
   *
   * @param options - Optional options to Blob Undelete operation.
   */
  async undelete(options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-undelete", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.undelete({
          abortSignal: options.abortSignal,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Sets system properties on the blob.
   *
   * If no value provided, or no value provided for the specified blob HTTP headers,
   * these blob HTTP headers without a value will be cleared.
   * @see https://learn.microsoft.com/rest/api/storageservices/set-blob-properties
   *
   * @param blobHTTPHeaders - If no value provided, or no value provided for
   *                                                   the specified blob HTTP headers, these blob HTTP
   *                                                   headers without a value will be cleared.
   *                                                   A common header to set is `blobContentType`
   *                                                   enabling the browser to provide functionality
   *                                                   based on file type.
   * @param options - Optional options to Blob Set HTTP Headers operation.
   */
  async setHTTPHeaders(blobHTTPHeaders, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("BlobClient-setHTTPHeaders", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.setHttpHeaders({
          abortSignal: options.abortSignal,
          blobHttpHeaders: blobHTTPHeaders,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          // cpkInfo: options.customerProvidedKey, // CPK is not included in Swagger, should change this back when this issue is fixed in Swagger.
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Sets user-defined metadata for the specified blob as one or more name-value pairs.
   *
   * If no option provided, or no metadata defined in the parameter, the blob
   * metadata will be removed.
   * @see https://learn.microsoft.com/rest/api/storageservices/set-blob-metadata
   *
   * @param metadata - Replace existing metadata with this value.
   *                               If no value provided the existing metadata will be removed.
   * @param options - Optional options to Set Metadata operation.
   */
  async setMetadata(metadata, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("BlobClient-setMetadata", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.setMetadata({
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          metadata,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          cpkInfo: options.customerProvidedKey,
          encryptionScope: options.encryptionScope,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Sets tags on the underlying blob.
   * A blob can have up to 10 tags. Tag keys must be between 1 and 128 characters.  Tag values must be between 0 and 256 characters.
   * Valid tag key and value characters include lower and upper case letters, digits (0-9),
   * space (' '), plus ('+'), minus ('-'), period ('.'), foward slash ('/'), colon (':'), equals ('='), and underscore ('_').
   *
   * @param tags -
   * @param options -
   */
  async setTags(tags, options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-setTags", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.setTags({
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          blobModifiedAccessConditions: options.conditions,
          tracingOptions: updatedOptions.tracingOptions,
          tags: (0, import_utils_common.toBlobTags)(tags)
        })
      );
    });
  }
  /**
   * Gets the tags associated with the underlying blob.
   *
   * @param options -
   */
  async getTags(options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-getTags", options, async (updatedOptions) => {
      const response = (0, import_utils_common.assertResponse)(
        await this.blobContext.getTags({
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          blobModifiedAccessConditions: options.conditions,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
      const wrappedResponse = {
        ...response,
        _response: response._response,
        // _response is made non-enumerable
        tags: (0, import_utils_common.toTags)({ blobTagSet: response.blobTagSet }) || {}
      };
      return wrappedResponse;
    });
  }
  /**
   * Get a {@link BlobLeaseClient} that manages leases on the blob.
   *
   * @param proposeLeaseId - Initial proposed lease Id.
   * @returns A new BlobLeaseClient object for managing leases on the blob.
   */
  getBlobLeaseClient(proposeLeaseId) {
    return new import_BlobLeaseClient.BlobLeaseClient(this, proposeLeaseId);
  }
  /**
   * Creates a read-only snapshot of a blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/snapshot-blob
   *
   * @param options - Optional options to the Blob Create Snapshot operation.
   */
  async createSnapshot(options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("BlobClient-createSnapshot", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.createSnapshot({
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          metadata: options.metadata,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          cpkInfo: options.customerProvidedKey,
          encryptionScope: options.encryptionScope,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Asynchronously copies a blob to a destination within the storage account.
   * This method returns a long running operation poller that allows you to wait
   * indefinitely until the copy is completed.
   * You can also cancel a copy before it is completed by calling `cancelOperation` on the poller.
   * Note that the onProgress callback will not be invoked if the operation completes in the first
   * request, and attempting to cancel a completed copy will result in an error being thrown.
   *
   * In version 2012-02-12 and later, the source for a Copy Blob operation can be
   * a committed blob in any Azure storage account.
   * Beginning with version 2015-02-21, the source for a Copy Blob operation can be
   * an Azure file in any Azure storage account.
   * Only storage accounts created on or after June 7th, 2012 allow the Copy Blob
   * operation to copy from another storage account.
   * @see https://learn.microsoft.com/rest/api/storageservices/copy-blob
   *
   * ```ts snippet:ClientsBeginCopyFromURL
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const blobClient = containerClient.getBlobClient(blobName);
   *
   * // Example using automatic polling
   * const automaticCopyPoller = await blobClient.beginCopyFromURL("url");
   * const automaticResult = await automaticCopyPoller.pollUntilDone();
   *
   * // Example using manual polling
   * const manualCopyPoller = await blobClient.beginCopyFromURL("url");
   * while (!manualCopyPoller.isDone()) {
   *   await manualCopyPoller.poll();
   * }
   * const manualResult = manualCopyPoller.getResult();
   *
   * // Example using progress updates
   * const progressUpdatesCopyPoller = await blobClient.beginCopyFromURL("url", {
   *   onProgress(state) {
   *     console.log(`Progress: ${state.copyProgress}`);
   *   },
   * });
   * const progressUpdatesResult = await progressUpdatesCopyPoller.pollUntilDone();
   *
   * // Example using a changing polling interval (default 15 seconds)
   * const pollingIntervalCopyPoller = await blobClient.beginCopyFromURL("url", {
   *   intervalInMs: 1000, // poll blob every 1 second for copy progress
   * });
   * const pollingIntervalResult = await pollingIntervalCopyPoller.pollUntilDone();
   *
   * // Example using copy cancellation:
   * const cancelCopyPoller = await blobClient.beginCopyFromURL("url");
   * // cancel operation after starting it.
   * try {
   *   await cancelCopyPoller.cancelOperation();
   *   // calls to get the result now throw PollerCancelledError
   *   cancelCopyPoller.getResult();
   * } catch (err: any) {
   *   if (err.name === "PollerCancelledError") {
   *     console.log("The copy was cancelled.");
   *   }
   * }
   * ```
   *
   * @param copySource - url to the source Azure Blob/File.
   * @param options - Optional options to the Blob Start Copy From URL operation.
   */
  async beginCopyFromURL(copySource, options = {}) {
    const client = {
      abortCopyFromURL: (...args) => this.abortCopyFromURL(...args),
      getProperties: (...args) => this.getProperties(...args),
      startCopyFromURL: (...args) => this.startCopyFromURL(...args)
    };
    const poller = new import_BlobStartCopyFromUrlPoller.BlobBeginCopyFromUrlPoller({
      blobClient: client,
      copySource,
      intervalInMs: options.intervalInMs,
      onProgress: options.onProgress,
      resumeFrom: options.resumeFrom,
      startCopyFromURLOptions: options
    });
    await poller.poll();
    return poller;
  }
  /**
   * Aborts a pending asynchronous Copy Blob operation, and leaves a destination blob with zero
   * length and full metadata. Version 2012-02-12 and newer.
   * @see https://learn.microsoft.com/rest/api/storageservices/abort-copy-blob
   *
   * @param copyId - Id of the Copy From URL operation.
   * @param options - Optional options to the Blob Abort Copy From URL operation.
   */
  async abortCopyFromURL(copyId, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "BlobClient-abortCopyFromURL",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.blobContext.abortCopyFromURL(copyId, {
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
  /**
   * The synchronous Copy From URL operation copies a blob or an internet resource to a new blob. It will not
   * return a response until the copy is complete.
   * @see https://learn.microsoft.com/rest/api/storageservices/copy-blob-from-url
   *
   * @param copySource - The source URL to copy from, Shared Access Signature(SAS) maybe needed for authentication
   * @param options -
   */
  async syncCopyFromURL(copySource, options = {}) {
    options.conditions = options.conditions || {};
    options.sourceConditions = options.sourceConditions || {};
    return import_tracing.tracingClient.withSpan("BlobClient-syncCopyFromURL", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.copyFromURL(copySource, {
          abortSignal: options.abortSignal,
          metadata: options.metadata,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          sourceModifiedAccessConditions: {
            sourceIfMatch: options.sourceConditions?.ifMatch,
            sourceIfModifiedSince: options.sourceConditions?.ifModifiedSince,
            sourceIfNoneMatch: options.sourceConditions?.ifNoneMatch,
            sourceIfUnmodifiedSince: options.sourceConditions?.ifUnmodifiedSince
          },
          sourceContentMD5: options.sourceContentMD5,
          copySourceAuthorization: (0, import_utils_common.httpAuthorizationToString)(options.sourceAuthorization),
          tier: (0, import_models.toAccessTier)(options.tier),
          blobTagsString: (0, import_utils_common.toBlobTagsString)(options.tags),
          immutabilityPolicyExpiry: options.immutabilityPolicy?.expiriesOn,
          immutabilityPolicyMode: options.immutabilityPolicy?.policyMode,
          legalHold: options.legalHold,
          encryptionScope: options.encryptionScope,
          copySourceTags: options.copySourceTags,
          fileRequestIntent: options.sourceShareTokenIntent,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Sets the tier on a blob. The operation is allowed on a page blob in a premium
   * storage account and on a block blob in a blob storage account (locally redundant
   * storage only). A premium page blob's tier determines the allowed size, IOPS,
   * and bandwidth of the blob. A block blob's tier determines Hot/Cool/Archive
   * storage type. This operation does not update the blob's ETag.
   * @see https://learn.microsoft.com/rest/api/storageservices/set-blob-tier
   *
   * @param tier - The tier to be set on the blob. Valid values are Hot, Cool, or Archive.
   * @param options - Optional options to the Blob Set Tier operation.
   */
  async setAccessTier(tier, options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-setAccessTier", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.setTier((0, import_models.toAccessTier)(tier), {
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          rehydratePriority: options.rehydratePriority,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  async downloadToBuffer(param1, param2, param3, param4 = {}) {
    let buffer;
    let offset = 0;
    let count = 0;
    let options = param4;
    if (param1 instanceof Buffer) {
      buffer = param1;
      offset = param2 || 0;
      count = typeof param3 === "number" ? param3 : 0;
    } else {
      offset = typeof param1 === "number" ? param1 : 0;
      count = typeof param2 === "number" ? param2 : 0;
      options = param3 || {};
    }
    let blockSize = options.blockSize ?? 0;
    if (blockSize < 0) {
      throw new RangeError("blockSize option must be >= 0");
    }
    if (blockSize === 0) {
      blockSize = import_constants.DEFAULT_BLOB_DOWNLOAD_BLOCK_BYTES;
    }
    if (offset < 0) {
      throw new RangeError("offset option must be >= 0");
    }
    if (count && count <= 0) {
      throw new RangeError("count option must be greater than 0");
    }
    if (!options.conditions) {
      options.conditions = {};
    }
    return import_tracing.tracingClient.withSpan(
      "BlobClient-downloadToBuffer",
      options,
      async (updatedOptions) => {
        if (!count) {
          const response = await this.getProperties({
            ...options,
            tracingOptions: updatedOptions.tracingOptions
          });
          count = response.contentLength - offset;
          if (count < 0) {
            throw new RangeError(
              `offset ${offset} shouldn't be larger than blob size ${response.contentLength}`
            );
          }
        }
        if (!buffer) {
          try {
            buffer = Buffer.alloc(count);
          } catch (error) {
            throw new Error(
              `Unable to allocate the buffer of size: ${count}(in bytes). Please try passing your own buffer to the "downloadToBuffer" method or try using other methods like "download" or "downloadToFile".	 ${error.message}`
            );
          }
        }
        if (buffer.length < count) {
          throw new RangeError(
            `The buffer's size should be equal to or larger than the request count of bytes: ${count}`
          );
        }
        let transferProgress = 0;
        const batch = new import_Batch.Batch(options.concurrency);
        for (let off = offset; off < offset + count; off = off + blockSize) {
          batch.addOperation(async () => {
            let chunkEnd = offset + count;
            if (off + blockSize < chunkEnd) {
              chunkEnd = off + blockSize;
            }
            const response = await this.download(off, chunkEnd - off, {
              abortSignal: options.abortSignal,
              conditions: options.conditions,
              maxRetryRequests: options.maxRetryRequestsPerBlock,
              customerProvidedKey: options.customerProvidedKey,
              contentChecksumAlgorithm: options.contentChecksumAlgorithm,
              tracingOptions: updatedOptions.tracingOptions
            });
            const stream = response.readableStreamBody;
            await (0, import_utils.streamToBuffer)(stream, buffer, off - offset, chunkEnd - offset);
            transferProgress += chunkEnd - off;
            if (options.onProgress) {
              options.onProgress({ loadedBytes: transferProgress });
            }
          });
        }
        await batch.do();
        return buffer;
      }
    );
  }
  /**
   * ONLY AVAILABLE IN NODE.JS RUNTIME.
   *
   * Downloads an Azure Blob to a local file.
   * Fails if the the given file path already exits.
   * Offset and count are optional, pass 0 and undefined respectively to download the entire blob.
   *
   * @param filePath -
   * @param offset - From which position of the block blob to download.
   * @param count - How much data to be downloaded. Will download to the end when passing undefined.
   * @param options - Options to Blob download options.
   * @returns The response data for blob download operation,
   *                                                 but with readableStreamBody set to undefined since its
   *                                                 content is already read and written into a local file
   *                                                 at the specified path.
   */
  async downloadToFile(filePath, offset = 0, count, options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-downloadToFile", options, async (updatedOptions) => {
      const response = await this.download(offset, count, {
        ...options,
        tracingOptions: updatedOptions.tracingOptions
      });
      if (response.readableStreamBody) {
        await (0, import_utils.readStreamToLocalFile)(response.readableStreamBody, filePath);
      }
      response.blobDownloadStream = void 0;
      return response;
    });
  }
  getBlobAndContainerNamesFromUrl() {
    let containerName;
    let blobName;
    try {
      const parsedUrl = new URL(this.url);
      if (parsedUrl.host.split(".")[1] === "blob") {
        const pathComponents = parsedUrl.pathname.match("/([^/]*)(/(.*))?");
        containerName = pathComponents[1];
        blobName = pathComponents[3];
      } else if ((0, import_utils_common.isIpEndpointStyle)(parsedUrl)) {
        const pathComponents = parsedUrl.pathname.match("/([^/]*)/([^/]*)(/(.*))?");
        containerName = pathComponents[2];
        blobName = pathComponents[4];
      } else {
        const pathComponents = parsedUrl.pathname.match("/([^/]*)(/(.*))?");
        containerName = pathComponents[1];
        blobName = pathComponents[3];
      }
      containerName = decodeURIComponent(containerName);
      blobName = decodeURIComponent(blobName);
      blobName = blobName.replace(/\\/g, "/");
      if (!containerName) {
        throw new Error("Provided containerName is invalid.");
      }
      return { blobName, containerName };
    } catch (error) {
      throw new Error("Unable to extract blobName and containerName with provided information.");
    }
  }
  /**
   * Asynchronously copies a blob to a destination within the storage account.
   * In version 2012-02-12 and later, the source for a Copy Blob operation can be
   * a committed blob in any Azure storage account.
   * Beginning with version 2015-02-21, the source for a Copy Blob operation can be
   * an Azure file in any Azure storage account.
   * Only storage accounts created on or after June 7th, 2012 allow the Copy Blob
   * operation to copy from another storage account.
   * @see https://learn.microsoft.com/rest/api/storageservices/copy-blob
   *
   * @param copySource - url to the source Azure Blob/File.
   * @param options - Optional options to the Blob Start Copy From URL operation.
   */
  async startCopyFromURL(copySource, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "BlobClient-startCopyFromURL",
      options,
      async (updatedOptions) => {
        options.conditions = options.conditions || {};
        options.sourceConditions = options.sourceConditions || {};
        return (0, import_utils_common.assertResponse)(
          await this.blobContext.startCopyFromURL(copySource, {
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            metadata: options.metadata,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            sourceModifiedAccessConditions: {
              sourceIfMatch: options.sourceConditions.ifMatch,
              sourceIfModifiedSince: options.sourceConditions.ifModifiedSince,
              sourceIfNoneMatch: options.sourceConditions.ifNoneMatch,
              sourceIfUnmodifiedSince: options.sourceConditions.ifUnmodifiedSince,
              sourceIfTags: options.sourceConditions.tagConditions
            },
            immutabilityPolicyExpiry: options.immutabilityPolicy?.expiriesOn,
            immutabilityPolicyMode: options.immutabilityPolicy?.policyMode,
            legalHold: options.legalHold,
            rehydratePriority: options.rehydratePriority,
            tier: (0, import_models.toAccessTier)(options.tier),
            blobTagsString: (0, import_utils_common.toBlobTagsString)(options.tags),
            sealBlob: options.sealBlob,
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
  /**
   * Only available for BlobClient constructed with a shared key credential.
   *
   * Generates a Blob Service Shared Access Signature (SAS) URI based on the client properties
   * and parameters passed in. The SAS is signed by the shared key credential of the client.
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/constructing-a-service-sas
   *
   * @param options - Optional parameters.
   * @returns The SAS URI consisting of the URI to the resource represented by this client, followed by the generated SAS token.
   */
  generateSasUrl(options) {
    return new Promise((resolve) => {
      if (!(this.credential instanceof import_storage_common.StorageSharedKeyCredential)) {
        throw new RangeError(
          "Can only generate the SAS when the client is initialized with a shared key credential"
        );
      }
      const sas = (0, import_BlobSASSignatureValues.generateBlobSASQueryParameters)(
        {
          containerName: this._containerName,
          blobName: this._name,
          snapshotTime: this._snapshot,
          versionId: this._versionId,
          ...options
        },
        this.credential
      ).toString();
      resolve((0, import_utils_common.appendToURLQuery)(this.url, sas));
    });
  }
  /**
   * Only available for BlobClient constructed with a shared key credential.
   *
   * Generates string to sign for a Blob Service Shared Access Signature (SAS) URI based on
   * the client properties and parameters passed in. The SAS is signed by the shared key credential of the client.
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/constructing-a-service-sas
   *
   * @param options - Optional parameters.
   * @returns The SAS URI consisting of the URI to the resource represented by this client, followed by the generated SAS token.
   */
  /* eslint-disable-next-line @azure/azure-sdk/ts-naming-options*/
  generateSasStringToSign(options) {
    if (!(this.credential instanceof import_storage_common.StorageSharedKeyCredential)) {
      throw new RangeError(
        "Can only generate the SAS when the client is initialized with a shared key credential"
      );
    }
    return (0, import_BlobSASSignatureValues.generateBlobSASQueryParametersInternal)(
      {
        containerName: this._containerName,
        blobName: this._name,
        snapshotTime: this._snapshot,
        versionId: this._versionId,
        ...options
      },
      this.credential
    ).stringToSign;
  }
  /**
   *
   * Generates a Blob Service Shared Access Signature (SAS) URI based on
   * the client properties and parameters passed in. The SAS is signed by the input user delegation key.
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/constructing-a-service-sas
   *
   * @param options - Optional parameters.
   * @param userDelegationKey -  Return value of `blobServiceClient.getUserDelegationKey()`
   * @returns The SAS URI consisting of the URI to the resource represented by this client, followed by the generated SAS token.
   */
  generateUserDelegationSasUrl(options, userDelegationKey) {
    return new Promise((resolve) => {
      const sas = (0, import_BlobSASSignatureValues.generateBlobSASQueryParameters)(
        {
          containerName: this._containerName,
          blobName: this._name,
          snapshotTime: this._snapshot,
          versionId: this._versionId,
          ...options
        },
        userDelegationKey,
        this.accountName
      ).toString();
      resolve((0, import_utils_common.appendToURLQuery)(this.url, sas));
    });
  }
  /**
   * Only available for BlobClient constructed with a shared key credential.
   *
   * Generates string to sign for a Blob Service Shared Access Signature (SAS) URI based on
   * the client properties and parameters passed in. The SAS is signed by the input user delegation key.
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/constructing-a-service-sas
   *
   * @param options - Optional parameters.
   * @param userDelegationKey -  Return value of `blobServiceClient.getUserDelegationKey()`
   * @returns The SAS URI consisting of the URI to the resource represented by this client, followed by the generated SAS token.
   */
  generateUserDelegationSasStringToSign(options, userDelegationKey) {
    return (0, import_BlobSASSignatureValues.generateBlobSASQueryParametersInternal)(
      {
        containerName: this._containerName,
        blobName: this._name,
        snapshotTime: this._snapshot,
        versionId: this._versionId,
        ...options
      },
      userDelegationKey,
      this.accountName
    ).stringToSign;
  }
  /**
   * Delete the immutablility policy on the blob.
   *
   * @param options - Optional options to delete immutability policy on the blob.
   */
  async deleteImmutabilityPolicy(options = {}) {
    return import_tracing.tracingClient.withSpan(
      "BlobClient-deleteImmutabilityPolicy",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.blobContext.deleteImmutabilityPolicy({
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
  /**
   * Set immutability policy on the blob.
   *
   * @param options - Optional options to set immutability policy on the blob.
   */
  async setImmutabilityPolicy(immutabilityPolicy, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "BlobClient-setImmutabilityPolicy",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.blobContext.setImmutabilityPolicy({
            immutabilityPolicyExpiry: immutabilityPolicy.expiriesOn,
            immutabilityPolicyMode: immutabilityPolicy.policyMode,
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
  /**
   * Set legal hold on the blob.
   *
   * @param options - Optional options to set legal hold on the blob.
   */
  async setLegalHold(legalHoldEnabled, options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-setLegalHold", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.setLegalHold(legalHoldEnabled, {
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * The Get Account Information operation returns the sku name and account kind
   * for the specified account.
   * The Get Account Information operation is available on service versions beginning
   * with version 2018-03-28.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-account-information
   *
   * @param options - Options to the Service Get Account Info operation.
   * @returns Response data for the Service Get Account Info operation.
   */
  async getAccountInfo(options = {}) {
    return import_tracing.tracingClient.withSpan("BlobClient-getAccountInfo", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.blobContext.getAccountInfo({
          abortSignal: options.abortSignal,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
}
class AppendBlobClient extends BlobClient {
  /**
   * appendBlobsContext provided by protocol layer.
   */
  appendBlobContext;
  constructor(urlOrConnectionString, credentialOrPipelineOrContainerName, blobNameOrOptions, options) {
    let pipeline;
    let url;
    options = options || {};
    if ((0, import_Pipeline.isPipelineLike)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      pipeline = credentialOrPipelineOrContainerName;
      options = blobNameOrOptions;
    } else if (import_core_util.isNodeLike && credentialOrPipelineOrContainerName instanceof import_storage_common.StorageSharedKeyCredential || credentialOrPipelineOrContainerName instanceof import_storage_common.AnonymousCredential || (0, import_core_auth.isTokenCredential)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      options = blobNameOrOptions;
      pipeline = (0, import_Pipeline.newPipeline)(credentialOrPipelineOrContainerName, options);
    } else if (!credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName !== "string") {
      url = urlOrConnectionString;
      options = blobNameOrOptions;
      pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
    } else if (credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName === "string" && blobNameOrOptions && typeof blobNameOrOptions === "string") {
      const containerName = credentialOrPipelineOrContainerName;
      const blobName = blobNameOrOptions;
      const extractedCreds = (0, import_utils_common.extractConnectionStringParts)(urlOrConnectionString);
      if (extractedCreds.kind === "AccountConnString") {
        if (import_core_util.isNodeLike) {
          const sharedKeyCredential = new import_storage_common.StorageSharedKeyCredential(
            extractedCreds.accountName,
            extractedCreds.accountKey
          );
          url = (0, import_utils_common.appendToURLPath)(
            (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
            encodeURIComponent(blobName)
          );
          if (!options.proxyOptions) {
            options.proxyOptions = (0, import_core_rest_pipeline.getDefaultProxySettings)(extractedCreds.proxyUri);
          }
          pipeline = (0, import_Pipeline.newPipeline)(sharedKeyCredential, options);
        } else {
          throw new Error("Account connection string is only supported in Node.js environment");
        }
      } else if (extractedCreds.kind === "SASConnString") {
        url = (0, import_utils_common.appendToURLPath)(
          (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
          encodeURIComponent(blobName)
        ) + "?" + extractedCreds.accountSas;
        pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
      } else {
        throw new Error(
          "Connection string must be either an Account connection string or a SAS connection string"
        );
      }
    } else {
      throw new Error("Expecting non-empty strings for containerName and blobName parameters");
    }
    super(url, pipeline);
    this.appendBlobContext = this.storageClientContext.appendBlob;
    this.blobClientConfig = options;
  }
  /**
   * Creates a new AppendBlobClient object identical to the source but with the
   * specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a Client to the base blob.
   *
   * @param snapshot - The snapshot timestamp.
   * @returns A new AppendBlobClient object identical to the source but with the specified snapshot timestamp.
   */
  withSnapshot(snapshot) {
    return new AppendBlobClient(
      (0, import_utils_common.setURLParameter)(
        this.url,
        import_constants.URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? void 0 : snapshot
      ),
      this.pipeline,
      this.blobClientConfig
    );
  }
  /**
   * Creates a 0-length append blob. Call AppendBlock to append data to an append blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param options - Options to the Append Block Create operation.
   *
   *
   * Example usage:
   *
   * ```ts snippet:ClientsCreateAppendBlob
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   *
   * const appendBlobClient = containerClient.getAppendBlobClient(blobName);
   * await appendBlobClient.create();
   * ```
   */
  async create(options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("AppendBlobClient-create", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.appendBlobContext.create(0, {
          abortSignal: options.abortSignal,
          blobHttpHeaders: options.blobHTTPHeaders,
          leaseAccessConditions: options.conditions,
          metadata: options.metadata,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          cpkInfo: options.customerProvidedKey,
          encryptionScope: options.encryptionScope,
          immutabilityPolicyExpiry: options.immutabilityPolicy?.expiriesOn,
          immutabilityPolicyMode: options.immutabilityPolicy?.policyMode,
          legalHold: options.legalHold,
          blobTagsString: (0, import_utils_common.toBlobTagsString)(options.tags),
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Creates a 0-length append blob. Call AppendBlock to append data to an append blob.
   * If the blob with the same name already exists, the content of the existing blob will remain unchanged.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param options -
   */
  async createIfNotExists(options = {}) {
    const conditions = { ifNoneMatch: import_constants.ETagAny };
    return import_tracing.tracingClient.withSpan(
      "AppendBlobClient-createIfNotExists",
      options,
      async (updatedOptions) => {
        try {
          const res = (0, import_utils_common.assertResponse)(
            await this.create({
              ...updatedOptions,
              conditions
            })
          );
          return {
            succeeded: true,
            ...res,
            _response: res._response
            // _response is made non-enumerable
          };
        } catch (e) {
          if (e.details?.errorCode === "BlobAlreadyExists") {
            return {
              succeeded: false,
              ...e.response?.parsedHeaders,
              _response: e.response
            };
          }
          throw e;
        }
      }
    );
  }
  /**
   * Seals the append blob, making it read only.
   *
   * @param options -
   */
  async seal(options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan("AppendBlobClient-seal", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.appendBlobContext.seal({
          abortSignal: options.abortSignal,
          appendPositionAccessConditions: options.conditions,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Commits a new block of data to the end of the existing append blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/append-block
   *
   * @param body - Data to be appended.
   * @param contentLength - Length of the body in bytes.
   * @param options - Options to the Append Block operation.
   *
   *
   * Example usage:
   *
   * ```ts snippet:ClientsAppendBlock
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   *
   * const content = "Hello World!";
   *
   * // Create a new append blob and append data to the blob.
   * const newAppendBlobClient = containerClient.getAppendBlobClient(blobName);
   * await newAppendBlobClient.create();
   * await newAppendBlobClient.appendBlock(content, content.length);
   *
   * // Append data to an existing append blob.
   * const existingAppendBlobClient = containerClient.getAppendBlobClient(blobName);
   * await existingAppendBlobClient.appendBlock(content, content.length);
   * ```
   */
  async appendBlock(body, contentLength, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan(
      "AppendBlobClient-appendBlock",
      options,
      async (updatedOptions) => {
        const parameters = {
          abortSignal: options.abortSignal,
          appendPositionAccessConditions: options.conditions,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          requestOptions: {
            onUploadProgress: options.onProgress
          },
          cpkInfo: options.customerProvidedKey,
          encryptionScope: options.encryptionScope,
          tracingOptions: updatedOptions.tracingOptions
        };
        const uploadBodyParameters = await (0, import_utils_common.setUploadChecksumParameters)(
          body,
          contentLength,
          parameters,
          options,
          this.blobClientConfig?.uploadContentChecksumAlgorithm
        );
        return (0, import_utils_common.assertResponse)(
          await this.appendBlobContext.appendBlock(
            uploadBodyParameters.contentLength,
            uploadBodyParameters.body,
            parameters
          )
        );
      }
    );
  }
  /**
   * The Append Block operation commits a new block of data to the end of an existing append blob
   * where the contents are read from a source url.
   * @see https://learn.microsoft.com/rest/api/storageservices/append-block-from-url
   *
   * @param sourceURL -
   *                 The url to the blob that will be the source of the copy. A source blob in the same storage account can
   *                 be authenticated via Shared Key. However, if the source is a blob in another account, the source blob
   *                 must either be public or must be authenticated via a shared access signature. If the source blob is
   *                 public, no authentication is required to perform the operation.
   * @param sourceOffset - Offset in source to be appended
   * @param count - Number of bytes to be appended as a block
   * @param options -
   */
  async appendBlockFromURL(sourceURL, sourceOffset, count, options = {}) {
    options.conditions = options.conditions || {};
    options.sourceConditions = options.sourceConditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan(
      "AppendBlobClient-appendBlockFromURL",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.appendBlobContext.appendBlockFromUrl(sourceURL, 0, {
            abortSignal: options.abortSignal,
            sourceRange: (0, import_Range.rangeToString)({ offset: sourceOffset, count }),
            sourceContentMD5: options.sourceContentMD5,
            sourceContentCrc64: options.sourceContentCrc64,
            leaseAccessConditions: options.conditions,
            appendPositionAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            sourceModifiedAccessConditions: {
              sourceIfMatch: options.sourceConditions?.ifMatch,
              sourceIfModifiedSince: options.sourceConditions?.ifModifiedSince,
              sourceIfNoneMatch: options.sourceConditions?.ifNoneMatch,
              sourceIfUnmodifiedSince: options.sourceConditions?.ifUnmodifiedSince
            },
            copySourceAuthorization: (0, import_utils_common.httpAuthorizationToString)(options.sourceAuthorization),
            cpkInfo: options.customerProvidedKey,
            encryptionScope: options.encryptionScope,
            fileRequestIntent: options.sourceShareTokenIntent,
            tracingOptions: updatedOptions.tracingOptions,
            sourceCpkInfo: {
              sourceEncryptionKey: options.sourceCustomerProvidedKey?.encryptionKey,
              sourceEncryptionAlgorithm: options.sourceCustomerProvidedKey?.encryptionAlgorithm,
              sourceEncryptionKeySha256: options.sourceCustomerProvidedKey?.encryptionKeySha256
            }
          })
        );
      }
    );
  }
}
class BlockBlobClient extends BlobClient {
  /**
   * blobContext provided by protocol layer.
   *
   * Note. Ideally BlobClient should set BlobClient.blobContext to protected. However, API
   * extractor has issue blocking that. Here we redecelare _blobContext in BlockBlobClient.
   */
  _blobContext;
  /**
   * blockBlobContext provided by protocol layer.
   */
  blockBlobContext;
  constructor(urlOrConnectionString, credentialOrPipelineOrContainerName, blobNameOrOptions, options) {
    let pipeline;
    let url;
    options = options || {};
    if ((0, import_Pipeline.isPipelineLike)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      pipeline = credentialOrPipelineOrContainerName;
      options = blobNameOrOptions;
    } else if (import_core_util.isNodeLike && credentialOrPipelineOrContainerName instanceof import_storage_common.StorageSharedKeyCredential || credentialOrPipelineOrContainerName instanceof import_storage_common.AnonymousCredential || (0, import_core_auth.isTokenCredential)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      options = blobNameOrOptions;
      pipeline = (0, import_Pipeline.newPipeline)(credentialOrPipelineOrContainerName, options);
    } else if (!credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName !== "string") {
      url = urlOrConnectionString;
      if (blobNameOrOptions && typeof blobNameOrOptions !== "string") {
        options = blobNameOrOptions;
      }
      pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
    } else if (credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName === "string" && blobNameOrOptions && typeof blobNameOrOptions === "string") {
      const containerName = credentialOrPipelineOrContainerName;
      const blobName = blobNameOrOptions;
      const extractedCreds = (0, import_utils_common.extractConnectionStringParts)(urlOrConnectionString);
      if (extractedCreds.kind === "AccountConnString") {
        if (import_core_util.isNodeLike) {
          const sharedKeyCredential = new import_storage_common.StorageSharedKeyCredential(
            extractedCreds.accountName,
            extractedCreds.accountKey
          );
          url = (0, import_utils_common.appendToURLPath)(
            (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
            encodeURIComponent(blobName)
          );
          if (!options.proxyOptions) {
            options.proxyOptions = (0, import_core_rest_pipeline.getDefaultProxySettings)(extractedCreds.proxyUri);
          }
          pipeline = (0, import_Pipeline.newPipeline)(sharedKeyCredential, options);
        } else {
          throw new Error("Account connection string is only supported in Node.js environment");
        }
      } else if (extractedCreds.kind === "SASConnString") {
        url = (0, import_utils_common.appendToURLPath)(
          (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
          encodeURIComponent(blobName)
        ) + "?" + extractedCreds.accountSas;
        pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
      } else {
        throw new Error(
          "Connection string must be either an Account connection string or a SAS connection string"
        );
      }
    } else {
      throw new Error("Expecting non-empty strings for containerName and blobName parameters");
    }
    super(url, pipeline);
    this.blockBlobContext = this.storageClientContext.blockBlob;
    this._blobContext = this.storageClientContext.blob;
    this.blobClientConfig = options;
  }
  /**
   * Creates a new BlockBlobClient object identical to the source but with the
   * specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a URL to the base blob.
   *
   * @param snapshot - The snapshot timestamp.
   * @returns A new BlockBlobClient object identical to the source but with the specified snapshot timestamp.
   */
  withSnapshot(snapshot) {
    return new BlockBlobClient(
      (0, import_utils_common.setURLParameter)(
        this.url,
        import_constants.URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? void 0 : snapshot
      ),
      this.pipeline,
      this.blobClientConfig
    );
  }
  /**
   * ONLY AVAILABLE IN NODE.JS RUNTIME.
   *
   * Quick query for a JSON or CSV formatted blob.
   *
   * Example usage (Node.js):
   *
   * ```ts snippet:ClientsQuery
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   * import { buffer } from "node:stream/consumers";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const blockBlobClient = containerClient.getBlockBlobClient(blobName);
   *
   * // Query and convert a blob to a string
   * const queryBlockBlobResponse = await blockBlobClient.query("select from BlobStorage");
   * if (queryBlockBlobResponse.readableStreamBody) {
   *   // Read the response bytes. Use `text` from "node:stream/consumers" instead
   *   // if you want the response as a string directly.
   *   const downloadedBuffer = await buffer(queryBlockBlobResponse.readableStreamBody);
   *   console.log(`Query blob content: ${downloadedBuffer.toString()}`);
   * }
   * ```
   *
   * @param query -
   * @param options -
   */
  async query(query, options = {}) {
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    if (!import_core_util.isNodeLike) {
      throw new Error("This operation currently is only supported in Node.js.");
    }
    return import_tracing.tracingClient.withSpan("BlockBlobClient-query", options, async (updatedOptions) => {
      const response = (0, import_utils_common.assertResponse)(
        await this._blobContext.query({
          abortSignal: options.abortSignal,
          queryRequest: {
            queryType: "SQL",
            expression: query,
            inputSerialization: (0, import_utils_common.toQuerySerialization)(options.inputTextConfiguration),
            outputSerialization: (0, import_utils_common.toQuerySerialization)(options.outputTextConfiguration)
          },
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          cpkInfo: options.customerProvidedKey,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
      return new import_BlobQueryResponse.BlobQueryResponse(response, {
        abortSignal: options.abortSignal,
        onProgress: options.onProgress,
        onError: options.onError
      });
    });
  }
  /**
   * Creates a new block blob, or updates the content of an existing block blob.
   * Updating an existing block blob overwrites any existing metadata on the blob.
   * Partial updates are not supported; the content of the existing blob is
   * overwritten with the new content. To perform a partial update of a block blob's,
   * use {@link stageBlock} and {@link commitBlockList}.
   *
   * This is a non-parallel uploading method, please use {@link uploadFile},
   * {@link uploadStream} or {@link uploadBrowserData} for better performance
   * with concurrency uploading.
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param body - Blob, string, ArrayBuffer, ArrayBufferView or a function
   *                               which returns a new Readable stream whose offset is from data source beginning.
   * @param contentLength - Length of body in bytes. Use Buffer.byteLength() to calculate body length for a
   *                               string including non non-Base64/Hex-encoded characters.
   * @param options - Options to the Block Blob Upload operation.
   * @returns Response data for the Block Blob Upload operation.
   *
   * Example usage:
   *
   * ```ts snippet:ClientsUpload
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const blockBlobClient = containerClient.getBlockBlobClient(blobName);
   *
   * const content = "Hello world!";
   * const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
   * ```
   */
  async upload(body, contentLength, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("BlockBlobClient-upload", options, async (updatedOptions) => {
      const parameters = {
        abortSignal: options.abortSignal,
        blobHttpHeaders: options.blobHTTPHeaders,
        leaseAccessConditions: options.conditions,
        metadata: options.metadata,
        modifiedAccessConditions: {
          ...options.conditions,
          ifTags: options.conditions?.tagConditions
        },
        requestOptions: {
          onUploadProgress: options.onProgress
        },
        cpkInfo: options.customerProvidedKey,
        encryptionScope: options.encryptionScope,
        immutabilityPolicyExpiry: options.immutabilityPolicy?.expiriesOn,
        immutabilityPolicyMode: options.immutabilityPolicy?.policyMode,
        legalHold: options.legalHold,
        tier: (0, import_models.toAccessTier)(options.tier),
        blobTagsString: (0, import_utils_common.toBlobTagsString)(options.tags),
        tracingOptions: updatedOptions.tracingOptions
      };
      const uploadBodyParameters = await (0, import_utils_common.setUploadChecksumParameters)(
        body,
        contentLength,
        parameters,
        options,
        this.blobClientConfig?.uploadContentChecksumAlgorithm
      );
      return (0, import_utils_common.assertResponse)(
        await this.blockBlobContext.upload(
          uploadBodyParameters.contentLength,
          uploadBodyParameters.body,
          parameters
        )
      );
    });
  }
  /**
   * Creates a new Block Blob where the contents of the blob are read from a given URL.
   * This API is supported beginning with the 2020-04-08 version. Partial updates
   * are not supported with Put Blob from URL; the content of an existing blob is overwritten with
   * the content of the new blob.  To perform partial updates to a block blob’s contents using a
   * source URL, use {@link stageBlockFromURL} and {@link commitBlockList}.
   *
   * @param sourceURL - Specifies the URL of the blob. The value
   *                           may be a URL of up to 2 KB in length that specifies a blob.
   *                           The value should be URL-encoded as it would appear
   *                           in a request URI. The source blob must either be public
   *                           or must be authenticated via a shared access signature.
   *                           If the source blob is public, no authentication is required
   *                           to perform the operation. Here are some examples of source object URLs:
   *                           - https://myaccount.blob.core.windows.net/mycontainer/myblob
   *                           - https://myaccount.blob.core.windows.net/mycontainer/myblob?snapshot=<DateTime>
   * @param options - Optional parameters.
   */
  async syncUploadFromURL(sourceURL, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan(
      "BlockBlobClient-syncUploadFromURL",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.blockBlobContext.putBlobFromUrl(0, sourceURL, {
            ...options,
            blobHttpHeaders: options.blobHTTPHeaders,
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            sourceModifiedAccessConditions: {
              sourceIfMatch: options.sourceConditions?.ifMatch,
              sourceIfModifiedSince: options.sourceConditions?.ifModifiedSince,
              sourceIfNoneMatch: options.sourceConditions?.ifNoneMatch,
              sourceIfUnmodifiedSince: options.sourceConditions?.ifUnmodifiedSince,
              sourceIfTags: options.sourceConditions?.tagConditions
            },
            cpkInfo: options.customerProvidedKey,
            copySourceAuthorization: (0, import_utils_common.httpAuthorizationToString)(options.sourceAuthorization),
            tier: (0, import_models.toAccessTier)(options.tier),
            blobTagsString: (0, import_utils_common.toBlobTagsString)(options.tags),
            copySourceTags: options.copySourceTags,
            fileRequestIntent: options.sourceShareTokenIntent,
            tracingOptions: updatedOptions.tracingOptions,
            sourceCpkInfo: {
              sourceEncryptionKey: options.sourceCustomerProvidedKey?.encryptionKey,
              sourceEncryptionAlgorithm: options.sourceCustomerProvidedKey?.encryptionAlgorithm,
              sourceEncryptionKeySha256: options.sourceCustomerProvidedKey?.encryptionKeySha256
            }
          })
        );
      }
    );
  }
  /**
   * Uploads the specified block to the block blob's "staging area" to be later
   * committed by a call to commitBlockList.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-block
   *
   * @param blockId - A 64-byte value that is base64-encoded
   * @param body - Data to upload to the staging area.
   * @param contentLength - Number of bytes to upload.
   * @param options - Options to the Block Blob Stage Block operation.
   * @returns Response data for the Block Blob Stage Block operation.
   */
  async stageBlock(blockId, body, contentLength, options = {}) {
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("BlockBlobClient-stageBlock", options, async (updatedOptions) => {
      const parameters = {
        abortSignal: options.abortSignal,
        leaseAccessConditions: options.conditions,
        requestOptions: {
          onUploadProgress: options.onProgress
        },
        cpkInfo: options.customerProvidedKey,
        encryptionScope: options.encryptionScope,
        tracingOptions: updatedOptions.tracingOptions
      };
      const uploadBodyParameters = await (0, import_utils_common.setUploadChecksumParameters)(
        body,
        contentLength,
        parameters,
        options,
        this.blobClientConfig?.uploadContentChecksumAlgorithm
      );
      return (0, import_utils_common.assertResponse)(
        await this.blockBlobContext.stageBlock(
          blockId,
          uploadBodyParameters.contentLength,
          uploadBodyParameters.body,
          parameters
        )
      );
    });
  }
  /**
   * The Stage Block From URL operation creates a new block to be committed as part
   * of a blob where the contents are read from a URL.
   * This API is available starting in version 2018-03-28.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-block-from-url
   *
   * @param blockId - A 64-byte value that is base64-encoded
   * @param sourceURL - Specifies the URL of the blob. The value
   *                           may be a URL of up to 2 KB in length that specifies a blob.
   *                           The value should be URL-encoded as it would appear
   *                           in a request URI. The source blob must either be public
   *                           or must be authenticated via a shared access signature.
   *                           If the source blob is public, no authentication is required
   *                           to perform the operation. Here are some examples of source object URLs:
   *                           - https://myaccount.blob.core.windows.net/mycontainer/myblob
   *                           - https://myaccount.blob.core.windows.net/mycontainer/myblob?snapshot=<DateTime>
   * @param offset - From which position of the blob to download, greater than or equal to 0
   * @param count - How much data to be downloaded, greater than 0. Will download to the end when undefined
   * @param options - Options to the Block Blob Stage Block From URL operation.
   * @returns Response data for the Block Blob Stage Block From URL operation.
   */
  async stageBlockFromURL(blockId, sourceURL, offset = 0, count, options = {}) {
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan(
      "BlockBlobClient-stageBlockFromURL",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.blockBlobContext.stageBlockFromURL(blockId, 0, sourceURL, {
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            sourceContentMD5: options.sourceContentMD5,
            sourceContentCrc64: options.sourceContentCrc64,
            sourceRange: offset === 0 && !count ? void 0 : (0, import_Range.rangeToString)({ offset, count }),
            cpkInfo: options.customerProvidedKey,
            encryptionScope: options.encryptionScope,
            copySourceAuthorization: (0, import_utils_common.httpAuthorizationToString)(options.sourceAuthorization),
            fileRequestIntent: options.sourceShareTokenIntent,
            tracingOptions: updatedOptions.tracingOptions,
            sourceCpkInfo: {
              sourceEncryptionKey: options.sourceCustomerProvidedKey?.encryptionKey,
              sourceEncryptionAlgorithm: options.sourceCustomerProvidedKey?.encryptionAlgorithm,
              sourceEncryptionKeySha256: options.sourceCustomerProvidedKey?.encryptionKeySha256
            }
          })
        );
      }
    );
  }
  /**
   * Writes a blob by specifying the list of block IDs that make up the blob.
   * In order to be written as part of a blob, a block must have been successfully written
   * to the server in a prior {@link stageBlock} operation. You can call {@link commitBlockList} to
   * update a blob by uploading only those blocks that have changed, then committing the new and existing
   * blocks together. Any blocks not specified in the block list and permanently deleted.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-block-list
   *
   * @param blocks -  Array of 64-byte value that is base64-encoded
   * @param options - Options to the Block Blob Commit Block List operation.
   * @returns Response data for the Block Blob Commit Block List operation.
   */
  async commitBlockList(blocks, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan(
      "BlockBlobClient-commitBlockList",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.blockBlobContext.commitBlockList(
            { latest: blocks },
            {
              abortSignal: options.abortSignal,
              blobHttpHeaders: options.blobHTTPHeaders,
              leaseAccessConditions: options.conditions,
              metadata: options.metadata,
              modifiedAccessConditions: {
                ...options.conditions,
                ifTags: options.conditions?.tagConditions
              },
              cpkInfo: options.customerProvidedKey,
              encryptionScope: options.encryptionScope,
              immutabilityPolicyExpiry: options.immutabilityPolicy?.expiriesOn,
              immutabilityPolicyMode: options.immutabilityPolicy?.policyMode,
              legalHold: options.legalHold,
              tier: (0, import_models.toAccessTier)(options.tier),
              blobTagsString: (0, import_utils_common.toBlobTagsString)(options.tags),
              tracingOptions: updatedOptions.tracingOptions
            }
          )
        );
      }
    );
  }
  /**
   * Returns the list of blocks that have been uploaded as part of a block blob
   * using the specified block list filter.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-block-list
   *
   * @param listType - Specifies whether to return the list of committed blocks,
   *                                        the list of uncommitted blocks, or both lists together.
   * @param options - Options to the Block Blob Get Block List operation.
   * @returns Response data for the Block Blob Get Block List operation.
   */
  async getBlockList(listType, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "BlockBlobClient-getBlockList",
      options,
      async (updatedOptions) => {
        const res = (0, import_utils_common.assertResponse)(
          await this.blockBlobContext.getBlockList(listType, {
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            tracingOptions: updatedOptions.tracingOptions
          })
        );
        if (!res.committedBlocks) {
          res.committedBlocks = [];
        }
        if (!res.uncommittedBlocks) {
          res.uncommittedBlocks = [];
        }
        return res;
      }
    );
  }
  // High level functions
  /**
   * Uploads a Buffer(Node.js)/Blob(browsers)/ArrayBuffer/ArrayBufferView object to a BlockBlob.
   *
   * When data length is no more than the specifiled {@link BlockBlobParallelUploadOptions.maxSingleShotSize} (default is
   * {@link BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES}), this method will use 1 {@link upload} call to finish the upload.
   * Otherwise, this method will call {@link stageBlock} to upload blocks, and finally call {@link commitBlockList}
   * to commit the block list.
   *
   * A common {@link BlockBlobParallelUploadOptions.blobHTTPHeaders} option to set is
   * `blobContentType`, enabling the browser to provide
   * functionality based on file type.
   *
   * @param data - Buffer(Node.js), Blob, ArrayBuffer or ArrayBufferView
   * @param options -
   */
  async uploadData(data, options = {}) {
    return import_tracing.tracingClient.withSpan("BlockBlobClient-uploadData", options, async (updatedOptions) => {
      if (import_core_util.isNodeLike) {
        let buffer;
        if (data instanceof Buffer) {
          buffer = data;
        } else if (data instanceof ArrayBuffer) {
          buffer = Buffer.from(data);
        } else {
          data = data;
          buffer = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        }
        return this.uploadSeekableInternal(
          (offset, size) => buffer.slice(offset, offset + size),
          buffer.byteLength,
          updatedOptions
        );
      } else {
        const browserBlob = new Blob([data]);
        return this.uploadSeekableInternal(
          (offset, size) => browserBlob.slice(offset, offset + size),
          browserBlob.size,
          updatedOptions
        );
      }
    });
  }
  /**
   * ONLY AVAILABLE IN BROWSERS.
   *
   * Uploads a browser Blob/File/ArrayBuffer/ArrayBufferView object to block blob.
   *
   * When buffer length lesser than or equal to 256MB, this method will use 1 upload call to finish the upload.
   * Otherwise, this method will call {@link stageBlock} to upload blocks, and finally call
   * {@link commitBlockList} to commit the block list.
   *
   * A common {@link BlockBlobParallelUploadOptions.blobHTTPHeaders} option to set is
   * `blobContentType`, enabling the browser to provide
   * functionality based on file type.
   *
   * @deprecated Use {@link uploadData} instead.
   *
   * @param browserData - Blob, File, ArrayBuffer or ArrayBufferView
   * @param options - Options to upload browser data.
   * @returns Response data for the Blob Upload operation.
   */
  async uploadBrowserData(browserData, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "BlockBlobClient-uploadBrowserData",
      options,
      async (updatedOptions) => {
        const browserBlob = new Blob([browserData]);
        return this.uploadSeekableInternal(
          (offset, size) => browserBlob.slice(offset, offset + size),
          browserBlob.size,
          updatedOptions
        );
      }
    );
  }
  /**
   *
   * Uploads data to block blob. Requires a bodyFactory as the data source,
   * which need to return a {@link HttpRequestBody} object with the offset and size provided.
   *
   * When data length is no more than the specified {@link BlockBlobParallelUploadOptions.maxSingleShotSize} (default is
   * {@link BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES}), this method will use 1 {@link upload} call to finish the upload.
   * Otherwise, this method will call {@link stageBlock} to upload blocks, and finally call {@link commitBlockList}
   * to commit the block list.
   *
   * @param bodyFactory -
   * @param size - size of the data to upload.
   * @param options - Options to Upload to Block Blob operation.
   * @returns Response data for the Blob Upload operation.
   */
  async uploadSeekableInternal(bodyFactory, size, options = {}) {
    let blockSize = options.blockSize ?? 0;
    if (blockSize < 0 || blockSize > import_constants.BLOCK_BLOB_MAX_STAGE_BLOCK_BYTES) {
      throw new RangeError(
        `blockSize option must be >= 0 and <= ${import_constants.BLOCK_BLOB_MAX_STAGE_BLOCK_BYTES}`
      );
    }
    const maxSingleShotSize = options.maxSingleShotSize ?? import_constants.BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES;
    if (maxSingleShotSize < 0 || maxSingleShotSize > import_constants.BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES) {
      throw new RangeError(
        `maxSingleShotSize option must be >= 0 and <= ${import_constants.BLOCK_BLOB_MAX_UPLOAD_BLOB_BYTES}`
      );
    }
    if (blockSize === 0) {
      if (size > import_constants.BLOCK_BLOB_MAX_STAGE_BLOCK_BYTES * import_constants.BLOCK_BLOB_MAX_BLOCKS) {
        throw new RangeError(`${size} is too larger to upload to a block blob.`);
      }
      if (size > maxSingleShotSize) {
        blockSize = Math.ceil(size / import_constants.BLOCK_BLOB_MAX_BLOCKS);
        if (blockSize < import_constants.DEFAULT_BLOB_DOWNLOAD_BLOCK_BYTES) {
          blockSize = import_constants.DEFAULT_BLOB_DOWNLOAD_BLOCK_BYTES;
        }
      }
    }
    if (!options.blobHTTPHeaders) {
      options.blobHTTPHeaders = {};
    }
    if (!options.conditions) {
      options.conditions = {};
    }
    return import_tracing.tracingClient.withSpan(
      "BlockBlobClient-uploadSeekableInternal",
      options,
      async (updatedOptions) => {
        if (size <= maxSingleShotSize) {
          return (0, import_utils_common.assertResponse)(await this.upload(bodyFactory(0, size), size, updatedOptions));
        }
        const numBlocks = Math.floor((size - 1) / blockSize) + 1;
        if (numBlocks > import_constants.BLOCK_BLOB_MAX_BLOCKS) {
          throw new RangeError(
            `The buffer's size is too big or the BlockSize is too small;the number of blocks must be <= ${import_constants.BLOCK_BLOB_MAX_BLOCKS}`
          );
        }
        const blockList = [];
        const blockIDPrefix = (0, import_core_util2.randomUUID)();
        let transferProgress = 0;
        const batch = new import_Batch.Batch(options.concurrency);
        for (let i = 0; i < numBlocks; i++) {
          batch.addOperation(async () => {
            const blockID = (0, import_utils_common.generateBlockID)(blockIDPrefix, i);
            const start = blockSize * i;
            const end = i === numBlocks - 1 ? size : start + blockSize;
            const contentLength = end - start;
            blockList.push(blockID);
            await this.stageBlock(blockID, bodyFactory(start, contentLength), contentLength, {
              abortSignal: options.abortSignal,
              conditions: options.conditions,
              encryptionScope: options.encryptionScope,
              tracingOptions: updatedOptions.tracingOptions,
              contentChecksumAlgorithm: options.contentChecksumAlgorithm
            });
            transferProgress += contentLength;
            if (options.onProgress) {
              options.onProgress({
                loadedBytes: transferProgress
              });
            }
          });
        }
        await batch.do();
        return this.commitBlockList(blockList, updatedOptions);
      }
    );
  }
  /**
   * ONLY AVAILABLE IN NODE.JS RUNTIME.
   *
   * Uploads a local file in blocks to a block blob.
   *
   * When file size lesser than or equal to 256MB, this method will use 1 upload call to finish the upload.
   * Otherwise, this method will call stageBlock to upload blocks, and finally call commitBlockList
   * to commit the block list.
   *
   * @param filePath - Full path of local file
   * @param options - Options to Upload to Block Blob operation.
   * @returns Response data for the Blob Upload operation.
   */
  async uploadFile(filePath, options = {}) {
    return import_tracing.tracingClient.withSpan("BlockBlobClient-uploadFile", options, async (updatedOptions) => {
      const size = (await (0, import_utils.fsStat)(filePath)).size;
      return this.uploadSeekableInternal(
        (offset, count) => {
          return () => (0, import_utils.fsCreateReadStream)(filePath, {
            autoClose: true,
            end: count ? offset + count - 1 : Infinity,
            start: offset
          });
        },
        size,
        {
          ...options,
          tracingOptions: updatedOptions.tracingOptions
        }
      );
    });
  }
  /**
   * ONLY AVAILABLE IN NODE.JS RUNTIME.
   *
   * Uploads a Node.js Readable stream into block blob.
   *
   * PERFORMANCE IMPROVEMENT TIPS:
   * * Input stream highWaterMark is better to set a same value with bufferSize
   *    parameter, which will avoid Buffer.concat() operations.
   *
   * @param stream - Node.js Readable stream
   * @param bufferSize - Size of every buffer allocated, also the block size in the uploaded block blob. Default value is 8MB
   * @param maxConcurrency -  Max concurrency indicates the max number of buffers that can be allocated,
   *                                 positive correlation with max uploading concurrency. Default value is 5
   * @param options - Options to Upload Stream to Block Blob operation.
   * @returns Response data for the Blob Upload operation.
   */
  async uploadStream(stream, bufferSize = import_constants.DEFAULT_BLOCK_BUFFER_SIZE_BYTES, maxConcurrency = 5, options = {}) {
    if (!options.blobHTTPHeaders) {
      options.blobHTTPHeaders = {};
    }
    if (!options.conditions) {
      options.conditions = {};
    }
    return import_tracing.tracingClient.withSpan(
      "BlockBlobClient-uploadStream",
      options,
      async (updatedOptions) => {
        let blockNum = 0;
        const blockIDPrefix = (0, import_core_util2.randomUUID)();
        let transferProgress = 0;
        const blockList = [];
        const scheduler = new import_storage_common2.BufferScheduler(
          stream,
          bufferSize,
          maxConcurrency,
          async (body, length) => {
            const blockID = (0, import_utils_common.generateBlockID)(blockIDPrefix, blockNum);
            blockList.push(blockID);
            blockNum++;
            await this.stageBlock(blockID, body, length, {
              customerProvidedKey: options.customerProvidedKey,
              conditions: options.conditions,
              encryptionScope: options.encryptionScope,
              tracingOptions: updatedOptions.tracingOptions,
              contentChecksumAlgorithm: options.contentChecksumAlgorithm
            });
            transferProgress += length;
            if (options.onProgress) {
              options.onProgress({ loadedBytes: transferProgress });
            }
          },
          // concurrency should set a smaller value than maxConcurrency, which is helpful to
          // reduce the possibility when a outgoing handler waits for stream data, in
          // this situation, outgoing handlers are blocked.
          // Outgoing queue shouldn't be empty.
          Math.ceil(maxConcurrency / 4 * 3)
        );
        await scheduler.do();
        return (0, import_utils_common.assertResponse)(
          await this.commitBlockList(blockList, {
            ...options,
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
}
class PageBlobClient extends BlobClient {
  /**
   * pageBlobsContext provided by protocol layer.
   */
  pageBlobContext;
  constructor(urlOrConnectionString, credentialOrPipelineOrContainerName, blobNameOrOptions, options) {
    let pipeline;
    let url;
    options = options || {};
    if ((0, import_Pipeline.isPipelineLike)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      pipeline = credentialOrPipelineOrContainerName;
      options = blobNameOrOptions;
    } else if (import_core_util.isNodeLike && credentialOrPipelineOrContainerName instanceof import_storage_common.StorageSharedKeyCredential || credentialOrPipelineOrContainerName instanceof import_storage_common.AnonymousCredential || (0, import_core_auth.isTokenCredential)(credentialOrPipelineOrContainerName)) {
      url = urlOrConnectionString;
      options = blobNameOrOptions;
      pipeline = (0, import_Pipeline.newPipeline)(credentialOrPipelineOrContainerName, options);
    } else if (!credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName !== "string") {
      url = urlOrConnectionString;
      options = blobNameOrOptions;
      pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
    } else if (credentialOrPipelineOrContainerName && typeof credentialOrPipelineOrContainerName === "string" && blobNameOrOptions && typeof blobNameOrOptions === "string") {
      const containerName = credentialOrPipelineOrContainerName;
      const blobName = blobNameOrOptions;
      const extractedCreds = (0, import_utils_common.extractConnectionStringParts)(urlOrConnectionString);
      if (extractedCreds.kind === "AccountConnString") {
        if (import_core_util.isNodeLike) {
          const sharedKeyCredential = new import_storage_common.StorageSharedKeyCredential(
            extractedCreds.accountName,
            extractedCreds.accountKey
          );
          url = (0, import_utils_common.appendToURLPath)(
            (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
            encodeURIComponent(blobName)
          );
          if (!options.proxyOptions) {
            options.proxyOptions = (0, import_core_rest_pipeline.getDefaultProxySettings)(extractedCreds.proxyUri);
          }
          pipeline = (0, import_Pipeline.newPipeline)(sharedKeyCredential, options);
        } else {
          throw new Error("Account connection string is only supported in Node.js environment");
        }
      } else if (extractedCreds.kind === "SASConnString") {
        url = (0, import_utils_common.appendToURLPath)(
          (0, import_utils_common.appendToURLPath)(extractedCreds.url, encodeURIComponent(containerName)),
          encodeURIComponent(blobName)
        ) + "?" + extractedCreds.accountSas;
        pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
      } else {
        throw new Error(
          "Connection string must be either an Account connection string or a SAS connection string"
        );
      }
    } else {
      throw new Error("Expecting non-empty strings for containerName and blobName parameters");
    }
    super(url, pipeline);
    this.pageBlobContext = this.storageClientContext.pageBlob;
    this.blobClientConfig = options;
  }
  /**
   * Creates a new PageBlobClient object identical to the source but with the
   * specified snapshot timestamp.
   * Provide "" will remove the snapshot and return a Client to the base blob.
   *
   * @param snapshot - The snapshot timestamp.
   * @returns A new PageBlobClient object identical to the source but with the specified snapshot timestamp.
   */
  withSnapshot(snapshot) {
    return new PageBlobClient(
      (0, import_utils_common.setURLParameter)(
        this.url,
        import_constants.URLConstants.Parameters.SNAPSHOT,
        snapshot.length === 0 ? void 0 : snapshot
      ),
      this.pipeline,
      this.blobClientConfig
    );
  }
  /**
   * Creates a page blob of the specified length. Call uploadPages to upload data
   * data to a page blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param size - size of the page blob.
   * @param options - Options to the Page Blob Create operation.
   * @returns Response data for the Page Blob Create operation.
   */
  async create(size, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("PageBlobClient-create", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.pageBlobContext.create(0, size, {
          abortSignal: options.abortSignal,
          blobHttpHeaders: options.blobHTTPHeaders,
          blobSequenceNumber: options.blobSequenceNumber,
          leaseAccessConditions: options.conditions,
          metadata: options.metadata,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          cpkInfo: options.customerProvidedKey,
          encryptionScope: options.encryptionScope,
          immutabilityPolicyExpiry: options.immutabilityPolicy?.expiriesOn,
          immutabilityPolicyMode: options.immutabilityPolicy?.policyMode,
          legalHold: options.legalHold,
          tier: (0, import_models.toAccessTier)(options.tier),
          blobTagsString: (0, import_utils_common.toBlobTagsString)(options.tags),
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Creates a page blob of the specified length. Call uploadPages to upload data
   * data to a page blob. If the blob with the same name already exists, the content
   * of the existing blob will remain unchanged.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-blob
   *
   * @param size - size of the page blob.
   * @param options -
   */
  async createIfNotExists(size, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-createIfNotExists",
      options,
      async (updatedOptions) => {
        try {
          const conditions = { ifNoneMatch: import_constants.ETagAny };
          const res = (0, import_utils_common.assertResponse)(
            await this.create(size, {
              ...options,
              conditions,
              tracingOptions: updatedOptions.tracingOptions
            })
          );
          return {
            succeeded: true,
            ...res,
            _response: res._response
            // _response is made non-enumerable
          };
        } catch (e) {
          if (e.details?.errorCode === "BlobAlreadyExists") {
            return {
              succeeded: false,
              ...e.response?.parsedHeaders,
              _response: e.response
            };
          }
          throw e;
        }
      }
    );
  }
  /**
   * Writes 1 or more pages to the page blob. The start and end offsets must be a multiple of 512.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-page
   *
   * @param body - Data to upload
   * @param offset - Offset of destination page blob
   * @param count - Content length of the body, also number of bytes to be uploaded
   * @param options - Options to the Page Blob Upload Pages operation.
   * @returns Response data for the Page Blob Upload Pages operation.
   */
  async uploadPages(body, offset, count, options = {}) {
    options.conditions = options.conditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan("PageBlobClient-uploadPages", options, async (updatedOptions) => {
      const parameters = {
        abortSignal: options.abortSignal,
        leaseAccessConditions: options.conditions,
        modifiedAccessConditions: {
          ...options.conditions,
          ifTags: options.conditions?.tagConditions
        },
        requestOptions: {
          onUploadProgress: options.onProgress
        },
        range: (0, import_Range.rangeToString)({ offset, count }),
        sequenceNumberAccessConditions: options.conditions,
        cpkInfo: options.customerProvidedKey,
        encryptionScope: options.encryptionScope,
        tracingOptions: updatedOptions.tracingOptions
      };
      const uploadBodyParameters = await (0, import_utils_common.setUploadChecksumParameters)(
        body,
        count,
        parameters,
        options,
        this.blobClientConfig?.uploadContentChecksumAlgorithm
      );
      return (0, import_utils_common.assertResponse)(
        await this.pageBlobContext.uploadPages(
          uploadBodyParameters.contentLength,
          uploadBodyParameters.body,
          parameters
        )
      );
    });
  }
  /**
   * The Upload Pages operation writes a range of pages to a page blob where the
   * contents are read from a URL.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-page-from-url
   *
   * @param sourceURL - Specify a URL to the copy source, Shared Access Signature(SAS) maybe needed for authentication
   * @param sourceOffset - The source offset to copy from. Pass 0 to copy from the beginning of source page blob
   * @param destOffset - Offset of destination page blob
   * @param count - Number of bytes to be uploaded from source page blob
   * @param options -
   */
  async uploadPagesFromURL(sourceURL, sourceOffset, destOffset, count, options = {}) {
    options.conditions = options.conditions || {};
    options.sourceConditions = options.sourceConditions || {};
    (0, import_models.ensureCpkIfSpecified)(options.customerProvidedKey, this.isHttps);
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-uploadPagesFromURL",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.uploadPagesFromURL(
            sourceURL,
            (0, import_Range.rangeToString)({ offset: sourceOffset, count }),
            0,
            (0, import_Range.rangeToString)({ offset: destOffset, count }),
            {
              abortSignal: options.abortSignal,
              sourceContentMD5: options.sourceContentMD5,
              sourceContentCrc64: options.sourceContentCrc64,
              leaseAccessConditions: options.conditions,
              sequenceNumberAccessConditions: options.conditions,
              modifiedAccessConditions: {
                ...options.conditions,
                ifTags: options.conditions?.tagConditions
              },
              sourceModifiedAccessConditions: {
                sourceIfMatch: options.sourceConditions?.ifMatch,
                sourceIfModifiedSince: options.sourceConditions?.ifModifiedSince,
                sourceIfNoneMatch: options.sourceConditions?.ifNoneMatch,
                sourceIfUnmodifiedSince: options.sourceConditions?.ifUnmodifiedSince
              },
              cpkInfo: options.customerProvidedKey,
              encryptionScope: options.encryptionScope,
              copySourceAuthorization: (0, import_utils_common.httpAuthorizationToString)(options.sourceAuthorization),
              fileRequestIntent: options.sourceShareTokenIntent,
              tracingOptions: updatedOptions.tracingOptions,
              sourceCpkInfo: {
                sourceEncryptionKey: options.sourceCustomerProvidedKey?.encryptionKey,
                sourceEncryptionAlgorithm: options.sourceCustomerProvidedKey?.encryptionAlgorithm,
                sourceEncryptionKeySha256: options.sourceCustomerProvidedKey?.encryptionKeySha256
              }
            }
          )
        );
      }
    );
  }
  /**
   * Frees the specified pages from the page blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/put-page
   *
   * @param offset - Starting byte position of the pages to clear.
   * @param count - Number of bytes to clear.
   * @param options - Options to the Page Blob Clear Pages operation.
   * @returns Response data for the Page Blob Clear Pages operation.
   */
  async clearPages(offset = 0, count, options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan("PageBlobClient-clearPages", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.pageBlobContext.clearPages(0, {
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          range: (0, import_Range.rangeToString)({ offset, count }),
          sequenceNumberAccessConditions: options.conditions,
          cpkInfo: options.customerProvidedKey,
          encryptionScope: options.encryptionScope,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Returns the list of valid page ranges for a page blob or snapshot of a page blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param options - Options to the Page Blob Get Ranges operation.
   * @returns Response data for the Page Blob Get Ranges operation.
   */
  async getPageRanges(offset = 0, count, options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-getPageRanges",
      options,
      async (updatedOptions) => {
        const response = (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.getPageRanges({
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            range: (0, import_Range.rangeToString)({ offset, count }),
            tracingOptions: updatedOptions.tracingOptions
          })
        );
        return (0, import_PageBlobRangeResponse.rangeResponseFromModel)(response);
      }
    );
  }
  /**
   * getPageRangesSegment returns a single segment of page ranges starting from the
   * specified Marker. Use an empty Marker to start enumeration from the beginning.
   * After getting a segment, process it, and then call getPageRangesSegment again
   * (passing the the previously-returned Marker) to get the next segment.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param marker - A string value that identifies the portion of the list to be returned with the next list operation.
   * @param options - Options to PageBlob Get Page Ranges Segment operation.
   */
  async listPageRangesSegment(offset = 0, count, marker, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-getPageRangesSegment",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.getPageRanges({
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            range: (0, import_Range.rangeToString)({ offset, count }),
            marker,
            maxPageSize: options.maxPageSize,
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
  /**
   * Returns an AsyncIterableIterator for {@link PageBlobGetPageRangesResponseModel}
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param marker - A string value that identifies the portion of
   *                          the get of page ranges to be returned with the next getting operation. The
   *                          operation returns the ContinuationToken value within the response body if the
   *                          getting operation did not return all page ranges remaining within the current page.
   *                          The ContinuationToken value can be used as the value for
   *                          the marker parameter in a subsequent call to request the next page of get
   *                          items. The marker value is opaque to the client.
   * @param options - Options to List Page Ranges operation.
   */
  async *listPageRangeItemSegments(offset = 0, count, marker, options = {}) {
    let getPageRangeItemSegmentsResponse;
    if (!!marker || marker === void 0) {
      do {
        getPageRangeItemSegmentsResponse = await this.listPageRangesSegment(
          offset,
          count,
          marker,
          options
        );
        marker = getPageRangeItemSegmentsResponse.continuationToken;
        yield await getPageRangeItemSegmentsResponse;
      } while (marker);
    }
  }
  /**
   * Returns an AsyncIterableIterator of {@link PageRangeInfo} objects
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param options - Options to List Page Ranges operation.
   */
  async *listPageRangeItems(offset = 0, count, options = {}) {
    let marker;
    for await (const getPageRangesSegment of this.listPageRangeItemSegments(
      offset,
      count,
      marker,
      options
    )) {
      yield* (0, import_utils_common.ExtractPageRangeInfoItems)(getPageRangesSegment);
    }
  }
  /**
   * Returns an async iterable iterator to list of page ranges for a page blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   *  .byPage() returns an async iterable iterator to list of page ranges for a page blob.
   *
   * ```ts snippet:ClientsListPageBlobs
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const pageBlobClient = containerClient.getPageBlobClient(blobName);
   *
   * // Example using `for await` syntax
   * let i = 1;
   * for await (const pageRange of pageBlobClient.listPageRanges()) {
   *   console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   * }
   *
   * // Example using `iter.next()` syntax
   * i = 1;
   * const iter = pageBlobClient.listPageRanges();
   * let { value, done } = await iter.next();
   * while (!done) {
   *   console.log(`Page range ${i++}: ${value.start} - ${value.end}`);
   *   ({ value, done } = await iter.next());
   * }
   *
   * // Example using `byPage()` syntax
   * i = 1;
   * for await (const page of pageBlobClient.listPageRanges().byPage({ maxPageSize: 20 })) {
   *   for (const pageRange of page.pageRange || []) {
   *     console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   *   }
   * }
   *
   * // Example using paging with a marker
   * i = 1;
   * let iterator = pageBlobClient.listPageRanges().byPage({ maxPageSize: 2 });
   * let response = (await iterator.next()).value;
   * // Prints 2 page ranges
   * if (response.pageRange) {
   *   for (const pageRange of response.pageRange) {
   *     console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   *   }
   * }
   * // Gets next marker
   * let marker = response.continuationToken;
   * // Passing next marker as continuationToken
   * iterator = pageBlobClient.listPageRanges().byPage({ continuationToken: marker, maxPageSize: 10 });
   * response = (await iterator.next()).value;
   * // Prints 10 page ranges
   * if (response.pageRange) {
   *   for (const pageRange of response.pageRange) {
   *     console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   *   }
   * }
   * ```
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param options - Options to the Page Blob Get Ranges operation.
   * @returns An asyncIterableIterator that supports paging.
   */
  listPageRanges(offset = 0, count, options = {}) {
    options.conditions = options.conditions || {};
    const iter = this.listPageRangeItems(offset, count, options);
    return {
      /**
       * The next method, part of the iteration protocol
       */
      next() {
        return iter.next();
      },
      /**
       * The connection to the async iterator, part of the iteration protocol
       */
      [Symbol.asyncIterator]() {
        return this;
      },
      /**
       * Return an AsyncIterableIterator that works a page at a time
       */
      byPage: (settings = {}) => {
        return this.listPageRangeItemSegments(offset, count, settings.continuationToken, {
          maxPageSize: settings.maxPageSize,
          ...options
        });
      }
    };
  }
  /**
   * Gets the collection of page ranges that differ between a specified snapshot and this page blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   * @param offset - Starting byte position of the page blob
   * @param count - Number of bytes to get ranges diff.
   * @param prevSnapshot - Timestamp of snapshot to retrieve the difference.
   * @param options - Options to the Page Blob Get Page Ranges Diff operation.
   * @returns Response data for the Page Blob Get Page Range Diff operation.
   */
  async getPageRangesDiff(offset, count, prevSnapshot, options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-getPageRangesDiff",
      options,
      async (updatedOptions) => {
        const result = (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.getPageRangesDiff({
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            prevsnapshot: prevSnapshot,
            range: (0, import_Range.rangeToString)({ offset, count }),
            tracingOptions: updatedOptions.tracingOptions
          })
        );
        return (0, import_PageBlobRangeResponse.rangeResponseFromModel)(result);
      }
    );
  }
  /**
   * getPageRangesDiffSegment returns a single segment of page ranges starting from the
   * specified Marker for difference between previous snapshot and the target page blob.
   * Use an empty Marker to start enumeration from the beginning.
   * After getting a segment, process it, and then call getPageRangesDiffSegment again
   * (passing the the previously-returned Marker) to get the next segment.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param prevSnapshotOrUrl - Timestamp of snapshot to retrieve the difference or URL of snapshot to retrieve the difference.
   * @param marker - A string value that identifies the portion of the get to be returned with the next get operation.
   * @param options - Options to the Page Blob Get Page Ranges Diff operation.
   */
  async listPageRangesDiffSegment(offset, count, prevSnapshotOrUrl, marker, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-getPageRangesDiffSegment",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.getPageRangesDiff({
            abortSignal: options?.abortSignal,
            leaseAccessConditions: options?.conditions,
            modifiedAccessConditions: {
              ...options?.conditions,
              ifTags: options?.conditions?.tagConditions
            },
            prevsnapshot: prevSnapshotOrUrl,
            range: (0, import_Range.rangeToString)({
              offset,
              count
            }),
            marker,
            maxPageSize: options?.maxPageSize,
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
  /**
   * Returns an AsyncIterableIterator for {@link PageBlobGetPageRangesDiffResponseModel}
   *
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param prevSnapshotOrUrl - Timestamp of snapshot to retrieve the difference or URL of snapshot to retrieve the difference.
   * @param marker - A string value that identifies the portion of
   *                          the get of page ranges to be returned with the next getting operation. The
   *                          operation returns the ContinuationToken value within the response body if the
   *                          getting operation did not return all page ranges remaining within the current page.
   *                          The ContinuationToken value can be used as the value for
   *                          the marker parameter in a subsequent call to request the next page of get
   *                          items. The marker value is opaque to the client.
   * @param options - Options to the Page Blob Get Page Ranges Diff operation.
   */
  async *listPageRangeDiffItemSegments(offset, count, prevSnapshotOrUrl, marker, options) {
    let getPageRangeItemSegmentsResponse;
    if (!!marker || marker === void 0) {
      do {
        getPageRangeItemSegmentsResponse = await this.listPageRangesDiffSegment(
          offset,
          count,
          prevSnapshotOrUrl,
          marker,
          options
        );
        marker = getPageRangeItemSegmentsResponse.continuationToken;
        yield await getPageRangeItemSegmentsResponse;
      } while (marker);
    }
  }
  /**
   * Returns an AsyncIterableIterator of {@link PageRangeInfo} objects
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param prevSnapshotOrUrl - Timestamp of snapshot to retrieve the difference or URL of snapshot to retrieve the difference.
   * @param options - Options to the Page Blob Get Page Ranges Diff operation.
   */
  async *listPageRangeDiffItems(offset, count, prevSnapshotOrUrl, options) {
    let marker;
    for await (const getPageRangesSegment of this.listPageRangeDiffItemSegments(
      offset,
      count,
      prevSnapshotOrUrl,
      marker,
      options
    )) {
      yield* (0, import_utils_common.ExtractPageRangeInfoItems)(getPageRangesSegment);
    }
  }
  /**
   * Returns an async iterable iterator to list of page ranges that differ between a specified snapshot and this page blob.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   *  .byPage() returns an async iterable iterator to list of page ranges that differ between a specified snapshot and this page blob.
   *
   * ```ts snippet:ClientsListPageBlobsDiff
   * import { BlobServiceClient } from "@azure/storage-blob";
   * import { DefaultAzureCredential } from "@azure/identity";
   *
   * const account = "<account>";
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   new DefaultAzureCredential(),
   * );
   *
   * const containerName = "<container name>";
   * const blobName = "<blob name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const pageBlobClient = containerClient.getPageBlobClient(blobName);
   *
   * const offset = 0;
   * const count = 1024;
   * const previousSnapshot = "<previous snapshot>";
   * // Example using `for await` syntax
   * let i = 1;
   * for await (const pageRange of pageBlobClient.listPageRangesDiff(offset, count, previousSnapshot)) {
   *   console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   * }
   *
   * // Example using `iter.next()` syntax
   * i = 1;
   * const iter = pageBlobClient.listPageRangesDiff(offset, count, previousSnapshot);
   * let { value, done } = await iter.next();
   * while (!done) {
   *   console.log(`Page range ${i++}: ${value.start} - ${value.end}`);
   *   ({ value, done } = await iter.next());
   * }
   *
   * // Example using `byPage()` syntax
   * i = 1;
   * for await (const page of pageBlobClient
   *   .listPageRangesDiff(offset, count, previousSnapshot)
   *   .byPage({ maxPageSize: 20 })) {
   *   for (const pageRange of page.pageRange || []) {
   *     console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   *   }
   * }
   *
   * // Example using paging with a marker
   * i = 1;
   * let iterator = pageBlobClient
   *   .listPageRangesDiff(offset, count, previousSnapshot)
   *   .byPage({ maxPageSize: 2 });
   * let response = (await iterator.next()).value;
   * // Prints 2 page ranges
   * if (response.pageRange) {
   *   for (const pageRange of response.pageRange) {
   *     console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   *   }
   * }
   * // Gets next marker
   * let marker = response.continuationToken;
   * // Passing next marker as continuationToken
   * iterator = pageBlobClient
   *   .listPageRangesDiff(offset, count, previousSnapshot)
   *   .byPage({ continuationToken: marker, maxPageSize: 10 });
   * response = (await iterator.next()).value;
   * // Prints 10 page ranges
   * if (response.pageRange) {
   *   for (const pageRange of response.pageRange) {
   *     console.log(`Page range ${i++}: ${pageRange.start} - ${pageRange.end}`);
   *   }
   * }
   * ```
   *
   * @param offset - Starting byte position of the page ranges.
   * @param count - Number of bytes to get.
   * @param prevSnapshot - Timestamp of snapshot to retrieve the difference.
   * @param options - Options to the Page Blob Get Ranges operation.
   * @returns An asyncIterableIterator that supports paging.
   */
  listPageRangesDiff(offset, count, prevSnapshot, options = {}) {
    options.conditions = options.conditions || {};
    const iter = this.listPageRangeDiffItems(offset, count, prevSnapshot, {
      ...options
    });
    return {
      /**
       * The next method, part of the iteration protocol
       */
      next() {
        return iter.next();
      },
      /**
       * The connection to the async iterator, part of the iteration protocol
       */
      [Symbol.asyncIterator]() {
        return this;
      },
      /**
       * Return an AsyncIterableIterator that works a page at a time
       */
      byPage: (settings = {}) => {
        return this.listPageRangeDiffItemSegments(
          offset,
          count,
          prevSnapshot,
          settings.continuationToken,
          {
            maxPageSize: settings.maxPageSize,
            ...options
          }
        );
      }
    };
  }
  /**
   * Gets the collection of page ranges that differ between a specified snapshot and this page blob for managed disks.
   * @see https://learn.microsoft.com/rest/api/storageservices/get-page-ranges
   *
   * @param offset - Starting byte position of the page blob
   * @param count - Number of bytes to get ranges diff.
   * @param prevSnapshotUrl - URL of snapshot to retrieve the difference.
   * @param options - Options to the Page Blob Get Page Ranges Diff operation.
   * @returns Response data for the Page Blob Get Page Range Diff operation.
   */
  async getPageRangesDiffForManagedDisks(offset, count, prevSnapshotUrl, options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-GetPageRangesDiffForManagedDisks",
      options,
      async (updatedOptions) => {
        const response = (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.getPageRangesDiff({
            abortSignal: options.abortSignal,
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            prevSnapshotUrl,
            range: (0, import_Range.rangeToString)({ offset, count }),
            tracingOptions: updatedOptions.tracingOptions
          })
        );
        return (0, import_PageBlobRangeResponse.rangeResponseFromModel)(response);
      }
    );
  }
  /**
   * Resizes the page blob to the specified size (which must be a multiple of 512).
   * @see https://learn.microsoft.com/rest/api/storageservices/set-blob-properties
   *
   * @param size - Target size
   * @param options - Options to the Page Blob Resize operation.
   * @returns Response data for the Page Blob Resize operation.
   */
  async resize(size, options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan("PageBlobClient-resize", options, async (updatedOptions) => {
      return (0, import_utils_common.assertResponse)(
        await this.pageBlobContext.resize(size, {
          abortSignal: options.abortSignal,
          leaseAccessConditions: options.conditions,
          modifiedAccessConditions: {
            ...options.conditions,
            ifTags: options.conditions?.tagConditions
          },
          encryptionScope: options.encryptionScope,
          tracingOptions: updatedOptions.tracingOptions
        })
      );
    });
  }
  /**
   * Sets a page blob's sequence number.
   * @see https://learn.microsoft.com/rest/api/storageservices/set-blob-properties
   *
   * @param sequenceNumberAction - Indicates how the service should modify the blob's sequence number.
   * @param sequenceNumber - Required if sequenceNumberAction is max or update
   * @param options - Options to the Page Blob Update Sequence Number operation.
   * @returns Response data for the Page Blob Update Sequence Number operation.
   */
  async updateSequenceNumber(sequenceNumberAction, sequenceNumber, options = {}) {
    options.conditions = options.conditions || {};
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-updateSequenceNumber",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.updateSequenceNumber(sequenceNumberAction, {
            abortSignal: options.abortSignal,
            blobSequenceNumber: sequenceNumber,
            leaseAccessConditions: options.conditions,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
  /**
   * Begins an operation to start an incremental copy from one page blob's snapshot to this page blob.
   * The snapshot is copied such that only the differential changes between the previously
   * copied snapshot are transferred to the destination.
   * The copied snapshots are complete copies of the original snapshot and can be read or copied from as usual.
   * @see https://learn.microsoft.com/rest/api/storageservices/incremental-copy-blob
   * @see https://learn.microsoft.com/azure/virtual-machines/windows/incremental-snapshots
   *
   * @param copySource - Specifies the name of the source page blob snapshot. For example,
   *                            https://myaccount.blob.core.windows.net/mycontainer/myblob?snapshot=<DateTime>
   * @param options - Options to the Page Blob Copy Incremental operation.
   * @returns Response data for the Page Blob Copy Incremental operation.
   */
  async startCopyIncremental(copySource, options = {}) {
    return import_tracing.tracingClient.withSpan(
      "PageBlobClient-startCopyIncremental",
      options,
      async (updatedOptions) => {
        return (0, import_utils_common.assertResponse)(
          await this.pageBlobContext.copyIncremental(copySource, {
            abortSignal: options.abortSignal,
            modifiedAccessConditions: {
              ...options.conditions,
              ifTags: options.conditions?.tagConditions
            },
            tracingOptions: updatedOptions.tracingOptions
          })
        );
      }
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AppendBlobClient,
  BlobClient,
  BlockBlobClient,
  PageBlobClient
});
//# sourceMappingURL=Clients.js.map
