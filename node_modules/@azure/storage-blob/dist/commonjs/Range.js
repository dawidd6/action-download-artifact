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
var Range_exports = {};
__export(Range_exports, {
  rangeToString: () => rangeToString
});
module.exports = __toCommonJS(Range_exports);
function rangeToString(iRange) {
  if (iRange.offset < 0) {
    throw new RangeError(`Range.offset cannot be smaller than 0.`);
  }
  if (iRange.count && iRange.count <= 0) {
    throw new RangeError(
      `Range.count must be larger than 0. Leave it undefined if you want a range from offset to the end.`
    );
  }
  return iRange.count ? `bytes=${iRange.offset}-${iRange.offset + iRange.count - 1}` : `bytes=${iRange.offset}-`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  rangeToString
});
//# sourceMappingURL=Range.js.map
