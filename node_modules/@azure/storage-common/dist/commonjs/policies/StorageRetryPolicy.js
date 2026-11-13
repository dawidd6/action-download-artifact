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
var StorageRetryPolicy_exports = {};
__export(StorageRetryPolicy_exports, {
  NewRetryPolicyFactory: () => NewRetryPolicyFactory,
  StorageRetryPolicy: () => StorageRetryPolicy
});
module.exports = __toCommonJS(StorageRetryPolicy_exports);
var import_abort_controller = require("@azure/abort-controller");
var import_RequestPolicy = require("./RequestPolicy.js");
var import_constants = require("../utils/constants.js");
var import_utils_common = require("../utils/utils.common.js");
var import_log = require("../log.js");
var import_StorageRetryPolicyType = require("./StorageRetryPolicyType.js");
function NewRetryPolicyFactory(retryOptions) {
  return {
    create: (nextPolicy, options) => {
      return new StorageRetryPolicy(nextPolicy, options, retryOptions);
    }
  };
}
const DEFAULT_RETRY_OPTIONS = {
  maxRetryDelayInMs: 120 * 1e3,
  maxTries: 4,
  retryDelayInMs: 4 * 1e3,
  retryPolicyType: import_StorageRetryPolicyType.StorageRetryPolicyType.EXPONENTIAL,
  secondaryHost: "",
  tryTimeoutInMs: void 0
  // Use server side default timeout strategy
};
const RETRY_ABORT_ERROR = new import_abort_controller.AbortError("The operation was aborted.");
class StorageRetryPolicy extends import_RequestPolicy.BaseRequestPolicy {
  /**
   * RetryOptions.
   */
  retryOptions;
  /**
   * Creates an instance of RetryPolicy.
   *
   * @param nextPolicy -
   * @param options -
   * @param retryOptions -
   */
  constructor(nextPolicy, options, retryOptions = DEFAULT_RETRY_OPTIONS) {
    super(nextPolicy, options);
    this.retryOptions = {
      retryPolicyType: retryOptions.retryPolicyType ? retryOptions.retryPolicyType : DEFAULT_RETRY_OPTIONS.retryPolicyType,
      maxTries: retryOptions.maxTries && retryOptions.maxTries >= 1 ? Math.floor(retryOptions.maxTries) : DEFAULT_RETRY_OPTIONS.maxTries,
      tryTimeoutInMs: retryOptions.tryTimeoutInMs && retryOptions.tryTimeoutInMs >= 0 ? retryOptions.tryTimeoutInMs : DEFAULT_RETRY_OPTIONS.tryTimeoutInMs,
      retryDelayInMs: retryOptions.retryDelayInMs && retryOptions.retryDelayInMs >= 0 ? Math.min(
        retryOptions.retryDelayInMs,
        retryOptions.maxRetryDelayInMs ? retryOptions.maxRetryDelayInMs : DEFAULT_RETRY_OPTIONS.maxRetryDelayInMs
      ) : DEFAULT_RETRY_OPTIONS.retryDelayInMs,
      maxRetryDelayInMs: retryOptions.maxRetryDelayInMs && retryOptions.maxRetryDelayInMs >= 0 ? retryOptions.maxRetryDelayInMs : DEFAULT_RETRY_OPTIONS.maxRetryDelayInMs,
      secondaryHost: retryOptions.secondaryHost ? retryOptions.secondaryHost : DEFAULT_RETRY_OPTIONS.secondaryHost
    };
  }
  /**
   * Sends request.
   *
   * @param request -
   */
  async sendRequest(request) {
    return this.attemptSendRequest(request, false, 1);
  }
  /**
   * Decide and perform next retry. Won't mutate request parameter.
   *
   * @param request -
   * @param secondaryHas404 -  If attempt was against the secondary & it returned a StatusNotFound (404), then
   *                                   the resource was not found. This may be due to replication delay. So, in this
   *                                   case, we'll never try the secondary again for this operation.
   * @param attempt -           How many retries has been attempted to performed, starting from 1, which includes
   *                                   the attempt will be performed by this method call.
   */
  async attemptSendRequest(request, secondaryHas404, attempt) {
    const newRequest = request.clone();
    const isPrimaryRetry = secondaryHas404 || !this.retryOptions.secondaryHost || !(request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") || attempt % 2 === 1;
    if (!isPrimaryRetry) {
      newRequest.url = (0, import_utils_common.setURLHost)(newRequest.url, this.retryOptions.secondaryHost);
    }
    if (this.retryOptions.tryTimeoutInMs) {
      newRequest.url = (0, import_utils_common.setURLParameter)(
        newRequest.url,
        import_constants.URLConstants.Parameters.TIMEOUT,
        Math.floor(this.retryOptions.tryTimeoutInMs / 1e3).toString()
      );
    }
    let response;
    try {
      import_log.logger.info(`RetryPolicy: =====> Try=${attempt} ${isPrimaryRetry ? "Primary" : "Secondary"}`);
      response = await this._nextPolicy.sendRequest(newRequest);
      if (!this.shouldRetry(isPrimaryRetry, attempt, response)) {
        return response;
      }
      secondaryHas404 = secondaryHas404 || !isPrimaryRetry && response.status === 404;
    } catch (err) {
      import_log.logger.error(`RetryPolicy: Caught error, message: ${err.message}, code: ${err.code}`);
      if (!this.shouldRetry(isPrimaryRetry, attempt, response, err)) {
        throw err;
      }
    }
    await this.delay(isPrimaryRetry, attempt, request.abortSignal);
    return this.attemptSendRequest(request, secondaryHas404, ++attempt);
  }
  /**
   * Decide whether to retry according to last HTTP response and retry counters.
   *
   * @param isPrimaryRetry -
   * @param attempt -
   * @param response -
   * @param err -
   */
  shouldRetry(isPrimaryRetry, attempt, response, err) {
    if (attempt >= this.retryOptions.maxTries) {
      import_log.logger.info(
        `RetryPolicy: Attempt(s) ${attempt} >= maxTries ${this.retryOptions.maxTries}, no further try.`
      );
      return false;
    }
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
      // For default xhr based http client provided in ms-rest-js
    ];
    if (err) {
      for (const retriableError of retriableErrors) {
        if (err.name.toUpperCase().includes(retriableError) || err.message.toUpperCase().includes(retriableError) || err.code && err.code.toString().toUpperCase() === retriableError) {
          import_log.logger.info(`RetryPolicy: Network error ${retriableError} found, will retry.`);
          return true;
        }
      }
    }
    if (response || err) {
      const statusCode = response ? response.status : err ? err.statusCode : 0;
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
    if (err?.code === "PARSE_ERROR" && err?.message.startsWith(`Error "Error: Unclosed root tag`)) {
      import_log.logger.info(
        "RetryPolicy: Incomplete XML response likely due to service timeout, will retry."
      );
      return true;
    }
    return false;
  }
  /**
   * Delay a calculated time between retries.
   *
   * @param isPrimaryRetry -
   * @param attempt -
   * @param abortSignal -
   */
  async delay(isPrimaryRetry, attempt, abortSignal) {
    let delayTimeInMs = 0;
    if (isPrimaryRetry) {
      switch (this.retryOptions.retryPolicyType) {
        case import_StorageRetryPolicyType.StorageRetryPolicyType.EXPONENTIAL:
          delayTimeInMs = Math.min(
            (Math.pow(2, attempt - 1) - 1) * this.retryOptions.retryDelayInMs,
            this.retryOptions.maxRetryDelayInMs
          );
          break;
        case import_StorageRetryPolicyType.StorageRetryPolicyType.FIXED:
          delayTimeInMs = this.retryOptions.retryDelayInMs;
          break;
      }
    } else {
      delayTimeInMs = Math.random() * 1e3;
    }
    import_log.logger.info(`RetryPolicy: Delay for ${delayTimeInMs}ms`);
    return (0, import_utils_common.delay)(delayTimeInMs, abortSignal, RETRY_ABORT_ERROR);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NewRetryPolicyFactory,
  StorageRetryPolicy
});
//# sourceMappingURL=StorageRetryPolicy.js.map
