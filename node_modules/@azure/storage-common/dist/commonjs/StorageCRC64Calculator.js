var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var StorageCRC64Calculator_exports = {};
__export(StorageCRC64Calculator_exports, {
  StorageCRC64Calculator: () => StorageCRC64Calculator
});
module.exports = __toCommonJS(StorageCRC64Calculator_exports);
var import_crc64 = __toESM(require("./crc64.js"));
class StorageCRC64Calculator {
  nativeCrc64Hash;
  static nativeInstance;
  constructor() {
    this.nativeCrc64Hash = new StorageCRC64Calculator.nativeInstance.Crc64Hash();
  }
  static initPromise;
  /**
   * Initialize environment for CRC64 checksum calculator
   */
  static async init() {
    if (!this.initPromise) {
      this.initPromise = (0, import_crc64.default)().then((instance) => {
        this.nativeInstance = instance;
        return;
      });
    }
    return this.initPromise;
  }
  /**
   * Append data for CRC64 checksum calculator
   * @param body - content to be append
   * @param length - length of the content
   */
  append(body, length) {
    const ptr = StorageCRC64Calculator.nativeInstance._malloc(length);
    StorageCRC64Calculator.nativeInstance.HEAPU8.set(body, ptr);
    this.nativeCrc64Hash.OnAppend(ptr, length);
    StorageCRC64Calculator.nativeInstance._free(ptr);
  }
  /**
   * Complete CRC64 checksum calculating and get the final result.
   * @param body -
   * @param length -
   * @returns
   */
  final(body, length) {
    const ptr = StorageCRC64Calculator.nativeInstance._malloc(length);
    StorageCRC64Calculator.nativeInstance.HEAPU8.set(body, ptr);
    const result = StorageCRC64Calculator.nativeInstance._malloc(8);
    this.nativeCrc64Hash.OnFinal(ptr, length, result);
    StorageCRC64Calculator.nativeInstance._free(ptr);
    const resultArray = new Uint8Array(8);
    resultArray.set(StorageCRC64Calculator.nativeInstance.HEAPU8.subarray(result, result + 8));
    StorageCRC64Calculator.nativeInstance._free(result);
    return resultArray;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StorageCRC64Calculator
});
//# sourceMappingURL=StorageCRC64Calculator.js.map
