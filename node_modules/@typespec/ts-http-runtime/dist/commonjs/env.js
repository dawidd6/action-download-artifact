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
var env_exports = {};
__export(env_exports, {
  emitNodeWarning: () => emitNodeWarning,
  getEnvironmentVariable: () => getEnvironmentVariable,
  isBrowser: () => isBrowser,
  isBun: () => isBun,
  isDeno: () => isDeno,
  isNodeLike: () => isNodeLike,
  isNodeRuntime: () => isNodeRuntime,
  isReactNative: () => isReactNative,
  isWebWorker: () => isWebWorker
});
module.exports = __toCommonJS(env_exports);
var import_node_process = __toESM(require("node:process"));
function getEnvironmentVariable(name) {
  return import_node_process.default.env[name];
}
function emitNodeWarning(warning) {
  import_node_process.default.emitWarning(warning);
}
const isBrowser = false;
const isWebWorker = false;
const isDeno = typeof import_node_process.default.versions.deno === "string" && import_node_process.default.versions.deno.length > 0;
const isBun = typeof import_node_process.default.versions.bun === "string" && import_node_process.default.versions.bun.length > 0;
const isNodeLike = true;
const isNodeRuntime = !isBun && !isDeno;
const isReactNative = false;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  emitNodeWarning,
  getEnvironmentVariable,
  isBrowser,
  isBun,
  isDeno,
  isNodeLike,
  isNodeRuntime,
  isReactNative,
  isWebWorker
});
//# sourceMappingURL=env.js.map
