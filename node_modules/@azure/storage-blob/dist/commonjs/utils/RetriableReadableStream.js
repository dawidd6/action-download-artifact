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
var RetriableReadableStream_exports = {};
__export(RetriableReadableStream_exports, {
  RetriableReadableStream: () => RetriableReadableStream
});
module.exports = __toCommonJS(RetriableReadableStream_exports);
var import_abort_controller = require("@azure/abort-controller");
var import_node_stream = require("node:stream");
class RetriableReadableStream extends import_node_stream.Readable {
  start;
  offset;
  end;
  getter;
  source;
  retries = 0;
  maxRetryRequests;
  onProgress;
  options;
  /**
   * Creates an instance of RetriableReadableStream.
   *
   * @param source - The current ReadableStream returned from getter
   * @param getter - A method calling downloading request returning
   *                                      a new ReadableStream from specified offset
   * @param offset - Offset position in original data source to read
   * @param count - How much data in original data source to read
   * @param options -
   */
  constructor(source, getter, offset, count, options = {}) {
    super({ highWaterMark: options.highWaterMark });
    this.getter = getter;
    this.source = source;
    this.start = offset;
    this.offset = offset;
    this.end = offset + count - 1;
    this.maxRetryRequests = options.maxRetryRequests && options.maxRetryRequests >= 0 ? options.maxRetryRequests : 0;
    this.onProgress = options.onProgress;
    this.options = options;
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
    if (this.options.doInjectErrorOnce) {
      this.options.doInjectErrorOnce = void 0;
      this.source.pause();
      this.sourceErrorOrEndHandler();
      this.source.destroy();
      return;
    }
    this.offset += data.length;
    if (this.onProgress) {
      this.onProgress({ loadedBytes: this.offset - this.start });
    }
    if (!this.push(data)) {
      this.source.pause();
    }
  };
  sourceAbortedHandler = () => {
    const abortError = new import_abort_controller.AbortError("The operation was aborted.");
    this.destroy(abortError);
  };
  sourceErrorOrEndHandler = (err) => {
    if (err && err.name === "AbortError") {
      this.destroy(err);
      return;
    }
    this.removeSourceEventHandlers();
    if (this.offset - 1 === this.end) {
      this.push(null);
    } else if (this.offset <= this.end) {
      if (this.retries < this.maxRetryRequests) {
        this.retries += 1;
        this.getter(this.offset).then((newSource) => {
          this.source = newSource;
          this.setSourceEventHandlers();
          return;
        }).catch((error) => {
          this.destroy(error);
        });
      } else {
        this.destroy(
          new Error(
            `Data corruption failure: received less data than required and reached maxRetires limitation. Received data offset: ${this.offset - 1}, data needed offset: ${this.end}, retries: ${this.retries}, max retries: ${this.maxRetryRequests}`
          )
        );
      }
    } else {
      this.destroy(
        new Error(
          `Data corruption failure: Received more data than original request, data needed offset is ${this.end}, received offset: ${this.offset - 1}`
        )
      );
    }
  };
  _destroy(error, callback) {
    this.removeSourceEventHandlers();
    this.source.destroy();
    callback(error === null ? void 0 : error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  RetriableReadableStream
});
//# sourceMappingURL=RetriableReadableStream.js.map
