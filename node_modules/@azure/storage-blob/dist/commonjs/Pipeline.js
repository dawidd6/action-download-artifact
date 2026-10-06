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
var Pipeline_exports = {};
__export(Pipeline_exports, {
  Pipeline: () => Pipeline,
  StorageOAuthScopes: () => import_constants.StorageOAuthScopes,
  getCoreClientOptions: () => getCoreClientOptions,
  getCredentialFromPipeline: () => getCredentialFromPipeline,
  isPipelineLike: () => isPipelineLike,
  newPipeline: () => newPipeline
});
module.exports = __toCommonJS(Pipeline_exports);
var import_core_http_compat = require("@azure/core-http-compat");
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_core_client = require("@azure/core-client");
var import_core_xml = require("@azure/core-xml");
var import_core_auth = require("@azure/core-auth");
var import_log = require("./log.js");
var import_storage_common = require("@azure/storage-common");
var import_constants = require("./utils/constants.js");
function isPipelineLike(pipeline) {
  if (!pipeline || typeof pipeline !== "object") {
    return false;
  }
  const castPipeline = pipeline;
  return Array.isArray(castPipeline.factories) && typeof castPipeline.options === "object" && typeof castPipeline.toServiceClientOptions === "function";
}
class Pipeline {
  /**
   * A list of chained request policy factories.
   */
  factories;
  /**
   * Configures pipeline logger and HTTP client.
   */
  options;
  /**
   * Creates an instance of Pipeline. Customize HTTPClient by implementing IHttpClient interface.
   *
   * @param factories -
   * @param options -
   */
  constructor(factories, options = {}) {
    this.factories = factories;
    this.options = options;
  }
  /**
   * Transfer Pipeline object to ServiceClientOptions object which is required by
   * ServiceClient constructor.
   *
   * @returns The ServiceClientOptions object from this Pipeline.
   */
  toServiceClientOptions() {
    return {
      httpClient: this.options.httpClient,
      requestPolicyFactories: this.factories
    };
  }
}
function newPipeline(credential, pipelineOptions = {}) {
  if (!credential) {
    credential = new import_storage_common.AnonymousCredential();
  }
  const pipeline = new Pipeline([], pipelineOptions);
  pipeline._credential = credential;
  return pipeline;
}
function processDownlevelPipeline(pipeline) {
  const knownFactoryFunctions = [
    isAnonymousCredential,
    isStorageSharedKeyCredential,
    isCoreHttpBearerTokenFactory,
    isStorageBrowserPolicyFactory,
    isStorageRetryPolicyFactory,
    isStorageTelemetryPolicyFactory,
    isCoreHttpPolicyFactory
  ];
  if (pipeline.factories.length) {
    const novelFactories = pipeline.factories.filter((factory) => {
      return !knownFactoryFunctions.some((knownFactory) => knownFactory(factory));
    });
    if (novelFactories.length) {
      const hasInjector = novelFactories.some((factory) => isInjectorPolicyFactory(factory));
      return {
        wrappedPolicies: (0, import_core_http_compat.createRequestPolicyFactoryPolicy)(novelFactories),
        afterRetry: hasInjector
      };
    }
  }
  return void 0;
}
function getCoreClientOptions(pipeline) {
  const { httpClient: v1Client, ...restOptions } = pipeline.options;
  let httpClient = pipeline._coreHttpClient;
  if (!httpClient) {
    httpClient = v1Client ? (0, import_core_http_compat.convertHttpClient)(v1Client) : (0, import_storage_common.getCachedDefaultHttpClient)();
    pipeline._coreHttpClient = httpClient;
  }
  let corePipeline = pipeline._corePipeline;
  if (!corePipeline) {
    const packageDetails = `azsdk-js-azure-storage-blob/${import_constants.SDK_VERSION}`;
    const userAgentPrefix = restOptions.userAgentOptions && restOptions.userAgentOptions.userAgentPrefix ? `${restOptions.userAgentOptions.userAgentPrefix} ${packageDetails}` : `${packageDetails}`;
    corePipeline = (0, import_core_client.createClientPipeline)({
      ...restOptions,
      loggingOptions: {
        additionalAllowedHeaderNames: import_constants.StorageBlobLoggingAllowedHeaderNames,
        additionalAllowedQueryParameters: import_constants.StorageBlobLoggingAllowedQueryParameters,
        logger: import_log.logger.info
      },
      userAgentOptions: {
        userAgentPrefix
      },
      serializationOptions: {
        stringifyXML: import_core_xml.stringifyXML,
        serializerOptions: {
          xml: {
            // Use customized XML char key of "#" so we can deserialize metadata
            // with "_" key
            xmlCharKey: "#"
          }
        }
      },
      deserializationOptions: {
        parseXML: import_core_xml.parseXML,
        serializerOptions: {
          xml: {
            // Use customized XML char key of "#" so we can deserialize metadata
            // with "_" key
            xmlCharKey: "#"
          }
        }
      }
    });
    corePipeline.removePolicy({ phase: "Retry" });
    corePipeline.removePolicy({ name: import_core_rest_pipeline.decompressResponsePolicyName });
    corePipeline.addPolicy((0, import_storage_common.storageCorrectContentLengthPolicy)());
    corePipeline.addPolicy((0, import_storage_common.storageRetryPolicy)(restOptions.retryOptions), { phase: "Retry" });
    corePipeline.addPolicy((0, import_storage_common.storageRequestFailureDetailsParserPolicy)());
    corePipeline.addPolicy((0, import_storage_common.storageBrowserPolicy)());
    const downlevelResults = processDownlevelPipeline(pipeline);
    if (downlevelResults) {
      corePipeline.addPolicy(
        downlevelResults.wrappedPolicies,
        downlevelResults.afterRetry ? { afterPhase: "Retry" } : void 0
      );
    }
    const credential = getCredentialFromPipeline(pipeline);
    if ((0, import_core_auth.isTokenCredential)(credential)) {
      corePipeline.addPolicy(
        (0, import_core_rest_pipeline.bearerTokenAuthenticationPolicy)({
          credential,
          scopes: restOptions.audience ?? import_constants.StorageOAuthScopes,
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
    pipeline._corePipeline = corePipeline;
  }
  return {
    ...restOptions,
    allowInsecureConnection: true,
    httpClient,
    pipeline: corePipeline
  };
}
function getCredentialFromPipeline(pipeline) {
  if (pipeline._credential) {
    return pipeline._credential;
  }
  let credential = new import_storage_common.AnonymousCredential();
  for (const factory of pipeline.factories) {
    if ((0, import_core_auth.isTokenCredential)(factory.credential)) {
      credential = factory.credential;
    } else if (isStorageSharedKeyCredential(factory)) {
      return factory;
    }
  }
  return credential;
}
function isStorageSharedKeyCredential(factory) {
  if (factory instanceof import_storage_common.StorageSharedKeyCredential) {
    return true;
  }
  return factory.constructor.name === "StorageSharedKeyCredential";
}
function isAnonymousCredential(factory) {
  if (factory instanceof import_storage_common.AnonymousCredential) {
    return true;
  }
  return factory.constructor.name === "AnonymousCredential";
}
function isCoreHttpBearerTokenFactory(factory) {
  return (0, import_core_auth.isTokenCredential)(factory.credential);
}
function isStorageBrowserPolicyFactory(factory) {
  if (factory instanceof import_storage_common.StorageBrowserPolicyFactory) {
    return true;
  }
  return factory.constructor.name === "StorageBrowserPolicyFactory";
}
function isStorageRetryPolicyFactory(factory) {
  if (factory instanceof import_storage_common.StorageRetryPolicyFactory) {
    return true;
  }
  return factory.constructor.name === "StorageRetryPolicyFactory";
}
function isStorageTelemetryPolicyFactory(factory) {
  return factory.constructor.name === "TelemetryPolicyFactory";
}
function isInjectorPolicyFactory(factory) {
  return factory.constructor.name === "InjectorPolicyFactory";
}
function isCoreHttpPolicyFactory(factory) {
  const knownPolicies = [
    "GenerateClientRequestIdPolicy",
    "TracingPolicy",
    "LogPolicy",
    "ProxyPolicy",
    "DisableResponseDecompressionPolicy",
    "KeepAlivePolicy",
    "DeserializationPolicy"
  ];
  const mockHttpClient = {
    sendRequest: async (request) => {
      return {
        request,
        headers: request.headers.clone(),
        status: 500
      };
    }
  };
  const mockRequestPolicyOptions = {
    log(_logLevel, _message) {
    },
    shouldLog(_logLevel) {
      return false;
    }
  };
  const policyInstance = factory.create(mockHttpClient, mockRequestPolicyOptions);
  const policyName = policyInstance.constructor.name;
  return knownPolicies.some((knownPolicyName) => {
    return policyName.startsWith(knownPolicyName);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Pipeline,
  StorageOAuthScopes,
  getCoreClientOptions,
  getCredentialFromPipeline,
  isPipelineLike,
  newPipeline
});
//# sourceMappingURL=Pipeline.js.map
