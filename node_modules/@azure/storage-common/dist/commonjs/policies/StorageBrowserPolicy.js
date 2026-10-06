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
var StorageBrowserPolicy_exports = {};
__export(StorageBrowserPolicy_exports, {
  StorageBrowserPolicy: () => StorageBrowserPolicy
});
module.exports = __toCommonJS(StorageBrowserPolicy_exports);
var import_RequestPolicy = require("./RequestPolicy.js");
class StorageBrowserPolicy extends import_RequestPolicy.BaseRequestPolicy {
  /**
   * Creates an instance of StorageBrowserPolicy.
   * @param nextPolicy -
   * @param options -
   */
  // The base class has a protected constructor. Adding a public one to enable constructing of this class.
  /* eslint-disable-next-line @typescript-eslint/no-useless-constructor*/
  constructor(nextPolicy, options) {
    super(nextPolicy, options);
  }
  /**
   * Sends out request.
   *
   * @param request -
   */
  async sendRequest(request) {
    return this._nextPolicy.sendRequest(request);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  StorageBrowserPolicy
});
//# sourceMappingURL=StorageBrowserPolicy.js.map
