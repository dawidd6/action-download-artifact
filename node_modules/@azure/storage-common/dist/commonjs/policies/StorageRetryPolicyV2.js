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
var StorageRetryPolicyV2_exports = {};
__export(StorageRetryPolicyV2_exports, {
  storageRetryPolicy: () => storageRetryPolicy,
  storageRetryPolicyName: () => storageRetryPolicyName
});
module.exports = __toCommonJS(StorageRetryPolicyV2_exports);
var import_abort_controller = require("@azure/abort-controller");
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_core_util = require("@azure/core-util");
var import_StorageRetryPolicyFactory = require("../StorageRetryPolicyFactory.js");
var import_constants = require("../utils/constants.js");
var import_utils_common = require("../utils/utils.common.js");
var import_log = require("../log.js");
const storageRetryPolicyName = "storageRetryPolicy";
const DEFAULT_RETRY_OPTIONS = {
  maxRetryDelayInMs: 120 * 1e3,
  maxTries: 4,
  retryDelayInMs: 4 * 1e3,
  retryPolicyType: import_StorageRetryPolicyFactory.StorageRetryPolicyType.EXPONENTIAL,
  secondaryHost: "",
  tryTimeoutInMs: void 0
  // Use server side default timeout strategy
};
const retriableErrors = [
  "ETIMEDOUT",
  "ESOCKETTIMEDOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOENT",
  "ENOTFOUND",
  "TIMEOUT",
  "EPIPE",
  "REQUEST_SEND_ERROR"
];
const RETRY_ABORT_ERROR = new import_abort_controller.AbortError("The operation was aborted.");
function storageRetryPolicy(options = {}) {
  const retryPolicyType = options.retryPolicyType ?? DEFAULT_RETRY_OPTIONS.retryPolicyType;
  const maxTries = options.maxTries ?? DEFAULT_RETRY_OPTIONS.maxTries;
  const retryDelayInMs = options.retryDelayInMs ?? DEFAULT_RETRY_OPTIONS.retryDelayInMs;
  const maxRetryDelayInMs = options.maxRetryDelayInMs ?? DEFAULT_RETRY_OPTIONS.maxRetryDelayInMs;
  const secondaryHost = options.secondaryHost ?? DEFAULT_RETRY_OPTIONS.secondaryHost;
  const tryTimeoutInMs = options.tryTimeoutInMs ?? DEFAULT_RETRY_OPTIONS.tryTimeoutInMs;
  function shouldRetry({
    isPrimaryRetry,
    attempt,
    response,
    error
  }) {
    if (attempt >= maxTries) {
      import_log.logger.info(`RetryPolicy: Attempt(s) ${attempt} >= maxTries ${maxTries}, no further try.`);
      return false;
    }
    if (error) {
      for (const retriableError of retriableErrors) {
        if (error.name.toUpperCase().includes(retriableError) || error.message.toUpperCase().includes(retriableError) || error.code && error.code.toString().toUpperCase() === retriableError) {
          import_log.logger.info(`RetryPolicy: Network error ${retriableError} found, will retry.`);
          return true;
        }
      }
      if (error?.code === "PARSE_ERROR" && error?.message.startsWith(`Error "Error: Unclosed root tag`)) {
        import_log.logger.info(
          "RetryPolicy: Incomplete XML response likely due to service timeout, will retry."
        );
        return true;
      }
    }
    if (response || error) {
      const statusCode = response?.status ?? error?.statusCode ?? 0;
      if (!isPrimaryRetry && statusCode === 404) {
        import_log.logger.info(`RetryPolicy: Secondary access with 404, will retry.`);
        return true;
      }
      if (statusCode === 503 || statusCode === 500) {
        import_log.logger.info(`RetryPolicy: Will retry for status code ${statusCode}.`);
        return true;
      }
    }
    if (response) {
      if (response?.status >= 400) {
        const copySourceError = response.headers.get(import_constants.HeaderConstants.X_MS_CopySourceErrorCode);
        if (copySourceError !== void 0) {
          switch (copySourceError) {
            case "InternalError":
            case "OperationTimedOut":
            case "ServerBusy":
              return true;
          }
        }
      }
    }
    return false;
  }
  function calculateDelay(isPrimaryRetry, attempt) {
    let delayTimeInMs = 0;
    if (isPrimaryRetry) {
      switch (retryPolicyType) {
        case import_StorageRetryPolicyFactory.StorageRetryPolicyType.EXPONENTIAL:
          delayTimeInMs = Math.min(
            (Math.pow(2, attempt - 1) - 1) * retryDelayInMs,
            maxRetryDelayInMs
          );
          break;
        case import_StorageRetryPolicyFactory.StorageRetryPolicyType.FIXED:
          delayTimeInMs = retryDelayInMs;
          break;
      }
    } else {
      delayTimeInMs = Math.random() * 1e3;
    }
    import_log.logger.info(`RetryPolicy: Delay for ${delayTimeInMs}ms`);
    return delayTimeInMs;
  }
  return {
    name: storageRetryPolicyName,
    async sendRequest(request, next) {
      if (tryTimeoutInMs) {
        request.url = (0, import_utils_common.setURLParameter)(
          request.url,
          import_constants.URLConstants.Parameters.TIMEOUT,
          String(Math.floor(tryTimeoutInMs / 1e3))
        );
      }
      const primaryUrl = request.url;
      const secondaryUrl = secondaryHost ? (0, import_utils_common.setURLHost)(request.url, secondaryHost) : void 0;
      let secondaryHas404 = false;
      let attempt = 1;
      let retryAgain = true;
      let response;
      let error;
      while (retryAgain) {
        const isPrimaryRetry = secondaryHas404 || !secondaryUrl || !["GET", "HEAD", "OPTIONS"].includes(request.method) || attempt % 2 === 1;
        request.url = isPrimaryRetry ? primaryUrl : secondaryUrl;
        response = void 0;
        error = void 0;
        try {
          import_log.logger.info(
            `RetryPolicy: =====> Try=${attempt} ${isPrimaryRetry ? "Primary" : "Secondary"}`
          );
          response = await next(request);
          secondaryHas404 = secondaryHas404 || !isPrimaryRetry && response.status === 404;
        } catch (e) {
          if ((0, import_core_rest_pipeline.isRestError)(e)) {
            import_log.logger.error(`RetryPolicy: Caught error, message: ${e.message}, code: ${e.code}`);
            error = e;
          } else {
            import_log.logger.error(`RetryPolicy: Caught error, message: ${(0, import_core_util.getErrorMessage)(e)}`);
            throw e;
          }
        }
        retryAgain = shouldRetry({ isPrimaryRetry, attempt, response, error });
        if (retryAgain) {
          await (0, import_utils_common.delay)(
            calculateDelay(isPrimaryRetry, attempt),
            request.abortSignal,
            RETRY_ABORT_ERROR
          );
        }
        attempt++;
      }
      if (response) {
        return response;
      }
      throw error ?? new import_core_rest_pipeline.RestError("RetryPolicy failed without known error.");
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  storageRetryPolicy,
  storageRetryPolicyName
});
//# sourceMappingURL=StorageRetryPolicyV2.js.map
