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
var BlobBatchClient_exports = {};
__export(BlobBatchClient_exports, {
  BlobBatchClient: () => BlobBatchClient
});
module.exports = __toCommonJS(BlobBatchClient_exports);
var import_BatchResponseParser = require("./BatchResponseParser.js");
var import_BatchUtils = require("./BatchUtils.js");
var import_BlobBatch = require("./BlobBatch.js");
var import_tracing = require("./utils/tracing.js");
var import_storage_common = require("@azure/storage-common");
var import_StorageContextClient = require("./StorageContextClient.js");
var import_Pipeline = require("./Pipeline.js");
var import_utils_common = require("./utils/utils.common.js");
class BlobBatchClient {
  serviceOrContainerContext;
  constructor(url, credentialOrPipeline, options) {
    let pipeline;
    if ((0, import_Pipeline.isPipelineLike)(credentialOrPipeline)) {
      pipeline = credentialOrPipeline;
    } else if (!credentialOrPipeline) {
      pipeline = (0, import_Pipeline.newPipeline)(new import_storage_common.AnonymousCredential(), options);
    } else {
      pipeline = (0, import_Pipeline.newPipeline)(credentialOrPipeline, options);
    }
    const storageClientContext = new import_StorageContextClient.StorageContextClient(url, (0, import_Pipeline.getCoreClientOptions)(pipeline));
    const path = (0, import_utils_common.getURLPath)(url);
    if (path && path !== "/") {
      this.serviceOrContainerContext = storageClientContext.container;
    } else {
      this.serviceOrContainerContext = storageClientContext.service;
    }
  }
  /**
   * Creates a {@link BlobBatch}.
   * A BlobBatch represents an aggregated set of operations on blobs.
   */
  createBatch() {
    return new import_BlobBatch.BlobBatch();
  }
  async deleteBlobs(urlsOrBlobClients, credentialOrOptions, options) {
    const batch = new import_BlobBatch.BlobBatch();
    for (const urlOrBlobClient of urlsOrBlobClients) {
      if (typeof urlOrBlobClient === "string") {
        await batch.deleteBlob(urlOrBlobClient, credentialOrOptions, options);
      } else {
        await batch.deleteBlob(urlOrBlobClient, credentialOrOptions);
      }
    }
    return this.submitBatch(batch);
  }
  async setBlobsAccessTier(urlsOrBlobClients, credentialOrTier, tierOrOptions, options) {
    const batch = new import_BlobBatch.BlobBatch();
    for (const urlOrBlobClient of urlsOrBlobClients) {
      if (typeof urlOrBlobClient === "string") {
        await batch.setBlobAccessTier(
          urlOrBlobClient,
          credentialOrTier,
          tierOrOptions,
          options
        );
      } else {
        await batch.setBlobAccessTier(
          urlOrBlobClient,
          credentialOrTier,
          tierOrOptions
        );
      }
    }
    return this.submitBatch(batch);
  }
  /**
   * Submit batch request which consists of multiple subrequests.
   *
   * Get `blobBatchClient` and other details before running the snippets.
   * `blobServiceClient.getBlobBatchClient()` gives the `blobBatchClient`
   *
   * Example usage:
   *
   * ```ts snippet:BlobBatchClientSubmitBatch
   * import { DefaultAzureCredential } from "@azure/identity";
   * import { BlobServiceClient, BlobBatch } from "@azure/storage-blob";
   *
   * const account = "<account>";
   * const credential = new DefaultAzureCredential();
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   credential,
   * );
   *
   * const containerName = "<container name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const blobBatchClient = containerClient.getBlobBatchClient();
   *
   * const batchRequest = new BlobBatch();
   * await batchRequest.deleteBlob("<blob-url-1>", credential);
   * await batchRequest.deleteBlob("<blob-url-2>", credential, {
   *   deleteSnapshots: "include",
   * });
   * const batchResp = await blobBatchClient.submitBatch(batchRequest);
   * console.log(batchResp.subResponsesSucceededCount);
   * ```
   *
   * Example using a lease:
   *
   * ```ts snippet:BlobBatchClientSubmitBatchWithLease
   * import { DefaultAzureCredential } from "@azure/identity";
   * import { BlobServiceClient, BlobBatch } from "@azure/storage-blob";
   *
   * const account = "<account>";
   * const credential = new DefaultAzureCredential();
   * const blobServiceClient = new BlobServiceClient(
   *   `https://${account}.blob.core.windows.net`,
   *   credential,
   * );
   *
   * const containerName = "<container name>";
   * const containerClient = blobServiceClient.getContainerClient(containerName);
   * const blobBatchClient = containerClient.getBlobBatchClient();
   * const blobClient = containerClient.getBlobClient("<blob name>");
   *
   * const batchRequest = new BlobBatch();
   * await batchRequest.setBlobAccessTier(blobClient, "Cool");
   * await batchRequest.setBlobAccessTier(blobClient, "Cool", {
   *   conditions: { leaseId: "<lease-id>" },
   * });
   * const batchResp = await blobBatchClient.submitBatch(batchRequest);
   * console.log(batchResp.subResponsesSucceededCount);
   * ```
   *
   * @see https://learn.microsoft.com/rest/api/storageservices/blob-batch
   *
   * @param batchRequest - A set of Delete or SetTier operations.
   * @param options -
   */
  async submitBatch(batchRequest, options = {}) {
    if (!batchRequest || batchRequest.getSubRequests().size === 0) {
      throw new RangeError("Batch request should contain one or more sub requests.");
    }
    return import_tracing.tracingClient.withSpan(
      "BlobBatchClient-submitBatch",
      options,
      async (updatedOptions) => {
        const batchRequestBody = batchRequest.getHttpRequestBody();
        const rawBatchResponse = (0, import_utils_common.assertResponse)(
          await this.serviceOrContainerContext.submitBatch(
            (0, import_BatchUtils.utf8ByteLength)(batchRequestBody),
            batchRequest.getMultiPartContentType(),
            batchRequestBody,
            {
              ...updatedOptions
            }
          )
        );
        const batchResponseParser = new import_BatchResponseParser.BatchResponseParser(
          rawBatchResponse,
          batchRequest.getSubRequests()
        );
        const responseSummary = await batchResponseParser.parseBatchResponse();
        const res = {
          _response: rawBatchResponse._response,
          contentType: rawBatchResponse.contentType,
          errorCode: rawBatchResponse.errorCode,
          requestId: rawBatchResponse.requestId,
          clientRequestId: rawBatchResponse.clientRequestId,
          version: rawBatchResponse.version,
          subResponses: responseSummary.subResponses,
          subResponsesSucceededCount: responseSummary.subResponsesSucceededCount,
          subResponsesFailedCount: responseSummary.subResponsesFailedCount
        };
        return res;
      }
    );
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlobBatchClient
});
//# sourceMappingURL=BlobBatchClient.js.map
