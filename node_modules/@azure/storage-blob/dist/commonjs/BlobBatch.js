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
var BlobBatch_exports = {};
__export(BlobBatch_exports, {
  BlobBatch: () => BlobBatch
});
module.exports = __toCommonJS(BlobBatch_exports);
var import_core_util = require("@azure/core-util");
var import_core_auth = require("@azure/core-auth");
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_core_util2 = require("@azure/core-util");
var import_storage_common = require("@azure/storage-common");
var import_Clients = require("./Clients.js");
var import_Mutex = require("./utils/Mutex.js");
var import_Pipeline = require("./Pipeline.js");
var import_utils_common = require("./utils/utils.common.js");
var import_core_xml = require("@azure/core-xml");
var import_constants = require("./utils/constants.js");
var import_tracing = require("./utils/tracing.js");
var import_core_client = require("@azure/core-client");
class BlobBatch {
  batchRequest;
  batch = "batch";
  batchType;
  constructor() {
    this.batchRequest = new InnerBatchRequest();
  }
  /**
   * Get the value of Content-Type for a batch request.
   * The value must be multipart/mixed with a batch boundary.
   * Example: multipart/mixed; boundary=batch_a81786c8-e301-4e42-a729-a32ca24ae252
   */
  getMultiPartContentType() {
    return this.batchRequest.getMultipartContentType();
  }
  /**
   * Get assembled HTTP request body for sub requests.
   */
  getHttpRequestBody() {
    return this.batchRequest.getHttpRequestBody();
  }
  /**
   * Get sub requests that are added into the batch request.
   */
  getSubRequests() {
    return this.batchRequest.getSubRequests();
  }
  async addSubRequestInternal(subRequest, assembleSubRequestFunc) {
    await import_Mutex.Mutex.lock(this.batch);
    try {
      this.batchRequest.preAddSubRequest(subRequest);
      await assembleSubRequestFunc();
      this.batchRequest.postAddSubRequest(subRequest);
    } finally {
      await import_Mutex.Mutex.unlock(this.batch);
    }
  }
  setBatchType(batchType) {
    if (!this.batchType) {
      this.batchType = batchType;
    }
    if (this.batchType !== batchType) {
      throw new RangeError(
        `BlobBatch only supports one operation type per batch and it already is being used for ${this.batchType} operations.`
      );
    }
  }
  async deleteBlob(urlOrBlobClient, credentialOrOptions, options) {
    let url;
    let credential;
    if (typeof urlOrBlobClient === "string" && (import_core_util2.isNodeLike && credentialOrOptions instanceof import_storage_common.StorageSharedKeyCredential || credentialOrOptions instanceof import_storage_common.AnonymousCredential || (0, import_core_auth.isTokenCredential)(credentialOrOptions))) {
      url = urlOrBlobClient;
      credential = credentialOrOptions;
    } else if (urlOrBlobClient instanceof import_Clients.BlobClient) {
      url = urlOrBlobClient.url;
      credential = urlOrBlobClient.credential;
      options = credentialOrOptions;
    } else {
      throw new RangeError(
        "Invalid arguments. Either url and credential, or BlobClient need be provided."
      );
    }
    if (!options) {
      options = {};
    }
    return import_tracing.tracingClient.withSpan(
      "BatchDeleteRequest-addSubRequest",
      options,
      async (updatedOptions) => {
        this.setBatchType("delete");
        await this.addSubRequestInternal(
          {
            url,
            credential
          },
          async () => {
            await new import_Clients.BlobClient(url, this.batchRequest.createPipeline(credential)).delete(
              updatedOptions
            );
          }
        );
      }
    );
  }
  async setBlobAccessTier(urlOrBlobClient, credentialOrTier, tierOrOptions, options) {
    let url;
    let credential;
    let tier;
    if (typeof urlOrBlobClient === "string" && (import_core_util2.isNodeLike && credentialOrTier instanceof import_storage_common.StorageSharedKeyCredential || credentialOrTier instanceof import_storage_common.AnonymousCredential || (0, import_core_auth.isTokenCredential)(credentialOrTier))) {
      url = urlOrBlobClient;
      credential = credentialOrTier;
      tier = tierOrOptions;
    } else if (urlOrBlobClient instanceof import_Clients.BlobClient) {
      url = urlOrBlobClient.url;
      credential = urlOrBlobClient.credential;
      tier = credentialOrTier;
      options = tierOrOptions;
    } else {
      throw new RangeError(
        "Invalid arguments. Either url and credential, or BlobClient need be provided."
      );
    }
    if (!options) {
      options = {};
    }
    return import_tracing.tracingClient.withSpan(
      "BatchSetTierRequest-addSubRequest",
      options,
      async (updatedOptions) => {
        this.setBatchType("setAccessTier");
        await this.addSubRequestInternal(
          {
            url,
            credential
          },
          async () => {
            await new import_Clients.BlobClient(url, this.batchRequest.createPipeline(credential)).setAccessTier(
              tier,
              updatedOptions
            );
          }
        );
      }
    );
  }
}
class InnerBatchRequest {
  operationCount;
  body;
  subRequests;
  boundary;
  subRequestPrefix;
  multipartContentType;
  batchRequestEnding;
  constructor() {
    this.operationCount = 0;
    this.body = "";
    const tempGuid = (0, import_core_util.randomUUID)();
    this.boundary = `batch_${tempGuid}`;
    this.subRequestPrefix = `--${this.boundary}${import_constants.HTTP_LINE_ENDING}${import_constants.HeaderConstants.CONTENT_TYPE}: application/http${import_constants.HTTP_LINE_ENDING}${import_constants.HeaderConstants.CONTENT_TRANSFER_ENCODING}: binary`;
    this.multipartContentType = `multipart/mixed; boundary=${this.boundary}`;
    this.batchRequestEnding = `--${this.boundary}--`;
    this.subRequests = /* @__PURE__ */ new Map();
  }
  /**
   * Create pipeline to assemble sub requests. The idea here is to use existing
   * credential and serialization/deserialization components, with additional policies to
   * filter unnecessary headers, assemble sub requests into request's body
   * and intercept request from going to wire.
   * @param credential -  Such as AnonymousCredential, StorageSharedKeyCredential or any credential from the `@azure/identity` package to authenticate requests to the service. You can also provide an object that implements the TokenCredential interface. If not specified, AnonymousCredential is used.
   */
  createPipeline(credential) {
    const corePipeline = (0, import_core_rest_pipeline.createEmptyPipeline)();
    corePipeline.addPolicy(
      (0, import_core_client.serializationPolicy)({
        stringifyXML: import_core_xml.stringifyXML,
        serializerOptions: {
          xml: {
            xmlCharKey: "#"
          }
        }
      }),
      { phase: "Serialize" }
    );
    corePipeline.addPolicy(batchHeaderFilterPolicy());
    corePipeline.addPolicy(batchRequestAssemblePolicy(this), { afterPhase: "Sign" });
    if ((0, import_core_auth.isTokenCredential)(credential)) {
      corePipeline.addPolicy(
        (0, import_core_rest_pipeline.bearerTokenAuthenticationPolicy)({
          credential,
          scopes: import_constants.StorageOAuthScopes,
          challengeCallbacks: { authorizeRequestOnChallenge: import_core_client.authorizeRequestOnTenantChallenge }
        }),
        { phase: "Sign" }
      );
    } else if (credential instanceof import_storage_common.StorageSharedKeyCredential) {
      corePipeline.addPolicy(
        (0, import_storage_common.storageSharedKeyCredentialPolicy)({
          accountName: credential.accountName,
          accountKey: credential.accountKey
        }),
        { phase: "Sign" }
      );
    }
    const pipeline = new import_Pipeline.Pipeline([]);
    pipeline._credential = credential;
    pipeline._corePipeline = corePipeline;
    return pipeline;
  }
  appendSubRequestToBody(request) {
    this.body += [
      this.subRequestPrefix,
      // sub request constant prefix
      `${import_constants.HeaderConstants.CONTENT_ID}: ${this.operationCount}`,
      // sub request's content ID
      "",
      // empty line after sub request's content ID
      `${request.method.toString()} ${(0, import_utils_common.getURLPathAndQuery)(
        request.url
      )} ${import_constants.HTTP_VERSION_1_1}${import_constants.HTTP_LINE_ENDING}`
      // sub request start line with method
    ].join(import_constants.HTTP_LINE_ENDING);
    for (const [name, value] of request.headers) {
      this.body += `${name}: ${value}${import_constants.HTTP_LINE_ENDING}`;
    }
    this.body += import_constants.HTTP_LINE_ENDING;
  }
  preAddSubRequest(subRequest) {
    if (this.operationCount >= import_constants.BATCH_MAX_REQUEST) {
      throw new RangeError(`Cannot exceed ${import_constants.BATCH_MAX_REQUEST} sub requests in a single batch`);
    }
    const path = (0, import_utils_common.getURLPath)(subRequest.url);
    if (!path || path === "") {
      throw new RangeError(`Invalid url for sub request: '${subRequest.url}'`);
    }
  }
  postAddSubRequest(subRequest) {
    this.subRequests.set(this.operationCount, subRequest);
    this.operationCount++;
  }
  // Return the http request body with assembling the ending line to the sub request body.
  getHttpRequestBody() {
    return `${this.body}${this.batchRequestEnding}${import_constants.HTTP_LINE_ENDING}`;
  }
  getMultipartContentType() {
    return this.multipartContentType;
  }
  getSubRequests() {
    return this.subRequests;
  }
}
function batchRequestAssemblePolicy(batchRequest) {
  return {
    name: "batchRequestAssemblePolicy",
    async sendRequest(request) {
      batchRequest.appendSubRequestToBody(request);
      return {
        request,
        status: 200,
        headers: (0, import_core_rest_pipeline.createHttpHeaders)()
      };
    }
  };
}
function batchHeaderFilterPolicy() {
  return {
    name: "batchHeaderFilterPolicy",
    async sendRequest(request, next) {
      let xMsHeaderName = "";
      for (const [name] of request.headers) {
        if ((0, import_utils_common.iEqual)(name, import_constants.HeaderConstants.X_MS_VERSION)) {
          xMsHeaderName = name;
        }
      }
      if (xMsHeaderName !== "") {
        request.headers.delete(xMsHeaderName);
      }
      return next(request);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlobBatch
});
//# sourceMappingURL=BlobBatch.js.map
