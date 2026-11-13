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
var PageBlobRangeResponse_exports = {};
__export(PageBlobRangeResponse_exports, {
  rangeResponseFromModel: () => rangeResponseFromModel
});
module.exports = __toCommonJS(PageBlobRangeResponse_exports);
function rangeResponseFromModel(response) {
  const pageRange = (response._response.parsedBody.pageRange || []).map((x) => ({
    offset: x.start,
    count: x.end - x.start
  }));
  const clearRange = (response._response.parsedBody.clearRange || []).map((x) => ({
    offset: x.start,
    count: x.end - x.start
  }));
  return {
    ...response,
    pageRange,
    clearRange,
    _response: {
      ...response._response,
      parsedBody: {
        pageRange,
        clearRange
      }
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  rangeResponseFromModel
});
//# sourceMappingURL=PageBlobRangeResponse.js.map
