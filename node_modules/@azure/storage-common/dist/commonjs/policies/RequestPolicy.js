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
var RequestPolicy_exports = {};
__export(RequestPolicy_exports, {
  BaseRequestPolicy: () => BaseRequestPolicy
});
module.exports = __toCommonJS(RequestPolicy_exports);
class BaseRequestPolicy {
  /**
   * The main method to implement that manipulates a request/response.
   */
  constructor(_nextPolicy, _options) {
    this._nextPolicy = _nextPolicy;
    this._options = _options;
  }
  _nextPolicy;
  _options;
  /**
   * Get whether or not a log with the provided log level should be logged.
   * @param logLevel - The log level of the log that will be logged.
   * @returns Whether or not a log with the provided log level should be logged.
   */
  shouldLog(logLevel) {
    return this._options.shouldLog(logLevel);
  }
  /**
   * Attempt to log the provided message to the provided logger. If no logger was provided or if
   * the log level does not meat the logger's threshold, then nothing will be logged.
   * @param logLevel - The log level of this log.
   * @param message - The message of this log.
   */
  log(logLevel, message) {
    this._options.log(logLevel, message);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseRequestPolicy
});
//# sourceMappingURL=RequestPolicy.js.map
