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
var StructuredMessageEncodingStream_exports = {};
__export(StructuredMessageEncodingStream_exports, {
  structuredMessageEncoding: () => structuredMessageEncoding
});
module.exports = __toCommonJS(StructuredMessageEncodingStream_exports);
var import_abort_controller = require("@azure/abort-controller");
var import_node_stream = __toESM(require("node:stream"));
var import_StructuredMessageEncoding = require("./StructuredMessageEncoding.js");
function isNodeReadableStream(source) {
  return source !== null && source instanceof import_node_stream.default && typeof source._read === "function" && typeof source._readableState === "object" && typeof source.pipe === "function";
}
async function structuredMessageEncoding(source, contentLength) {
  if (source === null) {
    return {
      body: source,
      encodedContentLength: contentLength
    };
  }
  if (isNodeReadableStream(source)) {
    const encodingMessage = new StructuredMessageEncodingStream(source, contentLength, {});
    return {
      body: encodingMessage,
      encodedContentLength: encodingMessage.messageLength()
    };
  }
  if (typeof source === "function") {
    const encodingMessage = new StructuredMessageEncodingStream(
      source(),
      contentLength,
      {}
    );
    return {
      body: encodingMessage,
      encodedContentLength: encodingMessage.messageLength()
    };
  }
  if (source instanceof Blob) {
    const encoding = await BrowserStream(source, contentLength);
    return {
      body: encoding.content,
      encodedContentLength: encoding.encodedContentLength
    };
  }
  if (typeof source === "string") {
    const s = new import_node_stream.Readable();
    s._read = () => {
    };
    s.push(source);
    s.push(null);
    const stringContentLength = Buffer.byteLength(source);
    const encodingMessage = await new StructuredMessageEncodingStream(s, stringContentLength, {});
    return {
      body: encodingMessage,
      encodedContentLength: encodingMessage.messageLength()
    };
  }
  if (source instanceof ArrayBuffer) {
    const stream = import_node_stream.Readable.from(Buffer.from(source));
    const encodingMessage = await new StructuredMessageEncodingStream(stream, contentLength, {});
    return {
      body: encodingMessage,
      encodedContentLength: encodingMessage.messageLength()
    };
  }
  if (source instanceof Buffer) {
    const stream = import_node_stream.Readable.from(source);
    const encodingMessage = await new StructuredMessageEncodingStream(stream, contentLength, {});
    return {
      body: encodingMessage,
      encodedContentLength: encodingMessage.messageLength()
    };
  }
  if (ArrayBuffer.isView(source)) {
    const stream = import_node_stream.Readable.from(Buffer.from(source.buffer, source.byteOffset, source.byteLength));
    const encodingMessage = await new StructuredMessageEncodingStream(stream, contentLength, {});
    return {
      body: encodingMessage,
      encodedContentLength: encodingMessage.messageLength()
    };
  }
  throw new Error("The specified request body type is not supported for CRC64 checksum");
}
async function pump(reader, controller, encodingStream) {
  const { done, value } = await reader.read();
  if (done) {
    controller.close();
    return;
  }
  encodingStream.sourceDataHandler(Buffer.from(value));
}
async function BrowserStream(source, contentLength) {
  const sourceStream = source instanceof Blob ? source.stream() : source;
  const reader = sourceStream.getReader();
  let encodingStream = void 0;
  const stream = new ReadableStream({
    start(controller) {
      encodingStream = new import_StructuredMessageEncoding.StructuredMessageEncoding((data) => {
        controller.enqueue(data);
      }, contentLength);
    },
    pull(controller) {
      pump(reader, controller, encodingStream).then(() => {
        return;
      }).catch(function(error) {
        controller.error(error);
      });
    }
  });
  const response = new Response(stream);
  return {
    content: await response.blob(),
    encodedContentLength: encodingStream.messageLength
  };
}
class StructuredMessageEncodingStream extends import_node_stream.Readable {
  source;
  encodingMethods;
  constructor(source, contentLength, options) {
    super({ highWaterMark: options.highWaterMark });
    this.source = source;
    this.encodingMethods = new import_StructuredMessageEncoding.StructuredMessageEncoding((dataToHandle) => {
      if (!this.push(dataToHandle)) {
        source.pause();
      }
    }, contentLength);
    this.setSourceEventHandlers();
  }
  messageLength() {
    return this.encodingMethods.messageLength;
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
    this.encodingMethods.sourceDataHandler(data);
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
  };
  _read() {
    this.source.resume();
  }
  _destroy(error, callback) {
    this.removeSourceEventHandlers();
    this.source.destroy();
    callback(error === null ? void 0 : error);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  structuredMessageEncoding
});
//# sourceMappingURL=StructuredMessageEncodingStream.js.map
