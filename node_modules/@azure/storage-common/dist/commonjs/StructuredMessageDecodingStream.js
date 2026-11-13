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
var StructuredMessageDecodingStream_exports = {};
__export(StructuredMessageDecodingStream_exports, {
  structuredMessageDecodingBrowser: () => structuredMessageDecodingBrowser,
  structuredMessageDecodingStream: () => structuredMessageDecodingStream
});
module.exports = __toCommonJS(StructuredMessageDecodingStream_exports);
var import_abort_controller = require("@azure/abort-controller");
var import_node_stream = require("node:stream");
var import_StructuredMessageDecoding = require("./StructuredMessageDecoding.js");
async function structuredMessageDecodingBrowser(source) {
  source;
  throw new Error("structuredMessageDecodingBrowser is only for Browser");
}
function structuredMessageDecodingStream(source, options) {
  return new StructuredMessageDecodingStream(source, options);
}
class StructuredMessageDecodingStream extends import_node_stream.Readable {
  source;
  decodingMethods;
  constructor(source, options) {
    super({ highWaterMark: options.highWaterMark });
    this.source = source;
    this.decodingMethods = new import_StructuredMessageDecoding.StructuredMessageDecoding((dataToHandle) => {
      if (!this.push(dataToHandle)) {
        source.pause();
      }
    });
    this.setSourceEventHandlers();
  }
  _read() {
    this.source.resume();
  }
  setSourceEventHandlers() {
    this.source.on("data", this.sourceDataHandler);
    this.source.on("end", this.sourceErrorOrEndHandler);
    this.source.on("error", this.sourceErrorOrEndHandler);
    this.source.on("aborted", this.sourceAbortedHandler);
  }
  removeSourceEventHandlers() {
    this.source.removeListener("data", this.sourceDataHandler);
    this.source.removeListener("end", this.sourceErrorOrEndHandler);
    this.source.removeListener("error", this.sourceErrorOrEndHandler);
    this.source.removeListener("aborted", this.sourceAbortedHandler);
  }
  sourceDataHandler = (data) => {
    try {
      this.decodingMethods.sourceDataHandler(data);
    } catch (err) {
      this.destroy(err);
    }
  };
  sourceAbortedHandler = () => {
    const abortError = new import_abort_controller.AbortError("The operation was aborted.");
    this.destroy(abortError);
  };
  sourceErrorOrEndHandler = (err) => {
    if (err) {
      this.destroy(err);
      return;
    }
    this.removeSourceEventHandlers();
  };
  _destroy(error, callback) {
    this.removeSourceEventHandlers();
    this.source.destroy();
    callback(error === null ? void 0 : error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  structuredMessageDecodingBrowser,
  structuredMessageDecodingStream
});
//# sourceMappingURL=StructuredMessageDecodingStream.js.map
