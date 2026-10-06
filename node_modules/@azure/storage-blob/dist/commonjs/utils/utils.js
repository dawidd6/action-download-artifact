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
var utils_exports = {};
__export(utils_exports, {
  fsCreateReadStream: () => fsCreateReadStream,
  fsStat: () => fsStat,
  readStreamToLocalFile: () => readStreamToLocalFile,
  streamToBuffer: () => streamToBuffer,
  streamToBuffer2: () => streamToBuffer2,
  streamToBuffer3: () => streamToBuffer3
});
module.exports = __toCommonJS(utils_exports);
var import_node_fs = __toESM(require("node:fs"));
var import_node_util = __toESM(require("node:util"));
var import_constants = require("./constants.js");
async function streamToBuffer(stream, buffer, offset, end, encoding) {
  let pos = 0;
  const count = end - offset;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error(`The operation cannot be completed in timeout.`)),
      import_constants.REQUEST_TIMEOUT
    );
    stream.on("readable", () => {
      if (pos >= count) {
        clearTimeout(timeout);
        resolve();
        return;
      }
      let chunk;
      while ((chunk = stream.read()) !== null) {
        if (typeof chunk === "string") {
          chunk = Buffer.from(chunk, encoding);
        }
        const chunkLength = pos + chunk.length > count ? count - pos : chunk.length;
        buffer.fill(chunk.slice(0, chunkLength), offset + pos, offset + pos + chunkLength);
        pos += chunkLength;
        if (pos >= count) {
          clearTimeout(timeout);
          resolve();
          return;
        }
      }
    });
    stream.on("end", () => {
      clearTimeout(timeout);
      if (pos < count) {
        reject(
          new Error(
            `Stream drains before getting enough data needed. Data read: ${pos}, data need: ${count}`
          )
        );
      }
      resolve();
    });
    stream.on("error", (msg) => {
      clearTimeout(timeout);
      reject(msg);
    });
  });
}
async function streamToBuffer2(stream, buffer, encoding) {
  let pos = 0;
  const bufferSize = buffer.length;
  return new Promise((resolve, reject) => {
    stream.on("readable", () => {
      let chunk;
      while ((chunk = stream.read()) !== null) {
        if (typeof chunk === "string") {
          chunk = Buffer.from(chunk, encoding);
        }
        if (pos + chunk.length > bufferSize) {
          reject(new Error(`Stream exceeds buffer size. Buffer size: ${bufferSize}`));
          return;
        }
        buffer.fill(chunk, pos, pos + chunk.length);
        pos += chunk.length;
      }
    });
    stream.on("end", () => {
      resolve(pos);
    });
    stream.on("error", reject);
  });
}
async function streamToBuffer3(readableStream, encoding) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(typeof data === "string" ? Buffer.from(data, encoding) : data);
    });
    readableStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}
async function readStreamToLocalFile(rs, file) {
  return new Promise((resolve, reject) => {
    const ws = import_node_fs.default.createWriteStream(file);
    rs.on("error", (err) => {
      reject(err);
    });
    ws.on("error", (err) => {
      reject(err);
    });
    ws.on("close", resolve);
    rs.pipe(ws);
  });
}
const fsStat = import_node_util.default.promisify(import_node_fs.default.stat);
const fsCreateReadStream = import_node_fs.default.createReadStream;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fsCreateReadStream,
  fsStat,
  readStreamToLocalFile,
  streamToBuffer,
  streamToBuffer2,
  streamToBuffer3
});
//# sourceMappingURL=utils.js.map
