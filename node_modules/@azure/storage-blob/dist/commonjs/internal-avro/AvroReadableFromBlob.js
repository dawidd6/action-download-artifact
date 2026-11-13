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
var AvroReadableFromBlob_exports = {};
__export(AvroReadableFromBlob_exports, {
  AvroReadableFromBlob: () => AvroReadableFromBlob
});
module.exports = __toCommonJS(AvroReadableFromBlob_exports);
var import_AvroReadable = require("./AvroReadable.js");
var import_abort_controller = require("@azure/abort-controller");
const ABORT_ERROR = new import_abort_controller.AbortError("Reading from the avro blob was aborted.");
class AvroReadableFromBlob extends import_AvroReadable.AvroReadable {
  _position;
  _blob;
  constructor(blob) {
    super();
    this._blob = blob;
    this._position = 0;
  }
  get position() {
    return this._position;
  }
  async read(size, options = {}) {
    size = Math.min(size, this._blob.size - this._position);
    if (size <= 0) {
      return new Uint8Array();
    }
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      function cleanUp() {
        if (options.abortSignal) {
          options.abortSignal.removeEventListener("abort", abortHandler);
        }
      }
      function abortHandler() {
        fileReader.abort();
        cleanUp();
        reject(ABORT_ERROR);
      }
      if (options.abortSignal) {
        options.abortSignal.addEventListener("abort", abortHandler);
      }
      fileReader.onloadend = (ev) => {
        cleanUp();
        resolve(new Uint8Array(ev.target.result));
      };
      fileReader.onerror = () => {
        cleanUp();
        reject();
      };
      fileReader.readAsArrayBuffer(this._blob.slice(this._position, this._position += size));
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AvroReadableFromBlob
});
//# sourceMappingURL=AvroReadableFromBlob.js.map
