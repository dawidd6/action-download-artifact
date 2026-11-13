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
var BatchResponseParser_exports = {};
__export(BatchResponseParser_exports, {
  BatchResponseParser: () => BatchResponseParser
});
module.exports = __toCommonJS(BatchResponseParser_exports);
var import_core_rest_pipeline = require("@azure/core-rest-pipeline");
var import_core_http_compat = require("@azure/core-http-compat");
var import_constants = require("./utils/constants.js");
var import_BatchUtils = require("./BatchUtils.js");
var import_log = require("./log.js");
const HTTP_HEADER_DELIMITER = ": ";
const SPACE_DELIMITER = " ";
const NOT_FOUND = -1;
class BatchResponseParser {
  batchResponse;
  responseBatchBoundary;
  perResponsePrefix;
  batchResponseEnding;
  subRequests;
  constructor(batchResponse, subRequests) {
    if (!batchResponse || !batchResponse.contentType) {
      throw new RangeError("batchResponse is malformed or doesn't contain valid content-type.");
    }
    if (!subRequests || subRequests.size === 0) {
      throw new RangeError("Invalid state: subRequests is not provided or size is 0.");
    }
    this.batchResponse = batchResponse;
    this.subRequests = subRequests;
    this.responseBatchBoundary = this.batchResponse.contentType.split("=")[1];
    this.perResponsePrefix = `--${this.responseBatchBoundary}${import_constants.HTTP_LINE_ENDING}`;
    this.batchResponseEnding = `--${this.responseBatchBoundary}--`;
  }
  // For example of response, please refer to https://learn.microsoft.com/rest/api/storageservices/blob-batch#response
  async parseBatchResponse() {
    if (this.batchResponse._response.status !== import_constants.HTTPURLConnection.HTTP_ACCEPTED) {
      throw new Error(
        `Invalid state: batch request failed with status: '${this.batchResponse._response.status}'.`
      );
    }
    const responseBodyAsText = await (0, import_BatchUtils.getBodyAsText)(this.batchResponse);
    const subResponses = responseBodyAsText.split(this.batchResponseEnding)[0].split(this.perResponsePrefix).slice(1);
    const subResponseCount = subResponses.length;
    if (subResponseCount !== this.subRequests.size && subResponseCount !== 1) {
      throw new Error("Invalid state: sub responses' count is not equal to sub requests' count.");
    }
    const deserializedSubResponses = new Array(subResponseCount);
    let subResponsesSucceededCount = 0;
    let subResponsesFailedCount = 0;
    for (let index = 0; index < subResponseCount; index++) {
      const subResponse = subResponses[index];
      const deserializedSubResponse = {};
      deserializedSubResponse.headers = (0, import_core_http_compat.toHttpHeadersLike)((0, import_core_rest_pipeline.createHttpHeaders)());
      const responseLines = subResponse.split(`${import_constants.HTTP_LINE_ENDING}`);
      let subRespHeaderStartFound = false;
      let subRespHeaderEndFound = false;
      let subRespFailed = false;
      let contentId = NOT_FOUND;
      for (const responseLine of responseLines) {
        if (!subRespHeaderStartFound) {
          if (responseLine.startsWith(import_constants.HeaderConstants.CONTENT_ID)) {
            contentId = parseInt(responseLine.split(HTTP_HEADER_DELIMITER)[1]);
          }
          if (responseLine.startsWith(import_constants.HTTP_VERSION_1_1)) {
            subRespHeaderStartFound = true;
            const tokens = responseLine.split(SPACE_DELIMITER);
            deserializedSubResponse.status = parseInt(tokens[1]);
            deserializedSubResponse.statusMessage = tokens.slice(2).join(SPACE_DELIMITER);
          }
          continue;
        }
        if (responseLine.trim() === "") {
          if (!subRespHeaderEndFound) {
            subRespHeaderEndFound = true;
          }
          continue;
        }
        if (!subRespHeaderEndFound) {
          if (responseLine.indexOf(HTTP_HEADER_DELIMITER) === -1) {
            throw new Error(
              `Invalid state: find non-empty line '${responseLine}' without HTTP header delimiter '${HTTP_HEADER_DELIMITER}'.`
            );
          }
          const tokens = responseLine.split(HTTP_HEADER_DELIMITER);
          deserializedSubResponse.headers.set(tokens[0], tokens[1]);
          if (tokens[0] === import_constants.HeaderConstants.X_MS_ERROR_CODE) {
            deserializedSubResponse.errorCode = tokens[1];
            subRespFailed = true;
          }
        } else {
          if (!deserializedSubResponse.bodyAsText) {
            deserializedSubResponse.bodyAsText = "";
          }
          deserializedSubResponse.bodyAsText += responseLine;
        }
      }
      if (contentId !== NOT_FOUND && Number.isInteger(contentId) && contentId >= 0 && contentId < this.subRequests.size && deserializedSubResponses[contentId] === void 0) {
        deserializedSubResponse._request = this.subRequests.get(contentId);
        deserializedSubResponses[contentId] = deserializedSubResponse;
      } else {
        import_log.logger.error(
          `subResponses[${index}] is dropped as the Content-ID is not found or invalid, Content-ID: ${contentId}`
        );
      }
      if (subRespFailed) {
        subResponsesFailedCount++;
      } else {
        subResponsesSucceededCount++;
      }
    }
    return {
      subResponses: deserializedSubResponses,
      subResponsesSucceededCount,
      subResponsesFailedCount
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BatchResponseParser
});
//# sourceMappingURL=BatchResponseParser.js.map
